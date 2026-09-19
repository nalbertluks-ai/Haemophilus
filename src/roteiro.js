// Coreografia declarativa. Cada passo descreve a POSE COMPLETA do palco: de qualquer passo para
// qualquer outro o resultado e sempre o mesmo (nada de estado acumulado).
// O TEXTO vem de src/conteudo.js (mesmos ids). Aqui so ha imagem, modelo e layout.
//
// m: pose do modelo { x, y, escala, rx, ry, rz, giro } + estado do modelo em `e`
// midia: lista de itens (ver engine/midia.js). texto: 'esq' | 'dir' | 'centro' | 'baixo' | 'topo-esq'
import { DADOS_HIB } from './dados.js'

const F = (n) => `/assets/fotos/${n}.webp`
const XD = 1.75, XE = -1.75 // modelo a direita / a esquerda da coluna de texto

export const CAPITULOS = [
  { id: 'abertura', nome: 'Histórico', acento: '#e0a458' },
  { id: 'identidade', nome: 'Morfologia', acento: '#ff5c9a' },
  { id: 'exigencia', nome: 'Exigências', acento: '#ff5a5f' },
  { id: 'identificacao', nome: 'Identificação', acento: '#f2b441' },
  { id: 'arsenal', nome: 'Virulência', acento: '#1fb8a6' },
  { id: 'espectro', nome: 'Clínica', acento: '#ff7a45' },
  { id: 'fpb', nome: 'FPB', acento: '#ff4d5a' },
  { id: 'tratamento', nome: 'Tratamento', acento: '#6ea2ff' },
  { id: 'prevencao', nome: 'Prevenção', acento: '#6fd08c' },
  { id: 'estudo', nome: 'Glossário', acento: '#eadfc8' },
]

const SUMIDO = { escala: 0 }
const HIB = { capsula: 1, pili: 1 }, NT = { capsula: 0, pili: 0 }

export const PASSOS = [
  // ───────── 1 · abertura
  { cap: 'abertura', id: 'titulo', tipo: 'capa', texto: 'centro', m: { y: -0.9, escala: 0.74, rz: 1.35, rx: 0.1, giro: 0.2 }, midia: [{ id: 'mev', tipo: 'fundo', src: F('mev-colorizada'), limpo: true, opacidade: 0.1 }] },
  { cap: 'abertura', id: 'micrografia', texto: 'baixo', painel: true, m: SUMIDO, midia: [{ id: 'mev', tipo: 'fundo', src: F('mev-colorizada'), limpo: true }] },
  { cap: 'abertura', id: 'nome', texto: 'esq', painel: true, m: SUMIDO, midia: [{ id: 'enf', tipo: 'fundo', src: F('enfermaria-gripe-1918'), opacidade: 0.55 }, { tipo: 'quadro', src: F('pfeiffer-retrato'), ar: 0.83, tam: 1.0, zona: 'oposto' }] },
  { cap: 'abertura', id: 'legado', texto: 'dir', m: { x: XE + 0.3, escala: 1.7, rz: 0.9, giro: 0.06 }, e: { corte: 1, destaque: 'nucleoide' }, calls: ['nucleoide', 'plasmideo'] },

  // ───────── 2 · identidade
  { cap: 'identidade', id: 'gram', texto: 'esq', m: SUMIDO, midia: [{ id: 'gram', tipo: 'lente', src: F('gram-escarro'), zona: 'centro' }] },
  { cap: 'identidade', id: 'ficha', texto: 'dir', m: SUMIDO, midia: [{ id: 'gram', tipo: 'lente', src: F('gram-escarro'), zona: 'centro' }] },
  { cap: 'identidade', id: 'envelope', texto: 'esq', m: { x: 1.2, escala: 1.9, rz: 0.25, giro: 0.05 }, e: { corte: 1, ...NT }, calls: ['membranaExterna', 'peptidoglicano', 'membranaInterna'] },
  { cap: 'identidade', id: 'escala', texto: 'dir', m: { x: XE, escala: 0.03, giro: 0.4 }, midia: [{ id: 'gram', tipo: 'lente', src: F('gram-escarro'), zona: 'centro', tam: 1.1 }] },

  // ───────── 3 · exigencia
  { cap: 'exigencia', id: 'fastidioso', texto: 'esq', m: { x: 1.0, escala: 1.1, giro: 0.06 }, e: { energia: 0 }, midia: [{ id: 'as', tipo: 'lente', src: F('agar-sangue'), tam: 0.56, zona: 'oposto', legenda: 'Ágar sangue de carneiro' }] },
  { cap: 'exigencia', id: 'fatorX', texto: 'esq', m: { x: 1.35, escala: 1.5, rz: 0.3, giro: 0.05 }, e: { energia: 0.12, corte: 1, ...NT, destaque: 'membranaInterna' }, calls: ['membranaInterna'], rotulos: { membranaInterna: ['Citocromos', 'cadeia respiratória · dependem de heme'] } },
  { cap: 'exigencia', id: 'fatorV', texto: 'esq', m: { x: 1.35, escala: 1.5, rz: 0.3, giro: 0.05 }, e: { energia: 0.25, corte: 1, ...NT, destaque: 'ribossomos' }, calls: ['ribossomos'], rotulos: { ribossomos: ['NAD · NADP', 'carreadores de elétrons do metabolismo'] } },
  { cap: 'exigencia', id: 'chocolate', texto: 'esq', painel: true, m: { x: XD, escala: 1.05, giro: 0.25 }, e: { energia: 1 }, midia: [{ id: 'ac', tipo: 'fundo', src: F('agar-chocolate-cdc'), opacidade: 0.8 }] },
  { cap: 'exigencia', id: 'colonias', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('colonias-24h'), ar: 1.33, tam: 0.5, zona: 'perto', legenda: '24 h' }, { tipo: 'quadro', src: F('colonias-48h'), ar: 1.33, tam: 0.5, zona: 'centro', legenda: '48 h' }, { tipo: 'quadro', src: F('colonias-72h'), ar: 1.33, tam: 0.5, zona: 'oposto', legenda: '72 h' }] },

  // ───────── 4 · identificacao
  { cap: 'identificacao', id: 'discos', texto: 'esq', m: SUMIDO, midia: [{ id: 'xv', tipo: 'quadro', src: F('discos-xv'), ar: 1.5, tam: 1.25, zona: 'centro' }] },
  { cap: 'identificacao', id: 'porfirina', texto: 'dir', m: SUMIDO, midia: [{ id: 'xv', tipo: 'quadro', src: F('discos-xv'), ar: 1.5, tam: 0.9, zona: 'centro' }] },
  { cap: 'identificacao', id: 'satelitismo', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'lente', src: '/assets/video/satelitismo.mp4', poster: '/assets/video/satelitismo.jpg', video: true, velocidade: 0.7, zona: 'centro', tam: 1.1, foco: '50% 12%', legenda: 'Colônias-satélite de <em>H. influenzae</em> junto à estria de <em>S. aureus</em>, ágar sangue' }] },
  { cap: 'identificacao', id: 'fechamento', fatia: [0, 5], texto: 'dir', m: SUMIDO, midia: [{ id: 'gcdc', tipo: 'lente', src: F('gram-cdc-colorizado'), zona: 'centro', tam: 0.9 }] },
  { cap: 'identificacao', id: 'fechamento', fatia: [5, 10], texto: 'dir', m: SUMIDO, midia: [{ id: 'gcdc', tipo: 'lente', src: F('gram-cdc-colorizado'), zona: 'oposto', tam: 0.6 }, { tipo: 'quadro', src: F('agar-chocolate-cdc-placa'), ar: 1.02, tam: 0.62, zona: 'perto' }] },

  // ───────── 5 · arsenal (o modelo e o assunto)
  { cap: 'arsenal', id: 'visao', tipo: 'cores', texto: 'esq', m: { x: XD - 0.2, escala: 1.45, giro: 0.28 }, e: { corte: 0.85 } },
  { cap: 'arsenal', id: 'capsula', texto: 'esq', m: { x: XD - 0.5, y: -0.1, escala: 0.95, rz: 1.2, giro: 0.08 }, e: { explodir: 0.5, corte: 0.7, destaque: 'capsula' }, calls: ['capsula'] },
  { cap: 'arsenal', id: 'los', texto: 'dir', m: { x: XE + 0.3, y: -0.15, escala: 1.9, rz: 0.2, giro: 0.05 }, e: { ...NT, destaque: 'los' }, calls: ['los', 'membranaExterna'] },
  { cap: 'arsenal', id: 'iga', texto: 'esq', m: { x: XD - 0.2, escala: 1.25, giro: 0.12 }, e: { ...NT, secrecao: 1, destaque: 'secrecao' }, calls: ['secrecao'] },
  { cap: 'arsenal', id: 'adesao', texto: 'dir', m: { x: XE + 0.2, escala: 1.6, giro: 0.1 }, e: { capsula: 0, pili: 1 }, calls: ['pili', 'adesinas', 'porinas'] },
  { cap: 'arsenal', id: 'biofilme', texto: 'esq', painel: true, m: SUMIDO, midia: [{ id: 'mev', tipo: 'fundo', src: F('mev-colorizada') }] },
  { cap: 'arsenal', id: 'competencia', texto: 'dir', m: { x: XE + 0.2, escala: 1.8, rz: 0.8, giro: 0.06 }, e: { ...NT, corte: 1, destaque: 'nucleoide' }, calls: ['nucleoide', 'plasmideo'] },

  // ───────── 6 · espectro
  { cap: 'espectro', id: 'vitrine', tipo: 'vitrine', texto: 'topo-esq', m: SUMIDO, vitrine: { v: 1 } },
  { cap: 'espectro', id: 'hib', texto: 'esq', m: { x: XD, escala: 1.3, giro: 0.2 }, e: HIB, calls: ['capsula', 'pili'] },
  { cap: 'espectro', id: 'epiglotite', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'lente', src: '/assets/video/epiglotite.mp4', poster: '/assets/video/epiglotite.jpg', video: true, zona: 'perto', tam: 0.92, legenda: 'Laringoscopia: epiglote edemaciada, vermelho-cereja' }, { tipo: 'quadro', src: F('sinal-do-polegar'), ar: 0.8, tam: 0.7, zona: 'oposto' }] },
  { cap: 'espectro', id: 'celulite', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('celulite-periorbitaria'), ar: 1.5, zona: 'centro', sensivel: true, legenda: 'Celulite periorbitária por <em>H. influenzae</em> tipo b' }] },
  { cap: 'espectro', id: 'meningite', texto: 'esq', painel: true, m: SUMIDO, midia: [{ tipo: 'fundo', src: F('cerebro-exsudato'), credito: 'Base do encéfalo com exsudato purulento, meningite por H. influenzae · CDC' }] },
  { cap: 'espectro', id: 'nthi', texto: 'dir', m: { x: XE, escala: 1.3, giro: 0.2 }, e: NT, calls: ['adesinas', 'los'] },
  { cap: 'espectro', id: 'otite', texto: 'dir', m: SUMIDO, midia: [{ tipo: 'lente', src: F('otite-abaulada'), zona: 'centro', legenda: 'Otoscopia: membrana timpânica abaulada, com nível e bolhas' }] },
  { cap: 'espectro', id: 'dpoc', texto: 'dir', m: { x: XE - 0.9, escala: 0.8 }, e: NT, midia: [{ tipo: 'quadro', src: F('dpoc-enfisema'), ar: 0.85, tam: 0.95, zona: 'perto' }] },
  { cap: 'espectro', id: 'ducreyi', fatia: [0, 5], texto: 'esq', m: SUMIDO, midia: [{ tipo: 'lente', src: F('ducreyi-gram-2'), tam: 0.62, zona: 'perto', legenda: 'Gram: cadeias paralelas, “cardume de peixes”' }, { tipo: 'quadro', src: F('cancro-mole-1'), ar: 1.44, tam: 0.66, zona: 'oposto', sensivel: true, legenda: 'Cancro mole: úlceras dolorosas de fundo purulento' }] },
  { cap: 'espectro', id: 'ducreyi', fatia: [5, 11], texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('bubao-inguinal'), ar: 2.71, tam: 1.5, zona: 'centro', sensivel: true, legenda: 'Bubão inguinal no cancro mole' }] },
  { cap: 'espectro', id: 'parainfluenzae', texto: 'esq', m: SUMIDO, vitrine: { v: 1, foco: 3, focoX: 1.9 } },

  // ───────── 7 · fpb
  { cap: 'fpb', id: 'abertura', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('promissao-mapa'), ar: 1.6, tam: 1.3, zona: 'centro', filtro: 'mapa' }] },
  { cap: 'fpb', id: 'agente', texto: 'esq', m: { x: XD + 0.25, escala: 1.3, rz: 0.55, giro: 0.08 }, e: { ...NT, corte: 1, destaque: 'plasmideo' }, calls: ['plasmideo'], rotulos: { plasmideo: ['Plasmídeo 3031', '≈ 24 MDa · marcador do clone'] }, midia: [{ tipo: 'lente', src: F('aegyptius-gram'), tam: 0.4, zona: 'perto', dy: 0.04 }] },
  { cap: 'fpb', id: 'conjuntivite', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('conjuntivite-cdc'), ar: 2.65, tam: 1.6, zona: 'centro' }] },
  { cap: 'fpb', id: 'intervalo', tipo: 'numero', texto: 'centro', m: SUMIDO },
  { cap: 'fpb', id: 'purpura', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('purpura-membro-inferior'), ar: 0.68, tam: 0.78, zona: 'perto', sensivel: true }, { tipo: 'quadro', src: F('purpura-torax'), ar: 0.77, tam: 0.78, zona: 'oposto', sensivel: true }] },
  { cap: 'fpb', id: 'mecanismo', texto: 'dir', m: { x: XE + 0.2, escala: 1.7, giro: 0.1 }, e: { ...NT, secrecao: 1, destaque: 'los' }, calls: ['los'], rotulos: { los: ['LOS · lipídeo A', 'TLR4 → TNF-α · IL-1 · IL-6'] } },
  { cap: 'fpb', id: 'dados', texto: 'esq', m: { x: XD + 0.4, escala: 0.9 }, e: NT },

  // ───────── 8 · tratamento (o alvo esta dentro do modelo)
  { cap: 'tratamento', id: 'alvo', texto: 'esq', m: { x: 1.15, escala: 1.55, rz: 0.12, giro: 0.04 }, e: { ...NT, corte: 1, divisao: 1, destaque: 'pbp3' }, calls: ['pbp3', 'peptidoglicano', 'porinas'] },
  { cap: 'tratamento', id: 'invasivo', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('ceftriaxona-estrutura-clara'), ar: 2.02, tam: 1.45, zona: 'centro', filtro: 'quimica', legenda: 'Ceftriaxona' }] },
  { cap: 'tratamento', id: 'dexametasona', texto: 'dir', m: { x: XE, escala: 1.1 }, e: HIB },
  { cap: 'tratamento', id: 'naoInvasivo', texto: 'esq', m: { x: XD, escala: 1.1 }, e: NT },
  { cap: 'tratamento', id: 'betalactamase', texto: 'esq', m: { x: 1.15, escala: 1.95, rz: 0.2, giro: 0.04 }, e: { ...NT, corte: 1, destaque: 'betaLactamase' }, calls: ['betaLactamase', 'peptidoglicano'] },
  { cap: 'tratamento', id: 'blnar', texto: 'dir', m: { x: XE + 0.55, escala: 1.55, rz: 0.12, giro: 0.04 }, e: { ...NT, corte: 1, divisao: 1, destaque: 'pbp3' }, calls: ['pbp3'], rotulos: { pbp3: ['PBP3 alterada', 'mutações em ftsI'] } },

  // ───────── 9 · prevencao
  { cap: 'prevencao', id: 'tindependente', texto: 'esq', m: { x: XD - 0.2, escala: 1.4, giro: 0.12 }, e: { explodir: 0.35, destaque: 'capsula' }, calls: ['capsula'] },
  { cap: 'prevencao', id: 'conjugacao', tipo: 'conjugado', texto: 'dir', m: SUMIDO },
  { cap: 'prevencao', id: 'tdependente', tipo: 'imuno', texto: 'dir', m: SUMIDO },
  { cap: 'prevencao', id: 'brasil', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'quadro', src: F('vacinacao-crianca-1'), ar: 1.29, zona: 'centro' }] },
  { cap: 'prevencao', id: 'grafico', texto: 'esq', m: SUMIDO, midia: [{ tipo: 'grafico', dados: DADOS_HIB, zona: 'centro' }] },
  { cap: 'prevencao', id: 'substituicao', texto: 'dir', m: { x: XE, escala: 1.3, giro: 0.2 }, e: NT },
  { cap: 'prevencao', id: 'fecho', tipo: 'fecho', texto: 'centro', m: { y: 0.95, escala: 1.05, rz: 1.25, giro: 0.3 }, e: HIB },

  // ───────── 10 · estudo
  { cap: 'estudo', id: 'glossario', tipo: 'estudo', texto: 'centro', m: SUMIDO },
]
