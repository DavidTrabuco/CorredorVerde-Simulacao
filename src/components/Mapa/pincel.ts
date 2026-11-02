// Ferramentas de desenho usadas pela cidade, pelos edifícios e pela cena.

export type Cores = Record<string, string>

// Retângulo em px do mapa.
export interface Ret {
  x: number
  y: number
  w: number
  h: number
}

export const FONTE_DISPLAY = '"Plus Jakarta Sans", "Inter", system-ui, sans-serif'
export const FONTE_MONO = '"JetBrains Mono", ui-monospace, monospace'

export function gerador(semente: number) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

// Sombra sem desfoque, deslocada para baixo e à direita: barata de desenhar e dá volume.
export function sombra(g: CanvasRenderingContext2D, cores: Cores) {
  g.shadowColor = cores['map-sombra']
  g.shadowBlur = 0
  g.shadowOffsetX = 1.5
  g.shadowOffsetY = 2
}

export function semSombra(g: CanvasRenderingContext2D) {
  g.shadowColor = 'transparent'
  g.shadowBlur = 0
  g.shadowOffsetX = 0
  g.shadowOffsetY = 0
}

export function comAlfa(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`
}

export function ret(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, raio: number, cor: string) {
  g.fillStyle = cor
  g.beginPath()
  g.roundRect(x, y, w, h, raio)
  g.fill()
}

// Luz ambiente: degradê radial que some aos poucos, sem borda. `cor` já vem com a transparência do token.
export function luz(g: CanvasRenderingContext2D, x: number, y: number, raio: number, cor: string) {
  const gr = g.createRadialGradient(x, y, 0, x, y, raio)
  gr.addColorStop(0, cor)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr
  g.beginPath()
  g.arc(x, y, raio, 0, Math.PI * 2)
  g.fill()
}

// Árvore com volume: sombra no chão, copa e um lado iluminado de cima.
export function arvore(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, cores: Cores) {
  g.fillStyle = cores['map-sombra']
  g.beginPath()
  g.ellipse(cx + r * 0.45, cy + r * 0.55, r * 0.95, r * 0.8, 0, 0, Math.PI * 2)
  g.fill()
  ret(g, cx - r, cy - r, r * 2, r * 2, r, cores['map-arvore'])
  ret(g, cx - r * 0.85, cy - r * 0.85, r * 1.2, r * 1.2, r * 0.6, cores['map-arvore-2'])
  // brilho pequeno no topo da copa
  g.fillStyle = cores['map-realce']
  g.beginPath()
  g.arc(cx - r * 0.4, cy - r * 0.45, r * 0.22, 0, Math.PI * 2)
  g.fill()
}

export const CORES_CARROS = ['#8796a1', '#c3ab72', '#6c8cae', '#ad7767', '#79977a', '#cfd3d7', '#5c6670']

// Carro parado visto de cima (vertical quando h > w).
export function carroParado(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string) {
  ret(g, x, y, w, h, 2.2, cor)
  g.fillStyle = 'rgba(20,30,40,.45)'
  if (h > w) g.fillRect(x + 1, y + h * 0.3, w - 2, h * 0.22)
  else g.fillRect(x + w * 0.3, y + 1, w * 0.22, h - 2)
}

// Janelas acesas na fachada (a faixa de baixo do prédio). Só aparecem no tema escuro: o token é
// transparente no claro. Nem todas acendem.
export function janelas(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rnd: () => number, cores: Cores, alt = 4) {
  g.fillStyle = cores['map-janela']
  const linha = y + h - alt * 0.7
  for (let k = x + 3; k < x + w - 3; k += 4.5) if (rnd() < 0.4) g.fillRect(k, linha, 1.8, Math.max(1, alt * 0.35))
}

// Volume de um prédio visto de cima (2.5D): sombra projetada no chão, fachada escura embaixo e telhado
// em cima, com borda clara. `alt` é a altura aparente em px do mapa.
export function volume(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alt: number, telhado: string, cores: Cores) {
  g.fillStyle = cores['map-sombra']
  g.beginPath()
  g.roundRect(x + alt * 0.55, y + alt * 0.35, w, h, 3)
  g.fill()
  ret(g, x, y + h - alt, w, alt, 2, cores['map-fachada'])
  ret(g, x, y, w, h - alt, 3, telhado)
  g.strokeStyle = cores['map-realce']
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(x + 2, y + 0.5)
  g.lineTo(x + w - 2, y + 0.5)
  g.stroke()
}

// Um prédio comum visto de cima: volume com altura sorteada, platibanda, às vezes equipamento e janelas.
export function predio(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rnd: () => number,
  cores: Cores,
  base = rnd() < 0.5 ? cores['map-predio'] : cores['map-predio-2'],
) {
  const alt = Math.min(h * 0.35, 2.5 + rnd() * 6)
  volume(g, x, y, w, h, alt, base, cores)
  const th = h - alt
  if (w > 16 && th > 14) {
    ret(g, x + 3.5, y + 3.5, w - 7, th - 7, 2, cores['map-telhado'])
    if (rnd() < 0.55) {
      g.fillStyle = base
      g.fillRect(x + 6 + rnd() * (w - 18), y + 6 + rnd() * Math.max(1, th - 16), 6, 4)
    }
  }
  janelas(g, x, y, w, h, rnd, cores, alt)
}

// Vagas pintadas e alguns carros: usado por estacionamentos da cidade e dos prédios públicos.
export function estacionamento(g: CanvasRenderingContext2D, r: Ret, vagas: number, ocupacao: number, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 4, cores['map-cruz'])
  const vw = r.w / vagas
  const filas = r.h >= 44 ? [r.y + 3, r.y + r.h - 21] : [r.y + (r.h - 18) / 2]
  g.strokeStyle = cores['map-faixa']
  g.globalAlpha = 0.45
  g.lineWidth = 0.8
  for (const fila of filas) {
    for (let k = 1; k < vagas; k++) {
      g.beginPath()
      g.moveTo(r.x + k * vw, fila)
      g.lineTo(r.x + k * vw, fila + 18)
      g.stroke()
    }
  }
  g.globalAlpha = 1
  for (const fila of filas) {
    for (let k = 0; k < vagas; k++) {
      if (rnd() > ocupacao) continue
      carroParado(g, r.x + k * vw + vw / 2 - 4, fila + 1, 8, 15, CORES_CARROS[Math.floor(rnd() * CORES_CARROS.length)])
    }
  }
}

// Faixa de pedestres atravessando uma rua. `naVertical`: a rua é vertical (as listras ficam na vertical,
// lado a lado na direção de quem atravessa).
export function faixaPedestres(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, naVertical: boolean, cores: Cores) {
  // mesmo desenho das faixas dos cruzamentos: listras de 3 a cada 6
  g.fillStyle = cores['map-faixa']
  g.globalAlpha = 0.55
  if (naVertical) for (let k = x + 3; k < x + w - 2; k += 6) g.fillRect(k, y, 3, h)
  else for (let k = y + 3; k < y + h - 2; k += 6) g.fillRect(x, k, w, 3)
  g.globalAlpha = 1
}

// É noite (tema escuro)? Os tokens de luz são transparentes de dia.
export const ehNoite = (cores: Cores) => !(cores['map-poste-luz'] ?? '').includes('/ 0%')
