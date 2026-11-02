export const AjudaStyles = {
  janela:
    'm-auto w-[min(560px,calc(100vw-32px))] rounded-[10px] border border-line bg-surface p-5 text-fg shadow-[0_20px_60px_rgb(0_0_0/50%)] backdrop:bg-black/50',
  cabecalho: 'mb-3 flex items-center justify-between',
  titulo: 'm-0 text-[1rem] font-semibold',
  fechar:
    'grid size-7 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[1rem] text-muted transition-colors hover:bg-surface-2 hover:text-fg active:scale-[.97]',
  secao: 'mt-4 mb-2 text-[.7rem] font-semibold tracking-[.08em] text-muted uppercase first-of-type:mt-0',
  lista: 'm-0 flex flex-col divide-y divide-line rounded-lg border border-line',
  linha: 'grid grid-cols-[150px_minmax(0,1fr)] items-baseline gap-3 px-3 py-2',
  tecla: 'font-mono text-[.76rem] text-fg',
  item: 'text-[.8rem] font-medium',
  acao: 'm-0 text-[.8rem] text-muted',
}
