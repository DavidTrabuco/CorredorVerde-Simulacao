// Grade da página. A partir de 1080 px: painel de controle à esquerda | mapa, legenda e log à direita.
// Abaixo disso tudo empilha: mapa, controles e log.
export const MaquetePageStyles = {
  pagina: 'mx-auto flex max-w-[1680px] flex-col gap-3.5 px-4 pt-3.5 pb-6',
  // a 2ª linha (log) absorve a sobra de altura da coluna da esquerda, sem abrir espaço entre a legenda e o log
  grade:
    'grid grid-cols-1 gap-3.5 min-[1080px]:grid-rows-[auto_1fr] min-[1080px]:items-start',
  gradeAberta: 'min-[1080px]:grid-cols-[300px_minmax(0,1fr)]',
  // painel recolhido: sobra só a barra de ícones e o mapa fica quase em tela cheia
  gradeRecolhida: 'min-[1080px]:grid-cols-[58px_minmax(0,1fr)]',
  // em tela cheia a seção ganha fundo e respiro próprios
  centro:
    'flex min-w-0 flex-col gap-2.5 min-[1080px]:col-start-2 min-[1080px]:row-start-1 [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-bg [&:fullscreen]:p-4',
  controles:
    'grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 min-[1080px]:sticky min-[1080px]:top-3 min-[1080px]:col-start-1 min-[1080px]:row-span-2 min-[1080px]:row-start-1 min-[1080px]:max-h-[calc(100vh-24px)] min-[1080px]:grid-cols-1 min-[1080px]:overflow-y-auto min-[1080px]:pr-1 min-[1080px]:[scrollbar-width:thin]',
  eventos: 'min-w-0 min-[1080px]:col-start-2 min-[1080px]:row-start-2',
}
