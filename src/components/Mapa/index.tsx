import { useEffect, useRef, useState } from 'react'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import {
  cruzamentoPerto,
  desenharCena,
  enquadrar,
  lerCores,
  montarCamadaFixa,
  areaVisivel,
  instalacaoEm,
  type CamadaFixa,
  type Cores,
  type Enquadramento,
  type ParamsCena,
} from './desenho'
import { posCruzamento } from '../../utils/geometria'
import { VISAO_INICIAL, arrastar, centralizarEm, zoomEm, type Visao } from '../../utils/visao'
import { MapaStyles } from './styles'

interface MapaProps {
  aoClicarCruzamento?: (id: string) => void
  // chamado a cada quadro, para as viaturas e os carros desenharem junto
  complementos?: Pick<ParamsCena, 'centroViatura' | 'desenharVeiculos'>
}

export default function Mapa({ aoClicarCruzamento, complementos }: MapaProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modoClique = useSimulacaoStore((s) => s.modoClique)
  const malha = useSimulacaoStore((s) => s.malha)
  const setSelecionado = useSimulacaoStore((s) => s.setSelecionado)
  const setViaturaSelecionada = useSimulacaoStore((s) => s.setViaturaSelecionada)
  const setInstalacaoSelecionada = useSimulacaoStore((s) => s.setInstalacaoSelecionada)
  const [sobreNo, setSobreNo] = useState(false)

  // valores que o laço de desenho lê a cada quadro, sem recriar o efeito
  const vivo = useRef({
    hoverNo: null as string | null,
    hoverInstalacao: null as string | null,
    complementos,
    modoClique,
    enq: enquadrar(1, 1, VISAO_INICIAL) as Enquadramento,
    // arraste do mapa: onde começou e se o mouse andou (aí o clique não conta)
    arraste: null as { x: number; y: number; visao: Visao } | null,
    arrastou: false,
  })
  const [arrastando, setArrastando] = useState(false)
  useEffect(() => {
    vivo.current.complementos = complementos
    vivo.current.modoClique = modoClique
  }, [complementos, modoClique])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || !malha) return
    const ctx = canvas.getContext('2d')!
    const reduzMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cores: Cores = lerCores()
    let camada: CamadaFixa | null = null
    let largura = 0
    let altura = 0
    let raf = 0
    let pendente = 0

    // Refaz a camada fixa cobrindo a tela e mais meia tela de cada lado (o arraste só reposiciona a imagem).
    const refazerCamada = () => {
      const enq = vivo.current.enq
      const a = areaVisivel(enq)
      const mx = (a.x1 - a.x0) / 2
      const my = (a.y1 - a.y0) / 2
      camada = montarCamadaFixa(malha, enq.escala, { x0: a.x0 - mx, y0: a.y0 - my, x1: a.x1 + mx, y1: a.y1 + my }, cores)
    }

    // Precisa refazer quando o zoom mudou ou quando a tela chegou perto da borda da camada.
    const camadaServe = () => {
      if (!camada) return false
      const enq = vivo.current.enq
      if (Math.abs(enq.escala / camada.escala - 1) > 0.001) return false
      const a = areaVisivel(enq)
      const largCamada = camada.imagem.width / (camada.escala * (window.devicePixelRatio || 1))
      const altCamada = camada.imagem.height / (camada.escala * (window.devicePixelRatio || 1))
      return a.x0 >= camada.x0 && a.y0 >= camada.y0 && a.x1 <= camada.x0 + largCamada && a.y1 <= camada.y0 + altCamada
    }

    // Só a câmera mudou: recalcula o enquadramento na hora e, se preciso, refaz a camada no próximo quadro.
    // Enquanto isso o laço continua desenhando a camada antiga, sem quadro vazio.
    const moverCamera = () => {
      if (!largura || !altura) return
      vivo.current.enq = enquadrar(largura, altura, useSimulacaoStore.getState().visao)
      if (camadaServe() || pendente) return
      pendente = requestAnimationFrame(() => {
        pendente = 0
        refazerCamada()
      })
    }

    // O card mudou de tamanho: só aqui o canvas muda de tamanho.
    const redimensionar = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      const dpr = window.devicePixelRatio || 1
      if (w !== largura || h !== altura || canvas.width !== Math.round(w * dpr)) {
        largura = w
        altura = h
        useSimulacaoStore.getState().setTamanhoMapa(w, h)
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      cores = lerCores()
      vivo.current.enq = enquadrar(w, h, useSimulacaoStore.getState().visao)
      refazerCamada()
    }
    redimensionar()

    const observador = new ResizeObserver(redimensionar)
    observador.observe(wrap)
    // os rótulos do mapa usam as fontes da página: redesenha quando elas terminam de carregar
    void document.fonts?.ready.then(redimensionar)

    // zoom e arraste mudam só a visão (a simulação de 250 ms não passa por aqui)
    const desinscrever = useSimulacaoStore.subscribe((st, ant) => {
      if (st.visao !== ant.visao) moverCamera()
    })

    // Ctrl/Cmd + roda (ou pinça no trackpad) dá zoom no ponto do cursor; a roda sozinha continua rolando a página
    const aoRodar = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) return
      ev.preventDefault()
      const r = canvas.getBoundingClientRect()
      const st = useSimulacaoStore.getState()
      const fator = Math.exp(-ev.deltaY * 0.0025)
      st.setVisao(
        zoomEm(st.visao, fator, { x: ev.clientX - r.left, y: ev.clientY - r.top }, { x: r.width / 2, y: r.height / 2 }, vivo.current.enq.escala, malha),
      )
    }
    canvas.addEventListener('wheel', aoRodar, { passive: false })

    // câmera seguindo uma viatura: anda suavemente até ela (no máximo ~30 vezes por segundo)
    let ultimoSeguir = 0
    const seguir = (agora: number) => {
      const st = useSimulacaoStore.getState()
      if (!st.seguindo || agora - ultimoSeguir < 33) return
      const alvo = vivo.current.complementos?.centroViatura?.(st.seguindo)
      if (!alvo) return
      const dt = ultimoSeguir ? Math.min(0.1, (agora - ultimoSeguir) / 1000) : 0.033
      ultimoSeguir = agora
      const k = Math.min(1, dt * 5)
      const cx = st.visao.cx + (alvo.x - st.visao.cx) * k
      const cy = st.visao.cy + (alvo.y - st.visao.cy) * k
      if (Math.abs(cx - st.visao.cx) + Math.abs(cy - st.visao.cy) > 0.3) st.setVisao(centralizarEm(st.visao, { x: cx, y: cy }, malha))
    }

    const quadro = (agora: number) => {
      seguir(agora)
      desenharCena({
        ctx,
        camadaFixa: camada,
        malha,
        estado: useSimulacaoStore.getState().estado,
        cores,
        enq: vivo.current.enq,
        tReal: agora / 1000,
        reduzMov,
        modoClique: !!vivo.current.modoClique,
        hoverNo: vivo.current.hoverNo,
        selecionado: useSimulacaoStore.getState().selecionado,
        instalacaoSelecionada: useSimulacaoStore.getState().instalacaoSelecionada,
        instalacaoHover: vivo.current.hoverInstalacao,
        viaturaSelecionada: useSimulacaoStore.getState().viaturaSelecionada,
        manual: useSimulacaoStore.getState().manual,
        camadas: useSimulacaoStore.getState().camadas,
        ...vivo.current.complementos,
      })
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pendente)
      desinscrever()
      canvas.removeEventListener('wheel', aoRodar)
      observador.disconnect()
    }
  }, [malha])

  // posição do evento em coordenadas do mapa
  const pontoDoEvento = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const { escala, ox, oy } = vivo.current.enq
    return { x: (ev.clientX - r.left - ox) / escala, y: (ev.clientY - r.top - oy) / escala }
  }

  const noDoEvento = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if (!malha) return null
    const { x, y } = pontoDoEvento(ev)
    return cruzamentoPerto(malha, x, y)
  }

  // viatura a até 16 px do clique (em coordenadas do mapa)
  const viaturaDoEvento = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = pontoDoEvento(ev)
    for (const v of useSimulacaoStore.getState().estado?.viaturas ?? []) {
      const c = vivo.current.complementos?.centroViatura?.(v.id)
      if (c && Math.hypot(c.x - x, c.y - y) < 16) return v.id
    }
    return null
  }

  return (
    <div className={MapaStyles.rolagem}>
      <div ref={wrapRef} className={`${MapaStyles.wrap} ${MapaStyles.altura}`}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Mapa da cidade com 20 cruzamentos, semáforos, viaturas e ocorrências"
          className={`${MapaStyles.canvas} ${
            arrastando
              ? MapaStyles.canvasArrastando
              : modoClique
                ? MapaStyles.canvasClicavel
                : sobreNo
                  ? MapaStyles.canvasSobreNo
                  : MapaStyles.canvasArrastavel
          }`}
          onPointerDown={(ev) => {
            if (ev.button !== 0) return
            vivo.current.arraste = { x: ev.clientX, y: ev.clientY, visao: useSimulacaoStore.getState().visao }
            vivo.current.arrastou = false
          }}
          onPointerUp={() => {
            vivo.current.arraste = null
            setArrastando(false)
          }}
          onMouseMove={(ev) => {
            const a = vivo.current.arraste
            if (a && ev.buttons === 1) {
              const dx = ev.clientX - a.x
              const dy = ev.clientY - a.y
              // só vira arraste depois de 4 px, para um clique com a mão tremendo continuar sendo clique
              if (vivo.current.arrastou || Math.hypot(dx, dy) > 4) {
                if (!vivo.current.arrastou) {
                  setArrastando(true)
                  // arrastar o mapa tira a câmera de "seguir viatura"
                  useSimulacaoStore.getState().setSeguindo(null)
                }
                vivo.current.arrastou = true
                if (malha) useSimulacaoStore.getState().setVisao(arrastar(a.visao, dx, dy, vivo.current.enq.escala, malha))
                return
              }
            }
            const no = noDoEvento(ev)
            vivo.current.hoverNo = no
            const { x, y } = pontoDoEvento(ev)
            const inst = (malha ? instalacaoEm(malha, x, y) : null)
            vivo.current.hoverInstalacao = inst?.id ?? null
            const clicavel = !!no || !!inst
            if (clicavel !== sobreNo) setSobreNo(clicavel)
          }}
          onMouseLeave={() => {
            vivo.current.hoverNo = null
            vivo.current.hoverInstalacao = null
            vivo.current.arraste = null
            setSobreNo(false)
            setArrastando(false)
          }}
          onClick={(ev) => {
            if (vivo.current.arrastou) {
              vivo.current.arrastou = false
              return
            }
            const no = noDoEvento(ev)
            // no modo de clique registra a emergência ou a falha; fora dele só mostra os detalhes do cruzamento
            if (vivo.current.modoClique) {
              if (no) aoClicarCruzamento?.(no)
            } else {
              // prioridade: viatura; cruzamento bem perto (até 30 px); prédio público; cruzamento (até 60 px)
              const viatura = viaturaDoEvento(ev)
              const { x, y } = pontoDoEvento(ev)
              const inst = (malha ? instalacaoEm(malha, x, y) : null)
              const pertoDoNo = no && malha && Math.hypot(posCruzamento(no, malha).x - x, posCruzamento(no, malha).y - y) <= 30
              if (viatura) setViaturaSelecionada(viatura === useSimulacaoStore.getState().viaturaSelecionada ? null : viatura)
              else if (pertoDoNo || !inst) setSelecionado(no)
              else setInstalacaoSelecionada(inst.id)
            }
          }}
        />
      </div>
    </div>
  )
}
