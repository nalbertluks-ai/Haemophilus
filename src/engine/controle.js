// Controle de Xbox (Gamepad API, mapeamento padrao). O navegador so enxerga o controle
// depois do primeiro botao apertado com a pagina em foco.
//   A · RB · direcional →      proximo passo
//   B · LB · direcional ←      passo anterior
//   direcional ↓ / ↑           proximo / anterior capitulo
//   analogico esquerdo         gira o modelo 3D
//   Menu (≡)                   tela cheia
//   View (⧉)                   glossario
export function criarControle({ palco, cena }) {
  const P = palco.PASSOS
  const inicioCap = (dir) => {
    const cap = P[palco.atual].cap, i = palco.atual
    if (dir > 0) { const k = P.findIndex((p, j) => j > i && p.cap !== cap); return k < 0 ? i : k }
    const ini = P.findIndex((p) => p.cap === cap)
    if (i > ini) return ini
    const antes = P[ini - 1]?.cap; return antes ? P.findIndex((p) => p.cap === antes) : 0
  }
  const acoes = {
    0: () => palco.proximo(), 5: () => palco.proximo(), 15: () => palco.proximo(),
    1: () => palco.anterior(), 4: () => palco.anterior(), 14: () => palco.anterior(),
    13: () => palco.irPara(inicioCap(1)), 12: () => palco.irPara(inicioCap(-1)),
    9: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}),
    8: () => palco.irPara(P.findIndex((p) => p.cap === 'estudo')),
  }
  const antes = {}
  let ativo = false
  function laco() {
    const g = [...(navigator.getGamepads?.() || [])].find(Boolean)
    if (!g) { ativo = false; return }
    g.buttons.forEach((b, i) => {
      const agora = b.pressed
      if (agora && !antes[i]) acoes[i]?.()
      antes[i] = agora
    })
    // analogico esquerdo, com zona morta
    const zm = (v) => (Math.abs(v) < 0.18 ? 0 : v)
    const x = zm(g.axes[0] || 0), y = zm(g.axes[1] || 0)
    if (x || y) cena.girar(x * 0.045, y * 0.035)
    requestAnimationFrame(laco)
  }
  addEventListener('gamepadconnected', () => { if (!ativo) { ativo = true; requestAnimationFrame(laco) } })
}
