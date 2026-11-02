import { useState } from 'react'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { PrimeirosPassosStyles as S } from './styles'

const CHAVE = 'corredor-verde:primeiros-passos'

// o navegador pode bloquear o armazenamento (aba anônima): aí a dica só aparece de novo na próxima visita
function jaDispensou() {
  try {
    return localStorage.getItem(CHAVE) === 'ok'
  } catch {
    return false
  }
}

// Dica da primeira visita, abaixo do mapa (nunca por cima). "Entendi" esconde de vez.
export default function PrimeirosPassos() {
  const [visivel, setVisivel] = useState(() => !jaDispensou())
  const setAjudaAberta = useSimulacaoStore((s) => s.setAjudaAberta)
  if (!visivel) return null

  const dispensar = () => {
    setVisivel(false)
    try {
      localStorage.setItem(CHAVE, 'ok')
    } catch {
      // sem armazenamento: só some nesta visita
    }
  }

  return (
    <section className={S.faixa} aria-label="Primeiros passos">
      <ol className={S.passos}>
        <li>
          <b>1</b> Clique em <em>Emergência</em> e depois num cruzamento
        </li>
        <li>
          <b>2</b> Veja o corredor verde abrir e a viatura passar
        </li>
        <li>
          <b>3</b> Setas ou WASD dirigem a AMB-01
        </li>
      </ol>
      <div className={S.acoes}>
        <button type="button" className={S.link} onClick={() => setAjudaAberta(true)}>
          Ver atalhos
        </button>
        <button type="button" className={S.botao} onClick={dispensar}>
          Entendi
        </button>
      </div>
    </section>
  )
}
