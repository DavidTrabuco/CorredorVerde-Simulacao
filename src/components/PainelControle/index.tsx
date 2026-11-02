import { useEmergencia } from '../../hooks/useEmergencia'
import { IconeAlerta, IconeAmbulancia, IconeBombeiros, IconePainel, IconePolicia } from '../../share/icones'
import { temPolicia } from '../../share/instalacoes'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import Minimapa from '../Minimapa'
import PainelViaturas from '../PainelViaturas'
import RegistrarEmergencia from '../RegistrarEmergencia'
import { PainelControleStyles as S } from './styles'

interface PainelControleProps {
  // vem da animação: a viatura parada na faixa esperando o verde (RN07)
  esperando: (id: string) => boolean
}

// Coluna da esquerda. No computador pode ser recolhida numa barra de ícones, e o mapa ganha espaço.
export default function PainelControle({ esperando }: PainelControleProps) {
  const recolhida = useSimulacaoStore((s) => s.lateralRecolhida)
  const setRecolhida = useSimulacaoStore((s) => s.setLateralRecolhida)
  const modoClique = useSimulacaoStore((s) => s.modoClique)
  const abertas = useSimulacaoStore(
    (s) => (s.estado?.ocorrencias ?? []).filter((o) => o.status !== 'Encerrada').length,
  )
  const policia = useSimulacaoStore((s) => temPolicia(s.malha))
  const { alternarModo } = useEmergencia()

  return (
    <>
      <div className={recolhida ? S.barra : S.oculta}>
        <button
          type="button"
          className={`${S.botao} ${S.neutro}`}
          aria-label="Abrir o painel de controle"
          title="Abrir o painel de controle"
          onClick={() => setRecolhida(false)}
        >
          <IconePainel />
        </button>
        <span className={S.divisor} aria-hidden="true" />
        <button
          type="button"
          className={`${S.botao} ${S.ambulancia}`}
          aria-pressed={modoClique === 'Ambulancia'}
          aria-label="Emergência da ambulância"
          title="Emergência da ambulância"
          onClick={() => alternarModo('Ambulancia')}
        >
          <IconeAmbulancia />
        </button>
        <button
          type="button"
          className={`${S.botao} ${S.bombeiros}`}
          aria-pressed={modoClique === 'Bombeiros'}
          aria-label="Emergência dos bombeiros"
          title="Emergência dos bombeiros"
          onClick={() => alternarModo('Bombeiros')}
        >
          <IconeBombeiros />
        </button>
        {policia && (
          <button
            type="button"
            className={`${S.botao} ${S.policia}`}
            aria-pressed={modoClique === 'Policia'}
            aria-label="Ocorrência policial"
            title="Ocorrência policial"
            onClick={() => alternarModo('Policia')}
          >
            <IconePolicia />
          </button>
        )}
        <span className={S.divisor} aria-hidden="true" />
        <span className={S.contador} title="Ocorrências abertas">
          <IconeAlerta className={abertas ? S.alertaAtivo : ''} />
          <b>{abertas}</b>
        </span>
      </div>

      <div className={recolhida ? S.conteudoRecolhido : S.conteudo}>
        <div className={S.cabecalho}>
          <span className={S.titulo}>Painel de controle</span>
          <button
            type="button"
            className={S.recolher}
            aria-label="Recolher o painel de controle"
            title="Recolher o painel"
            onClick={() => setRecolhida(true)}
          >
            <IconePainel />
          </button>
        </div>
        <Minimapa />
        <RegistrarEmergencia />
        <PainelViaturas esperando={esperando} />
      </div>
    </>
  )
}
