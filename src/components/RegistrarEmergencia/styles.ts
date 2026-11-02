const CRIT =
  'flex min-w-0 cursor-pointer active:scale-[.97] flex-col items-center gap-1 rounded-lg border border-transparent bg-transparent px-1 py-2 text-[.75rem] leading-tight font-medium text-muted transition-colors hover:text-fg aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-cartao'

export const RegistrarEmergenciaStyles = {
  campo: 'flex flex-col gap-1.5',
  rotulo: 'text-[.78rem] font-medium text-muted',
  criticidades: 'grid grid-cols-3 gap-0.5 rounded-lg border border-line bg-surface-2 p-1',
  crit: CRIT,
  critNumero: 'grid size-5 place-items-center rounded-full text-[.72rem] font-bold text-white',
  // cada nível tem a sua cor no número
  crit1: '[&>b]:bg-ocorrencia aria-pressed:border-ocorrencia aria-pressed:bg-[color-mix(in_srgb,var(--ocorrencia)_12%,var(--surface))]',
  crit2: '[&>b]:bg-rota-bom aria-pressed:border-rota-bom aria-pressed:bg-[color-mix(in_srgb,var(--rota-bom)_12%,var(--surface))]',
  crit3: '[&>b]:bg-rota-amb aria-pressed:border-rota-amb aria-pressed:bg-[color-mix(in_srgb,var(--rota-amb)_12%,var(--surface))]',
  botoes: 'flex flex-col gap-2',
  botao:
    'flex w-full cursor-pointer active:scale-[.97] items-center justify-center gap-2 rounded-md border px-3 py-2 text-[.84rem] font-semibold leading-tight transition hover:brightness-110 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  ambulancia: 'border-rota-amb bg-rota-amb text-rota-amb-fg',
  bombeiros: 'border-rota-bom bg-rota-bom text-rota-bom-fg',
  policia: 'border-[var(--map-azul-policia)] bg-[var(--map-azul-policia)] text-white',
  botaoIcone: 'text-[1.1rem]',
}
