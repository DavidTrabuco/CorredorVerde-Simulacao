export const PainelEventosStyles = {
  painel:
    'relative flex h-[74vh] min-w-0 flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-cartao min-[1080px]:h-[var(--log-h)]',
  // alça no topo do log: no computador, arrastar muda a altura
  alca:
    "absolute inset-x-0 top-0 z-[2] hidden h-2 cursor-row-resize touch-none after:absolute after:top-1 after:left-1/2 after:h-1 after:w-10 after:-translate-x-1/2 after:rounded-full after:bg-line after:content-[''] hover:after:bg-muted min-[1080px]:block",
  painelRecolhido: 'flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-cartao',
  cabecalho: 'flex flex-none flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-2.5 pb-2',
  icone: 'text-[1.1rem] text-muted',
  titulo: 'm-0 mr-auto flex items-center gap-2 text-[.88rem] leading-tight font-semibold tracking-[-.01em]',
  abas: 'flex flex-none gap-0.5 rounded-md border border-line bg-surface-2 p-0.5',
  recolher:
    'flex cursor-pointer active:scale-[.97] items-center gap-1 rounded-lg border-0 bg-transparent px-2 py-1 text-[.8rem] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg',
  seta: 'rotate-180 text-[1rem] transition-transform',
  setaAberta: 'text-[1rem] transition-transform',
  aba: 'cursor-pointer active:scale-[.97] rounded border-0 bg-transparent px-2.5 py-1 text-[.78rem] font-medium text-muted transition-colors hover:text-fg aria-selected:bg-surface aria-selected:text-fg aria-selected:shadow-cartao',
  cont: 'ml-1 font-mono text-[.72rem] font-medium text-muted',
  corpo: 'flex min-h-0 flex-1 flex-col',
  filtros: 'flex flex-none flex-wrap items-center gap-x-3 gap-y-2 border-y border-line bg-surface-2 px-4 py-1.5',
  categorias: 'flex flex-wrap gap-1.5',
  categoria:
    'cursor-pointer active:scale-[.97] rounded-md border border-line bg-surface px-2.5 py-0.5 text-[.78rem] font-medium text-muted transition-colors hover:text-fg aria-pressed:border-accent aria-pressed:bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))] aria-pressed:text-accent',
  busca: 'ml-auto min-w-0 flex-[0_1_240px] rounded-md border border-line bg-surface px-3 py-1 text-[.8rem]',
  chk: 'flex items-center gap-2 text-[.8rem] text-muted',
  rolagem: 'min-h-0 flex-1 overflow-y-auto',
  lista: 'm-0 list-none p-0',
  // no computador cada evento fica numa linha só: hora | chips | mensagem
  linha:
    'grid grid-cols-[3.6em_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 border-b border-l-[3px] border-line border-l-transparent px-4 py-1.5 text-[.84rem] transition-colors hover:bg-surface-2 min-[720px]:grid-cols-[3.6em_9.5rem_minmax(0,1fr)]',
  // evento que chegou com a página aberta: acende e apaga devagar
  novo: 'animate-[evento-novo_1.8s_ease-out]',
  linhaAlerta: 'border-l-sig-amarelo',
  linhaErro: 'border-l-sig-vermelho',
  linhaApi: 'text-muted',
  linhaSis: 'border-l-accent',
  hora: 'font-mono text-[.76rem] text-muted tabular-nums',
  tags: 'flex flex-wrap gap-1',
  msg: 'col-start-2 [overflow-wrap:anywhere] min-[720px]:col-start-3 min-[720px]:row-start-1',
  msgApi: 'font-mono text-[.76rem]',
  msgSis: 'text-muted',
  vazio: 'px-4 py-7 text-center text-[.9rem] text-muted',
  nota: 'm-0 flex-none border-y border-line px-4 py-1.5 text-[.8rem] text-muted',
  grupo:
    'sticky top-0 z-[1] border-b border-line bg-surface px-4 pt-3 pb-1 text-[.76rem] font-semibold tracking-[.06em] text-muted uppercase',
  req: 'grid w-full cursor-pointer active:scale-[.97] grid-cols-[5.6ch_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-1 border-0 border-b border-line bg-transparent px-4 py-[9px] text-left text-[.86rem] hover:bg-surface-2',
  rid: 'pt-px font-mono text-[.78rem] font-semibold',
  rst: 'flex flex-col items-end gap-[3px] font-mono text-[.74rem] whitespace-nowrap',
  obs: 'text-muted',
  obsSim: 'text-fg',
  manual: 'rounded bg-surface-2 px-1.5 font-medium text-muted',
}
