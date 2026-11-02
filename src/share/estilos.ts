// Classes Tailwind usadas por mais de um componente.
export const Estilo = {
  bt: 'cursor-pointer active:scale-[.97] rounded-md border border-line bg-surface px-3 py-1.5 text-[.84rem] font-medium leading-tight transition-colors hover:border-[color-mix(in_srgb,var(--fg)_22%,var(--line))] hover:bg-surface-2 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  btPrim:
    'cursor-pointer active:scale-[.97] rounded-md border border-accent bg-accent px-3 py-1.5 text-[.84rem] font-semibold leading-tight text-accent-fg transition hover:brightness-110 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  bloco: 'flex min-w-0 flex-col gap-3 rounded-[10px] border border-line bg-surface p-3.5 shadow-cartao',
  blocoTit: 'text-[.9rem] font-semibold tracking-[-.01em]',
  // grupo de botões numa linha só, usado na barra acima do mapa
  grupo: 'flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2',
  grupoTit: 'inline-flex items-center gap-1.5 text-[.78rem] font-medium text-muted [&>svg]:text-[.95rem]',
  dica: 'm-0 text-[.82rem] leading-relaxed text-muted',
}

const CHIP =
  'cursor-pointer active:scale-[.97] rounded border-0 px-1.5 py-px font-mono text-[.68rem] leading-normal font-medium text-fg'

// Chip de requisito: cor própria para RN, UC e RNF.
export function classeChip(tag: string) {
  if (tag === 'API') return `${CHIP} bg-surface-2 text-muted`
  if (tag.startsWith('RNF')) return `${CHIP} bg-[color-mix(in_srgb,var(--sig-amarelo)_22%,var(--surface))]`
  if (tag.startsWith('RN')) return `${CHIP} bg-[color-mix(in_srgb,var(--sig-verde)_18%,var(--surface))]`
  if (tag.startsWith('UC')) return `${CHIP} bg-[color-mix(in_srgb,var(--rota-amb)_16%,var(--surface))]`
  return `${CHIP} bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))]`
}
