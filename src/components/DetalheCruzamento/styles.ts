const LUZ =
  'inline-flex items-center gap-1.5 rounded-full px-2 py-px text-[.78rem] font-semibold before:size-2 before:rounded-full before:content-[""]'

export const DetalheCruzamentoStyles = {
  // compacto: título, valores e o × numa linha só (quebra só em telas estreitas)
  cartao:
    'flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-[10px] border border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] bg-surface px-4 py-2 shadow-cartao',
  cabecalho: 'contents',
  titulo: 'm-0 flex flex-wrap items-center gap-2 text-[.88rem] font-semibold',
  icone: 'text-[1.05rem] text-muted',
  predios: 'font-body text-[.78rem] font-medium text-muted',
  statusOk: `${LUZ} bg-[color-mix(in_srgb,var(--sig-verde)_16%,var(--surface))] font-body before:bg-sig-verde`,
  statusFalha: `${LUZ} bg-[color-mix(in_srgb,var(--sig-amarelo)_18%,var(--surface))] font-body before:bg-sig-amarelo`,
  ativo: 'rounded-md bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))] px-1.5 py-px text-[.78rem] font-semibold text-accent',
  inativo: 'text-muted',
  fechar:
    'order-last ml-auto grid size-7 cursor-pointer active:scale-[.97] place-items-center rounded-lg border-0 bg-transparent text-[1rem] text-muted transition-colors hover:bg-surface-2 hover:text-fg',
  grade: 'm-0 flex min-w-0 flex-1 flex-wrap items-start gap-x-5 gap-y-1',
  item: 'flex min-w-0 flex-col gap-0.5',
  rotulo: 'text-[.68rem] font-medium text-muted',
  valor: 'm-0 text-[.82rem] [overflow-wrap:anywhere]',
  verde: `${LUZ} bg-[color-mix(in_srgb,var(--sig-verde)_16%,var(--surface))] before:bg-sig-verde`,
  amarelo: `${LUZ} bg-[color-mix(in_srgb,var(--sig-amarelo)_18%,var(--surface))] before:bg-sig-amarelo`,
  vermelho: `${LUZ} bg-[color-mix(in_srgb,var(--sig-vermelho)_16%,var(--surface))] before:bg-sig-vermelho`,
}
