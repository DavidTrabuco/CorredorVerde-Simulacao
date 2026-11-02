const STATUS =
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[.74rem] font-medium before:size-1.5 before:rounded-full before:content-[""]'

const BOTAO_GRUPO =
  'grid h-7 min-w-7 cursor-pointer active:scale-[.97] place-items-center rounded border-0 bg-transparent px-2 text-[.8rem] font-medium text-muted transition-colors hover:bg-surface hover:text-fg'

export const TopoStyles = {
  // barra sóbria: sem brilho nem gradiente
  topo: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[10px] border border-line bg-surface px-4 py-2.5 shadow-cartao',
  marca: 'flex min-w-0 items-center gap-3',
  logo: 'grid size-8 flex-none place-items-center rounded-md bg-accent text-[1.05rem] text-accent-fg',
  textos: 'min-w-0',
  titulo: 'm-0 flex flex-wrap items-center gap-2 text-[1.05rem] leading-tight font-semibold tracking-[-.015em]',
  selo: 'rounded border border-line px-1.5 py-px font-body text-[.62rem] font-medium tracking-[.08em] text-muted uppercase',
  subtitulo: 'm-0 text-[.78rem] text-muted text-balance',
  // a faixa de indicadores fica no meio quando cabe; em telas menores desce para uma linha própria
  indicadores:
    'order-last basis-full border-t border-line pt-2.5 min-[1500px]:order-none min-[1500px]:basis-auto min-[1500px]:border-t-0 min-[1500px]:pt-0',
  controles: 'flex flex-wrap items-center gap-2.5',
  status: `${STATUS} text-muted before:bg-sig-verde before:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sig-verde)_20%,transparent)]`,
  statusPausado: `${STATUS} text-fg before:bg-sig-amarelo`,
  relogio: 'flex items-center gap-2 border-x border-line px-3.5',
  relogioIcone: 'text-[1rem] text-muted',
  tempo: 'min-w-[5ch] font-mono text-[.95rem] font-medium tabular-nums',
  grupo: 'flex items-center gap-0.5 rounded-md border border-line bg-surface-2 p-0.5',
  botaoIcone: `${BOTAO_GRUPO} text-[1rem]`,
  velocidade: `${BOTAO_GRUPO} aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-cartao`,
  ajuda:
    'grid size-8 cursor-pointer place-items-center rounded-md border border-line bg-transparent text-[1rem] text-muted transition-colors hover:bg-surface-2 hover:text-fg active:scale-[.97]',
  verRequisitos: 'min-[1080px]:hidden',
}
