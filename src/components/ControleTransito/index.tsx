import { Estilo } from '../../share/estilos'
import { useSimulacaoStore, type Densidade } from '../../store/useSimulacaoStore'
import { ControleTransitoStyles as S } from './styles'

const OPCOES: { valor: Densidade; rotulo: string }[] = [
  { valor: 'leve', rotulo: 'Leve' },
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'intenso', rotulo: 'Intenso' },
]

// Quantidade de carros comuns (só animação da tela): para testar as emergências com mais ou menos trânsito.
export default function ControleTransito() {
  const densidade = useSimulacaoStore((s) => s.densidade)
  const setDensidade = useSimulacaoStore((s) => s.setDensidade)

  return (
    <div className={Estilo.grupo}>
      <span className={Estilo.grupoTit}>Trânsito</span>
      <div className={S.opcoes} role="group" aria-label="Densidade do trânsito">
        {OPCOES.map((o) => (
          <button key={o.valor} type="button" className={S.opcao} aria-pressed={densidade === o.valor} onClick={() => setDensidade(o.valor)}>
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}
