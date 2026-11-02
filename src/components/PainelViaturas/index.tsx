import { IconeAmbulancia, IconeBombeiros, IconeFrota, IconePolicia } from '../../share/icones'
import type { Viatura } from '../../share/tipos'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import Cartao from '../Cartao'
import { PainelViaturasStyles as S } from './styles'

interface PainelViaturasProps {
  // vem da animação: a viatura parada na faixa esperando o verde (RN07)
  esperando: (id: string) => boolean
}

function textoStatus(v: Viatura): [keyof typeof S.pill, string] {
  if (v.modo === 'Reserva') return ['res', 'Reserva na base']
  if (v.modo === 'Retorno') return ['res', 'Voltando à base']
  if (v.modo === 'Atendimento') return ['atend', `Atendimento · ${Math.ceil(v.atendimentoRestanteSeg)} s`]
  if (v.modo === 'Emergencia') {
    if (v.semRota) return ['emerg', 'Sem rota · aguardando']
    return ['emerg', v.trecho === 2 ? `Indo ao ${v.hospital}` : 'Indo ao local']
  }
  return ['ok', 'Patrulhando']
}

function infoDaViatura(v: Viatura, manual: boolean, esperando: boolean) {
  if ((v.modo === 'Emergencia' || v.modo === 'Retorno') && v.rota.length) {
    return (v.ocorrenciaId ? `${v.ocorrenciaId} · ` : '') + v.rota.map((r) => r.cruzamento).join(' → ')
  }
  if (v.modo === 'Patrulha') {
    const onde = v.indoPara ? `${v.cruzamento} → ${v.indoPara}` : `em ${v.cruzamento}`
    return (manual && v.id === 'AMB-01' ? 'Você dirige · ' : '') + onde + (esperando ? ' · esperando o verde' : '')
  }
  return ''
}

// "2 ambulâncias e 2 viaturas dos bombeiros" (e polícia, quando a API mandar), contado do GET /estado.
function resumoFrota(viaturas: Viatura[]) {
  const n = (tipo: Viatura['tipo']) => viaturas.filter((v) => v.tipo === tipo).length
  const partes = [
    [n('Ambulancia'), 'ambulância', 'ambulâncias'],
    [n('Bombeiros'), 'viatura dos bombeiros', 'viaturas dos bombeiros'],
    [n('Policia'), 'viatura policial', 'viaturas policiais'],
  ]
    .filter(([q]) => q)
    .map(([q, um, varios]) => `${q} ${q === 1 ? um : varios}`)
  return partes.length ? partes.join(partes.length > 2 ? ', ' : ' e ') : 'Aguardando a API'
}

export default function PainelViaturas({ esperando }: PainelViaturasProps) {
  const viaturas = useSimulacaoStore((s) => s.estado?.viaturas)
  const manual = useSimulacaoStore((s) => s.manual)
  const selecionada = useSimulacaoStore((s) => s.viaturaSelecionada)
  const setSelecionada = useSimulacaoStore((s) => s.setViaturaSelecionada)

  return (
    <Cartao titulo="Frota em serviço" subtitulo={resumoFrota(viaturas ?? [])} icone={<IconeFrota />}>
      <ul className={S.lista}>
        {(viaturas ?? []).map((v) => {
          const [classe, texto] = textoStatus(v)
          const Icone = v.tipo === 'Bombeiros' ? IconeBombeiros : v.tipo === 'Policia' ? IconePolicia : IconeAmbulancia
          const avatar = v.tipo === 'Bombeiros' ? S.avatarBom : v.tipo === 'Policia' ? S.avatarPol : S.avatarAmb
          return (
            <li key={v.id} className={S.linhaLista}>
              <button
                type="button"
                className={S.item}
                aria-pressed={selecionada === v.id}
                title={selecionada === v.id ? 'Tirar o destaque do mapa' : 'Destacar no mapa'}
                onClick={() => setSelecionada(selecionada === v.id ? null : v.id)}
              >
                <span className={avatar} aria-hidden="true">
                  <Icone />
                </span>
                <span className={S.dados}>
                  <span className={S.linha}>
                    <span className={S.id}>{v.id}</span>
                    <span className={S.papel}>{v.papel}</span>
                    <span className={S.pill[classe]}>{texto}</span>
                  </span>
                  <span className={S.info}>{infoDaViatura(v, manual, esperando(v.id))}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Cartao>
  )
}
