// Camada de midia. As fotos sao EVIDENCIAS: entram numa zona calculada a partir da grade,
// sempre fora da coluna de texto. Tipos: fundo (tela cheia, atras do 3D), lente (circulo),
// quadro (retangulo com legenda), tira (serie lado a lado), grafico.
import gsap from 'gsap'
import { montarGrafico } from './grafico.js'

const vivos = new Map() // chave -> { el, item }
let creditos = {}
export function definirCreditos(lista) { creditos = Object.fromEntries((lista || []).map((c) => [c.arquivo.replace(/^.*[\\/]/, '').replace(/\.\w+$/, ''), c])) }
const nomeDe = (src) => src.replace(/^.*[\\/]/, '').replace(/\.\w+$/, '')

/** area livre (px) = tela menos margens e menos a coluna de texto */
function areaLivre(ladoTexto) {
  const W = innerWidth, H = innerHeight
  const cs = getComputedStyle(document.documentElement)
  const m = parseFloat(cs.getPropertyValue('--m')) || W * 0.042
  // largura da coluna de texto: medida num bloco lateral (o da capa e centralizado e bem mais largo)
  const probe = document.querySelector('#texto .bloco.esq:not(.painel), #texto .bloco.dir:not(.painel)'); const col = probe ? probe.offsetWidth || W * 0.29 : W * 0.29
  const gap = m * 0.9
  let x0 = m, x1 = W - m
  if (ladoTexto === 'esq') x0 = m + col + gap
  if (ladoTexto === 'dir') x1 = W - m - col - gap
  return { x0, x1, y0: m + 56, y1: H - m - 64, W, H, m }
}

function retangulo(item, ladoTexto) {
  const a = areaLivre(ladoTexto), lw = a.x1 - a.x0, lh = a.y1 - a.y0
  const tam = item.tam ?? 1
  let w, h
  if (item.tipo === 'lente') { w = h = Math.min(lh * 0.86, lw * 0.62) * tam }
  else if (item.tipo === 'grafico') { w = lw; h = lh * 0.9 }
  else { const ar = item.ar ?? 1.5; w = Math.min(lw * 0.6, lh * 0.72 * ar) * tam; h = w / ar }
  const pos = item.zona ?? 'oposto'
  let cx
  if (pos === 'centro') cx = (a.x0 + a.x1) / 2
  else if (pos === 'perto') cx = ladoTexto === 'dir' ? a.x1 - w / 2 : a.x0 + w / 2           // colado na coluna de texto
  else cx = ladoTexto === 'dir' ? a.x0 + w / 2 : a.x1 - w / 2                                   // 'oposto': na borda contraria ao texto
  const cy = (a.y0 + a.y1) / 2 + (item.dy ?? 0) * a.H - (item.legenda || creditos[nomeDe(item.src || '')] ? 18 : 0)
  return { x: cx - w / 2 + (item.dx ?? 0) * a.W, y: cy - h / 2, w, h }
}

const classeFundo = (item, ladoTexto, posTexto) => `fundo ${item.limpo ? 'limpo' : 'texto-' + (ladoTexto === 'dir' ? 'dir' : 'esq')}${posTexto === 'baixo' ? ' texto-baixo' : ''}`

function criar(item, ladoTexto, posTexto) {
  const c = creditos[nomeDe(item.src || '')]
  if (item.tipo === 'fundo') {
    const el = document.createElement('div'); el.className = classeFundo(item, ladoTexto, posTexto)
    el.innerHTML = item.video ? `<video src="${item.src}" muted playsinline loop preload="auto"></video>` : `<img src="${item.src}" alt="">`
    if (c || item.credito) { const cr = document.createElement('div'); cr.className = 'credito-fundo'; cr.textContent = item.credito || c.credito; el.appendChild(cr) }
    document.querySelector('#midia-fundo').appendChild(el); return el
  }
  const el = document.createElement('div'); el.className = `item ${item.tipo}${item.sensivel ? ' sensivel' : ''}${item.filtro ? ' f-' + item.filtro : ''}`
  if (item.tipo === 'grafico') { el.innerHTML = '<div class="grafico" style="position:absolute;inset:0"></div>'; el._g = montarGrafico(el.firstChild, item.dados) }
  else {
    const midia = item.video ? `<video src="${item.src}" ${item.poster ? `poster="${item.poster}"` : ''} muted playsinline loop preload="auto" style="${item.foco ? `object-position:${item.foco}` : ''}"></video>` : `<img src="${item.src}" alt="" style="${item.foco ? `object-position:${item.foco}` : ''}">`
    const leg = item.legenda ?? c?.legenda_pt, cred = item.credito ?? c?.credito
    el.innerHTML = `<div class="moldura">${midia}</div>${item.sensivel ? '<span class="selo">Imagem clínica</span>' : ''}${leg || cred ? `<div class="legenda">${leg || ''}${cred ? `<small>${cred}</small>` : ''}</div>` : ''}`
  }
  document.querySelector('#midia').appendChild(el); return el
}

function posicionar(el, r, animar) {
  const alvo = { x: r.x, y: r.y, width: r.w, height: r.h }
  if (animar) gsap.to(el, { ...alvo, duration: 1.1, ease: 'power3.inOut' }); else gsap.set(el, alvo)
}

/** aplica a lista de midia do passo; itens que continuam (mesma chave) so se reposicionam */
export function aplicarMidia(lista = [], ladoTexto = 'esq', { instantaneo = false, posTexto = '' } = {}) {
  const d = instantaneo ? 0 : 1
  // com foto em tela cheia atras, as legendas ganham fundo proprio para continuar legiveis
  document.querySelector('#midia').classList.toggle('com-fundo', lista.some((it) => it.tipo === 'fundo' && (it.opacidade ?? 1) > 0.3))
  const novos = new Map(lista.map((it) => [it.id || it.src, it]))
  for (const [k, v] of vivos) if (!novos.has(k)) {
    vivos.delete(k); const el = v.el; el.dataset.saindo = 1; el.querySelector('video')?.pause()
    gsap.to(el, { opacity: 0, scale: v.item.tipo === 'fundo' ? 1 : 0.94, filter: 'blur(10px)', duration: 0.5 * d, ease: 'power2.in', onComplete: () => el.remove() })
  }
  let ordem = 0
  for (const [k, it] of novos) {
    const atraso = (0.35 + ordem++ * 0.12) * d
    if (vivos.has(k)) {
      const v = vivos.get(k); v.item = it
      if (it.tipo === 'fundo') { gsap.to(v.el, { opacity: it.opacidade ?? 1, duration: 1.2 * d, overwrite: true }); v.el.className = classeFundo(it, ladoTexto, posTexto) }
      else posicionar(v.el, retangulo(it, ladoTexto), !instantaneo)
      continue
    }
    const el = criar(it, ladoTexto, posTexto); vivos.set(k, { el, item: it })
    // imagem ainda nao disponivel: some em silencio, sem quadro quebrado na tela
    el.querySelector('img')?.addEventListener('error', () => { el.style.display = 'none' })
    const vid = el.querySelector('video'); if (vid) { vid.playbackRate = it.velocidade ?? 1; vid.play().catch(() => {}) }
    if (it.tipo === 'fundo') {
      const m = el.firstElementChild
      gsap.fromTo(el, { opacity: 0 }, { opacity: it.opacidade ?? 1, duration: 1.4 * d, delay: 0.1 * d, ease: 'power2.out' })
      gsap.fromTo(m, { scale: 1.14 }, { scale: 1.02, duration: 9, ease: 'power1.out' })
      const cr = el.querySelector('.credito-fundo'); if (cr) gsap.to(cr, { opacity: 1, duration: 0.6, delay: 1.2 * d })
    } else {
      posicionar(el, retangulo(it, ladoTexto), false)
      gsap.fromTo(el, { opacity: 0, scale: 0.9, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1 * d, delay: atraso, ease: 'power3.out',
        onComplete: () => { if (it.sensivel) el.classList.add('revelado'); el._g?.desenha() } })
    }
  }
}

export function reposicionarMidia(ladoTexto) { for (const v of vivos.values()) if (v.item.tipo !== 'fundo') posicionar(v.el, retangulo(v.item, ladoTexto), false) }
