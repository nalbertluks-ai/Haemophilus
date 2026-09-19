// Demo da variante A: cria renderer, camera, luzes de estudio, arrastar com inercia e o painel de estado.
// Parametros de URL: ?q=media (qualidade) · ?tm=aces|neutro|agx (tone mapping) · ?auto=0
import * as THREE from 'three'
import { criarBacilo } from '/src/modelo/variante-a.js'

const url = new URLSearchParams(location.search)
const qualidade = url.get('q') === 'media' ? 'media' : 'alta'
const canvas = document.getElementById('cena')

let renderer
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
} catch (e) {
  const a = document.getElementById('aviso'); a.style.display = 'grid'; a.textContent = 'WebGL não disponível neste navegador.'
  throw e
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = { aces: THREE.ACESFilmicToneMapping, agx: THREE.AgXToneMapping, neutro: THREE.NeutralToneMapping }[url.get('tm')] ?? THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.transmissionResolutionScale = 0.6   // a capsula e fosca: o passe de transmissao nao precisa de resolucao cheia

const cena = new THREE.Scene()
cena.background = new THREE.Color(0x12100e)
const camera = new THREE.PerspectiveCamera(26, window.innerWidth / window.innerHeight, 0.1, 60)

// luz principal quente, contraluz fria, preenchimento fraco
const principal = new THREE.DirectionalLight(0xffdcb8, 3.1); principal.position.set(-3.2, 4.2, 5.0)
const contra = new THREE.DirectionalLight(0x86b4ff, 3.4); contra.position.set(4.2, 1.6, -5.0)
const contra2 = new THREE.DirectionalLight(0xffb070, 1.2); contra2.position.set(-4.5, -2.5, -3.5)
const preench = new THREE.DirectionalLight(0xffe9d2, 0.45); preench.position.set(3.0, -2.0, 4.0)
cena.add(principal, contra, contra2, preench, new THREE.HemisphereLight(0x2a2622, 0x0c0a08, 0.6))

const t0 = performance.now()
const bacilo = await criarBacilo({ renderer, qualidade })
const tCriacao = performance.now() - t0
if (bacilo.ambiente) { cena.environment = bacilo.ambiente; cena.environmentIntensity = 0.85 }

// palco (arrasto) > pose (inclinacao de estudio) > giro (rotacao lenta no eixo longo) > modelo
const palco = new THREE.Group(), pose = new THREE.Group(), giro = new THREE.Group()
pose.rotation.set(0.16, 0, -0.5)
giro.rotation.y = -0.42
giro.add(bacilo.grupo); pose.add(giro); palco.add(pose); cena.add(palco)

/* ---------------- camera e enquadramento ---------------- */
const vista = { dist: 7.6, distAlvo: 7.6, desloc: 0 }
function enquadrar() {
  const w = window.innerWidth, h = window.innerHeight
  camera.aspect = w / h
  // o painel ocupa a direita: desloca o centro optico para a area livre
  const livre = w > 860 ? (w - 312) / w : 1
  camera.setViewOffset(w, h, (1 - livre) * w * 0.5, 0, w, h)
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h, false)
}
enquadrar()
addEventListener('resize', enquadrar)

/* ---------------- arrastar para girar, com inercia ---------------- */
const arrasto = { ativo: false, x: 0, y: 0, vx: 0, vy: 0 }
const eixoX = new THREE.Vector3(1, 0, 0), eixoY = new THREE.Vector3(0, 1, 0), qTmp = new THREE.Quaternion()
function girarPalco(dx, dy) {
  qTmp.setFromAxisAngle(eixoY, dx); palco.quaternion.premultiply(qTmp)
  qTmp.setFromAxisAngle(eixoX, dy); palco.quaternion.premultiply(qTmp)
}
canvas.addEventListener('pointerdown', (e) => { arrasto.ativo = true; arrasto.x = e.clientX; arrasto.y = e.clientY; arrasto.vx = arrasto.vy = 0; canvas.setPointerCapture(e.pointerId); canvas.classList.add('arrastando') })
canvas.addEventListener('pointermove', (e) => {
  if (!arrasto.ativo) return
  const dx = (e.clientX - arrasto.x) * 0.0062, dy = (e.clientY - arrasto.y) * 0.0062
  arrasto.x = e.clientX; arrasto.y = e.clientY
  girarPalco(dx, dy)
  arrasto.vx = dx * 60; arrasto.vy = dy * 60
})
const soltar = () => { arrasto.ativo = false; canvas.classList.remove('arrastando') }
canvas.addEventListener('pointerup', soltar); canvas.addEventListener('pointercancel', soltar)
canvas.addEventListener('wheel', (e) => { e.preventDefault(); vista.distAlvo = THREE.MathUtils.clamp(vista.distAlvo * Math.exp(e.deltaY * 0.0011), 1.6, 16) }, { passive: false })

/* ---------------- painel ---------------- */
const CAMPOS = [
  ['corte', 'Corte', 'cunha removida, camadas em degraus'],
  ['explodir', 'Vista explodida', 'camadas telescopadas no eixo longo'],
  ['capsula', 'Cápsula', '1 = tipo b · 0 = não tipável'],
  ['pili', 'Pili', ''],
  ['energia', 'Energia', '0 = sem fatores X e V'],
  ['divisao', 'Divisão', 'constrição e septo'],
  ['secrecao', 'Secreção', 'protease de IgA1 e vesículas'],
]
const NOMES = {
  capsula: 'Cápsula (PRP)', membranaExterna: 'Membrana externa', los: 'LOS', porinas: 'Porinas P2',
  adesinas: 'Adesinas', pili: 'Pili', peptidoglicano: 'Peptidoglicano', betaLactamase: 'Beta-lactamase',
  membranaInterna: 'Membrana interna', pbp3: 'PBP3 (FtsI)', citoplasma: 'Citoplasma', ribossomos: 'Ribossomos',
  nucleoide: 'Nucleoide', plasmideo: 'Plasmídeo', septo: 'Septo', secrecao: 'Protease de IgA1',
}
const fmt = (v) => v.toFixed(2).replace('.', ',')
const entradas = {}
const elControles = document.getElementById('controles')
for (const [chave, nome, nota] of CAMPOS) {
  const d = document.createElement('div'); d.className = 'ctl'
  d.innerHTML = `<div class="top"><span>${nome}</span><span></span></div><input type="range" min="0" max="1" step="0.01">${nota ? `<small>${nota}</small>` : ''}`
  const inp = d.querySelector('input'), val = d.querySelector('.top span:last-child')
  inp.value = bacilo.estado[chave]; val.textContent = fmt(bacilo.estado[chave])
  inp.addEventListener('input', () => { bacilo.estado[chave] = parseFloat(inp.value); val.textContent = fmt(bacilo.estado[chave]) })
  entradas[chave] = { inp, val }
  elControles.appendChild(d)
}
const elEstr = document.getElementById('estruturas')
const botoes = {}
function marcarDestaque(chave) {
  bacilo.estado.destaque = chave
  for (const k in botoes) botoes[k].classList.toggle('ativo', k === String(chave))
}
{
  const b = document.createElement('button'); b.className = 'todos ativo'; b.textContent = 'Sem destaque'
  b.addEventListener('click', () => marcarDestaque(null)); botoes.null = b; elEstr.appendChild(b)
}
for (const chave of Object.keys(bacilo.partes)) {
  const b = document.createElement('button')
  const cor = '#' + (bacilo.cores[chave] ?? 0x888888).toString(16).padStart(6, '0')
  b.style.setProperty('--c', cor)
  b.innerHTML = `<i></i>${NOMES[chave] ?? chave}`
  b.addEventListener('click', () => marcarDestaque(bacilo.estado.destaque === chave ? null : chave))
  botoes[chave] = b; elEstr.appendChild(b)
}
const cbAuto = document.getElementById('auto')
if (url.get('auto') === '0') cbAuto.checked = false

/* ---------------- loop ---------------- */
const medidor = document.getElementById('medidor')
let tAnt = performance.now(), tempo = 0, quadros = 0, tFps = tAnt, fps = 0
function quadro(dt) {
  tempo += dt
  if (cbAuto.checked && !arrasto.ativo) giro.rotation.y += dt * 0.12
  if (!arrasto.ativo) {
    girarPalco(arrasto.vx * dt, arrasto.vy * dt)
    const am = Math.exp(-dt * 2.6); arrasto.vx *= am; arrasto.vy *= am
  }
  vista.dist += (vista.distAlvo - vista.dist) * (1 - Math.exp(-dt * 8))
  camera.position.set(0, 0, vista.dist); camera.lookAt(0, 0, 0)
  bacilo.atualizar(dt, tempo)
  renderer.render(cena, camera)
}
function laco(agora) {
  const dt = Math.min((agora - tAnt) / 1000, 0.05); tAnt = agora
  quadro(dt)
  quadros++
  if (agora - tFps > 500) {
    fps = quadros * 1000 / (agora - tFps); quadros = 0; tFps = agora
    const i = renderer.info.render
    medidor.innerHTML = `<b>${fps.toFixed(0)}</b> fps · <b>${i.calls}</b> draw calls · <b>${(i.triangles / 1000).toFixed(0)}k</b> triângulos · qualidade <b>${bacilo.qualidade}</b> · criação <b>${tCriacao.toFixed(0)}</b> ms`
  }
  requestAnimationFrame(laco)
}
requestAnimationFrame(laco)

// utilitarios para inspecao no console
window.__demo = {
  bacilo, renderer, cena, camera, palco, giro, vista,
  def(parcial) {
    for (const k in parcial) {
      if (k === 'destaque') { marcarDestaque(parcial[k]); continue }
      bacilo.estado[k] = parcial[k]
      if (entradas[k]) { entradas[k].inp.value = parcial[k]; entradas[k].val.textContent = fmt(parcial[k]) }
    }
  },
  olhar({ giroY, palcoX = 0, palcoY = 0, dist } = {}) {
    if (giroY !== undefined) giro.rotation.y = giroY
    palco.quaternion.setFromEuler(new THREE.Euler(palcoX, palcoY, 0))
    arrasto.vx = arrasto.vy = 0
    if (dist) vista.dist = vista.distAlvo = dist
  },
  auto(v) { cbAuto.checked = !!v },
  passo(n = 60, dt = 1 / 60) { for (let i = 0; i < n; i++) quadro(dt); return this.info() },
  info() { const i = renderer.info; return { calls: i.render.calls, triangulos: i.render.triangles, geometrias: i.memory.geometries, texturas: i.memory.textures, programas: i.programs?.length, fps: Math.round(fps), criacaoMs: Math.round(tCriacao) } },
}
console.log('[modelo-a] pronto', window.__demo.info(), bacilo.medidas)
