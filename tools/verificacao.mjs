// Le o diario do workflow de verificacao e separa, por lente:
//   CONFIRMADO      - o cetico nao refutou
//   REFUTADO        - o cetico derrubou a correcao (o roteiro fica como estava)
//   NAO VERIFICADO  - o cetico falhou (limite de sessao): a correcao NAO foi checada
// Junta por rotulo -> chave -> resultado, reproduzindo o mesmo filtro do workflow.
// Se a contagem de ceticos nao bater com a de achados, aborta: par trocado e pior que nada.
import { readFileSync, writeFileSync } from 'node:fs'

const J = 'C:/Users/nalbe/.claude/projects/C--Users-nalbe-Downloads-slide-tal/6dee33bd-cf17-435b-9e9b-fc07aa73435d/subagents/workflows/wf_2a508f33-2fb/journal.jsonl'
const OUT = 'C:/Users/nalbe/Downloads/slide tal/haemophilus/docs/VERIFICACAO.md'

const L = readFileSync(J, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
const porRotulo = new Map(L.filter((o) => o.type === 'started').map((o) => [o.label, o.key]))
const resultado = new Map(L.filter((o) => o.type === 'result').map((o) => [o.key, o.result]))
const falhou = new Set(L.filter((o) => o.type === 'failed').map((o) => o.key))
const pega = (rotulo) => { const k = porRotulo.get(rotulo); return { existe: !!k, falhou: falhou.has(k), r: resultado.get(k) } }

const LENTES = ['laboratorio', 'clinica', 'epidemio-fpb']
const md = ['# Verificação do roteiro — estado real', '', 'Gerado por `tools/verificacao.mjs` a partir do diário do workflow. 69 agentes: 55 concluíram, 14 falharam por limite de sessão.', '']
const resumo = []
const t = (s, n = 230) => (s || '').replace(/\s+/g, ' ').slice(0, n)

for (const lente of LENTES) {
  const rev = pega(`revisar:${lente}`)
  if (!rev.r) { md.push(`## ${lente}\n\n**A própria revisão desta lente não retornou.**\n`); resumo.push(`${lente}: REVISAO AUSENTE`); continue }
  const todos = rev.r.achados || []
  const relevantes = todos.filter((a) => a.tipo !== 'ok-mas-vale-reforcar')
  const nCeticos = [...porRotulo.keys()].filter((k) => k.startsWith(`refutar:${lente}-`)).length
  if (nCeticos !== relevantes.length) {
    console.error(`ABORTADO: lente ${lente} tem ${relevantes.length} achados filtrados mas ${nCeticos} céticos. O pareamento não é confiável.`)
    process.exit(1)
  }
  const b = { conf: [], refu: [], nao: [] }
  relevantes.forEach((a, i) => {
    const c = pega(`refutar:${lente}-${i + 1}`)
    const item = { n: i + 1, a, v: c.r }
    if (c.falhou || !c.r) b.nao.push(item)
    else if (c.r.refutado) b.refu.push(item)
    else b.conf.push(item)
  })
  const semFonte = b.conf.filter((x) => x.v.fonte_confere === false)
  resumo.push(`${lente}: ${relevantes.length} achados → ${b.conf.length} confirmados (${semFonte.length} com fonte que NÃO conferiu), ${b.refu.length} refutados, ${b.nao.length} NÃO VERIFICADOS; +${todos.length - relevantes.length} só de reforço`)

  md.push(`## Lente: ${lente}`, '', `${relevantes.length} achados · **${b.conf.length} confirmados** · ${b.refu.length} refutados · **${b.nao.length} não verificados**`, '')
  md.push('### Confirmados (podem entrar no roteiro)', '')
  for (const x of b.conf) {
    md.push(`#### ${x.n}. [${x.a.tipo} · ${x.a.gravidade}]${x.v.fonte_confere === false ? ' ⚠ fonte citada não conferiu' : ''}`, '', `**No roteiro:** ${x.a.trecho}`, '', `**Problema:** ${x.a.problema}`, '', `**Redação final:** ${x.v.versao_final || x.a.correcao}`, '', `**Fonte:** ${x.a.fonte_url}`, '', `**Cético:** ${x.v.motivo}`, '')
  }
  md.push('### Refutados (o roteiro fica como estava)', '')
  for (const x of b.refu) md.push(`#### ${x.n}. [${x.a.tipo} · ${x.a.gravidade}]`, '', `**No roteiro:** ${x.a.trecho}`, '', `**Correção proposta e derrubada:** ${x.a.correcao}`, '', `**Por quê:** ${x.v.motivo}`, '')
  md.push('### NÃO VERIFICADOS — o cético falhou; tratar como hipótese, não como correção', '')
  for (const x of b.nao) md.push(`#### ${x.n}. [${x.a.tipo} · ${x.a.gravidade}]`, '', `**No roteiro:** ${x.a.trecho}`, '', `**Problema alegado:** ${x.a.problema}`, '', `**Correção proposta (sem checagem):** ${x.a.correcao}`, '', `**Fonte alegada:** ${x.a.fonte_url}`, '')

  console.log(`\n===== ${lente.toUpperCase()} =====`)
  for (const x of b.conf) console.log(` OK  ${String(x.n).padStart(2)} [${x.a.gravidade}] ${x.v.fonte_confere === false ? '(fonte NAO conferiu) ' : ''}${t(x.a.trecho, 150)}`)
  for (const x of b.refu) console.log(` REF ${String(x.n).padStart(2)} [${x.a.gravidade}] ${t(x.a.trecho, 150)}`)
  for (const x of b.nao) console.log(` ??? ${String(x.n).padStart(2)} [${x.a.gravidade}] ${t(x.a.trecho, 150)}`)
}

// banca, procedencia, assets, dados, prototipos
const banca = pega('banca')
md.push('## Banca simulada', '', banca.r ? JSON.stringify(banca.r, null, 2) : '**Não rodou** (falhou por limite de sessão). Lacunas e perguntas da banca continuam sem levantamento.', '')
for (const [rot, tit] of [['procedencia', 'Procedência das imagens'], ['assets faltantes', 'Assets faltantes'], ['dados do grafico', 'Dados do gráfico'], ['bacilo-a', 'Protótipo A'], ['bacilo-b', 'Protótipo B'], ['bacilo-c', 'Protótipo C']]) {
  const p = pega(rot)
  md.push(`## ${tit}`, '', p.r ? '```json\n' + JSON.stringify(p.r, null, 2) + '\n```' : `**Sem resultado** (${p.falhou ? 'falhou' : 'rótulo não encontrado'}).`, '')
}

writeFileSync(OUT, md.join('\n'))
console.log('\n===== RESUMO =====')
resumo.forEach((r) => console.log(' ' + r))
console.log(' banca:', banca.r ? 'rodou' : 'NAO RODOU')
for (const rot of ['procedencia', 'assets faltantes', 'dados do grafico', 'bacilo-a', 'bacilo-b', 'bacilo-c']) { const p = pega(rot); console.log(` ${rot}:`, p.r ? 'ok' : (p.falhou ? 'FALHOU' : 'AUSENTE')) }
console.log('\n->', OUT)
