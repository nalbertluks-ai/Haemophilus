// Auditoria de layout: percorre todos os passos e acusa sobreposicao ou vazamento de tela.
// Uso no console:  await app.auditar()        (abra a pagina com ?teste=inst para ser rapido)
// Mede: bloco de texto, itens de midia (menos os fundos), rotulos do 3D e a caixa aproximada do modelo.
import gsap from 'gsap'

const dorme = (ms) => new Promise((r) => setTimeout(r, ms))
const inter = (a, b, folga = 0) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l) + folga) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t) + folga)
const caixa = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }

export async function auditar({ cena, palco }) {
  const W = innerWidth, H = innerHeight, achados = []
  for (let i = 0; i < palco.PASSOS.length; i++) {
    const p = palco.PASSOS[i], nome = `${i} ${p.cap}.${p.id}${p.fatia ? `[${p.fatia}]` : ''}`
    palco.irPara(i, { instantaneo: true, forcar: true })
    for (let k = 0; k < 4; k++) gsap.ticker.tick() // sincrono: nao depende de timers (janela minimizada os atrasa)
    const bloco = [...document.querySelectorAll('#texto .bloco')].find((b) => getComputedStyle(b).visibility === 'visible')
    const tx = bloco ? caixa(bloco) : null
    const itens = [...document.querySelectorAll('#midia .item')].filter((e) => getComputedStyle(e).display !== 'none' && !e.dataset.saindo).map((e) => ({ nome: (e.querySelector('img,video')?.getAttribute('src') || e.className).split('/').pop(), c: caixa(e), leg: e.querySelector('.legenda') ? caixa(e.querySelector('.legenda')) : null }))
    const rots = [...document.querySelectorAll('#rotulos .rotulo3d')].filter((e) => !e.dataset.saindo && !e.style.cssText.includes('text-align: center')).map((e) => ({ nome: e.textContent.slice(0, 18), c: caixa(e) }))
    // caixa aproximada do modelo na tela
    let mod = null
    if (cena.pose.escala > 0.05) {
      const c = cena.centroTela(), u = H / 5.36 * cena.pose.escala, s = Math.abs(Math.sin(cena.pose.rz)), co = Math.abs(Math.cos(cena.pose.rz))
      const hw = u * (0.62 + 0.62 * s), hh = u * (0.62 + 0.62 * co)
      mod = { l: c.x - hw, r: c.x + hw, t: c.y - hh, b: c.y + hh }
    }
    const diz = (m) => achados.push(`${nome}: ${m}`)
    if (tx) {
      if (tx.t < 70) diz(`texto passa do topo (${Math.round(tx.t)}px)`)
      if (tx.b > H - 44) diz(`texto passa do rodape (sobra ${Math.round(H - tx.b)}px)`)
      if (tx.l < 0 || tx.r > W) diz('texto fora da tela na horizontal')
    }
    itens.forEach((it, a) => {
      if (it.c.l < -2 || it.c.t < 40 || it.c.r > W + 2 || it.c.b > H - 20) diz(`midia ${it.nome} vaza da tela`)
      if (it.leg && it.leg.b > H - 14) diz(`legenda de ${it.nome} vaza do rodape`)
      if (tx && inter(it.c, tx) > 0) diz(`midia ${it.nome} sobre o TEXTO`)
      if (tx && it.leg && inter(it.leg, tx) > 0) diz(`legenda de ${it.nome} sobre o texto`)
      if (mod && !['centro', 'capa', 'fecho'].includes(p.texto) && inter(it.c, mod) > 1500) diz(`midia ${it.nome} sobre o MODELO`)
      itens.slice(a + 1).forEach((o) => { if (inter(it.c, o.c) > 0) diz(`midia ${it.nome} sobre midia ${o.nome}`); if (it.leg && inter(it.leg, o.c) > 0) diz(`legenda de ${it.nome} sobre ${o.nome}`) })
    })
    rots.forEach((r) => {
      if (r.c.l < 4 || r.c.r > W - 4) diz(`rotulo "${r.nome}" cortado na borda`)
      if (tx && inter(r.c, tx) > 0) diz(`rotulo "${r.nome}" sobre o texto`)
      itens.forEach((it) => { if (inter(r.c, it.c) > 0) diz(`rotulo "${r.nome}" sobre midia ${it.nome}`) })
    })
    if (mod && tx && !['centro'].includes(p.texto) && inter(mod, tx) > 2500) diz(`MODELO sobre o texto (${Math.round(inter(mod, tx))}px²)`)
    if (mod && (mod.t < -H * 0.12 || mod.b > H * 1.12)) diz(`modelo sai muito da tela na vertical (${Math.round(mod.t)}..${Math.round(mod.b)})`)
  }
  return { tela: `${W}x${H}`, passos: palco.PASSOS.length, achados }
}
