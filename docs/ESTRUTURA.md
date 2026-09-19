# Estrutura v2 — cenas, passos e o que aparece na tela

Princípio: **o modelo 3D é o palco**. A câmera viaja por ele; cada estrutura citada existe no modelo, com cor própria.
As fotografias reais são as **evidências**: entram em janela (círculo ou quadro) no lado oposto ao texto, ou em tela cheia
com o texto sobre painel sólido. Texto e imagem nunca se sobrepõem.

Layout: três zonas — TEXTO (coluna de ~30% da largura), PALCO (centro) e MÍDIA (~35%). O lado do texto alterna por passo.

## Regra de texto (vale para todo passo)
O slide NÃO narra. Quem narra são os apresentadores (ver `FALAS.md`). No slide entram só:
rótulo curto (kicker), título de 1 a 4 palavras, e no máximo 2 frases factuais OU uma ficha de dados (pares termo → valor).
Proibido no slide: metalinguagem ("como vimos", "a regra que ensinamos", "vamos separar as camadas"), perguntas retóricas,
frases de efeito, personificação da bactéria ("o réu", "ele acorda", "versão do dia a dia"), travessão dramático,
construção "não é X, é Y", tríades de efeito, dois-pontos de suspense, "justamente", "na verdade", "vale destacar".

## Capítulos e passos (os `id` são fixos: a coreografia do código depende deles)

### 1 · abertura — integrante 1
- `micrografia` — MEV colorizada em tela cheia. Legenda técnica da imagem.
- `titulo` — HAEMOPHILUS influenzae · etimologia (haima, philos).
- `nome` — 1892, Richard Pfeiffer, pandemia de gripe; 1933, vírus influenza isolado; o nome permaneceu. Mídia: retrato de Pfeiffer.
- `legado` — o modelo se abre em corte e a câmera vai ao nucleoide. HindII (primeira enzima de restrição tipo II, Nobel 1978: Arber, Nathans, Smith); 1995, primeiro genoma de organismo de vida livre (cepa Rd KW20, 1.830.137 pb); primeira vacina conjugada licenciada.

### 2 · identidade — integrante 1
- `gram` — Gram de escarro na lente. Cocobacilos Gram-negativos, neutrófilos.
- `ficha` — ficha morfológica: forma, dimensões, pleomorfismo, motilidade, esporo, respiração, família (Pasteurellaceae).
- `envelope` — modelo em corte: membrana externa, peptidoglicano fino, membrana interna. Por que cora em rosa. Mídia pequena: Gram-positivo de contraste.
- `escala` — 0,3–0,5 µm de largura frente a um neutrófilo de 12 µm.

### 3 · exigencia — integrante 1
- `fastidioso` — ágar sangue em tela cheia. Cresce mal; em ágar sangue de carneiro, na prática não cresce. Modelo com `energia = 0`.
- `fatorX` — hemina / protoporfirina IX: citocromos, catalase, peroxidase. Disponível no meio mesmo com hemácia íntegra. Partículas de X entram no modelo.
- `fatorV` — NAD/NADP: intracelular na hemácia; NADases do soro degradam o que é liberado. O gargalo do ágar sangue é o V.
- `chocolate` — aquecimento brando (70–80 °C): lisa hemácias, libera NAD, inativa NADases; a autoclavação (120 °C) destruiria o V. Placa de ágar chocolate. `energia` sobe para 1.
- `colonias` — 18–24 h (série CDC de 24/48/72 h nas imagens): colônias grandes, redondas, lisas, convexas, de incolores a acinzentadas e opacas, sem descoloração do meio; capsuladas maiores e mucoides, não capsuladas menores e compactas; hemólise não se lê em ágar chocolate; odor de indol em biotipos positivos. 35–37 °C, 5–10% CO₂ (que não é exigência absoluta). Meio seletivo com bacitracina 10 UI/mL para amostras respiratórias.

### 4 · identificacao — integrante 1
- `discos` — X, V e XV em meio sem fatores (Mueller-Hinton/TSA): *H. influenzae* só em XV; *H. parainfluenzae* em V e XV; *H. ducreyi* só X. Erro clássico: heme residual no meio.
- `porfirina` — teste do ALA: fluorescência vermelha sob UV (360 nm) = sintetiza porfirina = independe de X. *H. influenzae*: negativo.
- `satelitismo` — vídeo na placa. *S. aureus* fornece fator V (excreta NAD e a beta-hemolisina libera NAD das hemácias); o X já estava no meio.
- `fechamento` — biotipos I–VIII (indol, urease, ornitina descarboxilase); sorotipos a–f por aglutinação em lâmina ou PCR (bexA/bexB = cápsula; genes específicos de tipo); *H. haemolyticus* como sósia (diferenciar por PCR/MALDI-TOF); amostras: líquor, hemocultura, escarro, aspirado de ouvido médio; antígeno em líquor em desuso; PCR em líquor útil após antibiótico.

### 5 · arsenal — integrante 2 (capítulo-herói do 3D: câmera orbita, uma estrutura por vez em `destaque`)
- `visao` — modelo inteiro, legenda de cores das estruturas.
- `capsula` — PRP (polirribosil-ribitol-fosfato); sorotipos a–f, b o mais virulento; antifagocitária, reduz deposição de C3b; alvo da vacina. Ressalva: doença invasiva por a, f e não tipáveis existe.
- `los` — lipo-oligossacarídeo: sem antígeno O; lipídeo A → TLR4 → TNF-α, IL-1, IL-6; variação de fase, sialilação, fosforilcolina (ChoP); ciliostase.
- `iga` — protease de IgA1: cliva a região da dobradiça da IgA1 humana; partículas saem do modelo e cortam anticorpos em Y.
- `adesao` — pili hemaglutinantes; adesinas HMW1/HMW2 (≈75% dos NTHi), Hia, Hap; proteína D; OMP P2 (porina), P5, P6.
- `biofilme` — agregados em matriz: ouvido médio, DPOC; tolerância a antibiótico e recorrência.
- `competencia` — competência natural: captação de DNA com sequências USS; modelo em corte, nucleoide e plasmídeo em destaque.

### 6 · espectro — integrante 2 (vitrine: quatro modelos lado a lado, a câmera escolhe um por vez)
- `vitrine` — *H. influenzae* tipo b · *H. influenzae* não tipável · *H. ducreyi* · *H. parainfluenzae*. Nota taxonômica: *A. aphrophilus* e *A. segnis* saíram para *Aggregatibacter*.
- `hib` — ficha: cápsula b, via nasofaringe → bacteremia → foco distante; pico pré-vacinal entre 6 e 11 meses, com até 60% da doença invasiva antes dos 12 meses.
- `epiglotite` — vídeo endoscópico na lente + sinal do polegar na radiografia lateral. Via aérea primeiro; não manipular orofaringe.
- `celulite` — celulite bucal/periorbitária violácea; artrite séptica; pneumonia com empiema; pericardite; bacteremia oculta.
- `meningite` — base do encéfalo com exsudato (tela cheia, texto em painel). Letalidade 3–6%; sequela neurológica em 15–30%, surdez neurossensorial a mais frequente.
- `nthi` — sem cápsula; sensível ao complemento, por isso raramente bacterêmico em hígidos; hoje é a principal causa de doença invasiva por *H. influenzae* em países vacinados (neonatos, idosos, imunodeprimidos).
- `otite` — otoscopia na lente. Um dos três agentes principais da otite média aguda, ao lado de pneumococo e *Moraxella*; proporção aumentou após as vacinas pneumocócicas; conjuntivite-otite.
- `dpoc` — exacerbação de DPOC, bronquiectasia, fibrose cística; sinusite; pneumonia do idoso.
- `ducreyi` — cancro mole: úlcera dolorosa, borda irregular e fundo purulento; bubão inguinal unilateral que pode fistulizar; Gram em "cardume de peixes"; cultura difícil (33–35 °C, fator X, meios enriquecidos), PCR quando disponível; também causa úlceras cutâneas crônicas em crianças no Pacífico Sul e África; cofator de transmissão do HIV. Tratamento: azitromicina 1 g VO dose única ou ceftriaxona 250 mg IM dose única (alternativas: ciprofloxacino 500 mg 12/12 h por 3 dias; eritromicina 500 mg 8/8 h por 7 dias); tratar parcerias.
- `parainfluenzae` — comensal da orofaringe, requer só V; grupo HACEK (*Haemophilus* spp., *Aggregatibacter*, *Cardiobacterium hominis*, *Eikenella corrodens*, *Kingella*): endocardite subaguda, valva nativa ou protética, hemocultura de crescimento lento.

### 7 · fpb — integrante 3
- `abertura` — Febre Purpúrica Brasileira. Mapa: Brasil → São Paulo → Promissão, 1984.
- `agente` — *H. influenzae* biogrupo aegyptius (bacilo de Koch-Weeks), clone BPF; não capsulado; plasmídeo de ~24 MDa (tipo 3031) como marcador do clone. Mídia: Gram de *H. aegyptius* (CDC). Modelo em corte com plasmídeo em destaque.
- `conjuntivite` — fase 1: conjuntivite purulenta em criança (foto CDC). Resolve.
- `intervalo` — contador de dias: 1 a 3 semanas até a doença sistêmica.
- `purpura` — febre alta, vômitos, dor abdominal; petéquias → púrpura → necrose de extremidades; choque em 12–48 h. Mídia: púrpura fulminante (imagem ilustrativa, etiologia declarada na legenda).
- `mecanismo` — LOS → citocinas → lesão endotelial → CIVD. Modelo com `secrecao` alta e LOS em destaque.
- `dados` — ficha: 3 meses a 10 anos; letalidade ~70% nos primeiros surtos; hemocultura; líquor em geral sem pleocitose; diferencial com meningococcemia; doença de notificação compulsória imediata; casos esporádicos depois dos anos 1990; conduta: ceftriaxona/ampicilina + cloranfenicol na época, suporte intensivo; rifampicina nos contatos e tratamento sistêmico da conjuntivite em surto.

### 8 · tratamento — integrante 3 (o alvo do antibiótico é mostrado DENTRO do modelo)
- `alvo` — modelo em corte na região do septo: PBP3 (FtsI) sintetiza o peptidoglicano do septo; beta-lactâmico entra pelas porinas e se liga à PBP.
- `invasivo` — ceftriaxona ou cefotaxima: penetração liquórica, estabilidade frente a beta-lactamases. Duração usual na meningite: 7–10 dias.
- `dexametasona` — 0,15 mg/kg 6/6 h por 2–4 dias, iniciada 10–20 min antes ou junto da primeira dose: reduz perda auditiva na meningite por Hib. Epiglotite: via aérea antes de tudo.
- `naoInvasivo` — amoxicilina em dose alta; amoxicilina-clavulanato se beta-lactamase; alternativas: cefalosporina oral de 2ª/3ª geração, fluoroquinolona respiratória em adultos; macrolídeo tem atividade limitada.
- `betalactamase` — TEM-1 (maioria) e ROB-1 no periplasma hidrolisam o anel; clavulanato inibe; detecção por nitrocefina. Prevalência de cerca de 25% a 30% das cepas, com variação regional (séries norte-americanas de 20% a 40%).
- `blnar` — mutações em *ftsI* alteram a PBP3: resistência sem beta-lactamase; clavulanato não restaura; BLPACR = os dois mecanismos; cefalosporinas de 3ª geração costumam manter atividade.

### 9 · prevencao — integrante 3
- `tindependente` — PRP é antígeno T-independente tipo 2: resposta fraca antes dos 18–24 meses, IgM, sem memória.
- `conjugacao` — PRP ligado covalentemente a proteína carreadora: PRP-T (toxoide tetânico; o da pentavalente brasileira), HbOC (CRM197), PRP-OMP. Um fio de cápsula se solta do modelo e se liga à proteína.
- `tdependente` — linfócito B específico do PRP internaliza o conjugado, apresenta peptídeo da carreadora em MHC II ao T CD4: troca de classe para IgG, maturação de afinidade, memória; reduz o portador nasofaríngeo (efeito de rebanho).
- `brasil` — PNI: Hib em 1999; tetravalente em 2002; pentavalente (DTP-HB-Hib) desde 2012; 2, 4 e 6 meses; sem reforço de Hib na rotina. Quimioprofilaxia: rifampicina 20 mg/kg/dia (máx. 600 mg) 1×/dia por 4 dias para contatos domiciliares quando há menor de 4 anos não vacinado ou imunodeprimido; o caso-índice também recebe se tratado sem ceftriaxona/cefotaxima.
- `grafico` — Brasil, meningite por Hib em menores de 1 ano, 1983–2001 (por 100 mil): 26,1 em 1998 → 4,3 em 2001. Fonte: Miranzi et al., Rev Soc Bras Med Trop 2006.
- `substituicao` — depois da vacina: NTHi predomina na doença invasiva; emergência do sorotipo a em algumas populações; vigilância de sorotipos continua necessária.
- `fecho` — modelo inteiro, girando. Só o nome e três marcos: 1892 · 1995 · 1999.

### 10 · estudo
- `glossario` — todos os termos, clicáveis; créditos de todas as imagens.
