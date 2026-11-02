import { useEffect, useRef, useState } from 'react'
import { B, M } from '../../share/constantes'
import { IconeBussola, IconeSeta } from '../../share/icones'
import { instalacoesDa } from '../../share/instalacoes'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { dimensoes, posCruzamento } from '../../utils/geometria'
import { centralizarEm, mundo } from '../../utils/visao'
import Cartao from '../Cartao'
import { COR_INSTALACAO } from '../Mapa/edificios'
import { areaVisivel, corViatura, enquadrar, lerCores } from '../Mapa/desenho'
import { MinimapaStyles as S } from './styles'

const LARGURA = 200
// o minimapa redesenha poucas vezes por segundo: é só para se localizar
const INTERVALO_MS = 300

// Mapa da cidade inteira, fora do mapa principal: área da simulação, prédios públicos, viaturas, ocorrências e
// o retângulo do que a câmera mostra. Clicar leva a câmera até o ponto.
export default function Minimapa() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const malha = useSimulacaoStore((s) => s.malha)
  const [aberto, setAberto] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !malha || !aberto) return
    const ctx = canvas.getContext('2d')!
    const m = mundo(malha)
    const escala = LARGURA / (m.x1 - m.x0)
    const altura = Math.round((m.y1 - m.y0) * escala)
    const dpr = window.devicePixelRatio || 1
    canvas.width = LARGURA * dpr
    canvas.height = altura * dpr
    canvas.style.height = `${altura}px`
    const { W, H } = dimensoes(malha)
    const tela = (x: number, y: number) => ({ x: (x - m.x0) * escala, y: (y - m.y0) * escala })

    const desenhar = () => {
      const st = useSimulacaoStore.getState()
      const cores = lerCores()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = cores['map-chao']
      ctx.fillRect(0, 0, LARGURA, altura)
      // ruas a cada quadra, no mundo inteiro
      ctx.strokeStyle = cores['map-asfalto']
      ctx.lineWidth = 1.2
      for (let x = M + Math.ceil((m.x0 - M) / B) * B; x <= m.x1; x += B) {
        ctx.beginPath()
        ctx.moveTo(tela(x, m.y0).x, 0)
        ctx.lineTo(tela(x, m.y0).x, altura)
        ctx.stroke()
      }
      for (let y = M + Math.ceil((m.y0 - M) / B) * B; y <= m.y1; y += B) {
        ctx.beginPath()
        ctx.moveTo(0, tela(m.x0, y).y)
        ctx.lineTo(LARGURA, tela(m.x0, y).y)
        ctx.stroke()
      }
      // área da simulação
      const a = tela(0, 0)
      ctx.strokeStyle = cores['accent']
      ctx.globalAlpha = 0.6
      ctx.strokeRect(a.x, a.y, W * escala, H * escala)
      ctx.globalAlpha = 1
      // prédios públicos
      for (const inst of instalacoesDa(malha)) {
        ctx.fillStyle = cores[COR_INSTALACAO[inst.tipo]]
        for (const [i, j] of inst.quadras) {
          const q = tela(M + (i - 1) * B + 18, M + (j - 1) * B + 18)
          ctx.fillRect(q.x, q.y, (B - 36) * escala, (B - 36) * escala)
        }
      }
      // ocorrências abertas e viaturas
      for (const o of st.estado?.ocorrencias ?? []) {
        if (o.status === 'Encerrada') continue
        const p = posCruzamento(o.cruzamento, malha)
        const q = tela(p.x, p.y)
        ctx.fillStyle = cores['ocorrencia']
        ctx.beginPath()
        ctx.arc(q.x, q.y, 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const v of st.estado?.viaturas ?? []) {
        const de = posCruzamento(v.cruzamento, malha)
        const para = v.indoPara ? posCruzamento(v.indoPara, malha) : de
        const q = tela((de.x + para.x) / 2, (de.y + para.y) / 2)
        ctx.fillStyle = corViatura(v.id, cores)
        ctx.strokeStyle = cores['surface']
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(q.x, q.y, 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
      // o que a câmera do mapa mostra
      const { w, h } = st.tamanhoMapa
      if (w && h) {
        const v = areaVisivel(enquadrar(w, h, st.visao))
        const p0 = tela(v.x0, v.y0)
        const p1 = tela(v.x1, v.y1)
        ctx.strokeStyle = cores['fg']
        ctx.lineWidth = 1.5
        ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y)
      }
    }
    desenhar()
    const timer = setInterval(desenhar, INTERVALO_MS)
    return () => clearInterval(timer)
  }, [malha, aberto])

  const aoClicar = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    if (!malha) return
    const r = ev.currentTarget.getBoundingClientRect()
    const m = mundo(malha)
    const escala = r.width / (m.x1 - m.x0)
    const st = useSimulacaoStore.getState()
    st.setVisao(centralizarEm(st.visao, { x: m.x0 + (ev.clientX - r.left) / escala, y: m.y0 + (ev.clientY - r.top) / escala }, malha))
  }

  return (
    <Cartao
      titulo="Mapa da cidade"
      icone={<IconeBussola />}
      extra={
        <button
          type="button"
          className={S.recolher}
          aria-expanded={aberto}
          aria-label={aberto ? 'Recolher o minimapa' : 'Abrir o minimapa'}
          title={aberto ? 'Recolher o minimapa' : 'Abrir o minimapa'}
          onClick={() => setAberto(!aberto)}
        >
          <IconeSeta className={aberto ? S.setaAberta : S.seta} />
        </button>
      }
    >
      {aberto && (
        <canvas
          ref={canvasRef}
          className={S.canvas}
          role="img"
          aria-label="Minimapa da cidade com prédios públicos, viaturas, ocorrências e a área que o mapa mostra (clique para levar a câmera até lá)"
          title="Clique para levar a câmera até lá"
          onClick={aoClicar}
        />
      )}
    </Cartao>
  )
}
