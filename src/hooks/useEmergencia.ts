import { useCallback } from 'react'
import { api } from '../share/api'
import type { Estado, NovaOcorrencia, Ocorrencia, TipoViatura } from '../share/tipos'
import { useSimulacaoStore } from '../store/useSimulacaoStore'

// UC03: o botão liga o modo de clique; o clique no cruzamento envia o POST /ocorrencias.
export function useEmergencia() {
  // clicar de novo no mesmo botão cancela o modo
  const alternarModo = useCallback((tipo: TipoViatura) => {
    const { modoClique, setModoClique } = useSimulacaoStore.getState()
    setModoClique(modoClique === tipo ? null : tipo)
  }, [])

  const registrar = useCallback(async (cruzamento: string) => {
    const { modoClique, criticidade, setModoClique, setToast, setEstado, setAviso } = useSimulacaoStore.getState()
    if (modoClique !== 'Ambulancia' && modoClique !== 'Bombeiros' && modoClique !== 'Policia') return
    const corpo: NovaOcorrencia = { tipo: modoClique, cruzamento, criticidade }
    setModoClique(null)
    try {
      const oc = await api.post<Ocorrencia>('/ocorrencias', corpo)
      setToast(null)
      // 201: a API diz qual viatura foi despachada (RN15)
      if (oc?.viaturaId) setAviso({ texto: `${oc.viaturaId} despachada para ${oc.cruzamento} (${oc.id})`, viaturaId: oc.viaturaId })
    } catch (e) {
      // 400 ou 409: o detail do ProblemDetails aparece na faixa de eventos
      setToast((e as Error).message)
    }
    try {
      setEstado(await api.get<Estado>('/estado'))
    } catch {
      // o polling traz o estado no próximo ciclo
    }
  }, [])

  return { alternarModo, registrar }
}
