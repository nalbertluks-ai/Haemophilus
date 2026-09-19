export const meta = {
  name: 'haemophilus-v2',
  description: 'Tres variantes concorrentes do modelo 3D anatomico (uma via Blender), reescrita do texto dos slides com revisao anti-vicio-de-IA, curadoria e download de imagens licenciadas, e banca simulada',
  phases: [
    { title: 'Modelo 3D', detail: 'tres abordagens independentes do mesmo contrato' },
    { title: 'Texto', detail: 'redacao dos slides e das falas, duas revisoes, correcao' },
    { title: 'Imagens', detail: 'curadoria, download e creditos' },
    { title: 'Banca', detail: 'perguntas provaveis do professor' },
  ],
}

const RAIZ = 'C:\\Users\\nalbe\\Downloads\\slide tal\\haemophilus'
const DOCS = RAIZ + '\\docs'
const BLENDER = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe'

const CONTEXTO = `Contexto do projeto: apresentacao academica em HTML (Vite + Three.js 0.186 + GSAP 3.15), para um seminario de microbiologia medica de graduacao em medicina, tema Haemophilus. E ilustracao e ensino de conteudo de livro-texto. Projeto em ${RAIZ}. Leia primeiro ${DOCS}\\CONTRATO-MODELO.md e ${DOCS}\\ESTRUTURA.md.`

const NAVEGADOR = `VERIFICACAO NO NAVEGADOR (obrigatoria): o Vite ja esta rodando em http://localhost:5180 (NAO suba outro servidor, NAO mate esse). Carregue as ferramentas com ToolSearch "select:mcp__Claude_Browser__tabs_create,mcp__Claude_Browser__navigate,mcp__Claude_Browser__computer,mcp__Claude_Browser__read_console_messages,mcp__Claude_Browser__javascript_tool,mcp__Claude_Browser__tabs_close". Crie a SUA PROPRIA aba com tabs_create e passe esse tabId em TODAS as chamadas; nunca navegue, feche ou use aba que nao seja a sua (outros agentes estao usando o mesmo navegador). Tire screenshots com o modelo: fechado; com corte = 1; com explodir = 1; com destaque em pelo menos 4 estruturas; com capsula = 0. LEIA o console. Tela preta, erro de shader ou erro de import = conserte e repita. Olhe os screenshots com olho critico de diretor de arte: se parecer bala de goma, brinquedo, ou tudo da mesma cor, refaca materiais e luz. Feche a sua aba ao terminar.`

const PROTO = {
  type: 'object',
  properties: {
    arquivos: { type: 'array', items: { type: 'string' } },
    abordagem: { type: 'string' },
    funciona: { type: 'boolean', description: 'true somente se voce VIU o modelo renderizado, sem erro de console' },
    draw_calls: { type: 'number' },
    pontos_fortes: { type: 'string' },
    pontos_fracos: { type: 'string', description: 'seja honesto: o que ainda esta feio ou incompleto' },
  },
  required: ['arquivos', 'abordagem', 'funciona', 'pontos_fracos'],
}

const MODELOS = [
  {
    key: 'a',
    prompt: `${CONTEXTO}

TAREFA: implementar a VARIANTE A do modelo anatomico, cumprindo o contrato a risca.
Arquivos seus (e so eles): ${RAIZ}\\src\\modelo\\variante-a.js, ${RAIZ}\\prototypes\\modelo-a.html, ${RAIZ}\\prototypes\\modelo-a.js.

ABORDAGEM A - Three.js fisico e procedural:
- Geometria procedural (capsulas concentricas bem subdivididas com deslocamento organico por ruido calculado em JS).
- Materiais MeshPhysicalMaterial/MeshStandardMaterial com mapas PROCEDURAIS gerados em canvas/DataTexture (normal map de micro-relevo, roughness map) - nada de arquivo externo.
- Corte (estado.corte) com renderer.localClippingEnabled + clippingPlanes formando uma cunha de ~100 graus, e TAMPAS nas faces cortadas (tecnica de stencil cap do exemplo oficial webgl_clipping_stencil, ou aneis de geometria nas faces do corte) para as tres camadas do envelope aparecerem como faixas coloridas distintas na secao.
- Instancing (InstancedMesh) para LOS, porinas, ribossomos, beta-lactamases, PBP3.
- Nucleoide: TubeGeometry ao longo de uma curva enovelada longa (random walk suavizado e confinado ao elipsoide central). Plasmideos: torus pequenos.
- Ambiente: PMREMGenerator a partir de RoomEnvironment ou de uma cena de softboxes gerada em codigo, com tom quente.
- destaque: escurecer e dessaturar as demais partes interpolando cor/emissive/opacity (guarde os valores base).
Pode consultar ${RAIZ}\\prototypes\\bacilo-a.html (prototipo antigo, monocromatico) para reaproveitar o que funcionou, mas o visual novo e multicolorido, anatomico e em fundo quente.

${NAVEGADOR}
Abra http://localhost:5180/prototypes/modelo-a.html`,
  },
  {
    key: 'b',
    prompt: `${CONTEXTO}

TAREFA: implementar a VARIANTE B do modelo anatomico, cumprindo o contrato a risca.
Arquivos seus (e so eles): ${RAIZ}\\src\\modelo\\variante-b.js, ${RAIZ}\\prototypes\\modelo-b.html, ${RAIZ}\\prototypes\\modelo-b.js.

ABORDAGEM B - shaders proprios, look de ilustracao cientifica cinematografica:
- Materiais com GLSL proprio (ShaderMaterial, ou onBeforeCompile sobre MeshPhysicalMaterial para manter luz e ambiente): fresnel de borda, falso espalhamento subsuperficial (wrap lighting + cor de transmissao), micro-relevo por ruido 3D no fragment shader, e translucidez em camadas para a capsula (mais opaca nas bordas, quase invisivel de frente).
- O CORTE e feito no shader: descarte (discard) dos fragmentos dentro da cunha angular definida por um uniform uCorte, com as FACES INTERNAS desenhadas (side: DoubleSide e cor/sombreamento proprio para back faces, ou geometria de tampa) para o envelope em tres camadas aparecer como faixas coloridas distintas na secao. O mesmo uniform e compartilhado por todas as cascas.
- A membrana deve sugerir bicamada (duas linhas finas na secao do corte).
- Citoplasma como volume falso: varias cascas internas aditivas bem tenues ou um shader de nevoa por profundidade, com os ribossomos (InstancedMesh ou Points com sprite esferico sombreado) dando granulacao.
- Nucleoide: tubo enovelado com brilho proprio suave; plasmideos: aneis.
- destaque implementado por uniforms (uDestaque por material): as outras partes perdem saturacao e brilho.
- Atencao a compatibilidade GLSL do Three 0.186 (WebGL2). Shader que nao compila = tela preta: leia o console.
Pode consultar ${RAIZ}\\prototypes\\bacilo-b.html (prototipo antigo, monocromatico) para reaproveitar o que funcionou, mas o visual novo e multicolorido, anatomico e em fundo quente.

${NAVEGADOR}
Abra http://localhost:5180/prototypes/modelo-b.html`,
  },
  {
    key: 'c',
    prompt: `${CONTEXTO}

TAREFA: implementar a VARIANTE C do modelo anatomico via BLENDER, cumprindo o contrato a risca.
O Blender 5.2 esta instalado em "${BLENDER}". Use-o em linha de comando, sem interface:
  "${BLENDER}" --background --python <script.py>
Arquivos seus (e so eles): ${RAIZ}\\tools\\blender\\gerar_bacilo.py, ${RAIZ}\\public\\assets\\modelo\\bacilo.glb (e texturas ao lado, se houver), ${RAIZ}\\src\\modelo\\variante-c.js, ${RAIZ}\\prototypes\\modelo-c.html, ${RAIZ}\\prototypes\\modelo-c.js.

ABORDAGEM C - modelagem no Blender, exportada em glTF:
- Um script Python (bpy) REPRODUZIVEL que constroi a celula do zero: cada estrutura do contrato como OBJETO SEPARADO E NOMEADO com a chave exata do contrato (capsula, membranaExterna, peptidoglicano, membranaInterna, nucleoide, plasmideo, ...). Use o que o Blender faz melhor que codigo no navegador: subdivisao, deslocamento por textura procedural aplicado (modifier aplicado antes de exportar), bevel de curvas para o nucleoide, malha em rede para o peptidoglicano (wireframe modifier), normais suaves, UVs, e bake de oclusao de ambiente/normal em textura se conseguir em tempo razoavel (Cycles em CPU com poucas amostras; se o bake estourar 10 minutos, desista do bake e exporte sem ele).
- As estruturas repetidas aos milhares (LOS, ribossomos, porinas) NAO devem ir como milhares de objetos no GLB. Exporte UMA malha-base de cada e um conjunto de pontos/posicoes (por exemplo um objeto de vertices "los_pontos" ou um JSON ao lado com posicoes e normais), e o wrapper JS instancia com InstancedMesh.
- As cascas do envelope devem ser exportadas inteiras; o corte e feito no wrapper JS com clippingPlanes (com tampas) ou no material.
- Materiais glTF PBR com as cores da tabela do contrato. Confira o tamanho do GLB: alvo menor que 15 MB.
- A API do bpy mudou entre versoes; o Blender aqui e 5.2. Rode o script, leia o erro, corrija, repita. Verifique o GLB gerado (tamanho, lista de nos) antes de seguir.
- O wrapper ${RAIZ}\\src\\modelo\\variante-c.js carrega /assets/modelo/bacilo.glb com GLTFLoader (three/addons/loaders/GLTFLoader.js), mapeia os nos para "partes", cria as instancias, e implementa estado/atualizar/destaque exatamente como no contrato.

${NAVEGADOR}
Abra http://localhost:5180/prototypes/modelo-c.html`,
  },
]

const ACHADOS = {
  type: 'object',
  properties: {
    achados: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          onde: { type: 'string', description: 'capitulo.passo e o campo (titulo, corpo, ficha...) ou o trecho das falas' },
          trecho: { type: 'string' },
          problema: { type: 'string' },
          sugestao: { type: 'string', description: 'texto substituto pronto' },
        },
        required: ['onde', 'trecho', 'problema', 'sugestao'],
      },
    },
  },
  required: ['achados'],
}

const REGRAS_TEXTO = `REGRAS DE TEXTO DO SLIDE (a parte mais importante desta tarefa):
O usuario reclamou, com razao, que o texto anterior "esta na cara que e IA" e que tinha metalinguagem ("quebra a regra que acabamos de ensinar"). O slide NAO narra, NAO conversa com a plateia e NAO comenta a propria apresentacao. Quem fala sao os tres estudantes; a fala vai em FALAS.md, nunca na tela.
No slide so entram: um rotulo curto (kicker), um titulo de 1 a 4 palavras, e no maximo 2 frases factuais OU uma ficha de pares termo/valor. Linguagem de livro-texto e de artigo: substantiva, precisa, impessoal, com numero e unidade.
PROIBIDO no slide: metalinguagem ("como vimos", "vamos ver", "a regra que ensinamos"); pergunta retorica; frase de efeito; personificacao da bacteria ("o reu", "ele acorda", "o invasivo do dia a dia", "versao"); travessao usado para suspense; a construcao "nao e X, e Y"; triades de efeito; dois-pontos de revelacao; adverbios de enfase vazios (justamente, simplesmente, na verdade, literalmente, vale destacar, e importante notar); "mergulhar", "jornada", "desvendar", "crucial", "fundamental", "robusto"; frases curtas em sequencia para dar drama; conclusao moralizante; emoji.
Antes de escrever, PESQUISE na web (WebSearch) listas atuais de marcas de texto gerado por IA, em portugues e em ingles (por exemplo: "sinais de texto escrito por IA", "AI writing tells", "Wikipedia:Signs of AI writing"), e use o que encontrar como lista negativa adicional. Resuma essa lista no topo de ${DOCS}\\ESTILO.md.`

const COPY_PROMPT = `${CONTEXTO}

TAREFA: escrever TODO o texto da apresentacao, em dois arquivos.
Leia: ${DOCS}\\ESTRUTURA.md (estrutura fixa de capitulos e passos - os id NAO podem mudar), ${DOCS}\\CORRECOES.md (34 correcoes de conteudo ja verificadas por revisao independente contra fontes - APLIQUE a "versao final" de cada uma; a secao "Refutadas" lista o que NAO aplicar), e ${RAIZ}\\..\\ROTEIRO.md (roteiro antigo, so como referencia de conteudo; o tom dele esta errado).

${REGRAS_TEXTO}

ARQUIVO 1 - ${RAIZ}\\src\\conteudo.js (modulo ES):
export const CONTEUDO = {
  <idCapitulo>: { numero, titulo, integrante, passos: {
    <idPasso>: {
      kicker: 'ROTULO CURTO',            // opcional
      titulo: '1 a 4 palavras',
      corpo: '<p>...</p>',               // opcional; HTML so com <p>, <strong>, <em> e <span class="termo" data-termo="chave">; no maximo 2 frases por passo
      ficha: [['Termo', 'valor'], ...],   // opcional; use no lugar do corpo quando o conteudo for tabular
      legendaMidia: 'legenda tecnica da imagem desse passo', // opcional
    } } } }
export const GLOSSARIO = { chave: { termo: 'Termo', def: 'definicao de 1 frase, de livro-texto' } }  // todo data-termo usado precisa existir aqui
Use exatamente os id de capitulo e de passo de ESTRUTURA.md. Nomes cientificos em <em>. Numero sempre com unidade. Doses conferidas contra CORRECOES.md; se uma dose nao estiver la nem for consenso de livro-texto, deixe fora.

ARQUIVO 2 - ${DOCS}\\FALAS.md:
Roteiro de fala dos tres integrantes, passo a passo (mesmos id), em portugues falado, natural, de estudante de medicina apresentando para colegas e professor: frases completas, sem floreio, sem piada forcada. E aqui que entram as transicoes, as explicacoes e os ganchos entre capitulos. Cada passo: 2 a 5 frases. Marque o tempo estimado por capitulo; total alvo de 18 a 20 minutos. No fim, uma secao "Se o professor perguntar" remetendo a PERGUNTAS-DA-BANCA.md.

ARQUIVO 3 - ${DOCS}\\ESTILO.md: a lista negativa pesquisada + as regras acima, em 1 pagina.
Confira que o conteudo.js e JavaScript valido: rode "node --input-type=module -e \\"import('file:///C:/Users/nalbe/Downloads/slide%20tal/haemophilus/src/conteudo.js').then(m=>console.log(Object.keys(m.CONTEUDO)))\\"".`

const REV_IA = `${CONTEXTO}

Voce e um editor de texto cientifico, impiedoso. Leia ${RAIZ}\\src\\conteudo.js e ${DOCS}\\ESTILO.md.
Cace, no TEXTO DOS SLIDES (conteudo.js), tudo o que soa a texto gerado por IA ou a narracao: metalinguagem, frase de efeito, personificacao, travessao de suspense, "nao e X, e Y", triade, dois-pontos de revelacao, adverbio de enfase, pergunta retorica, drama em frases curtas, qualquer frase que converse com a plateia, qualquer passo com mais de 2 frases ou titulo com mais de 4 palavras. Um slide bom parece pagina de livro-texto ou figura de artigo de revisao.
Para cada problema, de o texto substituto pronto. Nao reescreva o que ja esta bom. Se nao houver problema num passo, nao o liste.`

const REV_FATOS = `${CONTEXTO}

Voce e um revisor de conteudo medico. Leia ${RAIZ}\\src\\conteudo.js, ${DOCS}\\FALAS.md e ${DOCS}\\CORRECOES.md.
Confira, item por item, se CADA uma das correcoes confirmadas de CORRECOES.md foi aplicada corretamente no texto dos slides e nas falas, e se nenhuma das "Refutadas" entrou. Cace tambem: numero sem unidade, dose ausente ou divergente de CORRECOES.md, afirmacao absoluta onde a literatura e matizada ("nao cresce", "sempre", "nunca", "a principal causa" sem qualificar populacao), nomenclatura errada (LPS no lugar de LOS, taxonomia antiga), glossario com definicao errada ou termo usado sem entrada.
Para cada problema, de o texto substituto pronto e diga de qual correcao ele deriva.`

const IMG_PROMPT = `${CONTEXTO}

TAREFA: curadoria, DOWNLOAD e preparo das imagens que faltam. O usuario pediu explicitamente, no chat, que as imagens sejam buscadas na internet ("pegue na internet mesmo"); ele reclamou que faltam imagens, principalmente da metade para o fim da apresentacao.
Fontes permitidas, SOMENTE: CDC PHIL (phil.cdc.gov / wwwn.cdc.gov - dominio publico), Wikimedia Commons (dominio publico, CC0, CC BY, CC BY-SA), Wellcome Collection, NLM/NIH, figuras de artigos de ACESSO ABERTO com licenca CC BY (PMC, SciELO). Nada de banco pago, nada com marca d agua, nada de site de noticia. Confira a licenca na pagina de origem de cada arquivo.
Ponto de partida ja pesquisado, com URLs: ${DOCS}\\wf1-assetsFaltantes.json (leia inteiro; tem a nota tecnica de como baixar alta resolucao do PHIL) e ${DOCS}\\wf1-proveniencia.json.

LISTA DE DESEJOS (por passo de ${DOCS}\\ESTRUTURA.md):
- abertura.nome: retrato de Richard Pfeiffer (dominio publico); foto de enfermaria da pandemia de gripe de 1918 ou da de 1889-92 (dominio publico); Koch e Pfeiffer no laboratorio, 1897 (Wellcome, CC BY).
- abertura.legado: retrato de Hamilton O. Smith, Daniel Nathans ou Werner Arber (so se a licenca for livre); mapa circular do genoma de H. influenzae Rd se houver versao livre.
- exigencia.colonias: serie CDC PHIL 17142, 17143, 17141 (24, 48, 72 h) e PHIL 12449 / 12448 (agar chocolate).
- identificacao: Gram CDC PHIL 23029 e 1947 em alta; teste da porfirina ou dos fatores X e V se houver imagem livre.
- espectro.epiglotite: radiografia lateral de pescoco com SINAL DO POLEGAR (Wikimedia tem).
- espectro.meningite: alem da que ja temos, RM ou TC de meningite com empiema/realce meningeo se houver livre; audiometria NAO.
- espectro.dpoc: radiografia de torax de DPOC ou pneumonia lobar (livre).
- espectro.ducreyi: buboes CDC PHIL 5810 e 5811 - RECORTE para mostrar apenas a regiao inguinal, sem genitalia.
- fpb.agente: Gram de H. aegyptius CDC PHIL 18441; colonias PHIL 29345 se existir.
- fpb.conjuntivite: conjuntivite purulenta em crianca CDC PHIL 15192.
- fpb.purpura: purpura fulminante SEM ROSTO (as figuras CC BY de membros e tronco listadas no json; a legenda vai declarar a etiologia real e que e ilustrativa). Petequias em crianca, se houver livre.
- fpb.abertura: fotografia historica ou atual de Promissao-SP so se houver no Commons; capa/figura de MMWR de 1985-1986 sobre Brazilian purpuric fever (MMWR e dominio publico).
- tratamento: frasco/ampola de ceftriaxona (Commons); estrutura quimica da ceftriaxona em SVG (Commons, dominio publico).
- prevencao: frasco de vacina Hib ou pentavalente (Commons/CDC); crianca sendo vacinada (CDC PHIL tem varias, dominio publico); cartaz do PNI / Ze Gotinha so se a licenca permitir.
Se um item nao existir com licenca utilizavel, registre a busca negativa e siga. Nao force.

COMO ENTREGAR:
1. Baixe os originais (curl -L, com user-agent de navegador) para C:\\Users\\nalbe\\Downloads\\slide tal\\hamelofilos\\web\\ com nomes descritivos em minusculas sem acento. Prefira alta resolucao para imagens de tela cheia (TIFF do PHIL e ok) e baixa/media para as pequenas. Teto total de download: 400 MB.
2. Converta para WebP em ${RAIZ}\\public\\assets\\fotos\\ com sharp (ja instalado em ${RAIZ}\\node_modules; escreva um script ${RAIZ}\\tools\\web-assets.mjs no estilo de ${RAIZ}\\tools\\assets.mjs): largura maxima 2560, qualidade 88, recortes onde indicado. NAO sobrescreva arquivos que ja existem nessa pasta.
3. ABRA cada imagem convertida com a ferramenta Read e confira com os proprios olhos que e o que a legenda diz, que o recorte ficou decente e que nao ha marca d agua nem rosto identificavel de paciente (rosto de paciente: recorte ou descarte).
4. Escreva ${RAIZ}\\public\\assets\\creditos.json: lista de { arquivo, passo, titulo, legenda_pt (tecnica, 1 frase, com a etiologia real quando for ilustrativa), fonte_url, licenca, credito (como vai no rodape), largura, altura } - inclua tambem as imagens que ja estavam na pasta cuja procedencia e conhecida (veja wf1-proveniencia.json e ${RAIZ}\\public\\assets\\manifesto.json).
5. Escreva ${DOCS}\\CREDITOS.md legivel, com as buscas negativas no fim.`

const IMG_CONT = `${CONTEXTO}

TAREFA: TERMINAR o preparo das imagens. Um agente anterior fez quase tudo e foi interrompido antes de escrever os creditos.
O que JA esta feito (nao refaca): 42 originais baixados em C:\\Users\\nalbe\\Downloads\\slide tal\\hamelofilos\\web\\ ; conversao para WebP feita por ${RAIZ}\\tools\\web-assets.mjs (leia: ele mapeia nome de saida -> arquivo original e recortes) ; os WebP estao em ${RAIZ}\\public\\assets\\fotos\\ .
O que FALTA:
1. RECUPERAR a origem de cada arquivo (URL da pagina, licenca, autor). Nao pesquise de novo: a transcricao do agente anterior tem tudo. Ela esta em C:\\Users\\nalbe\\.claude\\projects\\C--Users-nalbe-Downloads-slide-tal\\73593853-8cc7-45ef-9cae-def773da689d\\subagents\\workflows\\wf_43bf2867-9c8\\agent-a31530bc9bc5d6e0e.jsonl (1,7 MB, JSONL). NAO leia o arquivo inteiro com Read: use Grep/scripts Python para extrair os comandos de download (curl, scripts .sh/.py/.mjs que ele escreveu, listas de URL) e as conclusoes sobre licenca. Os ids do CDC PHIL estao nos nomes dos arquivos (phil-12449-... -> https://phil.cdc.gov/Details.aspx?pid=12449, dominio publico). Para Wikimedia/Wellcome/PMC, confirme a licenca abrindo a pagina de origem com WebFetch so quando a transcricao nao deixar claro. Consulte tambem ${DOCS}\\wf1-assetsFaltantes.json e ${DOCS}\\wf1-proveniencia.json.
2. CONFERIR com os proprios olhos (ferramenta Read) CADA WebP novo em ${RAIZ}\\public\\assets\\fotos\\ criado hoje (os de horario 11:48-11:49: aegyptius-*, agar-chocolate-cdc*, bubao-*, ceftriaxona-*, colonias-*, conjuntivite-cdc, daniel-nathans, disco-xv, dpoc-enfisema, enfermaria-*, genoma-circular, gram-cdc-*, hamilton-smith, koch-pfeiffer-1897, meningite-rm, pfeiffer-*, pneumonia-lobar, promissao-mapa, purpura-*, sinal-do-polegar, vacina-*, vacinacao-*, werner-arber, ze-gotinha): e o que o nome diz? recorte decente? sem marca d agua? sem rosto identificavel de PACIENTE (retrato historico de cientista pode)? genitalia fora do quadro nos bubao-*? Se algo estiver errado, ajuste o recorte em web-assets.mjs e rode de novo SO para aquele item (o script nao sobrescreve: apague o webp daquele item antes), ou descarte o arquivo e registre.
3. Escrever ${RAIZ}\\public\\assets\\creditos.json: lista de { arquivo (nome do webp, sem pasta), passo (capitulo.passo de ${DOCS}\\ESTRUTURA.md onde melhor se encaixa), titulo, legenda_pt (tecnica, 1 frase, registro de livro-texto, SEM frase de efeito; quando a imagem for ilustrativa de outra etiologia, a legenda DECLARA a etiologia real), fonte_url, licenca, credito (curto, como vai no rodape: ex. "CDC/PHIL #12449 · domínio público" ou "Wellcome Collection · CC BY 4.0"), largura, altura }. Inclua TAMBEM as 21 imagens do primeiro lote cuja procedencia e conhecida (veja ${RAIZ}\\public\\assets\\manifesto.json, ${DOCS}\\wf1-proveniencia.json e as legendas ja usadas em ${RAIZ}\\src\\roteiro.js); para as do primeiro lote sem fonte conhecida, use credito "fonte não identificada · uso didático" e licenca "indefinida".
4. Escrever ${DOCS}\\CREDITOS.md legivel (tabela), com as buscas negativas e os descartes no fim.
Valide que creditos.json e JSON valido (node -e). Seja economico: nada de nova rodada de busca na web alem do necessario para confirmar licenca.`

const IMG_SCHEMA = {
  type: 'object',
  properties: {
    baixadas: { type: 'number' },
    arquivos: { type: 'array', items: { type: 'string' } },
    buscas_negativas: { type: 'array', items: { type: 'string' } },
    observacoes: { type: 'string' },
  },
  required: ['baixadas', 'arquivos'],
}

const BANCA_PROMPT = `${CONTEXTO}

Voce e o professor de microbiologia da banca. Tres estudantes de medicina vao apresentar Haemophilus cobrindo, por exigencia sua: morfologia e identificacao, enzimas e toxinas, manifestacoes clinicas, tratamento, epidemiologia e prevencao.
Leia ${DOCS}\\ESTRUTURA.md (o que sera apresentado) e ${DOCS}\\CORRECOES.md (o que a revisao ja corrigiu).
Escreva ${DOCS}\\PERGUNTAS-DA-BANCA.md com: (1) as 25 perguntas mais provaveis ao fim da apresentacao, das classicas de prova as que derrubam grupo, cada uma com resposta curta e correta (3 a 5 linhas) e a indicacao de qual passo da apresentacao ja cobre o assunto, ou "nao coberto"; (2) uma lista curta de lacunas de conteudo que ainda valeria cobrir, com o passo onde encaixar. Confira na web (WebSearch/WebFetch, fontes de peso: CDC, OMS, Ministerio da Saude, Red Book, Mandell, artigos indexados) qualquer numero ou dose de que nao tenha certeza. Tom tecnico e direto.`

// ---- execucao: tudo concorrente; o texto e um pipeline interno (redigir -> 2 revisoes -> corrigir)
const modelosP = Promise.resolve([])

const textoP = (async () => {
  const redacao = await agent(COPY_PROMPT, { phase: 'Texto', label: 'redigir' })
  const revs = await parallel([
    () => agent(REV_IA, { phase: 'Texto', label: 'revisar:vicios-de-ia', schema: ACHADOS }),
    () => agent(REV_FATOS, { phase: 'Texto', label: 'revisar:fatos', schema: ACHADOS }),
  ])
  const achados = revs.filter(Boolean).flatMap((r) => r.achados || [])
  log(`Texto: ${achados.length} achados nas duas revisoes`)
  if (!achados.length) return { redacao, achados: [], correcao: 'nada a corrigir' }
  const correcao = await agent(`${CONTEXTO}

Aplique as correcoes abaixo em ${RAIZ}\\src\\conteudo.js e ${DOCS}\\FALAS.md. Sao achados de dois revisores (um de estilo/vicios de IA, um de fatos). Aplique todos, exceto se um achado de estilo contradisser um de fato - nesse caso vale o fato, reescrito no estilo seco de ${DOCS}\\ESTILO.md. Nao mude nenhum id de capitulo ou passo. Ao final, valide que o modulo importa sem erro com node e que todo data-termo tem entrada no GLOSSARIO.

ACHADOS:
${JSON.stringify(achados, null, 1)}`, { phase: 'Texto', label: 'corrigir' })
  return { redacao, achados, correcao }
})()

const imagensP = agent(IMG_CONT, { phase: 'Imagens', label: 'imagens-creditos', schema: IMG_SCHEMA })
const bancaP = agent(BANCA_PROMPT, { phase: 'Banca', label: 'banca' })

const [modelos, texto, imagens, banca] = await Promise.all([modelosP, textoP, imagensP, bancaP])

return {
  modelos: (modelos || []).filter(Boolean),
  texto: { achados: texto && texto.achados ? texto.achados.length : 0, correcao: texto && texto.correcao },
  imagens,
  banca: typeof banca === 'string' ? banca.slice(0, 1500) : banca,
}
