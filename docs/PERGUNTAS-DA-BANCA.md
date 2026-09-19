# Perguntas da banca — *Haemophilus*

Simulação da arguição ao fim do seminário. 25 perguntas ordenadas por eixo temático (identificação → virulência →
clínica → tratamento → prevenção), cada uma com resposta curta e correta e a indicação do passo da apresentação
que já cobre o assunto (`capítulo/passo`, conforme `ESTRUTURA.md`) ou `não coberto`.

Etiquetas: **[clássica]** cai em qualquer prova · **[intermediária]** exige leitura além do resumo ·
**[derruba grupo]** a resposta intuitiva está errada, ou o dado do roteiro ficaria desatualizado.

---

## A · Morfologia, cultivo e identificação

**1. O que são os fatores X e V, e por que o *H. influenzae* cresce mal em ágar sangue se o meio contém os dois?** **[derruba grupo]**
X é a hemina (protoporfirina IX): o microrganismo não sintetiza o anel, então depende dela para montar citocromos,
catalase e peroxidase. V é o NAD/NADP. No ágar sangue a hemina está acessível mesmo com a hemácia íntegra — o gargalo
é só o V, que fica intracelular e é consumido pelas NADases do soro. O ágar chocolate resolve por aquecimento brando
(70–80 °C): lisa a hemácia, libera NAD e inativa as NADases. Autoclavar (120 °C) destrói o fator V, que é termolábil;
o fator X é termoestável.
Cobertura: `exigencia/fastidioso`, `exigencia/fatorX`, `exigencia/fatorV`, `exigencia/chocolate`.

**2. No satelitismo, qual fator o *S. aureus* fornece?** **[derruba grupo]**
Fator V, do começo ao fim. O estafilococo sintetiza e excreta NAD, e a β-hemolisina libera mais NAD de dentro das
hemácias. A hemina já estava disponível no meio. Dizer que a hemólise "libera o fator X" é o erro mais comum do tema.
As colônias satélites marcam a faixa onde chegou NAD suficiente para o crescimento.
Cobertura: `identificacao/satelitismo`.

**3. Teste da porfirina (ALA): o que ele mede e qual é o resultado no *H. influenzae*?** **[clássica]**
Mede se o isolado sintetiza porfirinas a partir do ácido δ-aminolevulínico, ou seja, se independe de hemina exógena.
Leitura por fluorescência vermelha sob UV (≈360 nm) ou pelo reagente de Kovács. *H. influenzae* é **negativo**:
não sintetiza, logo exige fator X. A vantagem prática sobre os discos é contornar o arraste de hemina do meio primário
e a contaminação do meio de teste.
Cobertura: `identificacao/porfirina`.

**4. Como se faz o teste dos discos X, V e XV — e o que vem antes dele no fluxograma?** **[intermediária]**
Antes dos discos vem a oxidase de Kovács (leitura em até 10 s, com alça plástica ou palito — alça de nicromo dá falso
positivo). O meio dos discos precisa ser isento de hemina e NAD: HIA ou TSA, nunca Mueller-Hinton suplementado.
Inóculo de 1,0 McFarland a partir de cultura de 18–24 h; 35–37 °C, ~5% CO₂. *H. influenzae* cresce só no XV;
*H. parainfluenzae*, no V e no XV; *H. ducreyi*, só no X. Erro clássico: arrastar ágar chocolate no inóculo — o traço
de hemina falseia o teste.
Cobertura: `identificacao/discos`; a oxidase e o perfil bioquímico (catalase +, nitrato → nitrito, glicose +) são `não coberto`.

**5. Que outra espécie exige X e V, e como o laboratório a separa?** **[derruba grupo]**
*H. haemolyticus* — também exige os dois fatores e também cresce apenas no disco XV, portanto é indistinguível nesse
teste. Separa-se pela β-hemólise em ágar com sangue de cavalo ou coelho (nunca em chocolate, onde o sangue já foi lisado),
mas a hemólise se perde em repiques sucessivos. MALDI-TOF **não** resolve o grupo *H. influenzae*. A separação confiável
é molecular: PCR do gene *fucK*, presente em *H. influenzae* e ausente em *H. haemolyticus*.
Cobertura: `identificacao/discos` e `identificacao/fechamento` (parcial — a ressalva do MALDI-TOF é `não coberto`).

**6. Descreva a morfologia. E isolar cocobacilo Gram-negativo no escarro fecha diagnóstico?** **[intermediária]**
Cocobacilo Gram-negativo pleomórfico, 0,3–0,5 µm de largura por 0,5–3 µm de comprimento, imóvel (sem flagelo), não
esporulado, anaeróbio facultativo; cora em rosa porque o envelope é de três camadas com peptidoglicano fino, que não
retém o cristal violeta. Isolar no escarro **não** fecha diagnóstico: o NTHi é comensal de naso/orofaringe em 25% a 80%
das pessoas saudáveis. O achado só pesa como isolado predominante em amostra purulenta ou acima de 10⁶ UFC/mL — e o
Gram engana, porque ele cora mal (fucsina fenicada diluída rende mais que a safranina).
Cobertura: `identidade/ficha`, `identidade/gram`, `identidade/envelope` (a taxa de colonização e o critério quantitativo são `não coberto`).

---

## B · Fatores de virulência, enzimas e toxinas

**7. Todos os sorotipos capsulares têm cápsula de PRP?** **[derruba grupo]**
Não. Existem seis sorotipos (a–f), cada um com um polissacarídeo antigenicamente distinto. O PRP
(polirribosil-ribitol-fosfato) é a cápsula **do tipo b**. Essa é a base da vacina: sendo o antígeno específico do b,
a conjugada anti-PRP protege apenas contra o sorotipo b — não contra a, c–f nem contra as não tipáveis.
Na era pré-vacinal o tipo b respondia por ~95% da doença invasiva por *H. influenzae*.
Cobertura: `arsenal/capsula`.

**8. Por que se fala em LOS e não em LPS?** **[clássica]**
Porque falta o antígeno O: a molécula tem lipídeo A e o núcleo oligossacarídico, e para no oligossacarídeo — daí
lipo-oligossacarídeo. O lipídeo A ativa TLR4 e dispara TNF-α, IL-1 e IL-6; a molécula causa ciliostase no epitélio
respiratório. A superfície é variável: variação de fase, sialilação e fosforilcolina (ChoP) mudam o epitopo e ajudam
na evasão do anticorpo e do complemento.
Cobertura: `arsenal/los`.

**9. A protease de IgA1 é fator de virulência estabelecido?** **[derruba grupo]**
A enzima existe: serina-protease autotransportadora (secreção tipo V) que cliva a IgA1 secretora na região de dobradiça,
separando Fab de Fc. Mas há três ressalvas. São dois genes — o clássico *iga*, quase universal, e o *igaB*, adquirido de
*N. meningitidis*. PCR positiva não prova atividade enzimática. E o papel na virulência não está demonstrado: a enzima é
específica da IgA1 humana e não há modelo animal. A distribuição (*igaB* em 46% dos isolados respiratórios contra 19% dos
invasivos) sugere persistência em mucosa, não invasão.
Cobertura: `arsenal/iga`.

**10. Por que a otite por NTHi recidiva e por que a DPOC não "cura" a infecção?** **[intermediária]**
Persistência. O NTHi é o agente bacteriano mais isolado nas exacerbações de DPOC e permanece meses na via aérea inferior
— a mesma cepa, com sequência de *P2* idêntica após 7 a 20 meses. O nicho intracelular é o mecanismo melhor documentado:
NTHi intracelular em biópsia brônquica de 0% dos sadios, 33% dos DPOC estáveis e 87% dos em exacerbação. O biofilme é
mecanismo complementar, com evidência in vitro e em modelo animal, ainda sem demonstração direta no pulmão humano.
Cobertura: `arsenal/biofilme`, `espectro/dpoc`.

---

## C · Manifestações clínicas

**11. Meningite por Hib: pico etário, letalidade e sequelas.** **[clássica]**
Era a forma invasiva mais comum do Hib (50%–65% dos casos na era pré-vacinal), com pico entre 6 e 11 meses e até 60%
da doença invasiva antes dos 12 meses. Letalidade de 3% a 6% **mesmo com antibiótico adequado**; 15% a 30% dos
sobreviventes ficam com sequela permanente, sendo a surdez neurossensorial a mais frequente. No lactente a apresentação
costuma ser inespecífica — irritabilidade, vômito, recusa alimentar, abaulamento de fontanela; a ausência de rigidez de
nuca não afasta.
Cobertura: `espectro/meningite`.

**12. Epiglotite: qual a primeira conduta, e hoje ela é doença de quem?** **[intermediária]**
Via aérea antes de qualquer coisa: não examinar a orofaringe com abaixador de língua, não colher exames, não deitar a
criança — estabilizar a via aérea em ambiente preparado e só depois antibiótico (ceftriaxona ou cefotaxima). O sinal do
polegar na radiografia lateral é achado de apoio, nunca condição para agir. Epidemiologia atual: com a vacina, a doença
passou a ser cerca de 3 vezes mais frequente em adultos (incidência ≈3/100.000/ano; letalidade de ~1% na população
geral de casos, chegando a 7%–10% nas séries de adultos), e *H. influenzae* responde por apenas ~25% dos casos adultos.
Cobertura: `espectro/epiglotite` (a inversão etária é `não coberto`).

**13. Cepa não tipável não tem cápsula. Ela causa doença invasiva?** **[derruba grupo]**
Sim, e hoje é a principal causa de doença invasiva por *H. influenzae* nos países vacinados. Nos EUA (2008–2019) a
incidência média foi de 1,3/100.000, subindo a 5,8/100.000 em menores de 1 ano e 10,2/100.000 acima de 80 anos, com risco
5,6× maior em gestantes e puérperas. A regra correta é que a cápsula facilita a invasão, mas não é condição obrigatória:
fora da cápsula, quem decide é o hospedeiro. A febre purpúrica brasileira é a demonstração extrema disso.
Cobertura: `espectro/nthi`.

**14. Qual é o principal agente bacteriano da otite média aguda hoje?** **[derruba grupo]**
Dizer "pneumococo em primeiro, *Haemophilus* em segundo" é ordenação da era pré-PCV. Depois da vacina pneumocócica
conjugada a ordem se inverteu: em séries com timpanocentese logo após a PCV7 o pneumococo caiu de 48% para 31% e o NTHi
subiu de 41% para 56%; na coorte de Rochester (2006–2023) o *H. influenzae* foi o otopatógeno dominante nas eras PCV13.
Ressalva: a inversão é mais nítida na otite recorrente, grave ou refratária, e o pneumococo não sumiu — foi substituído
por sorotipos não vacinais.
Cobertura: `espectro/otite`.

**15. Fora a faixa etária, quem tem risco aumentado de doença invasiva?** **[intermediária]**
Asplenia anatômica ou funcional (inclusive anemia falciforme), deficiência de complemento, deficiência de subclasse IgG2
e outras imunodeficiências humorais, infecção por HIV (9,5/100.000 contra 1,1/100.000 nas demais pessoas), quimioterapia
e transplante de células-tronco hematopoéticas, fístula liquórica e implante coclear. Para o NTHi somam-se prematuridade
(risco 23× maior que o recém-nascido a termo), gestação/puerpério e idade avançada — 84% dos casos com 15 anos ou mais
têm ao menos uma comorbidade.
Cobertura: **não coberto**.

**16. Febre purpúrica brasileira: como é o quadro e o que define o clone?** **[derruba grupo]**
Criança de 3 meses a 10 anos (mediana 30–36 meses) com conjuntivite purulenta que resolve; 7 a 16 dias depois, febre
alta, vômitos e dor abdominal, petéquias → púrpura → necrose de extremidades e choque em 12–48 h. Letalidade ~70%.
Agente: *H. influenzae* biogrupo aegyptius, não capsulado; o líquor em geral não tem pleocitose (mediana de 19
leucócitos/µL), o que ajuda no diferencial com meningococcemia. **Cuidado com o plasmídeo:** o 3031 (≈24 MDa) foi
proposto como marcador do clone, mas há casos de FPB por cepas que não o possuem (Tondella, *J Infect Dis* 1995) —
é marcador epidemiológico frequente, não critério definidor.
Cobertura: `fpb/agente`, `fpb/conjuntivite`, `fpb/intervalo`, `fpb/purpura`, `fpb/dados` — **mas o passo `fpb/agente` afirma
o plasmídeo como "marcador do clone" e precisa ser corrigido.**

**17. Cancro mole: exigências de cultivo, tratamento e o que mudou na literatura recente.** **[intermediária]**
*H. ducreyi* exige fator X e **não** exige o V — padrão inverso ao do *H. parainfluenzae*. Cultivo a 33–35 °C, atmosfera
úmida com 5% CO₂, meio enriquecido; mesmo assim a sensibilidade da cultura é menor que 80%, e o Gram em "cardume de
peixes" não fecha diagnóstico. Tratamento: azitromicina 1 g VO dose única **ou** ceftriaxona 250 mg IM dose única
(alternativas: ciprofloxacino 500 mg 12/12 h por 3 dias; eritromicina 500 mg 8/8 h por 7 dias). Tratar parcerias dos
10 dias anteriores, reavaliar em 3–7 dias, drenar bubão flutuante e testar HIV e sífilis. Novidade: em áreas endêmicas de
bouba, o *H. ducreyi* responde por 27% a 60% das úlceras cutâneas crônicas **não sexuais** em crianças.
Cobertura: `espectro/ducreyi`.

---

## D · Tratamento

**18. Doença invasiva: qual esquema, em que dose e por quanto tempo — e por que não ampicilina?** **[clássica]**
Ceftriaxona ou cefotaxima, iniciada imediatamente, antes de cultura e antibiograma, por dois motivos: penetração
liquórica e estabilidade frente às β-lactamases. Doses pediátricas fora do período neonatal: ceftriaxona 80–100 mg/kg/dia
IV (máx. 4 g/dia) ou cefotaxima 225–300 mg/kg/dia IV dividida a cada 6–8 h. Meningite: 10 dias (CDC), com a IDSA
admitindo 7 dias na doença não complicada. A ampicilina saiu do esquema empírico porque parte relevante das cepas produz
β-lactamase — no Brasil, 17,1% dos isolados invasivos entre 2009 e 2021 (Zanella, *Int Microbiol* 2024).
Cobertura: `tratamento/invasivo` (as doses e o número brasileiro são `não coberto`).

**19. Dexametasona na meningite por Hib: dose, momento, e o que exatamente ela reduz?** **[derruba grupo]**
0,15 mg/kg IV a cada 6 h por 2 a 4 dias, iniciada 10 a 20 min antes da primeira dose do antimicrobiano ou, no mínimo,
junto dela; se o antibiótico já foi dado, a IDSA recomenda não iniciar. O desfecho com evidência específica para
*H. influenzae* é **perda auditiva grave**: RR 0,34 (IC95% 0,20–0,59), 4% contra 12% (Cochrane, Brouwer 2015). Ela **não**
reduziu mortalidade na meningite por *H. influenzae* — a redução de mortalidade apareceu na pneumocócica. E não houve
benefício algum em países de baixa renda.
Cobertura: `tratamento/dexametasona`.

**20. β-lactamase e BLNAR: como o laboratório separa os dois, e por que isso muda a conduta?** **[intermediária]**
O antibiograma de *Haemophilus* não se faz em Mueller-Hinton comum: o meio padronizado pelo CLSI é o HTM (base MH +
extrato de levedura, hematina e NAD), lido em 16–18 h a 35 °C com 5–7% CO₂. A β-lactamase se demonstra em minutos com
nitrocefina (amarelo → vermelho). O BLNAR é, por definição, nitrocefina negativo — a resistência vem da PBP3 alterada por
mutação em *ftsI*, e caracterizá-lo exige CIM. Consequência: enzima se contorna com inibidor ou cefalosporina de 3ª
geração; no BLNAR o clavulanato não resgata nada, porque mudou o alvo. A prevalência de BLNAR é muito maior no Japão
(séries de 23% a 46%, conforme o sítio e o método de detecção) do que nos EUA e na maior parte da Europa, onde segue
incomum.
Cobertura: `tratamento/betalactamase`, `tratamento/blnar` (HTM e nitrocefina são `não coberto`).

**21. Otite, sinusite e exacerbação de DPOC: qual antibiótico, e quando trocar?** **[clássica]**
Amoxicilina em dose alta, 80–90 mg/kg/dia, é a primeira escolha na otite média aguda. Troca-se para
amoxicilina-clavulanato quando há β-lactamase documentada, uso de amoxicilina nos 30 dias anteriores ou síndrome
conjuntivite-otite — justamente o quadro que aponta para NTHi. Falha após 48–72 h também indica o clavulanato.
Alternativas: cefalosporina oral de 2ª/3ª geração e, em adultos, fluoroquinolona respiratória. Macrolídeo é opção fraca
contra *H. influenzae* (CIM intrinsecamente alta, efluxo AcrAB; 46% de sensibilidade reduzida à claritromicina) e **nunca**
serve para doença invasiva.
Cobertura: `tratamento/naoInvasivo`, `espectro/otite`.

---

## E · Epidemiologia e prevenção

**22. Por que a vacina de polissacarídeo puro falhou abaixo dos 2 anos, e o que a conjugação muda?** **[clássica]**
O PRP é antígeno T-independente tipo 2: ativa o linfócito B sem ajuda do T CD4, gerando IgM de baixa afinidade, sem troca
de classe e sem memória — e a resposta depende da maturidade do sistema imune, que só se completa por volta dos 18–24
meses. A prova experimental é direta: com o polissacarídeo puro, repetir a dose **não elevava o título** (sem resposta de
reforço). Conjugado a uma proteína carreadora, o PRP passa a ser processado como antígeno T-dependente: troca de classe
para IgG, maturação de afinidade, memória e resposta de reforço a cada dose.
Cobertura: `prevencao/tindependente`, `prevencao/conjugacao`, `prevencao/tdependente`.

**23. Qual conjugado o Brasil usa, qual é o calendário e qual foi o impacto medido aqui?** **[clássica]**
PRP-T: PRP ligado covalentemente ao **toxoide tetânico**, que é o componente Hib da pentavalente (DTP-HB-Hib) —
2, 4 e 6 meses, sem reforço de Hib na rotina do PNI. O toxoide aqui é carreador, não imunizante antitetânico. Impacto
brasileiro: no Rio Grande do Sul a meningite por Hib caiu 89% entre 1995 e 2001, e em menores de 1 ano de 36,5 para
3,4/100.000, com letalidade nessa faixa caindo de 17,8% para 6,7%; em Goiás, em menores de 5 anos, de 10,8 para
2,3/100.000 no segundo ano pós-vacina. A vacina também reduz o portador nasofaríngeo — daí o efeito de rebanho.
Cobertura: `prevencao/conjugacao`, `prevencao/brasil`, `prevencao/grafico`.

**24. Diagnosticada doença invasiva por Hib: quem recebe quimioprofilaxia, em que dose — e o caso precisa de vacina depois?** **[derruba grupo]**
Pela Nota Técnica Conjunta 154/2024 (DPNI/SVSA/MS): todos os contatos domiciliares quando o domicílio inclui
imunocomprometido **ou criança menor de 2 anos, independentemente da situação vacinal**, ou criança menor de 4 anos não
vacinada ou com esquema incompleto; o próprio paciente, se não tratado com ceftriaxona/cefotaxima. Rifampicina
20 mg/kg/dose 1×/dia por 4 dias (máx. 600 mg; 10 mg/kg/dose se menor de 1 mês; 600 mg no adulto); na **gestante** a
primeira escolha é ceftriaxona. Janela de até 30 dias após a exposição no Hib; em creche, toda a sala se houver segundo
caso em até 60 dias. E sim: criança de 6 meses a <2 anos que teve doença invasiva recebe **dose adicional** mesmo com
esquema completo, 30 dias após o início da doença, respeitando 60 dias da última dose.
Cobertura: `prevencao/brasil` (parcial — o critério de "<2 anos independentemente de vacinação", a janela de 30 dias, a
conduta na gestante e a vacinação pós-doença são `não coberto`).

**25. A vacina criou o problema do NTHi e do sorotipo a — e existe vacina contra eles?** **[derruba grupo]**
Não criou: **desmascarou**. O predomínio do NTHi é relativo, consequência da remoção do tipo b — na Europa (2007–2014),
78% dos casos com sorotipo informado eram não tipáveis contra 9% de tipo b; no Brasil (2009–2021), 51,4% NTHi, 22%
sorotipo a e 21,5% tipo b. Não há demonstração de que a imunização anti-PRP empurre outros sorotipos capsulados; o
aumento absoluto de notificações de NTHi pode refletir melhora de vigilância. O sorotipo a (Hia) é o terceiro personagem,
com incidência de 21/100.000 no Alasca e 102/100.000 no norte do Canadá em crianças indígenas menores de 2 anos, e
**não há vacina licenciada** contra ele. Contra NTHi também não: a proteína D como carreadora (POET, eficácia de 35,3%
contra otite por NTHi) não se confirmou nos ensaios seguintes — COMPAS, 21,5% (IC95% −43,4 a 57,0), não demonstrada — e o
candidato proteico para DPOC falhou na fase 2 (13,3%, sem significância).
Cobertura: `prevencao/substituicao`, `espectro/nthi` (o estado da arte vacinal anti-NTHi/Hia é `não coberto`).

---

# Lacunas de conteúdo que ainda valeria cobrir

Curtas, na ordem em que apareceriam na apresentação.

1. **Oxidase de Kovács e perfil bioquímico** — o roteiro começa o fluxograma nos discos de X e V. Falta o primeiro passo
   (oxidase, leitura em 10 s) e o perfil da espécie: catalase +, redução de nitrato a nitrito, fermentação de glicose.
   Encaixe: `identificacao/discos`, uma linha de ficha antes dos discos.

2. **Limite do MALDI-TOF e o gene *fucK*** — como está, o roteiro cita MALDI-TOF como solução. Ele não separa
   *H. influenzae* de *H. haemolyticus*, *H. aegyptius* e genoespécies crípticas, e 12% a 40% dos isolados respiratórios
   dependentes de X e V não são *H. influenzae*. Encaixe: `identificacao/fechamento`.

3. **Cuidado pré-analítico** — o líquor para cultura **não** se refrigera (mantém-se a 20–35 °C, processar em até 1 h,
   ou meio de transporte Trans-Isolate). É onde o diagnóstico mais se perde na prática. Encaixe: `identificacao/fechamento`.

4. **OMPs P2, P5 e P6** — o roteiro cita P2 e P6 sem o contraste que dá sentido a elas: P2 é a porina majoritária e
   hipervariável (escapa do anticorpo), P6 é conservada (por isso é candidata vacinal), P5 é adesina e dá resistência ao
   complemento. Encaixe: `arsenal/adesao`.

5. **Hospedeiro de risco** — asplenia/falciforme, deficiência de complemento, deficiência de IgG2, HIV, TCTH, fístula
   liquórica; e, para o NTHi, prematuridade, gestação/puerpério e idade avançada. É a pergunta natural depois do slide do
   NTHi. Encaixe: `espectro/nthi` ou ficha em `espectro/hib`.

6. **Tratamento da endocardite HACEK** — o roteiro cita o grupo e para aí. Ceftriaxona 2 g/dia, 4 semanas em valva nativa
   e 6 semanas em prótese; ampicilina deixou de ser primeira linha por β-lactamase. Encaixe: `espectro/parainfluenzae`.

7. **Plasmídeo 3031 (correção, não adição)** — o passo afirma o plasmídeo como "marcador do clone". Há FPB por cepas que
   não o carregam (Tondella 1995). Reescrever como marcador epidemiológico frequente. Encaixe: `fpb/agente`.

8. **HTM e nitrocefina** — o roteiro descreve os dois mecanismos de resistência mas não como o laboratório os distingue,
   que é o elo entre os capítulos 4 e 8. Encaixe: `tratamento/betalactamase`.

9. **Números brasileiros de resistência** — trocar a faixa genérica "≈10–30%" pela série nacional: 17,1% de produtores de
   β-lactamase em 1.437 isolados invasivos, 2009–2021 (Zanella, *Int Microbiol* 2024). Encaixe: `tratamento/betalactamase`.

10. **Esquema vacinal e suas regras** — idade mínima de 6 semanas para a primeira dose, os três esquemas aceitos pela OMS
    (3p+0 — o brasileiro —, 2p+1 e 3p+1, sem preferência declarada entre eles), dose única quando a primeira dose é depois
    dos 12 meses e desnecessidade da vacina em criança saudável acima de 5 anos. Encaixe: `prevencao/brasil`.

11. **Quimioprofilaxia atualizada e vacinação pós-doença** — ver pergunta 24: o critério brasileiro vigente inclui criança
    menor de 2 anos independentemente da situação vacinal, janela de até 30 dias, ceftriaxona na gestante e dose adicional
    de vacina para quem adoeceu entre 6 meses e 2 anos. Encaixe: `prevencao/brasil`.

---

## Fontes consultadas para conferência

CDC Pink Book, cap. 8 (*Haemophilus influenzae*) · CDC STI Treatment Guidelines (chancroid) · OMS/CDC, *Laboratory Methods
for the Diagnosis of Meningitis*, WHO/IVB.11.09, 2ª ed. · OMS, *Hib Vaccination Position Paper*, jul. 2013 · Ministério da
Saúde, Nota Técnica Conjunta nº 154/2024 DPNI/SVSA/MS · Cochrane (Brouwer 2015), corticoides na meningite bacteriana ·
Oliveira et al., *Clin Infect Dis* 2023 (NTHi invasivo, EUA) · Whittaker et al., *Emerg Infect Dis* 2017 (Europa) ·
Zanella et al., *Int Microbiol* 2024 (Brasil, 2009–2021) · Kmetzsch et al., *J Pediatr (RJ)* 2003 · Simões et al.,
*Rev Saúde Pública* 2004 · Harrison, Simonsen & Waldman, *Clin Microbiol Rev* 2008 (FPB) · Tondella et al., *J Infect Dis*
1995 (cepas sem o plasmídeo 3031) · Block et al., *Pediatr Infect Dis J* 2004 e coorte de Rochester (otite) ·
Prymula et al., *Lancet* 2006 (POET) e COMPAS/FinIP (proteína D) · Potts et al., *Microbiol Spectr* 2022 (sensibilidade) ·
Nørskov-Lauritsen & Kilian, *Int J Syst Evol Microbiol* 2006 (*Aggregatibacter*) · StatPearls, *Epiglottitis*.
