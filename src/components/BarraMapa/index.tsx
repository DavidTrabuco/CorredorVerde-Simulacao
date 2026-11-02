import type { DirecaoDesejada } from '../../utils/movimento'
import ControleDirecao from '../ControleDirecao'
import Falhas from '../Falhas'
import { BarraMapaStyles as S } from './styles'

interface BarraMapaProps {
  comando: (d: DirecaoDesejada) => void
}

// Ferramentas que agem direto no mapa, numa barra logo acima dele.
export default function BarraMapa({ comando }: BarraMapaProps) {
  return (
    <div className={S.barra} role="toolbar" aria-label="Ferramentas do mapa">
      <ControleDirecao comando={comando} />
      <span className={S.divisor} aria-hidden="true" />
      <Falhas />
    </div>
  )
}
