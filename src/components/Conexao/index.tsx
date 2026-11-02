import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { ConexaoStyles as S } from './styles'

const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:5080/api/v1'

// Estado da conexão com a CorredorVerde-API, pelo polling do GET /estado (RNF08).
export default function Conexao() {
  const { online, latenciaMs } = useSimulacaoStore((s) => s.conexao)
  const classe = online === null ? S.conectando : online ? S.online : S.offline
  const texto = online === null ? 'Conectando…' : online ? `API · ${latenciaMs} ms` : 'API offline'

  return (
    <span className={classe} role="status" title={`${URL_API}${online === false ? ' não respondeu; tentando de novo a cada 250 ms' : ''}`}>
      {texto}
    </span>
  )
}
