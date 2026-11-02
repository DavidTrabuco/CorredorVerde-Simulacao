import { IconeAlerta, IconeAmbulancia, IconeRota, IconeSemaforo } from '../../share/icones'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { IndicadoresStyles as S } from './styles'

// Faixa compacta no topo com o estado da simulação. Só conta o que veio no GET /estado; nenhuma regra é
// decidida aqui. Quando um número muda, ele acende por um instante (a key reinicia a animação).
export default function Indicadores() {
  const estado = useSimulacaoStore((s) => s.estado)

  const viaturas = estado?.viaturas ?? []
  const livres = viaturas.filter((v) => v.modo === 'Patrulha' || v.modo === 'Reserva').length
  const abertas = (estado?.ocorrencias ?? []).filter((o) => o.status !== 'Encerrada').length
  const corredores = (estado?.semaforos ?? []).filter((s) => s.reservas.length > 0).length
  const falhas = (estado?.semaforos ?? []).filter((s) => s.falha).length

  const itens = [
    { rotulo: 'viaturas livres', valor: `${livres}/${viaturas.length}`, icone: <IconeAmbulancia />, alerta: false },
    { rotulo: 'ocorrências abertas', valor: String(abertas), icone: <IconeAlerta />, alerta: abertas > 0 },
    { rotulo: 'em corredor', valor: String(corredores), icone: <IconeRota />, alerta: false },
    { rotulo: 'semáforos em falha', valor: String(falhas), icone: <IconeSemaforo />, alerta: falhas > 0 },
  ]

  return (
    <dl className={S.faixa} aria-label="Situação da simulação">
      {itens.map((i) => (
        <div key={i.rotulo} className={S.item}>
          <span className={i.alerta ? S.iconeAlerta : S.icone} aria-hidden="true">
            {i.icone}
          </span>
          <dd key={i.valor} className={i.alerta ? S.valorAlerta : S.valor}>
            {i.valor}
          </dd>
          <dt className={S.rotulo}>{i.rotulo}</dt>
        </div>
      ))}
    </dl>
  )
}
