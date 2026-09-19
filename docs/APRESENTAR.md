# Como apresentar (segunda-feira)

## Antes de sair de casa
1. Notebook **na tomada**. Windows em "Melhor desempenho".
2. Gerar a versão final e testar **com o Wi-Fi desligado**:
   ```
   cd "C:\Users\nalbe\Downloads\slide tal\haemophilus"
   npm run build
   npm run serve
   ```
   Abrir http://localhost:8080 no Chrome. Se abrir e rodar, está pronto.
3. Gravar o **vídeo de backup** da apresentação inteira (captura de tela do Windows: Win+Alt+R, ou OBS) e deixar em `docs/backup.mp4`.
4. Chrome: `chrome://gpu` → conferir "Hardware accelerated" em WebGL.

## Na sala
- Conectar o projetor **antes** de abrir a página. Depois, **F5** uma vez.
- Tela cheia: tecla **F** (ou F11).

## Controles
| Tecla | Faz |
|---|---|
| → · ↓ · Espaço · Enter · PageDown | próximo passo |
| ← · ↑ · Backspace · PageUp | passo anterior |
| 1–9, 0 | pula para o capítulo (0 = glossário) |
| Home / End | início / fim |
| Roda do mouse | um passo por gesto |
| Arrastar o modelo | gira a bactéria (volta sozinha no passo seguinte) |
| Clique no índice (topo) | pula para o capítulo |

Passador de slides USB funciona: ele envia PageDown/PageUp.
A página lembra onde parou: o endereço muda para `#capitulo/passo`, então F5 volta ao mesmo ponto.

## Endereço certo
Use sempre o endereço **limpo**: `http://localhost:8080` (ou `:5180` no modo de desenvolvimento), sem nada depois.
- `?q=media` — malha 3D mais leve, se o notebook engasgar.
- `?teste=inst` — **modo de teste, sem animações** (é o que a auditoria de layout usa). Aparece uma faixa vermelha no topo. Nunca apresente com isso no endereço.

## Se der problema
- Travou: **F5** (volta ao mesmo passo).
- WebGL falhou (modelo sumiu): tocar o vídeo de backup.

## Divisão
| Integrante | Capítulos | Teclas |
|---|---|---|
| 1 | Histórico · Morfologia · Exigências · Identificação | 1–4 |
| 2 | Virulência · Clínica | 5–6 |
| 3 | FPB · Tratamento · Prevenção | 7–9 |

Roteiro de fala: `docs/FALAS.md`. Perguntas prováveis do professor: `docs/PERGUNTAS-DA-BANCA.md`.
