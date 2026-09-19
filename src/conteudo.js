// TEXTO DA APRESENTACAO — fonte unica de verdade para tudo que aparece na TELA.
//
// Regras aplicadas (ver docs/ESTILO.md):
//   - o slide nao narra; a fala dos tres integrantes esta em docs/FALAS.md
//   - por passo: kicker curto + titulo de 1 a 4 palavras + no maximo 2 frases factuais OU uma ficha
//   - registro de livro-texto: substantivo, preciso, impessoal, com numero e unidade
//   - conteudo conferido contra docs/CORRECOES.md (versao final de cada correcao)
//
// HTML permitido em `corpo` e nos VALORES de `ficha`: <p>, <strong>, <em> e
// <span class="termo" data-termo="chave">. O renderizador deve usar innerHTML nos dois campos.
// Todo data-termo usado aqui existe em GLOSSARIO, no fim do arquivo.
//
// Os id de capitulo e de passo sao os de docs/ESTRUTURA.md e NAO podem mudar.

export const CONTEUDO = {
  // ------------------------------------------------------------------ 1
  abertura: {
    numero: 1,
    titulo: 'Histórico',
    integrante: 1,
    passos: {
      micrografia: {
        kicker: 'MICROSCOPIA ELETRÔNICA',
        titulo: 'Superfície e adesão',
        corpo: '<p><em>Haemophilus influenzae</em> não tipável aderido a uma superfície, em microscopia eletrônica de varredura. Largura do corpo celular de 0,3 a 0,5 µm.</p>',
        legendaMidia: 'MEV colorizada de H. influenzae não tipável em biofilme. Crédito: Paul Webster, USC / Oak Crest Institute of Science; imagem de divulgação de Wu et al., PLOS ONE 2014 (doi:10.1371/journal.pone.0099204). Cor artificial.',
      },
      titulo: {
        kicker: 'GÊNERO',
        titulo: 'Haemophilus influenzae',
        corpo: '<p>Do grego <em>haima</em> (sangue) e <em>philos</em> (amigo), em referência à dependência de fatores de crescimento presentes no sangue. Família Pasteurellaceae.</p>',
      },
      nome: {
        kicker: '1892',
        titulo: 'Bacilo de Pfeiffer',
        corpo: '<p>Richard Pfeiffer isolou a bactéria do trato respiratório de doentes durante a pandemia de gripe de 1889 a 1892 e a descreveu como agente da influenza. O vírus influenza foi isolado em 1933 por Smith, Andrewes e Laidlaw, e o epíteto <em>influenzae</em> permaneceu.</p>',
        legendaMidia: 'Richard Pfeiffer (1858-1945), Institut für Infektionskrankheiten, Berlim. Retrato em domínio público.',
      },
      legado: {
        kicker: 'CONTRIBUIÇÕES',
        titulo: 'Marcos científicos',
        ficha: [
          ['1970', 'HindII, primeira endonuclease de restrição de tipo II caracterizada'],
          ['1978', 'Nobel de Medicina a Arber, Nathans e Smith pelas enzimas de restrição'],
          ['1987', 'Primeira vacina conjugada polissacarídeo-proteína licenciada (PRP-D)'],
          ['1995', 'Primeiro genoma completo de organismo de vida livre (cepa Rd KW20, 1.830.137 pb)'],
        ],
        legendaMidia: 'Modelo em corte na altura do nucleoide, o cromossomo circular de 1,83 Mb.',
      },
    },
  },

  // ------------------------------------------------------------------ 2
  identidade: {
    numero: 2,
    titulo: 'Morfologia e coloração',
    integrante: 1,
    passos: {
      gram: {
        kicker: 'GRAM DE ESCARRO',
        titulo: 'Cocobacilos e neutrófilos',
        corpo: '<p>Cocobacilos Gram-negativos <span class="termo" data-termo="pleomorfico">pleomórficos</span> entre neutrófilos, em aumento de 1000×. A espécie cora mal pela safranina, e a fucsina fenicada diluída é o contracorante de melhor rendimento.</p>',
        legendaMidia: 'Coloração de Gram de escarro, 1000×, objetiva de imersão.',
      },
      ficha: {
        kicker: 'CARACTERES GERAIS',
        titulo: 'Morfologia e fisiologia',
        ficha: [
          ['Morfologia', 'cocobacilo Gram-negativo, pleomórfico (cocoide a filamentoso na mesma lâmina)'],
          ['Dimensões', '0,3 a 0,5 µm × 0,5 a 3 µm'],
          ['Motilidade', 'imóvel, sem flagelo'],
          ['Esporo', 'não forma'],
          ['Relação com o oxigênio', 'anaeróbio facultativo'],
          ['Oxidase e catalase', 'positivas'],
          ['Cultivo', '35 a 37 °C; cresce melhor com 5 a 10% de CO₂, que não é exigência absoluta'],
          ['Família', 'Pasteurellaceae'],
        ],
      },
      envelope: {
        kicker: 'ENVELOPE',
        titulo: 'Parede Gram-negativa',
        corpo: '<p>Membrana externa com <span class="termo" data-termo="los">LOS</span> e porinas, peptidoglicano fino no periplasma e membrana citoplasmática. A camada fina de peptidoglicano não retém o complexo cristal violeta-iodo durante a descoloração pelo álcool, e a célula assume a cor do contracorante.</p>',
        legendaMidia: 'Bacilos Gram-positivos (roxos) de outro gênero, para comparação de coloração.',
      },
      escala: {
        kicker: 'ESCALA',
        titulo: 'Bactéria e neutrófilo',
        ficha: [
          ['<em>H. influenzae</em>', '0,3 a 0,5 µm de largura'],
          ['Neutrófilo humano', 'cerca de 12 µm de diâmetro'],
          ['Relação de diâmetro', 'cerca de 25 a 40 vezes'],
          ['Hemácia humana', 'cerca de 7,5 µm de diâmetro'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 3
  exigencia: {
    numero: 3,
    titulo: 'Exigências nutricionais',
    integrante: 1,
    passos: {
      fastidioso: {
        kicker: 'ÁGAR SANGUE',
        titulo: 'Crescimento pobre',
        corpo: '<p>Organismo <span class="termo" data-termo="fastidioso">fastidioso</span>, com crescimento escasso ou ausente em ágar sangue de carneiro. O meio contém os fatores X e V, e o fator limitante é o V.</p>',
        legendaMidia: 'Ágar sangue de carneiro com crescimento escasso de H. influenzae.',
      },
      fatorX: {
        kicker: 'FATOR X',
        titulo: 'Hemina',
        corpo: '<p>A espécie não sintetiza o anel de protoporfirina IX e depende de hemina exógena para a síntese de citocromos, catalase e peroxidase. No ágar sangue, a hemina está disponível mesmo com as hemácias íntegras.</p>',
        legendaMidia: 'Captação de hemina pelo modelo e reativação da cadeia respiratória.',
      },
      fatorV: {
        kicker: 'FATOR V',
        titulo: 'NAD',
        corpo: '<p>NAD e NADP são coenzimas carreadoras de elétrons que a espécie não sintetiza. O NAD do ágar sangue permanece dentro da hemácia, e as <span class="termo" data-termo="nadase">NADases</span> do soro degradam o que é liberado.</p>',
      },
      chocolate: {
        kicker: 'ÁGAR CHOCOLATE',
        titulo: 'Aquecimento brando',
        corpo: '<p>Ágar sangue aquecido entre 70 e 80 °C, o que lisa as hemácias, libera o NAD e inativa as NADases do soro. A autoclavação a 120 °C destrói o fator V.</p>',
        legendaMidia: 'Placa de ágar chocolate. Cor marrom por hemoglobina desnaturada pelo calor.',
      },
      colonias: {
        kicker: 'COLÔNIAS',
        titulo: 'Leitura da placa',
        ficha: [
          ['Incubação', '18 a 24 h, 35 a 37 °C, 5 a 10% de CO₂'],
          ['Aspecto', 'grandes, redondas, lisas, convexas, incolores a acinzentadas e opacas'],
          ['Cepas capsuladas', 'maiores e mucoides'],
          ['Cepas não capsuladas', 'menores e compactas'],
          ['Alteração do meio', 'nenhuma descoloração em ágar chocolate'],
          ['Hemólise', 'não se avalia em ágar chocolate; a leitura é em sangue de cavalo ou de coelho'],
          ['Odor', 'indólico nos biotipos indol-positivos; olfação direta da placa contraindicada por biossegurança'],
          ['Amostra respiratória', 'ágar chocolate com bacitracina 10 UI/mL'],
        ],
        legendaMidia: 'Série CDC de crescimento em ágar chocolate: 24 h, 48 h e 72 h.',
      },
    },
  },

  // ------------------------------------------------------------------ 4
  identificacao: {
    numero: 4,
    titulo: 'Identificação',
    integrante: 1,
    passos: {
      discos: {
        kicker: 'DISCOS DE FATORES',
        titulo: 'Exigência de fatores',
        ficha: [
          ['Triagem prévia', 'oxidase de Kovács, leitura em até 10 s'],
          ['Meio', 'isento de hemina e NAD (HIA ou TSA)'],
          ['Inóculo', 'suspensão a 1,0 de McFarland, incubação de 18 a 24 h com 5% de CO₂'],
          ['<em>H. influenzae</em>', 'cresce apenas ao redor do disco XV'],
          ['<em>H. parainfluenzae</em>', 'cresce em V e em XV'],
          ['<em>H. ducreyi</em>', 'exige só X; cresce nos discos X e XV'],
          ['<em>H. haemolyticus</em>', 'também exige X e V, indistinguível neste teste'],
          ['Erro de execução', 'arraste de ágar chocolate carrega hemina e falseia a leitura'],
        ],
        legendaMidia: 'Discos de X, V e XV sobre meio sem fatores, com o XV entre os dois discos isolados.',
      },
      porfirina: {
        kicker: 'TESTE DA PORFIRINA',
        titulo: 'ALA sob ultravioleta',
        corpo: '<p>O isolado é incubado com ácido δ-aminolevulínico, e a fluorescência vermelha sob luz ultravioleta de 360 nm indica síntese de porfirinas e, portanto, independência do fator X. <em>H. influenzae</em> é negativo; <em>H. parainfluenzae</em> é positivo.</p>',
        legendaMidia: 'Tubo do teste do ALA sob lâmpada ultravioleta de 360 nm.',
      },
      satelitismo: {
        kicker: 'SATELITISMO',
        titulo: 'Fenômeno de fator V',
        corpo: '<p>Em ágar sangue, <em>H. influenzae</em> forma colônias visíveis apenas na faixa vizinha à estria de <em>Staphylococcus aureus</em>, que sintetiza e excreta NAD. A hemina está disponível no meio, e o fator limitante é o V.</p>',
        legendaMidia: 'Ágar sangue com estria de S. aureus e colônias satélites de H. influenzae na zona adjacente.',
      },
      fechamento: {
        kicker: 'CONFIRMAÇÃO E TIPAGEM',
        titulo: 'Espécie e sorotipo',
        ficha: [
          ['Espécie', 'PCR do gene <em>hpd</em> (proteína D), presente em cepas capsuladas e não capsuladas'],
          ['Sorotipo', 'aglutinação em lâmina com controle em salina; autoaglutinação invalida a leitura'],
          ['Sorotipo, PCR', '<em>acsB</em> (a), <em>bcsB</em> (b), <em>ccsD</em> (c), <em>dcsE</em> (d), <em>ecsH</em> (e), <em>bexD</em> (f)'],
          ['<em>bexA</em>', 'não recomendado para sorotipagem pelo manual OMS/CDC'],
          ['Biotipos', 'I a VIII por indol, urease e ornitina-descarboxilase; biogrupo <em>aegyptius</em> é biotipo III'],
          ['MALDI-TOF', 'não separa <em>H. influenzae</em>, <em>H. haemolyticus</em> e <em>H. aegyptius</em>'],
          ['Confirmação', 'PCR do gene <em>fucK</em> separa <em>H. influenzae</em> de <em>H. haemolyticus</em>'],
          ['Amostras', 'líquor, hemocultura, escarro, aspirado de ouvido médio'],
          ['Pré-analítico', 'líquor para cultura não refrigerado, 20 a 35 °C, processado em até 1 h'],
          ['Após antibiótico', 'PCR em tempo real no líquor mantém sensibilidade; cultura tende a falhar'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 5
  arsenal: {
    numero: 5,
    titulo: 'Fatores de virulência',
    integrante: 2,
    passos: {
      visao: {
        kicker: 'ANATOMIA',
        titulo: 'Legenda de cores',
        ficha: [
          ['Cápsula do tipo b (PRP)', 'pérola'],
          ['Membrana externa', 'verde-azulado'],
          ['LOS', 'coral'],
          ['Porinas P2 e P6', 'azul'],
          ['Adesinas HMW1, HMW2, Hia, Hap', 'lima'],
          ['Pili', 'palha'],
          ['Peptidoglicano', 'verde'],
          ['Beta-lactamases no periplasma', 'laranja'],
          ['Membrana citoplasmática', 'âmbar'],
          ['PBP3 (FtsI)', 'magenta'],
          ['Ribossomos', 'lilás'],
          ['Nucleoide', 'violeta'],
          ['Plasmídeo', 'ciano'],
        ],
      },
      capsula: {
        kicker: 'CÁPSULA',
        titulo: 'Polissacarídeo capsular',
        ficha: [
          ['Sorotipos', 'seis, de a a f, com polissacarídeos antigenicamente distintos'],
          ['Tipo b', '<span class="termo" data-termo="prp">PRP</span>, polirribosil-ribitol-fosfato'],
          ['Função', 'reduz a deposição de C3b e a fagocitose'],
          ['Era pré-vacinal', 'tipo b em 95% da doença invasiva por <em>H. influenzae</em>'],
        ],
        legendaMidia: 'Modelo com a cápsula em destaque. Sem cápsula, a célula não aglutina com os antissoros a–f.',
      },
      los: {
        kicker: 'ENDOTOXINA',
        titulo: 'Lipo-oligossacarídeo',
        ficha: [
          ['Estrutura', '<span class="termo" data-termo="los">LOS</span> sem antígeno O; cadeia de açúcares curta'],
          ['Lipídeo A', 'ativa TLR4; induz TNF-α, IL-1 e IL-6'],
          ['Evasão de anticorpo', '<span class="termo" data-termo="variacaoDeFase">variação de fase</span>, sialilação e incorporação de fosforilcolina'],
          ['Epitélio respiratório', 'redução do batimento ciliar'],
        ],
      },
      iga: {
        kicker: 'PROTEASE DE IgA1',
        titulo: 'Clivagem da dobradiça',
        corpo: '<p>Serina-protease autotransportadora (secreção do tipo V; genes <em>iga</em> e <em>igaB</em>) que cliva a IgA1 secretora humana na região da dobradiça e separa Fab de Fc. O papel na virulência não está demonstrado, porque a enzima é específica para a IgA1 humana e não há modelo animal.</p>',
        legendaMidia: 'Partículas de protease emitidas pela superfície do modelo, clivando moléculas de IgA1 em Y.',
      },
      adesao: {
        kicker: 'ADESÃO',
        titulo: 'Adesinas e porinas',
        ficha: [
          ['Pili hemaglutinantes', 'adesão inicial ao epitélio da nasofaringe'],
          ['HMW1 e HMW2', 'adesinas presentes em cerca de 75% das cepas não tipáveis'],
          ['Hia', 'autotransportador das cepas sem HMW1/HMW2'],
          ['Hap', 'adesão e formação de microcolônias'],
          ['P2', 'porina majoritária, antígeno hipervariável na alça 6'],
          ['P6', 'lipoproteína de 16 kDa, conservada, candidata vacinal'],
          ['P5', 'adesão a mucina e a ICAM-1; resistência ao complemento'],
          ['Proteína D', 'glicerofosfodiéster fosfodiesterase de superfície; antígeno em estudo'],
        ],
      },
      biofilme: {
        kicker: 'BIOFILME',
        titulo: 'Persistência na mucosa',
        corpo: '<p>Agregados bacterianos em matriz, com tolerância ao antibiótico e recorrência; demonstração direta na mucosa do ouvido médio e mecanismo proposto na via aérea inferior, com evidência in vitro e em modelo animal. Em biópsia brônquica, <span class="termo" data-termo="nthi">NTHi</span> intracelular foi detectado em 33% dos pacientes com DPOC estável e em 87% dos pacientes em exacerbação.</p>',
      },
      competencia: {
        kicker: 'TRANSFORMAÇÃO',
        titulo: 'Captação de DNA',
        corpo: '<p>A espécie é naturalmente <span class="termo" data-termo="competencia">competente</span> e capta DNA do ambiente por reconhecimento da sequência USS (5′-AAGTGCGGT-3′), o que favorece DNA da própria espécie. A transformação dissemina alelos de resistência, entre eles variantes de <em>ftsI</em>.</p>',
        legendaMidia: 'Modelo em corte, com nucleoide e plasmídeo em destaque.',
      },
    },
  },

  // ------------------------------------------------------------------ 6
  espectro: {
    numero: 6,
    titulo: 'Espectro clínico',
    integrante: 2,
    passos: {
      vitrine: {
        kicker: 'GÊNERO',
        titulo: 'Espécies em comparação',
        ficha: [
          ['<em>H. influenzae</em> tipo b', 'capsulado; exige X e V; doença invasiva'],
          ['<em>H. influenzae</em> não tipável', 'sem cápsula; doença de mucosa e invasiva em hospedeiro vulnerável'],
          ['<em>H. ducreyi</em>', 'exige X, não exige V; úlcera genital e cutânea'],
          ['<em>H. parainfluenzae</em>', 'exige só V; comensal da orofaringe; grupo HACEK'],
          ['Taxonomia, 2006', '<em>H. aphrophilus</em> e <em>H. segnis</em> transferidos para <em>Aggregatibacter</em>'],
        ],
      },
      hib: {
        kicker: 'TIPO b',
        titulo: 'Doença invasiva',
        ficha: [
          ['Cápsula', 'PRP, polirribosil-ribitol-fosfato'],
          ['Porta de entrada', 'nasofaringe'],
          ['Percurso', 'epitélio, corrente sanguínea, foco a distância'],
          ['Pico etário pré-vacinal', '6 a 11 meses; até 60% da doença invasiva antes dos 12 meses'],
          ['Formas', 'meningite, epiglotite, celulite, artrite séptica, pneumonia, bacteremia oculta'],
        ],
      },
      epiglotite: {
        kicker: 'EPIGLOTITE',
        titulo: 'Emergência de via aérea',
        corpo: '<p>Início abrupto com febre alta, odinofagia, sialorreia, voz abafada e estridor, com o paciente sentado e inclinado para a frente. A via aérea é assegurada em centro cirúrgico antes de qualquer manipulação da orofaringe.</p>',
        legendaMidia: 'Laringoscopia com epiglote edemaciada e eritematosa; radiografia lateral de pescoço com o sinal do polegar.',
      },
      celulite: {
        kicker: 'FORMAS INVASIVAS',
        titulo: 'Celulite e artrite',
        ficha: [
          ['Celulite', 'bucal e periorbitária, de tom violáceo, no lactente'],
          ['Artrite séptica', 'monoarticular, de grandes articulações'],
          ['Pneumonia', 'com derrame pleural ou empiema'],
          ['Pericardite', 'apresentação rara'],
          ['Bacteremia oculta', 'febre sem foco no lactente não vacinado'],
        ],
        legendaMidia: 'Celulite periorbitária em lactente. Imagem clínica em cor real.',
      },
      meningite: {
        kicker: 'MENINGITE',
        titulo: 'Letalidade e sequela',
        ficha: [
          ['Participação pré-vacinal', '50 a 65% da doença invasiva por Hib'],
          ['Pico etário', '6 a 11 meses'],
          ['Quadro clássico', 'febre, alteração do nível de consciência e rigidez de nuca'],
          ['No lactente', 'irritabilidade, vômito, recusa alimentar, abaulamento de fontanela'],
          ['Letalidade', '3 a 6% sob antibioticoterapia adequada'],
          ['Sequela permanente', '15 a 30% dos sobreviventes'],
          ['Sequela mais frequente', 'surdez neurossensorial'],
        ],
        legendaMidia: 'Base do encéfalo com exsudato purulento nas cisternas, em meningite bacteriana.',
      },
      nthi: {
        kicker: 'NÃO TIPÁVEL',
        titulo: 'Sem cápsula',
        ficha: [
          ['Cápsula', 'ausente; não aglutina com os antissoros a–f'],
          ['Complemento', 'opsonização eficiente; bacteremia rara no hospedeiro hígido'],
          ['Nicho', 'mucosa; extensão por contiguidade a tuba auditiva, seios paranasais e brônquios'],
          ['Países com vacinação de rotina contra o Hib', 'principal causa de doença invasiva por <em>H. influenzae</em> na era pós-vacinal'],
          ['Incidência, EUA, 2008 a 2019', '1,3 por 100.000; 5,8 por 100.000 em menores de 1 ano'],
        ],
      },
      otite: {
        kicker: 'OTITE MÉDIA AGUDA',
        titulo: 'Inversão pós-vacinal',
        corpo: '<p>Os três otopatógenos principais são o pneumococo, o <span class="termo" data-termo="nthi">NTHi</span> e a <em>Moraxella catarrhalis</em>. Em séries com timpanocentese em crianças com otite grave ou refratária, logo após a PCV7, o pneumococo caiu de 48% para 31% e o NTHi subiu de 41% para 56%.</p>',
        legendaMidia: 'Otoscopia com membrana timpânica abaulada, opaca e hiperemiada.',
      },
      dpoc: {
        kicker: 'VIA AÉREA CRÔNICA',
        titulo: 'Exacerbação e colonização',
        corpo: '<p>O NTHi é a bactéria mais isolada nas exacerbações de DPOC, e a mesma cepa persiste por meses na via aérea inferior. Também está associado a bronquiectasia, fibrose cística, sinusite e pneumonia no idoso.</p>',
      },
      ducreyi: {
        kicker: 'HAEMOPHILUS DUCREYI',
        titulo: 'Cancro mole',
        ficha: [
          ['Lesão', 'úlcera genital dolorosa, de borda irregular e fundo purulento'],
          ['Linfonodo', 'bubão inguinal unilateral, que pode fistulizar'],
          ['Diferencial', 'o cancro duro da sífilis é indolor e de base limpa'],
          ['Cultivo', 'exige fator X, não exige V; 33 a 35 °C, atmosfera úmida com 5% de CO₂'],
          ['Gram da úlcera', 'padrão em cardume de peixes; sensibilidade de 5 a 63%'],
          ['Cultura', 'sensibilidade menor que 80% frente à PCR'],
          ['Tratamento', 'azitromicina 1 g VO dose única ou ceftriaxona 250 mg IM dose única'],
          ['Alternativas', 'ciprofloxacino 500 mg VO 12/12 h por 3 dias; eritromicina 500 mg VO 8/8 h por 7 dias'],
          ['Parcerias', 'examinar e tratar contatos dos 10 dias anteriores ao início dos sintomas'],
          ['Úlcera cutânea não sexual', '27 a 60% das úlceras de pele em crianças de áreas endêmicas de bouba'],
          ['HIV', 'testar no diagnóstico; a úlcera é cofator de transmissão'],
        ],
        legendaMidia: 'Úlcera genital de cancro mole em cor real e Gram do material da úlcera, com cocobacilos em fileiras paralelas.',
      },
      parainfluenzae: {
        kicker: 'HAEMOPHILUS PARAINFLUENZAE',
        titulo: 'Grupo HACEK',
        ficha: [
          ['Exigência', 'só fator V (NAD)'],
          ['Habitat', 'comensal da orofaringe'],
          ['<span class="termo" data-termo="hacek">HACEK</span>', '<em>Haemophilus</em>, <em>Aggregatibacter</em>, <em>Cardiobacterium hominis</em>, <em>Eikenella corrodens</em>, <em>Kingella kingae</em>'],
          ['Quadro', 'endocardite de curso insidioso, em valva nativa e em prótese'],
          ['Atraso diagnóstico', 'cerca de 1 mês nas espécies de <em>Haemophilus</em>'],
          ['Participação', '1 a 3% das endocardites; <em>H. parainfluenzae</em>, 0,8 a 1,3%'],
          ['Tratamento', 'ceftriaxona 2 g/dia, 4 semanas em valva nativa e 6 semanas em prótese'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 7
  fpb: {
    numero: 7,
    titulo: 'Febre Purpúrica Brasileira',
    integrante: 3,
    passos: {
      abertura: {
        kicker: '1984',
        titulo: 'Febre Purpúrica Brasileira',
        corpo: '<p>Doença pediátrica descrita em Promissão (SP) em 1984, a partir de dez óbitos por quadro febril e purpúrico de evolução rápida. Todos os casos tinham antecedente de conjuntivite purulenta nas semanas anteriores.</p>',
        legendaMidia: 'Mapa vetorial: Brasil, estado de São Paulo, município de Promissão.',
      },
      agente: {
        kicker: 'AGENTE',
        titulo: 'Biogrupo aegyptius',
        corpo: '<p><em>Haemophilus influenzae</em> <span class="termo" data-termo="biogrupoAegyptius">biogrupo <em>aegyptius</em></span>, o bacilo de Koch-Weeks, biotipo III e não capsulado, identificado como clone BPF por métodos moleculares. O plasmídeo de cerca de 24 MDa, designado 3031, foi descrito como marcador do clone, mas há cepas de febre purpúrica sem esse plasmídeo.</p>',
        legendaMidia: 'Gram de H. influenzae biogrupo aegyptius. Crédito: CDC/PHIL.',
      },
      conjuntivite: {
        kicker: 'FASE 1',
        titulo: 'Conjuntivite purulenta',
        corpo: '<p>Conjuntivite purulenta em criança de 3 meses a 10 anos, que resolve com ou sem tratamento tópico. O quadro é indistinguível das demais conjuntivites bacterianas da faixa etária.</p>',
        legendaMidia: 'Conjuntivite purulenta. Imagem ilustrativa; a etiologia não está confirmada na fonte.',
      },
      intervalo: {
        kicker: 'INTERVALO',
        titulo: 'Uma a três semanas',
        corpo: '<p>Entre a resolução da conjuntivite e o início do quadro sistêmico decorrem em geral 1 a 3 semanas, com a criança assintomática.</p>',
      },
      purpura: {
        kicker: 'FASE 2',
        titulo: 'Púrpura e choque',
        corpo: '<p>Febre alta, vômitos e dor abdominal, seguidos de petéquias que confluem em púrpura e evoluem para necrose de extremidades. O choque se instala em 12 a 48 h do início da febre.</p>',
        legendaMidia: 'Púrpura fulminante por <em>Neisseria meningitidis</em> em criança de 22 meses, membro inferior e tórax. Imagem ilustrativa de outra etiologia. Cureus 2026;18(6):e110715, CC BY 4.0.',
      },
      mecanismo: {
        kicker: 'MECANISMO',
        titulo: 'Endotoxina e endotélio',
        corpo: '<p>A bacteremia com liberação de LOS ativa TLR4 e desencadeia resposta inflamatória sistêmica, com lesão endotelial difusa. O consumo de plaquetas e de fatores de coagulação configura <span class="termo" data-termo="civd">CIVD</span>, com trombose da microcirculação e hemorragia cutânea.</p>',
      },
      dados: {
        kicker: 'EPIDEMIOLOGIA E CONDUTA',
        titulo: 'Dados e conduta',
        ficha: [
          ['Faixa etária', '3 meses a 10 anos'],
          ['Letalidade', 'cerca de 70% nos primeiros surtos'],
          ['Diagnóstico', 'hemocultura'],
          ['Líquor', 'em geral sem pleocitose'],
          ['Diagnóstico diferencial', 'meningococcemia'],
          ['Notificação', 'compulsória imediata'],
          ['Conduta na época', 'ceftriaxona; ou ampicilina associada a cloranfenicol; suporte intensivo'],
          ['Contatos em surto', 'rifampicina 20 mg/kg/dia, máximo de 600 mg, 1×/dia por 4 dias; tratamento sistêmico da conjuntivite'],
          ['Situação atual', 'casos esporádicos a partir dos anos 1990'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 8
  tratamento: {
    numero: 8,
    titulo: 'Tratamento',
    integrante: 3,
    passos: {
      alvo: {
        kicker: 'ALVO',
        titulo: 'PBP3 no septo',
        corpo: '<p>A <span class="termo" data-termo="pbp3">PBP3</span>, produto do gene <em>ftsI</em>, catalisa a transpeptidação do peptidoglicano do septo durante a divisão celular. O beta-lactâmico atravessa a membrana externa pelas porinas, alcança o periplasma e acila o sítio ativo da PBP.</p>',
        legendaMidia: 'Modelo em corte na região do septo, com o anel de PBP3 em destaque.',
      },
      invasivo: {
        kicker: 'DOENÇA INVASIVA',
        titulo: 'Ceftriaxona ou cefotaxima',
        ficha: [
          ['Indicação', 'meningite, epiglotite, sepse'],
          ['Ceftriaxona', '80 a 100 mg/kg/dia IV, em 1 ou 2 tomadas, máximo de 4 g/dia'],
          ['Cefotaxima', '225 a 300 mg/kg/dia IV, dividida a cada 6 a 8 h'],
          ['Motivo da escolha', 'penetração liquórica e estabilidade frente a beta-lactamases'],
          ['Duração na meningite', '10 dias (CDC); 7 dias admitidos pela IDSA na doença não complicada; 14 a 21 dias se complicada'],
          ['Ampicilina empírica', 'não indicada; 25 a 30% das cepas produzem beta-lactamase'],
          ['Alternativa histórica', 'cloranfenicol com ampicilina, em contexto de recurso limitado'],
        ],
      },
      dexametasona: {
        kicker: 'DEXAMETASONA',
        titulo: 'Janela da primeira dose',
        ficha: [
          ['Dose', '0,15 mg/kg IV a cada 6 h'],
          ['Duração', '2 a 4 dias'],
          ['Momento', '10 a 20 min antes da primeira dose do antimicrobiano, ou junto dela'],
          ['Antibiótico já administrado', 'não iniciar (IDSA, A-I)'],
          ['Desfecho com evidência no Hib', 'perda auditiva grave, RR 0,34 (IC95% 0,20 a 0,59), 4% contra 12%'],
          ['Mortalidade', 'sem redução no Hib; redução na meningite pneumocócica'],
          ['Ressalva geográfica', 'sem benefício demonstrado em países de baixa renda'],
          ['Recomendação formal', 'lactentes e crianças com meningite por Hib'],
        ],
      },
      naoInvasivo: {
        kicker: 'DOENÇA DE MUCOSA',
        titulo: 'Amoxicilina em dose alta',
        ficha: [
          ['Primeira escolha', 'amoxicilina 80 a 90 mg/kg/dia VO, dividida 12/12 h, na otite média aguda'],
          ['Produção de beta-lactamase', 'amoxicilina-clavulanato, com 1,9% de resistência em 700 isolados'],
          ['Cefalosporina oral', '2ª ou 3ª geração'],
          ['Fluoroquinolona', 'adultos; levofloxacino 100% sensível em 700 isolados invasivos (EUA, 2016); restrição pediátrica por toxicidade articular'],
          ['Macrolídeo', 'atividade limitada; 46% dos isolados com sensibilidade reduzida à claritromicina; não indicado em doença invasiva'],
          ['Cloranfenicol', '99,7% dos isolados sensíveis; uso abandonado por toxicidade'],
          ['Fonte dos percentuais', 'Potts CC et al., Microbiol Spectr 2022; 700 isolados invasivos, EUA, 2016'],
        ],
      },
      betalactamase: {
        kicker: 'RESISTÊNCIA 1',
        titulo: 'Beta-lactamase',
        corpo: '<p>TEM-1 e, com menor frequência, ROB-1 hidrolisam o anel beta-lactâmico no periplasma, em cerca de 25 a 30% das cepas, com variação regional. O clavulanato inibe a enzima, e a detecção se faz com nitrocefina, que passa de amarelo a vermelho em minutos.</p>',
        legendaMidia: 'Glóbulos de beta-lactamase no espaço periplasmático do modelo, em destaque.',
      },
      blnar: {
        kicker: 'RESISTÊNCIA 2',
        titulo: 'BLNAR',
        ficha: [
          ['Mecanismo', 'mutações em <em>ftsI</em> reduzem a afinidade da PBP3 pelo beta-lactâmico'],
          ['Nitrocefina', 'negativa (cepa sem beta-lactamase)'],
          ['Clavulanato', 'não restaura a atividade'],
          ['Orientação CLSI', 'considerar resistente também a amoxicilina-clavulanato, ampicilina-sulbactam e cefuroxima'],
          ['Cefalosporinas de 3ª geração', 'em geral mantêm atividade'],
          ['BLPACR', 'beta-lactamase positiva com PBP3 alterada'],
          ['Meio do antibiograma', 'HTM (Haemophilus Test Medium), leitura em 16 a 18 h'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 9
  prevencao: {
    numero: 9,
    titulo: 'Prevenção',
    integrante: 3,
    passos: {
      tindependente: {
        kicker: 'ANTÍGENO POLISSACARÍDICO',
        titulo: 'Resposta T-independente',
        corpo: '<p>O PRP é antígeno <span class="termo" data-termo="tIndependente">T-independente</span> do tipo 2 e ativa o linfócito B sem auxílio do linfócito T, com IgM de baixa afinidade e imunogenicidade pobre antes dos 18 a 24 meses. Com o polissacarídeo puro, doses repetidas não elevavam o título de anticorpo.</p>',
      },
      conjugacao: {
        kicker: 'CONJUGAÇÃO',
        titulo: 'PRP ligado a proteína',
        ficha: [
          ['PRP-T', 'toxoide tetânico; componente Hib da pentavalente brasileira'],
          ['HbOC', 'CRM197, mutante atóxico da toxina diftérica'],
          ['PRP-OMP', 'complexo proteico de membrana externa de meningococo'],
          ['Papel do carreador', 'fornecer epítopos peptídicos que recrutam o linfócito T CD4'],
          ['Ressalva', 'o conjugado não substitui a vacinação antitetânica de rotina'],
        ],
        legendaMidia: 'Filamento de PRP destacado da cápsula do modelo e ligado covalentemente à proteína carreadora.',
      },
      tdependente: {
        kicker: 'RESPOSTA T-DEPENDENTE',
        titulo: 'Memória imunológica',
        ficha: [
          ['Linfócito B específico para o PRP', 'internaliza o conjugado e apresenta peptídeos do carreador em MHC de classe II'],
          ['Linfócito T CD4', 'auxílio para troca de classe para IgG e maturação de afinidade'],
          ['Doses repetidas', 'resposta de reforço'],
          ['Portador nasofaríngeo', 'reduzido pela vacinação'],
        ],
        legendaMidia: 'Esquema vetorial: apresentação do peptídeo do carreador em MHC II ao linfócito T CD4.',
      },
      brasil: {
        kicker: 'BRASIL · PNI',
        titulo: 'Calendário e profilaxia',
        ficha: [
          ['1999', 'vacina conjugada Hib (PRP-T) na rotina infantil'],
          ['2002', 'tetravalente, DTP com Hib'],
          ['2012', 'pentavalente, DTP com hepatite B e Hib'],
          ['Esquema', '2, 4 e 6 meses; sem reforço de Hib na rotina'],
          ['Quimioprofilaxia', 'rifampicina 20 mg/kg/dia, máximo de 600 mg, 1×/dia por 4 dias'],
          ['Indicação', 'contato domiciliar com menor de 4 anos incompletamente vacinado ou com imunodeprimido'],
          ['Caso-índice', 'recebe rifampicina se tratado sem ceftriaxona ou cefotaxima'],
        ],
      },
      grafico: {
        kicker: 'BRASIL 1983–2001',
        titulo: 'Meningite por Hib',
        ficha: [
          ['Indicador', 'meningite por Hib em menores de 1 ano, casos por 100 mil'],
          ['1998', '26,1'],
          ['2001', '4,3'],
          ['Vacina conjugada no PNI', 'segundo semestre de 1999'],
          ['Limite da série', 'só a meningite por Hib é de notificação compulsória; não mede a doença invasiva total'],
        ],
        legendaMidia: 'Miranzi SSC, Moraes SA, Freitas ICM. Rev Soc Bras Med Trop 2006;39(5):473-477. Dados de notificação compulsória (FUNASA), denominadores IBGE.',
      },
      substituicao: {
        kicker: 'ERA PÓS-VACINAL',
        titulo: 'Desmascaramento',
        ficha: [
          ['Europa, 2007 a 2014', 'entre os casos com sorotipo informado, 78% não tipáveis e 9% tipo b'],
          ['Leitura', 'predomínio relativo, por remoção do tipo b; sem demonstração de substituição capsular induzida pela vacina'],
          ['Sorotipo a (Hia)', 'aumento medido em populações indígenas da América do Norte e do Ártico; sem vacina licenciada'],
          ['Alcance da vacina', 'anti-PRP cobre o sorotipo b; não cobre Hia, demais capsulados nem NTHi'],
        ],
        legendaMidia: 'Vigilância europeia, 2007 a 2014. Notificação de tipo b em queda de 11,9% ao ano e de não tipável em alta de 7,4% ao ano; o aumento absoluto de NTHi pode refletir melhora de detecção e não tem causa estabelecida. Whittaker R et al., Emerg Infect Dis 2017.',
      },
      fecho: {
        kicker: 'HAEMOPHILUS INFLUENZAE',
        titulo: 'Linha do tempo',
        ficha: [
          ['1892', 'isolamento por Richard Pfeiffer'],
          ['1995', 'primeiro genoma completo de organismo de vida livre'],
          ['1999', 'vacina conjugada Hib na rotina do PNI'],
        ],
      },
    },
  },

  // ------------------------------------------------------------------ 10
  estudo: {
    numero: 10,
    titulo: 'Modo estudo',
    integrante: null,
    passos: {
      glossario: {
        kicker: 'MODO ESTUDO',
        titulo: 'Glossário e créditos',
        corpo: '<p>Termos técnicos com definição de uma frase, acessíveis por clique. Créditos e licença de cada imagem, por capítulo.</p>',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// GLOSSARIO — toda chave usada em data-termo existe aqui. Definicoes de 1 frase.
// ---------------------------------------------------------------------------
export const GLOSSARIO = {
  cocobacilo: { termo: 'Cocobacilo', def: 'Bastonete curto, de contorno quase oval, intermediário entre coco e bacilo.' },
  pleomorfico: { termo: 'Pleomórfico', def: 'Que varia de forma na mesma amostra, de cocoide a filamentoso.' },
  fastidioso: { termo: 'Fastidioso', def: 'Microrganismo que exige do meio nutrientes pré-formados que não sintetiza.' },
  fatorX: { termo: 'Fator X (hemina)', def: 'Hemina ou hematina, fonte de protoporfirina IX para citocromos, catalase e peroxidase.' },
  fatorV: { termo: 'Fator V (NAD)', def: 'Nicotinamida adenina dinucleotídeo, coenzima carreadora de elétrons que a espécie não sintetiza.' },
  nadase: { termo: 'NADase', def: 'Enzima do soro que degrada o NAD livre e limita o fator V disponível no ágar sangue.' },
  agarChocolate: { termo: 'Ágar chocolate', def: 'Ágar sangue aquecido a 70 a 80 °C, que libera NAD das hemácias e inativa as NADases do soro.' },
  satelitismo: { termo: 'Satelitismo', def: 'Crescimento de H. influenzae restrito à faixa vizinha a uma estria de S. aureus, que excreta NAD.' },
  porfirina: { termo: 'Teste da porfirina (ALA)', def: 'Prova que verifica a conversão de ácido δ-aminolevulínico em porfirinas, detectada por fluorescência sob ultravioleta.' },
  oxidase: { termo: 'Oxidase de Kovács', def: 'Prova que detecta citocromo oxidase, com cor púrpura em até 10 segundos.' },
  htm: { termo: 'HTM', def: 'Haemophilus Test Medium, meio transparente padronizado pelo CLSI para o antibiograma do gênero.' },
  nitrocefina: { termo: 'Nitrocefina', def: 'Cefalosporina cromogênica que muda de amarelo para vermelho quando o anel beta-lactâmico é hidrolisado.' },
  biotipos: { termo: 'Biotipos I a VIII', def: 'Classificação de H. influenzae por indol, urease e ornitina-descarboxilase.' },
  prp: { termo: 'PRP', def: 'Polirribosil-ribitol-fosfato, o polissacarídeo da cápsula do sorotipo b e o antígeno da vacina conjugada.' },
  sorotipos: { termo: 'Sorotipos a-f', def: 'Os seis tipos capsulares de H. influenzae, definidos por polissacarídeos antigenicamente distintos.' },
  nthi: { termo: 'NTHi', def: 'Cepa não tipável, sem cápsula, que não aglutina com os antissoros a-f.' },
  los: { termo: 'LOS', def: 'Lipo-oligossacarídeo, endotoxina da membrana externa sem a cadeia longa de antígeno O.' },
  lipidioA: { termo: 'Lipídeo A', def: 'Porção lipídica do LOS que ativa o TLR4 e induz TNF-α, IL-1 e IL-6.' },
  variacaoDeFase: { termo: 'Variação de fase', def: 'Alternância reversível de expressão de genes de superfície, que muda os epítopos reconhecidos pelo anticorpo.' },
  sialilacao: { termo: 'Sialilação', def: 'Adição de ácido siálico ao LOS, que mimetiza glicoconjugados do hospedeiro e reduz a deposição de complemento.' },
  fosforilcolina: { termo: 'Fosforilcolina (ChoP)', def: 'Grupo adicionado ao LOS que se liga ao receptor de PAF no epitélio respiratório.' },
  proteaseIgA1: { termo: 'Protease de IgA1', def: 'Serina-protease autotransportadora que cliva a IgA1 secretora humana na região da dobradiça.' },
  hmw: { termo: 'HMW1 e HMW2', def: 'Adesinas de alto peso molecular presentes em cerca de 75% das cepas não tipáveis.' },
  hia: { termo: 'Hia', def: 'Adesina autotransportadora das cepas não tipáveis que não expressam HMW1 e HMW2.' },
  hap: { termo: 'Hap', def: 'Autotransportador de adesão que participa da formação de microcolônias.' },
  p2: { termo: 'P2', def: 'Porina majoritária da membrana externa e antígeno hipervariável.' },
  p6: { termo: 'P6', def: 'Lipoproteína conservada de 16 kDa associada ao peptidoglicano, estudada como antígeno vacinal.' },
  p5: { termo: 'P5', def: 'Proteína de membrana externa homóloga da OmpA, que medeia adesão e resistência ao complemento.' },
  proteinaD: { termo: 'Proteína D', def: 'Glicerofosfodiéster fosfodiesterase de superfície, presente em cepas capsuladas e não capsuladas.' },
  biofilme: { termo: 'Biofilme', def: 'Comunidade bacteriana aderida e envolvida em matriz, com tolerância aumentada ao antibiótico.' },
  competencia: { termo: 'Competência natural', def: 'Capacidade de captar DNA livre do ambiente e incorporá-lo ao cromossomo.' },
  uss: { termo: 'USS', def: 'Uptake signal sequence, sequência de 9 pares de base que marca o DNA preferido na transformação.' },
  bacteremia: { termo: 'Bacteremia', def: 'Presença de bactéria viável na corrente sanguínea.' },
  barreiraHematoencefalica: { termo: 'Barreira hematoencefálica', def: 'Endotélio dos capilares cerebrais, com junções oclusivas, que restringe a passagem de solutos e de células do sangue para o tecido nervoso; a barreira entre sangue e líquor é a hematoliquórica, do plexo coroide.' },
  civd: { termo: 'CIVD', def: 'Coagulação intravascular disseminada, com consumo de plaquetas e fatores, trombose da microcirculação e sangramento.' },
  biogrupoAegyptius: { termo: 'Biogrupo aegyptius', def: 'Variante de H. influenzae biotipo III, o bacilo de Koch-Weeks, agente da conjuntivite epidêmica e da febre purpúrica brasileira.' },
  bpf: { termo: 'Clone BPF', def: 'Clone de H. influenzae biogrupo aegyptius associado aos surtos de febre purpúrica no Brasil.' },
  pbp3: { termo: 'PBP3 (FtsI)', def: 'Transpeptidase do septo de divisão, codificada por ftsI e alvo dos beta-lactâmicos.' },
  betaLactamase: { termo: 'Beta-lactamase', def: 'Enzima periplasmática que hidrolisa o anel beta-lactâmico; em H. influenzae, sobretudo TEM-1 e ROB-1.' },
  blnar: { termo: 'BLNAR', def: 'Cepa beta-lactamase negativa e resistente à ampicilina por alteração da PBP3.' },
  blpacr: { termo: 'BLPACR', def: 'Cepa que produz beta-lactamase e também tem PBP3 alterada, resistente a amoxicilina-clavulanato.' },
  tIndependente: { termo: 'Antígeno T-independente', def: 'Antígeno que ativa o linfócito B sem auxílio do linfócito T, com IgM e sem memória.' },
  tDependente: { termo: 'Resposta T-dependente', def: 'Resposta com auxílio do linfócito T CD4 via MHC II, com troca de classe para IgG, maturação de afinidade e memória.' },
  conjugacao: { termo: 'Conjugação vacinal', def: 'Ligação covalente de um polissacarídeo a uma proteína carreadora para torná-lo T-dependente.' },
  crm197: { termo: 'CRM197', def: 'Mutante atóxico da toxina diftérica usado como proteína carreadora.' },
  prpT: { termo: 'PRP-T', def: 'Conjugado de PRP com toxoide tetânico, componente Hib da pentavalente do PNI.' },
  prpOmp: { termo: 'PRP-OMP', def: 'Conjugado de PRP com complexo proteico de membrana externa de meningococo.' },
  efeitoRebanho: { termo: 'Efeito de rebanho', def: 'Proteção indireta de não vacinados pela redução do estado de portador na população vacinada.' },
  hacek: { termo: 'HACEK', def: 'Grupo de bacilos Gram-negativos fastidiosos da orofaringe associados a endocardite de curso insidioso.' },
  maldiTof: { termo: 'MALDI-TOF', def: 'Espectrometria de massa de proteínas ribossômicas que identifica a espécie, mas não separa H. influenzae de H. haemolyticus.' },
  timpanocentese: { termo: 'Timpanocentese', def: 'Punção da membrana timpânica para coleta de efusão do ouvido médio.' },
  bubao: { termo: 'Bubão', def: 'Linfonodo inguinal aumentado e flutuante, que pode fistulizar no cancro mole.' },
  bouba: { termo: 'Bouba', def: 'Treponematose cutânea não venérea causada por Treponema pallidum subsp. pertenue.' },
}
