import { create } from 'zustand'
import type { Estado, EventoLog, Malha, TipoViatura } from '../share/tipos'
import type { CategoriaLog } from '../utils/categorias'
import { VISAO_INICIAL, type Visao } from '../utils/visao'

export type ModoClique = TipoViatura | 'falha' | null
export type AbaPainel = 'Log' | 'Requisitos'
// camadas do mapa que a legenda liga e desliga (só visual)
export type Camada = 'sinalizacao' | 'rotas' | 'ocorrencias'
// quantidade de carros comuns circulando (só visual)
export type Densidade = 'leve' | 'normal' | 'intenso'

interface SimulacaoState {
  malha: Malha | null
  estado: Estado | null
  log: EventoLog[]
  ultimoSeq: number
  // último evento que já estava no log quando a página abriu: só os mais novos acendem ao chegar
  seqInicial: number | null
  // quantas vezes cada RN, UC ou RNF apareceu no log desta sessão
  contagem: Record<string, number>
  modoClique: ModoClique
  criticidade: number
  manual: boolean
  toast: string | null
  aba: AbaPainel
  filtro: string
  categoria: CategoriaLog
  mostrarApi: boolean
  // cruzamento clicado fora do modo de clique: mostra os detalhes dele abaixo do mapa
  selecionado: string | null
  // prédio público clicado (hospital, SAMU, quartel, delegacia): mostra os detalhes abaixo do mapa
  instalacaoSelecionada: string | null
  // viatura clicada no mapa ou na frota: ganha marcador e a rota dela fica em destaque
  viaturaSelecionada: string | null
  logAberto: boolean
  // altura do log aberto, em px (o usuário arrasta a alça)
  logAltura: number
  lateralRecolhida: boolean
  camadas: Record<Camada, boolean>
  // zoom e centro do mapa
  visao: Visao
  densidade: Densidade
  // conexão com a API, medida pelo polling do GET /estado (null = ainda não respondeu)
  conexao: { online: boolean | null; latenciaMs: number | null }
  // aviso de despacho que deu certo (com a viatura, para o botão "Seguir viatura")
  aviso: { texto: string; viaturaId: string } | null
  // viatura que a câmera está seguindo
  seguindo: string | null
  ajudaAberta: boolean
  // tamanho do canvas do mapa em px CSS (o minimapa usa para desenhar o que a câmera mostra)
  tamanhoMapa: { w: number; h: number }
  setMalha: (malha: Malha) => void
  setEstado: (estado: Estado) => void
  addLog: (eventos: EventoLog[]) => void
  limparLog: () => void
  setModoClique: (modo: ModoClique) => void
  setCriticidade: (criticidade: number) => void
  setManual: (manual: boolean) => void
  setToast: (toast: string | null) => void
  setAba: (aba: AbaPainel) => void
  setFiltro: (filtro: string) => void
  setCategoria: (categoria: CategoriaLog) => void
  setMostrarApi: (mostrar: boolean) => void
  setSelecionado: (id: string | null) => void
  setInstalacaoSelecionada: (id: string | null) => void
  setViaturaSelecionada: (id: string | null) => void
  setLogAberto: (aberto: boolean) => void
  setLogAltura: (altura: number) => void
  setLateralRecolhida: (recolhida: boolean) => void
  alternarCamada: (camada: Camada) => void
  setVisao: (visao: Visao) => void
  setTamanhoMapa: (w: number, h: number) => void
  setDensidade: (densidade: Densidade) => void
  setConexao: (online: boolean, latenciaMs: number | null) => void
  setAviso: (aviso: { texto: string; viaturaId: string } | null) => void
  setSeguindo: (id: string | null) => void
  setAjudaAberta: (aberta: boolean) => void
}

const LIMITE_LOG = 300

export const useSimulacaoStore = create<SimulacaoState>((set) => ({
  malha: null,
  estado: null,
  log: [],
  ultimoSeq: 0,
  seqInicial: null,
  contagem: {},
  modoClique: null,
  criticidade: 2,
  manual: false,
  toast: null,
  aba: 'Log',
  filtro: '',
  categoria: 'Todos',
  mostrarApi: false,
  selecionado: null,
  instalacaoSelecionada: null,
  viaturaSelecionada: null,
  logAberto: true,
  logAltura: 200,
  lateralRecolhida: false,
  camadas: { sinalizacao: true, rotas: true, ocorrencias: true },
  visao: VISAO_INICIAL,
  tamanhoMapa: { w: 0, h: 0 },
  densidade: 'normal',
  conexao: { online: null, latenciaMs: null },
  aviso: null,
  seguindo: null,
  ajudaAberta: false,
  setMalha: (malha) => set({ malha }),
  setEstado: (estado) => set({ estado }),
  addLog: (eventos) =>
    set((s) => {
      const novos = eventos.filter((e) => e.seq > s.ultimoSeq)
      if (!novos.length) return s
      const contagem = { ...s.contagem }
      for (const e of novos) for (const t of e.tags) contagem[t] = (contagem[t] ?? 0) + 1
      return {
        log: [...s.log, ...novos].slice(-LIMITE_LOG),
        ultimoSeq: novos[novos.length - 1].seq,
        seqInicial: s.seqInicial ?? novos[novos.length - 1].seq,
        contagem,
      }
    }),
  limparLog: () => set({ log: [], ultimoSeq: 0, contagem: {} }),
  setModoClique: (modoClique) => set({ modoClique }),
  setCriticidade: (criticidade) => set({ criticidade }),
  setManual: (manual) => set({ manual }),
  setToast: (toast) => set({ toast }),
  setAba: (aba) => set({ aba }),
  setFiltro: (filtro) => set({ filtro }),
  setCategoria: (categoria) => set({ categoria }),
  setMostrarApi: (mostrarApi) => set({ mostrarApi }),
  // só um painel de detalhes por vez: cruzamento ou prédio público
  setSelecionado: (selecionado) => set(selecionado ? { selecionado, instalacaoSelecionada: null } : { selecionado }),
  setInstalacaoSelecionada: (instalacaoSelecionada) =>
    set(instalacaoSelecionada ? { instalacaoSelecionada, selecionado: null } : { instalacaoSelecionada }),
  setViaturaSelecionada: (viaturaSelecionada) => set({ viaturaSelecionada }),
  setLogAberto: (logAberto) => set({ logAberto }),
  setLogAltura: (altura) => set({ logAltura: Math.min(480, Math.max(130, Math.round(altura))) }),
  setLateralRecolhida: (lateralRecolhida) => set({ lateralRecolhida }),
  alternarCamada: (camada) => set((s) => ({ camadas: { ...s.camadas, [camada]: !s.camadas[camada] } })),
  setVisao: (visao) => set({ visao }),
  setTamanhoMapa: (w, h) => set({ tamanhoMapa: { w, h } }),
  setDensidade: (densidade) => set({ densidade }),
  setAviso: (aviso) => set({ aviso }),
  setSeguindo: (seguindo) => set({ seguindo }),
  setAjudaAberta: (ajudaAberta) => set({ ajudaAberta }),
  // só atualiza quando muda de verdade (online/offline ou latência em ms), para não redesenhar o topo à toa
  setConexao: (online, latenciaMs) =>
    set((s) => (s.conexao.online === online && s.conexao.latenciaMs === latenciaMs ? s : { conexao: { online, latenciaMs } })),
}))
