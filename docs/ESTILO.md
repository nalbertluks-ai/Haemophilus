# ESTILO — como se escreve o texto que vai para a tela

Uma página. Vale para `src/conteudo.js`, para qualquer legenda e para qualquer texto novo do projeto.
O roteiro falado (`FALAS.md`) segue as mesmas proibições de vício, mas pode ser mais solto: lá é fala, não é tela.

---

## 1. Lista negativa pesquisada (marcas de texto gerado por IA)

Levantada em 18/09/2026 em: `Wikipedia:Signs of AI writing` (WikiProject AI Cleanup, guia de ~15 mil palavras),
Metric37 *Common AI Words and Phrases (2026 List)*, AIAdventureClub *How to spot AI writing in 2026*,
Canaltech, Exame, Fast Company Brasil e Advoco Brasil (versões em português).
Links no fim do arquivo.

### 1.1 Construções (as mais delatoras)
| Marca | Exemplo do que NÃO escrever |
|---|---|
| Paralelismo negativo | "não é X, é Y" · "não apenas X, mas também Y" · "mais do que X, é Y" |
| Regra de três | "clara, concisa e convincente" · qualquer enumeração de três feita por ritmo, não por fato |
| Pergunta retórica seguida de resposta | "E o que isso significa? Significa que..." |
| Travessão dramático | travessão para criar suspense ou pausa de efeito (o "hífen do ChatGPT") |
| Dois-pontos de revelação | "O resultado foi um só: ..." |
| Staccato | "Sem cápsula. Sem defesa. Só mucosa." |
| Bloco "Desafios e perspectivas" | "Apesar dos desafios, ... segue promissor" |
| Fecho moralizante | parágrafo final que ensina uma lição ao leitor |
| Frase de tamanho uniforme | 18 a 24 palavras, uma atrás da outra, sem variação (apontado como o maior sinal em 2026) |
| Particípio presente pendurado | "..., destacando a importância de..." · "..., refletindo o papel de..." |
| Atribuição vaga | "especialistas afirmam" · "estudos mostram" · "observadores citam" sem nome nem ano |
| Conectivo de abertura repetido | todo parágrafo começando com "Além disso", "Ademais", "No entanto", "Em conclusão" |
| Metadiscurso | "como vimos", "vamos ver", "neste slide veremos", "a regra que trouxemos" |

### 1.2 Vocabulário (em português)
crucial · fundamental · robusto · essencial · vital · pivotal · notável · significativo (como elogio) ·
mergulhar · aprofundar-se · desvendar · jornada · panorama · cenário (como floreio) · tapeçaria · legado duradouro ·
riquíssimo · vibrante · diversificado · abrangente · holístico · paradigma · revolucionário · inovador ·
testemunho de · desempenha um papel · vale destacar · é importante notar · na verdade · justamente ·
simplesmente · literalmente · genuinamente · efetivamente · em suma · por fim, mas não menos importante.

`crucial` é o caso mais denunciado em português. `fundamental` vem logo atrás.

### 1.3 Vocabulário (em inglês, para não traduzir de volta)
delve · intricate · interplay · tapestry · testament · pivotal · underscore · showcase · foster · align with ·
enhance · boasts · vibrant · nestled · landscape · meticulous · garner · bolster · groundbreaking · seamless.

### 1.4 Formatação
Sem emoji. Sem negrito espalhado por palavra solta dentro da frase. Sem lista de três itens quando os itens
são dois ou quatro. Sem título do tipo "Nome: subtítulo explicativo".

---

## 2. Regras do slide (as que valem acima de tudo)

O slide **não narra**. Quem narra são os três apresentadores. A fala mora em `FALAS.md`.

Entra na tela, por passo:
1. **kicker** — rótulo curto, em caixa alta, 1 a 3 palavras.
2. **título** — 1 a 4 palavras.
3. **corpo** — no máximo **2 frases factuais**, OU
4. **ficha** — pares `termo → valor`, quando o conteúdo é tabular.
5. **legenda de mídia** — legenda técnica da imagem, com crédito quando houver.

Registro: de livro-texto e de artigo. Substantivo, preciso, impessoal.
Todo número vem com unidade. Toda dose vem conferida contra `CORRECOES.md`.
Nome científico em `<em>`. HTML permitido no corpo e nos valores da ficha: `<p>`, `<strong>`, `<em>`,
`<span class="termo" data-termo="chave">`.

### Proibido na tela
- Metalinguagem de qualquer tipo.
- Personificação da bactéria: "o réu", "ele acorda", "o invasivo do dia a dia", "a versão b".
- Frase de efeito, pergunta retórica, tríade de ritmo, travessão de suspense, "não é X, é Y".
- Advérbio de ênfase vazio e qualquer palavra da seção 1.2.
- Conclusão moralizante e emoji.
- Escrever na tela aquilo que o apresentador vai dizer em voz alta.

### Teste rápido antes de aprovar um passo
1. Dá para ler em voz alta sem parecer legenda de vídeo motivacional?
2. Cada frase carrega um fato verificável, com número e unidade quando cabe?
3. Some alguma palavra da lista negativa? Então some do texto.
4. O slide sobrevive sem o apresentador? Ele tem que informar, não convencer.
5. O apresentador sobrevive sem o slide? Se a fala apenas lê a tela, o texto está sobrando.

---

## 3. Fontes consultadas
- https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- https://metric37.com/blog/common-ai-words-and-phrases
- https://aiadventureclub.substack.com/p/how-to-spot-ai-writing-in-2026
- https://canaltech.com.br/inteligencia-artificial/dicas-descobrir-se-texto-foi-escrito-por-ia/
- https://exame.com/tecnologia/examelab/como-saber-se-um-texto-foi-feito-por-inteligencia-artificial/
- https://fastcompanybrasil.com/ia/quer-saber-se-um-texto-foi-escrito-por-ia-aqui-esta-a-prova/
- https://advocobrasil.com.br/como-identificar-texto-gerado-por-ia/
