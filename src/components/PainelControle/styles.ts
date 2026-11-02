const BOTAO = 'grid size-10 cursor-pointer active:scale-[.97] place-items-center rounded-lg border text-[1.15rem] transition'

// A barra recolhida só existe no computador; no celular o painel aparece sempre inteiro.
export const PainelControleStyles = {
  barra:
    'hidden flex-col items-center gap-2 rounded-[10px] border border-line bg-surface p-2 shadow-cartao min-[1080px]:flex',
  oculta: 'hidden',
  botao: BOTAO,
  neutro: 'border-line bg-surface-2 text-muted hover:text-fg',
  ambulancia:
    'border-rota-amb bg-rota-amb text-rota-amb-fg hover:text-rota-amb-fg hover:brightness-110 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  bombeiros:
    'border-rota-bom bg-rota-bom text-rota-bom-fg hover:text-rota-bom-fg hover:brightness-110 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  policia:
    'border-[var(--map-azul-policia)] bg-[var(--map-azul-policia)] text-white hover:brightness-110 aria-pressed:border-sig-amarelo aria-pressed:bg-sig-amarelo aria-pressed:text-[#1d1600]',
  divisor: 'h-px w-6 bg-line',
  contador: 'flex flex-col items-center gap-0.5 py-1 text-[1.05rem] text-muted [&>b]:text-[.9rem] [&>b]:font-semibold [&>b]:text-fg',
  alertaAtivo: 'text-ocorrencia',
  conteudo: 'contents',
  conteudoRecolhido: 'contents min-[1080px]:hidden',
  cabecalho: 'hidden items-center justify-between px-1 min-[1080px]:flex',
  titulo: 'text-[.76rem] font-semibold tracking-[.06em] text-muted uppercase',
  recolher:
    'grid size-7 cursor-pointer active:scale-[.97] place-items-center rounded-lg border-0 bg-transparent text-[1rem] text-muted transition-colors hover:bg-surface hover:text-fg',
}
