import { useEffect } from 'react'
import { useSimulacaoStore } from '../../store/useSimulacaoStore'
import { FaixaEventosStyles as S } from './styles'

const TOAST_MS = 4200
const AVISO_MS = 9000

const AVISO_MODO = {
  Ambulancia: (c: number) => `Clique no cruzamento da ocorrência (ambulância, criticidade ${c})`,
  Bombeiros: (c: number) => `Clique no cruzamento da ocorrência (bombeiros, criticidade ${c})`,
  Policia: (c: number) => `Clique no cruzamento da ocorrência (polícia, criticidade ${c})`,
  falha: () => 'Clique num cruzamento para ligar ou desligar a falha',
}

// Fica ABAIXO do mapa, sem cobrir cruzamentos: o aviso do modo de clique e as mensagens (erros da API).
// As regras que agiram aparecem no Log de eventos, logo abaixo.
export default function FaixaEventos() {
  const modoClique = useSimulacaoStore((s) => s.modoClique)
  const criticidade = useSimulacaoStore((s) => s.criticidade)
  const setModoClique = useSimulacaoStore((s) => s.setModoClique)
  const toast = useSimulacaoStore((s) => s.toast)
  const setToast = useSimulacaoStore((s) => s.setToast)
  const aviso = useSimulacaoStore((s) => s.aviso)
  const setAviso = useSimulacaoStore((s) => s.setAviso)
  const seguindo = useSimulacaoStore((s) => s.seguindo)
  const setSeguindo = useSimulacaoStore((s) => s.setSeguindo)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast, setToast])

  // o aviso de despacho some sozinho depois de alguns segundos
  useEffect(() => {
    if (!aviso) return
    const timer = setTimeout(() => setAviso(null), AVISO_MS)
    return () => clearTimeout(timer)
  }, [aviso, setAviso])

  if (!modoClique && !toast && !aviso && !seguindo) return null

  return (
    <div className={S.barra}>
      {modoClique && (
        <div className={S.aviso}>
          <span>{AVISO_MODO[modoClique](criticidade)}</span>
          <button type="button" className={S.cancelar} onClick={() => setModoClique(null)}>
            Cancelar
          </button>
        </div>
      )}
      {toast && (
        <p role="status" className={S.toast}>
          {toast}
        </p>
      )}
      {aviso && (
        <div role="status" className={S.despacho}>
          <span>{aviso.texto}</span>
          {seguindo !== aviso.viaturaId && (
            <button
              type="button"
              className={S.acao}
              onClick={() => {
                setSeguindo(aviso.viaturaId)
                setAviso(null)
              }}
            >
              Seguir viatura
            </button>
          )}
        </div>
      )}
      {seguindo && (
        <div className={S.seguindo}>
          <span>
            Câmera seguindo <b>{seguindo}</b> · arraste o mapa ou aperte Esc para parar
          </span>
          <button type="button" className={S.acao} onClick={() => setSeguindo(null)}>
            Parar
          </button>
        </div>
      )}
    </div>
  )
}
