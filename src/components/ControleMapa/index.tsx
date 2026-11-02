import { Estilo } from '../../share/estilos'
import { useEffect, useState } from 'react'
import { IconeAjustar, IconeAlvo, IconeMais, IconeMapa, IconeMenos, IconeSairTelaCheia, IconeSeguir, IconeTelaCheia } from '../../share/icones'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { instalacoesDa, centroDaInstalacao } from '../../share/instalacoes'
import { posCruzamento, type Ponto } from '../../utils/geometria'
import { ZOOM_MAX, ZOOM_MIN, ajustarVisao, centralizarEm, visaoAjustada, visaoGeral } from '../../utils/visao'
import { ControleMapaStyles as S } from './styles'

// Zoom e enquadramento do mapa. Fica na barra acima do mapa, nunca em cima dele.
export default function ControleMapa() {
  const visao = useSimulacaoStore((s) => s.visao)
  const setVisao = useSimulacaoStore((s) => s.setVisao)
  const malha = useSimulacaoStore((s) => s.malha)
  const selecionado = useSimulacaoStore((s) => s.selecionado)
  const viaturaSelecionada = useSimulacaoStore((s) => s.viaturaSelecionada)
  const cruzamentoDaViatura = useSimulacaoStore(
    (s) => s.estado?.viaturas.find((v) => v.id === s.viaturaSelecionada)?.cruzamento ?? null,
  )

  // tela cheia da área da simulação (barra, mapa e legenda); Esc sai
  const [telaCheia, setTelaCheia] = useState(false)
  useEffect(() => {
    const aoMudar = () => setTelaCheia(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])
  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.getElementById('simulacao')?.requestFullscreen()
  }

  const instalacaoSelecionada = useSimulacaoStore((s) => s.instalacaoSelecionada)
  const tamanho = useSimulacaoStore((s) => s.tamanhoMapa)
  const seguindo = useSimulacaoStore((s) => s.seguindo)
  const setSeguindo = useSimulacaoStore((s) => s.setSeguindo)

  // centraliza na viatura selecionada; senão no prédio público; senão no cruzamento selecionado
  const pontoAlvo = (): Ponto | null => {
    if (!malha) return null
    if (cruzamentoDaViatura) return posCruzamento(cruzamentoDaViatura, malha)
    const inst = instalacoesDa(malha).find((i) => i.id === instalacaoSelecionada)
    if (inst) return centroDaInstalacao(inst)
    return selecionado ? posCruzamento(selecionado, malha) : null
  }
  const alvo = cruzamentoDaViatura ?? instalacaoSelecionada ?? selecionado
  const centralizar = () => {
    const p = pontoAlvo()
    if (p && malha) setVisao(centralizarEm({ ...visao, zoom: Math.max(visao.zoom, 1.4) }, p, malha))
  }

  return (
    <div className={Estilo.grupo}>
      <div className={S.grupo} role="group" aria-label="Zoom do mapa">
        <button
          type="button"
          className={S.botao}
          aria-label="Afastar"
          title="Afastar (Ctrl/Cmd + roda)"
          disabled={visao.zoom <= ZOOM_MIN}
          onClick={() => malha && setVisao(ajustarVisao({ ...visao, zoom: Math.max(ZOOM_MIN, visao.zoom / 1.25) }, malha))}
        >
          <IconeMenos />
        </button>
        <span className={S.zoom}>{Math.round(visao.zoom * 100)}%</span>
        <button
          type="button"
          className={S.botao}
          aria-label="Aproximar"
          title="Aproximar (Ctrl/Cmd + roda)"
          disabled={visao.zoom >= ZOOM_MAX}
          onClick={() => malha && setVisao(ajustarVisao({ ...visao, zoom: visao.zoom * 1.25 }, malha))}
        >
          <IconeMais />
        </button>
        <button
          type="button"
          className={S.botao}
          aria-label="Centralizar"
          title={
            viaturaSelecionada
              ? `Centralizar na ${viaturaSelecionada}`
              : instalacaoSelecionada
                ? 'Centralizar no prédio selecionado'
                : selecionado
                ? `Centralizar no ${selecionado}`
                : 'Selecione uma viatura ou um cruzamento para centralizar'
          }
          disabled={!alvo}
          onClick={centralizar}
        >
          <IconeAlvo />
        </button>
        <button
          type="button"
          className={S.botao}
          aria-label="Seguir viatura"
          aria-pressed={!!seguindo}
          title={seguindo ? `Parar de seguir a ${seguindo}` : viaturaSelecionada ? `Seguir a ${viaturaSelecionada}` : 'Selecione uma viatura para seguir'}
          disabled={!seguindo && !viaturaSelecionada}
          onClick={() => setSeguindo(seguindo ? null : viaturaSelecionada)}
        >
          <IconeSeguir />
        </button>
        <button
          type="button"
          className={S.botao}
          aria-label="Ajustar à tela"
          title="Ajustar: mostra a malha da simulação inteira"
          onClick={() => {
            setSeguindo(null)
            if (malha) setVisao(visaoAjustada(malha, tamanho.w, tamanho.h))
          }}
        >
          <IconeAjustar />
        </button>
        <button
          type="button"
          className={S.botao}
          aria-label="Visão geral da cidade"
          title="Visão geral: a cidade inteira, com os prédios públicos marcados"
          aria-pressed={!!malha && Math.abs(visao.zoom - visaoGeral(malha, tamanho.w, tamanho.h).zoom) < 0.01}
          onClick={() => {
            setSeguindo(null)
            if (malha) setVisao(visaoGeral(malha, tamanho.w, tamanho.h))
          }}
        >
          <IconeMapa />
        </button>
        <button
          type="button"
          className={S.botao}
          aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
          title={telaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}
          onClick={alternarTelaCheia}
        >
          {telaCheia ? <IconeSairTelaCheia /> : <IconeTelaCheia />}
        </button>
      </div>
    </div>
  )
}
