# Mudanças do Davi Marchal na simulação

Registro do que foi feito na branch `Davi-Marchal-Organizacao`. Tudo aqui fica só nesta branch; nada vai para a `main` sem o David revisar.

- **Tarefa:** alterar o layout da simulação mantendo a organização do código (pedido do David em 02/11/2026).
- **Base:** commit `aa905a5` da `main` (README completo e remoção do CI).
- **Regra:** o front só desenha, anima e avisa a API. Nenhuma regra de negócio foi adicionada e nenhum hook foi alterado.

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

## 2. Visual profissional no estilo "mapa de navegação" (02/11/2026)

Objetivo: deixar a tela com cara de projeto final. A escolha do estilo foi "mapa de navegação" (parecido com apps de GPS). O tema claro e o escuro continuam automáticos.

### Pedido do professor: não usar a palavra "maquete"

Nos textos da tela, "maquete" virou **simulação** (ou saiu). Ficou de fora, de propósito:
- **Nomes internos do código** (`Maquete.tsx`, `MaquetePage`, nome do repositório): não aparecem na tela; trocar daria muito diff sem ganho visível.
- **RNF08 e RNF13** na aba Requisitos: o texto vem do `docs/referencias/requisitos.json`, que é o documento entregue ao professor e é compartilhado com a API. Ver pendências.

### O que mudou

- **Cores e fontes:** paleta nova (fundo cinza-azulado claro, cards brancos com sombra suave, destaque verde-esmeralda da marca "Corredor Verde"); fontes Inter (texto) e Plus Jakarta Sans (títulos) no lugar de Barlow.
- **Mapa:** ruas brancas com borda, quadras e prédios com sombra leve, parques verde-claro, IDs dos cruzamentos (C1…C20) em selos arredondados, nomes dos prédios especiais sem caixa alta. Faixas de parada, losango de falha, anéis do corredor, rotas, pino da ocorrência e o desenho das viaturas **continuam iguais**.
- **Topo:** título "Corredor Verde", subtítulo "Gestão dinâmica de tráfego com prioridade para veículos de emergência", selo "Em execução"/"Pausada" e o tempo simulado.
- **Card "Situação agora"** (novo): viaturas livres, ocorrências abertas, cruzamentos em corredor e semáforos em falha. Só conta o que vem do `GET /estado`; nenhuma regra fica no front.
- **Rodapé** (novo): "Projeto A3 · Gestão e Qualidade de Software · UNIFACS · Eixo Trânsito".
- **Textos:** títulos em formato de frase (sem caixa alta), "Frota em serviço", "Nível de criticidade", dica da emergência mais curta, título da aba do navegador "Corredor Verde · Gestão Dinâmica de Tráfego".
- **Botões e abas:** botões arredondados (pílula); abas do painel lateral no estilo "segmentado".

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `index.html` | Título da aba e fontes novas (Inter, Plus Jakarta Sans). |
| `src/index.css` | Paleta nova (claro e escuro), tokens `--map-borda`, `--map-sombra` e sombra dos cards (`shadow-cartao`). |
| `src/share/estilos.ts` | Botões em pílula, cards com sombra, títulos sem caixa alta. |
| `src/components/Mapa/desenho.ts` | Borda das ruas, sombra dos prédios e selo dos IDs. |
| `src/components/Mapa/index.tsx` | Redesenha o mapa quando as fontes terminam de carregar. |
| `src/components/Indicadores/` | **Novo.** Card "Situação agora". |
| `src/components/Rodape/` | **Novo.** Rodapé do projeto. |
| `src/components/Topo/` | Título, subtítulo e selo de status. |
| `src/utils/geometria.ts` | Nomes dos prédios especiais em formato normal ("Hospital Norte"). |
| Demais `styles.ts` | Ajustes de cantos, sombras e espaçamentos. |
| `PainelLateral`, `Rodape`, `MaquetePage`, comentários dos hooks | "maquete" → "simulação". |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido no navegador em 1440 px (claro e escuro) e 375 px (celular), com a API falsa.
- Ainda não testado com a API real.

---

## 3. Segunda rodada do visual: ícones, cards e mapa noturno (02/11/2026)

O primeiro visual ficou parecido demais com o antigo no **tema escuro** (que é o que aparece quando o computador está no modo escuro). Esta rodada deixa a diferença bem visível nos dois temas.

### O que mudou

- **Mapa noturno estilo GPS:** paleta azul-marinho; as ruas ficaram bem mais claras que as quadras, então a malha se lê de longe. Os prédios ganharam um realce no telhado (relevo). No tema claro, o mesmo realce em branco.
- **Ícones (SVG próprio, sem biblioteca):** logotipo, cards, botões de emergência, barra do mapa, controles da simulação.
- **Componente `Cartao`:** cabeçalho padrão (ícone + título + subtítulo) usado por "Situação agora", "Registrar emergência" e "Frota em serviço".
- **Topo:** logotipo com gradiente, selo "Simulação", relógio com ícone e um grupo de controles (pausar/continuar, 1×/2×/4× e reiniciar) no lugar de botões soltos e da lista de velocidade.
- **Situação agora:** números grandes com borda colorida (verde, vermelho, azul, amarelo) quando o indicador está ativo.
- **Registrar emergência:** criticidade virou um seletor de 3 botões coloridos (1 Risco de vida, 2 Urgente, 3 Padrão) no lugar da lista. Os dois botões de emergência continuam **com a mesma cor** e agora têm ícone.
- **Frota em serviço:** cada viatura tem um ícone na cor dela (azul ambulância, laranja bombeiros), o papel (Patrulha/Reserva) e o status à direita.
- **Grade:** coluna da esquerda de 264 px para 300 px; painel lateral de 320–380 px para 300–350 px.

O teclado continua igual: o `useTeclado` já tira o foco de qualquer botão depois do clique, então os novos botões de velocidade e criticidade não são acionados pelo espaço ou pelas setas.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/share/icones.tsx` | **Novo.** Ícones em SVG. |
| `src/components/Cartao/` | **Novo.** Card padrão com ícone, título e subtítulo. |
| `src/index.css` | Paleta noturna nova e token `--map-realce`. |
| `src/components/Mapa/desenho.ts` | Realce no telhado dos prédios. |
| `src/components/Topo/` | Logotipo, selo, relógio e grupo de controles. |
| `src/components/Indicadores/` | Usa o `Cartao`; números grandes com borda colorida. |
| `src/components/RegistrarEmergencia/` | Usa o `Cartao`; seletor de criticidade; ícones nos botões. |
| `src/components/PainelViaturas/` | Usa o `Cartao`; ícone, papel e status de cada viatura. |
| `ControleDirecao`, `Falhas`, `share/estilos.ts` | Ícones nos títulos da barra do mapa. |
| `PainelLateral/styles.ts`, `pages/styles.ts` | Destaque ao passar o mouse no log; larguras da grade. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1440 px (claro e escuro) e 375 px (celular), com a API falsa.
- Ainda não testado com a API real.

### Observação para o David

- O evento "Maquete pronta." que aparece no log vem da **API** (o `contrato-api.md` define esse texto no `POST /simulacao/reiniciar`). Para tirar a palavra "maquete" dali, a mudança é na API, por exemplo "Simulação pronta.".

---

## 4. Layout final a partir da imagem de referência (02/11/2026)

O Davi mandou uma imagem de como quer a tela. Esta rodada segue essa imagem.

### Estrutura nova

```
┌──────────────────────────────────────────────────────────────────┐
│ Logo · Corredor Verde [SIMULAÇÃO]     ● Em execução  ⏱  ⏸ 1× 2× 4× ↻ │
├───────────────┬──────────────────────────────────────────────────┤
│ Situação agora│ Dirigir a AMB-01 ← ↑ ↓ → PARE      Falhas  Simular │
│ (4 indicadores│┌────────────────────────────────────────────────┐│
│  com ícone)   ││ cidade vizinha │   GRADE C1–C20   │ cidade vizinha ││
│               ││   (esfumada)   │                  │   (esfumada)   ││
│ Registrar     │└────────────────────────────────────────────────┘│
│ emergência    │ Legenda do mapa ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪                  │
│               │ Log de eventos  [Eventos | Requisitos]             │
│ Frota em      │ Todos · Viaturas · Semáforos · Ocorrências · Sistema│
│ serviço       │ 00:02  RN07 UC01  AMB-01 espera o verde em C2.     │
└───────────────┴──────────────────────────────────────────────────┘
```

- **Duas colunas** a partir de 1080 px: painel de controle à esquerda, mapa + legenda + log à direita. Abaixo disso tudo empilha (mapa, controles, log).
- **Mapa largo:** ocupa toda a largura da coluna. A grade da simulação continua 5×4 com as mesmas constantes (`W`, `H`, `B`, `M`); em volta dela o canvas desenha a **cidade vizinha** (ruas, quadras e parques continuando), esfumada. Os veículos só aparecem dentro da grade.
- **Mais detalhes no mapa:** árvores com copa iluminada, trilhas nos parques, telhados com equipamentos e brilho na cor dos prédios especiais (hospitais, base, quartel).
- **Log de eventos embaixo do mapa** (antes era a coluna da direita), com filtros por categoria: Todos, Viaturas, Semáforos, Ocorrências e Sistema. A **aba Requisitos continua**, agora ao lado de "Eventos" no mesmo painel (é exigida pelo UC10 e pelo passo 7 do roteiro).
- **Indicadores** com ícone; o card acende na cor do indicador quando está ativo.
- **Criticidade** selecionada ganha borda e fundo na cor do nível.
- **Legenda** com título "Legenda do mapa" e explicação das faixas.
- **Topo** com brilho verde suave e selo "Simulação" em verde.

### Decisões que diferem da imagem ou do que estava combinado

- **Botões de emergência:** na imagem o dos bombeiros está só com contorno. Mantive os dois **com a mesma cor** (regra combinada com o grupo e RNF09).
- **Feed das 3 regras mais recentes** (abaixo do mapa): saiu, porque o Log de eventos agora fica logo abaixo e mostra os mesmos eventos. A `FaixaEventos` continua com o aviso do modo de clique e os erros da API (409/400).
- **Pontos de quebra:** eram 3 colunas a partir de 1280 px; agora são 2 colunas a partir de 1080 px, como na imagem.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/components/Mapa/desenho.ts` | `Enquadramento` (grade centralizada no canvas), cidade vizinha esfumada, árvores, telhados, brilho; veículos recortados na grade. |
| `src/components/Mapa/index.tsx` e `styles.ts` | Canvas do tamanho do card; clique convertido com o enquadramento. |
| `src/components/PainelEventos/` | Era `PainelLateral/`. Agora é o Log de eventos horizontal com categorias e a aba Requisitos. |
| `src/utils/categorias.ts` | **Novo.** Agrupa os eventos do log por categoria a partir das tags (só leitura, sem regra). |
| `src/store/useSimulacaoStore.ts` | Estado `categoria` do log. |
| `src/components/FaixaEventos/` | Só aviso do modo de clique e erros. |
| `src/components/Indicadores/`, `RegistrarEmergencia/`, `Legenda/`, `Topo/` | Ícones, cores de destaque, título da legenda e brilho do topo. |
| `src/share/icones.tsx` | Ícones novos: log, semáforo e camadas. |
| `src/index.css` | Tokens `--map-arvore-2` e `--map-telhado`. |
| `src/pages/MaquetePage.tsx` e `styles.ts` | Grade em 2 colunas. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1600×950 (claro e escuro) e 375 px (celular), com a API falsa.
- Clique no mapa testado: C13, C1 e C20 são enviados certinho no `POST /ocorrencias`; a patrulha continua mandando `saida` e `chegada`.
- Ainda não testado com a API real.

---

## 5. Refinamentos de uso: mapa legível, log compacto, interação (02/11/2026)

Lista de melhorias, na ordem de prioridade: contraste do mapa, log compacto, cores das emergências, interação com cruzamentos, legenda em grupos e painel recolhível. A ideia foi refinar sem redesenhar e sem mais brilho ou neon.

### O que mudou

1. **Contraste do mapa (tema escuro):** prédios, telhados, ruas e cruzamentos mais claros que as quadras; faixas das pistas mais visíveis. As **faixas de parada dos semáforos** ficaram um pouco mais grossas e ganharam um contorno escuro, para ler a cor de longe.
2. **Log compacto e recolhível:** cabeçalho numa linha só, filtros numa faixa fina, linhas mais baixas e altura de 200 px. O botão **Recolher** deixa só o cabeçalho, e o **mapa cresce** para ocupar a altura que sobrou.
3. **Botões de emergência com cor própria:** ambulância **azul** e bombeiros **laranja**, as mesmas cores das rotas no mapa. O verde fica para "operação normal" (corredor, status, destaque).
4. **Interação com cruzamentos:**
   - passar o mouse num cruzamento mostra um anel tracejado discreto (e o cursor vira "mãozinha");
   - clicar num cruzamento (fora do modo de emergência ou falha) seleciona ele: anel cheio no mapa e um painel **abaixo do mapa** com Norte-Sul, Leste-Oeste, corredor (reservas e quem passa), viaturas chegando, paradas ou saindo e ocorrências abertas. Tudo vem do `GET /estado`. O "×" fecha.
   - no modo de emergência ou falha, o clique continua registrando como antes.
5. **Legenda em grupos:** Sinalização, Rotas e Ocorrências, cada um com uma chave para **mostrar ou ocultar a camada** no mapa (só visual). Cabe numa linha a 1600 px.
6. **Painel lateral recolhível:** botão no topo do painel. Recolhido, vira uma barra de ícones com abrir, **emergência da ambulância e dos bombeiros (funcionando)** e o número de ocorrências abertas. Só no computador; no celular o painel aparece sempre inteiro.
7. **Legibilidade:** rótulos dos indicadores, subtítulos dos cards, papel e localização das viaturas e criticidade um pouco maiores; cinza dos textos secundários mais claro no escuro e mais escuro no claro.

### Decisão que muda o combinado (para o David aprovar)

- **Botões de emergência:** o `prompt-maquete.md` dizia que os dois têm "a mesma cor (a primária)". Agora são azul e laranja. O RNF09 (no máximo 2 cliques) continua igual.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/index.css` | Contraste do mapa escuro, cinza dos textos, tokens `--rota-amb-fg` e `--rota-bom-fg`. |
| `src/store/useSimulacaoStore.ts` | `selecionado`, `logAberto`, `lateralRecolhida` e `camadas` (só estado de tela). |
| `src/components/Mapa/desenho.ts` | Contorno das faixas de parada, camadas, anel do selecionado e do mouse. |
| `src/components/Mapa/index.tsx` e `styles.ts` | Mouse em qualquer modo, clique seleciona, altura maior com o log recolhido. |
| `src/components/DetalheCruzamento/` | **Novo.** Detalhes do cruzamento clicado, abaixo do mapa. |
| `src/components/PainelControle/` | **Novo.** Coluna da esquerda com o botão de recolher e a barra de ícones. |
| `src/components/PainelEventos/` | Cabeçalho numa linha, filtros compactos, botão Recolher. |
| `src/components/Legenda/` | Grupos com chave de camada. |
| `src/components/RegistrarEmergencia/` | Botões azul e laranja; textos maiores. |
| `src/share/icones.tsx` | Ícones novos: seta, painel e fechar. |
| `src/pages/MaquetePage.tsx` e `styles.ts` | Usa `PainelControle` e `DetalheCruzamento`; grade com painel aberto ou recolhido. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1600×950 (claro e escuro) e 375 px (celular), com a API falsa.
- Testado no navegador: clique em C8 abre os detalhes; recolher o painel deixa o mapa com 1479 px de largura; recolher o log aumenta a altura do mapa; desligar "Sinalização" esconde as faixas de parada; a legenda fica numa linha.
- Ainda não testado com a API real.

---

## 6. Mapa com personalidade, veículos, semáforos, zoom e altura (02/11/2026)

Mais uma lista de melhorias, na ordem: identidade da cidade, veículos, semáforos, legenda, navegação no mapa e aproveitamento da altura. A estrutura, a paleta e o estilo dos botões ficaram como estavam, e não entrou nenhum brilho novo.

### O que mudou

1. **Cidade menos repetitiva:** cada quadra comum sorteia entre parque, **praça** (caminhos em diagonal, canteiro e árvores), **estacionamento** (vagas e carros parados) e quatro arranjos de prédios (prédio grande com pátio, prédio em L, fileira de casas e grade 2×2). Continua plano, visto de cima.
2. **Veículos:**
   - carros comuns ganharam contorno duplo e se destacam do asfalto (o tamanho não mudou);
   - cada viatura tem um halo suave na cor dela;
   - clicar numa viatura no mapa ou no card da **Frota em serviço** seleciona ela: anel, **etiqueta com o nome** e a rota dela em destaque (as outras ficam apagadas). Clicar de novo tira o destaque;
   - com "Eu dirijo" ligado, a AMB-01 mostra a etiqueta "AMB-01 · você".
   - O tamanho e o desenho das viaturas **não mudaram** (comportamento validado com o grupo).
3. **Semáforos mais limpos:** faixas de parada mais curtas e arredondadas, com o vermelho um pouco mais discreto que o verde. O eixo que faz **parte de um corredor** ganha contorno na cor da viatura, então "verde normal" e "verde de corredor" ficam diferentes. No cruzamento selecionado aparecem os rótulos **NS** e **LO** ao lado das faixas.
4. **Legenda numa linha:** quando a legenda não tem largura para os nomes, mostra só as chaves e os símbolos (nome no `title`) e um botão **Nomes** mostra tudo. A partir de ~1060 px de largura da legenda, os nomes aparecem sempre.
5. **Navegação no mapa** (controles na barra acima do mapa, nunca em cima dele):
   - **− / +** e a porcentagem do zoom (100% a 300%);
   - **Centralizar** na viatura selecionada ou, se não houver, no cruzamento selecionado;
   - **Ajustar à tela**: volta a mostrar C1–C20 inteiros;
   - **arrastar** o mapa com o mouse; um arraste não conta como clique (só depois de 4 px);
   - **Ctrl/Cmd + roda** (ou pinça no trackpad) dá zoom no ponto do cursor. A roda sozinha continua rolando a página.
6. **Altura da tela:**
   - a coluna da esquerda tem **rolagem própria** e fica parada enquanto a página rola;
   - o log tem uma **alça no topo**: arrastar para cima ou para baixo muda a altura (130 a 480 px), e o clique duplo volta para 200 px;
   - o mapa usa a altura que sobra (variável CSS `--log-h`).
7. **Painel do cruzamento:** status **Operacional** ou **Em falha**, "Sinal vertical (Norte-Sul)", "Sinal horizontal (Leste-Oeste)", **Corredor prioritário** Ativo ou Inativo (com as viaturas e quem passa), viaturas e ocorrências.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/components/Mapa/desenho.ts` | Praça, estacionamento, arranjos de prédios; faixas de parada novas; halo, marcador e etiqueta das viaturas; rótulos NS/LO; `enquadrar` com zoom e centro. |
| `src/components/Mapa/desenhoVeiculos.ts` | Contorno dos carros comuns. |
| `src/components/Mapa/index.tsx` e `styles.ts` | Clique em viatura, arraste, zoom com a roda, cursores, altura com `--log-h`. |
| `src/utils/visao.ts` | **Novo.** Zoom, centralizar e arrastar (funções puras). |
| `src/components/ControleMapa/` | **Novo.** Botões de zoom, centralizar e ajustar. |
| `src/components/BarraMapa/` | Inclui o `ControleMapa`. |
| `src/components/PainelViaturas/` | Cada viatura vira botão que seleciona e destaca no mapa. |
| `src/components/PainelEventos/` | Alça para mudar a altura do log. |
| `src/components/Legenda/` | Linha única com o botão "Nomes" (container query). |
| `src/components/DetalheCruzamento/` | Status, sinal vertical e horizontal, corredor prioritário. |
| `src/store/useSimulacaoStore.ts` | `viaturaSelecionada`, `logAltura` e `visao`. |
| `src/pages/MaquetePage.tsx` e `styles.ts` | Variável `--log-h`; coluna da esquerda com rolagem própria. |
| `src/share/icones.tsx` | Ícones de zoom, alvo e ajustar. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1440×900 (notebook, claro e escuro) e 375 px (celular, sem rolagem horizontal), com a API falsa.
- Testado no navegador: selecionar a AMB-01 na frota mostra a etiqueta no mapa; clicar em C8 abre o painel com "Operacional" e "Corredor prioritário: Inativo"; dois cliques em "+" levam a 156%; arrastar o mapa move a visão sem trocar o cruzamento selecionado.
- Ainda não testado com a API real.

---

## 7. Correção: mapa piscando de preto ao arrastar (02/11/2026)

### Causa (no código da rodada 6)

1. A cada movimento do mouse, a visão mudava e o `Mapa` chamava `ajustar()`, que **reatribuía `canvas.width` e `canvas.height`**. Mudar o tamanho de um canvas apaga o conteúdo dele. Como isso rodava num `requestAnimationFrame` agendado **depois** do laço de desenho, às vezes o navegador mostrava o quadro já apagado: aparecia o fundo do card (quase preto).
2. A cada pixel arrastado, a **camada fixa inteira** (quadras, prédios com sombra, árvores) era refeita do zero, o que deixava o arraste pesado.
3. O sorteio das quadras usava **um gerador só**, começando na primeira quadra visível. Quando a área desenhada mudava, praças, parques e prédios **trocavam de lugar**.

A simulação (polling de 250 ms) não era a causa: ela não passa por esse caminho.

### Correção

- **Tamanho do canvas** só muda em `redimensionar()` (o card mudou de tamanho, ou o tema mudou). Zoom e arraste chamam `moverCamera()`, que só recalcula o enquadramento.
- **Camada fixa com margem:** é montada cobrindo a tela e mais meia tela de cada lado (`montarCamadaFixa(malha, escala, area, cores)`). No arraste, o laço de desenho só cola essa imagem na posição nova. Ela só é refeita (num `requestAnimationFrame`) quando o zoom muda ou a tela chega perto da borda. Enquanto isso, a camada antiga continua aparecendo (esticada, se o zoom mudou).
- **Fundo estável:** cada quadro pinta o fundo com a cor do chão do mapa, em vez de limpar para transparente.
- **Cidade estável:** cada quadra tem a própria semente, calculada pela posição (`sementeDaQuadra(i, j)`).
- **Limites:** o centro da câmera continua preso dentro de C1–C20, e a margem da camada cobre tudo o que a tela pode mostrar.

### Iluminação

- Os "círculos de luz" perto de C11 e C20 eram os halos das viaturas de **reserva paradas nas bases**. Agora a viatura em reserva não tem halo, e o halo das outras é um degradê suave.
- O brilho do contorno de hospitais, base e quartel caiu de 12 para 5 px, com o contorno um pouco mais transparente.
- **Postes** na esquina de cada cruzamento: um ponto (o poste) e uma luz quente fraca em volta. A luz só aparece no tema escuro.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/components/Mapa/index.tsx` | `redimensionar()` separado de `moverCamera()`; camada refeita só quando precisa. |
| `src/components/Mapa/desenho.ts` | `montarCamadaFixa` recebe a área; `areaVisivel`; `CamadaFixa`; semente por quadra; fundo pintado; halos em degradê; postes; brilho menor. |
| `src/index.css` | Tokens `--map-poste` e `--map-poste-luz`. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Teste automático no navegador (1440×900, tema escuro, zoom 156%): **90 quadros de arraste, 0 quadros vazios**; ~11 ms por quadro (pior caso 13 ms, cerca de 60 quadros por segundo).
- O clique logo depois do arraste não seleciona nada; com zoom de 156%, os cliques acertam C13, C7 e C9.
- **Não deu para testar em 2× ou 4×:** a API falsa sempre devolve velocidade 1. Como o arraste não depende da velocidade da simulação (só da câmera), não deve mudar, mas vale conferir com a API real.

---

## 8. Cidade maior, bairros e prédios públicos redesenhados (02/11/2026)

### O que foi decidido antes

O pedido era expandir para ~80 cruzamentos **funcionais** (10×8). Isso **não dá para fazer só na simulação**: a malha 5×4 e os IDs C1–C20 vêm do `GET /api/v1/malha` (com a conta `linha * colunas + coluna + 1` no contrato), rotas, semáforos e despacho são regras da API (C#), a malha 5×4 está no `requisitos.json` entregue ao professor, e o combinado é não mexer na API sem o David pedir. O Davi escolheu fazer **a parte visual agora**. Os veículos continuam andando só em C1–C20.

> **Proposta para o David (expansão funcional):** mudar o contrato para o `GET /malha` mandar cada cruzamento com `id`, `x`, `y` e a lista de vizinhos (sem depender da conta), aumentar a configuração para 10×8 mantendo C1–C20, ajustar os testes (por exemplo, o menor caminho "para todos os pares") e atualizar o `requisitos.json`. A simulação já desenha a cidade em volta, então do lado da tela falta só passar a ler a malha nova.

### O que mudou

- **Mundo 4× maior e navegável:** a câmera anda pelo dobro da largura e da altura em volta de C1–C20. Fora da área da simulação a cidade fica um pouco mais apagada, e uma linha tracejada marca o limite.
- **Zoom de 65% a 180%** (100% = C1–C20 inteiros), com a roda + Ctrl/Cmd no ponto do cursor, botões −/+, centralizar, ajustar e **tela cheia** (barra, mapa e legenda; Esc sai).
- **Bairros** (`Mapa/cidade.ts`): residencial (casas com quintal, prédios pequenos, praças), comercial (torres de telhado em faixas, centros comerciais com claraboias e estacionamento), industrial (galpões com cumeeira e portas de carga, pátios de caminhões), cívico (prédios administrativos com pátio e mastros) e parques (trilhas, lagos e árvores de tamanhos variados). O centro (C1–C20) mistura tudo. Os bairros são sorteados em manchas de 3×2 quadras, com pesos por lado (oeste mais residencial, leste mais industrial...), para não ficar regular demais.
- **Prédios públicos** (`Mapa/edificios.ts`), cada um com arquitetura própria e, quando faz sentido, ocupando **duas quadras** (uma de cada lado da rua, sem bloquear o trânsito):
  - **Hospital Norte** (C3): duas alas ligadas em H, telhado azul-acinzentado, cruz pequena no telhado, entrada principal com marquise, pronto-socorro com cobertura e vaga de ambulância, luzes brancas; na quadra vizinha, administração e estacionamento de funcionários.
  - **Hospital Sul** (C18): mais horizontal, duas alas compridas com telhado em faixas, entrada principal coberta, pronto atendimento com vaga de ambulância; na quadra vizinha, estacionamento e clínica.
  - **Base do SAMU** (C11): pátio de saída das ambulâncias (onde a reserva estaciona), administração com faixa azul e placa "SAMU 192", garagem com duas portas e luz branca.
  - **Quartel dos Bombeiros** (C20): pátio de manobras com faixa amarela e preta, garagem com três portões vermelho-escuros segmentados e refletores quentes, administração cinza com detalhe vermelho-escuro, placa "BOMBEIROS"; na quadra de cima, pátio de treino com torre.
  - **Delegacia Central** (C7, **nova**): prédio administrativo em L com antena, atendimento ao público com marquise e sinalização azul discreta, placa "POLÍCIA", pátio cercado; do outro lado da rua, estacionamento cercado com viaturas policiais, portão e garagem. É **só ponto de interesse**: não entra no contador de viaturas e não tem ocorrências policiais.
- **Nomes que se adaptam ao zoom:** de perto, uma placa pequena dentro da quadra principal; de longe (zoom baixo), um marcador com símbolo e o nome embaixo. As placas são desenhadas em tamanho de tela, então ficam legíveis em qualquer zoom.
- **Clique nos prédios públicos:** abre um painel abaixo do mapa (`DetalheInstalacao`) com nome, tipo, cruzamento de referência e estado, usando só dados reais:
  - hospital: ambulâncias a caminho dele e atendimentos concluídos ali (das ocorrências do `GET /estado`);
  - SAMU e quartel: viaturas daquela base, com o modo de cada uma, e quantas estão na base;
  - delegacia: aviso de que viaturas policiais ainda não fazem parte da simulação.
  Prioridade do clique: viatura → cruzamento bem perto (até 30 px) → prédio público → cruzamento (até 60 px). Só um painel de detalhes aparece por vez.
- **Iluminação noturna:** janelas acesas em alguns prédios (nem todas), luzes nas entradas, nas garagens, nos estacionamentos e nas trilhas dos parques, e postes nas calçadas (dois por quadra) com luz amarelada suave que não cobre as pistas. No tema claro (dia) essas luzes ficam transparentes.
- **Sem desfoque nas sombras:** a sombra dos prédios virou um deslocamento sem desfoque. Fica igual visualmente e é bem mais barata de desenhar.

### Organização do código

| Arquivo | O que faz |
|---|---|
| `src/share/instalacoes.ts` | **Novo.** Dados dos prédios públicos (tipo, nome, cruzamento, quadras, estilo). É aqui que a polícia pode ganhar viaturas e ocorrências no futuro. |
| `src/components/Mapa/pincel.ts` | **Novo.** Ferramentas de desenho comuns (sombra, luz, árvore, carro parado, prédio, estacionamento, janelas). |
| `src/components/Mapa/cidade.ts` | **Novo.** Bairros e biblioteca de quadras comuns; postes. |
| `src/components/Mapa/edificios.ts` | **Novo.** Arquitetura dos hospitais, SAMU, quartel e delegacia. |
| `src/components/Mapa/desenho.ts` | Ficou só com a montagem da camada fixa e da cena; marcação da área da simulação; etiquetas e contorno dos prédios públicos; `instalacaoEm` para o clique. |
| `src/components/DetalheInstalacao/` | **Novo.** Painel do prédio público clicado. |
| `src/components/ControleMapa/` | Botão de tela cheia. |
| `src/utils/visao.ts` | Zoom 65–180% e limites do mundo (`MUNDO`). |
| `src/utils/geometria.ts` | Saiu o `QUADRA_ESPECIAL` (substituído por `share/instalacoes.ts`). `vagaBase` não mudou. |
| `src/store/useSimulacaoStore.ts` | `instalacaoSelecionada`. |
| `src/index.css` | Tokens novos: água, janelas, luzes (branca, quente, azul), terreno, telhados de hospital e de polícia, concreto, galpão, vermelho-escuro, amarelo de segurança e azul da polícia. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido no navegador em 1440×900, claro e escuro, em 65%, 100% e 180%.
- Clique no Hospital Sul abre o painel com "Cruzamento de referência C18" e "Ambulâncias a caminho: Nenhuma no momento".
- Tempo para refazer a camada fixa (tela 2×): 9 ms em 65%, 4 ms em 100% e 3 ms em 180%, abaixo de um quadro (16 ms). A correção das piscadas (seção 7) continua valendo: o canvas só muda de tamanho quando o card muda.
- Não deu para repetir o teste de quadros vazios nesta rodada porque o painel do navegador estava escondido (o navegador pausa a animação).
- Ainda não testado com a API real.

---

## 9. Complexos que ocupam várias quadras (02/11/2026)

### O problema

Os hospitais, o quartel e a delegacia já estavam desenhados em duas quadras no código (seção 8), mas no mapa **não parecia** uma instalação só: cada quadra lia como um prédio separado, o pronto-socorro do Hospital Norte ficava na quadra principal, e a Base do SAMU usava uma quadra só.

### O que mudou

- **Uma instalação, várias quadras:** `share/instalacoes.ts` continua com **um `id` por instalação** e uma lista de `quadras` (o equivalente a `facilityId` → vários `blockIds`). A primeira quadra é a principal (onde fica o nome). O cruzamento de referência (C3, C18, C11, C20, C7) não mudou, e para as emergências o hospital continua sendo um só.
- **Identidade comum entre as partes:** cada quadra do complexo tem o mesmo terreno com um leve tom da cor da instalação, a mesma borda colorida e uma placa "NOME · FUNÇÃO".
- **Ligação pela rua** (desenhada depois das ruas, sem bloquear nada): faixa de pedestres entre as partes; no Hospital Sul, uma **passarela elevada** semitransparente, com os veículos passando por cima dela no desenho, então a pista continua visível e livre.
- **Função de cada parte:**

| Instalação | Quadra principal | Quadra vizinha |
|---|---|---|
| Hospital Norte (C3) | Prédio principal, ala de internação, recepção envidraçada, entrada de visitantes, jardim | Pronto-socorro, garagem de ambulâncias, desembarque coberto, estacionamento, prédio de apoio |
| Hospital Sul (C18) | Atendimento e alas médicas, entrada coberta, ambulatório | Centro cirúrgico, serviços de apoio, estacionamento (com passarela) |
| Base do SAMU (C11) | Pátio de saída (onde a reserva estaciona), garagem, manutenção | **Nova:** administração, alojamento de descanso, jardim |
| Bombeiros (C20) | Pátio de manobras (onde a reserva estaciona), garagem com três portões, alojamento | Administração, pátio de treino com torre, estacionamento operacional |
| Delegacia (C7) | Prédio principal, recepção, atendimento ao público | Garagem, viaturas, setor operacional |

- **Destaque abrangendo as partes:** ao passar o mouse ou selecionar, **cada quadra** do complexo ganha contorno, e uma linha atravessa a rua ligando as partes. Clicar em qualquer parte abre o mesmo painel.
- **Três tamanhos de construção na cidade:** prédios pequenos dentro de uma quadra, instalações que ocupam a quadra inteira e complexos de **duas quadras** na cidade em volta: shopping (galeria + edifício-garagem e cinema), fábrica (produção com chaminés + depósito e pátio de carga) e campus (administração + biblioteca e gramado), cada um com faixa de pedestres entre as partes. Esses complexos só aparecem fora de C1–C20.
- **Nada mudou na simulação:** ruas, cruzamentos, semáforos, `vagaBase`, rotas e despacho são os mesmos. A rua entre as partes continua igual para os veículos.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/share/instalacoes.ts` | SAMU com duas quadras; comentário explicando que várias quadras são a mesma instalação. |
| `src/components/Mapa/edificios.ts` | Partes de cada complexo redesenhadas; `terreno` comum; `desenharLigacao` (faixa de pedestres e passarela); `COR_INSTALACAO`. |
| `src/components/Mapa/cidade.ts` | `complexoDaQuadra` (pares de quadras), shopping, fábrica, campus e `ligacoesDaCidade`. |
| `src/components/Mapa/pincel.ts` | `faixaPedestres`. |
| `src/components/Mapa/desenho.ts` | Ligações depois das ruas; `destacarComplexo` (contorno em cada quadra + linha de ligação) no mouse e na seleção. |
| `src/components/Mapa/index.tsx` | Guarda a instalação sob o mouse. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Clique em **cada uma das duas quadras** de Hospital Norte, Hospital Sul, SAMU, Bombeiros e Delegacia: as 10 abrem o painel da instalação certa.
- Visual em 1440×900 (escuro), 100% e 180%: Hospital Norte com "INTERNAÇÃO" e "EMERGÊNCIA" em quadras diferentes e a rua entre C8 e C9 no meio; Hospital Sul com a passarela sobre a rua entre C16 e C17; SAMU em C11 e C12; quartel em duas quadras empilhadas.
- Os carros comuns continuaram passando pela rua entre as partes durante o teste (só com a API falsa: rotas e corredor reais ainda dependem da API).

---

## 10. Planejamento urbano: complexos espalhados pela cidade (02/11/2026)

### O problema

Os cinco complexos públicos estavam todos no miolo de C1–C20, quase encostados. Na distribuição antiga, **5 dos 10 pares de instalações estavam colados** (0 quadras entre eles) e nenhum par tinha mais de 1 quadra de distância.

### A restrição que define onde cada um pode ficar

Hospitais e bases **não podem ir para qualquer lugar**: a API manda a ambulância para **C3** (Hospital Norte) e **C18** (Hospital Sul), e as viaturas voltam para **C11** (SAMU) e **C20** (Bombeiros). A simulação estaciona a reserva numa vaga calculada (`vagaBase`) dentro da quadra de C11 e na de C20. Desenhar um hospital longe de C3 deixaria as ambulâncias indo para um lugar sem hospital. Por isso, cada complexo foi para as **quadras em volta do próprio cruzamento de referência**, escolhendo as que mais afastam um do outro e as que avançam pela cidade expandida. A delegacia, que não tem lógica na API, foi para um bairro próprio.

### Nova distribuição

| Instalação | Referência (API) | Antes | Agora | Região |
|---|---|---|---|---|
| Hospital Norte | C3 | (3,1) + (4,1), miolo | **(2,0) + (3,0)**, acima de C3 | Norte |
| Hospital Sul | C18 | (2,3) + (1,3), miolo | **(2,4) + (1,4)**, abaixo de C18 | Sudoeste |
| Base do SAMU | C11 | (1,2) + (2,2) | **(1,2) + (0,2)** | Oeste, entre os hospitais |
| Bombeiros | C20 | (4,3) + (4,2) | **(4,3) + (5,3)**, saída para a avenida do leste | Sudeste |
| Delegacia Central | C5 (só o mais próximo) | (1,1) + (2,1), miolo | **(6,0) + (6,-1)**, fora de C1–C20 | Nordeste, bairro cívico próprio |

Distância mínima entre complexos (quadras comuns entre eles):

| Par | Antes | Agora |
|---|---|---|
| Hospital Norte × Hospital Sul | 1 | **3** |
| Hospital Norte × SAMU | 0 | 1 |
| Hospital Norte × Bombeiros | 0 | **2** |
| Hospital Norte × Delegacia | 0 | **2** |
| Hospital Sul × SAMU | 0 | 1 |
| Hospital Sul × Bombeiros | 1 | 1 |
| Hospital Sul × Delegacia | 1 | **3** |
| SAMU × Bombeiros | 1 | **2** |
| SAMU × Delegacia | 0 | **4** |
| Bombeiros × Delegacia | 1 | **2** |

Os pares com 1 quadra (SAMU com os hospitais, Hospital Sul com os bombeiros) são presos pelos cruzamentos da API (C3, C11, C18 e C20 ficam a poucas quadras uns dos outros). Para afastar mais, seria preciso mudar a configuração da API (`appsettings.json`: `Hospitais` e `Bases`).

O miolo de C1–C20 ficou livre para bairros comuns, e as quadras públicas nunca entram nos complexos comuns da cidade (shopping, fábrica, campus).

### Composição interna (terrenos não 100% construídos)

Cada parte foi redesenhada para a posição nova, com espaço livre para entradas, estacionamento, circulação e jardins. **As entradas de emergência ficam viradas para o cruzamento de referência:** o pronto-socorro do Hospital Norte fica embaixo, perto de C3, o pronto atendimento do Hospital Sul em cima, perto de C18, e os pátios do SAMU e dos bombeiros continuam onde a reserva estaciona. As duas partes de cada complexo têm formatos e tamanhos diferentes, com os mesmos telhados e cores.

### Menos poluição visual

- Sem bordas coloridas permanentes nos complexos (só um tom bem leve no piso). O contorno aparece **só** ao passar o mouse ou selecionar, e sem a linha de ligação por cima da rua.
- Placas das alas (por exemplo "INTERNAÇÃO", "PRONTO-SOCORRO") **só com zoom alto** (~140% ou mais). O nome principal de cada complexo continua sempre visível, uma vez só.
- Faixas de pedestres entre as partes com o mesmo desenho das faixas dos cruzamentos.
- Passarela do Hospital Sul mais estreita, no telhado do hospital, sem contorno colorido nem luz.
- Limite da área da simulação: uma linha fina e discreta (antes era tracejada e verde), desenhada antes das ruas e dos prédios públicos. A cidade em volta continua um pouco mais apagada, mas os complexos e as ruas ficam nítidos.
- Complexos comuns da cidade sem borda.

### Visão geral e 100%

- **Visão geral** (botão de mapa na barra): a cidade inteira de uma vez (zoom 45%), com os prédios públicos como marcadores. O zoom manual continua parando em 65%.
- **100%** agora mostra C1–C20 **com meia quadra de margem**, para os complexos que ficam nas quadras de fora aparecerem inteiros sem arrastar.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/share/instalacoes.ts` | Quadras novas de cada complexo; `foraDaSimulacao` (delegacia). |
| `src/components/Mapa/edificios.ts` | Partes redesenhadas para as posições novas; placas só com `detalhe`; terreno sem borda; ligação mais discreta. |
| `src/components/Mapa/desenho.ts` | Margem no enquadramento de 100%; área da simulação antes dos prédios públicos; destaque sem linha de ligação; `detalhe` pela escala. |
| `src/components/Mapa/cidade.ts` | Quadras públicas nunca entram nos complexos comuns; piso sem borda. |
| `src/components/Mapa/pincel.ts` | Faixa de pedestres no padrão dos cruzamentos. |
| `src/utils/visao.ts` | `ZOOM_GERAL` e `VISAO_GERAL`; o zoom manual não passa de 65% para baixo. |
| `src/components/ControleMapa/` | Botão de visão geral. |
| `src/components/DetalheInstalacao/` | Avisa quando a instalação fica fora da área da simulação. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Script de validação (dados de `instalacoes.ts`): a quadra principal de cada hospital e de cada base **encosta no cruzamento de referência da API**; as quadras principais do SAMU e dos bombeiros continuam sendo as da `vagaBase`; as duas partes de cada complexo são quadras vizinhas (com a rua no meio). Tabela de distâncias acima.
- Clique nas **10 quadras** (2 por complexo): todas abrem o painel certo; C3, entre as duas partes do Hospital Norte, continua abrindo o painel do cruzamento.
- Visual em 1440×900 (escuro): visão geral (45%), 100% (os cinco nomes visíveis) e 151% (Hospital Norte em duas quadras acima de C2–C4, com a rua de C3 entre elas e placas das alas).
- **Não deu para testar o despacho de verdade:** a API falsa recusa as ocorrências (409). Como os cruzamentos de referência (C3, C18, C11, C20) e a `vagaBase` não mudaram, as rotas e o despacho da API real continuam iguais; vale conferir quando a API estiver rodando.

---

## 11. Simulação pronta para a cidade e a polícia funcionais (02/11/2026)

### O que foi pedido e o que dá para fazer

O pedido era deixar a cidade inteira funcional (ruas, semáforos e rotas fora de C1–C20) e criar um sistema de polícia com viaturas, ocorrências e despacho. Pelo contrato, **isso é regra da API** (rotas, despacho, semáforos, corredor). O Davi escolheu **deixar a simulação pronta para quando a API tiver isso**, sem simular regras falsas na tela. A proposta para o David está em **`docs/proposta-cidade-funcional.md`**.

### O que a simulação passou a fazer

- **Tudo vem da malha da API, sem 5×4 fixo:**
  - `W` e `H` saíram de `constantes.ts`; o tamanho do mundo vem de `dimensoes(malha)`;
  - IDs, posições e vizinhos vêm da lista `cruzamentos` do `GET /malha` (com `vizinhos` opcional); a conta `linha * colunas + coluna + 1` ficou só como reserva para malhas sem lista;
  - câmera, 100%, visão geral, limites do mundo, área da simulação, recorte dos veículos e volta dos carros comuns usam a malha recebida (`useMalha` enquadra a câmera assim que ela chega).
- **Prédios públicos montados a partir da malha** (`instalacoesDa(malha)`): os de hoje usam o desenho à mão; hospital ou base novo ganha sozinho duas quadras em volta do próprio cruzamento, longe dos outros complexos. `vagaBase` vale para qualquer base.
- **Polícia pronta e desligada:** `TipoViatura` com `Policia`, cor da polícia (IDs `POL-`), desenho da viatura policial, ícone e contagem na frota, botão "Ocorrência policial" (inclusive na barra recolhida), rota da polícia na legenda e painel da delegacia com as viaturas dela. **Só aparece quando a API mandar uma base `Policia`.** Hoje, nada muda. A delegacia ganhou pátio de viaturas no ponto onde a reserva estaciona, como o SAMU e os bombeiros.

### Itens só de tela

- **Minimapa** ("Mapa da cidade", na coluna da esquerda, fora do mapa): ruas, área da simulação, prédios públicos nas cores de cada tipo, viaturas, ocorrências abertas e o retângulo da câmera. Clicar leva a câmera até o ponto.
- **Centralizar** também no prédio público selecionado (além de viatura e cruzamento).
- **Painéis de detalhe compactos:** título, valores e o × numa linha só (quebram só em telas estreitas).
- **Bairros menos repetitivos:** menos parques e estacionamentos soltos; dois tipos novos de quadra (rua de lojas com toldos e prédios de apartamentos com jardim).
- **Densidade do trânsito** (barra do mapa): Leve (3), **Normal (6, o validado com o grupo)** e Intenso (12) carros comuns. Pelo contrato, os carros comuns são só animação da tela.

### Verificação

- `npm run lint` e `npm run build` passam.
- **Com a API falsa de hoje (5×4):** tudo igual; sem botão de polícia; frota "2 ambulâncias e 2 viaturas dos bombeiros"; minimapa e controle de trânsito aparecem; nenhum erro.
- **Com uma API falsa 10×8** (C1–C20 na posição antiga, C21+ nos novos, 3 hospitais, base de polícia em C29, POL-01 e POL-02):
  - o mapa enquadra os 80 cruzamentos; o C13 continua na coluna 2, linha 2 (a conta daria C23); um cruzamento novo abre como C58;
  - o Hospital Leste ganhou duas quadras sozinho em volta de C69; a delegacia foi para C29 e ficou **Operacional** ("POL-01 patrulhando, POL-02 na base");
  - o botão "Ocorrência policial" e a rota da polícia apareceram; o POST saiu com `"tipo":"Policia"`;
  - "Centralizar" na delegacia funciona e o minimapa mostra a câmera.
- **Não validado (depende da API real):** rotas, despacho, corredor e semáforos reais nos cruzamentos novos; 2× e 4× (a API falsa sempre devolve 1×). A API falsa usada nos testes ficou fora do repositório.

---

## 12. Identidade visual de jogo: câmera de perto e cidade com volume (02/11/2026)

O pedido era deixar o mapa com cara de **jogo de simulação de cidade** (top-down, estilizado, noturno), sem mudar as mecânicas. As imagens de referência vieram só como links externos, então a direção seguiu a descrição do texto. A malha continua sendo a da API (5×4 hoje); a simulação já se adapta a uma malha maior (seção 11).

### Câmera de jogo (a mudança principal)

- **Causa do "tudo pequeno":** o 100% encaixava a malha pela **altura**, e como o card do mapa é bem mais largo que alto, a tela mostrava cerca de 11 quadras de largura.
- **Agora 100% mostra cerca de 5,5 quadras de largura** (`QUADRAS_100` em `utils/visao.ts`), calculado pela largura do mapa, seja qual for a tela. A cidade é explorada arrastando, pelo minimapa ou pelos botões.
- **Ajustar** mostra a malha da simulação inteira; **Visão geral** mostra a cidade toda; o zoom manual vai de 50% a 180%.

### Cidade com volume (2.5D visto de cima)

- **Prédios:** cada um tem uma altura aparente; a fachada (mais escura) aparece embaixo do telhado, com **janelas acesas** só em parte delas; sombra projetada no chão proporcional à altura; borda clara no topo do telhado. Os prédios públicos são mais altos que os comuns.
- **Árvores:** sombra no chão, copa em dois tons e um brilho no topo.
- **Ruas:** meio-fio claro separando pista e calçada; remendos sutis no asfalto (fixos por trecho, sem piscar); árvores nas calçadas das quadras residenciais e do centro; bancos nos parques.
- **Veículos** (mesmo tamanho e cores validados com o grupo): rodas, para-brisa e vidro traseiro, faróis e lanternas; à noite os faróis projetam uma luz suave à frente; o caminhão dos bombeiros tem escada no teto.
- **Curva suave das viaturas:** o ângulo desenhado gira aos poucos até o ângulo real. É só no desenho: a física, o `pode-atravessar`, a `saida` e a `chegada` não mudam.
- **Interface:** os botões ganharam uma resposta leve ao clique (afundam um pouco) e transições suaves.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/utils/visao.ts` | `QUADRAS_100`, `escalaBase`, `visaoAjustada`, `visaoGeral` pelo tamanho do mapa; zoom manual 50–180%. |
| `src/components/Mapa/desenho.ts` | `enquadrar` na escala de jogo; `asfaltoVivo` (remendos e meio-fio); tokens novos. |
| `src/components/Mapa/pincel.ts` | `volume` (sombra, fachada, telhado), `predio` com altura, `janelas` na fachada, `arvore` com sombra, `ehNoite`. |
| `src/components/Mapa/edificios.ts` | `ala` com volume e janelas. |
| `src/components/Mapa/cidade.ts` | Árvores de calçada e bancos nos parques. |
| `src/components/Mapa/desenhoVeiculos.ts` | Rodas, vidros, faróis, lanternas, luz dos faróis à noite, escada dos bombeiros. |
| `src/hooks/useViaturas.ts`, `useCarrosComuns.ts`, `pages/MaquetePage.tsx` | Curva suave (só visual) e faróis à noite. |
| `src/components/ControleMapa/`, `Minimapa/`, `hooks/useMalha.ts` | Botões e minimapa com o enquadramento novo. |
| `src/index.css` | Tokens `--map-fachada` e `--map-meio-fio`. |
| `styles.ts` dos componentes | Resposta ao clique nos botões. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1440×900 (escuro e claro): 100% mostra cerca de 5,5 quadras de largura, com prédios grandes e com volume.
- Arraste: **60 quadros, 0 quadros vazios**, ~11 ms por quadro (pior caso 12 ms).
- Cliques na escala nova: C13 abre o cruzamento; a quadra do SAMU abre a Base do SAMU.
- "Ajustar" vai para 52% (malha inteira) e "Visão geral" para 31% (cidade toda) nessa tela.
- Ainda não testado com a API real (velocidades 2× e 4× incluídas).

---

## 13. Cidade viva: avenidas, ônibus, conjuntos únicos e delegacia na rede (02/11/2026)

A análise que veio pedia 7 mudanças. Duas já estavam feitas na seção 12: o zoom inicial (o 100% já mostra cerca de 5,5 quadras de largura; "65%" era a versão antiga no navegador) e os prédios com volume. O resto entrou agora, sem mexer na estrutura.

### O que mudou

- **Hierarquia de ruas:** a cada 3 ruas, uma é **avenida** (vertical 2, 5, 8...; horizontal 1, 4, 7...). Na malha 5×4: a avenida vertical de C3–C8–C13–C18 (passa entre as partes do Hospital Norte) e a horizontal de C6–C10. As avenidas têm asfalto mais escuro, **canteiro central** estreito com arbustos (no meio, longe das faixas onde os veículos andam) e **postes nas duas calçadas**. As ruas comuns mantêm a faixa tracejada. É só desenho: rede, faixas e semáforos são os mesmos.
- **Ônibus nas avenidas:** além dos carros comuns, 1 (leve), 2 (normal) ou 3 (intenso) ônibus, mais compridos e mais lentos, com fileira de janelas e faróis. Os carros guardam mais distância atrás deles. O número de carros comuns no modo normal continua 6 (o validado); os ônibus são a mais. Pelo contrato, os carros comuns e os ônibus são só animação da tela.
- **Conjuntos únicos** (aparecem pouco, para parecerem únicos): **posto de combustível** (cobertura com bombas e carros abastecendo, conveniência e placa de preços), **supermercado** (faixa colorida, estacionamento com postes e carrinhos), **pracinha com fonte** (espelho d'água e jatos).
- **Telhados com personalidade:** casas com **telhado de duas águas** em cor de telha e cumeeira; **marquise** iluminada na entrada das torres; **heliponto** no Hospital Norte.
- **Iluminação pontual:** luz quente nas **vitrines** das lojas e na frente do supermercado; mais postes nas avenidas; luz branca sob a cobertura do posto.
- **Minimapa menor e recolhível:** 200 px de largura, com botão de recolher no cabeçalho. Continua fora do mapa (regra "nada em cima do mapa").
- **Delegacia na rede de ruas:** saiu da cidade em volta e foi para as quadras **(5,0) e (5,1)**, ao lado de C5 e C10, com o pátio e a entrada virados para a rua de C5–C10 (ruas da simulação). O painel não diz mais "fora da área": diz **"Na rede de ruas; viaturas e ocorrências policiais entram quando a API tiver base de polícia"** e o status "Aguardando a API". Distâncias: 1 quadra do Hospital Norte e 1 do quartel (presos pelos cruzamentos da API).

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/utils/geometria.ts` | `ehAvenidaVertical` e `ehAvenidaHorizontal`. |
| `src/components/Mapa/desenho.ts` | `avenidas()` (asfalto, canteiro, postes); faixa tracejada só nas ruas comuns; token `--map-telha`. |
| `src/utils/movimento.ts`, `hooks/useCarrosComuns.ts`, `share/constantes.ts` | Ônibus nas avenidas (`onibus`, `ONIBUS_POR_DENSIDADE`) e distância maior atrás deles. |
| `src/components/Mapa/desenhoVeiculos.ts` | Desenho do ônibus. |
| `src/components/Mapa/cidade.ts` | `casa` com telhado de duas águas, `posto`, `supermercado`, fonte na praça, marquise das torres, luz das vitrines; distribuição nova. |
| `src/components/Mapa/edificios.ts` | Heliponto no Hospital Norte. |
| `src/share/instalacoes.ts`, `components/DetalheInstalacao/` | Delegacia em (5,0)+(5,1), referência C5; painel "Na rede de ruas / Aguardando a API". |
| `src/components/Minimapa/` | 200 px e botão de recolher. |
| `src/index.css` | Token `--map-telha`. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Visual em 1440×900 (escuro): avenidas com canteiro e postes, ônibus circulando, casas com telhado de telha, minimapa menor.
- Clique nas duas quadras da delegacia: as duas abrem o painel com "Cruzamento de referência C5" e "Na rede de ruas".
- Tempo para refazer a camada fixa (tela 2×): 8 ms em 100%, 12 ms em 50%, 3 ms em 180% e 20 ms na visão geral (só uma vez, ao clicar no botão).
- Ainda não testado com a API real.

---

## 14. Interface sóbria e profissional (fora do mapa) e fundo novo (02/11/2026)

O pedido foi refinar a interface em volta do mapa para ficar profissional e sem "cara de IA", e mudar o fundo. O mapa não mudou.

### O que dava a "cara de IA" e o que entrou no lugar

| Antes | Agora |
|---|---|
| Gradiente com brilho no logotipo e brilho verde radial no topo | Topo em barra simples; logotipo sólido e pequeno |
| Cantos de 16 px e botões em pílula | Cantos de 10 px nos cards e 6 px nos botões (status, pontos e avatares continuam redondos) |
| Ícones dentro de quadradinhos coloridos em todo card | Ícones discretos, em cinza, sem fundo |
| Duas fontes de título (Plus Jakarta + Inter) e pesos 700/800 | Uma fonte só (Inter), hierarquia por tamanho e peso 500/600 |
| Sombras grandes | Sombra quase imperceptível; separação por bordas de 1 px |
| Selo "SIMULAÇÃO" em verde | Selo neutro com borda |
| Status "Em execução" em pílula verde | Ponto verde com anel e texto em cinza |
| Fundo liso | **Grade de pontos bem discreta** e uma faixa de luz suave no topo, nos dois temas |

- Cores de interface mais neutras (cinzas sem tom azul forte no escuro); o verde de destaque ficou menos neon.
- O relógio do topo fica entre divisórias, sem caixa.
- Abas, controles segmentados, chips do log e botões com tamanhos e cantos consistentes.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/index.css` | Tokens de cor e sombra da interface; `--grade` e `--bg-topo`; fundo com grade de pontos; fonte única. |
| `index.html` | Sai a fonte Plus Jakarta Sans. |
| `src/share/estilos.ts` | Botões, títulos de grupo e chips mais sóbrios. |
| `src/components/Cartao/`, `Topo/`, `Indicadores/` | Cabeçalho de card sem quadradinho, topo sem brilho, números sem negrito pesado. |
| Demais `styles.ts` | Cantos menores, botões sem pílula, títulos 600, ícones em cinza. |

### Verificação

- `npm run lint` e `npm run build` passam.
- Conferido em 1440×900 (escuro e claro) e 375 px (celular). A grade de pontos aparece nas margens e entre os cards.

---

## 15. Acabamento de produto: conexão, reações, logotipo, ajuda e tema escuro (02/11/2026)

### O que mudou

- **Tema sempre escuro** (decisão do Davi). Antes seguia o sistema (`prefers-color-scheme`), que estava entre os comportamentos validados com o grupo. Os valores do tema claro ficaram no CSS só como base.
- **Conexão com a API no topo:** "API · 12 ms" (verde), "API offline" (vermelho, piscando) ou "Conectando…". A latência vem do próprio polling do `GET /estado` (250 ms); o topo só redesenha quando o valor muda.
- **Indicadores numa faixa no topo:** "4/4 viaturas livres · 0 ocorrências abertas · 0 em corredor · 0 semáforos em falha". O card "Situação agora" saiu da coluna da esquerda, que ficou só com ações (minimapa, emergência, frota). Em telas menores que 1500 px, a faixa desce para uma segunda linha do topo.
- **A interface reage:**
  - número que muda acende e dá um pequeno salto;
  - evento novo no log acende e apaga devagar (os que já estavam lá ao abrir a página não piscam);
  - despacho que a API aceita (201) mostra "AMB-02 despachada para C16 (OC-002)" com o botão **Seguir viatura**;
  - **seguir viatura:** a câmera acompanha a viatura suavemente; também liga pelo botão novo na barra do mapa (com uma viatura selecionada). Para parar: arrastar o mapa, Esc, "Parar", "Ajustar" ou "Visão geral".
  - Tudo respeita "reduzir movimento" do sistema.
- **Logotipo próprio:** uma via em curva com três sinais, o último aceso (o "corredor verde"). O mesmo desenho virou o **favicon** (`public/favicon.svg`).
- **Primeiros passos:** faixa abaixo do mapa (nunca por cima) com três dicas, "Ver atalhos" e "Entendi" (lembrado pelo navegador).
- **Ajuda (botão "?" no topo):** janela com os atalhos (setas/WASD, espaço, Esc, Ctrl/⌘ + roda, arrastar) e como usar cada parte da tela.

### Arquivos

| Arquivo | O que mudou |
|---|---|
| `src/index.css` | Tema escuro sempre; animações `numero` e `evento-novo`; "reduzir movimento". |
| `src/hooks/useSimulacao.ts`, `store/useSimulacaoStore.ts` | Latência e estado da conexão; `seqInicial`, `aviso`, `seguindo`, `ajudaAberta`. |
| `src/components/Conexao/` | **Novo.** Indicador de conexão. |
| `src/components/Indicadores/` | Virou faixa compacta do topo. |
| `src/components/Topo/` | Faixa de indicadores, conexão, logotipo novo e botão de ajuda. |
| `src/components/FaixaEventos/` | Aviso de despacho com "Seguir viatura" e aviso de câmera seguindo. |
| `src/components/Mapa/index.tsx` | Câmera segue a viatura; arrastar para de seguir. |
| `src/components/ControleMapa/` | Botão "Seguir viatura". |
| `src/components/PainelEventos/` | Evento novo acende. |
| `src/hooks/useEmergencia.ts`, `useTeclado.ts` | Aviso de despacho; Esc para de seguir. |
| `src/components/Ajuda/`, `PrimeirosPassos/` | **Novos.** |
| `src/share/icones.tsx`, `public/favicon.svg`, `index.html` | Marca, ajuda, seguir; favicon e `theme-color`. |

### Verificação

- `npm run lint` e `npm run build` passam.
- No navegador (1440×900): topo com "API · 33 ms" e a faixa de indicadores; card "Situação agora" fora da coluna; primeiros passos abaixo do mapa; ajuda abre e fecha; selecionar a AMB-01 e clicar em "Seguir viatura" mostra "Câmera seguindo AMB-01"; favicon carregado; tema escuro.
- **API offline:** parando a API falsa, o topo mostrou "API offline"; ligando de novo, "API · 6 ms".
- **Não deu para testar com a API falsa:** o aviso de despacho (ela recusa ocorrências com 409) e o log acendendo (o log dela não muda). Os dois dependem da API real.

---

## Pendências

- [ ] Ajustes finos do layout (por exemplo, deixar a barra do mapa numa linha só em 1440 px).
- [ ] Decidir com o David os textos do RNF08 e RNF13 ("A maquete mostra…", "a maquete abre…"), que vêm do `requisitos.json` oficial.
- [ ] Tirar "maquete" do README (o README é do David; combinar antes de mexer).
- [ ] Pedir ao David para trocar o evento "Maquete pronta." da API (texto vem do contrato).
- [ ] David aprovar os botões de emergência azul e laranja (antes era "mesma cor").
- [ ] Levar ao David a `docs/proposta-cidade-funcional.md` (cidade 10×8 e polícia funcionais: contrato, API, testes e `requisitos.json`; a malha maior precisa de alinhamento com o professor).
- [ ] Atualizar a linha do layout na seção "Organização" do README (citar a barra do mapa e a legenda).
- [ ] Print da tela no README (`docs/print-maquete.png`), de preferência já com o layout novo e a API rodando.
- [ ] Verificação final com a API rodando (depende do David terminar a etapa 4 da API).
- [ ] Abrir Pull Request para a `main`: o David revisa o código, eu mostro o visual e ele aprova.

## Observação para rodar no Mac

O Vite 8 precisa do Node 20.19+ ou 22. Se o `npm run dev` der erro de "native binding", rode `nvm use 22` e depois `npm ci`.
