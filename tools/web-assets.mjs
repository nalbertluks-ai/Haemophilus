// Segundo lote de assets: imagens baixadas da internet (CDC PHIL, Wikimedia Commons,
// Wellcome, artigos de acesso aberto CC BY) -> WebP em public/assets/fotos.
// NUNCA sobrescreve arquivo que ja existia na pasta antes deste script (ver PROTEGIDOS).
// Uso:  node tools/web-assets.mjs                  (tudo; aborta se algum webp ja existir)
//       node tools/web-assets.mjs --so nome1,nome2  (so esses itens; apague/mova o webp antigo antes)
// Proveniencia, licenca e legenda de cada saida: public/assets/creditos.json e docs/CREDITOS.md
import sharp from 'sharp'
import { mkdir, readdir, access } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'C:/Users/nalbe/Downloads/slide tal/hamelofilos/web'
const OUT = 'C:/Users/nalbe/Downloads/slide tal/haemophilus/public/assets/fotos'
const MAX_W = 2560
const Q = 88

// Arquivos do primeiro lote (tools/assets.mjs). Se um nome daqui colidir, o script aborta.
const PROTEGIDOS = new Set([
  'agar-chocolate', 'agar-chocolate-pequena', 'agar-sangue', 'cancro-mole-1', 'cancro-mole-2',
  'celulite-periorbitaria', 'cerebro-exsudato', 'cocobacilos-render', 'conjuntivite', 'discos-xv',
  'ducreyi-gram-1', 'ducreyi-gram-2', 'ducreyi-render', 'epiglote', 'esquema-fagocito',
  'gram-escarro', 'gram-positivo-contraste', 'mev-colorizada', 'otite-1', 'otite-abaulada', 'phil-1947',
])

// nome de saida -> { src, ...ops }
// ops:
//   recorte: { left, top, width, height } em FRACAO (0..1) da imagem original
//   max: largura maxima de saida (px)  ·  contraste: realca lamina/radiografia
//   fundo: cor de fundo para achatar PNG/SVG com alfa
//   tapa: [{ left, top, width, height, cor }] em FRACAO da imagem JA recortada: retangulo opaco sobre anotacao do aparelho
const FOTOS = {
  // --- 1 abertura ---------------------------------------------------------
  'pfeiffer-retrato':        { src: 'pfeiffer-wellcome-m0012821.jpg', recorte: { left: 0.02, top: 0.06, width: 0.96, height: 0.72 }, max: 1800 },
  'pfeiffer-1928':           { src: 'pfeiffer-1928-nlm.jpg', max: 1105 },
  'koch-pfeiffer-1897':      { src: 'koch-pfeiffer-1897-wellcome.jpg', max: 2400 },
  'enfermaria-gripe-1918':   { src: 'enfermaria-gripe-1918-camp-funston.jpg', max: 2560 },
  'enfermaria-gripe-1918-b': { src: 'enfermaria-gripe-1918-walter-reed.jpg', max: 1536 },
  'hamilton-smith':          { src: 'hamilton-smith-retrato.jpg', max: 500 },
  'daniel-nathans':          { src: 'daniel-nathans-1987.jpg', max: 500 },
  'werner-arber':            { src: 'werner-arber-basel.jpg', max: 500 },
  // 'genoma-circular' DESCARTADO na conferencia visual: a Fig. 3 de Su et al. 2014 (BMC Genomics, PMC3928620)
  // e um diagrama de Venn + graficos de pizza, nao um mapa circular do genoma. Ver docs/CREDITOS.md.

  // --- 2/3 identidade e exigencia ----------------------------------------
  'gram-cdc-colorizado':     { src: 'phil-23029-gram-colorizado.tif', max: 2560 },
  'gram-cdc-1947':           { src: 'phil-1947-gram.tif', max: 2400 },
  'colonias-24h':            { src: 'phil-17142-colonias-24h.tif', max: 2048 },
  'colonias-48h':            { src: 'phil-17143-colonias-48h.tif', max: 2048 },
  'colonias-72h':            { src: 'phil-17141-colonias-72h.tif', max: 2048 },
  'agar-chocolate-cdc':      { src: 'phil-12449-agar-chocolate-close.tif', max: 2560 },
  'agar-chocolate-cdc-placa':{ src: 'phil-12448-agar-chocolate-placa.tif', max: 2400 },

  // --- 4 identificacao ----------------------------------------------------
  'disco-xv':                { src: 'discos-xv-commons.jpg', recorte: { left: 0.12, top: 0, width: 0.63, height: 1 }, max: 2560 }, // tira o carimbo de data da camera e a mao enluvada

  // --- 6 espectro ---------------------------------------------------------
  'sinal-do-polegar':        { src: 'sinal-do-polegar-epiglotite.jpg', max: 800, contraste: true },
  'meningite-rm':            { src: 'meningite-rm-flair.jpg', recorte: { left: 0.125, top: 0.03, width: 0.69, height: 0.95 }, tapa: [{ left: 0, top: 0.03, width: 0.05, height: 0.08, cor: '#000000' }], max: 1280 }, // tira data do exame e marca do software
  'pneumonia-lobar':         { src: 'pneumonia-lobar-rx.jpg', max: 2400 },
  'dpoc-enfisema':           { src: 'dpoc-torax-enfisema.jpg', recorte: { left: 0.0225, top: 0.045, width: 0.955, height: 0.955 }, max: 2270 }, // tira 'Sex: M 1943' do canto; mesma proporcao (0,845)
  'bubao-inguinal':          { src: 'phil-5811-buboes-bilaterais.tif', recorte: { left: 0, top: 0, width: 1, height: 0.56 }, max: 2000 }, // 0.56: a genitalia comeca em ~0.60 da altura
  'bubao-roto':              { src: 'phil-5810-bubao-roto.tif', recorte: { left: 0, top: 0, width: 1, height: 0.72 }, max: 2000 },

  // --- 7 febre purpurica brasileira --------------------------------------
  'promissao-mapa':          { src: 'promissao-mapa-sp.png', max: 1280, fundo: '#12100e' },
  'aegyptius-gram':          { src: 'phil-18441-aegyptius-gram.tif', max: 2560 },
  'aegyptius-colonias':      { src: 'phil-29345-aegyptius-colonias.tif', max: 2400 },
  'aegyptius-placa':         { src: 'phil-1611-aegyptius-placa.tif', max: 2400 },
  'conjuntivite-cdc':        { src: 'phil-15192-conjuntivite-crianca.tif', max: 2400 },
  'purpura-membro-superior': { src: 'purpura-meningo-membro-superior.jpg', max: 1400 },
  'purpura-torax':           { src: 'purpura-meningo-torax.jpg', max: 1400 },
  'purpura-membro-inferior': { src: 'purpura-meningo-membro-inferior.jpg', max: 1400 },
  'purpura-necrose-digital': { src: 'purpura-hinfluenzae-fig4.jpg', recorte: { left: 0.657, top: 0.592, width: 0.343, height: 0.408 }, max: 1200 }, // so o painel C (mao); sem o painel B (face/ombros) e sem a letra

  // --- 8 tratamento -------------------------------------------------------
  'ceftriaxona-frasco':      { src: 'ceftriaxona-frasco.jpg', max: 1280 },
  'ceftriaxona-estrutura':   { src: 'ceftriaxona-estrutura.png', max: 2560, fundo: '#ffffff' }, // traco preto sobre fundo BRANCO (sobre #12100e o traco ficava invisivel). O roteiro usa ceftriaxona-estrutura-clara.webp (traco creme, fundo transparente), gerada fora deste script

  // --- 9 prevencao --------------------------------------------------------
  'vacina-hib-frasco':       { src: 'vacina-hib-acthib.jpg', max: 1280 },
  'vacina-hib-hexavalente':  { src: 'vacina-hib-infanrix-hexa.jpg', max: 960 }, // era 'vacina-hib-pentavalente': o frasco e o componente Hib da HEXAvalente (Infanrix hexa)
  'vacinacao-crianca-1':     { src: 'phil-30746-vacinacao-coxa.tif', max: 2560 },
  'vacinacao-crianca-2':     { src: 'phil-30745-vacinacao-menina.tif', max: 2560 },
  'vacinacao-crianca-3':     { src: 'phil-30749-vacinacao-braco.tif', max: 2560 },
  'ze-gotinha':              { src: 'ze-gotinha-2023.jpg', max: 1280 },
}

async function existe(p) { try { await access(p); return true } catch { return false } }

async function foto(nome, cfg) {
  const entrada = path.join(SRC, cfg.src)
  let img = sharp(entrada, { failOn: 'none', limitInputPixels: false }).rotate()
  let meta = await img.metadata()
  if (cfg.recorte) {
    const r = cfg.recorte
    const left = Math.round(r.left * meta.width), top = Math.round(r.top * meta.height)
    const width = Math.min(Math.round(r.width * meta.width), meta.width - left)
    const height = Math.min(Math.round(r.height * meta.height), meta.height - top)
    img = img.extract({ left, top, width, height })
    meta = { width, height }
  }
  if (cfg.fundo) img = img.flatten({ background: cfg.fundo })
  if (cfg.contraste) img = img.normalise()
  const w = Math.min(meta.width || MAX_W, cfg.max || MAX_W, MAX_W)
  const destino = path.join(OUT, `${nome}.webp`)
  img = img.resize({ width: w, withoutEnlargement: true })
  if (cfg.tapa) {
    const { data, info: i0 } = await img.png().toBuffer({ resolveWithObject: true })
    img = sharp(data).composite(cfg.tapa.map(t => ({
      input: { create: { width: Math.max(1, Math.round(t.width * i0.width)), height: Math.max(1, Math.round(t.height * i0.height)), channels: 3, background: t.cor || '#000000' } },
      left: Math.round(t.left * i0.width), top: Math.round(t.top * i0.height),
    })))
  }
  const info = await img.webp({ quality: Q, effort: 5 }).toFile(destino)
  return { nome, arquivo: `assets/fotos/${nome}.webp`, w: info.width, h: info.height, kb: Math.round(info.size / 1024), origem: cfg.src }
}

await mkdir(OUT, { recursive: true })

// --so nome1,nome2 : processa apenas esses itens
const iSo = process.argv.indexOf('--so')
if (iSo > -1) {
  const quais = new Set((process.argv[iSo + 1] || '').split(',').map(s => s.trim()).filter(Boolean))
  for (const q of quais) if (!FOTOS[q]) { console.error(`--so: "${q}" nao existe em FOTOS`); process.exit(1) }
  for (const nome of Object.keys(FOTOS)) if (!quais.has(nome)) delete FOTOS[nome]
}

// trava de seguranca: nada daqui pode ter o nome de um arquivo do primeiro lote
const jaExistiam = new Set((await readdir(OUT)).filter(f => f.endsWith('.webp')).map(f => f.replace(/\.webp$/, '')))
for (const nome of Object.keys(FOTOS)) {
  if (PROTEGIDOS.has(nome)) { console.error(`ABORTADO: "${nome}" e um arquivo do primeiro lote.`); process.exit(1) }
  if (jaExistiam.has(nome) && !process.argv.includes('--refazer')) {
    console.error(`ABORTADO: "${nome}.webp" ja existe na pasta. Use --refazer se for reconversao deste mesmo script.`); process.exit(1)
  }
}

const resultados = []
for (const [nome, cfg] of Object.entries(FOTOS)) {
  if (!(await existe(path.join(SRC, cfg.src)))) { console.error('FALTA', nome, cfg.src); continue }
  try { const r = await foto(nome, cfg); resultados.push(r); console.log(`ok   ${nome.padEnd(26)} ${r.w}x${r.h}  ${r.kb} KB`) }
  catch (e) { console.error('ERRO', nome, e.message) }
}
console.log(`\n${resultados.length} imagens convertidas em ${OUT}`)
