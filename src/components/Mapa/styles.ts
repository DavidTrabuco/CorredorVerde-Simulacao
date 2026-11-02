export const MapaStyles = {
  rolagem: 'overflow-x-auto rounded-[10px] shadow-cartao',
  // no celular a grade ocupa o mapa todo (5:4); no computador o mapa é largo e a cidade continua nas bordas
  wrap: 'relative aspect-[5/4] w-full min-w-[560px] max-w-full overflow-hidden rounded-[10px] border border-line bg-map-chao min-[1080px]:aspect-auto',
  // usa a altura que sobra depois do topo, da barra, da legenda e do log (--log-h, definido na página)
  altura:
    'min-[1080px]:h-[clamp(360px,calc(100vh-208px-var(--log-h)),940px)] [:fullscreen_&]:h-[calc(100vh-150px)] [:fullscreen_&]:min-w-0',
  canvas: 'block h-full w-full touch-manipulation',
  canvasClicavel: 'cursor-crosshair',
  canvasSobreNo: 'cursor-pointer',
  canvasArrastavel: 'cursor-grab',
  canvasArrastando: 'cursor-grabbing',
}
