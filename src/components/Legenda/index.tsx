import { useState } from 'react'
import { IconeCamadas } from '../../share/icones'
import { temPolicia } from '../../share/instalacoes'
import { useSimulacaoStore, type Camada } from '../../store/useSimulacaoStore'
import { LegendaStyles as S } from './styles'

interface Item {
  rotulo: string
  simbolo: string
  // só aparece quando a API tiver base de polícia
  soComPolicia?: boolean
}

const GRUPOS: { camada: Camada; titulo: string; itens: Item[] }[] = [
  {
    camada: 'sinalizacao',
    titulo: 'Sinalização',
    itens: [
      { rotulo: 'Faixa verde', simbolo: `${S.faixa} ${S.verde}` },
      { rotulo: 'Faixa vermelha', simbolo: `${S.faixa} ${S.vermelha}` },
      { rotulo: 'Corredor aberto', simbolo: S.anel },
      { rotulo: 'Semáforo em falha', simbolo: S.losango },
    ],
  },
  {
    camada: 'rotas',
    titulo: 'Rotas',
    itens: [
      { rotulo: 'Ambulância', simbolo: `${S.faixa} ${S.rotaAmb}` },
      { rotulo: 'Bombeiros', simbolo: `${S.faixa} ${S.rotaBom}` },
      { rotulo: 'Polícia', simbolo: `${S.faixa} ${S.rotaPol}`, soComPolicia: true },
      { rotulo: 'Até o hospital', simbolo: `${S.faixa} ${S.trecho}` },
    ],
  },
  {
    camada: 'ocorrencias',
    titulo: 'Ocorrências',
    itens: [{ rotulo: 'Ocorrência', simbolo: S.pino }],
  },
]

// RNF10: rota, corredor, ocorrência e falha têm cor própria e aparecem na legenda, logo abaixo do mapa.
// Cada grupo liga ou desliga a sua camada no mapa (só visual). Fica numa linha só: quando falta espaço,
// os nomes somem (continuam no title) e o botão "Nomes" mostra todos.
export default function Legenda() {
  const camadas = useSimulacaoStore((s) => s.camadas)
  const alternarCamada = useSimulacaoStore((s) => s.alternarCamada)
  const [comNomes, setComNomes] = useState(false)
  const policia = useSimulacaoStore((s) => temPolicia(s.malha))

  return (
    <div className={S.legenda} data-nomes={comNomes} aria-label="Legenda do mapa">
      <span className={S.titulo}>
        <IconeCamadas className={S.tituloIcone} />
        Legenda
      </span>
      {GRUPOS.map((g) => (
        <div key={g.camada} className={`${S.grupo} ${camadas[g.camada] ? '' : S.grupoDesligado}`}>
          <button
            type="button"
            role="switch"
            aria-checked={camadas[g.camada]}
            className={S.chave}
            title={camadas[g.camada] ? `Ocultar ${g.titulo.toLowerCase()} no mapa` : `Mostrar ${g.titulo.toLowerCase()} no mapa`}
            onClick={() => alternarCamada(g.camada)}
          >
            <span className={S.trilho} aria-hidden="true" />
            {g.titulo}
          </button>
          <ul className={S.itens}>
            {g.itens.filter((i) => policia || !i.soComPolicia).map((i) => (
              <li key={i.rotulo} className={S.item} title={i.rotulo}>
                <span className={i.simbolo} />
                <span className={S.nome}>{i.rotulo}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button type="button" className={S.nomes} aria-pressed={comNomes} onClick={() => setComNomes(!comNomes)}>
        Nomes
      </button>
    </div>
  )
}
