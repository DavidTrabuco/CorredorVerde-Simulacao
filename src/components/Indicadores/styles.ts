const VALOR = 'm-0 text-[.95rem] font-semibold tabular-nums animate-[numero_.6s_ease-out]'

export const IndicadoresStyles = {
  // no computador fica numa linha só, separada por divisórias; no celular quebra em duas colunas
  faixa: 'm-0 grid grid-cols-2 gap-x-4 gap-y-1.5 min-[1080px]:flex min-[1080px]:items-center min-[1080px]:divide-x min-[1080px]:divide-line',
  item: 'flex min-w-0 items-center gap-1.5 min-[1080px]:px-3.5 min-[1080px]:first:pl-0',
  icone: 'text-[.95rem] text-muted',
  iconeAlerta: 'text-[.95rem] text-ocorrencia',
  valor: VALOR,
  valorAlerta: `${VALOR} text-ocorrencia`,
  rotulo: 'order-last text-[.74rem] whitespace-nowrap text-muted',
}
