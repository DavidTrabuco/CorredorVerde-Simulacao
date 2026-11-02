const BASE =
  'inline-flex items-center gap-1.5 font-mono text-[.72rem] tabular-nums before:size-1.5 before:rounded-full before:content-[""]'

export const ConexaoStyles = {
  online: `${BASE} text-muted before:bg-sig-verde`,
  offline: `${BASE} text-sig-vermelho before:bg-sig-vermelho before:animate-pulse`,
  conectando: `${BASE} text-muted before:bg-sig-amarelo before:animate-pulse`,
}
