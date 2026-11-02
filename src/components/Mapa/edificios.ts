import type { Instalacao, TipoInstalacao } from '../../share/instalacoes'
import {
  arvore,
  carroParado,
  comAlfa,
  estacionamento,
  faixaPedestres,
  FONTE_DISPLAY,
  gerador,
  janelas,
  luz,
  ret,
  sombra,
  semSombra,
  volume,
  type Cores,
  type Ret,
} from './pincel'

// Arquitetura dos prédios públicos vista de cima. Uma instalação pode ocupar várias quadras separadas por
// ruas (`blocos`, já sem a calçada, na ordem de `Instalacao.quadras`): cada quadra tem uma função própria e
// as partes compartilham telhados, piso e cores, sem bordas chamativas. Os terrenos não ficam 100%
// construídos: sobra espaço para entradas, estacionamento, circulação e jardins.
//
// As entradas de emergência ficam viradas para o cruzamento de referência da API (C3, C18, C11, C20).
// SAMU e quartel: a viatura de reserva estaciona em (17, 42) relativo à quadra principal (ver `vagaBase`),
// então o pátio de saída das viaturas fica exatamente ali.
//
// `detalhe`: com zoom alto, aparecem as placas pequenas das alas; de longe só o nome principal (na cena).

// Cor de identidade de cada tipo (token do tema).
export const COR_INSTALACAO: Record<TipoInstalacao, string> = {
  hospital: 'ocorrencia',
  samu: 'rota-amb',
  bombeiros: 'rota-bom',
  policia: 'map-azul-policia',
}

// Terreno do complexo: piso com um tom bem leve da cor da instalação, igual em todas as partes (sem borda).
function terreno(g: CanvasRenderingContext2D, r: Ret, cor: string, cores: Cores) {
  ret(g, r.x, r.y, r.w, r.h, 6, cores['map-terreno'])
  ret(g, r.x, r.y, r.w, r.h, 6, comAlfa(cor, 0.05))
}

// Ala de prédio público com volume (mais alta que os prédios comuns) e janelas acesas na fachada.
function ala(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string, cores: Cores, alt = 7) {
  const a = Math.min(alt, h * 0.35)
  volume(g, x, y, w, h, a, cor, cores)
  g.fillStyle = cores['map-janela']
  for (let k = x + 3, n = 0; k < x + w - 3; k += 4.5, n++) if ((n * 7) % 3 !== 0) g.fillRect(k, y + h - a * 0.7, 1.8, a * 0.35)
}

// Equipamentos de ar-condicionado e ventilação no telhado.
function equipamentos(g: CanvasRenderingContext2D, x: number, y: number, n: number, cores: Cores) {
  for (let k = 0; k < n; k++) {
    ret(g, x + k * 8, y, 6, 4, 1, cores['map-concreto'])
    g.fillStyle = cores['map-predio']
    g.fillRect(x + k * 8 + 2, y + 1.3, 2, 1.4)
  }
}

// Cruz médica pequena no telhado.
function cruz(g: CanvasRenderingContext2D, cx: number, cy: number, t: number, cores: Cores) {
  g.fillStyle = cores['map-especial']
  g.fillRect(cx - t * 0.75, cy - t * 0.75, t * 1.5, t * 1.5)
  g.fillStyle = cores['ocorrencia']
  g.fillRect(cx - t * 0.18, cy - t * 0.55, t * 0.36, t * 1.1)
  g.fillRect(cx - t * 0.55, cy - t * 0.18, t * 1.1, t * 0.36)
}

// Cobertura de entrada (marquise) com uma borda na cor de destaque.
function marquise(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, destaque: string, cores: Cores) {
  ret(g, x, y, w, h, 1.5, cores['map-concreto'])
  g.fillStyle = destaque
  if (w >= h) g.fillRect(x, y + h - 1.6, w, 1.6)
  else g.fillRect(x, y, 1.6, h)
}

// Vaga demarcada: retângulo tracejado.
function vagaTracejada(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string) {
  g.strokeStyle = cor
  g.lineWidth = 1
  g.setLineDash([3, 2])
  g.strokeRect(x, y, w, h)
  g.setLineDash([])
}

// Placa pequena com texto, só com zoom alto (como uma fachada vista de perto).
function placa(g: CanvasRenderingContext2D, detalhe: boolean, texto: string, x: number, y: number, fundo: string, cor: string) {
  if (!detalhe) return
  g.font = `800 5px ${FONTE_DISPLAY}`
  const w = g.measureText(texto).width + 5
  ret(g, x - w / 2, y - 3.5, w, 7, 1.5, fundo)
  g.fillStyle = cor
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(texto, x, y + 0.3)
}

// Portão ou porta de garagem segmentada (vertical quando h > w).
function portao(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string) {
  ret(g, x, y, w, h, 0.5, cor)
  g.fillStyle = 'rgba(0,0,0,.35)'
  if (h > w) for (let s = y + 3; s < y + h; s += 3) g.fillRect(x, s, w, 0.6)
  else for (let s = x + 3; s < x + w; s += 3) g.fillRect(s, y, 0.6, h)
}

// Faixas amarelas e pretas de segurança.
function faixaSeguranca(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cores: Cores) {
  g.save()
  g.beginPath()
  g.rect(x, y, w, h)
  g.clip()
  g.fillStyle = cores['map-amarelo-seg']
  g.fillRect(x, y, w, h)
  g.fillStyle = '#1f2328'
  for (let k = -h; k < w + h; k += 4) {
    g.beginPath()
    g.moveTo(x + k, y + h)
    g.lineTo(x + k + 2, y + h)
    g.lineTo(x + k + 2 + h, y)
    g.lineTo(x + k + h, y)
    g.fill()
  }
  g.restore()
}

// Caminho de pedestres claro sobre o terreno.
function caminho(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cores: Cores) {
  ret(g, x, y, w, h, 1.5, cores['map-calcada'])
}

// ---------- Hospital Norte (acima de C3): internação na (2, 0) + emergência na (3, 0) ----------
// A rua de baixo das duas quadras é a que chega em C3: entradas viradas para baixo.

function hospitalNorte(g: CanvasRenderingContext2D, [a, b]: Ret[], cores: Cores, detalhe: boolean) {
  const rnd = gerador(11)
  const cor = cores['ocorrencia']
  const telhado = cores['map-hosp-telhado']

  // A: prédio principal grande, ala de internação, recepção envidraçada, entrada de visitantes e jardim
  terreno(g, a, cor, cores)
  ala(g, a.x + 8, a.y + 8, 62, 36, telhado, cores)
  ala(g, a.x + 8, a.y + 44, 26, 34, telhado, cores)
  ala(g, a.x + 36, a.y + 48, 22, 16, cores['map-agua'], cores)
  equipamentos(g, a.x + 34, a.y + 12, 2, cores)
  cruz(g, a.x + 20, a.y + 20, 10, cores)
  // heliponto no telhado da ala principal
  g.strokeStyle = cores['map-especial']
  g.lineWidth = 1
  g.beginPath()
  g.arc(a.x + 58, a.y + 21, 8, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = cores['map-especial']
  g.fillRect(a.x + 55, a.y + 17, 1.3, 8)
  g.fillRect(a.x + 59.7, a.y + 17, 1.3, 8)
  g.fillRect(a.x + 55, a.y + 20.4, 6, 1.2)
  janelas(g, a.x + 8, a.y + 8, 62, 36, rnd, cores)
  janelas(g, a.x + 8, a.y + 44, 26, 34, rnd, cores)
  caminho(g, a.x + 42, a.y + 64, 8, 36, cores)
  marquise(g, a.x + 36, a.y + 82, 22, 8, cores['map-especial'], cores)
  ret(g, a.x + 74, a.y + 8, 22, 60, 4, cores['map-parque'])
  for (const y of [18, 34, 52]) arvore(g, a.x + 85, a.y + y, 5, cores)
  ret(g, a.x + 62, a.y + 72, 34, 22, 4, cores['map-parque'])
  arvore(g, a.x + 78, a.y + 83, 5, cores)
  placa(g, detalhe, 'INTERNAÇÃO', a.x + 39, a.y + 40, cores['map-especial'], cor)
  luz(g, a.x + 47, a.y + 92, 11, cores['map-luz-branca'])
  luz(g, a.x + 85, a.y + 66, 9, cores['map-luz-quente'])

  // B: estacionamento e apoio em cima; pronto-socorro, garagem de ambulâncias e desembarque coberto
  // embaixo, colados na rua que leva a C3 (canto de baixo à esquerda)
  terreno(g, b, cor, cores)
  estacionamento(g, { x: b.x + 4, y: b.y + 4, w: 58, h: 34 }, 6, 0.55, rnd, cores)
  ala(g, b.x + 68, b.y + 6, 26, 30, cores['map-concreto'], cores)
  ala(g, b.x + 6, b.y + 46, 24, 26, cores['map-concreto'], cores)
  for (const px of [b.x + 9, b.x + 19]) portao(g, px, b.y + 72, 8, 3, cores['map-especial'])
  ala(g, b.x + 36, b.y + 44, 58, 28, telhado, cores)
  g.fillStyle = cor
  g.fillRect(b.x + 36, b.y + 44, 58, 2)
  equipamentos(g, b.x + 60, b.y + 52, 3, cores)
  cruz(g, b.x + 46, b.y + 56, 8, cores)
  marquise(g, b.x + 4, b.y + 82, 64, 11, cor, cores)
  vagaTracejada(g, b.x + 8, b.y + 84, 24, 7, cores['map-especial'])
  vagaTracejada(g, b.x + 38, b.y + 84, 24, 7, cores['map-especial'])
  placa(g, detalhe, 'PRONTO-SOCORRO', b.x + 65, b.y + 76, cor, '#ffffff')
  luz(g, b.x + 20, b.y + 90, 11, cores['map-luz-branca'])
  luz(g, b.x + 50, b.y + 90, 11, cores['map-luz-branca'])
  luz(g, b.x + 33, b.y + 20, 11, cores['map-luz-branca'])
}

// ---------- Hospital Sul (abaixo de C18): atendimento na (2, 4) + centro cirúrgico na (1, 4) ----------
// A rua de cima é a que chega em C18 (canto de cima à direita da quadra principal).

function hospitalSul(g: CanvasRenderingContext2D, [a, b]: Ret[], cores: Cores, detalhe: boolean) {
  const rnd = gerador(23)
  const cor = cores['ocorrencia']
  const telhado = cores['map-hosp-telhado']

  // A: pronto atendimento no canto de cima à direita (perto de C18), alas médicas compridas e horizontais,
  // entrada principal coberta à esquerda e jardim embaixo
  terreno(g, a, cor, cores)
  ret(g, a.x + 4, a.y + 4, 50, 26, 3, cores['map-cruz'])
  ala(g, a.x + 60, a.y + 10, 34, 24, cores['map-concreto'], cores)
  g.fillStyle = cor
  g.fillRect(a.x + 60, a.y + 10, 34, 2)
  marquise(g, a.x + 58, a.y + 2, 38, 7, cor, cores)
  vagaTracejada(g, a.x + 8, a.y + 10, 20, 8, cores['map-especial'])
  vagaTracejada(g, a.x + 30, a.y + 10, 20, 8, cores['map-especial'])
  ala(g, a.x + 4, a.y + 38, 90, 24, telhado, cores)
  ala(g, a.x + 14, a.y + 62, 50, 18, telhado, cores)
  g.strokeStyle = cores['map-predio']
  g.lineWidth = 1
  for (let k = a.x + 26; k < a.x + 92; k += 12) {
    g.beginPath()
    g.moveTo(k, a.y + 40)
    g.lineTo(k, a.y + 60)
    g.stroke()
  }
  equipamentos(g, a.x + 34, a.y + 46, 5, cores)
  cruz(g, a.x + 14, a.y + 50, 9, cores)
  janelas(g, a.x + 4, a.y + 38, 90, 24, rnd, cores)
  marquise(g, a.x + 0.5, a.y + 66, 9, 14, cores['map-especial'], cores)
  ret(g, a.x + 68, a.y + 66, 28, 30, 4, cores['map-parque'])
  arvore(g, a.x + 78, a.y + 76, 5, cores)
  arvore(g, a.x + 88, a.y + 88, 4, cores)
  caminho(g, a.x + 20, a.y + 84, 44, 6, cores)
  placa(g, detalhe, 'PRONTO ATENDIMENTO', a.x + 77, a.y + 38, cor, '#ffffff')
  luz(g, a.x + 76, a.y + 5, 11, cores['map-luz-branca'])
  luz(g, a.x + 6, a.y + 73, 10, cores['map-luz-branca'])

  // B: centro cirúrgico (telhado claro em grade) na altura da passarela, apoio e estacionamento
  terreno(g, b, cor, cores)
  estacionamento(g, { x: b.x + 4, y: b.y + 4, w: b.w - 8, h: 30 }, 7, 0.55, rnd, cores)
  ala(g, b.x + 34, b.y + 40, 62, 30, cores['map-especial'], cores)
  g.strokeStyle = telhado
  g.lineWidth = 1
  for (let k = b.x + 44; k < b.x + 96; k += 10) {
    g.beginPath()
    g.moveTo(k, b.y + 42)
    g.lineTo(k, b.y + 68)
    g.stroke()
  }
  cruz(g, b.x + 65, b.y + 55, 7, cores)
  ala(g, b.x + 6, b.y + 40, 22, 30, cores['map-concreto'], cores)
  ret(g, b.x + 6, b.y + 76, 88, 18, 4, cores['map-parque'])
  for (const x of [16, 40, 64, 86]) arvore(g, b.x + x, b.y + 85, 4.5, cores)
  placa(g, detalhe, 'CENTRO CIRÚRGICO', b.x + 65, b.y + 38, cor, '#ffffff')
  luz(g, b.x + 50, b.y + 20, 12, cores['map-luz-branca'])
}

// ---------- SAMU: operação na (1, 2), onde a reserva estaciona + administração e descanso na (0, 2) ----------

function samu(g: CanvasRenderingContext2D, [a, b]: Ret[], cores: Cores, detalhe: boolean) {
  const rnd = gerador(31)
  const azul = cores['rota-amb']

  // A: pátio de saída com as vagas (a reserva fica em 17, 42) virado para a rua da esquerda (C11),
  // garagem com duas portas e uma oficina pequena; o resto é circulação
  terreno(g, a, azul, cores)
  ret(g, a.x + 2, a.y + 22, 44, 54, 3, cores['map-cruz'])
  vagaTracejada(g, a.x + 4, a.y + 34, 26, 16, azul)
  vagaTracejada(g, a.x + 4, a.y + 54, 26, 16, azul)
  ret(g, a.x - 7, a.y + 35, 9, 14, 1, cores['map-cruz'])
  ala(g, a.x + 52, a.y + 8, 42, 40, cores['map-predio-2'], cores)
  for (const py of [a.y + 14, a.y + 30]) portao(g, a.x + 52, py, 3.5, 12, cores['map-especial'])
  g.fillStyle = azul
  g.fillRect(a.x + 52, a.y + 8, 42, 2)
  equipamentos(g, a.x + 62, a.y + 16, 3, cores)
  ala(g, a.x + 60, a.y + 62, 34, 26, cores['map-concreto'], cores)
  faixaSeguranca(g, a.x + 60, a.y + 62, 34, 2.5, cores)
  placa(g, detalhe, 'GARAGEM', a.x + 73, a.y + 52, azul, '#ffffff')
  luz(g, a.x + 18, a.y + 26, 12, cores['map-luz-branca'])
  luz(g, a.x + 50, a.y + 26, 9, cores['map-luz-branca'])

  // B: administração com faixa azul, alojamento de descanso e jardim com caminho
  terreno(g, b, azul, cores)
  ala(g, b.x + 8, b.y + 8, 54, 30, cores['map-concreto'], cores)
  g.fillStyle = azul
  g.fillRect(b.x + 8, b.y + 8, 54, 2)
  equipamentos(g, b.x + 16, b.y + 18, 3, cores)
  janelas(g, b.x + 8, b.y + 8, 54, 30, rnd, cores)
  marquise(g, b.x + 62, b.y + 16, 6, 14, azul, cores)
  ala(g, b.x + 8, b.y + 56, 36, 34, cores['map-predio'], cores)
  janelas(g, b.x + 8, b.y + 56, 36, 34, rnd, cores)
  ret(g, b.x + 52, b.y + 50, 42, 44, 4, cores['map-parque'])
  caminho(g, b.x + 52, b.y + 68, 42, 5, cores)
  arvore(g, b.x + 62, b.y + 60, 5.5, cores)
  arvore(g, b.x + 84, b.y + 84, 5, cores)
  placa(g, detalhe, 'SAMU 192', b.x + 35, b.y + 44, azul, '#ffffff')
  luz(g, b.x + 70, b.y + 23, 9, cores['map-luz-branca'])
}

// ---------- Bombeiros: garagens na (4, 3), onde a reserva estaciona + administração e treino na (5, 3) ----------

function bombeiros(g: CanvasRenderingContext2D, [a, b]: Ret[], cores: Cores, detalhe: boolean) {
  const rnd = gerador(41)
  const vermelho = cores['map-vermelho-escuro']
  const laranja = cores['rota-bom']

  // A: pátio de manobras amplo (a reserva fica em 17, 42) com saída para a rua da esquerda, garagem com
  // três portões e alojamento; espaço livre para os caminhões entrarem e saírem
  terreno(g, a, laranja, cores)
  ret(g, a.x + 2, a.y + 16, 46, 56, 3, cores['map-cruz'])
  ret(g, a.x - 7, a.y + 33, 9, 18, 1, cores['map-cruz'])
  faixaSeguranca(g, a.x + 46, a.y + 16, 2.5, 56, cores)
  g.strokeStyle = cores['map-amarelo-seg']
  g.lineWidth = 1
  g.strokeRect(a.x + 4, a.y + 30, 30, 24)
  ala(g, a.x + 50, a.y + 10, 44, 58, cores['map-predio-2'], cores)
  for (let k = 0; k < 3; k++) {
    const py = a.y + 15 + k * 17
    portao(g, a.x + 50, py, 4, 13, vermelho)
    luz(g, a.x + 47, py + 6.5, 9, cores['map-luz-quente'])
  }
  equipamentos(g, a.x + 62, a.y + 18, 3, cores)
  ala(g, a.x + 50, a.y + 74, 44, 20, cores['map-concreto'], cores)
  g.fillStyle = vermelho
  g.fillRect(a.x + 50, a.y + 74, 44, 2)
  janelas(g, a.x + 50, a.y + 74, 44, 20, rnd, cores)
  placa(g, detalhe, 'BOMBEIROS', a.x + 72, a.y + 70, vermelho, '#ffffff')

  // B: administração com detalhe vermelho-escuro, pátio de treino com torre e estacionamento operacional
  terreno(g, b, laranja, cores)
  ala(g, b.x + 8, b.y + 8, 40, 30, cores['map-concreto'], cores)
  g.fillStyle = vermelho
  g.fillRect(b.x + 8, b.y + 8, 2, 30)
  equipamentos(g, b.x + 18, b.y + 16, 2, cores)
  janelas(g, b.x + 8, b.y + 8, 40, 30, rnd, cores)
  ret(g, b.x + 56, b.y + 8, 38, 44, 3, cores['map-cruz'])
  ala(g, b.x + 76, b.y + 14, 13, 13, vermelho, cores)
  ret(g, b.x + 79, b.y + 17, 7, 7, 1, cores['map-predio-2'])
  faixaSeguranca(g, b.x + 58, b.y + 46, 34, 2.5, cores)
  g.strokeStyle = cores['map-amarelo-seg']
  g.globalAlpha = 0.6
  for (let k = 0; k < 3; k++) g.strokeRect(b.x + 8 + k * 22, b.y + 60, 16, 30)
  g.globalAlpha = 1
  for (let k = 0; k < 3; k++) if (rnd() < 0.6) carroParado(g, b.x + 12 + k * 22, b.y + 67, 8, 15, '#5c6670')
  ret(g, b.x + 76, b.y + 62, 18, 30, 4, cores['map-parque'])
  arvore(g, b.x + 85, b.y + 76, 5, cores)
  placa(g, detalhe, 'ADMINISTRAÇÃO', b.x + 28, b.y + 44, vermelho, '#ffffff')
  luz(g, b.x + 75, b.y + 30, 13, cores['map-luz-quente'])
}

// ---------- Delegacia (nordeste): prédio principal na (6, 0) + operacional na (6, -1), em cima ----------

// Viatura policial parada: branca com capô escuro e giroflex azul e vermelho apagado.
function viaturaPolicial(g: CanvasRenderingContext2D, x: number, y: number) {
  ret(g, x, y, 8, 15, 2.2, '#e9edf2')
  g.fillStyle = '#1d2733'
  g.fillRect(x + 1, y + 1, 6, 3)
  g.fillRect(x + 1, y + 11, 6, 3)
  g.fillStyle = '#3b6fd6'
  g.fillRect(x + 1, y + 6.5, 3, 1.6)
  g.fillStyle = '#d23a3a'
  g.fillRect(x + 4, y + 6.5, 3, 1.6)
}

function delegacia(g: CanvasRenderingContext2D, [a, b]: Ret[], cores: Cores, detalhe: boolean) {
  const rnd = gerador(53)
  const azul = cores['map-azul-policia']
  const telhado = cores['map-policia-telhado']

  // A: pátio das viaturas à esquerda (a reserva estaciona em 17, 42, como nas outras bases), prédio em L
  // à direita com antena, e atendimento ao público com praça na frente
  terreno(g, a, azul, cores)
  ret(g, a.x + 2, a.y + 22, 38, 54, 3, cores['map-cruz'])
  vagaTracejada(g, a.x + 4, a.y + 34, 26, 16, azul)
  vagaTracejada(g, a.x + 4, a.y + 54, 26, 16, azul)
  ret(g, a.x - 7, a.y + 35, 9, 14, 1, cores['map-cruz'])
  ala(g, a.x + 44, a.y + 8, 50, 30, telhado, cores)
  ala(g, a.x + 70, a.y + 38, 24, 54, telhado, cores)
  g.fillStyle = azul
  g.fillRect(a.x + 44, a.y + 8, 50, 2)
  equipamentos(g, a.x + 50, a.y + 16, 2, cores)
  janelas(g, a.x + 44, a.y + 8, 50, 30, rnd, cores)
  g.strokeStyle = cores['map-faixa']
  g.lineWidth = 0.8
  g.beginPath()
  g.arc(a.x + 82, a.y + 22, 3, 0, Math.PI * 2)
  g.moveTo(a.x + 82, a.y + 15)
  g.lineTo(a.x + 82, a.y + 29)
  g.moveTo(a.x + 75, a.y + 22)
  g.lineTo(a.x + 89, a.y + 22)
  g.stroke()
  ret(g, a.x + 44, a.y + 44, 24, 48, 3, cores['map-calcada'])
  marquise(g, a.x + 46, a.y + 84, 20, 8, azul, cores)
  ret(g, a.x + 4, a.y + 80, 34, 14, 3, cores['map-parque'])
  arvore(g, a.x + 14, a.y + 87, 4, cores)
  arvore(g, a.x + 30, a.y + 87, 4, cores)
  placa(g, detalhe, 'POLÍCIA', a.x + 56, a.y + 64, azul, '#ffffff')
  luz(g, a.x + 56, a.y + 88, 10, cores['map-luz-azul'])
  luz(g, a.x + 20, a.y + 26, 11, cores['map-luz-branca'])

  // B: estacionamento cercado das viaturas com portão, garagem e setor operacional (formato diferente)
  terreno(g, b, azul, cores)
  ret(g, b.x + 4, b.y + 4, b.w - 8, 50, 3, cores['map-cruz'])
  g.strokeStyle = cores['map-faixa']
  g.lineWidth = 1
  g.setLineDash([2, 2])
  g.strokeRect(b.x + 3, b.y + 3, b.w - 6, 52)
  g.setLineDash([])
  g.fillStyle = azul
  g.fillRect(b.x + 2, b.y + 20, 2, 18)
  for (let k = 0; k < 6; k++) viaturaPolicial(g, b.x + 12 + k * 13, b.y + 9)
  for (let k = 0; k < 4; k++) if (rnd() < 0.6) carroParado(g, b.x + 12 + k * 13, b.y + 32, 8, 15, '#5c6670')
  ala(g, b.x + 8, b.y + 62, 46, 30, cores['map-concreto'], cores)
  for (const px of [b.x + 12, b.x + 30]) portao(g, px, b.y + 62, 14, 3, azul)
  ala(g, b.x + 62, b.y + 66, 30, 26, telhado, cores)
  equipamentos(g, b.x + 66, b.y + 74, 2, cores)
  placa(g, detalhe, 'OPERACIONAL', b.x + 50, b.y + 58, azul, '#ffffff')
  luz(g, b.x + 50, b.y + 28, 12, cores['map-luz-branca'])
}

// Desenha o prédio público. `blocos` são as quadras dele (área útil), na ordem de `inst.quadras`.
export function desenharInstalacao(g: CanvasRenderingContext2D, inst: Instalacao, blocos: Ret[], cores: Cores, detalhe: boolean) {
  if (inst.tipo === 'hospital') {
    if (inst.estilo === 'sul') hospitalSul(g, blocos, cores, detalhe)
    else hospitalNorte(g, blocos, cores, detalhe)
  } else if (inst.tipo === 'samu') samu(g, blocos, cores, detalhe)
  else if (inst.tipo === 'bombeiros') bombeiros(g, blocos, cores, detalhe)
  else delegacia(g, blocos, cores, detalhe)
}

// Rua entre duas quadras vizinhas de um complexo (as quadras vêm inteiras, com calçada).
export function ruaEntre(a: Ret, b: Ret): { ret: Ret; vertical: boolean } {
  if (Math.abs(a.x - b.x) > Math.abs(a.y - b.y)) {
    const [e, d] = a.x < b.x ? [a, b] : [b, a]
    return { ret: { x: e.x + e.w, y: Math.max(a.y, b.y), w: d.x - (e.x + e.w), h: Math.min(a.h, b.h) }, vertical: true }
  }
  const [c, s] = a.y < b.y ? [a, b] : [b, a]
  return { ret: { x: Math.max(a.x, b.x), y: c.y + c.h, w: Math.min(a.w, b.w), h: s.y - (c.y + c.h) }, vertical: false }
}

// Ligação entre as partes de um complexo, desenhada DEPOIS das ruas: uma faixa de pedestres comum no meio
// do trecho e, no Hospital Sul, uma passarela coberta estreita (telhado do hospital, um pouco transparente;
// os veículos passam por cima dela no desenho, então a pista continua visível). `quadras` vêm inteiras.
export function desenharLigacao(g: CanvasRenderingContext2D, inst: Instalacao, quadras: Ret[], cores: Cores) {
  for (let k = 1; k < quadras.length; k++) {
    const { ret: rua, vertical } = ruaEntre(quadras[0], quadras[k])
    if (vertical) faixaPedestres(g, rua.x, rua.y + rua.h * 0.5 - 4, rua.w, 8, true, cores)
    else faixaPedestres(g, rua.x + rua.w * 0.5 - 4, rua.y, 8, rua.h, false, cores)
    if (inst.estilo === 'sul') {
      // na altura do centro cirúrgico e da ala de atendimento
      const y = rua.y + 7 + 50
      sombra(g, cores)
      g.globalAlpha = 0.75
      ret(g, rua.x - 4, y, rua.w + 8, 6, 1.5, cores['map-hosp-telhado'])
      g.globalAlpha = 1
      semSombra(g)
      g.fillStyle = cores['map-realce']
      g.fillRect(rua.x - 4, y + 2.5, rua.w + 8, 1)
    }
  }
}
