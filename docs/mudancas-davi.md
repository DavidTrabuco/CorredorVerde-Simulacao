# Mudanças do Davi Marchal na Maquete

Registro do que foi feito na branch `Davi-Marchal-Organizacao`. Tudo aqui fica só nesta branch; nada vai para a `main` sem o David revisar.

- **Tarefa:** alterar o layout da maquete mantendo a organização do código (pedido do David em 02/11/2026).
- **Base:** commit `aa905a5` da `main` (README completo e remoção do CI).
- **Regra:** a maquete só desenha, anima e avisa a API. Nenhuma regra de negócio foi adicionada e nenhum hook foi alterado.

---

## 1. Layout "mapa protagonista" (02/11/2026)

### Problema do layout anterior

Numa tela de notebook (1440×900):
- o mapa ocupava só metade da largura e sobrava um vazio grande embaixo dele;
- a coluna de controles da esquerda passava da altura da tela;
- a legenda ficava no fim da página, longe do mapa.

### Como ficou

```
┌───────────────────────────────────────────────────────────┐
│ Topo: título · tempo simulado · Pausar · 1× · Reiniciar   │
├─────────────┬───────────────────────────────┬─────────────┤
│ REGISTRAR   │ Dirigir a AMB-01 │ Falhas     │ Log │ Reqs  │
│ EMERGÊNCIA  │┌─────────────────────────────┐│             │
│             ││                             ││             │
│ VIATURAS    ││            MAPA             ││             │
│             ││                             ││             │
│             │└─────────────────────────────┘│             │
│             │ Legenda                       │             │
│             │ 3 regras mais recentes        │             │
└─────────────┴───────────────────────────────┴─────────────┘
```

- **Esquerda:** só as ações principais (Registrar emergência e Viaturas).
- **Centro:** barra de ferramentas (Dirigir a AMB-01 + Falhas), o mapa, a legenda e a faixa de eventos.
- **Direita:** painel lateral com Log e Requisitos (sem mudança).
- Em 1440×900 tudo cabe na tela sem rolar.

### Comportamentos validados pelo grupo que continuam iguais

- Nada em cima do mapa: avisos, mensagens e regras recentes ficam abaixo dele.
- Mesmos pontos de quebra: 3 colunas a partir de 1280 px; entre 1080 e 1279 px os controles descem para baixo do mapa; no celular tudo empilha, com o mapa rolando na horizontal e o botão "Ver requisitos ↓".
- Os dois botões de emergência continuam com a mesma cor (primária).
- Tema claro e escuro por `prefers-color-scheme`.
- Teclado (setas, WASD, espaço, Esc): nenhum hook foi alterado.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/pages/MaquetePage.tsx` | Nova grade de 3 colunas. As classes saíram do JSX. |
| `src/pages/styles.ts` | **Novo.** `MaquetePageStyles`, no mesmo padrão dos componentes. |
| `src/components/BarraMapa/` | **Novo.** Barra acima do mapa que junta `ControleDirecao` e `Falhas`. |
| `src/components/Legenda/` | **Novo.** Legenda (RNF10) em linha, logo abaixo do mapa. |
| `src/components/Falhas/` | Era `FalhasLegenda/`. Ficou só com os botões "Simular falha" e "Desligar todas"; a legenda foi para `Legenda/`. |
| `src/components/ControleDirecao/` | Versão compacta: setas numa linha só e "Eu dirijo". A dica do teclado virou tooltip (`title`). |
| `src/components/Topo/styles.ts` | O topo virou um card (borda e fundo), igual à barra do mapa. |
| `src/share/estilos.ts` | Dois estilos novos compartilhados: `grupo` e `grupoTit`. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido no navegador em 1440 px, 1180 px e 375 px (celular), usando uma API falsa só para desenhar a tela.
- **Ainda não testado com a API real**: patrulha, corredor, emergência e falha de verdade.

---

## Pendências

- [ ] Ajustes finos do layout (por exemplo, deixar a barra do mapa numa linha só em 1440 px).
- [ ] Atualizar a linha do layout na seção "Organização" do README (citar a barra do mapa e a legenda).
- [ ] Print da tela no README (`docs/print-maquete.png`), de preferência já com o layout novo e a API rodando.
- [ ] Verificação final com a API rodando (depende do David terminar a etapa 4 da API).
- [ ] Abrir Pull Request para o David revisar antes de qualquer coisa ir para a `main`.

## Observação para rodar no Mac

O Vite 8 precisa do Node 20.19+ ou 22. Se o `npm run dev` der erro de "native binding", rode `nvm use 22` e depois `npm ci`.
