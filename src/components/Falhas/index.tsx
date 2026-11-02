import { useFalha } from '../../hooks/useFalha'
import { Estilo } from '../../share/estilos'
import { IconeAlerta } from '../../share/icones'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { FalhasStyles as S } from './styles'

// UC09: liga o modo de clique para simular falha num cruzamento ou desliga todas.
export default function Falhas() {
  const modoClique = useSimulacaoStore((s) => s.modoClique)
  const { alternarModo, desligarTodas } = useFalha()

  return (
    <div className={Estilo.grupo}>
      <span className={Estilo.grupoTit}>
        <IconeAlerta />
        Falhas
      </span>
      <div className={S.botoes}>
        <button type="button" className={Estilo.bt} aria-pressed={modoClique === 'falha'} onClick={alternarModo}>
          Simular falha
        </button>
        <button type="button" className={Estilo.bt} onClick={desligarTodas}>
          Desligar todas
        </button>
      </div>
    </div>
  )
}
