import type { TipoViatura } from '../../share/tipos'
import type { CarroComum } from '../../utils/movimento'
import { posicaoNaFaixa } from '../../utils/movimento'
import type { Ponto } from '../../utils/geometria'

// Veículos vistos de cima, desenhados com o "para-frente" no +x. Os tamanhos são os da referência
// (validados com o grupo); aqui só entram detalhes: rodas, vidros, faróis e lanternas.

// Rodas simplificadas, um pouco para fora da carroceria.
function rodas(ctx: CanvasRenderingContext2D, len: number, lar: number) {
  ctx.fillStyle = '#0d1117'
  const dx = len / 2 - 4.5
  for (const x of [-dx - 2, dx - 1]) for (const y of [-lar / 2 - 0.6, lar / 2 - 1]) ctx.fillRect(x, y, 3.2, 1.6)
}

// Faróis (frente) e lanternas (traseira); à noite os faróis projetam uma luz suave à frente.
function luzes(ctx: CanvasRenderingContext2D, len: number, lar: number, noite: boolean) {
  if (noite) {
    const gr = ctx.createLinearGradient(len / 2, 0, len / 2 + 22, 0)
    gr.addColorStop(0, 'rgba(255,236,190,.28)')
    gr.addColorStop(1, 'rgba(255,236,190,0)')
    ctx.fillStyle = gr
    ctx.beginPath()
    ctx.moveTo(len / 2, -lar / 2 + 1.5)
    ctx.lineTo(len / 2 + 22, -lar / 2 - 4)
    ctx.lineTo(len / 2 + 22, lar / 2 + 4)
    ctx.lineTo(len / 2, lar / 2 - 1.5)
    ctx.fill()
  }
  ctx.fillStyle = '#fff4cf'
  ctx.fillRect(len / 2 - 1.2, -lar / 2 + 1, 1.2, 2)
  ctx.fillRect(len / 2 - 1.2, lar / 2 - 3, 1.2, 2)
  ctx.fillStyle = '#e0323a'
  ctx.fillRect(-len / 2, -lar / 2 + 1, 1, 1.8)
  ctx.fillRect(-len / 2, lar / 2 - 2.8, 1, 1.8)
}

// Ônibus urbano: comprido, com fileira de janelas e equipamento no teto.
function desenharOnibus(ctx: CanvasRenderingContext2D, cor: string, noite: boolean) {
  const len = 30
  const lar = 11
  ctx.fillStyle = 'rgba(0,0,0,.24)'
  ctx.beginPath()
  ctx.roundRect(-len / 2 + 1.5, -lar / 2 + 2, len, lar, 2.5)
  ctx.fill()
  rodas(ctx, len, lar)
  ctx.fillStyle = cor
  ctx.beginPath()
  ctx.roundRect(-len / 2, -lar / 2, len, lar, 2.5)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,.5)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = 'rgba(20,30,40,.55)'
  for (let x = -len / 2 + 3; x < len / 2 - 5; x += 4) {
    ctx.fillRect(x, -lar / 2 + 0.8, 3, 1.4)
    ctx.fillRect(x, lar / 2 - 2.2, 3, 1.4)
  }
  ctx.fillRect(len / 2 - 3.5, -lar / 2 + 1.5, 2.5, lar - 3)
  ctx.fillStyle = 'rgba(255,255,255,.25)'
  ctx.fillRect(-6, -2, 8, 4)
  luzes(ctx, len, lar, noite)
}

export function desenharCarroComum(ctx: CanvasRenderingContext2D, c: CarroComum, noite = false) {
  const p = posicaoNaFaixa(c)
  if (c.onibus) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(c.eixo === 'H' ? (c.sentido > 0 ? 0 : Math.PI) : c.sentido > 0 ? Math.PI / 2 : -Math.PI / 2)
    desenharOnibus(ctx, c.cor, noite)
    ctx.restore()
    return
  }
  const len = 17
  const lar = 10
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(c.eixo === 'H' ? (c.sentido > 0 ? 0 : Math.PI) : c.sentido > 0 ? Math.PI / 2 : -Math.PI / 2)
  ctx.fillStyle = 'rgba(0,0,0,.22)'
  ctx.beginPath()
  ctx.roundRect(-len / 2 + 1, -lar / 2 + 1.5, len, lar, 3)
  ctx.fill()
  rodas(ctx, len, lar)
  ctx.fillStyle = c.cor
  ctx.beginPath()
  ctx.roundRect(-len / 2, -lar / 2, len, lar, 3)
  ctx.fill()
  // contorno duplo (escuro por fora, claro por dentro): o carro se destaca do asfalto nos dois temas
  ctx.strokeStyle = 'rgba(0,0,0,.55)'
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,.3)'
  ctx.lineWidth = 0.5
  ctx.stroke()
  // para-brisa, teto e vidro traseiro
  ctx.fillStyle = 'rgba(20,30,40,.6)'
  ctx.fillRect(1.5, -3.6, 3, 7.2)
  ctx.fillRect(-5.5, -3.4, 2, 6.8)
  ctx.fillStyle = 'rgba(255,255,255,.12)'
  ctx.fillRect(-3.5, -3.2, 5, 6.4)
  luzes(ctx, len, lar, noite)
  ctx.restore()
}

export interface ViaturaDesenho {
  tipo: TipoViatura
  pos: Ponto
  ang: number
  emergencia: boolean
  corAnel: string
}

// Ambulância branca com faixa vermelha, caminhão vermelho com escada, viatura policial branca e preta;
// giroflex pisca só em emergência ou atendimento.
export function desenharViatura(ctx: CanvasRenderingContext2D, v: ViaturaDesenho, tAnim: number, tReal: number, reduzMov: boolean, noite = false) {
  const { pos: p, emergencia: emerg } = v
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(v.ang)
  const len = v.tipo === 'Bombeiros' ? 26 : 23
  const lar = 12
  ctx.fillStyle = 'rgba(0,0,0,.28)'
  ctx.beginPath()
  ctx.roundRect(-len / 2 + 1.5, -lar / 2 + 2, len, lar, 3)
  ctx.fill()
  rodas(ctx, len, lar)
  ctx.fillStyle = v.tipo === 'Bombeiros' ? '#c8321f' : v.tipo === 'Policia' ? '#eef1f5' : '#f4f6f7'
  ctx.beginPath()
  ctx.roundRect(-len / 2, -lar / 2, len, lar, 3)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,.35)'
  ctx.lineWidth = 0.8
  ctx.stroke()
  if (v.tipo === 'Ambulancia') {
    ctx.fillStyle = '#d0263f'
    ctx.fillRect(-len / 2 + 2, -1.3, len - 9, 2.6)
  } else if (v.tipo === 'Policia') {
    // viatura policial: capô e porta-malas escuros
    ctx.fillStyle = '#1d2733'
    ctx.fillRect(-len / 2 + 1, -lar / 2 + 1, 5, lar - 2)
    ctx.fillRect(len / 2 - 4, -lar / 2 + 1, 3, lar - 2)
  } else {
    // caminhão dos bombeiros: escada no teto (dois trilhos e degraus)
    ctx.fillStyle = '#e9e9e9'
    ctx.fillRect(-len / 2 + 3, -lar / 2 + 2, len - 10, 1.4)
    ctx.fillRect(-len / 2 + 3, lar / 2 - 3.4, len - 10, 1.4)
    for (let x = -len / 2 + 5; x < len / 2 - 8; x += 3) ctx.fillRect(x, -lar / 2 + 3.4, 0.8, lar - 6.8)
  }
  ctx.fillStyle = 'rgba(25,40,55,.75)'
  ctx.fillRect(len / 2 - 6, -lar / 2 + 1.5, 3.5, lar - 3)
  luzes(ctx, len, lar, noite)
  const pisca = Math.floor(tAnim * 6) % 2 === 0
  ctx.fillStyle = emerg ? (pisca ? '#2f7bff' : '#ff3341') : '#7f8a92'
  ctx.fillRect(-1, -lar / 2 + 1, 3, lar / 2 - 1)
  ctx.fillStyle = emerg ? (pisca ? '#ff3341' : '#2f7bff') : '#7f8a92'
  ctx.fillRect(-1, 0, 3, lar / 2 - 1)
  ctx.restore()

  if (emerg && !reduzMov) {
    ctx.strokeStyle = v.corAnel
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(tReal * 6)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, 17, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}
