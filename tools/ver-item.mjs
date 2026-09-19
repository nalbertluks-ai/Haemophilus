// Mostra itens especificos do docs/VERIFICACAO.md.  Uso: node tools/ver-item.mjs laboratorio:2 clinica:5 ...
// Sem regex: cada campo e um paragrafo que comeca com "**Campo:** ".
import { readFileSync } from 'node:fs'

const md = readFileSync(new URL('../docs/VERIFICACAO.md', import.meta.url), 'utf8')
const lentes = md.split('\n## ').filter((s) => s.startsWith('Lente: '))

for (const arg of process.argv.slice(2)) {
  const [lente, n] = arg.split(':')
  const sec = lentes.find((s) => s.startsWith(`Lente: ${lente}`))
  if (!sec) { console.log(`\n[${arg}] lente não encontrada`); continue }
  // o balde (confirmado/refutado/nao verificado) e o ultimo "### " antes do bloco
  const pos = sec.indexOf(`\n#### ${n}. `)
  if (pos < 0) { console.log(`\n[${arg}] item não encontrado`); continue }
  const antes = sec.slice(0, pos)
  const balde = antes.slice(antes.lastIndexOf('\n### ') + 5).split('\n')[0]
  const resto = sec.slice(pos + 1)
  const fim = resto.indexOf('\n#### ', 5)
  const fimSec = resto.indexOf('\n### ', 5)
  const cortes = [fim, fimSec].filter((x) => x > 0)
  const bloco = resto.slice(0, cortes.length ? Math.min(...cortes) : undefined)
  console.log(`\n════════ ${arg} ════════\nBALDE: ${balde}`)
  for (const p of bloco.split('\n\n')) {
    const s = p.trim()
    if (!s) continue
    console.log(s.replace(/\s+/g, ' ').slice(0, 1000))
  }
}
