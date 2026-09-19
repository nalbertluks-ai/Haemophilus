// Ponto unico de escolha do modelo. Troque VARIANTE quando a definitiva for escolhida.
// 'placeholder' | 'variante-a' | 'variante-b' | 'variante-c' — ou ?modelo=variante-a na URL, para comparar ao vivo.
const VARIANTE = 'variante-a'

// so enxerga os arquivos que existem (as variantes chegam depois)
const modulos = import.meta.glob('./{placeholder,variante-*}.js')

export async function criarModelo(opts) {
  const pedido = new URLSearchParams(location.search).get('modelo') || VARIANTE
  const carrega = modulos[`./${pedido}.js`] || modulos['./placeholder.js']
  try {
    return await (await carrega()).criarBacilo(opts)
  } catch (e) {
    console.warn(`modelo "${pedido}" falhou, usando o de reserva`, e)
    return (await modulos['./placeholder.js']()).criarBacilo(opts)
  }
}
