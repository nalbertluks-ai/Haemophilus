// Modo de teste: so liga com ?teste=inst no endereco. Nunca deixe esse parametro no link da apresentacao.
export const MODO_TESTE = new URLSearchParams(location.search).get('teste') === 'inst'
