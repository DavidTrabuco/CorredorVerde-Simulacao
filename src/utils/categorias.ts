import type { EventoLog } from '../share/tipos'

export type CategoriaLog = 'Todos' | 'Viaturas' | 'Semaforos' | 'Ocorrencias' | 'Sistema'

export const CATEGORIAS: { nome: CategoriaLog; rotulo: string }[] = [
  { nome: 'Todos', rotulo: 'Todos' },
  { nome: 'Viaturas', rotulo: 'Viaturas' },
  { nome: 'Semaforos', rotulo: 'Semáforos' },
  { nome: 'Ocorrencias', rotulo: 'Ocorrências' },
  { nome: 'Sistema', rotulo: 'Sistema' },
]

// Só agrupa o log para leitura, pelas tags que a API já manda; não decide regra nenhuma.
const TAGS: Record<Exclude<CategoriaLog, 'Todos'>, string[]> = {
  Viaturas: ['UC01', 'UC05', 'UC07', 'RN09', 'RN10', 'RN11', 'RN15'],
  Semaforos: ['UC02', 'UC09', 'RN01', 'RN02', 'RN03', 'RN07', 'RN13'],
  Ocorrencias: ['UC03', 'UC04', 'UC06', 'UC08', 'RN04', 'RN05', 'RN06', 'RN08', 'RN12'],
  Sistema: ['UC10', 'RN14'],
}

export function naCategoria(e: EventoLog, categoria: CategoriaLog) {
  if (categoria === 'Todos') return true
  if (categoria === 'Sistema' && (e.tipo === 'Info' || e.tipo === 'Api' || e.tipo === 'Erro')) return true
  return e.tags.some((t) => TAGS[categoria].includes(t))
}
