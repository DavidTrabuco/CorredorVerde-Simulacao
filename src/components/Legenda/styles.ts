const SW = 'block flex-none rounded-sm'

export const LegendaStyles = {
  // @container: os nomes só aparecem quando a própria legenda tem largura para eles (ou com "Nomes" ligado)
  legenda:
    'group/legenda @container flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] border border-line bg-surface px-4 py-2 text-[.76rem] text-muted shadow-cartao',
  nome: 'hidden group-data-[nomes=true]/legenda:inline @min-[1060px]:inline',
  nomes:
    'ml-auto cursor-pointer active:scale-[.97] rounded-md border border-line bg-transparent px-2.5 py-0.5 text-[.72rem] font-medium text-muted transition-colors hover:text-fg aria-pressed:border-accent aria-pressed:text-accent @min-[1060px]:hidden',
  titulo: 'flex items-center gap-2 text-[.82rem] font-semibold text-fg',
  tituloIcone: 'text-[1.05rem] text-muted',
  grupo: 'flex flex-wrap items-center gap-x-2.5 gap-y-1 border-line transition-opacity min-[720px]:border-l min-[720px]:pl-4',
  grupoDesligado: 'opacity-45',
  // chave liga/desliga: o trilho fica verde quando a camada aparece no mapa
  chave:
    'group flex cursor-pointer active:scale-[.97] items-center gap-1.5 rounded-md border-0 bg-transparent p-0 text-[.76rem] font-semibold tracking-[.04em] text-fg uppercase',
  trilho:
    'relative h-3.5 w-6 rounded-full bg-line transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-2.5 after:rounded-full after:bg-surface after:transition-transform after:content-[""] group-aria-checked:bg-accent group-aria-checked:after:translate-x-2.5',
  itens: 'm-0 flex list-none flex-wrap items-center gap-x-2.5 gap-y-1 p-0',
  item: 'flex items-center gap-1.5',
  faixa: `${SW} h-1.5 w-4`,
  anel: 'block size-3 flex-none rounded-full border-[2.5px] border-sig-verde bg-transparent',
  pino: 'block size-3 flex-none rounded-full bg-ocorrencia',
  losango: `${SW} mx-0.5 size-2.5 rotate-45 bg-sig-amarelo`,
  verde: 'bg-sig-verde',
  vermelha: 'bg-sig-vermelho',
  rotaAmb: 'bg-rota-amb',
  rotaBom: 'bg-rota-bom',
  rotaPol: 'bg-[var(--map-azul-policia)]',
  trecho: 'bg-rota-amb opacity-45',
}
