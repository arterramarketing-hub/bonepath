/* THE OLD LIGHT. BONEPATH was drawn against three.js r128, and its look is
   made of things r128 did that the library has since stopped doing. This
   file puts each of them back on top of r187, by the library's own public
   tables (ShaderChunk, ShaderLib, a material's prototype) where that is
   enough; the few places where it is not are source patches, listed in
   build.js (PATCHES). It is bundled into the same one line as the library,
   so `THREE` arrives in the page already behaving as the game expects.
   Every replacement below is CHECKED: if a later revision of three words a
   chunk differently, the bundle throws as it loads rather than drawing a
   subtly different picture. The story of each is in docs/NOTES.md.

   1. NO COLOUR MANAGEMENT. A hex is the number it says (r128 had none).
      Colours given as seen go through convertSRGBToLinear by hand, as ever.
   2. LAMBERT IS LIT AT THE VERTEX (Gouraud), as it was until r144: the
      lights are summed in the vertex shader into vLightFront/vIndirectFront
      and the fragment only multiplies. A pool of point lights is cheap for
      exactly this reason, and the world's coarse faces (WSEG) are cut for
      it. `flatShading` was not a property of r128's Lambert and is not one
      here: the light follows the geometry's own normals.
   3. THE OLD UNITS. An intensity is a multiplier, not candela: irradiance
      carries the factor of pi that BRDF_Lambert divides out, and a point
      light falls off as (1 - d/distance)^decay, reaching zero AT distance.
   4. A SINGLE PASS for see-through two-sided faces (r128 drew them once).
   5. ALPHA AS WRITTEN: an opaque material writes its own alpha, not 1.
   6. sRGB maps are decoded in the shader, AFTER filtering, and a render
      target whose texture is marked sRGB is written sRGB by the shader
      (see PATCHES in build.js: no texture is ever stored SRGB8_ALPHA8).
   7. NO NEW PROGRAMS: r187 would compile a second shader for a see-through
      material, for a geometry without normals, and for a "flat" Lambert,
      none of which is a different shader here (PATCHES again).
   8. NO UNIFORMS FOR MAPS THE GAME NEVER SETS. r187 gives every map its
      own uv transform, and the renderer clones a material's whole uniform
      table when it first draws it: nine Matrix3s more per Lambert or Phong
      than r128 (bump, normal, displacement, ao, light, emissive, specular,
      alpha, and the env map's rotation), for maps the game has none of.
      They are taken out of the tables, and those maps cannot be set on the
      five materials the game uses: a setter throws, rather than the
      renderer reading a uniform that is not there. `map` keeps its own.
   NOT carried: shadow maps and environment maps on a Lambert (the game
   has neither), and the old units on any lit material but Lambert and
   Phong. */
import { ColorManagement } from 'three/src/math/ColorManagement.js';
import { ShaderChunk } from 'three/src/renderers/shaders/ShaderChunk.js';
import { ShaderLib } from 'three/src/renderers/shaders/ShaderLib.js';
import { Material } from 'three/src/materials/Material.js';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial.js';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import { PointsMaterial } from 'three/src/materials/PointsMaterial.js';
import { SpriteMaterial } from 'three/src/materials/SpriteMaterial.js';

ColorManagement.enabled = false;

function patch( name, find, put ) {

	const was = ShaderChunk[ name ];
	if ( typeof was !== 'string' ) throw new Error( 'THE OLD LIGHT: three has no chunk "' + name + '"' );
	const now = was.replace( find, put );
	if ( now === was ) throw new Error( 'THE OLD LIGHT: nothing in "' + name + '" matched ' + find );
	ShaderChunk[ name ] = now;

}

// 3. the old units
patch( 'lights_pars_begin', 'vec3 irradiance = ambientLightColor;', 'vec3 irradiance = ambientLightColor;\n\tirradiance *= PI;' );
patch( 'lights_pars_begin', 'vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );',
	'vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\tirradiance *= PI;' );
patch( 'lights_pars_begin', /float getDistanceAttenuation\([^)]*\) \{[\s\S]*?return distanceFalloff;\s*\}/,
	/* glsl */`float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
		return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
	}
	return 1.0;
}` );
patch( 'lights_phong_pars_fragment', 'vec3 irradiance = dotNL * directLight.color;', 'vec3 irradiance = dotNL * directLight.color;\n\tirradiance *= PI;' );

// ...and the old highlight: the same Blinn-Phong, in r128's own arithmetic (L.H where r187 takes V.H: equal on paper, a unit apart in a float)
patch( 'bsdfs', /float dotVH = saturate\( dot\( viewDir, halfDir \) \);\s*vec3 F = F_Schlick\( specularColor, 1\.0, dotVH \);/,
	'float dotLH = saturate( dot( lightDir, halfDir ) );\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\tvec3 F = ( 1.0 - specularColor ) * fresnel + specularColor;' );

// 5. alpha as written
ShaderChunk.opaque_fragment = 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );';

// 6. a point sprite's map is decoded like any other (r187 decodes in map_fragment only)
patch( 'map_particle_fragment', 'diffuseColor *= texture2D( map, uv );',
	'vec4 sampledDiffuseColor = texture2D( map, uv );\n\t#ifdef DECODE_VIDEO_TEXTURE\n\t\tsampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );\n\t#endif\n\tdiffuseColor *= sampledDiffuseColor;' );

// 2. Lambert at the vertex. `lights_lambert_vertex` is a chunk again, so a material can rewrite a line of it (the game's skyTwin does).
ShaderChunk.lights_lambert_vertex = /* glsl */`
vec3 geometryPosition = mvPosition.xyz;
vec3 geometryNormal = normalize( transformedNormal );
vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
	vLightBack = vec3( 0.0 );
	vIndirectBack = vec3( 0.0 );
#endif
IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;
vIndirectFront += getAmbientLightIrradiance( ambientLightColor );
#ifdef DOUBLE_SIDED
	vIndirectBack += getAmbientLightIrradiance( ambientLightColor );
#endif
#if defined( USE_LIGHT_PROBES )
	vIndirectFront += getLightProbeIrradiance( lightProbe, geometryNormal );
	#ifdef DOUBLE_SIDED
		vIndirectBack += getLightProbeIrradiance( lightProbe, - geometryNormal );
	#endif
#endif
#if NUM_POINT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		getPointLightInfo( pointLights[ i ], geometryPosition, directLight );
		dotNL = dot( geometryNormal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_SPOT_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		getSpotLightInfo( spotLights[ i ], geometryPosition, directLight );
		dotNL = dot( geometryNormal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_DIR_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		getDirectionalLightInfo( directionalLights[ i ], directLight );
		dotNL = dot( geometryNormal, directLight.direction );
		directLightColor_Diffuse = PI * directLight.color;
		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
		#ifdef DOUBLE_SIDED
			vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;
		#endif
	}
	#pragma unroll_loop_end
#endif
#if NUM_HEMI_LIGHTS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
		vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		#ifdef DOUBLE_SIDED
			vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], - geometryNormal );
		#endif
	}
	#pragma unroll_loop_end
#endif
`;

ShaderChunk.meshlambert_vert = ShaderLib.lambert.vertexShader = /* glsl */`
#define LAMBERT
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <bsdfs>
#include <lights_pars_begin>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <lights_lambert_vertex>
	#include <fog_vertex>
}
`;

ShaderChunk.meshlambert_frag = ShaderLib.lambert.fragmentShader = /* glsl */`
#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
varying vec3 vIndirectFront;
#ifdef DOUBLE_SIDED
	varying vec3 vLightBack;
	varying vec3 vIndirectBack;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <emissivemap_fragment>
	#ifdef DOUBLE_SIDED
		reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;
	#else
		reflectedLight.indirectDiffuse += vIndirectFront;
	#endif
	reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );
	#ifdef DOUBLE_SIDED
		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
	#else
		reflectedLight.directDiffuse = vLightFront;
	#endif
	reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb );
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`;

// `flatShading` on a Lambert: accepted, and without effect (r128 warned that it was not a property and dropped it)
Object.defineProperty( MeshLambertMaterial.prototype, 'flatShading', { get() { return false; }, set() {}, configurable: true } );

// 4. a single pass, whatever the material
Object.defineProperty( Material.prototype, 'forceSinglePass', { get() { return true; }, set() {}, configurable: true } );

// 8. no uniforms for maps the game never sets (each one cloned into every material's table is a Matrix3 or a texture slot)
const NO_MAPS = [ 'alphaMap', 'specularMap', 'envMap', 'aoMap', 'lightMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap' ];
const NO_UNIFORMS = [ 'flipEnvMap', 'envMapRotation', 'reflectivity', 'ior', 'refractionRatio', 'dfgLUT', 'aoMapIntensity', 'lightMapIntensity',
	'bumpScale', 'normalScale', 'displacementScale', 'displacementBias' ];
for ( const id of [ 'basic', 'lambert', 'phong', 'points', 'sprite' ] ) {

	const u = ShaderLib[ id ].uniforms;
	if ( ! u || ! u.diffuse || ! u.map ) throw new Error( 'THE OLD LIGHT: ShaderLib.' + id + ' has no diffuse or map uniform' );
	for ( const m of NO_MAPS ) { delete u[ m ]; delete u[ m + 'Transform' ]; }
	for ( const k of NO_UNIFORMS ) delete u[ k ];

}
for ( const M of [ MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, PointsMaterial, SpriteMaterial ] ) {

	for ( const m of NO_MAPS ) Object.defineProperty( M.prototype, m, { get() { return null; },
		set( v ) { if ( v ) throw new Error( 'THE OLD LIGHT: ' + m + ' has no uniforms here (legacy.js, 8)' ); }, configurable: true } );

}
