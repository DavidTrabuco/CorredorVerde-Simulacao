// Grade da página. Acima de 1280 px: controles | mapa | painel lateral.
// Entre 1080 e 1279 px os controles descem para baixo do mapa; abaixo disso tudo empilha.
export const MaquetePageStyles = {
  pagina: 'mx-auto flex max-w-[1560px] flex-col gap-3.5 px-4 pt-3.5 pb-6',
  grade:
    'grid grid-cols-1 gap-3.5 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(330px,400px)] min-[1080px]:items-start min-[1280px]:grid-cols-[264px_minmax(0,1fr)_minmax(320px,380px)]',
  centro:
    'flex min-w-0 flex-col gap-2.5 min-[1080px]:col-start-1 min-[1080px]:row-start-1 min-[1280px]:col-start-2',
  controles:
    'grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 min-[1080px]:col-start-1 min-[1080px]:row-start-2 min-[1280px]:row-start-1 min-[1280px]:grid-cols-1',
  // estica até o fim da grade para o painel (sticky) acompanhar a rolagem
  lateral: 'min-w-0 min-[1080px]:row-span-2 min-[1080px]:self-stretch min-[1280px]:row-span-1',
}
