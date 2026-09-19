// Modelo anatomico de Haemophilus influenzae — VARIANTE A (Three.js fisico e procedural).
// Ilustracao cientifica para seminario de microbiologia medica. Segue docs/CONTRATO-MODELO.md.
//
// - Geometria 100% procedural: cascas concentricas de capsula (cocobacilo 2,1:1) deslocadas por ruido em JS.
// - Materiais PBR com mapas gerados em DataTexture (normal de micro-relevo, AO+roughness, rede do peptidoglicano).
// - Corte em cunha com renderer.localClippingEnabled + clippingPlanes (clipIntersection) e TAMPAS de geometria
//   recalculadas na face do corte. O lado "rente" corta todas as camadas no mesmo plano (secao limpa, faixas
//   concentricas); o lado "em degraus" recua cada camada um pouco mais, como nos cortes de livro-texto.
// - InstancedMesh para LOS, porinas, adesinas, pili, beta-lactamases, PBP3, ribossomos, plasmideos e secrecao.
// - O modulo nao cria renderer, camera, luzes nem loop, e nao toca no DOM.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const TAU = Math.PI * 2
const GRAU = Math.PI / 180

/* =====================================================================
   MORFOLOGIA
   Corpo (sem capsula): comprimento 2,2 · largura 1,04 · razao 2,1:1 (cocobacilo).
   ===================================================================== */
const R0 = 0.52                       // raio da face externa da membrana externa
const H2 = 0.58                       // meia-altura do trecho cilindrico
const ARC_H = Math.PI * R0 / 2        // arco de um hemisferio (polo -> equador)
const ARC_C = 2 * H2                  // arco do cilindro
const ARC_T = 2 * ARC_H + ARC_C       // perfil completo, polo inferior -> polo superior
const S_MEIO = ARC_T / 2

// deslocamentos ao longo da normal, relativos a face externa da membrana externa
const OFF = {
  capsula: 0.14,
  meExt: 0.0, meInt: -0.042,
  pgExt: -0.063, pgMeio: -0.071, pgInt: -0.079,
  miExt: -0.100, miInt: -0.142,
}

// cunha do corte: plano rente em PHI0; cada camada recua ate PHI0 + largura
const PHI0 = 40 * GRAU
const LARGURA = {
  capsula: 150 * GRAU,
  membranaExterna: 128 * GRAU,
  peptidoglicano: 110 * GRAU,
  membranaInterna: 90 * GRAU,
  nucleo: 72 * GRAU,
}

// vista explodida: deslocamento axial de cada grupo (bonecas russas telescopadas)
const EXPLODE = { capsula: 1.0, externa: 0.5, periplasma: 0.0, interna: -0.5, nucleo: -1.0 }

const CORES = {
  capsula: 0xeadfc8,
  membranaExterna: 0x1fb8a6,
  los: 0xff7a45,
  porinas: 0x4c8dff,
  adesinas: 0xd4e157,
  pili: 0xf5e6a3,
  peptidoglicano: 0x58c17a,
  betaLactamase: 0xff5a3c,
  membranaInterna: 0xf2b441,
  pbp3: 0xe0247b,
  citoplasma: 0x241f52,
  ribossomos: 0x9a8cff,
  nucleoide: 0xc86bfa,
  plasmideo: 0x22e8e0,
  septo: 0x9fd8a4,
  secrecao: 0xff4d5a,
}

const NU = 8                          // repeticoes da textura ao redor da circunferencia
const KUV = NU / (TAU * R0)           // repeticoes por unidade de comprimento

/* =====================================================================
   RUIDO E ALEATORIO (deterministicos)
   ===================================================================== */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function h3(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
function ruido3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z)
  const fx = x - ix, fy = y - iy, fz = z - iz
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz)
  const a = h3(ix, iy, iz), b = h3(ix + 1, iy, iz), c = h3(ix, iy + 1, iz), d = h3(ix + 1, iy + 1, iz)
  const e = h3(ix, iy, iz + 1), f = h3(ix + 1, iy, iz + 1), g = h3(ix, iy + 1, iz + 1), h = h3(ix + 1, iy + 1, iz + 1)
  const x0 = a + (b - a) * ux, x1 = c + (d - c) * ux, x2 = e + (f - e) * ux, x3 = g + (h - g) * ux
  const y0 = x0 + (x1 - x0) * uy, y1 = x2 + (x3 - x2) * uy
  return y0 + (y1 - y0) * uz
}
function fbm3(x, y, z, oitavas) {
  let s = 0, amp = 0.5, tot = 0
  for (let o = 0; o < oitavas; o++) {
    s += ruido3(x, y, z) * amp; tot += amp
    x = x * 2.03 + 11.7; y = y * 2.03 + 3.1; z = z * 2.03 + 7.9; amp *= 0.5
  }
  return s / tot
}
// ruido 2D ladrilhavel (periodo inteiro)
function ruido2T(x, y, per, sem) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
  const m = (v) => ((v % per) + per) % per
  const a = h3(m(ix), m(iy), sem), b = h3(m(ix + 1), m(iy), sem)
  const c = h3(m(ix), m(iy + 1), sem), d = h3(m(ix + 1), m(iy + 1), sem)
  const x0 = a + (b - a) * ux, x1 = c + (d - c) * ux
  return x0 + (x1 - x0) * uy
}
// distancia ao ponto-caracteristica mais proximo (worley), ladrilhavel
function worley2T(x, y, per, sem) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const m = (v) => ((v % per) + per) % per
  let best = 9
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = ix + i, cy = iy + j
    const px = cx + h3(m(cx), m(cy), sem + 17), py = cy + h3(m(cx), m(cy), sem + 31)
    const dx = px - x, dy = py - y
    const d = dx * dx + dy * dy
    if (d < best) best = d
  }
  return Math.sqrt(best)
}
const suavizar = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/* =====================================================================
   SUPERFICIE DE REFERENCIA
   ponto(theta, s, off): ponto da casca de deslocamento `off`. Todas as cascas usam o mesmo
   deslocamento organico, entao ficam paralelas (espessura constante na secao).
   ===================================================================== */
const _pf = { r: 0, y: 0, nr: 0, ny: 0 }
function perfil(s) {
  if (s < 0) s = 0; else if (s > ARC_T) s = ARC_T
  if (s <= ARC_H) {
    const a = s / R0
    _pf.nr = Math.sin(a); _pf.ny = -Math.cos(a)
    _pf.r = R0 * _pf.nr; _pf.y = -H2 + R0 * _pf.ny
  } else if (s <= ARC_H + ARC_C) {
    _pf.nr = 1; _pf.ny = 0; _pf.r = R0; _pf.y = -H2 + (s - ARC_H)
  } else {
    const a = (s - ARC_H - ARC_C) / R0
    _pf.nr = Math.cos(a); _pf.ny = Math.sin(a)
    _pf.r = R0 * _pf.nr; _pf.y = H2 + R0 * _pf.ny
  }
  return _pf
}
function desloc(theta, s) {
  const p = perfil(s)
  const x = p.r * Math.cos(theta), z = p.r * Math.sin(theta), y = p.y
  return 0.10 * (fbm3(x * 1.3 + 3.1, y * 1.3 + 7.7, z * 1.3 + 1.3, 3) - 0.5)   // lobos largos (pleomorfismo)
    + 0.018 * Math.sin(1.25 * y + 0.7)                                          // um polo um pouco mais cheio
    + 0.016 * (fbm3(x * 4.6 + 9.2, y * 4.6 + 2.4, z * 4.6 + 5.5, 2) - 0.5)      // irregularidade fina
}
function ponto(theta, s, off, alvo, normal) {
  const d = desloc(theta, s) + off
  const p = _pf
  const c = Math.cos(theta), sn = Math.sin(theta)
  const rr = p.r + p.nr * d
  alvo.set(rr * c, p.y + p.ny * d, rr * sn)
  if (normal) normal.set(p.nr * c, p.ny, p.nr * sn)
  return alvo
}
const sDeY = (y) => ARC_H + (y + H2)  // arco correspondente a uma altura no trecho cilindrico

/* =====================================================================
   GRADE COMPARTILHADA E CASCAS
   ===================================================================== */
function criarGrade(nT, nH, nC) {
  const linhas = []
  for (let i = 0; i <= nH; i++) linhas.push({ s: ARC_H * i / nH, reg: 0 })
  for (let i = 0; i <= nC; i++) linhas.push({ s: ARC_H + ARC_C * i / nC, reg: 1 })
  for (let i = 0; i <= nH; i++) linhas.push({ s: ARC_H + ARC_C + ARC_H * i / nH, reg: 2 })
  const nL = linhas.length, col = nT + 1, nV = nL * col
  const base = new Float32Array(nV * 3), n0 = new Float32Array(nV * 3), nn = new Float32Array(nV * 3)
  const uv = new Float32Array(nV * 2), mancha = new Float32Array(nV)
  const P = new THREE.Vector3(), N = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3()
  const C = new THREE.Vector3(), D = new THREE.Vector3(), X = new THREE.Vector3()
  const e = 0.006
  for (let i = 0; i < nL; i++) {
    const { s, reg } = linhas[i]
    for (let j = 0; j <= nT; j++) {
      const th = (j % nT) / nT * TAU
      const k = i * col + j
      ponto(th, s, 0, P, N)
      base[k * 3] = P.x; base[k * 3 + 1] = P.y; base[k * 3 + 2] = P.z
      n0[k * 3] = N.x; n0[k * 3 + 1] = N.y; n0[k * 3 + 2] = N.z
      // normal verdadeira da superficie deslocada (diferencas finitas)
      ponto(th + e, s, 0, A); ponto(th - e, s, 0, B); ponto(th, s + e, 0, C); ponto(th, s - e, 0, D)
      A.sub(B); C.sub(D); X.crossVectors(C, A)
      if (X.lengthSq() < 1e-14) X.copy(N); else X.normalize()
      if (X.dot(N) < 0) X.negate()
      if (s < 1e-6 || s > ARC_T - 1e-6) X.copy(N)
      nn[k * 3] = X.x; nn[k * 3 + 1] = X.y; nn[k * 3 + 2] = X.z
      // UV: cilindro desenrolado; calotas em projecao polar (sem pinca no polo)
      const ang = j / nT * TAU
      if (reg === 1) { uv[k * 2] = j / nT * NU; uv[k * 2 + 1] = (s - ARC_H) * KUV }
      else {
        const sp = reg === 0 ? s : ARC_T - s
        uv[k * 2] = sp * KUV * Math.cos(ang) + (reg === 2 ? 3.37 : 0)
        uv[k * 2 + 1] = sp * KUV * Math.sin(ang) + (reg === 2 ? 1.73 : 0)
      }
      mancha[k] = fbm3(P.x * 2.6 + 1.9, P.y * 2.6 + 4.2, P.z * 2.6 + 8.8, 3)
    }
  }
  // indices (so dentro de cada regiao: as linhas de juncao sao duplicadas por causa do UV)
  const idxExt = [], idxInt = []
  for (let i = 0; i < nL - 1; i++) {
    if (linhas[i].reg !== linhas[i + 1].reg) continue
    for (let j = 0; j < nT; j++) {
      const a = i * col + j, b = a + 1, c = a + col, d = c + 1
      idxExt.push(a, c, b, b, c, d)
      idxInt.push(a, b, c, b, d, c)
    }
  }
  return { nV, base, n0, nn, uv, mancha, idxExt, idxInt }
}

function geoCasca(grade, off, { interna = false, tinta = null } = {}) {
  const { nV, base, n0, nn, uv, mancha } = grade
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3)
  const sinal = interna ? -1 : 1
  for (let k = 0; k < nV; k++) {
    // o deslocamento organico ja esta em `base`; aqui so entra o deslocamento da camada
    pos[k * 3] = base[k * 3] + n0[k * 3] * off
    pos[k * 3 + 1] = base[k * 3 + 1] + n0[k * 3 + 1] * off
    pos[k * 3 + 2] = base[k * 3 + 2] + n0[k * 3 + 2] * off
    nor[k * 3] = nn[k * 3] * sinal; nor[k * 3 + 1] = nn[k * 3 + 1] * sinal; nor[k * 3 + 2] = nn[k * 3 + 2] * sinal
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  if (tinta) {
    const cor = new Float32Array(nV * 3)
    const c = new THREE.Color()
    for (let k = 0; k < nV; k++) { tinta(mancha[k], c); cor[k * 3] = c.r; cor[k * 3 + 1] = c.g; cor[k * 3 + 2] = c.b }
    g.setAttribute('color', new THREE.BufferAttribute(cor, 3))
  }
  g.setIndex(interna ? grade.idxInt : grade.idxExt)
  g.computeBoundingSphere()
  return g
}

/* =====================================================================
   TAMPAS DO CORTE (faixas planas entre dois deslocamentos, no plano do corte)
   ===================================================================== */
const M_TAMPA = 132
class Tampa {
  // faixas: [{ ext, int }] (int === null -> vai ate o eixo) · lados: 'ambos' | 'rente'
  constructor(faixas, lados = 'ambos') {
    this.faixas = faixas; this.lados = lados
    const nFitas = faixas.length * (lados === 'ambos' ? 2 : 1)
    const vPorFita = (M_TAMPA + 1) * 2
    this.vPorFita = vPorFita
    this.pos = new Float32Array(nFitas * vPorFita * 3)
    this.nor = new Float32Array(nFitas * vPorFita * 3)
    this.uv = new Float32Array(nFitas * vPorFita * 2)
    const idx = []
    let fita = 0
    for (let f = 0; f < faixas.length; f++) {
      for (let lado = 0; lado < (lados === 'ambos' ? 2 : 1); lado++) {
        const b = fita * vPorFita
        for (let j = 0; j < M_TAMPA; j++) {
          const i0 = b + j * 2, o0 = i0 + 1, i1 = i0 + 2, o1 = i0 + 3   // [int, ext] por linha
          if (lado === 0) idx.push(i0, o0, o1, i0, o1, i1)               // normal +n(phi)
          else idx.push(i0, o1, o0, i0, i1, o1)                          // normal -n(phi)
        }
        fita++
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2))
    g.setIndex(idx)
    this.geo = g
    this._phiDegrau = null
    this._fita(0, PHI0, 0, true)
  }
  _fita(_, phi, lado, todas) {
    const E = Tampa._E, I = Tampa._I
    const nLados = this.lados === 'ambos' ? 2 : 1
    const nx = lado === 0 ? -Math.sin(phi) : Math.sin(phi), nz = lado === 0 ? Math.cos(phi) : -Math.cos(phi)
    for (let f = 0; f < this.faixas.length; f++) {
      const fx = this.faixas[f]
      const b = (f * nLados + lado) * this.vPorFita
      for (let j = 0; j <= M_TAMPA; j++) {
        const s = ARC_T * j / M_TAMPA
        ponto(phi, s, fx.ext, E)
        if (fx.int === null) I.set(0, E.y, 0); else ponto(phi, s, fx.int, I)
        const k = b + j * 2
        this.pos[k * 3] = I.x; this.pos[k * 3 + 1] = I.y; this.pos[k * 3 + 2] = I.z
        this.pos[k * 3 + 3] = E.x; this.pos[k * 3 + 4] = E.y; this.pos[k * 3 + 5] = E.z
        this.nor[k * 3] = nx; this.nor[k * 3 + 1] = 0; this.nor[k * 3 + 2] = nz
        this.nor[k * 3 + 3] = nx; this.nor[k * 3 + 4] = 0; this.nor[k * 3 + 5] = nz
        this.uv[k * 2] = Math.hypot(I.x, I.z) * KUV * 2; this.uv[k * 2 + 1] = I.y * KUV * 2
        this.uv[k * 2 + 2] = Math.hypot(E.x, E.z) * KUV * 2; this.uv[k * 2 + 3] = E.y * KUV * 2
      }
    }
    if (todas) this.geo.attributes.position.needsUpdate = true
  }
  degrau(phi) {
    if (this.lados !== 'ambos' || phi === this._phiDegrau) return
    this._phiDegrau = phi
    this._fita(0, phi, 1)
    this.geo.attributes.position.needsUpdate = true
    this.geo.attributes.normal.needsUpdate = true
    this.geo.attributes.uv.needsUpdate = true
    this.geo.computeBoundingSphere()
  }
}
Tampa._E = new THREE.Vector3(); Tampa._I = new THREE.Vector3()

/* =====================================================================
   TEXTURAS PROCEDURAIS (DataTexture)
   ===================================================================== */
function prepararTextura(t, anis) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.anisotropy = anis
  t.colorSpace = THREE.NoColorSpace
  t.needsUpdate = true
  return t
}
// micro-relevo de membrana: ondulacao fina + "calombos" de proteina. Devolve normal map e mapa AO(R)+roughness(G).
function texturasRelevo(N, sem, anis, { calombos = 0.5, forca = 5.5 } = {}) {
  const h = new Float32Array(N * N), bol = new Float32Array(N * N)
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N
    let a = 0, amp = 0.5, per = 5, tot = 0
    for (let o = 0; o < 5; o++) { a += ruido2T(u * per, v * per, per, sem + o * 7) * amp; tot += amp; amp *= 0.55; per *= 2 }
    a /= tot
    const w = worley2T(u * 26, v * 26, 26, sem + 3)
    const b = suavizar(0.46, 0.06, w)
    bol[y * N + x] = b
    h[y * N + x] = a * (1 - calombos) + b * calombos
  }
  const nrm = new Uint8Array(N * N * 4), orm = new Uint8Array(N * N * 4)
  const k = forca * N / 512
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const xm = (x + N - 1) % N, xp = (x + 1) % N, ym = (y + N - 1) % N, yp = (y + 1) % N
    const dx = (h[y * N + xp] - h[y * N + xm]) * k, dy = (h[yp * N + x] - h[ym * N + x]) * k
    const il = 1 / Math.hypot(dx, dy, 1)
    const i = (y * N + x) * 4
    nrm[i] = (-dx * il * 0.5 + 0.5) * 255; nrm[i + 1] = (-dy * il * 0.5 + 0.5) * 255; nrm[i + 2] = (il * 0.5 + 0.5) * 255; nrm[i + 3] = 255
    const hh = h[y * N + x]
    orm[i] = Math.min(255, (0.50 + 0.50 * suavizar(0.15, 0.7, hh)) * 255)          // R: oclusao nas cavidades
    orm[i + 1] = Math.min(255, (0.62 + 0.38 * (1 - suavizar(0.2, 0.85, hh))) * 255) // G: topo dos calombos mais liso
    orm[i + 2] = 0; orm[i + 3] = 255
  }
  return {
    normal: prepararTextura(new THREE.DataTexture(nrm, N, N, THREE.RGBAFormat), anis),
    orm: prepararTextura(new THREE.DataTexture(orm, N, N, THREE.RGBAFormat), anis),
  }
}
// rede do peptidoglicano: fitas de glicano onduladas (horizontais) + pontes peptidicas curtas e desencontradas
function texturaRede(N, anis) {
  const d = new Uint8Array(N * N * 4)
  const FIT = 12, COL = 16
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N
    const onda = 0.16 * Math.sin(u * TAU * 3 + v * TAU * 2) + 0.10 * Math.sin(u * TAU * 7 + 1.3)
    const fv = v * FIT + onda
    const linha = Math.floor(fv), ff = fv - linha
    const dFita = Math.min(ff, 1 - ff) / FIT
    const lm = ((linha % FIT) + FIT) % FIT
    const fu = u * COL + (lm % 2) * 0.5 + h3(lm, 5, 9) * 0.3
    const cel = Math.floor(fu), fc = fu - cel
    const jx = 0.3 + 0.4 * h3(((cel % COL) + COL) % COL, lm, 21)
    const dPonte = Math.abs(fc - jx) / COL
    const a = Math.max(1 - suavizar(0.010, 0.017, dFita), 1 - suavizar(0.006, 0.011, dPonte))
    const i = (y * N + x) * 4
    const val = Math.round(a * 255)
    d[i] = val; d[i + 1] = val; d[i + 2] = val; d[i + 3] = 255
  }
  return prepararTextura(new THREE.DataTexture(d, N, N, THREE.RGBAFormat), anis)
}

/* =====================================================================
   AMBIENTE (PMREM a partir de softboxes gerados em codigo, tom quente)
   ===================================================================== */
function criarAmbiente(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const c = new THREE.Scene()
  c.background = new THREE.Color(0x0b0907)
  const quad = new THREE.PlaneGeometry(1, 1)
  const mats = []
  const painel = (cor, forca, esc, pos) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(forca), side: THREE.DoubleSide })
    mats.push(mat)
    const m = new THREE.Mesh(quad, mat)
    m.scale.set(esc[0], esc[1], 1); m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0)
    c.add(m)
  }
  painel(0xffd2a1, 9.0, [7, 5], [-6, 4.5, 5])       // principal quente, alto a esquerda
  painel(0xfff0dc, 5.0, [9, 1.6], [0, 8, 0.5])      // tira superior
  painel(0x8fb6ff, 7.0, [3.2, 7], [6.5, 1.0, -5])   // contraluz fria
  painel(0x6f8fd6, 2.0, [6, 3], [-5, -1.5, -6])     // contraluz fria secundaria
  painel(0xff9d5c, 1.3, [10, 10], [0, -7, 0])       // rebatida quente do chao
  painel(0xffe3c4, 1.6, [2.5, 2.5], [5, -2, 6])     // preenchimento frontal fraco
  const rt = pmrem.fromScene(c, 0.04)
  pmrem.dispose(); quad.dispose(); mats.forEach((m) => m.dispose())
  return rt
}

/* =====================================================================
   GEOMETRIAS PEQUENAS (instanciadas)
   ===================================================================== */
function esferaSuave(r, detalhe) {
  const g = new THREE.IcosahedronGeometry(r, detalhe)
  const p = g.attributes.position, n = g.attributes.normal, v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); n.setXYZ(i, v.x, v.y, v.z) }
  return g
}
function semIndice(g) { const o = g.index ? g.toNonIndexed() : g; if (o !== g) g.dispose(); return o }
function fundir(lista) {
  const prontas = lista.map(semIndice)
  const g = mergeGeometries(prontas, false)
  prontas.forEach((x) => x.dispose())
  g.deleteAttribute('uv')
  return g
}
// cor de vertice = fator de sombra (base escura, topo pleno): oclusao barata entre hastes
function sombrearPorAltura(g, y0, y1, minimo) {
  const p = g.attributes.position, c = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const f = minimo + (1 - minimo) * suavizar(y0, y1, p.getY(i))
    c[i * 3] = f; c[i * 3 + 1] = f; c[i * 3 + 2] = f
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3))
  return g
}
function geoLOS() {
  const haste = new THREE.CylinderGeometry(0.0042, 0.0066, 0.03, 5, 1, true); haste.translate(0, 0.015, 0)
  const c1 = esferaSuave(0.0088, 0); c1.translate(0, 0.033, 0)
  const c2 = new THREE.OctahedronGeometry(0.0064, 0); c2.translate(0.0045, 0.0445, 0.002)
  return sombrearPorAltura(fundir([haste, c1, c2]), 0.0, 0.034, 0.28)
}
function geoPorina() {
  const pts = [[0.0072, -0.03], [0.0185, -0.03], [0.0205, 0.004], [0.0172, 0.0115], [0.0095, 0.0105], [0.0072, -0.004], [0.0072, -0.03]]
    .map((p) => new THREE.Vector2(p[0], p[1]))
  const partes = []
  for (let i = 0; i < 3; i++) {
    const g = new THREE.LatheGeometry(pts, 10)
    const a = i / 3 * TAU + 0.4
    g.translate(Math.cos(a) * 0.0195, 0, Math.sin(a) * 0.0195)
    partes.push(g)
  }
  const g = fundir(partes)
  // poro escuro: escurece vertices perto do eixo de cada barril
  const p = g.attributes.position, c = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    let dm = 9
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * TAU + 0.4
      dm = Math.min(dm, Math.hypot(p.getX(i) - Math.cos(a) * 0.0195, p.getZ(i) - Math.sin(a) * 0.0195))
    }
    const f = (0.22 + 0.78 * suavizar(0.008, 0.015, dm)) * (0.45 + 0.55 * suavizar(-0.03, 0.006, p.getY(i)))
    c[i * 3] = f; c[i * 3 + 1] = f; c[i * 3 + 2] = f
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3))
  return g
}
function geoAdesina() {
  const haste = new THREE.CylinderGeometry(0.0072, 0.0098, 0.135, 6, 1, true); haste.translate(0, 0.0675, 0)
  const cab = esferaSuave(0.021, 1); cab.scale(1, 1.28, 1); cab.translate(0, 0.15, 0)
  const colar = esferaSuave(0.0125, 0); colar.translate(0, 0.118, 0)
  return sombrearPorAltura(fundir([haste, cab, colar]), 0.0, 0.11, 0.35)
}
function geoPilus() {
  const curva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.015, 0.24, 0.004), new THREE.Vector3(0.07, 0.5, 0.02),
    new THREE.Vector3(0.16, 0.74, 0.055), new THREE.Vector3(0.28, 0.96, 0.10),
  ])
  const g = new THREE.TubeGeometry(curva, 22, 0.0052, 5, false)
  g.deleteAttribute('uv')
  return g
}
function geoGlobulo(r, sem) {
  const rnd = mulberry32(sem)
  const partes = []
  for (let i = 0; i < 3; i++) {
    const g = esferaSuave(r * (i === 0 ? 1 : 0.62 + rnd() * 0.2), 1)
    if (i > 0) g.translate((rnd() - 0.5) * r * 1.3, (rnd() - 0.5) * r * 1.3, (rnd() - 0.5) * r * 1.3)
    partes.push(g)
  }
  return fundir(partes)
}
function geoPBP3() {
  const ancora = new THREE.CylinderGeometry(0.0042, 0.0042, 0.026, 5, 1, true); ancora.translate(0, -0.006, 0)
  const dom = esferaSuave(0.0125, 1); dom.scale(1, 1.45, 1); dom.translate(0, 0.02, 0)
  const dom2 = esferaSuave(0.0085, 0); dom2.translate(0.008, 0.034, 0.003)
  return fundir([ancora, dom, dom2])
}
function geoRibossomo(r, alta) {
  const maior = esferaSuave(r, alta ? 1 : 0); maior.scale(1, 0.86, 1)
  const menor = esferaSuave(r * 0.72, 0); menor.scale(1, 0.8, 1.05); menor.translate(r * 0.2, r * 0.78, 0)
  return fundir([maior, menor])
}

// curva fechada enovelada (cromossomo circular): soma de harmonicos aleatorios, confinada a um elipsoide
class CurvaNucleoide extends THREE.Curve {
  constructor(sem, K, raios) {
    super()
    const rnd = mulberry32(sem)
    this.K = K; this.raios = raios
    this.A = new Float32Array(K * 3); this.B = new Float32Array(K * 3)
    const g = () => (rnd() + rnd() + rnd() - 1.5) * 1.15
    for (let k = 0; k < K; k++) {
      const amp = 1 / Math.pow(k + 1, 0.62)
      for (let c = 0; c < 3; c++) { this.A[k * 3 + c] = g() * amp; this.B[k * 3 + c] = g() * amp }
    }
    // normaliza pela media quadratica
    let soma = 0
    for (let i = 0; i < K * 3; i++) soma += this.A[i] * this.A[i] + this.B[i] * this.B[i]
    this.norma = 1 / Math.sqrt(soma / 2 / 3)
    this.arcLengthDivisions = 3200
  }
  getPoint(t, alvo = new THREE.Vector3()) {
    let x = 0, y = 0, z = 0
    const w = t * TAU
    for (let k = 0; k < this.K; k++) {
      const c = Math.cos(w * (k + 1)), s = Math.sin(w * (k + 1))
      x += this.A[k * 3] * c + this.B[k * 3] * s
      y += this.A[k * 3 + 1] * c + this.B[k * 3 + 1] * s
      z += this.A[k * 3 + 2] * c + this.B[k * 3 + 2] * s
    }
    x *= this.norma * 0.62; y *= this.norma * 0.62; z *= this.norma * 0.62
    const m = Math.hypot(x, y, z) || 1e-6
    const f = Math.tanh(m * 1.25) / m                          // confina ao elipsoide, sem parede dura
    return alvo.set(x * f * this.raios[0], y * f * this.raios[1], z * f * this.raios[2])
  }
}
class CurvaPlasmideo extends THREE.Curve {
  constructor(r, fase) { super(); this.r = r; this.fase = fase }
  getPoint(t, alvo = new THREE.Vector3()) {
    const a = t * TAU
    const rr = this.r * (1 + 0.10 * Math.sin(a * 3 + this.fase))
    return alvo.set(Math.cos(a) * rr, this.r * 0.22 * Math.sin(a * 2 + this.fase), Math.sin(a) * rr)
  }
}

/* =====================================================================
   GANCHO DE SHADER: constricao da divisao, descarte de instancias dentro da cunha e agitacao termica
   ===================================================================== */
const GLSL_COMUM = /* glsl */`
uniform float uDiv;
uniform float uTempo;
uniform float uAgito;
uniform vec2 uCunha;
uniform vec2 uAperto;   // x = amplitude, y = sigma
const float HI_ALONGA = 0.12;
float hiK( float y ) { return 1.0 - uDiv * uAperto.x * exp( - ( y * y ) / ( uAperto.y * uAperto.y ) ); }
float hiDK( float y ) { return uDiv * uAperto.x * exp( - ( y * y ) / ( uAperto.y * uAperto.y ) ) * 2.0 * y / ( uAperto.y * uAperto.y ); }
float hiCorte( vec3 o ) {
  if ( uCunha.y < 1e-4 ) return 1.0;
  float a = mod( atan( o.z, o.x ) - uCunha.x, 6.2831853 );
  if ( a < uCunha.y ) return 0.0;
  float m = min( 0.05, uCunha.y * 0.5 );
  return min( clamp( ( a - uCunha.y ) / m, 0.0, 1.0 ), clamp( ( 6.2831853 - a ) / m, 0.0, 1.0 ) );
}
`
const GLSL_PROJ_INSTANCIA = (amp) => /* glsl */`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
  vec3 hiO = instanceMatrix[ 3 ].xyz;
  mvPosition.xyz = hiO + ( mvPosition.xyz - hiO ) * hiCorte( hiO );
  ${amp > 0 ? `mvPosition.xyz += vec3( sin( uTempo * 2.3 + hiO.x * 191.7 + hiO.z * 77.0 ), sin( uTempo * 2.9 + hiO.y * 173.1 ), sin( uTempo * 2.6 + hiO.z * 157.3 + hiO.x * 41.0 ) ) * ${amp.toFixed(5)} * uAgito;` : ''}
  mvPosition.xz += hiO.xz * ( hiK( hiO.y ) - 1.0 );
  mvPosition.y += hiO.y * HI_ALONGA * uDiv;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`
function criarGancho(comuns) {
  return function gancho(mat, { instancia = false, cunha = null, agito = 0, aperto = [0.55, 0.24] } = {}) {
    const uniformes = {
      uDiv: comuns.uDiv, uTempo: comuns.uTempo, uAgito: comuns.uAgito,
      uCunha: cunha || { value: new THREE.Vector2(0, 0) },
      uAperto: { value: new THREE.Vector2(aperto[0], aperto[1]) },
    }
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniformes)
      let vs = shader.vertexShader.replace('#include <common>', '#include <common>\n' + GLSL_COMUM)
      if (instancia) {
        vs = vs.replace('#include <project_vertex>', GLSL_PROJ_INSTANCIA(agito))
      } else {
        vs = vs.replace('#include <beginnormal_vertex>', /* glsl */`#include <beginnormal_vertex>
        {
          float hk = hiK( position.y ); float hdk = hiDK( position.y ); float hs = 1.0 + HI_ALONGA * uDiv;
          objectNormal = normalize( vec3( objectNormal.x / hk, ( objectNormal.y - hdk * ( position.x * objectNormal.x + position.z * objectNormal.z ) / hk ) / hs, objectNormal.z / hk ) );
        }`)
        vs = vs.replace('#include <begin_vertex>', /* glsl */`#include <begin_vertex>
        { float hk = hiK( transformed.y ); transformed.xz *= hk; transformed.y *= 1.0 + HI_ALONGA * uDiv; }`)
      }
      shader.vertexShader = vs
    }
    mat.customProgramCacheKey = () => `hi-a|${instancia ? 1 : 0}|${agito}`
    return mat
  }
}

/* =====================================================================
   FABRICA
   ===================================================================== */
export async function criarBacilo({ renderer, qualidade = 'alta' } = {}) {
  const alta = qualidade !== 'media'
  const Q = alta
    ? { grade: [144, 32, 48], gradeInt: [72, 16, 24], tex: 512, los: 3000, porinas: 170, adesinas: 60, pili: 26, blac: 46, pbp3: 104, ribo: 2600, nucSeg: 1900, nucRad: 6, prot: 84, ves: 22 }
    : { grade: [96, 24, 32], gradeInt: [56, 12, 18], tex: 256, los: 1500, porinas: 110, adesinas: 44, pili: 20, blac: 36, pbp3: 72, ribo: 1300, nucSeg: 1100, nucRad: 5, prot: 48, ves: 14 }

  if (renderer) renderer.localClippingEnabled = true
  else console.warn('[variante-a] sem renderer: o corte precisa de renderer.localClippingEnabled = true')
  const anis = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1

  const descartaveis = []          // geometrias, materiais, texturas
  const guardar = (x) => { descartaveis.push(x); return x }

  const comuns = { uDiv: { value: 0 }, uTempo: { value: 0 }, uAgito: { value: 1 } }
  const gancho = criarGancho(comuns)

  /* ---------- planos do corte (locais e de mundo) ---------- */
  const planoRente = { local: new THREE.Plane(new THREE.Vector3(Math.sin(PHI0), 0, -Math.cos(PHI0)), 0), mundo: new THREE.Plane() }
  const planosDegrau = {}
  const cunhas = {}
  for (const k of Object.keys(LARGURA)) {
    planosDegrau[k] = { local: new THREE.Plane(new THREE.Vector3(-Math.sin(PHI0), 0, Math.cos(PHI0)), 0), mundo: new THREE.Plane() }
    cunhas[k] = { value: new THREE.Vector2(PHI0, 0) }
  }
  const clip = (k) => ({ clippingPlanes: [planoRente.mundo, planosDegrau[k].mundo], clipIntersection: true })

  /* ---------- texturas ---------- */
  const relevoME = texturasRelevo(Q.tex, 11, anis, { calombos: 0.55, forca: 6.0 })
  const relevoMI = texturasRelevo(Q.tex >> 1, 47, anis, { calombos: 0.3, forca: 4.0 })
  const rede = texturaRede(Q.tex, anis); rede.repeat.set(3, 3)
  const nmCapsula = relevoMI.normal.clone(); nmCapsula.repeat.set(0.5, 0.5); nmCapsula.needsUpdate = true
  const nmTampa = relevoMI.normal.clone(); nmTampa.repeat.set(3, 3); nmTampa.needsUpdate = true
  ;[relevoME.normal, relevoME.orm, relevoMI.normal, relevoMI.orm, rede, nmCapsula, nmTampa].forEach(guardar)

  /* ---------- hierarquia ---------- */
  const grupo = new THREE.Group(); grupo.name = 'haemophilus-variante-a'
  const camadas = {}
  for (const k of Object.keys(EXPLODE)) { camadas[k] = new THREE.Group(); camadas[k].name = 'camada-' + k; grupo.add(camadas[k]) }
  const partes = {}
  const novaParte = (chave, camada) => { const g = new THREE.Group(); g.name = chave; camadas[camada].add(g); partes[chave] = g; return g }

  /* ---------- registro de materiais para destaque / energia ---------- */
  const registro = []   // { chave, mat, cor, emissivo, eInt, opacidade, opApagada, manterCor, presenca }
  const registrar = (chave, mat, { opApagada = null, manterCor = false, brilho = 0.0 } = {}) => {
    guardar(mat)
    const r = {
      chave, mat, cor: mat.color.clone(),
      emissivo: mat.emissive ? mat.emissive.clone() : null, eInt: mat.emissiveIntensity ?? 0,
      opacidade: mat.opacity, opApagada, manterCor, brilho, presenca: 1,
    }
    registro.push(r)
    return r
  }
  const malhasCortadas = []
  const novaMalha = (geo, mat, pai, { cortada = false, nome = '' } = {}) => {
    guardar(geo)
    const m = new THREE.Mesh(geo, mat); m.name = nome
    if (cortada) malhasCortadas.push(m)
    pai.add(m)
    return m
  }

  const grade = criarGrade(...Q.grade)
  const gradeInt = criarGrade(...Q.gradeInt)
  const tampas = []     // { tampa, malha, largura }
  const novaTampa = (chave, faixas, lados, larguraK, mat, pai) => {
    const t = new Tampa(faixas, lados)
    const malha = novaMalha(t.geo, mat, pai, { nome: chave + '-tampa' })
    malha.visible = false
    malha.frustumCulled = false
    tampas.push({ tampa: t, malha, larguraK })
    return malha
  }
  const matTampa = (cor, extra = {}) => new THREE.MeshStandardMaterial({
    color: cor, roughness: 0.62, metalness: 0, normalMap: nmTampa, normalScale: new THREE.Vector2(0.35, 0.35),
    side: THREE.DoubleSide, envMapIntensity: 0.7, ...extra,
  })

  /* =================== 1 · CAPSULA =================== */
  const pCapsula = novaParte('capsula', 'capsula')
  const matCapsula = alta
    ? new THREE.MeshPhysicalMaterial({
      color: CORES.capsula, roughness: 0.4, metalness: 0,
      transmission: 0.86, thickness: 0.3, ior: 1.2,
      attenuationColor: new THREE.Color(0xe9c99d), attenuationDistance: 0.7,
      specularIntensity: 0.75, sheen: 0.55, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xfff1df),
      normalMap: nmCapsula, normalScale: new THREE.Vector2(0.08, 0.08),
      transparent: true, opacity: 1, envMapIntensity: 1.0, ...clip('capsula'),
    })
    : new THREE.MeshPhysicalMaterial({
      color: CORES.capsula, roughness: 0.32, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35,
      sheen: 0.8, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xfff1df),
      transparent: true, opacity: 0.4, depthWrite: false, envMapIntensity: 1.2, ...clip('capsula'),
    })
  gancho(matCapsula)
  const regCapsula = registrar('capsula', matCapsula, { opApagada: alta ? 0.10 : 0.06, manterCor: true })
  const malhaCapsula = novaMalha(geoCasca(grade, OFF.capsula), matCapsula, pCapsula, { cortada: true, nome: 'capsula-ext' })
  malhaCapsula.renderOrder = 5
  const matCapsulaInt = gancho(new THREE.MeshStandardMaterial({ color: 0xcdbf9f, roughness: 0.7, envMapIntensity: 0.5, ...clip('capsula') }))
  const regCapsulaInt = registrar('capsula', matCapsulaInt)
  const malhaCapsulaInt = novaMalha(geoCasca(gradeInt, OFF.meExt + 0.004, { interna: true }), matCapsulaInt, pCapsula, { cortada: true, nome: 'capsula-int' })
  const matCapsulaTampa = gancho(matTampa(0xe4d6b8, { roughness: 0.5, transparent: true }))
  const regCapsulaTampa = registrar('capsula', matCapsulaTampa, { opApagada: 0.18, manterCor: true })
  novaTampa('capsula', [{ ext: OFF.capsula, int: OFF.meExt }], 'ambos', 'capsula', matCapsulaTampa, pCapsula)

  /* =================== 2 · MEMBRANA EXTERNA =================== */
  const pME = novaParte('membranaExterna', 'externa')
  const modA = new THREE.Color(0.50, 0.66, 0.78), modB = new THREE.Color(1.16, 1.08, 0.96)
  const matME = gancho(new THREE.MeshPhysicalMaterial({
    color: CORES.membranaExterna, vertexColors: true, emissive: CORES.membranaExterna, emissiveIntensity: 0, roughness: 0.62, metalness: 0,
    normalMap: relevoME.normal, normalScale: new THREE.Vector2(0.9, 0.9),
    roughnessMap: relevoME.orm, aoMap: relevoME.orm, aoMapIntensity: 1.0,
    clearcoat: 0.3, clearcoatRoughness: 0.45, sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x8ff5e6),
    envMapIntensity: 0.9, ...clip('membranaExterna'),
  }))
  // a cor-base fica no material (para o destaque dessaturar); a cor de vertice so modula a mancha
  registrar('membranaExterna', matME, { brilho: 0.12 })
  novaMalha(geoCasca(grade, OFF.meExt, { tinta: (m, c) => c.copy(modA).lerp(modB, suavizar(0.3, 0.72, m)) }), matME, pME, { cortada: true, nome: 'me-ext' })
  const matMEInt = gancho(new THREE.MeshStandardMaterial({ color: 0x158a7e, roughness: 0.7, envMapIntensity: 0.5, ...clip('membranaExterna') }))
  registrar('membranaExterna', matMEInt)
  const malhaMEInt = novaMalha(geoCasca(gradeInt, OFF.meInt, { interna: true }), matMEInt, pME, { cortada: true, nome: 'me-int' })
  const matMETampa = gancho(matTampa(0x23c4b1))
  registrar('membranaExterna', matMETampa)
  novaTampa('membranaExterna', [{ ext: OFF.meExt, int: OFF.meInt }], 'ambos', 'membranaExterna', matMETampa, pME)

  /* ---------- amostragem uniforme em area sobre a capsula de referencia ---------- */
  const A_H = TAU * R0 * R0, A_C = TAU * R0 * ARC_C, A_T = 2 * A_H + A_C
  const sPorArea = (b) => {
    const a = b * A_T
    if (a < A_H) return Math.acos(1 - a / A_H) * R0
    if (a < A_H + A_C) return ARC_H + (a - A_H) / A_C * ARC_C
    return ARC_H + ARC_C + Math.asin(Math.min(1, (a - A_H - A_C) / A_H)) * R0
  }
  const amostra = (i, rnd, jit) => {
    const u = (0.5 + i * 0.7548776662466927 + (rnd() - 0.5) * jit) % 1
    const v = (0.5 + i * 0.5698402909980532 + (rnd() - 0.5) * jit) % 1
    return [((u + 1) % 1) * TAU, sPorArea((v + 1) % 1)]
  }
  const _P = new THREE.Vector3(), _N = new THREE.Vector3(), _Q = new THREE.Quaternion(), _Q2 = new THREE.Quaternion()
  const _S = new THREE.Vector3(), _M = new THREE.Matrix4(), _Y = new THREE.Vector3(0, 1, 0), _C = new THREE.Color()
  const matrizNaSuperficie = (theta, s, off, escala, giro, inclina = 0, rnd = null) => {
    ponto(theta, s, off, _P, _N)
    if (inclina > 0 && rnd) { _N.x += (rnd() - 0.5) * inclina; _N.y += (rnd() - 0.5) * inclina; _N.z += (rnd() - 0.5) * inclina; _N.normalize() }
    _Q.setFromUnitVectors(_Y, _N)
    _Q2.setFromAxisAngle(_Y, giro); _Q.multiply(_Q2)
    if (typeof escala === 'number') _S.setScalar(escala); else _S.set(escala[0], escala[1], escala[2])
    return _M.compose(_P, _Q, _S)
  }
  const instanciado = (geo, mat, n, pai, nome) => {
    guardar(geo)
    const m = new THREE.InstancedMesh(geo, mat, n); m.name = nome
    pai.add(m)
    return m
  }

  /* =================== 3 · PORINAS (antes do LOS, para o LOS desviar delas) =================== */
  const pPorinas = novaParte('porinas', 'externa')
  const matPorina = gancho(new THREE.MeshStandardMaterial({ color: CORES.porinas, vertexColors: true, roughness: 0.38, metalness: 0.05, emissive: CORES.porinas, emissiveIntensity: 0.04, envMapIntensity: 1.0 }), { instancia: true, cunha: cunhas.membranaExterna })
  registrar('porinas', matPorina, { brilho: 0.25 })
  const iPorinas = instanciado(geoPorina(), matPorina, Q.porinas, pPorinas, 'porinas')
  const posPorinas = []
  {
    const rnd = mulberry32(301)
    for (let i = 0; i < Q.porinas; i++) {
      let th, s
      if (i === 0) { th = PHI0 + 139 * GRAU; s = sDeY(0.2) }
      else if (i < 9) { th = PHI0 + (131 + rnd() * 16) * GRAU; s = sDeY(-0.5 + rnd() * 1.0) }   // algumas na faixa exposta pelo corte
      else [th, s] = amostra(i * 3 + 1, rnd, 0.04)
      iPorinas.setMatrixAt(i, matrizNaSuperficie(th, s, -0.0035, 0.92 + rnd() * 0.3, rnd() * TAU))
      posPorinas.push(_P.clone())
      _C.setScalar(0.85 + rnd() * 0.3); iPorinas.setColorAt(i, _C)
    }
  }

  /* =================== 4 · LOS =================== */
  const pLOS = novaParte('los', 'externa')
  const matLOS = gancho(new THREE.MeshStandardMaterial({ color: CORES.los, vertexColors: true, roughness: 0.5, metalness: 0, emissive: CORES.los, emissiveIntensity: 0.04, envMapIntensity: 0.8 }), { instancia: true, cunha: cunhas.membranaExterna })
  registrar('los', matLOS, { brilho: 0.2 })
  const iLOS = instanciado(geoLOS(), matLOS, Q.los, pLOS, 'los')
  {
    const rnd = mulberry32(77)
    let n = 0, i = 0
    while (n < Q.los && i < Q.los * 3) {
      const [th, s] = amostra(i++, rnd, 0.012)
      ponto(th, s, 0, _P)
      let livre = true
      for (let k = 0; k < posPorinas.length; k++) if (posPorinas[k].distanceToSquared(_P) < 0.0017) { livre = false; break }
      if (!livre) continue
      const alt = 0.8 + rnd() * 0.55
      iLOS.setMatrixAt(n, matrizNaSuperficie(th, s, -0.002, [1, alt, 1], rnd() * TAU, 0.45, rnd))
      const v = rnd()
      _C.setRGB(0.86 + v * 0.26, 0.82 + rnd() * 0.3, 0.75 + (1 - v) * 0.5); iLOS.setColorAt(n, _C)
      n++
    }
    iLOS.count = n
  }

  /* =================== 5 · ADESINAS =================== */
  const pAdesinas = novaParte('adesinas', 'externa')
  const matAdesina = gancho(new THREE.MeshStandardMaterial({ color: CORES.adesinas, vertexColors: true, roughness: 0.42, metalness: 0, emissive: CORES.adesinas, emissiveIntensity: 0.04, envMapIntensity: 0.9 }), { instancia: true, cunha: cunhas.membranaExterna })
  registrar('adesinas', matAdesina, { brilho: 0.18 })
  const iAdesinas = instanciado(geoAdesina(), matAdesina, Q.adesinas, pAdesinas, 'adesinas')
  const ancoraAdesina = new THREE.Vector3()
  {
    const rnd = mulberry32(911)
    for (let i = 0; i < Q.adesinas; i++) {
      let th, s
      if (i === 0) { th = 8 * GRAU; s = sDeY(-0.32) } else [th, s] = amostra(i * 7 + 3, rnd, 0.08)
      const tipo = rnd()
      const esc = tipo < 0.45 ? [1, 1.12, 1] : tipo < 0.8 ? [1.15, 0.92, 1.15] : [0.9, 0.78, 0.9]   // HMW1/2 · Hia · Hap
      iAdesinas.setMatrixAt(i, matrizNaSuperficie(th, s, -0.004, esc, rnd() * TAU, 0.3, rnd))
      if (i === 0) { ponto(th, s, 0.165, ancoraAdesina) }
      _C.setScalar(0.85 + rnd() * 0.3); iAdesinas.setColorAt(i, _C)
    }
  }

  /* =================== 6 · PILI =================== */
  const pPili = novaParte('pili', 'externa')
  const matPili = gancho(new THREE.MeshStandardMaterial({ color: CORES.pili, roughness: 0.5, metalness: 0, emissive: CORES.pili, emissiveIntensity: 0.12 }), { instancia: true, cunha: cunhas.membranaExterna })
  registrar('pili', matPili, { brilho: 0.3 })
  const iPili = instanciado(geoPilus(), matPili, Q.pili, pPili, 'pili')
  const dadosPili = []
  const ancoraPili = new THREE.Vector3()
  {
    const rnd = mulberry32(1234)
    for (let i = 0; i < Q.pili; i++) {
      let th, s
      if (i === 0) { th = -28 * GRAU; s = ARC_H + ARC_C + 0.25 } else [th, s] = amostra(i * 5 + 2, rnd, 0.12)
      ponto(th, s, -0.004, _P, _N)
      _N.x += (rnd() - 0.5) * 0.5; _N.y += (rnd() - 0.5) * 0.5; _N.z += (rnd() - 0.5) * 0.5; _N.normalize()
      _Q.setFromUnitVectors(_Y, _N); _Q2.setFromAxisAngle(_Y, rnd() * TAU); _Q.multiply(_Q2)
      const comp = 0.5 + rnd() * 0.32
      dadosPili.push({ p: _P.clone(), q: _Q.clone(), e: new THREE.Vector3(0.75 + rnd() * 0.5, comp, 0.75 + rnd() * 0.5) })
      if (i === 0) ancoraPili.copy(_P).addScaledVector(_N, comp * 0.62)
    }
  }
  let piliAplicado = -1
  const aplicarPili = (v) => {
    if (Math.abs(v - piliAplicado) < 1e-4) return
    piliAplicado = v
    const f = suavizar(0, 1, v)
    for (let i = 0; i < dadosPili.length; i++) {
      const d = dadosPili[i]
      _S.set(d.e.x * (0.3 + 0.7 * f), d.e.y * f, d.e.z * (0.3 + 0.7 * f))
      if (Math.abs(_S.x) < 1e-4) _S.x = 1e-4
      iPili.setMatrixAt(i, _M.compose(d.p, d.q, _S))
    }
    iPili.instanceMatrix.needsUpdate = true
    pPili.visible = v > 0.01
  }

  /* =================== 7 · PEPTIDOGLICANO =================== */
  const pPG = novaParte('peptidoglicano', 'periplasma')
  const matPG = gancho(new THREE.MeshStandardMaterial({
    color: CORES.peptidoglicano, roughness: 0.55, metalness: 0, alphaMap: rede, alphaTest: 0.42, side: THREE.DoubleSide,
    emissive: CORES.peptidoglicano, emissiveIntensity: 0.14, envMapIntensity: 0.8, ...clip('peptidoglicano'),
  }))
  registrar('peptidoglicano', matPG, { brilho: 0.25 })
  novaMalha(geoCasca(grade, OFF.pgMeio), matPG, pPG, { cortada: true, nome: 'pg-rede' })
  const matPGTampa = gancho(matTampa(0x6fdc8f, { emissive: CORES.peptidoglicano, emissiveIntensity: 0.2 }))
  registrar('peptidoglicano', matPGTampa, { brilho: 0.25 })
  novaTampa('peptidoglicano', [{ ext: OFF.pgExt, int: OFF.pgInt }], 'ambos', 'peptidoglicano', matPGTampa, pPG)
  // periplasma: preenchimento escuro so na face rente, para as tres camadas lerem como faixas separadas
  const matPeri = gancho(matTampa(0x10201f, { roughness: 0.8, envMapIntensity: 0.3 }))
  registrar('peptidoglicano', matPeri)
  novaTampa('periplasma', [{ ext: OFF.meInt, int: OFF.pgExt }, { ext: OFF.pgInt, int: OFF.miExt }], 'rente', 'peptidoglicano', matPeri, pPG)

  /* =================== 8 · BETA-LACTAMASES =================== */
  const pBlac = novaParte('betaLactamase', 'periplasma')
  const matBlac = gancho(new THREE.MeshStandardMaterial({ color: CORES.betaLactamase, roughness: 0.4, metalness: 0, emissive: CORES.betaLactamase, emissiveIntensity: 0.1 }), { instancia: true, cunha: cunhas.peptidoglicano, agito: 0.0022 })
  registrar('betaLactamase', matBlac, { brilho: 0.35 })
  const geoBlob = geoGlobulo(0.0175, 5)
  const iBlac = instanciado(geoBlob, matBlac, Q.blac, pBlac, 'beta-lactamases')
  const ancoraBlac = new THREE.Vector3()
  {
    const rnd = mulberry32(4242)
    for (let i = 0; i < Q.blac; i++) {
      let th, s, off
      if (i < 11) { th = PHI0 + (113 + rnd() * 12) * GRAU; s = sDeY(-0.52 + i / 10 * 1.04 + (rnd() - 0.5) * 0.04); off = OFF.pgExt + 0.011 }  // sobre a faixa exposta do peptidoglicano
      else { [th, s] = amostra(i * 11 + 5, rnd, 0.1); off = rnd() < 0.6 ? OFF.pgExt + 0.009 : OFF.pgInt - 0.009 }
      iBlac.setMatrixAt(i, matrizNaSuperficie(th, s, off, 0.85 + rnd() * 0.35, rnd() * TAU, 1.5, rnd))
      if (i === 5) ancoraBlac.copy(_P)
    }
  }

  /* =================== 9 · MEMBRANA INTERNA =================== */
  const pMI = novaParte('membranaInterna', 'interna')
  const modC = new THREE.Color(0.62, 0.55, 0.5), modD = new THREE.Color(1.12, 1.1, 1.0)
  const matMI = gancho(new THREE.MeshStandardMaterial({
    color: CORES.membranaInterna, vertexColors: true, emissive: CORES.membranaInterna, emissiveIntensity: 0, roughness: 0.58, metalness: 0,
    normalMap: relevoMI.normal, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: relevoMI.orm, aoMap: relevoMI.orm,
    envMapIntensity: 0.85, ...clip('membranaInterna'),
  }))
  registrar('membranaInterna', matMI, { brilho: 0.12 })
  novaMalha(geoCasca(grade, OFF.miExt, { tinta: (m, c) => c.copy(modC).lerp(modD, suavizar(0.3, 0.72, m)) }), matMI, pMI, { cortada: true, nome: 'mi-ext' })
  const matMIInt = gancho(new THREE.MeshStandardMaterial({ color: 0x9a6a1c, roughness: 0.75, metalness: 0, envMapIntensity: 0.4, ...clip('membranaInterna') }))
  registrar('membranaInterna', matMIInt)
  novaMalha(geoCasca(gradeInt, OFF.miInt, { interna: true }), matMIInt, pMI, { cortada: true, nome: 'mi-int' })
  const matMITampa = gancho(matTampa(0xffbf47))
  registrar('membranaInterna', matMITampa)
  novaTampa('membranaInterna', [{ ext: OFF.miExt, int: OFF.miInt }], 'ambos', 'membranaInterna', matMITampa, pMI)

  /* =================== 10 · PBP3 (anel no sitio do septo) =================== */
  const pPBP3 = novaParte('pbp3', 'interna')
  const matPBP3 = gancho(new THREE.MeshStandardMaterial({ color: CORES.pbp3, roughness: 0.38, metalness: 0, emissive: CORES.pbp3, emissiveIntensity: 0.16 }), { instancia: true, cunha: cunhas.membranaInterna })
  registrar('pbp3', matPBP3, { brilho: 0.4 })
  const iPBP3 = instanciado(geoPBP3(), matPBP3, Q.pbp3, pPBP3, 'pbp3')
  {
    const rnd = mulberry32(606)
    const porFila = Q.pbp3 / 2
    for (let i = 0; i < Q.pbp3; i++) {
      const fila = i % 2
      const th = (Math.floor(i / 2) + fila * 0.5 + (rnd() - 0.5) * 0.3) / porFila * TAU
      const s = S_MEIO + (fila - 0.5) * 0.05 + (rnd() - 0.5) * 0.012
      iPBP3.setMatrixAt(i, matrizNaSuperficie(th, s, OFF.miExt - 0.002, 0.95 + rnd() * 0.25, rnd() * TAU, 0.25, rnd))
    }
  }

  /* =================== 11 · SEPTO =================== */
  const pSepto = novaParte('septo', 'interna')
  const SEG_S = 64
  const septoBase = new Float32Array(SEG_S + 1)
  for (let j = 0; j <= SEG_S; j++) { septoBase[j] = R0 + OFF.miInt + desloc(j / SEG_S * TAU, S_MEIO) - 0.004 }
  const geoSepto = guardar(new THREE.BufferGeometry())
  {
    const nv = (SEG_S + 1) * 6
    geoSepto.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3))
    geoSepto.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3))
    const idx = []
    for (let j = 0; j < SEG_S; j++) {
      const a = j * 6, b = (j + 1) * 6
      idx.push(a, a + 1, b, a + 1, b + 1, b)             // face de cima: [ext, int], normal +Y
      idx.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3) // face de baixo, normal -Y
      idx.push(a + 4, a + 5, b + 4, a + 5, b + 5, b + 4) // parede interna, normal para o eixo
    }
    geoSepto.setIndex(idx)
  }
  const matSepto = new THREE.MeshStandardMaterial({ color: CORES.septo, roughness: 0.55, metalness: 0, side: THREE.DoubleSide, emissive: CORES.septo, emissiveIntensity: 0.12 })
  registrar('septo', matSepto, { brilho: 0.3 })
  const malhaSepto = new THREE.Mesh(geoSepto, matSepto); malhaSepto.name = 'septo'; malhaSepto.visible = false; malhaSepto.frustumCulled = false
  pSepto.add(malhaSepto)
  let septoAplicado = -1
  const aplicarSepto = (dv) => {
    if (Math.abs(dv - septoAplicado) < 1e-4) return
    septoAplicado = dv
    malhaSepto.visible = dv > 0.01
    if (!malhaSepto.visible) return
    const k0 = 1 - 0.55 * dv, esp = 0.012 + 0.02 * dv, abre = 1 - 0.94 * suavizar(0, 1, dv)
    const p = geoSepto.attributes.position, n = geoSepto.attributes.normal
    for (let j = 0; j <= SEG_S; j++) {
      const th = j / SEG_S * TAU, c = Math.cos(th), s = Math.sin(th)
      const re = septoBase[j] * k0, ri = re * abre, b = j * 6
      p.setXYZ(b, re * c, esp, re * s); p.setXYZ(b + 1, ri * c, esp, ri * s)
      p.setXYZ(b + 2, re * c, -esp, re * s); p.setXYZ(b + 3, ri * c, -esp, ri * s)
      p.setXYZ(b + 4, ri * c, esp, ri * s); p.setXYZ(b + 5, ri * c, -esp, ri * s)
      n.setXYZ(b, 0, 1, 0); n.setXYZ(b + 1, 0, 1, 0); n.setXYZ(b + 2, 0, -1, 0); n.setXYZ(b + 3, 0, -1, 0)
      n.setXYZ(b + 4, -c, 0, -s); n.setXYZ(b + 5, -c, 0, -s)
    }
    p.needsUpdate = true; n.needsUpdate = true
  }

  /* =================== 12 · CITOPLASMA (volume: veu translucido nas faces do corte) =================== */
  const pCito = novaParte('citoplasma', 'nucleo')
  const matCito = gancho(new THREE.MeshBasicMaterial({ color: CORES.citoplasma, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }))
  registrar('citoplasma', matCito, { opApagada: 0.5, brilho: 0.0 })
  const malhaVeu = novaTampa('citoplasma', [{ ext: OFF.miInt - 0.001, int: null }], 'ambos', 'nucleo', matCito, pCito)
  malhaVeu.renderOrder = 3

  /* =================== 13 · RIBOSSOMOS =================== */
  const pRibo = novaParte('ribossomos', 'nucleo')
  const matRibo = gancho(new THREE.MeshStandardMaterial({ color: CORES.ribossomos, roughness: 0.45, metalness: 0, emissive: CORES.ribossomos, emissiveIntensity: 0.1, envMapIntensity: 0.8 }), { instancia: true, cunha: cunhas.nucleo, agito: 0.0045 })
  registrar('ribossomos', matRibo, { brilho: 0.3 })
  const iRibo = instanciado(geoRibossomo(0.0138, alta), matRibo, Q.ribo, pRibo, 'ribossomos')
  const RAIOS_NUC = [0.2, 0.6, 0.2]
  const ancoraRibo = new THREE.Vector3(), ancoraCito = new THREE.Vector3()
  {
    const rnd = mulberry32(2025)
    const margem = 0.02
    let n = 0, guarda = 0
    const e = new THREE.Euler()
    while (n < Q.ribo && guarda++ < Q.ribo * 40) {
      const x = (rnd() * 2 - 1) * 0.45, z = (rnd() * 2 - 1) * 0.45, y = (rnd() * 2 - 1) * 1.02
      const th = Math.atan2(z, x)
      let dentro
      if (Math.abs(y) <= H2) {
        dentro = Math.hypot(x, z) < R0 + OFF.miInt + desloc(th, sDeY(y)) - margem
      } else {
        const sy = Math.sign(y), dy = y - sy * H2, rr = Math.hypot(x, z), dist = Math.hypot(rr, dy)
        const alfa = Math.atan2(Math.abs(dy), rr)     // angulo a partir do equador da calota
        const s = sy > 0 ? ARC_H + ARC_C + alfa * R0 : ARC_H - alfa * R0
        dentro = dist < R0 + OFF.miInt + desloc(th, s) - margem
      }
      if (!dentro) continue
      // os ribossomos ficam fora da massa do nucleoide (borda difusa)
      const mN = Math.hypot(x / (RAIOS_NUC[0] * 1.12), y / (RAIOS_NUC[1] * 1.08), z / (RAIOS_NUC[2] * 1.12))
      if (mN < 0.86 + rnd() * 0.3) continue
      _P.set(x, y, z)
      e.set(rnd() * TAU, rnd() * TAU, rnd() * TAU); _Q.setFromEuler(e)
      _S.setScalar(0.82 + rnd() * 0.4)
      iRibo.setMatrixAt(n, _M.compose(_P, _Q, _S))
      // profundidade falsa: mais escuros perto do eixo, mais claros junto a membrana
      const prof = suavizar(0.12, 0.37, Math.hypot(x, z))
      const v = 0.42 + 0.72 * prof + (rnd() - 0.5) * 0.18
      _C.setRGB(v * (0.92 + rnd() * 0.12), v * (0.9 + rnd() * 0.1), v * 1.04); iRibo.setColorAt(n, _C)
      n++
    }
    iRibo.count = n
    ponto(PHI0 - 0.02, sDeY(0.45), OFF.miInt - 0.08, ancoraRibo)
    ponto(PHI0 - 0.02, sDeY(-0.5), OFF.miInt - 0.16, ancoraCito)
  }

  /* =================== 14 · NUCLEOIDE =================== */
  const pNuc = novaParte('nucleoide', 'nucleo')
  const matNuc = gancho(new THREE.MeshPhysicalMaterial({
    color: CORES.nucleoide, roughness: 0.36, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3,
    emissive: CORES.nucleoide, emissiveIntensity: 0.22, envMapIntensity: 1.0,
  }), { aperto: [0.97, 0.2] })
  registrar('nucleoide', matNuc, { brilho: 0.35 })
  {
    const curva = new CurvaNucleoide(8128, 58, RAIOS_NUC)
    const g = new THREE.TubeGeometry(curva, Q.nucSeg, 0.0108, Q.nucRad, true)
    g.deleteAttribute('uv')
    novaMalha(g, matNuc, pNuc, { nome: 'nucleoide' })
  }

  /* =================== 15 · PLASMIDEOS =================== */
  const pPlas = novaParte('plasmideo', 'nucleo')
  const matPlas = gancho(new THREE.MeshStandardMaterial({ color: CORES.plasmideo, roughness: 0.3, metalness: 0, emissive: CORES.plasmideo, emissiveIntensity: 0.45 }))
  registrar('plasmideo', matPlas, { brilho: 0.5 })
  const ancoraPlas = new THREE.Vector3()
  {
    const defs = [
      { r: 0.058, th: PHI0 + 30 * GRAU, rad: 0.285, y: 0.47, rot: [0.9, 0.2, 0.5] },
      { r: 0.042, th: PHI0 + 52 * GRAU, rad: 0.30, y: -0.56, rot: [1.3, 0.8, -0.3] },
      { r: 0.036, th: PHI0 + 200 * GRAU, rad: 0.28, y: 0.1, rot: [0.3, 1.1, 0.9] },
    ]
    const partesG = []
    defs.forEach((d, i) => {
      const g = new THREE.TubeGeometry(new CurvaPlasmideo(d.r, i * 1.7), 72, 0.0062, 6, true)
      g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...d.rot)))
      g.translate(Math.cos(d.th) * d.rad, d.y, Math.sin(d.th) * d.rad)
      partesG.push(g)
      if (i === 0) ancoraPlas.set(Math.cos(d.th) * d.rad, d.y, Math.sin(d.th) * d.rad)
    })
    const g = mergeGeometries(partesG, false); partesG.forEach((x) => x.dispose()); g.deleteAttribute('uv')
    novaMalha(g, matPlas, pPlas, { nome: 'plasmideos' })
  }

  /* =================== 16 · SECRECAO (protease de IgA1 + vesiculas de membrana externa) =================== */
  const pSec = novaParte('secrecao', 'externa')
  const matProt = new THREE.MeshStandardMaterial({ color: CORES.secrecao, roughness: 0.4, metalness: 0, emissive: CORES.secrecao, emissiveIntensity: 0.35 })
  registrar('secrecao', matProt, { brilho: 0.4 })
  const iProt = instanciado(geoBlob, matProt, Q.prot, pSec, 'protease-iga1')
  const matVes = new THREE.MeshPhysicalMaterial({ color: 0x27c9b5, roughness: 0.45, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.4, normalMap: relevoME.normal, normalScale: new THREE.Vector2(0.5, 0.5), emissive: 0x1fb8a6, emissiveIntensity: 0.08 })
  registrar('secrecao', matVes, { brilho: 0.2 })
  const geoVes = guardar(new THREE.SphereGeometry(1, 20, 14))
  const iVes = instanciado(geoVes, matVes, Q.ves, pSec, 'vesiculas')
  iProt.frustumCulled = false; iVes.frustumCulled = false
  pSec.visible = false
  const particulas = []
  {
    const rnd = mulberry32(5150)
    const nova = (tipo, i) => {
      const [th, s] = amostra(i * 13 + (tipo ? 4 : 9), rnd, 0.3)
      const base = new THREE.Vector3(), n = new THREE.Vector3()
      ponto(th, s, 0.0, base, n)
      const t = new THREE.Vector3(-Math.sin(th), 0.4 * (rnd() - 0.5), Math.cos(th)).normalize()
      return { tipo, base, n, t, fase: rnd(), vel: (tipo ? 0.07 : 0.16) * (0.75 + rnd() * 0.5), alcance: tipo ? 0.75 + rnd() * 0.4 : 1.1 + rnd() * 0.7, giro: rnd() * TAU, tam: tipo ? 0.034 + rnd() * 0.03 : 0.95 + rnd() * 0.5, ordem: rnd() }
    }
    for (let i = 0; i < Q.prot; i++) particulas.push(nova(0, i))
    for (let i = 0; i < Q.ves; i++) particulas.push(nova(1, i))
  }
  const _e2 = new THREE.Euler()
  const aplicarSecrecao = (v, t) => {
    pSec.visible = v > 0.01
    if (!pSec.visible) return
    let ip = 0, iv = 0
    for (const q of particulas) {
      const u = (q.fase + t * q.vel) % 1
      const ativo = suavizar(q.ordem * 0.85, q.ordem * 0.85 + 0.15, v)
      let esc, dist
      if (q.tipo === 0) {
        dist = 0.03 + q.alcance * Math.pow(u, 0.85)
        esc = suavizar(0, 0.08, u) * (1 - suavizar(0.72, 1, u)) * q.tam * ativo
      } else {
        // vesicula: brota colada a membrana, solta e deriva
        const brota = suavizar(0, 0.3, u)
        dist = q.tam * 0.6 * brota + q.alcance * Math.pow(Math.max(0, u - 0.3) / 0.7, 1.2)
        esc = brota * (1 - suavizar(0.8, 1, u)) * q.tam * ativo
      }
      _P.copy(q.base).addScaledVector(q.n, dist).addScaledVector(q.t, Math.sin(u * 5 + q.giro) * 0.06 * u)
      _e2.set(q.giro + t * 0.7, q.giro * 2 + t * 0.5, 0); _Q.setFromEuler(_e2)
      _S.setScalar(Math.max(esc, 1e-5))
      _M.compose(_P, _Q, _S)
      if (q.tipo === 0) iProt.setMatrixAt(ip++, _M); else iVes.setMatrixAt(iv++, _M)
    }
    iProt.instanceMatrix.needsUpdate = true; iVes.instanceMatrix.needsUpdate = true
  }

  /* =================== ancoras (pontos locais, celula montada) =================== */
  const ancoras = {}
  const anc = (chave, th, s, off) => { ancoras[chave] = ponto(th, s, off, new THREE.Vector3()) }
  anc('capsula', -18 * GRAU, sDeY(0.55), OFF.capsula)
  anc('membranaExterna', PHI0 + 139 * GRAU, sDeY(0.42), OFF.meExt)
  anc('los', PHI0 + 139 * GRAU, sDeY(-0.22), 0.045)
  ancoras.porinas = posPorinas[0].clone()
  ancoras.adesinas = ancoraAdesina
  ancoras.pili = ancoraPili
  anc('peptidoglicano', PHI0 + 119 * GRAU, sDeY(0.12), OFF.pgMeio)
  ancoras.betaLactamase = ancoraBlac
  anc('membranaInterna', PHI0 + 100 * GRAU, sDeY(-0.38), OFF.miExt)
  anc('pbp3', PHI0 + 100 * GRAU, S_MEIO, OFF.miExt + 0.025)
  ancoras.citoplasma = ancoraCito
  ancoras.ribossomos = ancoraRibo
  ancoras.nucleoide = new THREE.Vector3(Math.cos(PHI0 + 36 * GRAU) * 0.13, 0.12, Math.sin(PHI0 + 36 * GRAU) * 0.13)
  ancoras.plasmideo = ancoraPlas
  anc('septo', PHI0 + 100 * GRAU, S_MEIO, OFF.miExt)
  anc('secrecao', -40 * GRAU, sDeY(-0.1), 0.42)

  /* =================== sincronismo dos planos de corte (espaco de mundo) =================== */
  let quadroPlanos = -1
  const sincronizarPlanos = (r) => {
    const f = r ? r.info.render.frame : -2
    if (f === quadroPlanos) return
    quadroPlanos = f
    planoRente.mundo.copy(planoRente.local).applyMatrix4(grupo.matrixWorld)
    for (const k in planosDegrau) planosDegrau[k].mundo.copy(planosDegrau[k].local).applyMatrix4(grupo.matrixWorld)
  }
  malhasCortadas.forEach((m) => { m.onBeforeRender = (r) => sincronizarPlanos(r) })

  /* =================== estado =================== */
  const estado = { corte: 0, explodir: 0, capsula: 1, pili: 1, energia: 1, divisao: 0, secrecao: 0, destaque: null }
  const suave = { corte: 0, explodir: 0, capsula: 1, pili: 1, energia: 1, divisao: 0, secrecao: 0 }
  const fator = {}
  for (const k in partes) fator[k] = 1
  let corteAplicado = -1

  const aplicarCorte = (v) => {
    if (Math.abs(v - corteAplicado) < 1e-5) return
    corteAplicado = v
    const c = suavizar(0, 1, v)
    for (const k in LARGURA) {
      const larg = LARGURA[k] * c
      cunhas[k].value.set(PHI0, larg)
      const phi = PHI0 + larg
      planosDegrau[k].local.normal.set(-Math.sin(phi), 0, Math.cos(phi))
    }
    const aberto = v > 0.003
    for (const t of tampas) {
      t.malha.visible = aberto
      if (aberto) t.tampa.degrau(PHI0 + LARGURA[t.larguraK] * c)
    }
    quadroPlanos = -1
  }

  const _cor = new THREE.Color(), _frio = new THREE.Color(), _apag = new THREE.Color()
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  const aplicarCores = (en, haDestaque) => {
    for (const r of registro) {
      const f = fator[r.chave]
      const m = r.mat
      _cor.copy(r.cor)
      if (en < 0.999) { const l = lum(_cor); _frio.setRGB(l * 0.55, l * 0.68, l * 0.9); _cor.lerp(_frio, (1 - en) * 0.78) }
      if (!r.manterCor && f < 0.999) { const l = lum(_cor); _apag.setRGB(l * 0.17 + 0.004, l * 0.16 + 0.004, l * 0.15 + 0.004); _apag.lerp(_cor, f * f); _cor.copy(_apag) }
      m.color.copy(_cor)
      if (r.emissivo) {
        const pleno = haDestaque ? Math.max(0, f - 0.5) * 2 : 0
        m.emissive.copy(r.emissivo)
        m.emissiveIntensity = (r.eInt * (0.12 + 0.88 * en) + r.brilho * pleno) * f * f
      }
      let op = r.opacidade
      if (r.opApagada !== null) op = r.opApagada + (r.opacidade - r.opApagada) * f
      m.opacity = op * r.presenca
    }
  }

  function atualizar(dt = 0.016, t = 0) {
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 10)
    for (const c in suave) {
      const alvo = Math.min(1, Math.max(0, Number(estado[c]) || 0))
      suave[c] += (alvo - suave[c]) * k
      if (Math.abs(alvo - suave[c]) < 1e-4) suave[c] = alvo
    }
    comuns.uTempo.value = t
    comuns.uAgito.value = suave.energia
    comuns.uDiv.value = suavizar(0, 1, suave.divisao)

    aplicarCorte(suave.corte)

    const ex = suavizar(0, 1, suave.explodir)
    for (const c in EXPLODE) camadas[c].position.y = EXPLODE[c] * ex
    malhaCapsulaInt.visible = ex > 0.01 && suave.corte > 0.003
    malhaMEInt.visible = ex > 0.01 && suave.corte > 0.003

    const cap = suave.capsula
    pCapsula.visible = cap > 0.01
    regCapsula.presenca = cap; regCapsulaInt.presenca = 1; regCapsulaTampa.presenca = cap
    matCapsulaTampa.transparent = true

    aplicarPili(suave.pili)
    aplicarSepto(suave.divisao)
    aplicarSecrecao(suave.secrecao, t)

    const alvoD = estado.destaque && partes[estado.destaque] ? estado.destaque : null
    const kd = 1 - Math.exp(-Math.min(dt, 0.1) * 7)
    for (const c in fator) {
      const a = alvoD === null || alvoD === c ? 1 : 0
      fator[c] += (a - fator[c]) * kd
      if (Math.abs(a - fator[c]) < 1e-3) fator[c] = a
    }
    aplicarCores(suave.energia, alvoD !== null)
    // nucleoide "respira" quando a celula esta ativa
    matNuc.emissiveIntensity *= 0.9 + 0.1 * Math.sin(t * 1.4)

    grupo.updateWorldMatrix(true, false)
    quadroPlanos = -1
    sincronizarPlanos(null)
    quadroPlanos = -1
  }

  let rtAmbiente = null
  if (renderer) rtAmbiente = criarAmbiente(renderer)

  function dispose() {
    descartaveis.forEach((x) => x.dispose && x.dispose())
    ;[iPorinas, iLOS, iAdesinas, iPili, iBlac, iPBP3, iRibo, iProt, iVes].forEach((m) => m.dispose())
    if (rtAmbiente) rtAmbiente.dispose()
    grupo.removeFromParent()
  }

  atualizar(0, 0)

  return {
    grupo, partes, ancoras, estado, atualizar, dispose,
    ambiente: rtAmbiente ? rtAmbiente.texture : null,
    cores: { ...CORES },
    medidas: { comprimento: 2 * (R0 + H2), largura: 2 * R0, razao: (R0 + H2) / R0, comprimentoComCapsula: 2 * (R0 + H2 + OFF.capsula) },
    qualidade: alta ? 'alta' : 'media',
  }
}
