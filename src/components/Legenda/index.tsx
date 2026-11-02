import { LegendaStyles as S } from './styles'

// RNF10: rota, corredor, ocorrência e falha têm cor própria e aparecem na legenda, logo abaixo do mapa.
export default function Legenda() {
  return (
    <ul className={S.legenda} aria-label="Legenda do mapa">
      <li className={S.item}>
        <span className={`${S.faixa} ${S.verde}`} />
        Faixa verde
      </li>
      <li className={S.item}>
        <span className={`${S.faixa} ${S.vermelha}`} />
        Faixa vermelha
      </li>
      <li className={S.item}>
        <span className={`${S.faixa} ${S.rotaAmb}`} />
        Rota da ambulância
      </li>
      <li className={S.item}>
        <span className={`${S.faixa} ${S.rotaBom}`} />
        Rota dos bombeiros
      </li>
      <li className={S.item}>
        <span className={`${S.faixa} ${S.trecho}`} />
        Trecho até o hospital
      </li>
      <li className={S.item}>
        <span className={S.anel} />
        Corredor aberto
      </li>
      <li className={S.item}>
        <span className={S.pino} />
        Ocorrência
      </li>
      <li className={S.item}>
        <span className={S.losango} />
        Semáforo em falha
      </li>
    </ul>
  )
}
