import { useEffect, useRef } from 'react'
import { IconeFechar } from '../../share/icones'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { AjudaStyles as S } from './styles'

const ATALHOS: [string, string][] = [
  ['← ↑ ↓ →  ou  W A S D', 'Dirigir a AMB-01 (liga "Eu dirijo")'],
  ['Espaço', 'AMB-01 para no próximo cruzamento'],
  ['Esc', 'Cancelar o modo de clique e parar de seguir a viatura'],
  ['Ctrl/⌘ + roda', 'Zoom no ponto do cursor'],
  ['Arrastar o mapa', 'Mover a câmera'],
]

const COMO: [string, string][] = [
  ['Emergência', 'Escolha a criticidade, clique em um dos botões e depois no cruzamento da ocorrência.'],
  ['Cruzamento', 'Clique para ver os semáforos, o corredor e as viaturas por perto.'],
  ['Prédio público', 'Clique em hospitais, SAMU, quartel ou delegacia para ver o estado e as viaturas.'],
  ['Viatura', 'Clique nela (no mapa ou na frota) para destacar a rota; o botão de seguir acompanha com a câmera.'],
  ['Falha', '"Simular falha" e depois um cruzamento: o semáforo fica piscando e as rotas desviam.'],
]

// Janela de ajuda (atalhos e como usar). É um <dialog> do navegador: Esc e o × fecham.
export default function Ajuda() {
  const aberta = useSimulacaoStore((s) => s.ajudaAberta)
  const setAberta = useSimulacaoStore((s) => s.setAjudaAberta)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberta && !d.open) d.showModal()
    if (!aberta && d.open) d.close()
  }, [aberta])

  return (
    <dialog ref={ref} className={S.janela} aria-labelledby="tituloAjuda" onClose={() => setAberta(false)}>
      <header className={S.cabecalho}>
        <h2 id="tituloAjuda" className={S.titulo}>
          Como usar
        </h2>
        <button type="button" className={S.fechar} aria-label="Fechar" onClick={() => setAberta(false)}>
          <IconeFechar />
        </button>
      </header>
      <h3 className={S.secao}>Atalhos</h3>
      <dl className={S.lista}>
        {ATALHOS.map(([tecla, acao]) => (
          <div key={tecla} className={S.linha}>
            <dt className={S.tecla}>{tecla}</dt>
            <dd className={S.acao}>{acao}</dd>
          </div>
        ))}
      </dl>
      <h3 className={S.secao}>Na tela</h3>
      <dl className={S.lista}>
        {COMO.map(([item, texto]) => (
          <div key={item} className={S.linha}>
            <dt className={S.item}>{item}</dt>
            <dd className={S.acao}>{texto}</dd>
          </div>
        ))}
      </dl>
    </dialog>
  )
}
