import { IconeFechar, IconeSemaforo } from '../../share/icones'
import type { Luz } from '../../share/tipos'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { DetalheCruzamentoStyles as S } from './styles'

const CLASSE_LUZ: Record<Luz, string> = {
  Verde: S.verde,
  Amarelo: S.amarelo,
  Vermelho: S.vermelho,
  Piscante: S.amarelo,
}

// Detalhes do cruzamento clicado, ABAIXO do mapa. Só mostra o que veio no GET /estado.
export default function DetalheCruzamento() {
  const id = useSimulacaoStore((s) => s.selecionado)
  const setSelecionado = useSimulacaoStore((s) => s.setSelecionado)
  const estado = useSimulacaoStore((s) => s.estado)
  const malha = useSimulacaoStore((s) => s.malha)
  if (!id || !estado) return null

  const semaforo = estado.semaforos.find((s) => s.cruzamento === id)
  const viaturas = estado.viaturas.filter((v) => v.cruzamento === id || v.indoPara === id)
  const ocorrencias = estado.ocorrencias.filter((o) => o.cruzamento === id && o.status !== 'Encerrada')
  const predios = [
    ...(malha?.hospitais.filter((h) => h.cruzamento === id).map((h) => h.nome) ?? []),
    ...(malha?.bases.filter((b) => b.cruzamento === id).map((b) => b.nome) ?? []),
  ]

  const ondeEsta = (cruzamento: string, indoPara: string | null) => {
    if (indoPara === id) return `chegando de ${cruzamento}`
    if (indoPara) return `saindo para ${indoPara}`
    return 'parada aqui'
  }

  return (
    <section className={S.cartao} aria-label={`Detalhes do cruzamento ${id}`}>
      <header className={S.cabecalho}>
        <h3 className={S.titulo}>
          <IconeSemaforo className={S.icone} />
          Cruzamento {id}
          <span className={semaforo?.falha ? S.statusFalha : S.statusOk}>{semaforo?.falha ? 'Em falha' : 'Operacional'}</span>
          {predios.length > 0 && <span className={S.predios}>{predios.join(' · ')}</span>}
        </h3>
        <button type="button" className={S.fechar} aria-label="Fechar detalhes" onClick={() => setSelecionado(null)}>
          <IconeFechar />
        </button>
      </header>

      <dl className={S.grade}>
        <div className={S.item}>
          <dt className={S.rotulo}>Sinal vertical (Norte-Sul)</dt>
          <dd className={S.valor}>
            {semaforo ? <span className={CLASSE_LUZ[semaforo.ns]}>{semaforo.ns}</span> : '—'}
          </dd>
        </div>
        <div className={S.item}>
          <dt className={S.rotulo}>Sinal horizontal (Leste-Oeste)</dt>
          <dd className={S.valor}>
            {semaforo ? <span className={CLASSE_LUZ[semaforo.lo]}>{semaforo.lo}</span> : '—'}
          </dd>
        </div>
        <div className={S.item}>
          <dt className={S.rotulo}>Corredor prioritário</dt>
          <dd className={S.valor}>
            {semaforo?.reservas.length ? (
              <>
                <span className={S.ativo}>Ativo</span>{' '}
                {semaforo.reservas.map((r) => `${r.viaturaId} (${r.eixo})`).join(', ')}
                {semaforo.vencedor && semaforo.reservas.length > 1 ? ` · passa ${semaforo.vencedor}` : ''}
              </>
            ) : (
              <span className={S.inativo}>Inativo</span>
            )}
          </dd>
        </div>
        <div className={S.item}>
          <dt className={S.rotulo}>Viaturas</dt>
          <dd className={S.valor}>
            {viaturas.length
              ? viaturas.map((v) => `${v.id} ${ondeEsta(v.cruzamento, v.indoPara)}`).join(' · ')
              : 'Nenhuma por perto'}
          </dd>
        </div>
        <div className={S.item}>
          <dt className={S.rotulo}>Ocorrências</dt>
          <dd className={S.valor}>
            {ocorrencias.length
              ? ocorrencias.map((o) => `${o.id} (crit. ${o.criticidade}, ${o.viaturaId})`).join(' · ')
              : 'Nenhuma aberta'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
