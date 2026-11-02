import type { ReactNode } from 'react'
import { CartaoStyles as S } from './styles'

interface CartaoProps {
  titulo: string
  // frase curta abaixo do título
  subtitulo?: string
  icone: ReactNode
  // conteúdo à direita do título (por exemplo, um contador)
  extra?: ReactNode
  children: ReactNode
}

// Card padrão dos painéis: ícone, título, subtítulo e conteúdo.
export default function Cartao({ titulo, subtitulo, icone, extra, children }: CartaoProps) {
  return (
    <section className={S.cartao} aria-label={titulo}>
      <header className={S.cabecalho}>
        <span className={S.icone}>{icone}</span>
        <div className={S.textos}>
          <h2 className={S.titulo}>{titulo}</h2>
          {subtitulo && <p className={S.subtitulo}>{subtitulo}</p>}
        </div>
        {extra}
      </header>
      {children}
    </section>
  )
}
