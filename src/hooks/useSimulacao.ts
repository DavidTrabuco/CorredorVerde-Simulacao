import { useEffect } from 'react'
import { api } from '../share/api'
import { POLL_ESTADO_MS } from '../share/constantes'
import type { Estado } from '../share/tipos'
import { useSimulacaoStore } from '../store/useSimulacaoStore'

// Polling de GET /estado a cada 250 ms (RNF08).
export function useSimulacao() {
  const setEstado = useSimulacaoStore((s) => s.setEstado)
  const setConexao = useSimulacaoStore((s) => s.setConexao)

  useEffect(() => {
    let ativo = true
    let emVoo = false

    const atualizar = async () => {
      if (emVoo) return
      emVoo = true
      const inicio = performance.now()
      try {
        const estado = await api.get<Estado>('/estado')
        if (!ativo) return
        setEstado(estado)
        setConexao(true, Math.round(performance.now() - inicio))
      } catch {
        // API fora do ar: avisa no topo e tenta de novo no próximo ciclo
        if (ativo) setConexao(false, null)
      } finally {
        emVoo = false
      }
    }

    void atualizar()
    const timer = setInterval(atualizar, POLL_ESTADO_MS)
    return () => {
      ativo = false
      clearInterval(timer)
    }
  }, [setEstado, setConexao])
}
