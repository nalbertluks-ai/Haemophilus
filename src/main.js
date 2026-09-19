import '@fontsource-variable/inter'
import '@fontsource-variable/inter/wght-italic.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/base.css'
import gsap from 'gsap'
import { criarCena } from './engine/cena3d.js'
import { criarPalco } from './engine/palco.js'
import { criarEspeciais } from './engine/especiais.js'
import { definirCreditos } from './engine/midia.js'
import { PASSOS, CAPITULOS } from './roteiro.js'
import { MODO_TESTE } from './engine/teste.js'

// Sem await no nivel do modulo: no build de producao, os chunks carregados sob demanda (modelo 3D,
// conteudo) importam three.js DESTE chunk; se ele ainda estivesse avaliando um await de topo,
// o carregamento travaria para sempre (bug so do build, invisivel no modo dev).
async function iniciar() {
  const carga = document.querySelector('#carga'), barra = carga?.querySelector('i')
  const progresso = (f) => { if (barra) barra.style.width = `${Math.round(f * 100)}%` }

  // conteudo (texto dos slides): src/conteudo.js; enquanto nao existir, usa o provisorio
  const { CONTEUDO, GLOSSARIO } = await import('./conteudo.js').catch(() => import('./conteudo.provisorio.js'))
  const creditos = await fetch('/assets/creditos.json').then((r) => (r.ok ? r.json() : [])).catch(() => [])
  definirCreditos(creditos)

  // Modo de teste (so com ?teste=inst): transicoes quase instantaneas, para a auditoria de layout.
  // Fica sinalizado na tela, para nunca ser confundido com a apresentacao de verdade.
  if (MODO_TESTE) {
    gsap.globalTimeline.timeScale(60)
    document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;z-index:99;left:50%;top:8px;transform:translateX(-50%);background:#ff4d5a;color:#12100e;font:700 11px/1 system-ui;letter-spacing:.2em;padding:6px 12px">MODO TESTE · SEM ANIMAÇÕES · remova ?teste=inst do endereço</div>')
  }

  // Pre-carrega e DECODIFICA todas as imagens antes de comecar: assim nenhuma troca de pagina engasga
  // decodificando foto, e as transicoes rodam inteiras.
  const fontes = [...new Set([...PASSOS.flatMap((p) => (p.midia || []).filter((m) => m.src && !m.video).map((m) => m.src)),
    ...['anel', 'louros', 'bastao', 'fita', 'ufpa'].map((n) => `/assets/logo/${n}.webp`)])]
  let feitas = 0
  const espera = (ms) => new Promise((r) => setTimeout(r, ms))
  // decode() pode nunca resolver com a janela em segundo plano: cada imagem tem teto de tempo, e o conjunto tambem
  const carregaImagem = (src) => new Promise((ok) => { const im = new Image(); im.onload = im.onerror = () => ok(im); im.src = src })
    .then((im) => Promise.race([im.decode ? im.decode().catch(() => {}) : null, espera(1500)]))
    .then(() => progresso(++feitas / fontes.length * 0.7))
  const imagens = Promise.race([Promise.all(fontes.map(carregaImagem)), espera(9000)])

  if (document.fonts?.ready) await document.fonts.ready
  const cena = await criarCena(document.querySelector('#gl'))
  progresso(0.8)
  await imagens
  cena.aquecer() // compila os shaders de todos os estados do modelo (corte, divisao, secrecao...) fora da apresentacao
  progresso(1)

  const palco = criarPalco({ cena, PASSOS, CAPITULOS, CONTEUDO, GLOSSARIO, especiais: criarEspeciais({ GLOSSARIO, creditos }) })
  ;(await import('./engine/controle.js')).criarControle({ palco, cena })
  if (carga) gsap.to(carga, { autoAlpha: 0, duration: 0.7, delay: 0.15, onComplete: () => carga.remove() })

  window.app = { cena, palco, gsap, auditar: async () => (await import('./engine/auditoria.js')).auditar({ cena, palco }) }
}

iniciar().catch((e) => { console.error(e); const c = document.querySelector('#carga b'); if (c) c.textContent = 'Erro ao carregar: ' + e.message })
