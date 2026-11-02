# Proposta: cidade e polícia funcionais (para o David)

> Escrita pelo Davi Marchal em 02/11/2026. É uma **proposta**: nada disto foi feito na API. A simulação (este repositório) **já está pronta** para tudo o que está aqui e continua funcionando igual com a API de hoje.

## Por que precisa da API

A tabela "Quem faz o quê" do `contrato-api.md` deixa as regras na API: rotas e menor caminho, despacho da viatura mais perto, semáforos, corredor, retorno à base e log. A simulação só desenha, anima e avisa (`saida`, `chegada`, `pode-atravessar`).

Hoje a malha é 5×4 (C1–C20), definida no `appsettings.json` e no `requisitos.json` (o documento entregue ao professor). Para a cidade inteira ter ruas, semáforos e rotas de verdade, e para a delegacia ter viaturas e ocorrências, as mudanças são na API, nos testes e no documento.

## Mudanças propostas

### 1. Contrato (`contrato-api.md`)

**`GET /api/v1/malha`**

- Manter `colunas`, `linhas`, `cruzamentos`, `hospitais` e `bases`.
- **Parar de depender da conta `id = linha * colunas + coluna + 1`.** Cada cruzamento já vem com `id`, `coluna` e `linha`; a simulação passa a usar essa lista. Assim, **C1–C20 mantêm o ID** e os novos ganham **C21, C22...**, sem renumerar nada.
- Campo opcional `vizinhos` por cruzamento, para ruas que não ligam em todas as direções:

```json
{ "id": "C21", "coluna": 5, "linha": 0, "vizinhos": { "O": "C5", "L": "C22", "S": "C26" } }
```

  Sem `vizinhos`, a simulação considera vizinho o cruzamento da coluna/linha ao lado.

**Enums**

- `TipoViatura`: acrescentar **`Policia`**.
- IDs das viaturas policiais com prefixo **`POL-`** (a simulação usa o prefixo para a cor, como já faz com `AMB-` e `BOM-`).

**`POST /api/v1/ocorrencias`**

- Aceitar `{ "tipo": "Policia", "cruzamento": "C58", "criticidade": 2 }`.
- A ocorrência policial não vai a hospital (como a dos bombeiros, RN11): só o trecho até o local, atendimento e volta.

### 2. Configuração (`appsettings.json`)

```json
"Simulacao": {
  "Colunas": 10, "Linhas": 8,
  "Hospitais": [
    { "Id": "H1", "Nome": "Hospital Norte", "Cruzamento": "C3" },
    { "Id": "H2", "Nome": "Hospital Sul", "Cruzamento": "C18" }
  ],
  "Bases": [
    { "Nome": "Base do SAMU", "Cruzamento": "C11", "Tipo": "Ambulancia" },
    { "Nome": "Quartel dos Bombeiros", "Cruzamento": "C20", "Tipo": "Bombeiros" },
    { "Nome": "Delegacia Central", "Cruzamento": "C29", "Tipo": "Policia" }
  ],
  "Viaturas": [
    "... as 4 de hoje ...",
    { "Id": "POL-01", "Tipo": "Policia", "Papel": "Patrulha" },
    { "Id": "POL-02", "Tipo": "Policia", "Papel": "Reserva" }
  ]
}
```

- `Cidade.Reiniciar` passa a gerar os IDs pela regra "C1–C20 na posição antiga, C21+ nos novos" (ou ler a lista pronta da configuração).
- Os hospitais e bases podem continuar em C3, C18, C11 e C20; a simulação desenha cada complexo nas quadras em volta do cruzamento de referência.

### 3. Serviços (C#)

| Service | Mudança |
|---|---|
| `MalhaService` | `Vizinho` e `MenorCaminho` usando a lista de cruzamentos (e `vizinhos`, se houver), não a conta. O BFS não muda. |
| `OcorrenciaService` | Aceitar `Policia`; escolher a viatura policial livre mais perto (mesma regra da RN15). |
| `ViaturaService` | Polícia segue o fluxo dos bombeiros: local → atendimento → patrulha ou volta à base (sem hospital). |
| `SemaforoService` / `CorredorService` | Nada muda na regra; só passam a cobrir os 80 cruzamentos. |
| `Cidade.Reiniciar` | Montar a malha maior e as viaturas policiais. |

### 4. Testes (xUnit)

- Ajustar os testes que contam com 5×4, por exemplo `MenorCaminho_DeveTerOMenorNumeroDeQuarteiroes_ParaTodosOsPares` (passa a ter 80 × 80 pares) e `MenorCaminho_DeveLevarAteCinquentaMs_NaMalhaDeVinteCruzamentos` (RNF07, malha maior).
- Novos testes: ocorrência policial despacha a POL livre mais perto; polícia não vai ao hospital; C1–C20 mantêm o ID na malha maior; todos os cruzamentos alcançáveis a partir de qualquer base (malha conexa); hospitais alcançáveis de todos os bairros.

### 5. Documento de requisitos (`requisitos.json` e o .docx)

- A malha muda de 5×4 para 10×8: **precisa de alinhamento com o professor**, porque é o documento entregue.
- Se a polícia entrar, acrescentar o ator, o caso de uso (por exemplo "Registrar ocorrência policial") e a regra de despacho, ou estender a RN15 e a RN11 para a polícia.

## O que a simulação já faz (pronta para isso)

Testado com uma API falsa 10×8 (C1–C20 na posição antiga, C21+ nos novos, 3 hospitais, base de polícia, POL-01 e POL-02):

- O tamanho do mundo, a câmera, o enquadramento de 100%, o minimapa e a área da simulação vêm da malha (`dimensoes(malha)`), não mais de 750×600 fixos.
- IDs, posições e vizinhos vêm da lista de cruzamentos (com `vizinhos` opcional). O C13 continuou na coluna 2, linha 2 (a conta antiga daria C23 com 10 colunas).
- Hospitais e bases vêm do `GET /malha`. Os de hoje usam o desenho feito à mão; um hospital ou base novo ganha sozinho duas quadras em volta do cruzamento dele (o Hospital Leste do teste foi para C69).
- **Polícia:** com uma base `Policia` na malha, aparecem o botão "Ocorrência policial" (o POST sai com `"tipo": "Policia"`), a rota da polícia na legenda, o desenho da viatura policial, o ícone na frota e o painel da delegacia com as viaturas dela. A delegacia vai para a base que a API mandou e deixa de ser "ponto de interesse". **Sem base de polícia na API (hoje), nada disso aparece.**
- Os carros comuns circulam por todas as ruas da malha que a API mandar e param nos semáforos dela.

O que **não** dá para validar sem a API real: rotas, despacho e corredor nos cruzamentos novos, e o funcionamento em 2× e 4× (a API falsa não aplica velocidade).
