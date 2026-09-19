// Palco: maquina de estados. Um passo = uma pose completa. irPara(i) leva tudo ao alvo com transicao
// autoral (nao amarrada a scroll): o texto anterior sai INTEIRO antes de o novo entrar, entao nunca ha
// dois textos na tela; e a midia vive em zonas que nao tocam a coluna de texto.
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { aplicarMidia, reposicionarMidia } from './midia.js'
import { criarRotulos, NOMES, corDe } from './rotulos.js'
import { criarVitrine } from './vitrine.js'

gsap.registerPlugin(SplitText)

const POSE0 = { x: 0, y: 0, z: 0, escala: 1, rx: 0.25, ry: 0, rz: 0.5, giro: 0.12 }
const ESTADO0 = { corte: 0, explodir: 0, capsula: 1, pili: 1, energia: 1, divisao: 0, secrecao: 0 }

export function criarPalco({ cena, PASSOS, CAPITULOS, CONTEUDO, GLOSSARIO, especiais = {} }) {
  const camTexto = document.querySelector('#texto')
  const rotulos = criarRotulos(cena)
  const vitrine = criarVitrine(cena)
  const fichaVitrine = CONTEUDO.espectro?.passos?.vitrine?.ficha
  if (fichaVitrine) vitrine.textos(fichaVitrine)
  const capDe = Object.fromEntries(CAPITULOS.map((c, i) => [c.id, { ...c, n: i + 1 }]))
  let atual = -1, ocupado = false, fila = null

  // ---------- blocos de texto (um por passo), montados a partir do conteudo
  const blocos = PASSOS.map((p) => {
    const c = CONTEUDO[p.cap]?.passos?.[p.id] || { titulo: p.id }
    const el = document.createElement('section')
    el.className = `bloco ${p.texto || 'esq'}${p.painel ? ' painel' : ''}${p.tipo ? ' t-' + p.tipo : ''}`
    if (especiais[p.tipo]?.html) el.innerHTML = especiais[p.tipo].html(c, p)
    else {
      // fatia: [inicio, fim] mostra so parte da ficha (fichas longas viram dois passos); 'cores' troca a ficha pela legenda interativa
      const ficha = p.tipo === 'cores' ? null : (p.fatia ? c.ficha?.slice(...p.fatia) : c.ficha)
      el.innerHTML = `${c.kicker ? `<div class="kicker">${c.kicker}</div>` : ''}<h2 class="titulo">${c.titulo || ''}</h2>${c.corpo ? `<div class="corpo">${c.corpo}</div>` : ''}${ficha ? `<dl class="ficha">${ficha.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>` : ''}`
    }
    if (p.tipo === 'cores') el.insertAdjacentHTML('beforeend', `<div class="cores">${Object.keys(NOMES).filter((k) => !['citoplasma', 'septo'].includes(k)).map((k) => `<button data-k="${k}" style="--cor:${corDe(k)}"><i></i>${NOMES[k][0]}</button>`).join('')}</div>`)
    camTexto.appendChild(el)
    return el
  })
  // legenda de cores interativa: passar o mouse destaca a estrutura no modelo
  camTexto.addEventListener('pointerover', (e) => { const b = e.target.closest('.cores button'); if (b) { cena.modelo.estado.destaque = b.dataset.k; rotulos.definir([b.dataset.k], 'esq') } })
  camTexto.addEventListener('pointerout', (e) => { if (e.target.closest('.cores button')) { cena.modelo.estado.destaque = null; rotulos.definir([], 'esq') } })

  // palavra comprida ("Lipo-oligossacarideo") nao pode quebrar no meio: reduz o corpo do titulo ate caber
  function ajustaTitulo(el) {
    const t = el.querySelector('.titulo'); if (!t || el._ajustado) return; el._ajustado = true
    const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit'; t.appendChild(probe)
    const maior = Math.max(...t.textContent.split(/\s+/).map((w) => { probe.textContent = w; return probe.offsetWidth })); probe.remove()
    const larg = t.clientWidth; if (maior > larg) t.style.fontSize = `${parseFloat(getComputedStyle(t).fontSize) * larg / maior * 0.98}px`
    // bloco alto demais: reduz o corpo do texto ate caber entre o cabecalho e o rodape
    const maxH = innerHeight - 190; let fs = 1
    while (el.offsetHeight > maxH && fs > 0.74) { fs -= 0.04; el.style.fontSize = `${fs}em` }
  }

  function entraTexto(el, d = 1) {
    ajustaTitulo(el)
    gsap.set(el, { autoAlpha: 1 })
    const tl = gsap.timeline()
    const tit = el.querySelector('.titulo'), kick = el.querySelector('.kicker')
    if (kick) tl.fromTo(kick, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.6 * d, ease: 'power3.out' }, 0)
    if (tit) {
      el._split?.revert(); el._split = SplitText.create(tit, { type: 'words,chars' })
      tl.fromTo(el._split.chars, { opacity: 0, filter: 'blur(14px)', y: 14 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.9 * d, stagger: 0.016 * d, ease: 'power3.out' }, 0.05)
    }
    const resto = el.querySelectorAll('.corpo > *, .ficha > *, .cores, .sub, .etimo, .numero-leg, .extra')
    if (resto.length) tl.fromTo(resto, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 * d, stagger: 0.035 * d, ease: 'power3.out' }, 0.3 * d)
    return tl
  }
  const saiTexto = (el, d = 1) => gsap.to(el, { autoAlpha: 0, duration: 0.32 * d, ease: 'power2.in' })

  // ---------- cortina de capitulo: iris em forma de cocobacilo fecha, troca, abre
  const cortina = document.querySelector('#cortina'), furo = cortina.querySelector('#furo')
  function iris(troca) {
    const S = Math.hypot(innerWidth, innerHeight) * 0.78, st = { s: S }
    const aplica = () => furo.setAttribute('transform', `translate(${innerWidth / 2} ${innerHeight / 2}) rotate(-24) scale(${st.s})`)
    aplica(); gsap.set(cortina, { visibility: 'visible' })
    return gsap.timeline()
      .to(st, { s: 0, duration: 0.75, ease: 'power3.in', onUpdate: aplica })
      .add(() => troca())
      .to(st, { s: S, duration: 1.0, ease: 'power3.out', onUpdate: aplica }, '+=0.12')
      .set(cortina, { visibility: 'hidden' })
  }

  // ---------- aplicar uma pose
  function aplicar(i, { instantaneo = false, semUrl = false, abertura = false } = {}) {
    const p = PASSOS[i], d = instantaneo ? 0 : 1, lado = p.texto === 'dir' ? 'dir' : 'esq'
    const cap = capDe[p.cap]
    document.documentElement.style.setProperty('--acento', cap.acento)
    gsap.to(cena.pose, { ...POSE0, ...p.m, duration: 1.5 * d, ease: 'power3.inOut', overwrite: true })
    const e = { ...ESTADO0, ...p.e }; cena.modelo.estado.destaque = e.destaque ?? null; delete e.destaque
    gsap.to(cena.modelo.estado, { ...e, duration: 1.4 * d, ease: 'power2.inOut', overwrite: true })
    cena.recentrar(0.9 * d)
    vitrine.definir(p.vitrine || { v: 0 }, 1.3 * d)
    aplicarMidia(p.midia || [], lado, { instantaneo, posTexto: p.texto })
    rotulos.definir(p.calls || [], lado, p.rotulos || {})
    // na abertura da pagina o passo entra sem transicao, mas os desenhos proprios (logo da capa) animam
    for (const [tipo, esp] of Object.entries(especiais)) esp.ativo?.(p.tipo === tipo, p, abertura ? 1 : d)
    atualizarUI(i)
    if (!semUrl) history.replaceState(null, '', `#${p.cap}/${p.id}`)
  }

  function irPara(i, opts = {}) {
    i = Math.max(0, Math.min(PASSOS.length - 1, i))
    if (i === atual && !opts.forcar) return
    if (ocupado && !opts.forcar) { fila = i; return }
    const de = atual, mudaCap = de >= 0 && PASSOS[de].cap !== PASSOS[i].cap
    atual = i; ocupado = true
    const libera = () => { ocupado = false; if (fila != null && fila !== atual) { const f = fila; fila = null; irPara(f) } else fila = null }
    if (opts.instantaneo || de < 0) {
      blocos.forEach((b, k) => { if (k !== i) gsap.set(b, { autoAlpha: 0 }) })
      aplicar(i, { instantaneo: true, semUrl: opts.forcar, abertura: de < 0 }); entraTexto(blocos[i]); gsap.delayedCall(0.5, libera); return
    }
    if (mudaCap) {
      iris(() => { gsap.set(blocos[de], { autoAlpha: 0 }); aplicar(i, { instantaneo: true }); entraTexto(blocos[i]).delay(0.35) }).add(libera, '-=0.5')
    } else {
      saiTexto(blocos[de]).then(() => { entraTexto(blocos[i]); gsap.delayedCall(0.45, libera) })
      aplicar(i)
    }
  }

  // ---------- UI: indice de capitulos, progresso, teclado, roda do mouse
  const indice = document.querySelector('#indice'), barra = document.querySelector('#rodape .barra i'), cont = document.querySelector('#rodape .cont'), dica = document.querySelector('#dica')
  indice.innerHTML = CAPITULOS.map((c) => `<button data-cap="${c.id}">${c.nome}</button>`).join('')
  indice.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irPara(PASSOS.findIndex((p) => p.cap === b.dataset.cap)) })
  function atualizarUI(i) {
    const p = PASSOS[i], cap = capDe[p.cap]
    indice.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.cap === p.cap))
    barra.style.width = `${(i + 1) / PASSOS.length * 100}%`
    cont.textContent = `${String(cap.n).padStart(2, '0')} · ${cap.nome} — ${i + 1}/${PASSOS.length}`
    if (i > 0 && dica) dica.style.opacity = 0
  }
  addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return
    const k = e.key
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); irPara((fila ?? atual) + 1) }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); irPara((fila ?? atual) - 1) }
    else if (k === 'Home') irPara(0)
    else if (k === 'End') irPara(PASSOS.length - 1)
    else if (/^[0-9]$/.test(k)) irPara(PASSOS.findIndex((p) => p.cap === CAPITULOS[k === '0' ? 9 : Number(k) - 1]?.id))
    else if (k === 'f' || k === 'F') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})
  })
  let travaRoda = 0
  addEventListener('wheel', (e) => {
    if (e.target.closest('#estudo')) return
    const agora = performance.now(); if (agora < travaRoda || Math.abs(e.deltaY) < 12) return
    travaRoda = agora + 950; irPara(atual + (e.deltaY > 0 ? 1 : -1))
  }, { passive: true })
  addEventListener('resize', () => reposicionarMidia(PASSOS[atual]?.texto === 'dir' ? 'dir' : 'esq'))

  // ---------- glossario em tooltip
  const tip = document.querySelector('#tip')
  addEventListener('pointerover', (e) => {
    const t = e.target.closest('.termo'); if (!t) return
    const g = GLOSSARIO[t.dataset.termo]; if (!g) return
    tip.innerHTML = `<b>${g.termo}</b>${g.def}`; tip.style.opacity = 1
    const r = t.getBoundingClientRect(); tip.style.left = `${Math.min(r.left, innerWidth - 380)}px`; tip.style.top = `${r.bottom + 10}px`
  })
  addEventListener('pointerout', (e) => { if (e.target.closest('.termo')) tip.style.opacity = 0 })

  // inicio: respeita o hash (#capitulo/passo) para recarregar no mesmo ponto
  const [hc, hp] = location.hash.slice(1).split('/')
  const ini = PASSOS.findIndex((p) => p.cap === hc && (!hp || p.id === hp))
  irPara(ini >= 0 ? ini : 0, { instantaneo: true })

  return { irPara, proximo: () => irPara(atual + 1), anterior: () => irPara(atual - 1), get atual() { return atual }, PASSOS }
}
