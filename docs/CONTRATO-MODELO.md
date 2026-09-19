# Contrato do modelo 3D — *Haemophilus influenzae* anatômico

O modelo é o PROTAGONISTA da apresentação. A narrativa inteira passa por dentro dele:
a câmera orbita, aproxima, corta a célula e mostra cada estrutura citada no conteúdo.
Contexto: seminário acadêmico de microbiologia médica (graduação em medicina). É ilustração
científica de anatomia bacteriana de livro-texto.

## Direção de arte (referência: oryzo.ai, do estúdio Lusion)
- Objeto único, tátil, com materiais físicos (PBR) e luz de estúdio. NÃO é neon monocromático.
- Fundo quase preto QUENTE (`#12100e`). Luz principal quente, contraluz fria, reflexos suaves de ambiente
  (PMREM de um ambiente gerado em código — nada de arquivo HDR externo).
- **Cada estrutura tem a sua cor** (convenção de ilustração científica, estilo David Goodsell, mas luminosa em fundo escuro).
  A legenda de cores é parte do conteúdo: a plateia aprende a anatomia pela cor.
- Tem que parecer caro: micro-relevo na superfície, translucidez nas camadas externas, profundidade, sombras suaves de oclusão.
- 60 fps em notebook com GPU integrada a 1920×1080: instancing para tudo que se repete, menos de ~80 draw calls,
  no máximo UM material com `transmission`. Aceite um parâmetro `qualidade: 'alta' | 'media'`.

## Morfologia obrigatória (erro aqui invalida o trabalho)
- COCOBACILO: bastonete curto, quase oval. Razão comprimento:largura entre 1,8:1 e 2,4:1. Não é bastão comprido.
- Imóvel: SEM flagelo, sem cauda, sem cílios. Não forma esporo.
- Gram-negativo: envelope de TRÊS camadas — membrana externa, peptidoglicano FINO no periplasma, membrana interna.
- Sem núcleo (procarioto): o DNA é um NUCLEOIDE, massa enovelada irregular, sem membrana.
- Pili/fímbrias: finos, curtos, esparsos (poucas dezenas), não uma cabeleira.
- Cápsula: camada externa contínua, translúcida, lisa, mais espessa que o envelope.

## Estruturas obrigatórias (nomes exatos das chaves em `partes` e `ancoras`)
| chave | estrutura | cor sugerida | observação |
|---|---|---|---|
| `capsula` | cápsula de polissacarídeo (PRP) | pérola/creme translúcido `#eadfc8` | casca externa; some quando `estado.capsula = 0` |
| `membranaExterna` | membrana externa | verde-azulado `#1fb8a6` | casca com micro-relevo |
| `los` | lipo-oligossacarídeo (LOS) | coral `#ff7a45` | milhares de hastes MUITO curtas na face externa (instanced); curtas porque o LOS não tem antígeno O |
| `porinas` | porinas / OMP P2 e P6 | azul `#4c8dff` | pequenos barris embutidos na membrana externa (instanced) |
| `adesinas` | adesinas HMW1/HMW2, Hia, Hap | lima `#d4e157` | fibras curtas e rígidas, mais grossas que os pili |
| `pili` | pili / fímbrias | amarelo-palha `#f5e6a3` | finos, curvos, esparsos; controlados por `estado.pili` |
| `peptidoglicano` | peptidoglicano | verde `#58c17a` | malha fina (rede) entre as duas membranas |
| `betaLactamase` | beta-lactamases (TEM-1) no periplasma | laranja-avermelhado `#ff5a3c` | poucas dezenas de glóbulos no espaço periplasmático |
| `membranaInterna` | membrana citoplasmática | âmbar `#f2b441` | |
| `pbp3` | PBP3 (FtsI) | magenta `#e0247b` | anel de proteínas na membrana interna, na região do septo de divisão |
| `citoplasma` | citoplasma | névoa azul-violeta escura | volume, não casca |
| `ribossomos` | ribossomos | lilás `#9a8cff` | milhares de grânulos (instanced) |
| `nucleoide` | nucleoide (DNA cromossômico) | violeta-rosado `#c86bfa` | tubo enovelado longo, irregular, no centro |
| `plasmideo` | plasmídeo | ciano `#22e8e0` | 1–3 anéis pequenos de DNA, separados do nucleoide |
| `septo` | septo de divisão | — | constrição central; controlada por `estado.divisao` |
| `secrecao` | protease de IgA1 e vesículas de membrana externa | vermelho `#ff4d5a` / verde-azulado | partículas emitidas da superfície; controladas por `estado.secrecao` |

## API (módulo ES, sem dependência além de `three` e seus addons)
```js
// src/modelo/variante-X.js
import * as THREE from 'three'
export async function criarBacilo({ renderer, qualidade = 'alta' } = {}) {
  return {
    grupo,      // THREE.Group centrado na origem. Eixo longo = Y local. Comprimento do corpo (sem cápsula) ≈ 2,2 unidades.
    partes,     // { chave: THREE.Object3D } com TODAS as chaves da tabela
    ancoras,    // { chave: THREE.Vector3 } ponto LOCAL representativo de cada estrutura (para as linhas de legenda)
    estado: {   // números 0..1 animados por fora com GSAP; o modelo só LÊ
      corte: 0,      // 0 = célula fechada · 1 = cunha removida (corte de ~100°) revelando todas as camadas e o interior
      explodir: 0,   // 0 = montada · 1 = camadas do envelope afastadas como bonecas russas (vista explodida)
      capsula: 1,    // presença da cápsula (Hib = 1, não tipável = 0)
      pili: 1,       // presença dos pili
      energia: 1,    // 0 = célula sem fatores X e V: apagada, fria, ribossomos parados · 1 = metabolicamente ativa
      divisao: 0,    // 0 = célula única · 1 = septo formado (halter)
      secrecao: 0,   // intensidade da emissão de protease de IgA1 / vesículas
      destaque: null // string com uma chave de `partes`: essa estrutura fica plena e as outras escurecem e dessaturam. null = tudo normal
    },
    atualizar(dt, t), // chamado a cada quadro; aplica `estado` com suavização
    dispose(),
  }
}
```
Regras: o módulo NÃO cria renderer, câmera, luzes de cena nem loop. Não mexe no DOM. Pode criar o próprio ambiente PMREM
e devolvê-lo em `ambiente` (opcional) para o motor usar como `scene.environment`.
O corte deve mostrar faces internas convincentes (use `clippingPlanes` + material de tampa, ou geometria já cortada —
o que ficar melhor). Na vista em corte, as três camadas do envelope precisam ser distinguíveis a olho nu.

## Página de demonstração (obrigatória)
`prototypes/modelo-X.html` + script, servidos pelo Vite que JÁ ESTÁ RODANDO em `http://localhost:5180`
(abrir `http://localhost:5180/prototypes/modelo-X.html`; imports de `three` e de `/src/modelo/variante-X.js` funcionam direto).
Não suba outro servidor. A demo cria renderer, câmera, luzes, pós-processamento opcional, arrastar para girar com inércia,
e um painel simples com um controle para cada campo de `estado` e um botão por estrutura para testar `destaque`.
