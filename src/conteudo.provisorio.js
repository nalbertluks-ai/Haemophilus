// Provisorio: so existe para o motor rodar antes de src/conteudo.js ficar pronto.
export const CONTEUDO = new Proxy({}, { get: (_, cap) => ({ passos: new Proxy({}, { get: (_, id) => ({ kicker: String(cap), titulo: String(id), corpo: '<p>Texto em redação.</p>' }) }) }) })
export const GLOSSARIO = {}
