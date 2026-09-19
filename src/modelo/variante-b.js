// Haemophilus influenzae — modelo anatomico, VARIANTE B (shaders proprios).
// Ilustracao cientifica para seminario de microbiologia medica.
// Contrato: docs/CONTRATO-MODELO.md. O modulo nao cria renderer, camera, luzes nem loop.
//
// Como funciona:
//  - todas as cascas sao capsulas exatas (SDF conhecido); relevo, corte, vista explodida,
//    septo e a leve irregularidade organica sao feitos em GLSL, com as MESMAS funcoes em todos os materiais;
//  - o corte e um discard dos fragmentos dentro de uma cunha angular (uniform uCorte, compartilhado);
//  - as faces da secao sao geometria de tampa: tres planos por camada, pintados por SDF
//    (faixas exatas de cada camada, bicamada nas membranas, rede no peptidoglicano);
//  - materiais opacos = MeshStandardMaterial + onBeforeCompile (mantem luz e ambiente da cena).
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/* ------------------------------------------------------------------ medidas */
const H = 0.58            // metade do trecho cilindrico
const R_CAP = 0.625       // capsula (face externa)
const R_ME = 0.52         // membrana externa (face externa)  -> corpo: 2*(H+R_ME) = 2,2 ; largura 1,04 ; razao 2,1:1
const T_ME = 0.030
const R_PG = 0.468        // peptidoglicano (superficie media), espessura 0,010
const T_PG = 0.010
const R_MI = 0.425        // membrana interna (face externa)
const T_MI = 0.028
const R_CIT = R_MI - T_MI // citoplasma
const ANGC = 0.70         // centro da cunha (rad, medido de +Z para +X)
const MEIA = 0.8727       // meia abertura = 50 graus -> corte de ~100 graus
const YC = -0.42          // a cunha so existe acima deste y (face transversal da secao)

// afastamento de cada familia de camadas na vista explodida (radial, axial)
const EXPLODE = {
  capsula: [0.34, 0.66],
  me: [0.215, 0.42],
  pg: [0.115, 0.20],
  mi: [0.035, 0.0],
  nucleo: [0.0, 0.0],
}

export const CORES = {
  capsula: '#eadfc8', membranaExterna: '#1fb8a6', los: '#ff7a45', porinas: '#4c8dff',
  adesinas: '#d4e157', pili: '#f5e6a3', peptidoglicano: '#58c17a', betaLactamase: '#ff5a3c',
  membranaInterna: '#f2b441', pbp3: '#e0247b', citoplasma: '#3a2f8f', ribossomos: '#9a8cff',
  nucleoide: '#c86bfa', plasmideo: '#22e8e0', septo: '#a9d98a', secrecao: '#ff4d5a',
}

/* ------------------------------------------------------------------ GLSL comum */
const GLSL_CONST = /* glsl */`
#define ANGC ${ANGC.toFixed(4)}
#define MEIA ${MEIA.toFixed(4)}
#define YC ${YC.toFixed(4)}
#define HCIL ${H.toFixed(4)}
uniform float uCorte;
uniform float uDivisao;
uniform float uTempo;
uniform float uEnergia;
`

// deformacoes compartilhadas (vertex): septo de divisao + irregularidade organica
const GLSL_DEFORMA = /* glsl */`
float escSepto(float y){ return 1.0 - uDivisao * 0.42 * exp(-y * y / 0.05); }
vec3 warp(vec3 p){
  vec3 q = p;
  q.xz *= 1.0 + 0.05 * p.y;
  q.x += 0.04 * (p.y * p.y - 0.35);
  q += 0.02 * vec3(sin(p.y * 2.3 + 1.1) * cos(p.z * 1.9 + 0.4),
                   0.6 * sin(p.x * 2.7 + 2.0),
                   cos(p.y * 2.9 + 0.3) * sin(p.x * 2.1 + 1.7));
  return q;
}
vec3 deforma(vec3 p){ p.xz *= escSepto(p.y); return warp(p); }
vec3 deformaNuc(vec3 p){
  p.xz *= 1.0 - uDivisao * 0.9 * exp(-p.y * p.y / 0.03);
  p.y += sign(p.y) * uDivisao * 0.05 * exp(-p.y * p.y / 0.08);
  return warp(p);
}
`

const GLSL_CUNHA = /* glsl */`
float difAng(vec3 p){
  float a = atan(p.x, p.z) - ANGC;
  return mod(a + 3.14159265, 6.2831853) - 3.14159265;
}
bool naCunha(vec3 p){
  if (uCorte < 0.002) return false;
  return abs(difAng(p)) < uCorte * MEIA && p.y > YC;
}
// profundidade aproximada atras das faces da secao (para a nevoa do citoplasma)
float profundidadeCorte(vec3 p){
  float rho = length(p.xz);
  float d = abs(difAng(p)) - uCorte * MEIA;
  float dA = rho * sin(clamp(d, 0.0, 1.5708));
  float dY = max(YC - p.y, 0.0);
  if (p.y > YC) return dA;
  return d < 0.0 ? dY : length(vec2(dA, dY));
}
`

const GLSL_RUIDO = /* glsl */`
vec3 m289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 m289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 perm(vec4 x){ return m289(((x*34.0)+1.0)*x); }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = m289(i);
  vec4 p = perm(perm(perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 xx = x_ * ns.x + ns.yyyy;
  vec4 yy = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(xx) - abs(yy);
  vec4 b0 = vec4(xx.xy, yy.xy);
  vec4 b1 = vec4(xx.zw, yy.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 nrm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
  p0 *= nrm.x; p1 *= nrm.y; p2 *= nrm.z; p3 *= nrm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

// gradacao final comum: destaque (as outras partes escurecem e dessaturam) e energia (celula apagada e fria)
const GLSL_GRADACAO = /* glsl */`
vec3 gradacao(vec3 c){
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, vec3(l) * vec3(0.26, 0.27, 0.30), uDim * 0.9);
  vec3 frio = vec3(l) * vec3(0.40, 0.50, 0.66) * 0.5;
  return mix(frio, c, 0.10 + 0.90 * uEnergia);
}
`

/* ------------------------------------------------------------------ patch dos materiais PBR */
let contadorProg = 0

/**
 * Injeta o GLSL do modelo em um MeshStandardMaterial.
 * modo: 'CASCA' | 'ORIGEM' (instancias presas a um ponto) | 'BASE' (atributo aBase) | 'LIVRE' | 'SEPTO'
 */
function patch(mat, { modo, uniforms, defines = {}, vertExtra = '', cor = '', relevo = '', emissivo = '', alfa = '', pars = '', semCorte = false }) {
  const id = 'varB-' + (contadorProg++)
  mat.defines = Object.assign(mat.defines || {}, { ['MODO_' + modo]: '' }, defines)
  if (semCorte) mat.defines.SEM_CORTE = ''
  mat.userData.u = uniforms
  mat.customProgramCacheKey = () => id
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)

    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', /* glsl */`#include <common>
${GLSL_CONST}
${GLSL_DEFORMA}
varying vec3 vPc;
varying vec3 vPl;
varying float vLado;
uniform float uExpR;
#ifdef MODO_CASCA
  attribute float aLado;
#endif
#ifdef MODO_BASE
  attribute vec3 aBase;
  uniform float uPili;
#endif
#ifdef MODO_SECRECAO
  attribute vec3 aSec;
  uniform float uSecrecao;
#endif
`)
      .replace('#include <beginnormal_vertex>', /* glsl */`
vec3 objectNormal = vec3( normal );
#ifdef MODO_CASCA
  vec3 nFora = normal * aLado;
  vec3 pExp = position + nFora * uExpR;
  vec3 tA = normalize(cross(nFora, abs(nFora.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
  vec3 tB = cross(nFora, tA);
  vec3 q0 = deforma(pExp);
  vec3 nDef = normalize(cross(deforma(pExp + tA * 0.012) - q0, deforma(pExp + tB * 0.012) - q0));
  if (dot(nDef, nFora) < 0.0) nDef = -nDef;
  objectNormal = nDef * aLado;
#endif
`)
      .replace('#include <begin_vertex>', /* glsl */`#include <begin_vertex>
vLado = 1.0;
#ifdef MODO_CASCA
  transformed = q0;
  vLado = aLado;
#endif
#ifdef MODO_SEPTO
  {
    float rOut = ${(R_PG).toFixed(4)} * escSepto(0.0);
    float rIn = rOut * (1.0 - 0.93 * uDivisao);
    float rr = mix(rIn, rOut, uv.x);
    transformed = vec3(position.x * rr, position.y, position.z * rr);
  }
#endif
`)
      .replace('#include <project_vertex>', /* glsl */`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
#if defined(MODO_CASCA)
  vPc = position; vPl = position;
#elif defined(MODO_LIVRE)
  vPc = mvPosition.xyz; vPl = mvPosition.xyz;
  mvPosition.xyz = deformaNuc(mvPosition.xyz);
#elif defined(MODO_SEPTO)
  vPc = mvPosition.xyz; vPl = mvPosition.xyz;
  mvPosition.xyz = warp(mvPosition.xyz);
#else
  vec3 pcel = mvPosition.xyz;
  vPl = transformed;
  #ifdef MODO_BASE
    vec3 orig = aBase;
    pcel = orig + (pcel - orig) * uPili;
  #else
    vec3 orig = instanceMatrix[3].xyz;
  #endif
  vec3 dO = orig - vec3(0.0, clamp(orig.y, -HCIL, HCIL), 0.0);
  float lO = length(dO);
  vec3 nO = lO > 0.0001 ? dO / lO : vec3(1.0, 0.0, 0.0);
  ${vertExtra}
  vec3 origD = deforma(orig + nO * uExpR);
  pcel += origD - orig;
  vPc = orig;
  mvPosition.xyz = pcel;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`)

    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', /* glsl */`#include <common>
${GLSL_CONST}
${GLSL_CUNHA}
${GLSL_RUIDO}
varying vec3 vPc;
varying vec3 vPl;
varying float vLado;
uniform float uDim;
uniform float uFoco;
uniform vec3 uRim;
uniform float uRimF;
uniform vec3 uSSS;
uniform vec3 uKeyDir;
${GLSL_GRADACAO}
vec3 relevoNormal(vec3 surfPos, vec3 surfNorm, vec2 dH, float faceDir){
  vec3 sx = normalize(dFdx(surfPos));
  vec3 sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, surfNorm);
  vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDir;
  vec3 g = sign(det) * (dH.x * r1 + dH.y * r2);
  return normalize(abs(det) * surfNorm - g);
}
float fadeRelevo(float freq){
  float px = length(fwidth(vPc));
  return clamp(1.6 - px * freq * 1.3, 0.0, 1.0);
}
${pars}
`)
      .replace('#include <clipping_planes_fragment>', /* glsl */`#include <clipping_planes_fragment>
#ifndef SEM_CORTE
  if (naCunha(vPc)) discard;
#endif
`)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + cor)
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + relevo)
      .replace('#include <emissivemap_fragment>', /* glsl */`#include <emissivemap_fragment>
{
  vec3 Vv = normalize(vViewPosition);
  float fr = pow(1.0 - clamp(dot(normal, Vv), 0.0, 1.0), 3.0);
  vec3 Lv = normalize((viewMatrix * vec4(uKeyDir, 0.0)).xyz);
  float wrapL = clamp((dot(normal, Lv) + 0.6) / 1.6, 0.0, 1.0);
  totalEmissiveRadiance *= (0.25 + 0.75 * uEnergia);
  totalEmissiveRadiance += uRim * fr * uRimF * (0.3 + 0.7 * uEnergia);
  totalEmissiveRadiance += uSSS * wrapL * wrapL * (0.3 + 0.7 * uEnergia);
  totalEmissiveRadiance += uRim * uFoco * (0.06 + 0.45 * fr);
  ${emissivo}
}
`)
      .replace('#include <opaque_fragment>', /* glsl */`#include <opaque_fragment>
${alfa}
gl_FragColor.rgb = gradacao(gl_FragColor.rgb);
`)
  }
  return mat
}
