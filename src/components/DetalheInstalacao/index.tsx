import { IconeAmbulancia, IconeBombeiros, IconeFechar, IconeLog, IconePolicia } from '../../share/icones'
import { ROTULO_TIPO, instalacoesDa } from '../../share/instalacoes'
import type { Viatura } from '../../share/tipos'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { DetalheInstalacaoStyles as S } from './styles'

const MODO: Record<Viatura['modo'], string> = {
  Patrulha: 'patrulhando',
  Emergencia: 'em emergência',
  Atendimento: 'em atendimento',
  Retorno: 'voltando à base',
  Reserva: 'na base',
}

// Detalhes do prédio público clicado, ABAIXO do mapa. Só usa dados reais: a malha e o GET /estado.
export default function DetalheInstalacao() {
  const id = useSimulacaoStore((s) => s.instalacaoSelecionada)
  const setSelecionada = useSimulacaoStore((s) => s.setInstalacaoSelecionada)
  const estado = useSimulacaoStore((s) => s.estado)
  const malha = useSimulacaoStore((s) => s.malha)
  const inst = malha ? instalacoesDa(malha).find((i) => i.id === id) : undefined
  if (!inst) return null

  const itens: { rotulo: string; valor: React.ReactNode }[] = [
    { rotulo: 'Tipo de instalação', valor: ROTULO_TIPO[inst.tipo] },
    {
      rotulo: 'Cruzamento de referência',
      valor: inst.foraDaSimulacao ? `${inst.cruzamento} (o mais próximo; fica fora da área da simulação)` : inst.cruzamento,
    },
  ]
  let nome = inst.nome
  let status: { texto: string; ok: boolean } = { texto: 'Operacional', ok: true }

  if (inst.tipo === 'hospital') {
    nome = malha?.hospitais.find((h) => h.cruzamento === inst.cruzamento)?.nome ?? inst.nome
    const chegando = (estado?.ocorrencias ?? []).filter((o) => o.hospital === nome && o.status === 'ACaminhoHospital')
    const concluidas = (estado?.ocorrencias ?? []).filter((o) => o.hospital === nome && o.status === 'Encerrada').length
    itens.push({
      rotulo: 'Ambulâncias a caminho',
      valor: chegando.length ? chegando.map((o) => `${o.viaturaId} (${o.id})`).join(' · ') : 'Nenhuma no momento',
    })
    itens.push({ rotulo: 'Atendimentos concluídos aqui', valor: String(concluidas) })
  } else if (malha?.bases.some((b) => b.cruzamento === inst.cruzamento)) {
    // base que existe na API: viaturas reais dela
    const base = malha.bases.find((b) => b.cruzamento === inst.cruzamento)
    nome = base?.nome ?? inst.nome
    const viaturas = (estado?.viaturas ?? []).filter((v) => v.base === inst.cruzamento)
    const naBase = viaturas.filter((v) => v.modo === 'Reserva').length
    const Icone = inst.tipo === 'samu' ? IconeAmbulancia : inst.tipo === 'bombeiros' ? IconeBombeiros : IconePolicia
    itens.push({
      rotulo: 'Viaturas associadas',
      valor: viaturas.length ? (
        <span className={S.viaturas}>
          {viaturas.map((v) => (
            <span key={v.id} className={S.viatura}>
              <Icone className={S.viaturaIcone} />
              {v.id} · {MODO[v.modo]}
            </span>
          ))}
        </span>
      ) : (
        'Nenhuma'
      ),
    })
    status = { texto: naBase ? `Operacional · ${naBase} na base` : 'Operacional · todas em serviço', ok: true }
  } else {
    // delegacia sem base de polícia na API: está na rede de ruas, mas ainda sem viaturas
    itens.push({
      rotulo: 'Situação',
      valor: inst.foraDaSimulacao
        ? 'Fora das ruas da simulação'
        : 'Na rede de ruas; viaturas e ocorrências policiais entram quando a API tiver base de polícia',
    })
    status = { texto: 'Aguardando a API', ok: false }
  }

  return (
    <section className={S.cartao} aria-label={`Detalhes: ${nome}`}>
      <header className={S.cabecalho}>
        <h3 className={S.titulo}>
          <IconeLog className={S.icone} />
          {nome}
          <span className={status.ok ? S.statusOk : S.statusInfo}>{status.texto}</span>
        </h3>
        <button type="button" className={S.fechar} aria-label="Fechar detalhes" onClick={() => setSelecionada(null)}>
          <IconeFechar />
        </button>
      </header>
      <dl className={S.grade}>
        {itens.map((i) => (
          <div key={i.rotulo} className={S.item}>
            <dt className={S.rotulo}>{i.rotulo}</dt>
            <dd className={S.valor}>{i.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
