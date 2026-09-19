// Rotulos do 3D: ligam uma estrutura do modelo ao seu nome, com linha fina. A posicao e AUTOMATICA:
// os rotulos ficam numa coluna ao lado do modelo, do lado contrario ao texto, ordenados pela altura
// da ancora e com espacamento minimo — nunca caem sobre a coluna de texto nem uns sobre os outros.
import gsap from 'gsap'

export const NOMES = {
  capsula: ['Cápsula', 'polissacarídeo PRP'],
  membranaExterna: ['Membrana externa', ''],
  los: ['LOS', 'lipo-oligossacarídeo'],
  porinas: ['Porinas', 'OMP P2 · P6'],
  adesinas: ['Adesinas', 'HMW1/2 · Hia · Hap'],
  pili: ['Pili', 'fímbrias'],
  peptidoglicano: ['Peptidoglicano', 'camada fina'],
  betaLactamase: ['Beta-lactamase', 'TEM-1 · ROB-1'],
  membranaInterna: ['Membrana interna', 'citoplasmática'],
  pbp3: ['PBP3', 'FtsI · septo'],
  citoplasma: ['Citoplasma', ''],
  ribossomos: ['Ribossomos', '70S'],
  nucleoide: ['Nucleoide', 'DNA cromossômico'],
  plasmideo: ['Plasmídeo', ''],
  septo: ['Septo', 'divisão binária'],
  secrecao: ['Protease de IgA1', 'secretada'],
}
const VAR = { capsula: 'capsula', membranaExterna: 'membrana-externa', los: 'los', porinas: 'porinas', adesinas: 'adesinas', pili: 'pili', peptidoglicano: 'peptidoglicano',
  betaLactamase: 'beta-lactamase', membranaInterna: 'membrana-interna', pbp3: 'pbp3', ribossomos: 'ribossomos', nucleoide: 'nucleoide', plasmideo: 'plasmideo', secrecao: 'secrecao', citoplasma: 'ribossomos', septo: 'membrana-interna' }
export const corDe = (chave) => `var(--c-${VAR[chave] || 'capsula'})`

export function criarRotulos(cena) {
  const svg = document.querySelector('#calls'), camada = document.querySelector('#rotulos')
  let ativos = [] // { chave, el, g, op }
  let lado = 1    // 1 = rotulos a direita do modelo

  function definir(chaves = [], ladoTexto = 'esq', textos = {}) {
    lado = ladoTexto === 'dir' ? -1 : 1
    const querem = new Set(chaves)
    for (const r of ativos) if (!querem.has(r.chave)) { r.saindo = true; r.el.dataset.saindo = 1; gsap.to(r, { op: 0, duration: 0.35, onComplete: () => { r.el.remove(); r.g.remove(); ativos = ativos.filter((x) => x !== r) } }) }
    chaves.forEach((chave, i) => {
      if (ativos.some((r) => r.chave === chave && !r.saindo)) return
      const [t, s] = textos[chave] || NOMES[chave] || [chave, '']
      const el = document.createElement('div'); el.className = 'rotulo3d'; el.style.setProperty('--cor', corDe(chave)); el.innerHTML = `${t}${s ? `<small>${s}</small>` : ''}`
      camada.appendChild(el)
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.style.setProperty('--cor', corDe(chave)); g.innerHTML = '<line/><circle r="4.5"/>'; svg.appendChild(g)
      const r = { chave, el, g, op: 0, y: null }; ativos.push(r)
      gsap.to(r, { op: 1, duration: 0.7, delay: 0.9 + i * 0.12, ease: 'power2.out' })
    })
  }

  function atualizar() {
    if (!ativos.length) return
    // meia-largura do modelo na tela: raio + o quanto o eixo longo esta deitado
    const c = cena.centroTela(), pxUn = innerHeight / 5.36, raio = cena.pose.escala * pxUn * (0.75 + 0.55 * Math.abs(Math.sin(cena.pose.rz)))
    const m = innerWidth * 0.042, larg = Math.max(...ativos.map((r) => r.el.offsetWidth), 120)
    let colX = c.x + lado * (raio + 56)
    colX = lado > 0 ? Math.min(colX, innerWidth - m - larg) : Math.max(colX, m + larg)   // o rotulo inteiro cabe na tela
    const lista = ativos.map((r) => ({ r, p: cena.projetar(cena.modelo.ancoras[r.chave] || cena.modelo.ancoras.nucleoide) })).sort((a, b) => a.p.y - b.p.y)
    const passo = 64, total = (lista.length - 1) * passo
    let y0 = Math.max(120, Math.min(innerHeight - 120 - total, c.y - total / 2))
    lista.forEach(({ r, p }, i) => {
      const alvoY = Math.max(y0 + i * passo, Math.min(p.y, y0 + i * passo + 0)) // coluna regular
      r.y = r.y == null ? alvoY : r.y + (alvoY - r.y) * 0.18
      const el = r.el, inv = lado < 0
      el.classList.toggle('inv', inv)
      el.style.opacity = r.op
      el.style.transform = `translate(${inv ? colX - el.offsetWidth : colX}px, ${r.y - 12}px)`
      const ln = r.g.firstChild, ci = r.g.lastChild
      r.g.style.opacity = r.op
      ln.setAttribute('x1', p.x); ln.setAttribute('y1', p.y); ln.setAttribute('x2', colX - lado * 10); ln.setAttribute('y2', r.y)
      ci.setAttribute('cx', p.x); ci.setAttribute('cy', p.y)
    })
  }
  gsap.ticker.add(atualizar)
  return { definir }
}
