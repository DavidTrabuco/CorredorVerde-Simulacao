import { Estilo } from '../../share/estilos'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import type { DirecaoDesejada } from '../../utils/movimento'
import { ControleDirecaoStyles as S } from './styles'

interface ControleDirecaoProps {
  comando: (d: DirecaoDesejada) => void
}

export default function ControleDirecao({ comando }: ControleDirecaoProps) {
  const manual = useSimulacaoStore((s) => s.manual)
  const setManual = useSimulacaoStore((s) => s.setManual)

  const botao = (d: Exclude<DirecaoDesejada, null>, rotulo: string, aria: string, extra = '') => (
    <button type="button" className={`${S.botao} ${extra}`} aria-label={aria} onClick={() => comando(d)}>
      {rotulo}
    </button>
  )

  return (
    <div className={Estilo.grupo}>
      <span className={Estilo.grupoTit}>Dirigir a AMB-01</span>
      <div className={S.setas} aria-label="Direção da ambulância">
        {botao('O', '←', 'Oeste')}
        {botao('N', '↑', 'Norte')}
        {botao('S', '↓', 'Sul')}
        {botao('L', '→', 'Leste')}
        {botao('PARAR', 'PARE', 'Parar', S.parar)}
      </div>
      <label className={S.chk} title="Setas ou WASD assumem a direção. Espaço para no próximo cruzamento.">
        <input
          type="checkbox"
          checked={manual}
          onChange={(e) => {
            setManual(e.target.checked)
            e.target.blur()
          }}
        />
        Eu dirijo
      </label>
    </div>
  )
}
