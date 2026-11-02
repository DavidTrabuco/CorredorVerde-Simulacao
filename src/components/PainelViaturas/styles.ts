const PILL =
  'ml-auto inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-0.5 text-[.78rem] font-semibold before:size-[7px] before:rounded-full before:content-[""]'

export const PainelViaturasStyles = {
  lista: 'm-0 flex list-none flex-col gap-1 p-0',
  linhaLista: 'min-w-0',
  // a viatura selecionada ganha marcador no mapa; aqui ela fica com borda de destaque
  item: 'flex w-full cursor-pointer active:scale-[.97] items-start gap-2.5 rounded-lg border border-transparent bg-transparent px-2 py-2 text-left transition-colors hover:bg-surface-2 aria-pressed:border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] aria-pressed:bg-surface-2',
  avatarAmb:
    'grid size-8 flex-none place-items-center rounded-lg bg-[color-mix(in_srgb,var(--rota-amb)_16%,var(--surface))] text-[1rem] text-rota-amb',
  avatarBom:
    'grid size-8 flex-none place-items-center rounded-lg bg-[color-mix(in_srgb,var(--rota-bom)_16%,var(--surface))] text-[1rem] text-rota-bom',
  avatarPol:
    'grid size-8 flex-none place-items-center rounded-lg bg-[color-mix(in_srgb,var(--map-azul-policia)_16%,var(--surface))] text-[1rem] text-[var(--map-azul-policia)]',
  dados: 'flex min-w-0 flex-1 flex-col gap-0.5',
  linha: 'flex flex-wrap items-center gap-x-2 gap-y-1',
  id: 'font-mono text-[.82rem] font-semibold',
  papel: 'text-[.76rem] text-muted',
  info: 'min-w-0 font-mono text-[.78rem] [overflow-wrap:anywhere] text-muted empty:hidden',
  pill: {
    ok: `${PILL} before:bg-sig-verde`,
    res: `${PILL} before:bg-accent`,
    emerg: `${PILL} border-[color-mix(in_srgb,var(--ocorrencia)_45%,var(--line))] bg-[color-mix(in_srgb,var(--ocorrencia)_14%,var(--surface))] before:bg-ocorrencia`,
    atend: `${PILL} border-[color-mix(in_srgb,var(--sig-amarelo)_50%,var(--line))] bg-[color-mix(in_srgb,var(--sig-amarelo)_18%,var(--surface))] before:bg-sig-amarelo`,
  },
}
