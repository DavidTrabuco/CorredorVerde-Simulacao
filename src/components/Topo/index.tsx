import { useControleSimulacao } from '../../hooks/useControleSimulacao'
import { Estilo } from '../../share/estilos'
import { IconeAjuda, IconeContinuar, IconeMarca, IconePausar, IconeReiniciar, IconeRelogio } from '../../share/icones'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { fmtT } from '../../utils/formato'
import Conexao from '../Conexao'
import Indicadores from '../Indicadores'
import { TopoStyles as S } from './styles'

const VELOCIDADES = [1, 2, 4]

interface TopoProps {
  aoVerRequisitos: () => void
}

export default function Topo({ aoVerRequisitos }: TopoProps) {
  const estado = useSimulacaoStore((s) => s.estado)
  const { controlar, reiniciar } = useControleSimulacao()
  const pausado = estado?.pausado ?? false
  const velocidade = estado?.velocidade ?? 1

  return (
    <header className={S.topo}>
      <div className={S.marca}>
        <span className={S.logo} aria-hidden="true">
          <IconeMarca />
        </span>
        <div className={S.textos}>
          <h1 className={S.titulo}>
            Corredor Verde <span className={S.selo}>Simulação</span>
          </h1>
          <p className={S.subtitulo}>Gestão dinâmica de tráfego com prioridade para veículos de emergência</p>
        </div>
      </div>

      <div className={S.indicadores}>
        <Indicadores />
      </div>

      <div className={S.controles}>
        <Conexao />
        <span className={pausado ? S.statusPausado : S.status}>{pausado ? 'Pausada' : 'Em execução'}</span>

        <span className={S.relogio} title="Tempo simulado">
          <IconeRelogio className={S.relogioIcone} />
          <b className={S.tempo}>{fmtT(estado?.tempoSeg ?? 0)}</b>
        </span>

        <div className={S.grupo} role="group" aria-label="Controle da simulação">
          <button
            type="button"
            className={S.botaoIcone}
            aria-label={pausado ? 'Continuar' : 'Pausar'}
            title={pausado ? 'Continuar' : 'Pausar'}
            onClick={() => controlar(!pausado, velocidade)}
          >
            {pausado ? <IconeContinuar /> : <IconePausar />}
          </button>
          {VELOCIDADES.map((v) => (
            <button
              key={v}
              type="button"
              className={S.velocidade}
              aria-pressed={velocidade === v}
              aria-label={`Velocidade ${v}×`}
              onClick={() => controlar(pausado, v)}
            >
              {v}×
            </button>
          ))}
          <button type="button" className={S.botaoIcone} aria-label="Reiniciar" title="Reiniciar" onClick={reiniciar}>
            <IconeReiniciar />
          </button>
        </div>

        <button
          type="button"
          className={S.ajuda}
          aria-label="Ajuda e atalhos"
          title="Ajuda e atalhos"
          onClick={() => useSimulacaoStore.getState().setAjudaAberta(true)}
        >
          <IconeAjuda />
        </button>
        <button type="button" className={`${Estilo.bt} ${S.verRequisitos}`} onClick={aoVerRequisitos}>
          Ver requisitos ↓
        </button>
      </div>
    </header>
  )
}
