import { useCallback, useMemo } from 'react'
import Ajuda from '../components/Ajuda'
import BarraMapa from '../components/BarraMapa'
import FaixaEventos from '../components/FaixaEventos'
import DetalheCruzamento from '../components/DetalheCruzamento'
import DetalheInstalacao from '../components/DetalheInstalacao'
import Legenda from '../components/Legenda'
import Mapa from '../components/Mapa'
import PainelEventos from '../components/PainelEventos'
import PrimeirosPassos from '../components/PrimeirosPassos'
import PainelControle from '../components/PainelControle'
import Rodape from '../components/Rodape'
import Topo from '../components/Topo'
import { useAnimacao } from '../hooks/useAnimacao'
import { useCarrosComuns } from '../hooks/useCarrosComuns'
import { useEmergencia } from '../hooks/useEmergencia'
import { useFalha } from '../hooks/useFalha'
import { useTeclado } from '../hooks/useTeclado'
import { useViaturas } from '../hooks/useViaturas'
import { useSimulacaoStore } from '../store/useSimulacaoStore'
import type { Cores } from '../components/Mapa/desenho'
import { ehNoite } from '../components/Mapa/pincel'
import { MaquetePageStyles as S } from './styles'

// O mapa é o centro: ferramentas em cima; avisos, legenda e log de eventos embaixo.
export default function MaquetePage() {
  const recolhida = useSimulacaoStore((s) => s.lateralRecolhida)
  const logAberto = useSimulacaoStore((s) => s.logAberto)
  const logAltura = useSimulacaoStore((s) => s.logAltura)
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
        carros.desenhar(ctx, ehNoite(cores))
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
    useSimulacaoStore.getState().setLogAberto(true)
    document.getElementById('painel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    // --log-h: altura do log; o mapa usa a altura que sobra da tela
    <div className={S.pagina} style={{ '--log-h': `${logAberto ? logAltura : 46}px` } as React.CSSProperties}>
      <Topo aoVerRequisitos={aoVerRequisitos} />
      <main className={`${S.grade} ${recolhida ? S.gradeRecolhida : S.gradeAberta}`}>
        <section id="simulacao" aria-label="Simulação" className={S.centro}>
          <BarraMapa comando={viaturas.comando} />
          <Mapa aoClicarCruzamento={aoClicarCruzamento} complementos={complementos} />
          <FaixaEventos />
          <PrimeirosPassos />
          <DetalheCruzamento />
          <DetalheInstalacao />
          <Legenda />
        </section>
        <div className={S.controles}>
          <PainelControle esperando={viaturas.esperando} />
        </div>
        <div className={S.eventos}>
          <PainelEventos />
        </div>
      </main>
      <Rodape />
      <Ajuda />
    </div>
  )
}
