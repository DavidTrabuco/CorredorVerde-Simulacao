import { useState } from 'react'
import { desenharCarroComum } from '../components/Mapa/desenhoVeiculos'
import { CARROS_POR_DENSIDADE, ONIBUS_POR_DENSIDADE } from '../share/constantes'
import { useSimulacaoStore } from '../store/useSimulacaoStore'
import { criarCarrosComuns, passoCarroComum, type CarroComum } from '../utils/movimento'
import type { FaixaViatura } from './useViaturas'

const CORES = ['#8796a1', '#c3ab72', '#6c8cae', '#ad7767', '#79977a', '#a3a3a3', '#cfd3d7', '#56636e', '#9a86ad']

const mesmaFaixa = (c: CarroComum, f: Pick<FaixaViatura, 'eixo' | 'linha' | 'sentido'>) =>
  c.eixo === f.eixo && c.linha === f.linha && c.sentido === f.sentido

// Carros comuns (6 no modo normal): animação da simulação, mas param no vermelho e no amarelo (RN07).
function criarMotor() {
  let carros: CarroComum[] = []
  let densidadeAtual: string | null = null

  return {
    get carros() {
      return carros
    },

    passo(dt: number, faixasViaturas: FaixaViatura[]) {
      const { malha, estado, densidade } = useSimulacaoStore.getState()
      if (!malha || !estado) return
      // a densidade mudou (ou é o primeiro passo): recria os carros com a nova quantidade
      const qtd = CARROS_POR_DENSIDADE[densidade]
      const onibus = ONIBUS_POR_DENSIDADE[densidade]
      if (densidadeAtual !== densidade) {
        carros = criarCarrosComuns(malha, qtd, CORES, onibus)
        densidadeAtual = densidade
      }

      const luzes = new Map(estado.semaforos.map((s) => [s.cruzamento, s]))
      const luzDe = (id: string, eixo: 'NS' | 'LO') => {
        const s = luzes.get(id)
        return s ? (eixo === 'NS' ? s.ns : s.lo) : undefined
      }

      carros = carros.map((c) => {
        // o ônibus é mais comprido: quem vem atrás guarda mais distância (e ele também)
        const frente = carros
          .filter((o) => o !== c && mesmaFaixa(o, c) && o.sentido === c.sentido)
          .map((o) => (o.onibus || c.onibus ? o.s - o.sentido * 7 : o.s))
        const naFaixa = faixasViaturas.filter((f) => mesmaFaixa(c, f))
        for (const f of naFaixa) if (f.ativa) frente.push(f.s)
        const emergencia = naFaixa.filter((f) => f.emergencia).map((f) => f.s)
        return passoCarroComum(c, dt, { malha, luzDe, frente, emergencia })
      })
    },

    desenhar(ctx: CanvasRenderingContext2D, noite = false) {
      for (const c of carros) desenharCarroComum(ctx, c, noite)
    },
  }
}

export type MotorCarros = ReturnType<typeof criarMotor>

export function useCarrosComuns(): MotorCarros {
  const [motor] = useState(criarMotor)
  return motor
}
