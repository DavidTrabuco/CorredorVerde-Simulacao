import { B, M, RW } from '../../share/constantes'
import type { Estado, Luz, Malha } from '../../share/tipos'
import type { Camada } from '../../store/useSimulacaoStore'
import { escalaBase, type Visao } from '../../utils/visao'
import { instalacaoDaQuadra, instalacoesDa, type Instalacao, type TipoInstalacao } from '../../share/instalacoes'
import { dimensoes, ehAvenidaHorizontal, ehAvenidaVertical, posCruzamento, type Grade, type Ponto } from '../../utils/geometria'
import { distritoDe, desenharQuadra, ligacoesDaCidade, postesDaQuadra } from './cidade'
import { COR_INSTALACAO, desenharInstalacao, desenharLigacao } from './edificios'
import { comAlfa, FONTE_DISPLAY, FONTE_MONO, luz, ret, sombra, semSombra, type Cores, type Ret } from './pincel'

export type { Cores }

const NOMES_CORES = [
  'sig-verde',
  'sig-amarelo',
  'sig-vermelho',
  'rota-amb',
  'rota-bom',
  'ocorrencia',
  'map-chao',
  'map-calcada',
  'map-predio',
  'map-predio-2',
  'map-parque',
  'map-arvore',
  'map-arvore-2',
  'map-telhado',
  'map-asfalto',
  'map-borda',
  'map-cruz',
  'map-faixa',
  'map-texto',
  'map-especial',
  'map-sombra',
  'map-realce',
  'map-poste',
  'map-poste-luz',
  'map-agua',
  'map-janela',
  'map-luz-branca',
  'map-luz-quente',
  'map-luz-azul',
  'map-hosp-telhado',
  'map-terreno',
  'map-fachada',
  'map-telha',
  'map-meio-fio',
  'map-policia-telhado',
  'map-concreto',
  'map-galpao',
  'map-vermelho-escuro',
  'map-amarelo-seg',
  'map-azul-policia',
  'accent',
  'fg',
  'bg',
  'surface',
]

// O canvas lê as cores das variáveis CSS, então acompanha o tema claro e escuro.
export function lerCores(): Cores {
  const cs = getComputedStyle(document.documentElement)
  const cores: Cores = {}
  for (const k of NOMES_CORES) cores[k] = cs.getPropertyValue(`--${k}`).trim()
  return cores
}

// Cor da viatura pelo prefixo do ID (AMB, BOM e, quando a API tiver, POL).
export const corViatura = (id: string, cores: Cores) =>
  id.startsWith('BOM') ? cores['rota-bom'] : id.startsWith('POL') ? cores['map-azul-policia'] : cores['rota-amb']

export function corLuz(luz: Luz, t: number, cores: Cores, reduzMov: boolean) {
  if (luz === 'Verde') return cores['sig-verde']
  if (luz === 'Amarelo') return cores['sig-amarelo']
  if (luz === 'Piscante') return Math.floor(t * 2.2) % 2 === 0 || reduzMov ? cores['sig-amarelo'] : cores['map-asfalto']
  return cores['sig-vermelho']
}

// Uma faixa de parada: barra arredondada com contorno. O vermelho fica um pouco mais discreto que o verde.
function barraSinal(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string, contorno: string, discreta: boolean) {
  g.fillStyle = contorno
  g.beginPath()
  g.roundRect(x - 1.2, y - 1.2, w + 2.4, h + 2.4, 3)
  g.fill()
  g.fillStyle = cor
  g.globalAlpha = discreta ? 0.8 : 1
  g.beginPath()
  g.roundRect(x, y, w, h, 2)
  g.fill()
  g.globalAlpha = 1
}

// Rótulo pequeno do eixo (NS ou LO) ao lado da barra, só no cruzamento selecionado.
function rotuloEixo(g: CanvasRenderingContext2D, texto: string, x: number, y: number, cor: string, cores: Cores) {
  g.font = `700 8px ${FONTE_MONO}`
  g.fillStyle = cores['surface']
  g.beginPath()
  g.roundRect(x - 9, y - 5.5, 18, 11, 5.5)
  g.fill()
  g.strokeStyle = cor
  g.lineWidth = 1.2
  g.stroke()
  g.fillStyle = cores['fg']
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(texto, x, y + 0.5)
}

// Etiqueta acima de uma viatura: texto escuro sobre a cor dela, com uma ponta apontando para baixo.
function etiqueta(g: CanvasRenderingContext2D, texto: string, x: number, y: number, cor: string, cores: Cores) {
  g.font = `700 10px ${FONTE_MONO}`
  const w = g.measureText(texto).width + 12
  g.fillStyle = cor
  sombra(g, cores)
  g.beginPath()
  g.roundRect(x - w / 2, y - 9, w, 17, 8.5)
  g.fill()
  semSombra(g)
  g.beginPath()
  g.moveTo(x - 4, y + 7)
  g.lineTo(x + 4, y + 7)
  g.lineTo(x, y + 11)
  g.fill()
  g.fillStyle = '#0b1220'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(texto, x, y)
}

// ID do cruzamento num selo arredondado, como os rótulos de um mapa de navegação.
function seloId(g: CanvasRenderingContext2D, id: string, x: number, y: number, cores: Cores) {
  g.font = `600 9.5px ${FONTE_MONO}`
  const w = g.measureText(id).width + 8
  g.fillStyle = cores['surface']
  sombra(g, cores)
  g.beginPath()
  g.roundRect(x, y, w, 13, 6.5)
  g.fill()
  semSombra(g)
  g.fillStyle = cores['map-texto']
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(id, x + w / 2, y + 7)
}

// Onde a grade da simulação (W×H) fica dentro do canvas. O que sobra em volta é a cidade vizinha.
export interface Enquadramento {
  largura: number
  altura: number
  escala: number
  ox: number
  oy: number
}

// Aplica o zoom (100% = escala de jogo, ver escalaBase) e o centro da visão; medidas em px CSS.
export function enquadrar(largura: number, altura: number, visao: Visao): Enquadramento {
  const escala = escalaBase(largura) * visao.zoom
  return { largura, altura, escala, ox: largura / 2 - visao.cx * escala, oy: altura / 2 - visao.cy * escala }
}

// Retângulo em coordenadas do mapa (pode passar de 0..W e 0..H).
export interface Area {
  x0: number
  y0: number
  x1: number
  y1: number
}

// Camada fixa pronta: a imagem, o canto dela (em px do mapa) e a escala em que foi desenhada.
export interface CamadaFixa {
  imagem: HTMLCanvasElement
  x0: number
  y0: number
  escala: number
}

// O que o enquadramento mostra do mapa.
export function areaVisivel(enq: Enquadramento): Area {
  return {
    x0: -enq.ox / enq.escala,
    y0: -enq.oy / enq.escala,
    x1: (enq.largura - enq.ox) / enq.escala,
    y1: (enq.altura - enq.oy) / enq.escala,
  }
}

// Avenidas: asfalto mais escuro, canteiro central estreito com arbustos (no meio, longe das faixas onde os
// veículos andam) e postes extras nas duas calçadas.
function avenidas(g: CanvasRenderingContext2D, cIni: number, cFim: number, lIni: number, lFim: number, cores: Cores) {
  const trecho = (x: number, y: number, w: number, h: number, vertical: boolean) => {
    g.fillStyle = 'rgba(0,0,0,.12)'
    g.fillRect(vertical ? x - RW / 2 : x, vertical ? y : y - RW / 2, vertical ? RW : w, vertical ? h : RW)
    g.fillStyle = cores['map-parque']
    if (vertical) g.fillRect(x - 2, y + 6, 4, h - 12)
    else g.fillRect(x + 6, y - 2, w - 12, 4)
    g.fillStyle = cores['map-arvore']
    for (let t = 12; t < (vertical ? h : w) - 10; t += 11) {
      g.beginPath()
      g.arc(vertical ? x : x + t, vertical ? y + t : y, 1.8, 0, Math.PI * 2)
      g.fill()
    }
    // postes nas duas calçadas
    for (let t = 20; t < (vertical ? h : w) - 15; t += 36) {
      for (const lado of [-1, 1]) {
        const px = vertical ? x + lado * (RW / 2 + 4) : x + t
        const py = vertical ? y + t : y + lado * (RW / 2 + 4)
        luz(g, px, py, 11, cores['map-poste-luz'])
        ret(g, px - 1.3, py - 1.3, 2.6, 2.6, 1.3, cores['map-poste'])
      }
    }
  }
  for (let l = lIni; l <= lFim; l++) {
    if (!ehAvenidaHorizontal(l)) continue
    for (let c = cIni - 1; c <= cFim; c++) trecho(M + c * B + RW / 2, M + l * B, B - RW, 0, false)
  }
  for (let c = cIni; c <= cFim; c++) {
    if (!ehAvenidaVertical(c)) continue
    for (let l = lIni - 1; l <= lFim; l++) trecho(M + c * B, M + l * B + RW / 2, 0, B - RW, true)
  }
}

// Variação discreta no asfalto (remendos mais claros e mais escuros, fixos por trecho) e o meio-fio claro
// separando a pista da calçada.
function asfaltoVivo(g: CanvasRenderingContext2D, cIni: number, cFim: number, lIni: number, lFim: number, cores: Cores) {
  const remendo = (x: number, y: number, w: number, h: number, semente: number) => {
    const s = ((semente * 2654435761) >>> 0) / 4294967296
    g.fillStyle = s < 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.07)'
    g.beginPath()
    g.roundRect(x, y, w, h, 4)
    g.fill()
  }
  for (let l = lIni; l <= lFim; l++) {
    const y = M + l * B
    for (let c = cIni - 1; c <= cFim; c++) remendo(M + c * B + 30 + ((c * 13 + l * 7) % 40), y - 7 + ((c + l) % 3) * 3, 34, 9, c * 31 + l)
  }
  for (let c = cIni; c <= cFim; c++) {
    const x = M + c * B
    for (let l = lIni - 1; l <= lFim; l++) remendo(x - 7 + ((c + l) % 3) * 3, M + l * B + 30 + ((l * 11 + c * 5) % 40), 9, 34, c * 17 + l * 3)
  }
  g.strokeStyle = cores['map-meio-fio']
  g.lineWidth = 1
  for (let l = lIni; l <= lFim; l++) {
    const y = M + l * B
    for (let c = cIni - 1; c <= cFim; c++) {
      for (const lado of [-1, 1]) {
        g.beginPath()
        g.moveTo(M + c * B + RW / 2, y + (lado * RW) / 2)
        g.lineTo(M + (c + 1) * B - RW / 2, y + (lado * RW) / 2)
        g.stroke()
      }
    }
  }
  for (let c = cIni; c <= cFim; c++) {
    const x = M + c * B
    for (let l = lIni - 1; l <= lFim; l++) {
      for (const lado of [-1, 1]) {
        g.beginPath()
        g.moveTo(x + (lado * RW) / 2, M + l * B + RW / 2)
        g.lineTo(x + (lado * RW) / 2, M + (l + 1) * B - RW / 2)
        g.stroke()
      }
    }
  }
}

// Quadra (i, j) inteira, com a calçada: fica entre as ruas i-1/i e j-1/j.
export function retQuadra(i: number, j: number): Ret {
  return { x: M + (i - 1) * B + RW / 2, y: M + (j - 1) * B + RW / 2, w: B - RW, h: B - RW }
}

// A cidade em volta é navegável, mas só C1–C20 fazem parte da simulação: fora deles as quadras comuns ficam
// um pouco mais apagadas e uma linha fina e discreta marca o limite (as ruas e os prédios públicos, desenhados
// depois, ficam por cima e nítidos).
function areaDaSimulacao(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, malha: Grade, cores: Cores) {
  const { W, H } = dimensoes(malha)
  g.fillStyle = comAlfa(cores['map-chao'], 0.28)
  if (x0 < 0) g.fillRect(x0, y0, -x0, y1 - y0)
  if (x1 > W) g.fillRect(W, y0, x1 - W, y1 - y0)
  if (y0 < 0) g.fillRect(0, y0, W, -y0)
  if (y1 > H) g.fillRect(0, H, W, y1 - H)
  g.strokeStyle = cores['accent']
  g.globalAlpha = 0.2
  g.lineWidth = 1
  g.strokeRect(0, 0, W, H)
  g.globalAlpha = 1
}

// Contorno em cada quadra de um complexo (só no mouse e na seleção): mostra que as partes são uma instalação.
function destacarComplexo(g: CanvasRenderingContext2D, inst: Instalacao, cor: string, largura: number, traco: number[], alfa: number) {
  g.strokeStyle = cor
  g.globalAlpha = alfa
  g.lineWidth = largura
  g.setLineDash(traco)
  for (const [i, j] of inst.quadras) {
    const q = retQuadra(i, j)
    g.beginPath()
    g.roundRect(q.x + 1, q.y + 1, q.w - 2, q.h - 2, 7)
    g.stroke()
  }
  g.setLineDash([])
  g.globalAlpha = 1
}

// Prédio público no ponto (px do mapa), olhando só as quadras dele (não a rua no meio).
export function instalacaoEm(malha: Malha, x: number, y: number): Instalacao | null {
  for (const inst of instalacoesDa(malha)) {
    for (const [i, j] of inst.quadras) {
      const q = retQuadra(i, j)
      if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) return inst
    }
  }
  return null
}

const SIMBOLO: Record<TipoInstalacao, string> = { hospital: '+', samu: 'S', bombeiros: 'B', policia: 'P' }

// Nomes dos prédios públicos, em tamanho de tela fixo (legíveis em qualquer zoom). De longe vira um marcador
// com símbolo; de perto, uma placa pequena dentro da quadra principal, longe das pistas.
function etiquetasInstalacoes(ctx: CanvasRenderingContext2D, enq: Enquadramento, malha: Malha, cores: Cores) {
  const dpr = window.devicePixelRatio || 1
  const longe = enq.escala < 0.62
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const inst of instalacoesDa(malha)) {
    const [i, j] = inst.quadras[0]
    const q = retQuadra(i, j)
    const cor = cores[COR_INSTALACAO[inst.tipo]]
    const x = enq.ox + (q.x + q.w / 2) * enq.escala
    if (longe) {
      const y = enq.oy + (q.y + q.h / 2) * enq.escala
      ctx.fillStyle = cor
      ctx.beginPath()
      ctx.arc(x, y - 6, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `800 12px ${FONTE_DISPLAY}`
      ctx.fillText(SIMBOLO[inst.tipo], x, y - 5.5)
      placaTela(ctx, inst.nome, x, y + 14, null, cores)
    } else {
      placaTela(ctx, inst.nome, x, enq.oy + (q.y + 16) * enq.escala, cor, cores)
    }
  }
  ctx.restore()
}

// Placa com texto em px de tela; `ponto` é a bolinha colorida à esquerda (ou nenhuma).
function placaTela(ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, ponto: string | null, cores: Cores) {
  ctx.font = `700 11px ${FONTE_DISPLAY}`
  const w = ctx.measureText(texto).width + (ponto ? 22 : 12)
  ctx.fillStyle = comAlfa(cores['surface'], 0.9)
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - 9, w, 18, 9)
  ctx.fill()
  ctx.strokeStyle = cores['map-borda']
  ctx.lineWidth = 1
  ctx.stroke()
  if (ponto) {
    ctx.fillStyle = ponto
    ctx.beginPath()
    ctx.arc(x - w / 2 + 9, y, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = cores['fg']
  ctx.fillText(texto, x + (ponto ? 5 : 0), y + 0.5)
}

// Tudo o que não muda (ruas, quadras, prédios, faixas): desenhado uma vez fora da tela, cobrindo `area`.
// Quem chama escolhe uma área maior que a tela, para o arraste só reposicionar a imagem.
export function montarCamadaFixa(malha: Malha, escala: number, area: Area, cores: Cores): CamadaFixa {
  const dpr = window.devicePixelRatio || 1
  const { x0, y0, x1, y1 } = area
  const cv = document.createElement('canvas')
  cv.width = Math.ceil((x1 - x0) * escala * dpr)
  cv.height = Math.ceil((y1 - y0) * escala * dpr)
  const g = cv.getContext('2d')!
  g.setTransform(escala * dpr, 0, 0, escala * dpr, -x0 * escala * dpr, -y0 * escala * dpr)
  // índices das ruas visíveis: a rua c fica em M + c * B, também fora da grade
  const cIni = Math.floor((x0 - M) / B)
  const cFim = Math.ceil((x1 - M) / B)
  const lIni = Math.floor((y0 - M) / B)
  const lFim = Math.ceil((y1 - M) / B)

  g.fillStyle = cores['map-chao']
  g.fillRect(x0, y0, x1 - x0, y1 - y0)

  // quadra (i, j) fica entre as ruas i-1 e i: o mesmo índice de Instalacao.quadras
  const publicas = new Set<string>()
  for (let i = cIni; i <= cFim + 1; i++) {
    for (let j = lIni; j <= lFim + 1; j++) {
      const q = retQuadra(i, j)
      g.fillStyle = cores['map-calcada']
      g.beginPath()
      g.roundRect(q.x + 2, q.y + 2, q.w - 4, q.h - 4, 6)
      g.fill()
      postesDaQuadra(g, q, cores, distritoDe(i, j, malha.colunas, malha.linhas), i, j)
      const dona = instalacaoDaQuadra(malha)[`${i},${j}`]
      if (dona) publicas.add(dona.instalacao.id)
      else desenharQuadra(g, i, j, { x: q.x + 9, y: q.y + 9, w: q.w - 18, h: q.h - 18 }, distritoDe(i, j, malha.colunas, malha.linhas), cores, malha)
    }
  }
  // a cidade em volta fica um pouco mais apagada (antes dos prédios públicos e das ruas, que ficam nítidos)
  areaDaSimulacao(g, x0, y0, x1, y1, malha, cores)

  // prédios públicos por último, com todas as quadras deles (mesmo as que ficaram fora desta área);
  // as placas das alas só aparecem de perto
  const detalhe = escala >= 1
  for (const inst of instalacoesDa(malha)) {
    if (!publicas.has(inst.id)) continue
    const blocos = inst.quadras.map(([i, j]) => {
      const q = retQuadra(i, j)
      return { x: q.x + 7, y: q.y + 7, w: q.w - 14, h: q.h - 14 }
    })
    desenharInstalacao(g, inst, blocos, cores, detalhe)
  }

  // ruas: primeiro a borda, depois o asfalto por cima
  g.fillStyle = cores['map-borda']
  for (let l = lIni; l <= lFim; l++) g.fillRect(x0, M + l * B - RW / 2 - 1.5, x1 - x0, RW + 3)
  for (let c = cIni; c <= cFim; c++) g.fillRect(M + c * B - RW / 2 - 1.5, y0, RW + 3, y1 - y0)
  g.fillStyle = cores['map-asfalto']
  for (let l = lIni; l <= lFim; l++) g.fillRect(x0, M + l * B - RW / 2, x1 - x0, RW)
  for (let c = cIni; c <= cFim; c++) g.fillRect(M + c * B - RW / 2, y0, RW, y1 - y0)
  asfaltoVivo(g, cIni, cFim, lIni, lFim, cores)

  // faixa central tracejada nas ruas comuns (as avenidas têm canteiro, desenhado em avenidas())
  g.strokeStyle = cores['map-faixa']
  g.lineWidth = 1.4
  g.setLineDash([9, 9])
  g.globalAlpha = 0.65
  for (let l = lIni; l <= lFim; l++) {
    if (ehAvenidaHorizontal(l)) continue
    const y = M + l * B
    for (let c = cIni - 1; c <= cFim; c++) {
      g.beginPath()
      g.moveTo(M + c * B + RW / 2 + 16, y)
      g.lineTo(M + (c + 1) * B - RW / 2 - 16, y)
      g.stroke()
    }
  }
  for (let c = cIni; c <= cFim; c++) {
    if (ehAvenidaVertical(c)) continue
    const x = M + c * B
    for (let l = lIni - 1; l <= lFim; l++) {
      g.beginPath()
      g.moveTo(x, M + l * B + RW / 2 + 16)
      g.lineTo(x, M + (l + 1) * B - RW / 2 - 16)
      g.stroke()
    }
  }
  g.setLineDash([])
  g.globalAlpha = 1
  avenidas(g, cIni, cFim, lIni, lFim, cores)

  // cruzamentos; faixas de pedestre e IDs só nos 20 da simulação
  for (let c = cIni; c <= cFim; c++) {
    for (let l = lIni; l <= lFim; l++) {
      g.fillStyle = cores['map-cruz']
      g.fillRect(M + c * B - RW / 2, M + l * B - RW / 2, RW, RW)
    }
  }
  for (const c of malha.cruzamentos) {
    const x = M + c.coluna * B
    const y = M + c.linha * B
    g.fillStyle = cores['map-faixa']
    g.globalAlpha = 0.55
    for (let k = -RW / 2 + 3; k < RW / 2 - 2; k += 6) {
      g.fillRect(x + k, y - RW / 2 - 15, 3, 8)
      g.fillRect(x + k, y + RW / 2 + 7, 3, 8)
      g.fillRect(x - RW / 2 - 15, y + k, 8, 3)
      g.fillRect(x + RW / 2 + 7, y + k, 8, 3)
    }
    g.globalAlpha = 1
    seloId(g, c.id, x + RW / 2 + 3, y - RW / 2 - 15, cores)
  }

  // ligações entre as partes de cada complexo (faixa de pedestres, passarela), por cima das ruas
  for (const inst of instalacoesDa(malha)) {
    if (publicas.has(inst.id)) desenharLigacao(g, inst, inst.quadras.map(([i, j]) => retQuadra(i, j)), cores)
  }
  ligacoesDaCidade(g, cIni, cFim, lIni, lFim, malha, cores)

  return { imagem: cv, x0, y0, escala }
}

export interface ParamsCena {
  ctx: CanvasRenderingContext2D
  camadaFixa: CamadaFixa | null
  malha: Malha
  estado: Estado | null
  cores: Cores
  enq: Enquadramento
  tReal: number
  reduzMov: boolean
  modoClique: boolean
  hoverNo: string | null
  selecionado: string | null
  instalacaoSelecionada: string | null
  instalacaoHover: string | null
  viaturaSelecionada: string | null
  // AMB-01 sendo dirigida pelo usuário
  manual: boolean
  camadas: Record<Camada, boolean>
  // posição exata (em px do mapa) de uma viatura animada; usada como início da rota
  centroViatura?: (id: string) => Ponto | null
  // desenhos que entram entre os carros e as ocorrências (carros comuns e viaturas)
  desenharVeiculos?: (ctx: CanvasRenderingContext2D, tReal: number, cores: Cores, reduzMov: boolean) => void
}

export function desenharCena(p: ParamsCena) {
  const { ctx, camadaFixa, malha, estado, cores, enq, tReal, reduzMov, camadas } = p
  const dpr = window.devicePixelRatio || 1
  const canvas = ctx.canvas
  // fundo pintado (não limpo): nunca aparece um quadro vazio
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = cores['map-chao']
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  if (camadaFixa) {
    // a camada é maior que a tela: o arraste só muda onde ela é colada; se o zoom mudou e ela
    // ainda não foi refeita, é esticada até a escala nova
    const k = enq.escala / camadaFixa.escala
    ctx.drawImage(
      camadaFixa.imagem,
      Math.round((enq.ox + camadaFixa.x0 * enq.escala) * dpr),
      Math.round((enq.oy + camadaFixa.y0 * enq.escala) * dpr),
      camadaFixa.imagem.width * k,
      camadaFixa.imagem.height * k,
    )
  }
  ctx.setTransform(enq.escala * dpr, 0, 0, enq.escala * dpr, enq.ox * dpr, enq.oy * dpr)
  const tAnim = reduzMov ? 0 : tReal
  const pos = (id: string) => posCruzamento(id, malha)

  if (estado) {
    // previsão do trecho até o hospital (tracejada)
    for (const v of estado.viaturas) {
      if (camadas.rotas && v.previsao.length > 1 && v.trecho === 1) {
        ctx.strokeStyle = corViatura(v.id, cores)
        ctx.globalAlpha = 0.45
        ctx.lineWidth = 4
        ctx.setLineDash([7, 7])
        ctx.lineCap = 'round'
        ctx.beginPath()
        v.previsao.forEach((n, i) => {
          const q = pos(n)
          if (i) ctx.lineTo(q.x, q.y)
          else ctx.moveTo(q.x, q.y)
        })
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
    }

    // rota atual: grossa na emergência, fina tracejada na volta
    for (const v of estado.viaturas) {
      if (!camadas.rotas || !v.rota.length || (v.modo !== 'Emergencia' && v.modo !== 'Retorno')) continue
      const volta = v.modo === 'Retorno'
      const ini = p.centroViatura?.(v.id) ?? pos(v.cruzamento)
      // com uma viatura selecionada, as rotas das outras ficam apagadas
      const apagada = p.viaturaSelecionada && p.viaturaSelecionada !== v.id ? 0.4 : 1
      ctx.strokeStyle = corViatura(v.id, cores)
      ctx.globalAlpha = (volta ? 0.4 : 0.6) * apagada
      ctx.lineWidth = volta ? 3 : 8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (volta) ctx.setLineDash([3, 7])
      ctx.beginPath()
      ctx.moveTo(ini.x, ini.y)
      for (const r of v.rota) {
        const q = pos(r.cruzamento)
        ctx.lineTo(q.x, q.y)
      }
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }

    // anéis do corredor (e anel tracejado de quem perdeu o conflito)
    for (const s of estado.semaforos) {
      if (!camadas.sinalizacao || !s.reservas.length) continue
      const q = pos(s.cruzamento)
      const vencedor = s.vencedor ?? s.reservas[0].viaturaId
      ctx.lineWidth = 3
      ctx.strokeStyle = corViatura(vencedor, cores)
      ctx.beginPath()
      ctx.arc(q.x, q.y, 25, 0, Math.PI * 2)
      ctx.stroke()
      const outros = s.reservas.filter((r) => r.viaturaId !== vencedor)
      if (outros.length) {
        ctx.setLineDash([4, 4])
        ctx.strokeStyle = corViatura(outros[0].viaturaId, cores)
        ctx.beginPath()
        ctx.arc(q.x, q.y, 31, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // faixas de parada coloridas = semáforos. O eixo que faz parte de um corredor ganha contorno na cor da viatura.
    for (const s of estado.semaforos) {
      if (!camadas.sinalizacao) break
      const { x, y } = pos(s.cruzamento)
      const reservaVencedora = s.reservas.find((r) => r.viaturaId === (s.vencedor ?? s.reservas[0]?.viaturaId))
      const contornoNS = reservaVencedora?.eixo === 'NS' ? corViatura(reservaVencedora.viaturaId, cores) : cores['map-borda']
      const contornoLO = reservaVencedora?.eixo === 'LO' ? corViatura(reservaVencedora.viaturaId, cores) : cores['map-borda']
      const L = RW / 2 - 4
      barraSinal(ctx, x - RW / 2 + 2, y - RW / 2 - 6, L, 4, corLuz(s.ns, tAnim, cores, reduzMov), contornoNS, s.ns === 'Vermelho')
      barraSinal(ctx, x + 2, y + RW / 2 + 2, L, 4, corLuz(s.ns, tAnim, cores, reduzMov), contornoNS, s.ns === 'Vermelho')
      barraSinal(ctx, x - RW / 2 - 6, y + 2, 4, L, corLuz(s.lo, tAnim, cores, reduzMov), contornoLO, s.lo === 'Vermelho')
      barraSinal(ctx, x + RW / 2 + 2, y - RW / 2 + 2, 4, L, corLuz(s.lo, tAnim, cores, reduzMov), contornoLO, s.lo === 'Vermelho')
      if (s.cruzamento === p.selecionado) {
        // no cruzamento selecionado, diz qual barra é de qual eixo
        rotuloEixo(ctx, 'NS', x - RW / 4 + 1, y - RW / 2 - 14, corLuz(s.ns, tAnim, cores, reduzMov), cores)
        rotuloEixo(ctx, 'LO', x - RW / 2 - 16, y + RW / 4 + 1, corLuz(s.lo, tAnim, cores, reduzMov), cores)
      }
      if (s.falha) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        ctx.fillStyle = corLuz('Piscante', tAnim, cores, reduzMov)
        ctx.fillRect(-8, -8, 16, 16)
        ctx.restore()
        ctx.fillStyle = '#1d1600'
        ctx.font = `800 12px ${FONTE_DISPLAY}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('!', x, y + 1)
      }
    }
  }

  // prédio público sob o mouse e selecionado: cada quadra dele ganha contorno, e uma linha atravessa a rua
  // ligando as partes, para mostrar que são um só complexo
  const instHover = instalacoesDa(malha).find((i) => i.id === p.instalacaoHover && i.id !== p.instalacaoSelecionada)
  if (instHover) destacarComplexo(ctx, instHover, cores[COR_INSTALACAO[instHover.tipo]], 1.5, [], 0.6)
  const instSel = instalacoesDa(malha).find((i) => i.id === p.instalacaoSelecionada)
  if (instSel) destacarComplexo(ctx, instSel, cores['accent'], 2, [6, 4], 1)
  etiquetasInstalacoes(ctx, enq, malha, cores)

  // os veículos só aparecem dentro da grade; na cidade vizinha eles somem
  ctx.save()
  ctx.beginPath()
  const { W, H } = dimensoes(malha)
  ctx.rect(0, 0, W, H)
  ctx.clip()
  // halo suave (degradê) na cor de cada viatura na rua; a de reserva, parada dentro da base, não tem halo
  for (const v of estado?.viaturas ?? []) {
    if (v.modo === 'Reserva') continue
    const c = p.centroViatura?.(v.id)
    if (!c) continue
    const gr = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, 16)
    gr.addColorStop(0, corViatura(v.id, cores))
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gr
    ctx.globalAlpha = 0.22
    ctx.beginPath()
    ctx.arc(c.x, c.y, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  p.desenharVeiculos?.(ctx, tReal, cores, reduzMov)
  ctx.restore()

  // marcador da viatura selecionada e da AMB-01 quando o usuário dirige
  for (const v of estado?.viaturas ?? []) {
    const selecionada = v.id === p.viaturaSelecionada
    const dirigida = p.manual && v.id === 'AMB-01'
    if (!selecionada && !dirigida) continue
    const c = p.centroViatura?.(v.id)
    if (!c) continue
    const cor = corViatura(v.id, cores)
    ctx.strokeStyle = cor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(c.x, c.y, 19, 0, Math.PI * 2)
    ctx.stroke()
    etiqueta(ctx, dirigida ? `${v.id} · você` : v.id, c.x, c.y - 30, cor, cores)
  }

  if (estado) {
    // ocorrências abertas: pino vermelho com criticidade e ID
    for (const o of estado.ocorrencias) {
      if (!camadas.ocorrencias || o.status === 'Encerrada') continue
      const q = pos(o.cruzamento)
      const x = q.x - 22
      const y = q.y + 24
      if (!reduzMov) {
        const k = (tReal * 0.9) % 1
        ctx.strokeStyle = cores['ocorrencia']
        ctx.globalAlpha = 1 - k
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 10 + k * 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.fillStyle = cores['ocorrencia']
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `700 12px ${FONTE_DISPLAY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(o.criticidade), x, y + 1)
      ctx.fillStyle = cores['map-texto']
      ctx.font = `600 9.5px ${FONTE_MONO}`
      ctx.fillText(o.id, x, y + 19)
    }
  }

  // cruzamento selecionado: anel cheio na cor de destaque
  if (p.selecionado) {
    const q = pos(p.selecionado)
    ctx.strokeStyle = cores['accent']
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(q.x, q.y, 30, 0, Math.PI * 2)
    ctx.stroke()
  }

  // cruzamento sob o mouse: tracejado forte no modo de clique, discreto fora dele
  if (p.hoverNo && p.hoverNo !== p.selecionado) {
    const q = pos(p.hoverNo)
    ctx.strokeStyle = cores['accent']
    ctx.lineWidth = p.modoClique ? 2.5 : 1.5
    ctx.globalAlpha = p.modoClique ? 1 : 0.6
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.arc(q.x, q.y, 30, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }
}

// Cruzamento mais perto do clique (até 60 px), em coordenadas do mapa.
export function cruzamentoPerto(malha: Malha, x: number, y: number): string | null {
  let melhor: string | null = null
  let dist = Infinity
  for (const c of malha.cruzamentos) {
    const q = posCruzamento(c.id, malha)
    const d = Math.hypot(q.x - x, q.y - y)
    if (d < dist) {
      dist = d
      melhor = c.id
    }
  }
  return dist < 60 ? melhor : null
}
