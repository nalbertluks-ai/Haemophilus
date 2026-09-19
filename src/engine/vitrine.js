// Vitrine de especies: quatro organismos lado a lado, girando devagar, como uma linha de produtos.
// Sao modelos leves (so exterior). O modelo detalhado continua sendo o H. influenzae do palco.
import * as THREE from 'three'
import gsap from 'gsap'

const ITENS = [
  { nome: '<em>H. influenzae</em> tipo b', sub: 'capsulado · invasivo', cor: '#1fb8a6' },
  { nome: '<em>H. influenzae</em> não tipável', sub: 'sem cápsula · mucosas', cor: '#1fb8a6' },
  { nome: '<em>H. ducreyi</em>', sub: 'cadeias paralelas · cancro mole', cor: '#e0247b' },
  { nome: '<em>H. parainfluenzae</em>', sub: 'comensal · grupo HACEK', cor: '#f2b441' },
]

export function criarVitrine(cena) {
  const grupo = new THREE.Group(); cena.scene.add(grupo)
  const mats = []
  const mat = (cor, extra = {}) => { const m = new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.4, emissive: cor, emissiveIntensity: 0.08, transparent: true, ...extra }); mats.push(m); return m }
  const celula = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 16, 40), m)
  const pecas = ITENS.map(() => { const g = new THREE.Group(); grupo.add(g); return g })

  // 1. Hib: corpo + capsula perolada + pili
  { const g = pecas[0]; g.add(celula(0.3, 0.6, mat('#1fb8a6')))
    g.add(celula(0.42, 0.62, mat('#eadfc8', { opacity: 0.22, roughness: 0.1, depthWrite: false, emissiveIntensity: 0.02 })))
    const mp = mat('#f5e6a3', { emissiveIntensity: 0.3 })
    for (let i = 0; i < 18; i++) { const a = i * 2.4, y = (i / 17 - 0.5) * 1.0, n = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), p = n.clone().multiplyScalar(0.3).setY(y)
      const c = new THREE.CatmullRomCurve3([p, p.clone().addScaledVector(n, 0.22).add(new THREE.Vector3(0, 0.06, 0)), p.clone().addScaledVector(n, 0.42).add(new THREE.Vector3(0.05, 0.14, 0))]); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 8, 0.006, 5), mp)) } }
  // 2. NTHi: corpo + adesinas curtas
  { const g = pecas[1]; g.add(celula(0.3, 0.6, mat('#1fb8a6'))); const ma = mat('#d4e157', { emissiveIntensity: 0.3 })
    for (let i = 0; i < 46; i++) { const a = i * 2.4, y = (i / 45 - 0.5) * 0.95, n = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.1, 5), ma); s.position.copy(n).multiplyScalar(0.34).setY(y); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); g.add(s) } }
  // 3. H. ducreyi: bastonetes delgados em cadeias paralelas ("cardume de peixes")
  { const g = pecas[2], m = mat('#e0247b')
    for (let c = 0; c < 3; c++) for (let i = 0; i < 4; i++) { const b = celula(0.085, 0.3, m); b.position.set((c - 1) * 0.3 + Math.sin(i * 0.9 + c) * 0.05, (i - 1.5) * 0.52, (c - 1) * 0.12); b.rotation.z = Math.sin(i + c) * 0.12; g.add(b) } }
  // 4. H. parainfluenzae: pequeno e pleomorfico
  { const g = pecas[3], m = mat('#f2b441'); [[0, 0.3, 0.2, 0.5, 0.2], [0.34, -0.3, 0.17, 0.2, -0.5], [-0.34, -0.2, 0.19, 0.75, 0.9]].forEach(([x, y, r, l, rz]) => { const b = celula(r, l, m); b.position.set(x, y, 0); b.rotation.z = rz; g.add(b) }) }

  // rotulos em DOM, sob cada peca
  const camada = document.querySelector('#rotulos')
  const rot = ITENS.map((it) => { const el = document.createElement('div'); el.className = 'rotulo3d'; el.style.cssText = 'border:0;padding:0;text-align:center;text-transform:none;letter-spacing:0;font-size:0.9em;font-weight:600'; el.innerHTML = `${it.nome}<small>${it.sub}</small>`; camada.appendChild(el); return el })

  /** textos sob cada peca, vindos do conteudo: [[nome, descricao], ...] */
  function textos(lista) { lista.slice(0, rot.length).forEach(([n, d], i) => { rot[i].style.whiteSpace = 'normal'; rot[i].style.width = '17em'; rot[i].innerHTML = `${n}<small style="margin-top:6px;line-height:1.4">${d}</small>` }) }
  const estado = { v: 0, foco: -1 }
  const s = { v: 0, x: ITENS.map((_, i) => (i - 1.5) * 2.2), e: ITENS.map(() => 1), o: ITENS.map(() => 1) }
  const v3 = new THREE.Vector3()
  function definir({ v = 0, foco = -1, focoX = 0 } = {}, dur = 1.3) {
    estado.v = v; estado.foco = foco
    gsap.to(s, { v, duration: dur * 0.8, ease: 'power2.inOut' })
    ITENS.forEach((_, i) => {
      const focado = foco === i, algum = foco >= 0
      gsap.to(s.x, { [i]: algum ? (focado ? focoX : (i < foco ? -7 : 7)) : (i - 1.5) * 2.2, duration: dur, ease: 'power3.inOut' })
      gsap.to(s.e, { [i]: focado ? 2.1 : 1, duration: dur, ease: 'power3.inOut' })
      gsap.to(s.o, { [i]: algum && !focado ? 0 : 1, duration: dur * 0.7 })
    })
  }
  function atualizar(dt) {
    grupo.visible = s.v > 0.01; if (!grupo.visible) { rot.forEach((el) => { el.style.opacity = 0 }); return }
    let k = 0
    pecas.forEach((g, i) => {
      g.position.set(s.x[i], -0.15, 0); g.scale.setScalar(s.e[i] * (0.6 + 0.4 * s.v)); g.rotation.y += dt * 0.35; g.rotation.z = 0.35
      v3.set(s.x[i], -0.15 - 1.15 * s.e[i], 0).project(cena.camera)
      const el = rot[i]; el.style.opacity = s.v * s.o[i] * (estado.foco >= 0 ? 0 : 1)
      el.style.transform = `translate(${(v3.x + 1) / 2 * innerWidth - el.offsetWidth / 2}px, ${(1 - v3.y) / 2 * innerHeight}px)`
    })
    for (const m of mats) { /* opacidade por peca: aplicada por grupo abaixo */ k++ }
    pecas.forEach((g, i) => g.traverse((o) => { if (o.material) { const basePerola = o.material.roughness === 0.1; o.material.opacity = (basePerola ? 0.22 : 1) * s.v * s.o[i] } }))
  }
  gsap.ticker.add(() => atualizar(gsap.ticker.deltaRatio() / 60))
  return { definir, estado, textos }
}
