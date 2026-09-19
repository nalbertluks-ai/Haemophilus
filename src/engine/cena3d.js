// Cena 3D unica. O modelo e o protagonista: o motor so lhe da palco, luz e interacao.
// - "suporte" recebe a POSE do passo (posicao, escala, rotacao-base), animada pelo palco.
// - dentro dele, o modelo gira devagar e aceita arrasto do mouse com inercia (volta sozinho).
// - o mouse parado tambem inclina levemente a peca (paralaxe), como em oryzo.ai.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer, EffectPass, RenderPass, BloomEffect, VignetteEffect, SMAAEffect } from 'postprocessing'
import gsap from 'gsap'
import { criarModelo } from '../modelo/index.js'
import { MODO_TESTE } from './teste.js'

export async function criarCena(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.localClippingEnabled = true
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 10)

  // ?q=media na URL reduz a malha (notebook fraco ou projetor em 4K)
  const modelo = await criarModelo({ renderer, qualidade: new URLSearchParams(location.search).get('q') === 'media' ? 'media' : 'alta' })
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = modelo.ambiente || pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  // luz de estudio: principal quente, contraluz fria, preenchimento fraco
  const principal = new THREE.DirectionalLight(0xffe2c4, 2.6); principal.position.set(4, 5, 6)
  const contra = new THREE.DirectionalLight(0x8fd8ff, 3.2); contra.position.set(-5, 2.5, -6)
  const preench = new THREE.DirectionalLight(0xff9a6a, 0.5); preench.position.set(-3, -4, 3)
  scene.add(principal, contra, preench)

  const suporte = new THREE.Group()      // pose do passo
  const arrasto = new THREE.Group()      // rotacao do usuario
  const giro = new THREE.Group()         // giro continuo em torno do eixo longo
  suporte.add(arrasto); arrasto.add(giro); giro.add(modelo.grupo); scene.add(suporte)

  const composer = new EffectComposer(renderer, { multisampling: 0 })
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new BloomEffect({ intensity: 0.55, luminanceThreshold: 0.62, luminanceSmoothing: 0.3, mipmapBlur: true, resolutionScale: 0.5 })
  composer.addPass(new EffectPass(camera, new SMAAEffect(), bloom, new VignetteEffect({ offset: 0.32, darkness: 0.5 })))

  // pose animavel (o palco faz tween nestes numeros)
  const pose = { x: 0, y: 0, z: 0, escala: 1, rx: 0.25, ry: 0, rz: 0.5, giro: 0.12 }
  const usuario = { yaw: 0, pitch: 0, vy: 0, vp: 0, ativo: false, px: 0, py: 0 }
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }

  const el = renderer.domElement
  el.style.touchAction = 'none'
  el.addEventListener('pointerdown', (e) => { usuario.ativo = true; usuario.px = e.clientX; usuario.py = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing' })
  el.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / window.innerWidth * 2 - 1; mouse.y = e.clientY / window.innerHeight * 2 - 1
    if (!usuario.ativo) return
    const dx = e.clientX - usuario.px, dy = e.clientY - usuario.py; usuario.px = e.clientX; usuario.py = e.clientY
    usuario.vy = dx * 0.006; usuario.vp = dy * 0.006; usuario.yaw += usuario.vy; usuario.pitch += usuario.vp
  })
  const solta = () => { usuario.ativo = false; el.style.cursor = 'grab' }
  el.addEventListener('pointerup', solta); el.addEventListener('pointercancel', solta)
  el.style.cursor = 'grab'

  const INST = MODO_TESTE
  const relogio = new THREE.Clock()
  let pausado = false
  function quadro() {
    if (pausado) return
    const dt = Math.min(relogio.getDelta(), 0.05), t = relogio.elapsedTime
    // inercia do arrasto
    if (!usuario.ativo) { usuario.yaw += usuario.vy; usuario.pitch += usuario.vp; usuario.vy *= 0.94; usuario.vp *= 0.94 }
    usuario.pitch = THREE.MathUtils.clamp(usuario.pitch, -1.2, 1.2)
    mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05
    suporte.position.set(pose.x, pose.y, pose.z); suporte.scale.setScalar(Math.max(pose.escala, 0.0001))
    suporte.rotation.set(pose.rx + mouse.sy * 0.12, pose.ry + mouse.sx * 0.18, pose.rz)
    arrasto.rotation.set(usuario.pitch, usuario.yaw, 0)
    giro.rotation.y += dt * pose.giro
    suporte.visible = pose.escala > 0.002
    for (let k = 0; k < (INST ? 40 : 1); k++) modelo.atualizar(dt, t) // ?inst: o modelo converge de imediato
    composer.render(dt)
  }
  gsap.ticker.add(quadro)

  function redimensiona() {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', redimensiona)
  el.addEventListener('webglcontextlost', (e) => { e.preventDefault(); console.warn('WebGL: contexto perdido') })

  const v = new THREE.Vector3()
  /** ponto local do modelo -> pixels de tela */
  function projetar(local) {
    v.copy(local); modelo.grupo.localToWorld(v); v.project(camera)
    return { x: (v.x + 1) / 2 * window.innerWidth, y: (1 - v.y) / 2 * window.innerHeight, atras: v.z > 1 }
  }
  /** centro do modelo em pixels (para decidir de que lado vai cada rotulo) */
  function centroTela() { return projetar(new THREE.Vector3(0, 0, 0)) }
  /** faz o usuario "soltar" a peca: volta a rotacao livre para zero ao trocar de passo */
  function recentrar(dur = 1.2) { usuario.vy = usuario.vp = 0; gsap.to(usuario, { yaw: 0, pitch: 0, duration: dur, ease: 'power3.inOut' }) }

  /** renderiza uma vez cada estado do modelo, para compilar os shaders antes da apresentacao (evita engasgo na 1a vez) */
  function aquecer() {
    const e = modelo.estado, salvo = { ...e }
    suporte.visible = true; suporte.scale.setScalar(1)
    for (const c of [{}, { corte: 1 }, { corte: 1, explodir: 1 }, { corte: 1, divisao: 1, destaque: 'pbp3' }, { secrecao: 1, capsula: 0, pili: 0 }, { energia: 0 }, { destaque: 'capsula', explodir: 0.5 }]) {
      Object.assign(e, salvo, c); for (let k = 0; k < 40; k++) modelo.atualizar(0.05, k * 0.05)
      composer.render(0.016)
    }
    Object.assign(e, salvo); for (let k = 0; k < 40; k++) modelo.atualizar(0.05, 0)
  }

  /** gira a peca como o arrasto do mouse (usado pelo analogico do controle) */
  function girar(dx, dy) { usuario.vy = dx; usuario.vp = dy; usuario.yaw += dx; usuario.pitch += dy }

  return { renderer, scene, camera, modelo, pose, bloom, projetar, centroTela, recentrar, aquecer, girar, pausar: (p) => { pausado = p } }
}
