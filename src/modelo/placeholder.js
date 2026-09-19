// Modelo de reserva: cumpre o contrato (docs/CONTRATO-MODELO.md) de forma simples, para o motor
// funcionar enquanto a variante definitiva nao e escolhida. Multicolorido, com corte por clipping planes.
import * as THREE from 'three'

const COR = {
  capsula: '#eadfc8', membranaExterna: '#1fb8a6', los: '#ff7a45', porinas: '#4c8dff', adesinas: '#d4e157',
  pili: '#f5e6a3', peptidoglicano: '#58c17a', betaLactamase: '#ff5a3c', membranaInterna: '#f2b441',
  pbp3: '#e0247b', citoplasma: '#2a2350', ribossomos: '#9a8cff', nucleoide: '#c86bfa', plasmideo: '#22e8e0',
  septo: '#f2b441', secrecao: '#ff4d5a',
}
const R = 0.55, L = 1.1 // raio e comprimento do cilindro: corpo total = L + 2R = 2.2

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

// ponto na superficie de uma capsula (raio r), com normal
function pontoCapsula(rand, r, l = L) {
  const areaCil = 2 * Math.PI * r * l, areaEsf = 4 * Math.PI * r * r
  const p = new THREE.Vector3(), n = new THREE.Vector3()
  if (rand() < areaCil / (areaCil + areaEsf)) {
    const a = rand() * Math.PI * 2, y = (rand() - 0.5) * l
    n.set(Math.cos(a), 0, Math.sin(a)); p.copy(n).multiplyScalar(r).setY(y)
  } else {
    const u = rand() * 2 - 1, a = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u)
    n.set(s * Math.cos(a), u, s * Math.sin(a)); p.copy(n).multiplyScalar(r); p.y += Math.sign(u) * l / 2
  }
  return { p, n }
}
function pontoDentro(rand, r, l = L) {
  for (;;) {
    const p = new THREE.Vector3((rand() * 2 - 1) * r, (rand() * 2 - 1) * (l / 2 + r), (rand() * 2 - 1) * r)
    const dy = Math.max(0, Math.abs(p.y) - l / 2)
    if (p.x * p.x + p.z * p.z + dy * dy < r * r) return p
  }
}

export async function criarBacilo() {
  const grupo = new THREE.Group()
  const partes = {}, ancoras = {}, base = new Map()
  const rand = rng(7)
  // planos de corte: uma cunha (uniao de dois semi-espacos recortados)
  const planoA = new THREE.Plane(new THREE.Vector3(1, 0, 0), 10), planoB = new THREE.Plane(new THREE.Vector3(0, 0, 1), 10)
  const planos = [planoA, planoB]

  const registra = (chave, obj, mat) => {
    obj.name = chave; partes[chave] = obj; grupo.add(obj)
    const mats = mat ? [mat] : []
    base.set(chave, mats.map((m) => ({ m, cor: m.color.clone(), em: m.emissive ? m.emissive.clone() : null, op: m.opacity })))
  }
  const casca = (chave, r, cor, op, extra = {}) => {
    const m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.45, metalness: 0, transparent: op < 1, opacity: op, side: THREE.DoubleSide,
      clippingPlanes: planos, clipIntersection: true, emissive: cor, emissiveIntensity: 0.06, ...extra })
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 24, 64), m)
    registra(chave, mesh, m); return mesh
  }
  casca('capsula', R + 0.2, COR.capsula, 0.2, { roughness: 0.15, depthWrite: false, clearcoat: 1 })
  casca('membranaExterna', R, COR.membranaExterna, 1, { clearcoat: 0.5 })
  const pg = casca('peptidoglicano', R - 0.035, COR.peptidoglicano, 1); pg.material.wireframe = true
  casca('membranaInterna', R - 0.07, COR.membranaInterna, 1)
  casca('citoplasma', R - 0.09, COR.citoplasma, 0.35, { depthWrite: false })
  partes.septo = partes.membranaInterna

  const instancia = (chave, geo, cor, n, fn, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5, emissive: cor, emissiveIntensity: 0.25, clippingPlanes: planos, clipIntersection: true, ...extra })
    const im = new THREE.InstancedMesh(geo, m, n), o = new THREE.Object3D()
    for (let i = 0; i < n; i++) { fn(o, i); o.updateMatrix(); im.setMatrixAt(i, o.matrix) }
    registra(chave, im, m); return im
  }
  const cima = new THREE.Vector3(0, 1, 0)
  instancia('los', new THREE.CylinderGeometry(0.006, 0.006, 0.05, 5), COR.los, 2600, (o) => { const { p, n } = pontoCapsula(rand, R + 0.02); o.position.copy(p); o.quaternion.setFromUnitVectors(cima, n) })
  instancia('porinas', new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), COR.porinas, 320, (o) => { const { p, n } = pontoCapsula(rand, R); o.position.copy(p); o.quaternion.setFromUnitVectors(cima, n) })
  instancia('adesinas', new THREE.CylinderGeometry(0.011, 0.016, 0.16, 6), COR.adesinas, 90, (o) => { const { p, n } = pontoCapsula(rand, R + 0.07); o.position.copy(p); o.quaternion.setFromUnitVectors(cima, n) })
  instancia('betaLactamase', new THREE.IcosahedronGeometry(0.02, 1), COR.betaLactamase, 60, (o) => { o.position.copy(pontoCapsula(rand, R - 0.035).p) })
  instancia('ribossomos', new THREE.IcosahedronGeometry(0.016, 0), COR.ribossomos, 2200, (o) => { o.position.copy(pontoDentro(rand, R - 0.12)) })
  instancia('pbp3', new THREE.IcosahedronGeometry(0.028, 1), COR.pbp3, 28, (o, i) => { const a = i / 28 * Math.PI * 2; o.position.set(Math.cos(a) * (R - 0.07), 0, Math.sin(a) * (R - 0.07)) })

  // pili: tubos finos e curvos
  const piliG = new THREE.Group(), matPili = new THREE.MeshStandardMaterial({ color: COR.pili, roughness: 0.6, emissive: COR.pili, emissiveIntensity: 0.2, transparent: true })
  for (let i = 0; i < 34; i++) {
    const { p, n } = pontoCapsula(rand, R)
    const t = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.25)
    const c = new THREE.CatmullRomCurve3([p, p.clone().addScaledVector(n, 0.3).add(t), p.clone().addScaledVector(n, 0.62).addScaledVector(t, 2.2)])
    piliG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 10, 0.006, 5), matPili))
  }
  registra('pili', piliG, matPili)

  // nucleoide: passeio aleatorio suavizado, confinado ao centro
  const pts = []; let q = new THREE.Vector3()
  for (let i = 0; i < 260; i++) { q.add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.22)); q.x *= 0.86; q.z *= 0.86; q.y *= 0.95; pts.push(q.clone()) }
  const matN = new THREE.MeshStandardMaterial({ color: COR.nucleoide, roughness: 0.35, emissive: COR.nucleoide, emissiveIntensity: 0.35, clippingPlanes: [], })
  registra('nucleoide', new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 1400, 0.014, 6, true), matN), matN)
  const matP = new THREE.MeshStandardMaterial({ color: COR.plasmideo, roughness: 0.3, emissive: COR.plasmideo, emissiveIntensity: 0.6 })
  const plas = new THREE.Group()
  ;[[0.2, 0.62, 0.12], [-0.18, -0.66, -0.1]].forEach(([x, y, z], i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.009, 8, 40), matP); t.position.set(x, y, z); t.rotation.set(i + 0.6, 0.4, 0.2); plas.add(t) })
  registra('plasmideo', plas, matP)

  // secrecao: particulas que saem da superficie
  const NS = 140, geoS = new THREE.BufferGeometry(), posS = new Float32Array(NS * 3), sem = []
  for (let i = 0; i < NS; i++) sem.push({ ...pontoCapsula(rand, R + 0.05), f: rand() })
  geoS.setAttribute('position', new THREE.BufferAttribute(posS, 3))
  const matS = new THREE.PointsMaterial({ color: COR.secrecao, size: 0.05, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
  registra('secrecao', new THREE.Points(geoS, matS), matS)

  Object.assign(ancoras, {
    capsula: new THREE.Vector3(R + 0.2, 0.35, 0), membranaExterna: new THREE.Vector3(R, -0.1, 0), los: new THREE.Vector3(0, L / 2 + R, 0).setX(0.12),
    porinas: new THREE.Vector3(R * 0.7, -0.45, R * 0.7), adesinas: new THREE.Vector3(-R - 0.1, 0.2, 0), pili: new THREE.Vector3(-R - 0.4, -0.5, 0.1),
    peptidoglicano: new THREE.Vector3(R - 0.035, 0.55, 0), betaLactamase: new THREE.Vector3(R - 0.035, -0.6, 0), membranaInterna: new THREE.Vector3(R - 0.07, 0.15, 0),
    pbp3: new THREE.Vector3(R - 0.07, 0, 0), citoplasma: new THREE.Vector3(0.3, -0.3, 0.1), ribossomos: new THREE.Vector3(0.28, 0.75, 0.1),
    nucleoide: new THREE.Vector3(0, 0, 0), plasmideo: new THREE.Vector3(0.2, 0.62, 0.12), septo: new THREE.Vector3(R, 0, 0), secrecao: new THREE.Vector3(-R - 0.3, 0.7, 0),
  })

  const estado = { corte: 0, explodir: 0, capsula: 1, pili: 1, energia: 1, divisao: 0, secrecao: 0, destaque: null }
  const suave = { corte: 0, explodir: 0, capsula: 1, pili: 1, energia: 1, divisao: 0, secrecao: 0, foco: 0 }
  const cinza = new THREE.Color('#2b2722'), tmp = new THREE.Color()
  const ORDEM = ['capsula', 'membranaExterna', 'peptidoglicano', 'membranaInterna', 'citoplasma']

  function atualizar(dt, t) {
    const k = 1 - Math.exp(-dt * 6)
    for (const c of ['corte', 'explodir', 'capsula', 'pili', 'energia', 'divisao', 'secrecao']) suave[c] += (estado[c] - suave[c]) * k
    suave.foco += ((estado.destaque ? 1 : 0) - suave.foco) * k
    // corte: os planos entram ate o eixo (cunha de 90 graus no quadrante +x +z)
    const d = THREE.MathUtils.lerp(2, 0, suave.corte); planoA.constant = d; planoB.constant = d
    // explodir: cascas crescem em escala, de fora para dentro
    ORDEM.forEach((c, i) => partes[c].scale.setScalar(1 + suave.explodir * (ORDEM.length - 1 - i) * 0.16))
    ;['los', 'porinas', 'adesinas'].forEach((c) => partes[c].scale.copy(partes.membranaExterna.scale))
    partes.betaLactamase.scale.copy(partes.peptidoglicano.scale); partes.pbp3.scale.copy(partes.membranaInterna.scale)
    partes.pili.scale.copy(partes.membranaExterna.scale)
    partes.capsula.visible = suave.capsula > 0.02; partes.pili.visible = suave.pili > 0.02; matPili.opacity = suave.pili
    // divisao: constricao simples no eixo (escala nao uniforme nao faz halter; aqui so sinaliza)
    grupo.scale.set(1, 1 + suave.divisao * 0.25, 1)
    // destaque + energia
    for (const [chave, lista] of base) for (const b of lista) {
      const apagado = estado.destaque && estado.destaque !== chave
      const alvo = apagado ? suave.foco : 0
      tmp.copy(b.cor).lerp(cinza, alvo * 0.88); b.m.color.copy(tmp)
      if (b.em) { b.m.emissive.copy(b.em).lerp(cinza, alvo); b.m.emissiveIntensity = (apagado ? 0.02 : 0.3) * (0.25 + 0.75 * suave.energia) }
      let op = b.op * (apagado ? 1 - 0.75 * suave.foco : 1)
      if (chave === 'capsula') op *= suave.capsula
      if (chave === 'secrecao') op = suave.secrecao
      if (b.m.transparent) b.m.opacity = op
    }
    if (suave.secrecao > 0.01) {
      for (let i = 0; i < NS; i++) { const s = sem[i], f = (t * 0.18 + s.f) % 1; posS[i * 3] = s.p.x + s.n.x * f * 1.6; posS[i * 3 + 1] = s.p.y + s.n.y * f * 1.6; posS[i * 3 + 2] = s.p.z + s.n.z * f * 1.6 }
      geoS.attributes.position.needsUpdate = true
    }
  }
  return { grupo, partes, ancoras, estado, atualizar, dispose() {}, cores: COR }
}
