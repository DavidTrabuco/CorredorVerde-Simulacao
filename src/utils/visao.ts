import { B } from '../share/constantes'
import { dimensoes, type Grade, type Ponto } from './geometria'

// O que a câmera do mapa mostra: o zoom e o ponto do mapa (em px do mapa) que fica no centro do canvas.
export interface Visao {
  zoom: number
  cx: number
  cy: number
}

// Escala de jogo: em 100% a largura do mapa mostra cerca de 5,5 quadras, seja qual for a tela. A cidade é
// vista de perto e explorada arrastando, pelo minimapa ou pelos botões "Ajustar" (malha inteira) e "Visão geral".
export const QUADRAS_100 = 5.5
export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 1.8
// limite de baixo só para "Ajustar" e "Visão geral" em telas muito estreitas
const ZOOM_PISO = 0.15

// px CSS por px do mapa em 100%
export const escalaBase = (largura: number) => largura / (QUADRAS_100 * B)

// zoom que faz caber uma área (em px do mapa) no canvas
function zoomParaCaber(largura: number, altura: number, w: number, h: number) {
  return Math.min(largura / w, altura / h) / escalaBase(largura)
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// Tudo é medido a partir da malha que a API mandar (5×4 hoje; maior quando a API crescer).
// Começa em 100% (escala de jogo) no centro da malha.
export function visaoInicial(malha: Grade): Visao {
  const { W, H } = dimensoes(malha)
  return { zoom: 1, cx: W / 2, cy: H / 2 }
}

// Antes de a malha chegar, a câmera usa a malha padrão do contrato (5×4).
export const VISAO_INICIAL = visaoInicial({ colunas: 5, linhas: 4 })

// Mundo navegável: a malha no meio e mais meia malha de cidade de cada lado (o dobro de largura e de altura,
// 4× a área). O centro da câmera não sai desse retângulo.
export function mundo(malha: Grade) {
  const { W, H } = dimensoes(malha)
  return { x0: -W / 2, y0: -H / 2, x1: W * 1.5, y1: H * 1.5 }
}

// "Ajustar": a malha da simulação inteira, com meia quadra de margem para os complexos públicos em volta.
export function visaoAjustada(malha: Grade, largura: number, altura: number): Visao {
  const { W, H } = dimensoes(malha)
  return { zoom: zoomParaCaber(largura, altura, W + 120, H + 120), cx: W / 2, cy: H / 2 }
}

// "Visão geral": a cidade inteira de uma vez, com os prédios públicos como marcadores.
export function visaoGeral(malha: Grade, largura: number, altura: number): Visao {
  const m = mundo(malha)
  return { zoom: zoomParaCaber(largura, altura, m.x1 - m.x0, m.y1 - m.y0), cx: (m.x0 + m.x1) / 2, cy: (m.y0 + m.y1) / 2 }
}

export function ajustarVisao(v: Visao, malha: Grade): Visao {
  const m = mundo(malha)
  return {
    zoom: limitar(v.zoom, ZOOM_PISO, ZOOM_MAX),
    cx: limitar(v.cx, m.x0, m.x1),
    cy: limitar(v.cy, m.y0, m.y1),
  }
}

export function centralizarEm(v: Visao, p: Ponto, malha: Grade): Visao {
  return ajustarVisao({ ...v, cx: p.x, cy: p.y }, malha)
}

// Muda o zoom mantendo parado o ponto do mapa que está sob o cursor.
// `cursor` e `centroTela` em px CSS do canvas; `escala` é a escala atual (px CSS por px do mapa).
export function zoomEm(v: Visao, fator: number, cursor: Ponto, centroTela: Ponto, escala: number, malha: Grade): Visao {
  // na visão geral dá para aproximar; afastar além de ZOOM_MIN só pelo botão
  const zoom = limitar(v.zoom * fator, Math.min(v.zoom, ZOOM_MIN), ZOOM_MAX)
  const escalaNova = (escala / v.zoom) * zoom
  // ponto do mapa sob o cursor
  const mx = v.cx + (cursor.x - centroTela.x) / escala
  const my = v.cy + (cursor.y - centroTela.y) / escala
  return ajustarVisao({ zoom, cx: mx - (cursor.x - centroTela.x) / escalaNova, cy: my - (cursor.y - centroTela.y) / escalaNova }, malha)
}

// Arrastar o mapa: o centro anda ao contrário do mouse.
export function arrastar(v: Visao, dx: number, dy: number, escala: number, malha: Grade): Visao {
  return ajustarVisao({ ...v, cx: v.cx - dx / escala, cy: v.cy - dy / escala }, malha)
}
