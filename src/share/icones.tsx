import type { ReactNode, SVGProps } from 'react'

// Ícones de traço simples (24×24, cor do texto). Sem biblioteca externa.
type IconeProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconeProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconeRota = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
  </Svg>
)

export const IconeAmbulancia = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M3 17V8a1 1 0 0 1 1-1h10v10" />
    <path d="M14 10h3.5L21 13.5V17h-2" />
    <path d="M3 17h2m4 0h6" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M8.5 9.5v4M6.5 11.5h4" />
  </Svg>
)

export const IconeBombeiros = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 21c-4 0-7-2.7-7-6.5 0-3 2-5.2 3.5-6.8.3 1.8 1.2 3 2.5 3.6C11 8 12 5.5 14 3c.5 3 4.9 5.6 4.9 11.5 0 3.8-3 6.5-6.9 6.5Z" />
  </Svg>
)

export const IconeRadar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6H21" />
  </Svg>
)

export const IconeSirene = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
    <path d="M5 18h14v3H5z" />
    <path d="M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4" />
  </Svg>
)

export const IconeFrota = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M5 16V11l2-5h10l2 5v5" />
    <path d="M3 16h18v2H3z" />
    <circle cx="7.5" cy="13" r=".5" />
    <circle cx="16.5" cy="13" r=".5" />
  </Svg>
)

export const IconeVolante = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 14v7M10 12H3.2M14 12h6.8" />
  </Svg>
)

export const IconeAlerta = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
)

export const IconePausar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
)

export const IconeContinuar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M7 4.5v15L19 12Z" />
  </Svg>
)

export const IconeReiniciar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
)

export const IconeRelogio = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)

export const IconeLog = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Svg>
)

export const IconeSemaforo = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="8" y="2" width="8" height="20" rx="3" />
    <circle cx="12" cy="7" r="1.3" />
    <circle cx="12" cy="12" r="1.3" />
    <circle cx="12" cy="17" r="1.3" />
  </Svg>
)

export const IconeCamadas = (p: IconeProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
)

export const IconeSeta = (p: IconeProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const IconePainel = (p: IconeProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </Svg>
)

export const IconeFechar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
)

export const IconeMais = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconeMenos = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const IconeAjustar = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
  </Svg>
)

export const IconeAlvo = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Svg>
)

export const IconeTelaCheia = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
  </Svg>
)

export const IconeSairTelaCheia = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
  </Svg>
)

export const IconeMapa = (p: IconeProps) => (
  <Svg {...p}>
    <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
)

export const IconePolicia = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6Z" />
    <path d="m12 8 1.2 2.6 2.8.3-2.1 1.9.6 2.8L12 14.2l-2.5 1.4.6-2.8L8 10.9l2.8-.3Z" />
  </Svg>
)

export const IconeBussola = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8Z" />
  </Svg>
)

export const IconeSeguir = (p: IconeProps) => (
  <Svg {...p}>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <circle cx="12" cy="12" r="6" />
    <path d="m10 9.5 5 2.5-5 2.5Z" />
  </Svg>
)

// Marca do Corredor Verde: uma via em curva com três sinais; o último, aceso, abre o corredor.
export const IconeMarca = (p: IconeProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M4 20c5-.5 7.5-3.5 8-8s3-7.5 8-8" />
    <circle cx="6.6" cy="18.6" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="17.6" cy="5.2" r="2.2" fill="currentColor" />
  </Svg>
)

export const IconeAjuda = (p: IconeProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.9M12 17h.01" />
  </Svg>
)
