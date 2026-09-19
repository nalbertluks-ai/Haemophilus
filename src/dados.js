// Dados REAIS do grafico final. Serie nacional brasileira, fonte unica, unidade unica.
// Miranzi SSC, Moraes SA, Freitas ICM. Rev Soc Bras Med Trop 2006;39(5):473-477 (dados de notificacao compulsoria; denominadores IBGE).
// O ano de 2002 foi omitido: no artigo ele esta incompleto.
export const DADOS_HIB = {
  titulo: 'Meningite por Hib no Brasil, 1983–2001',
  unidade: 'casos por 100 mil crianças da faixa etária',
  fonte: 'Miranzi, Moraes e Freitas. Rev Soc Bras Med Trop 2006;39(5):473-7',
  marco: { ano: 1999, rotulo: 'Hib entra no PNI' },
  destaques: [{ ano: 1998, valor: 26.11, lado: 'esq' }, { ano: 2001, valor: 4.32 }],
  series: [
    { rotulo: 'menores de 1 ano', cor: '#ff7a45', rotuloEm: 4, pontos: [
      [1983, 10.05], [1984, 12.66], [1985, 8.5], [1986, 11.01], [1987, 14.94], [1988, 16.5], [1989, 20.27], [1990, 22.85], [1991, 21.24], [1992, 24.68],
      [1993, 20.05], [1994, 21.64], [1995, 25.27], [1996, 22.14], [1997, 24.2], [1998, 26.11], [1999, 19.38], [2000, 7.38], [2001, 4.32]].map(([ano, valor]) => ({ ano, valor })) },
    { rotulo: '1 a 4 anos', cor: '#eadfc8', rotuloEm: 9, pontos: [
      [1983, 2.17], [1984, 2.66], [1985, 1.51], [1986, 2.26], [1987, 2.81], [1988, 3.65], [1989, 4.46], [1990, 4.77], [1991, 4.85], [1992, 4.96],
      [1993, 4.37], [1994, 4.51], [1995, 5.31], [1996, 4.74], [1997, 5.85], [1998, 5.41], [1999, 4.4], [2000, 1.85], [2001, 0.88]].map(([ano, valor]) => ({ ano, valor })) },
  ],
}
