// Grafico de linhas em SVG, minimalista. Aceita uma ou mais series na mesma unidade.
// A linha principal se desenha por traco quando desenha() e chamado.
import gsap from 'gsap'

export function montarGrafico(container, dados) {
  const W = 1200, H = 640, P = { l: 84, r: 40, t: 84, b: 76 }
  const series = dados.series
  const anos = series.flatMap((s) => s.pontos.map((p) => p.ano)), vals = series.flatMap((s) => s.pontos.map((p) => p.valor))
  const x0 = Math.min(...anos), x1 = Math.max(...anos), yMax = Math.ceil(Math.max(...vals) / 5) * 5
  const X = (a) => P.l + (a - x0) / (x1 - x0) * (W - P.l - P.r), Y = (v) => H - P.b - v / yMax * (H - P.t - P.b)
  const caminho = (s) => s.pontos.map((p, i) => `${i ? 'L' : 'M'}${X(p.ano).toFixed(1)} ${Y(p.valor).toFixed(1)}`).join(' ')
  const ty = [0, 0.25, 0.5, 0.75, 1].map((f) => yMax * f), tx = []
  for (let a = Math.ceil(x0 / 2) * 2; a <= x1; a += 2) tx.push(a)
  const mv = dados.marco

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;overflow:visible;font-family:var(--font-text)">
    <text x="${P.l}" y="34" fill="#f3e9d9" font-size="22" font-weight="700" letter-spacing="-0.5">${dados.titulo}</text>
    <text x="${P.l}" y="58" fill="#a89e90" font-size="14">${dados.unidade}</text>
    <g stroke="rgba(243,233,217,0.12)">${ty.map((v) => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}"/>`).join('')}</g>
    <g fill="#6b6358" font-size="13" style="font-variant-numeric:tabular-nums">
      ${ty.map((v) => `<text x="${P.l - 14}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
      ${tx.map((a) => `<text x="${X(a)}" y="${H - P.b + 28}" text-anchor="middle">${a}</text>`).join('')}
    </g>
    ${mv ? `<g class="marco" opacity="0"><rect x="${X(mv.ano)}" y="${P.t}" width="${W - P.r - X(mv.ano)}" height="${H - P.t - P.b}" fill="rgba(234,223,200,0.05)"/><line x1="${X(mv.ano)}" x2="${X(mv.ano)}" y1="${P.t - 8}" y2="${H - P.b}" stroke="#eadfc8" stroke-dasharray="3 6"/><text x="${X(mv.ano) + 12}" y="${P.t + 8}" fill="#eadfc8" font-size="13" font-weight="600" letter-spacing="2.4">${mv.rotulo.toUpperCase()}</text></g>` : ''}
    ${series.map((s, i) => `<path class="serie" data-i="${i}" d="${caminho(s)}" fill="none" stroke="${s.cor}" stroke-width="${i ? 2 : 3.5}" stroke-linejoin="round" stroke-linecap="round" opacity="${i ? 0.75 : 1}"/>
      <text class="rot" opacity="0" x="${X(s.pontos[s.rotuloEm ?? 0].ano) + 8}" y="${Y(s.pontos[s.rotuloEm ?? 0].valor) - 14}" fill="${s.cor}" font-size="14" font-weight="600">${s.rotulo}</text>`).join('')}
    ${(dados.destaques || []).map((d) => `<g class="pt" opacity="0"><circle cx="${X(d.ano)}" cy="${Y(d.valor)}" r="6" fill="${series[0].cor}" stroke="#12100e" stroke-width="3"/><text x="${X(d.ano) + (d.lado === 'esq' ? -14 : 14)}" y="${Y(d.valor) + 5}" text-anchor="${d.lado === 'esq' ? 'end' : 'start'}" fill="#f3e9d9" font-size="24" font-weight="750" letter-spacing="-1">${String(d.valor).replace('.', ',')}</text></g>`).join('')}
    <text x="${W - P.r}" y="${H - 12}" fill="#6b6358" font-size="12" text-anchor="end">${dados.fonte}</text>
  </svg>`

  const linhas = [...container.querySelectorAll('.serie')]
  linhas.forEach((l) => { const n = l.getTotalLength(); gsap.set(l, { strokeDasharray: n, strokeDashoffset: n }) })
  let feito = false
  return {
    desenha() {
      if (feito) return; feito = true
      const tl = gsap.timeline()
      linhas.forEach((l, i) => tl.to(l, { strokeDashoffset: 0, duration: 2.6, ease: 'power1.inOut' }, i * 0.25))
      tl.to(container.querySelectorAll('.rot'), { opacity: 1, duration: 0.5, stagger: 0.15 }, 0.4)
      if (mv) tl.to(container.querySelector('.marco'), { opacity: 1, duration: 0.6 }, 2.6 * (mv.ano - x0) / (x1 - x0))
      tl.to(container.querySelectorAll('.pt'), { opacity: 1, duration: 0.5, stagger: 0.5 }, 2.2)
      return tl
    },
  }
}
