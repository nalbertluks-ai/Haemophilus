// Pipeline de assets: le a pasta de originais, descarta duplicados e inutilizaveis,
// renomeia, converte para WebP no tamanho de exibicao e gera um manifesto.
// Uso:  node tools/assets.mjs            (fotos)
//       node tools/assets.mjs --video    (tambem recodifica os videos)
import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const run = promisify(execFile)
const SRC = 'C:/Users/nalbe/Downloads/slide tal/hamelofilos'
const OUT = 'C:/Users/nalbe/Downloads/slide tal/haemophilus/public/assets/fotos'
const OUT_VIDEO = 'C:/Users/nalbe/Downloads/slide tal/haemophilus/public/assets/video'
const MAX_W = 2560

// nome de saida -> { src, ops }
// ops: trim (remove bordas pretas), contraste (realca lamina lavada), max (largura maxima)
const FOTOS = {
  'mev-colorizada':         { src: '1.png', nota: 'PROCEDENCIA PENDENTE' },
  'gram-escarro':           { src: 'Haemophilus_influenzae_sputum_1000x_edited.jpg', contraste: true },
  'phil-1947':              { src: '1947_lores.jpg', nota: 'PROCEDENCIA PENDENTE' },
  'gram-positivo-contraste':{ src: '1000x_Magnification_of_Gram_Stain_of_Ligilactobacillus_animalis_Under_Brightfield_Microscopy ótima qualidade.jpg', nota: 'Lactobacillus - so para contraste de coloracao' },
  'agar-sangue':            { src: 'satelitismo.png' },
  'agar-chocolate':         { src: 'Haemophilus_influenzae aga chcolate tavkez.jpg' },
  'agar-chocolate-pequena': { src: 'haemophilus-ducreyi_01(1)-350x220 chcollate hagar.png' },
  'discos-xv':              { src: 'testes do x v e xv.png' },
  'cerebro-exsudato':       { src: 'hib-2.jpg' },
  'epiglote':               { src: 'epiglottitis_endoscopy.jpg', trim: true },
  'otite-abaulada':         { src: 'otite media 2.webp' },
  'otite-1':                { src: 'otite media 1.jpg' },
  'celulite-periorbitaria': { src: 'criança.avif' },
  'cancro-mole-1':          { src: 'chancro mole.jpg' },
  'cancro-mole-2':          { src: 'chancroid.webp' },
  'ducreyi-gram-1':         { src: 'ducrey.jpg' },
  'ducreyi-gram-2':         { src: 'ducrey2.jpg' },
  'ducreyi-render':         { src: 'haemophilus-ducreyi.jpg' },
  'cocobacilos-render':     { src: 'haemophilus-influenzae-type-b-vaccine-market-a-lifesaver-for-global-health-expansion.webp' },
  'conjuntivite':           { src: 'Conjuntivite-bacteriana.jpg' },
  'esquema-fagocito':       { src: 'Macrophage or polymorphonuclear leukocyte phagocytosing H influenzae coated with antibodies specific for the capsule and somatic antigen..jpg', nota: 'so referencia para redesenho' },
}

// Descartados e por que (fica documentado no manifesto)
const DESCARTADOS = {
  '360_F_1758233442_POS8DxbHtTWZO9w3N3SHKafCud0tWsp3.jpg': 'miniatura de banco pago, bacilos genericos',
  '2317730-bacterial-pili-haemophilus-ducreyi.jpg': 'marca d agua Science Source',
  'haemophilus-ducreyi-bacteria-cnriscience-photo-library.jpg': '276x400, direitos reservados',
  'melhor qualidade agar choco.jpg': 'marca d agua microbiologyinpictures',
  'vacina haemolfilus b.png': 'duplicata menor do render de cocobacilos; nao e vacina',
  'Haemophilus_influenzae agar chocolate': 'duplicata exata (hash) da placa tavkez',
  'inferior viwew of a brain infected withe hame influenz.avif': 'duplicata do hib-2.jpg em pior qualidade',
  'chacro mole na boca.png': 'captura de PowerPoint; lesoes papilomatosas, nao e cancro mole',
  'febre purpurica.jpg': '228 px; exantema nao compativel com purpura fulminante',
}

async function foto(nome, cfg) {
  let img = sharp(path.join(SRC, cfg.src), { failOn: 'none' }).rotate()
  if (cfg.trim) img = img.trim({ background: '#000', threshold: 24 })
  if (cfg.contraste) img = img.normalise().linear(1.25, -22)
  const meta = await img.metadata()
  const w = Math.min(meta.width || MAX_W, cfg.max || MAX_W)
  const out = path.join(OUT, `${nome}.webp`)
  const info = await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toFile(out)
  return { nome, arquivo: `assets/fotos/${nome}.webp`, w: info.width, h: info.height, kb: Math.round(info.size / 1024), origem: cfg.src, nota: cfg.nota || '' }
}

async function video(nome, src, filtros) {
  const out = path.join(OUT_VIDEO, `${nome}.mp4`)
  // -g 1: todo quadro e keyframe, para o scrub por scroll nao travar. -an: sem audio.
  await run(ffmpegPath, ['-y', '-i', path.join(SRC, src), '-vf', filtros, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-g', '1', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
  const poster = path.join(OUT_VIDEO, `${nome}.jpg`)
  await run(ffmpegPath, ['-y', '-ss', '2', '-i', out, '-frames:v', '1', '-q:v', '2', poster])
  const s = await stat(out)
  return { nome, arquivo: `assets/video/${nome}.mp4`, poster: `assets/video/${nome}.jpg`, kb: Math.round(s.size / 1024) }
}

await mkdir(OUT, { recursive: true })
await mkdir(OUT_VIDEO, { recursive: true })

const fotos = []
for (const [nome, cfg] of Object.entries(FOTOS)) {
  try { fotos.push(await foto(nome, cfg)); console.log('ok  ', nome) }
  catch (e) { console.error('ERRO', nome, e.message) }
}

const videos = []
if (process.argv.includes('--video')) {
  // satelitismo: 720x1280 vertical; a placa ocupa o centro. Recorte quadrado e 1080p.
  videos.push(await video('satelitismo', 'satelitismo mostrado num agar sangue.mp4', 'crop=720:720:0:300,scale=1080:1080:flags=lanczos'))
  // epiglotite: 1270x720, campo do endoscopio no centro e escuro. Recorte, clareia e sobe gama.
  videos.push(await video('epiglotite', 'epiglotite.mp4', 'crop=720:720:275:0,eq=brightness=0.08:contrast=1.15:gamma=1.35:saturation=1.1,scale=1080:1080:flags=lanczos'))
  console.log('videos ok')
}

await writeFile(path.join(OUT, '..', 'manifesto.json'), JSON.stringify({ fotos, videos, descartados: DESCARTADOS }, null, 2))
console.log(`\n${fotos.length} fotos, ${videos.length} videos -> manifesto.json`)
