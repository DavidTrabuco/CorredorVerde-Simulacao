// O tamanho do mundo (antes W = 750 e H = 600, fixos para 5×4) agora vem da malha: ver dimensoes() em
// utils/geometria.ts.
export const B = 150
export const M = 75
export const RW = 36
export const FAIXA = 9
export const PARE = RW / 2 + 9
export const VEL_VIATURA = 118
export const CAUTELA_SEG = 1
export const POLL_ESTADO_MS = 250
export const POLL_LOG_MS = 500
export const TENTATIVA_PODE_MS = 250
export const QTD_CARROS_COMUNS = 6
// densidade dos carros comuns (só animação da tela, como diz o contrato); "normal" é o validado com o grupo
export const CARROS_POR_DENSIDADE = { leve: 3, normal: QTD_CARROS_COMUNS, intenso: 12 } as const
// ônibus nas avenidas, além dos carros
export const ONIBUS_POR_DENSIDADE = { leve: 1, normal: 2, intenso: 3 } as const
export const DISTANCIA_CARRO = 22
