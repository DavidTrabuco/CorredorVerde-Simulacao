import { B, FAIXA, M, RW } from '../share/constantes'
import type { Direcao, Eixo, Malha } from '../share/tipos'

// A malha que a API manda. A lista de cruzamentos é opcional aqui só para os testes e para malhas antigas;
// quando vem, ela manda nos IDs e nos vizinhos (nada de depender da conta linha * colunas + coluna + 1).
export type Grade = Pick<Malha, 'colunas' | 'linhas'> & Partial<Pick<Malha, 'cruzamentos'>>

export interface Ponto {
  x: number
  y: number
}

export interface Quadra {
  i: number
  j: number
  x: number
  y: number
  w: number
  h: number
}

export const DIRS: Record<Direcao, { dx: number; dy: number; eixo: Eixo }> = {
  N: { dx: 0, dy: -1, eixo: 'NS' },
  S: { dx: 0, dy: 1, eixo: 'NS' },
  L: { dx: 1, dy: 0, eixo: 'LO' },
  O: { dx: -1, dy: 0, eixo: 'LO' },
}

export const OPOSTO: Record<Direcao, Direcao> = { N: 'S', S: 'N', L: 'O', O: 'L' }

export const TODAS_DIRECOES: Direcao[] = ['N', 'L', 'S', 'O']

// Tamanho do mundo da simulação em px do mapa (5×4 dá 750×600).
export function dimensoes(malha: Pick<Malha, 'colunas' | 'linhas'>) {
  return { W: 2 * M + B * (malha.colunas - 1), H: 2 * M + B * (malha.linhas - 1) }
}

interface Indice {
  porId: Map<string, { coluna: number; linha: number; vizinhos?: Partial<Record<Direcao, string>> }>
  porPos: Map<string, string>
}

// Índice dos cruzamentos da malha (feito uma vez por lista que veio da API).
const indices = new WeakMap<object, Indice>()
function indice(malha: Grade): Indice | null {
  const lista = malha.cruzamentos
  if (!lista?.length) return null
  let ind = indices.get(lista)
  if (!ind) {
    ind = { porId: new Map(), porPos: new Map() }
    for (const c of lista) {
      ind.porId.set(c.id, { coluna: c.coluna, linha: c.linha, vizinhos: c.vizinhos })
      ind.porPos.set(`${c.coluna},${c.linha}`, c.id)
    }
    indices.set(lista, ind)
  }
  return ind
}

// Reserva para malhas sem lista de cruzamentos: id = linha * colunas + coluna + 1 (contrato-api.md).
const idPelaConta = (coluna: number, linha: number, colunas: number) => `C${linha * colunas + coluna + 1}`

// ID do cruzamento na coluna/linha, ou null se não existir.
export function idEm(malha: Grade, coluna: number, linha: number): string | null {
  const ind = indice(malha)
  if (ind) return ind.porPos.get(`${coluna},${linha}`) ?? null
  if (coluna < 0 || linha < 0 || coluna >= malha.colunas || linha >= malha.linhas) return null
  return idPelaConta(coluna, linha, malha.colunas)
}

export function colunaLinha(id: string, malha: Grade) {
  const c = indice(malha)?.porId.get(id)
  if (c) return { coluna: c.coluna, linha: c.linha }
  const n = Number(id.slice(1)) - 1
  return { coluna: n % malha.colunas, linha: Math.floor(n / malha.colunas) }
}

export function posCruzamento(id: string, malha: Grade): Ponto {
  const { coluna, linha } = colunaLinha(id, malha)
  return { x: M + coluna * B, y: M + linha * B }
}

// Vizinho na direção: o explícito da API, se veio; senão o cruzamento da coluna/linha ao lado.
export function vizinho(malha: Grade, id: string, dir: Direcao): string | null {
  const explicito = indice(malha)?.porId.get(id)?.vizinhos
  if (explicito) return explicito[dir] ?? null
  const { coluna, linha } = colunaLinha(id, malha)
  return idEm(malha, coluna + DIRS[dir].dx, linha + DIRS[dir].dy)
}

export function direcaoEntre(malha: Grade, de: string, para: string): Direcao | null {
  return TODAS_DIRECOES.find((d) => vizinho(malha, de, d) === para) ?? null
}

// Pista da mão direita: o veículo anda deslocado do centro da rua.
export function ladoDaPista(centro: Ponto, dir: Direcao, lado = FAIXA): Ponto {
  const d = DIRS[dir]
  return { x: centro.x - d.dy * lado, y: centro.y + d.dx * lado }
}

export function quadras(malha: Grade): Quadra[] {
  const { W, H } = dimensoes(malha)
  const xs = [0]
  const ys = [0]
  for (let c = 0; c < malha.colunas; c++) xs.push(M + c * B)
  xs.push(W)
  for (let l = 0; l < malha.linhas; l++) ys.push(M + l * B)
  ys.push(H)

  const out: Quadra[] = []
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = i === 0 ? 0 : xs[i] + RW / 2
      const x1 = i === xs.length - 2 ? W : xs[i + 1] - RW / 2
      const y0 = j === 0 ? 0 : ys[j] + RW / 2
      const y1 = j === ys.length - 2 ? H : ys[j + 1] - RW / 2
      out.push({ i, j, x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
    }
  }
  return out
}

// Hierarquia visual das ruas: a cada 3 ruas, uma é avenida (vertical: 2, 5, 8...; horizontal: 1, 4, 7...).
// Só muda o desenho (canteiro, iluminação) e onde os ônibus passam; a rede e as faixas são as mesmas.
export const ehAvenidaVertical = (c: number) => ((c % 3) + 3) % 3 === 2
export const ehAvenidaHorizontal = (l: number) => ((l % 3) + 3) % 3 === 1
