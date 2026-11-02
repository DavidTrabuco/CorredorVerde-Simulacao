// Prédios públicos do mapa, montados a partir da malha que a API manda (hospitais e bases).
// É desenho e consulta: as regras (rotas, despacho, hospital mais próximo) continuam na API.

import { colunaLinha, posCruzamento, type Ponto } from '../utils/geometria'
import { B, M, RW } from './constantes'
import type { Malha, TipoViatura } from './tipos'

export type TipoInstalacao = 'hospital' | 'samu' | 'bombeiros' | 'policia'

export interface Instalacao {
  id: string
  tipo: TipoInstalacao
  nome: string
  // cruzamento de referência: o mesmo da API (hospital ou base)
  cruzamento: string
  // quadras ocupadas, no índice (i, j) da quadra entre as ruas i-1/i e j-1/j. Uma instalação pode ocupar
  // várias quadras separadas por ruas: todas são a MESMA instalação (mesmo id, mesmo painel, mesmo destaque).
  // A primeira é a principal (onde fica o nome e, nas bases, onde a reserva estaciona).
  quadras: [number, number][]
  // variação de arquitetura (os dois hospitais não são iguais)
  estilo?: 'norte' | 'sul'
  // fica na cidade em volta, fora das ruas da simulação (o cruzamento de referência é só o mais próximo)
  foraDaSimulacao?: boolean
}

export const ROTULO_TIPO: Record<TipoInstalacao, string> = {
  hospital: 'Hospital',
  samu: 'Base de ambulâncias (SAMU)',
  bombeiros: 'Quartel do Corpo de Bombeiros',
  policia: 'Delegacia de polícia',
}

const TIPO_DA_BASE: Record<TipoViatura, TipoInstalacao> = { Ambulancia: 'samu', Bombeiros: 'bombeiros', Policia: 'policia' }

// Quadras escolhidas à mão para a configuração atual da API: cada complexo fica nas quadras em volta do
// próprio cruzamento, afastado dos outros. Hospital ou base que a API mandar fora desta lista ganha quadras
// escolhidas por escolherQuadras().
const LAYOUTS: Omit<Instalacao, 'nome'>[] = [
  // norte: as duas quadras logo acima de C3
  { id: 'hospital-norte', tipo: 'hospital', cruzamento: 'C3', quadras: [[2, 0], [3, 0]], estilo: 'norte' },
  // sudoeste: abaixo de C18 e a vizinha da esquerda
  { id: 'hospital-sul', tipo: 'hospital', cruzamento: 'C18', quadras: [[2, 4], [1, 4]], estilo: 'sul' },
  // oeste, entre os dois hospitais: operação na (1, 2), administração e descanso na (0, 2)
  { id: 'samu', tipo: 'samu', cruzamento: 'C11', quadras: [[1, 2], [0, 2]] },
  // sudeste, com saída para a avenida do leste: garagens na (4, 3), administração e treino na (5, 3)
  { id: 'bombeiros', tipo: 'bombeiros', cruzamento: 'C20', quadras: [[4, 3], [5, 3]] },
]

// Enquanto a API não tiver base de polícia: delegacia no nordeste, nas quadras ao lado de C5 e C10, com a
// entrada e o pátio virados para a rua de C5–C10 (ruas da simulação). Sem viaturas policiais até a API ter.
const DELEGACIA_PADRAO: Instalacao = {
  id: 'delegacia',
  tipo: 'policia',
  nome: 'Delegacia Central',
  cruzamento: 'C5',
  quadras: [[5, 0], [5, 1]],
}

const chave = ([i, j]: [number, number]) => `${i},${j}`

// Quadras para uma instalação que não tem desenho à mão: entre as 4 que encostam no cruzamento, a mais
// afastada do centro da malha que esteja livre e sem encostar em outro complexo; a segunda é uma vizinha dela
// (com a rua no meio), também livre.
function escolherQuadras(malha: Malha, cruzamento: string, usadas: Set<string>, partes: number): [number, number][] {
  const { coluna: c, linha: l } = colunaLinha(cruzamento, malha)
  const centro = { i: (malha.colunas + 1) / 2, j: (malha.linhas + 1) / 2 }
  const longe = ([i, j]: [number, number]) => -Math.hypot(i - centro.i, j - centro.j)
  const encostaEmOutro = ([i, j]: [number, number]) => {
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (usadas.has(`${i + a},${j + b}`)) return true
    return false
  }
  const livres = (lista: [number, number][]) =>
    lista.filter((q) => !usadas.has(chave(q))).sort((p, q) => Number(encostaEmOutro(p)) - Number(encostaEmOutro(q)) || longe(p) - longe(q))
  const [principal] = livres([
    [c, l],
    [c + 1, l],
    [c, l + 1],
    [c + 1, l + 1],
  ])
  if (!principal) return []
  const [i, j] = principal
  const resultado: [number, number][] = [principal]
  if (partes > 1) {
    const [vizinha] = livres([
      [i - 1, j],
      [i + 1, j],
      [i, j - 1],
      [i, j + 1],
    ])
    if (vizinha) resultado.push(vizinha)
  }
  return resultado
}

// Instalações da malha (calculadas uma vez por malha).
const cache = new WeakMap<Malha, Instalacao[]>()
export function instalacoesDa(malha: Malha): Instalacao[] {
  const pronta = cache.get(malha)
  if (pronta) return pronta
  const lista: Instalacao[] = []
  const usadas = new Set<string>()
  const adicionar = (inst: Instalacao) => {
    if (!inst.quadras.length) return
    inst.quadras.forEach((q) => usadas.add(chave(q)))
    lista.push(inst)
  }
  // primeiro as que têm desenho à mão, para as escolhidas automaticamente desviarem delas
  const daApi = [
    ...malha.hospitais.map((h, n) => ({ tipo: 'hospital' as const, nome: h.nome, cruzamento: h.cruzamento, id: `hospital-${h.id}`, n })),
    ...malha.bases.map((b, n) => ({ tipo: TIPO_DA_BASE[b.tipo], nome: b.nome, cruzamento: b.cruzamento, id: `${TIPO_DA_BASE[b.tipo]}-${b.cruzamento}`, n })),
  ]
  const layoutDe = (x: (typeof daApi)[number]) => LAYOUTS.find((l) => l.tipo === x.tipo && l.cruzamento === x.cruzamento)
  for (const x of daApi) {
    const layout = layoutDe(x)
    if (layout) adicionar({ ...layout, nome: x.nome })
  }
  for (const x of daApi) {
    if (layoutDe(x)) continue
    adicionar({
      id: x.id,
      tipo: x.tipo,
      nome: x.nome,
      cruzamento: x.cruzamento,
      quadras: escolherQuadras(malha, x.cruzamento, usadas, 2),
      estilo: x.tipo === 'hospital' ? (x.n % 2 ? 'sul' : 'norte') : undefined,
    })
  }
  // sem base de polícia na API, a delegacia continua como ponto de interesse
  if (!malha.bases.some((b) => b.tipo === 'Policia') && !DELEGACIA_PADRAO.quadras.some((q) => usadas.has(chave(q)))) {
    adicionar(DELEGACIA_PADRAO)
  }
  cache.set(malha, lista)
  return lista
}

// Instalação dona de cada quadra, para o desenho e o clique.
const cacheQuadras = new WeakMap<Malha, Record<string, { instalacao: Instalacao; ordem: number }>>()
export function instalacaoDaQuadra(malha: Malha): Record<string, { instalacao: Instalacao; ordem: number }> {
  let mapa = cacheQuadras.get(malha)
  if (!mapa) {
    mapa = Object.fromEntries(
      instalacoesDa(malha).flatMap((inst) => inst.quadras.map((q, ordem) => [chave(q), { instalacao: inst, ordem }])),
    )
    cacheQuadras.set(malha, mapa)
  }
  return mapa
}

// Centro de um complexo (média dos centros das quadras), para centralizar a câmera nele.
export function centroDaInstalacao(inst: Instalacao): Ponto {
  const cs = inst.quadras.map(([i, j]) => ({ x: M + (i - 1) * B + B / 2, y: M + (j - 1) * B + B / 2 }))
  return { x: cs.reduce((a, c) => a + c.x, 0) / cs.length, y: cs.reduce((a, c) => a + c.y, 0) / cs.length }
}

// A polícia só opera quando a API mandar uma base do tipo 'Policia' na malha.
export const temPolicia = (malha: Malha | null) => !!malha?.bases.some((b) => b.tipo === 'Policia')

// Onde a viatura de reserva fica estacionada: no pátio da quadra principal da base dela.
export function vagaBase(malha: Malha, no: string): Ponto {
  const inst = instalacoesDa(malha).find((i) => i.tipo !== 'hospital' && i.cruzamento === no)
  if (!inst) return posCruzamento(no, malha)
  const [i, j] = inst.quadras[0]
  const q = { x: M + (i - 1) * B + RW / 2, y: M + (j - 1) * B + RW / 2, w: B - RW, h: B - RW }
  return { x: q.x + q.w / 2 - 33, y: q.y + 9 + (q.h - 18) / 2 - 8 }
}
