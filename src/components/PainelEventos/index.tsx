import { useMemo, useRef } from 'react'
import { classeChip } from '../../share/estilos'
import { IconeLog, IconeSeta } from '../../share/icones'
import { REQUISITOS } from '../../share/requisitos'
import type { EventoLog } from '../../share/tipos'
import { useSimulacaoStore, type AbaPainel } from '../../store/useSimulacaoStore'
import { CATEGORIAS, naCategoria } from '../../utils/categorias'
import { fmtT } from '../../utils/formato'
import { PainelEventosStyles as S } from './styles'

const MAX_LINHAS = 250

function classeLinha(tipo: EventoLog['tipo']) {
  if (tipo === 'Alerta') return S.linhaAlerta
  if (tipo === 'Erro') return S.linhaErro
  if (tipo === 'Api') return S.linhaApi
  if (tipo === 'Info') return S.linhaSis
  return ''
}

function classeMsg(tipo: EventoLog['tipo']) {
  if (tipo === 'Api') return `${S.msg} ${S.msgApi}`
  if (tipo === 'Info') return `${S.msg} ${S.msgSis}`
  return S.msg
}

function Chips({ tags, aoClicar }: { tags: string[]; aoClicar: (tag: string) => void }) {
  return (
    <div className={S.tags}>
      {tags.map((t) => (
        <button key={t} type="button" className={classeChip(t)} onClick={() => aoClicar(t)}>
          {t}
        </button>
      ))}
    </div>
  )
}

// UC10: log de eventos embaixo do mapa (categorias, filtro e chips de RN/UC) e aba Requisitos (contagem de uso).
export default function PainelEventos() {
  const aba = useSimulacaoStore((s) => s.aba)
  const setAba = useSimulacaoStore((s) => s.setAba)
  const log = useSimulacaoStore((s) => s.log)
  const filtro = useSimulacaoStore((s) => s.filtro)
  const setFiltro = useSimulacaoStore((s) => s.setFiltro)
  const categoria = useSimulacaoStore((s) => s.categoria)
  const setCategoria = useSimulacaoStore((s) => s.setCategoria)
  const mostrarApi = useSimulacaoStore((s) => s.mostrarApi)
  const setMostrarApi = useSimulacaoStore((s) => s.setMostrarApi)
  const contagem = useSimulacaoStore((s) => s.contagem)
  const seqInicial = useSimulacaoStore((s) => s.seqInicial)
  const aberto = useSimulacaoStore((s) => s.logAberto)
  const setAberto = useSimulacaoStore((s) => s.setLogAberto)
  const setAltura = useSimulacaoStore((s) => s.setLogAltura)
  // arraste da alça: posição inicial do mouse e altura no começo
  const arraste = useRef<{ y: number; altura: number } | null>(null)

  const filtrarPor = (tag: string) => {
    setFiltro(tag)
    setCategoria('Todos')
    setAba('Log')
    setAberto(true)
  }

  const eventos = useMemo(() => {
    const texto = filtro.trim().toLowerCase()
    const itens: EventoLog[] = []
    for (let i = log.length - 1; i >= 0 && itens.length < MAX_LINHAS; i--) {
      const e = log[i]
      if (e.tipo === 'Api' && !mostrarApi) continue
      if (!naCategoria(e, categoria)) continue
      if (texto && !`${e.tags.join(' ')} ${e.mensagem}`.toLowerCase().includes(texto)) continue
      itens.push(e)
    }
    return itens
  }, [log, filtro, categoria, mostrarApi])

  const totalLog = useMemo(() => log.filter((e) => e.tipo !== 'Api').length, [log])

  const abas: { nome: AbaPainel; rotulo: string }[] = [
    { nome: 'Log', rotulo: 'Eventos' },
    { nome: 'Requisitos', rotulo: 'Requisitos' },
  ]

  const linhaReq = (id: string, texto: React.ReactNode, extra?: string) => {
    const n = contagem[id] ?? 0
    return (
      <button key={id} type="button" className={S.req} onClick={() => filtrarPor(id)}>
        <span className={S.rid}>{id}</span>
        <span>{texto}</span>
        <span className={S.rst}>
          <span className={`${S.obs} ${n ? S.obsSim : ''}`}>{n ? `${n}× na simulação` : 'ainda não agiu'}</span>
          {extra && <span className={S.manual}>{extra}</span>}
        </span>
      </button>
    )
  }

  return (
    <section id="painel" className={aberto ? S.painel : S.painelRecolhido} aria-label="Log de eventos e requisitos">
      {aberto && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Arraste para mudar a altura do log"
          title="Arraste para mudar a altura · clique duplo volta ao tamanho padrão"
          className={S.alca}
          onPointerDown={(ev) => {
            ev.currentTarget.setPointerCapture(ev.pointerId)
            arraste.current = { y: ev.clientY, altura: useSimulacaoStore.getState().logAltura }
          }}
          onPointerMove={(ev) => {
            if (!arraste.current) return
            // arrastar para cima aumenta o log
            setAltura(arraste.current.altura - (ev.clientY - arraste.current.y))
          }}
          onPointerUp={() => {
            arraste.current = null
          }}
          onDoubleClick={() => setAltura(200)}
        />
      )}
      <header className={S.cabecalho}>
        <h2 className={S.titulo}>
          <IconeLog className={S.icone} />
          Log de eventos
        </h2>
        <div className={S.abas} role="tablist">
          {abas.map((a) => (
            <button
              key={a.nome}
              type="button"
              role="tab"
              className={S.aba}
              aria-selected={aba === a.nome}
              aria-controls="corpoPainel"
              onClick={() => {
                setAba(a.nome)
                setAberto(true)
              }}
            >
              {a.rotulo}
              {a.nome === 'Log' && <span className={S.cont}>{totalLog}</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={S.recolher}
          aria-expanded={aberto}
          aria-controls="corpoPainel"
          title={aberto ? 'Recolher o log' : 'Abrir o log'}
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? 'Recolher' : 'Abrir'}
          <IconeSeta className={aberto ? S.setaAberta : S.seta} />
        </button>
      </header>

      {!aberto ? null : aba === 'Log' ? (
        <div id="corpoPainel" role="tabpanel" className={S.corpo}>
          <div className={S.filtros}>
            <div className={S.categorias} role="group" aria-label="Categoria">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.nome}
                  type="button"
                  className={S.categoria}
                  aria-pressed={categoria === c.nome}
                  onClick={() => setCategoria(c.nome)}
                >
                  {c.rotulo}
                </button>
              ))}
            </div>
            <input
              type="search"
              className={S.busca}
              placeholder="Filtrar: RN06, UC04, C13, AMB-01…"
              aria-label="Filtrar o log"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <label className={S.chk}>
              <input type="checkbox" checked={mostrarApi} onChange={(e) => setMostrarApi(e.target.checked)} />
              Chamadas da API
            </label>
          </div>
          <div className={S.rolagem}>
            <ol className={S.lista}>
              {eventos.length ? (
                eventos.map((e) => (
                  <li key={e.seq} className={`${S.linha} ${classeLinha(e.tipo)} ${seqInicial !== null && e.seq > seqInicial ? S.novo : ''}`}>
                    <time className={S.hora}>{fmtT(e.tempoSeg)}</time>
                    <Chips tags={e.tags} aoClicar={filtrarPor} />
                    <div className={classeMsg(e.tipo)}>{e.mensagem}</div>
                  </li>
                ))
              ) : (
                <li className={S.vazio}>Nenhum evento{filtro.trim() ? ` com "${filtro.trim()}"` : ''} ainda.</li>
              )}
            </ol>
          </div>
        </div>
      ) : (
        <div id="corpoPainel" role="tabpanel" className={S.corpo}>
          <p className={S.nota}>
            Mesmos IDs do documento da 1ª entrega. A contagem mostra quantas vezes a regra agiu nesta sessão. Clique numa
            linha para ver os eventos dela no log.
          </p>
          <div className={S.rolagem}>
            <div className={S.grupo}>Regras de negócio</div>
            {REQUISITOS.rn.map((r) => linhaReq(r.id, r.texto))}
            <div className={S.grupo}>Casos de uso</div>
            {REQUISITOS.uc.map((u) =>
              linhaReq(
                u.id,
                <>
                  <b>{u.nome}.</b> {u.resumo}.
                </>,
              ),
            )}
            <div className={S.grupo}>Requisitos não funcionais</div>
            {REQUISITOS.rnf.map((r) =>
              linhaReq(
                r.id,
                <>
                  <b>{r.atributo}.</b> {r.texto}.
                </>,
                r.auto ? undefined : r.id === 'RNF11' ? 'medido no C#' : 'roteiro manual',
              ),
            )}
          </div>
        </div>
      )}
    </section>
  )
}
