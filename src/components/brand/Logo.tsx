import Image from 'next/image'

/*
  Logo files are used exactly as supplied in the owners' logo packs (public/brand), never redrawn.
  Header and footer are always charcoal, so the lead colourways are enough:
  FMA gold on charcoal, FAA white on charcoal. Never put the gold logo on ivory, and never place
  the two logos side by side.
*/

const FMA_ART = {
  // Brand minimums: horizontal 240 px wide (the SVGs carry a little built-in clear space).
  horizontal: { src: '/brand/fma/horizontal-gold.svg', ratio: 271.8 / 936.3 },
  'horizontal-no-tagline': {
    src: '/brand/fma/horizontal-no-tagline-gold.svg',
    ratio: 177.81 / 866.34,
  },
} as const

const FAA_ART = {
  // Brand minimums: horizontal 220 px, stacked 140 px. Files are trimmed to the artwork.
  horizontal: { src: '/brand/faa/horizontal-white.png', ratio: 226 / 1100 },
  stacked: { src: '/brand/faa/stacked-white.png', ratio: 498 / 720 },
} as const

type LogoProps<V> = { variant: V; width: number; preload?: boolean; className?: string }

export function FmaLogo({ variant, width, preload, className }: LogoProps<keyof typeof FMA_ART>) {
  const art = FMA_ART[variant]
  return (
    <Image
      src={art.src}
      alt="French Medical Aesthetics"
      width={width}
      height={Math.round(width * art.ratio)}
      unoptimized
      preload={preload}
      className={className}
    />
  )
}

export function FaaLogo({ variant, width, preload, className }: LogoProps<keyof typeof FAA_ART>) {
  const art = FAA_ART[variant]
  return (
    <Image
      src={art.src}
      alt="French Aesthetics Academy"
      width={width}
      height={Math.round(width * art.ratio)}
      sizes={`${width}px`}
      preload={preload}
      className={className}
    />
  )
}
