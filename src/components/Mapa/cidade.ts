import { B, M, RW } from '../../share/constantes'
import { instalacaoDaQuadra } from '../../share/instalacoes'
import type { Malha } from '../../share/tipos'
import { arvore, CORES_CARROS, carroParado, estacionamento, faixaPedestres, gerador, luz, predio, ret, sombra, semSombra, volume, type Cores, type Ret } from './pincel'

// Bairros da cidade. O centro é a área da simulação (C1–C20); os outros ficam em volta e são só cenário.
export type Distrito = 'centro' | 'residencial' | 'comercial' | 'industrial' | 'civico' | 'parque'

const PESOS: Record<'oeste' | 'leste' | 'norte' | 'sul', [Distrito, number][]> = {
  oeste: [['residencial', 0.55], ['parque', 0.2], ['comercial', 0.15], ['civico', 0.1]],
  leste: [['industrial', 0.55], ['comercial', 0.25], ['parque', 0.1], ['residencial', 0.1]],
  norte: [['comercial', 0.5], ['civico', 0.25], ['residencial', 0.15], ['parque', 0.1]],
  sul: [['residencial', 0.5], ['parque', 0.25], ['comercial', 0.15], ['industrial', 0.1]],
}

function hash(a: number, b: number) {
  return ((((a + 97) * 73856093) ^ ((b + 97) * 19349663)) >>> 0) % 2147483646 + 1
}

// Semente fixa por quadra: a cidade é sempre a mesma, não importa qual pedaço foi desenhado primeiro.
export function sementeDaQuadra(i: number, j: number) {
  return hash(i, j)
}

// Bairro da quadra (i, j). Fora da grade, a cidade é dividida em "manchas" de 3×2 quadras, cada uma com um
// bairro sorteado com pesos que dependem do lado (oeste mais residencial, leste mais industrial...).
export function distritoDe(i: number, j: number, colunas: number, linhas: number): Distrito {
  if (i >= 0 && i <= colunas && j >= 0 && j <= linhas) return 'centro'
  const lado = i < 0 ? 'oeste' : i > colunas ? 'leste' : j < 0 ? 'norte' : 'sul'
  const sorteio = gerador(hash(Math.floor((i + 60) / 3), Math.floor((j + 60) / 2)))()
  let acc = 0
  for (const [d, p] of PESOS[lado]) {
    acc += p
    if (sorteio < acc) return d
  }
  return PESOS[lado][0][0]
}

// ---------- biblioteca de quadras ----------

function parque(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores, comLago: boolean) {
  ret(g, r.x, r.y, r.w, r.h, 6, cores['map-parque'])
  if (comLago) {
    g.fillStyle = cores['map-agua']
    g.beginPath()
    g.ellipse(r.x + r.w * 0.58, r.y + r.h * 0.55, r.w * 0.22, r.h * 0.15, 0.3, 0, Math.PI * 2)
    g.fill()
  }
  // trilhas de caminhada
  g.strokeStyle = cores['map-calcada']
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(r.x, r.y + r.h * 0.78)
  g.quadraticCurveTo(r.x + r.w * 0.45, r.y + r.h * (0.25 + rnd() * 0.5), r.x + r.w, r.y + r.h * 0.28)
  if (rnd() < 0.6) {
    g.moveTo(r.x + r.w * 0.3, r.y)
    g.quadraticCurveTo(r.x + r.w * 0.35, r.y + r.h * 0.5, r.x + r.w * 0.2, r.y + r.h)
  }
  g.stroke()
  // bancos ao lado das trilhas
  g.fillStyle = cores['map-concreto']
  for (let k = 0; k < 3; k++) g.fillRect(r.x + r.w * (0.2 + k * 0.25), r.y + r.h * (0.62 - k * 0.12) + 4, 6, 2)
  const n = Math.max(5, Math.floor((r.w * r.h) / 800))
  for (let k = 0; k < n; k++) {
    const raio = 3.5 + rnd() * 6
    arvore(g, r.x + raio + rnd() * (r.w - 2 * raio), r.y + raio + rnd() * (r.h - 2 * raio), raio, cores)
  }
  // luzes baixas das trilhas
  luz(g, r.x + r.w * 0.45, r.y + r.h * 0.5, 9, cores['map-luz-quente'])
}

function praca(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 6, cores['map-telhado'])
  g.strokeStyle = cores['map-calcada']
  g.lineWidth = 4
  g.beginPath()
  g.moveTo(r.x, r.y)
  g.lineTo(r.x + r.w, r.y + r.h)
  g.moveTo(r.x + r.w, r.y)
  g.lineTo(r.x, r.y + r.h)
  g.stroke()
  const m = Math.min(r.w, r.h)
  ret(g, r.x + r.w / 2 - m * 0.2, r.y + r.h / 2 - m * 0.2, m * 0.4, m * 0.4, m * 0.2, cores['map-parque'])
  // fonte: espelho d'água com borda e jatos
  ret(g, r.x + r.w / 2 - m * 0.12, r.y + r.h / 2 - m * 0.12, m * 0.24, m * 0.24, m * 0.12, cores['map-concreto'])
  ret(g, r.x + r.w / 2 - m * 0.1, r.y + r.h / 2 - m * 0.1, m * 0.2, m * 0.2, m * 0.1, cores['map-agua'])
  g.fillStyle = cores['map-realce']
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    g.fillRect(r.x + r.w / 2 + Math.cos(a) * m * 0.05 - 0.6, r.y + r.h / 2 + Math.sin(a) * m * 0.05 - 0.6, 1.2, 1.2)
  }
  for (const [cx, cy] of [
    [r.x + 11, r.y + 11],
    [r.x + r.w - 11, r.y + 11],
    [r.x + 11, r.y + r.h - 11],
    [r.x + r.w - 11, r.y + r.h - 11],
  ]) {
    arvore(g, cx, cy, 5.5 + rnd() * 3, cores)
  }
  luz(g, r.x + r.w / 2, r.y + r.h / 2, 12, cores['map-luz-quente'])
}

// Casa com telhado de duas águas: metade iluminada, metade na sombra, cumeeira no meio e janela acesa.
function casa(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rnd: () => number, cores: Cores) {
  const alt = 2.5 + rnd() * 2
  const telha = rnd() < 0.6 ? cores['map-telha'] : cores['map-predio-2']
  volume(g, x, y, w, h, alt, telha, cores)
  const th = h - alt
  g.fillStyle = 'rgba(0,0,0,.18)'
  g.fillRect(x, y + th / 2, w, th / 2)
  g.strokeStyle = cores['map-realce']
  g.lineWidth = 0.8
  g.beginPath()
  g.moveTo(x + 1.5, y + th / 2)
  g.lineTo(x + w - 1.5, y + th / 2)
  g.stroke()
  if (rnd() < 0.5) {
    g.fillStyle = cores['map-janela']
    g.fillRect(x + w / 2 - 1, y + h - alt * 0.7, 2, alt * 0.4)
  }
}

// Casas pequenas com quintal, nos dois lados da quadra (bairro residencial).
function casas(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 5, cores['map-parque'])
  const n = 4
  const w = (r.w - (n - 1) * 4) / n
  for (let k = 0; k < n; k++) {
    for (const lado of [0, 1]) {
      if (rnd() < 0.12) continue
      const h = 18 + rnd() * 10
      const y = lado ? r.y + r.h - h - 2 : r.y + 2
      casa(g, r.x + k * (w + 4), y, w, h, rnd, cores)
      if (rnd() < 0.5) arvore(g, r.x + k * (w + 4) + w / 2, lado ? y - 9 : y + h + 9, 3.5 + rnd() * 2, cores)
    }
  }
  // rua interna com carros parados
  ret(g, r.x + 2, r.y + r.h / 2 - 5, r.w - 4, 10, 3, cores['map-cruz'])
  if (rnd() < 0.7) carroParado(g, r.x + 10 + rnd() * 50, r.y + r.h / 2 - 3.5, 14, 7, CORES_CARROS[Math.floor(rnd() * CORES_CARROS.length)])
}

// Prédio grande com pátio interno.
function predioComPatio(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  predio(g, r.x + 2, r.y + 2, r.w - 4, r.h - 4, rnd, cores)
  ret(g, r.x + r.w * 0.3, r.y + r.h * 0.3, r.w * 0.4, r.h * 0.4, 3, cores['map-parque'])
  arvore(g, r.x + r.w / 2, r.y + r.h / 2, 6, cores)
}

// Prédio em L, um anexo e um estacionamento lateral.
function predioEmL(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  const a = r.w * (0.55 + rnd() * 0.1)
  predio(g, r.x, r.y, a, r.h * 0.42, rnd, cores)
  predio(g, r.x, r.y + r.h * 0.42 + 4, r.w * 0.38, r.h * 0.58 - 4, rnd, cores)
  estacionamento(g, { x: r.x + r.w * 0.42, y: r.y + r.h * 0.5, w: r.w * 0.58, h: r.h * 0.5 }, 5, 0.6, rnd, cores)
  predio(g, r.x + a + 5, r.y, r.w - a - 5, r.h * 0.42, rnd, cores)
}

// Grade 2×2 de prédios de tamanhos diferentes.
function grade(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  const gw = (r.w - 6) / 2
  const gh = (r.h - 6) / 2
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      if (rnd() < 0.12) continue
      const enc = rnd() * 10
      predio(g, r.x + a * (gw + 6) + enc / 2, r.y + b * (gh + 6) + enc / 2, gw - enc, gh - enc, rnd, cores)
    }
  }
}

// Telhado em faixas: prédios comerciais altos.
function telhadoSegmentado(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rnd: () => number, cores: Cores) {
  predio(g, x, y, w, h, rnd, cores, cores['map-predio-2'])
  g.strokeStyle = cores['map-predio']
  g.lineWidth = 1
  for (let k = y + 8; k < y + h - 6; k += 8) {
    g.beginPath()
    g.moveTo(x + 5, k)
    g.lineTo(x + w - 5, k)
    g.stroke()
  }
}

// Duas torres comerciais com telhado em faixas e uma loja térrea.
function torres(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  telhadoSegmentado(g, r.x, r.y, r.w * 0.52, r.h * 0.6, rnd, cores)
  telhadoSegmentado(g, r.x + r.w * 0.58, r.y + r.h * 0.3, r.w * 0.42, r.h * 0.7, rnd, cores)
  predio(g, r.x, r.y + r.h * 0.66, r.w * 0.52, r.h * 0.34, rnd, cores)
  // marquise da entrada da torre maior, com luz branca
  ret(g, r.x + r.w * 0.66, r.y + r.h - 5, r.w * 0.26, 5, 1.5, cores['map-concreto'])
  g.fillStyle = cores['accent']
  g.fillRect(r.x + r.w * 0.66, r.y + r.h - 1.5, r.w * 0.26, 1.5)
  luz(g, r.x + r.w * 0.79, r.y + r.h, 11, cores['map-luz-branca'])
}

// Centro comercial: um bloco grande com claraboias e estacionamento na frente.
function centroComercial(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  const h = r.h * 0.55
  predio(g, r.x, r.y, r.w, h, rnd, cores, cores['map-concreto'])
  g.fillStyle = cores['map-agua']
  for (let k = 0; k < 4; k++) g.fillRect(r.x + 12 + k * ((r.w - 24) / 4), r.y + h / 2 - 4, (r.w - 24) / 4 - 6, 8)
  estacionamento(g, { x: r.x, y: r.y + h + 4, w: r.w, h: r.h - h - 4 }, 7, 0.55, rnd, cores)
  luz(g, r.x + r.w * 0.25, r.y + h + 18, 12, cores['map-luz-branca'])
  luz(g, r.x + r.w * 0.75, r.y + h + 18, 12, cores['map-luz-branca'])
}

// Galpões compridos com cumeeira, portas de carga e pátio.
function galpoes(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 4, cores['map-cruz'])
  const n = rnd() < 0.5 ? 2 : 3
  const h = (r.h - (n - 1) * 8) / n
  for (let k = 0; k < n; k++) {
    const y = r.y + k * (h + 8)
    const w = r.w * (0.7 + rnd() * 0.25)
    sombra(g, cores)
    ret(g, r.x, y, w, h, 2, cores['map-galpao'])
    semSombra(g)
    // cumeeira e telhas
    g.strokeStyle = cores['map-concreto']
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(r.x + 3, y + h / 2)
    g.lineTo(r.x + w - 3, y + h / 2)
    g.stroke()
    g.globalAlpha = 0.5
    for (let t = r.x + 8; t < r.x + w - 4; t += 8) {
      g.beginPath()
      g.moveTo(t, y + 2)
      g.lineTo(t, y + h - 2)
      g.stroke()
    }
    g.globalAlpha = 1
    // portas de carga na ponta
    g.fillStyle = cores['map-amarelo-seg']
    for (let p = y + 4; p < y + h - 6; p += 8) g.fillRect(r.x + w, p, 2.5, 5)
    luz(g, r.x + w + 4, y + h / 2, 8, cores['map-luz-quente'])
  }
}

// Pátio de caminhões: vagas compridas e carretas paradas.
function patioCaminhoes(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 4, cores['map-cruz'])
  predio(g, r.x + 4, r.y + 4, r.w * 0.35, r.h * 0.3, rnd, cores, cores['map-galpao'])
  g.strokeStyle = cores['map-amarelo-seg']
  g.globalAlpha = 0.6
  g.lineWidth = 1
  const vagas = 6
  const vw = (r.w - 8) / vagas
  for (let k = 0; k <= vagas; k++) {
    g.beginPath()
    g.moveTo(r.x + 4 + k * vw, r.y + r.h * 0.42)
    g.lineTo(r.x + 4 + k * vw, r.y + r.h - 4)
    g.stroke()
  }
  g.globalAlpha = 1
  for (let k = 0; k < vagas; k++) {
    if (rnd() < 0.4) continue
    const x = r.x + 4 + k * vw + vw / 2 - 5
    ret(g, x, r.y + r.h * 0.45, 10, r.h * 0.4, 1.5, cores['map-concreto'])
    ret(g, x + 1, r.y + r.h * 0.45 - 7, 8, 7, 1.5, CORES_CARROS[Math.floor(rnd() * CORES_CARROS.length)])
  }
  luz(g, r.x + r.w * 0.7, r.y + r.h * 0.25, 12, cores['map-luz-quente'])
}

// Prédio administrativo com pátio cívico e mastros.
function administrativo(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 5, cores['map-telhado'])
  predio(g, r.x + 6, r.y + 6, r.w - 12, r.h * 0.38, rnd, cores, cores['map-concreto'])
  predio(g, r.x + 6, r.y + r.h * 0.38 + 6, r.w * 0.25, r.h * 0.62 - 12, rnd, cores, cores['map-concreto'])
  predio(g, r.x + r.w * 0.75 - 6, r.y + r.h * 0.38 + 6, r.w * 0.25, r.h * 0.62 - 12, rnd, cores, cores['map-concreto'])
  // pátio com canteiro e mastros
  ret(g, r.x + r.w * 0.38, r.y + r.h * 0.58, r.w * 0.24, r.h * 0.24, 4, cores['map-parque'])
  g.fillStyle = cores['map-faixa']
  for (let k = 0; k < 3; k++) g.fillRect(r.x + r.w * 0.42 + k * 7, r.y + r.h * 0.5, 1.5, 1.5)
  luz(g, r.x + r.w / 2, r.y + r.h * 0.5, 12, cores['map-luz-branca'])
}

// Posto de combustível: cobertura com bombas e carros abastecendo, loja de conveniência e placa de preços.
function posto(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 5, cores['map-cruz'])
  // pista de entrada e saída virada para a rua de baixo
  g.fillStyle = cores['map-calcada']
  g.fillRect(r.x + 4, r.y + r.h - 6, 18, 6)
  g.fillRect(r.x + r.w - 22, r.y + r.h - 6, 18, 6)
  // bombas em duas ilhas e carros abastecendo
  for (const [ix, cor] of [
    [r.x + r.w * 0.3, CORES_CARROS[Math.floor(rnd() * CORES_CARROS.length)]],
    [r.x + r.w * 0.62, CORES_CARROS[Math.floor(rnd() * CORES_CARROS.length)]],
  ] as [number, string][]) {
    ret(g, ix - 2, r.y + r.h * 0.42, 4, 16, 1, cores['map-concreto'])
    if (rnd() < 0.8) carroParado(g, ix + 4, r.y + r.h * 0.4, 8, 15, cor)
  }
  // cobertura (semitransparente para ver as bombas) com luz branca embaixo
  g.globalAlpha = 0.82
  volume(g, r.x + r.w * 0.16, r.y + r.h * 0.34, r.w * 0.66, r.h * 0.34, 3, cores['map-especial'], cores)
  g.globalAlpha = 1
  g.fillStyle = '#d23a3a'
  g.fillRect(r.x + r.w * 0.16, r.y + r.h * 0.34, r.w * 0.66, 2)
  luz(g, r.x + r.w * 0.49, r.y + r.h * 0.5, 22, cores['map-luz-branca'])
  // loja de conveniência e placa de preços
  predio(g, r.x + 6, r.y + 6, r.w * 0.48, r.h * 0.22, rnd, cores, cores['map-predio-2'])
  ret(g, r.x + r.w - 14, r.y + 8, 6, 14, 1, '#d23a3a')
  g.fillStyle = '#fff4cf'
  for (let k = 0; k < 3; k++) g.fillRect(r.x + r.w - 13, r.y + 10 + k * 4, 4, 1.4)
}

// Supermercado: prédio grande com faixa colorida e luzes no telhado, estacionamento iluminado e carrinhos.
function supermercado(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  const h = r.h * 0.48
  predio(g, r.x + 2, r.y + 2, r.w - 4, h, rnd, cores, cores['map-concreto'])
  g.fillStyle = TOLDOS[Math.floor(rnd() * TOLDOS.length)]
  g.fillRect(r.x + 2, r.y + h - 4, r.w - 4, 3)
  g.fillStyle = cores['map-agua']
  for (let k = 0; k < 6; k++) g.fillRect(r.x + 10 + k * ((r.w - 20) / 6), r.y + 10, (r.w - 20) / 6 - 4, 4)
  estacionamento(g, { x: r.x, y: r.y + h + 6, w: r.w, h: r.h - h - 6 }, 7, 0.65, rnd, cores)
  // área dos carrinhos e postes do estacionamento
  ret(g, r.x + r.w * 0.45, r.y + h + 8, 10, 4, 1, cores['map-faixa'])
  for (const x of [0.2, 0.8]) {
    luz(g, r.x + r.w * x, r.y + h + (r.h - h) / 2, 14, cores['map-luz-branca'])
    ret(g, r.x + r.w * x - 1.3, r.y + h + (r.h - h) / 2 - 1.3, 2.6, 2.6, 1.3, cores['map-poste'])
  }
  luz(g, r.x + r.w / 2, r.y + h + 2, 12, cores['map-luz-quente'])
}

const TOLDOS = ['#b4473a', '#3f7a5a', '#c08a2e', '#3c6a9e', '#7a4f8a']

// Rua de lojas: fachadas estreitas com toldos coloridos viradas para a rua, fundos com estacionamento.
function lojas(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  const n = 5
  const w = (r.w - (n - 1) * 3) / n
  for (let k = 0; k < n; k++) {
    const x = r.x + k * (w + 3)
    const h = 26 + rnd() * 14
    predio(g, x, r.y, w, h, rnd, cores)
    g.fillStyle = TOLDOS[Math.floor(rnd() * TOLDOS.length)]
    g.fillRect(x + 1, r.y + h - 3, w - 2, 3)
    // vitrine acesa: luz quente na calçada em frente
    if (rnd() < 0.75) luz(g, x + w / 2, r.y + h + 3, 8, cores['map-luz-quente'])
  }
  estacionamento(g, { x: r.x, y: r.y + r.h * 0.56, w: r.w, h: r.h * 0.44 }, 6, 0.5, rnd, cores)
}

// Prédios de apartamentos: lâminas compridas com jardim e caminho entre elas.
function apartamentos(g: CanvasRenderingContext2D, r: Ret, rnd: () => number, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 5, cores['map-parque'])
  const vertical = rnd() < 0.5
  for (let k = 0; k < 2; k++) {
    if (vertical) predio(g, r.x + 6 + k * (r.w * 0.5), r.y + 6, r.w * 0.3, r.h - 12, rnd, cores)
    else predio(g, r.x + 6, r.y + 6 + k * (r.h * 0.5), r.w - 12, r.h * 0.3, rnd, cores)
  }
  g.fillStyle = cores['map-calcada']
  if (vertical) g.fillRect(r.x + r.w * 0.38, r.y, 5, r.h)
  else g.fillRect(r.x, r.y + r.h * 0.38, r.w, 5)
  for (let k = 0; k < 3; k++) {
    const t = 0.2 + k * 0.3
    if (vertical) arvore(g, r.x + r.w * 0.9, r.y + r.h * t, 4 + rnd() * 2, cores)
    else arvore(g, r.x + r.w * t, r.y + r.h * 0.9, 4 + rnd() * 2, cores)
  }
}

// ---------- complexos de duas quadras (cidade em volta) ----------
//
// Três tamanhos de construção na cidade: prédios pequenos dentro de uma quadra, instalações que ocupam uma
// quadra inteira e complexos que ocupam DUAS quadras vizinhas, com a rua passando no meio.

type TipoComplexo = 'shopping' | 'fabrica' | 'campus'

const COMPLEXO_DO_DISTRITO: Partial<Record<Distrito, TipoComplexo>> = {
  comercial: 'shopping',
  industrial: 'fabrica',
  civico: 'campus',
}

// Se a quadra (i, j) é parte de um complexo: as quadras se juntam em pares lado a lado (i par + i ímpar),
// só fora da área da simulação e só quando as duas são do mesmo bairro.
export function complexoDaQuadra(i: number, j: number, malha: Malha): { tipo: TipoComplexo; parte: 0 | 1 } | null {
  const { colunas, linhas } = malha
  const base = i - (((i % 2) + 2) % 2)
  const fora = (k: number) => k < 0 || k > colunas || j < 0 || j > linhas
  if (!fora(base) || !fora(base + 1)) return null
  // quadras de prédios públicos nunca entram num complexo comum
  const publicas = instalacaoDaQuadra(malha)
  if (publicas[`${base},${j}`] || publicas[`${base + 1},${j}`]) return null
  const d = distritoDe(base, j, colunas, linhas)
  const tipo = COMPLEXO_DO_DISTRITO[d]
  if (!tipo || distritoDe(base + 1, j, colunas, linhas) !== d) return null
  if (gerador(hash(base * 7 + 3, j * 5 + 1))() > 0.35) return null
  return { tipo, parte: i === base ? 0 : 1 }
}

// Piso comum das duas partes de um complexo: o mesmo tom nas duas, para ler como um terreno só.
function pisoComplexo(g: CanvasRenderingContext2D, r: Ret, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 6, cores['map-terreno'])
}

function shopping(g: CanvasRenderingContext2D, r: Ret, parte: 0 | 1, rnd: () => number, cores: Cores) {
  pisoComplexo(g, r, cores)
  if (parte === 0) {
    // loja âncora e galeria com claraboias, entrada virada para a outra parte
    predio(g, r.x + 4, r.y + 4, r.w - 8, r.h * 0.62, rnd, cores, cores['map-concreto'])
    g.fillStyle = cores['map-agua']
    for (let k = 0; k < 5; k++) g.fillRect(r.x + 12 + k * 16, r.y + r.h * 0.3, 10, 6)
    estacionamento(g, { x: r.x + 4, y: r.y + r.h * 0.68, w: r.w - 8, h: r.h * 0.32 - 4 }, 6, 0.6, rnd, cores)
    luz(g, r.x + r.w - 6, r.y + r.h * 0.35, 11, cores['map-luz-branca'])
  } else {
    // edifício-garagem (rampas) e cinema
    predio(g, r.x + 4, r.y + 4, r.w * 0.55, r.h - 8, rnd, cores, cores['map-cruz'])
    g.strokeStyle = cores['map-faixa']
    g.globalAlpha = 0.5
    for (let k = r.y + 14; k < r.y + r.h - 10; k += 12) {
      g.beginPath()
      g.moveTo(r.x + 10, k)
      g.lineTo(r.x + r.w * 0.55 - 4, k + 6)
      g.stroke()
    }
    g.globalAlpha = 1
    telhadoSegmentado(g, r.x + r.w * 0.62, r.y + 4, r.w * 0.38 - 4, r.h * 0.6, rnd, cores)
    luz(g, r.x + 6, r.y + r.h * 0.35, 11, cores['map-luz-branca'])
  }
}

function fabrica(g: CanvasRenderingContext2D, r: Ret, parte: 0 | 1, rnd: () => number, cores: Cores) {
  pisoComplexo(g, r, cores)
  if (parte === 0) {
    // galpão de produção com chaminés
    sombra(g, cores)
    ret(g, r.x + 4, r.y + 4, r.w - 8, r.h * 0.66, 2, cores['map-galpao'])
    semSombra(g)
    g.strokeStyle = cores['map-concreto']
    g.lineWidth = 1
    for (let k = r.x + 14; k < r.x + r.w - 8; k += 10) {
      g.beginPath()
      g.moveTo(k, r.y + 6)
      g.lineTo(k, r.y + r.h * 0.66 + 2)
      g.stroke()
    }
    for (const cx of [r.x + 22, r.x + 38]) {
      ret(g, cx - 5, r.y + r.h * 0.76 - 5, 10, 10, 5, cores['map-concreto'])
      ret(g, cx - 2.5, r.y + r.h * 0.76 - 2.5, 5, 5, 2.5, cores['map-predio'])
    }
    luz(g, r.x + r.w - 6, r.y + r.h * 0.4, 10, cores['map-luz-quente'])
  } else {
    // depósito e pátio de carga
    galpoes(g, { x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.h * 0.5 }, rnd, cores)
    patioCaminhoes(g, { x: r.x + 4, y: r.y + r.h * 0.56, w: r.w - 8, h: r.h * 0.44 - 4 }, rnd, cores)
  }
}

function campus(g: CanvasRenderingContext2D, r: Ret, parte: 0 | 1, rnd: () => number, cores: Cores) {
  pisoComplexo(g, r, cores)
  if (parte === 0) {
    administrativo(g, { x: r.x + 2, y: r.y + 2, w: r.w - 4, h: r.h - 4 }, rnd, cores)
  } else {
    // biblioteca e gramado central com caminhos
    ret(g, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 5, cores['map-parque'])
    predio(g, r.x + 8, r.y + 8, r.w * 0.5, r.h * 0.34, rnd, cores, cores['map-concreto'])
    g.strokeStyle = cores['map-calcada']
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(r.x, r.y + r.h * 0.62)
    g.lineTo(r.x + r.w, r.y + r.h * 0.62)
    g.moveTo(r.x + r.w * 0.6, r.y + r.h * 0.4)
    g.lineTo(r.x + r.w * 0.6, r.y + r.h)
    g.stroke()
    for (let k = 0; k < 5; k++) arvore(g, r.x + 14 + k * 16, r.y + r.h * 0.84, 4 + rnd() * 2, cores)
    luz(g, r.x + r.w * 0.6, r.y + r.h * 0.62, 10, cores['map-luz-quente'])
  }
}

// Faixa de pedestres entre as duas partes de cada complexo da cidade (desenhada depois das ruas).
export function ligacoesDaCidade(
  g: CanvasRenderingContext2D,
  cIni: number,
  cFim: number,
  lIni: number,
  lFim: number,
  malha: Malha,
  cores: Cores,
) {
  for (let i = cIni; i <= cFim + 1; i++) {
    for (let j = lIni; j <= lFim + 1; j++) {
      if (complexoDaQuadra(i, j, malha)?.parte !== 0) continue
      // rua vertical entre a quadra i e a i+1 (a rua i fica em M + i * B)
      const x = M + i * B - RW / 2
      const y = M + (j - 1) * B + RW / 2
      faixaPedestres(g, x, y + (B - RW) * 0.5, RW, 9, true, cores)
    }
  }
}

// Desenha a quadra comum (i, j) dentro de `r` (área útil, sem a calçada).
export function desenharQuadra(g: CanvasRenderingContext2D, i: number, j: number, r: Ret, distrito: Distrito, cores: Cores, malha: Malha) {
  const rnd = gerador(sementeDaQuadra(i, j))
  const complexo = complexoDaQuadra(i, j, malha)
  if (complexo) {
    // parte de um complexo de duas quadras: o desenho encosta na calçada do lado da outra parte
    const lado = complexo.parte === 0 ? { ...r, w: r.w + 4 } : { ...r, x: r.x - 4, w: r.w + 4 }
    if (complexo.tipo === 'shopping') shopping(g, lado, complexo.parte, rnd, cores)
    else if (complexo.tipo === 'fabrica') fabrica(g, lado, complexo.parte, rnd, cores)
    else campus(g, lado, complexo.parte, rnd, cores)
    return
  }
  const s = rnd()
  switch (distrito) {
    case 'residencial':
      if (s < 0.38) casas(g, r, rnd, cores)
      else if (s < 0.6) apartamentos(g, r, rnd, cores)
      else if (s < 0.72) grade(g, r, rnd, cores)
      else if (s < 0.82) predioEmL(g, r, rnd, cores)
      else if (s < 0.86) supermercado(g, r, rnd, cores)
      else if (s < 0.9) lojas(g, r, rnd, cores)
      else if (s < 0.95) parque(g, r, rnd, cores, false)
      else praca(g, r, rnd, cores)
      return
    case 'comercial':
      if (s < 0.06) posto(g, r, rnd, cores)
      else if (s < 0.14) supermercado(g, r, rnd, cores)
      else if (s < 0.3) lojas(g, r, rnd, cores)
      else if (s < 0.5) centroComercial(g, r, rnd, cores)
      else if (s < 0.82) torres(g, r, rnd, cores)
      else if (s < 0.92) estacionamento(g, r, 6, 0.7, rnd, cores)
      else praca(g, r, rnd, cores)
      return
    case 'industrial':
      if (s < 0.5) galpoes(g, r, rnd, cores)
      else if (s < 0.85) patioCaminhoes(g, r, rnd, cores)
      else estacionamento(g, r, 6, 0.4, rnd, cores)
      return
    case 'civico':
      if (s < 0.5) administrativo(g, r, rnd, cores)
      else if (s < 0.85) praca(g, r, rnd, cores)
      else estacionamento(g, r, 6, 0.5, rnd, cores)
      return
    case 'parque':
      if (s < 0.7) parque(g, r, rnd, cores, rnd() < 0.55)
      else praca(g, r, rnd, cores)
      return
    default:
      // centro: mistura de tudo, com poucos parques e estacionamentos soltos
      if (s < 0.09) parque(g, r, rnd, cores, false)
      else if (s < 0.15) praca(g, r, rnd, cores)
      else if (s < 0.19) estacionamento(g, r, 6, 0.55, rnd, cores)
      else if (s < 0.23) posto(g, r, rnd, cores)
      else if (s < 0.27) supermercado(g, r, rnd, cores)
      else if (s < 0.35) lojas(g, r, rnd, cores)
      else if (s < 0.47) apartamentos(g, r, rnd, cores)
      else if (s < 0.6) predioComPatio(g, r, rnd, cores)
      else if (s < 0.72) predioEmL(g, r, rnd, cores)
      else if (s < 0.84) casas(g, r, rnd, cores)
      else grade(g, r, rnd, cores)
  }
}

// Postes nas calçadas: dois por quadra, em cantos opostos, com luz amarelada fraca que não cobre a pista.
export function postesDaQuadra(g: CanvasRenderingContext2D, q: Ret, cores: Cores, distrito: Distrito = 'centro', i = 0, j = 0) {
  // árvores nas calçadas das quadras residenciais e do centro (fora dos cantos, onde ficam os cruzamentos)
  if (distrito === 'residencial' || distrito === 'centro' || distrito === 'parque') {
    const rnd = gerador(sementeDaQuadra(i, j) + 7)
    for (let t = 28; t < q.w - 24; t += 30) {
      if (rnd() < 0.7) arvore(g, q.x + t, q.y + 5, 3.2, cores)
      if (rnd() < 0.7) arvore(g, q.x + t, q.y + q.h - 5, 3.2, cores)
    }
  }
  for (const [x, y] of [
    [q.x + 5, q.y + 5],
    [q.x + q.w - 5, q.y + q.h - 5],
  ]) {
    luz(g, x, y, 10, cores['map-poste-luz'])
    ret(g, x - 1.4, y - 1.4, 2.8, 2.8, 1.4, cores['map-poste'])
  }
}
