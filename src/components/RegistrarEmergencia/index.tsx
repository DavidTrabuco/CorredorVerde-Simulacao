import { useEmergencia } from '../../hooks/useEmergencia'
import { Estilo } from '../../share/estilos'
import { IconeAmbulancia, IconeBombeiros, IconePolicia, IconeSirene } from '../../share/icones'
import { temPolicia } from '../../share/instalacoes'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import Cartao from '../Cartao'
import { RegistrarEmergenciaStyles as S } from './styles'

const CRITICIDADES = [
  { valor: 1, rotulo: 'Risco de vida', cor: S.crit1 },
  { valor: 2, rotulo: 'Urgente', cor: S.crit2 },
  { valor: 3, rotulo: 'Padrão', cor: S.crit3 },
]

// RNF09: escolher o tipo e clicar no mapa são no máximo 2 cliques.
// Cada botão usa a cor da rota da viatura no mapa: azul (ambulância), laranja (bombeiros) e azul-escuro
// (polícia, só quando a API tiver base de polícia).
export default function RegistrarEmergencia() {
  const modoClique = useSimulacaoStore((s) => s.modoClique)
  const criticidade = useSimulacaoStore((s) => s.criticidade)
  const setCriticidade = useSimulacaoStore((s) => s.setCriticidade)
  const policia = useSimulacaoStore((s) => temPolicia(s.malha))
  const { alternarModo } = useEmergencia()

  return (
    <Cartao titulo="Registrar emergência" subtitulo="Despacho da viatura mais próxima" icone={<IconeSirene />}>
      <div className={S.campo}>
        <span className={S.rotulo} id="rotuloCrit">
          Nível de criticidade
        </span>
        <div className={S.criticidades} role="group" aria-labelledby="rotuloCrit">
          {CRITICIDADES.map((c) => (
            <button
              key={c.valor}
              type="button"
              className={`${S.crit} ${c.cor}`}
              aria-pressed={criticidade === c.valor}
              onClick={() => setCriticidade(c.valor)}
            >
              <b className={S.critNumero}>{c.valor}</b>
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>
      <div className={S.botoes}>
        <button
          type="button"
          className={`${S.botao} ${S.ambulancia}`}
          aria-pressed={modoClique === 'Ambulancia'}
          onClick={() => alternarModo('Ambulancia')}
        >
          <IconeAmbulancia className={S.botaoIcone} />
          Emergência da ambulância
        </button>
        <button
          type="button"
          className={`${S.botao} ${S.bombeiros}`}
          aria-pressed={modoClique === 'Bombeiros'}
          onClick={() => alternarModo('Bombeiros')}
        >
          <IconeBombeiros className={S.botaoIcone} />
          Emergência dos bombeiros
        </button>
        {policia && (
          <button
            type="button"
            className={`${S.botao} ${S.policia}`}
            aria-pressed={modoClique === 'Policia'}
            onClick={() => alternarModo('Policia')}
          >
            <IconePolicia className={S.botaoIcone} />
            Ocorrência policial
          </button>
        )}
      </div>
      <p className={Estilo.dica}>Escolha o tipo e clique no cruzamento da ocorrência.</p>
    </Cartao>
  )
}
