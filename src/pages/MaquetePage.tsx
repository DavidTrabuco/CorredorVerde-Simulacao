import { useCallback, useMemo } from 'react'
import BarraMapa from '../components/BarraMapa'
import FaixaEventos from '../components/FaixaEventos'
import Legenda from '../components/Legenda'
import Mapa from '../components/Mapa'
import PainelLateral from '../components/PainelLateral'
import PainelViaturas from '../components/PainelViaturas'
import RegistrarEmergencia from '../components/RegistrarEmergencia'
import Topo from '../components/Topo'
import { useAnimacao } from '../hooks/useAnimacao'
import { useCarrosComuns } from '../hooks/useCarrosComuns'
import { useEmergencia } from '../hooks/useEmergencia'
import { useFalha } from '../hooks/useFalha'
import { useTeclado } from '../hooks/useTeclado'
import { useViaturas } from '../hooks/useViaturas'
import { useSimulacaoStore } from '../store/useSimulacaoStore'
import type { Cores } from '../components/Mapa/desenho'
import { MaquetePageStyles as S } from './styles'

// O mapa é o centro: ferramentas em cima, legenda e regras recentes embaixo.
export default function MaquetePage() {
  const viaturas = useViaturas()
  const carros = useCarrosComuns()
  const { registrar } = useEmergencia()
  const { alternarFalha } = useFalha()

  useAnimacao((dt) => {
    viaturas.passo(dt, carros.carros)
    carros.passo(dt, viaturas.faixas())
  })
  useTeclado(viaturas.comando)

  const complementos = useMemo(
    () => ({
      centroViatura: viaturas.centro,
      desenharVeiculos: (ctx: CanvasRenderingContext2D, tReal: number, cores: Cores, reduzMov: boolean) => {
        carros.desenhar(ctx)
        viaturas.desenhar(ctx, tReal, cores, reduzMov)
      },
    }),
    [viaturas, carros],
  )

  const aoClicarCruzamento = useCallback(
    (id: string) => {
      if (useSimulacaoStore.getState().modoClique === 'falha') void alternarFalha(id)
      else void registrar(id)
    },
    [alternarFalha, registrar],
  )

  const aoVerRequisitos = useCallback(() => {
    useSimulacaoStore.getState().setAba('Requisitos')
    document.getElementById('painel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className={S.pagina}>
      <Topo aoVerRequisitos={aoVerRequisitos} />
      <main className={S.grade}>
        <section aria-label="Maquete" className={S.centro}>
          <BarraMapa comando={viaturas.comando} />
          <Mapa aoClicarCruzamento={aoClicarCruzamento} complementos={complementos} />
          <Legenda />
          <FaixaEventos />
        </section>
        <div className={S.controles}>
          <RegistrarEmergencia />
          <PainelViaturas esperando={viaturas.esperando} />
        </div>
        <div className={S.lateral}>
          <PainelLateral />
        </div>
      </main>
    </div>
  )
}
