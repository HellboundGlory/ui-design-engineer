import type { ReactNode } from 'react'

export type PlateTone = 'clay' | 'pine' | 'ink' | 'stone'

const TONE_STYLES: Record<PlateTone, { bg: string; fg: string }> = {
  clay: { bg: 'linear-gradient(155deg, #c47a52 0%, #a8492d 55%, #6e2c19 100%)', fg: '#f2ede1' },
  pine: { bg: 'linear-gradient(155deg, #5a6b5c 0%, #37463c 55%, #202a22 100%)', fg: '#f2ede1' },
  ink: { bg: 'linear-gradient(155deg, #46433a 0%, #24221c 55%, #100f0c 100%)', fg: '#e9e1cd' },
  stone: { bg: 'linear-gradient(155deg, #ddd2b4 0%, #c7b98f 55%, #a8965f 100%)', fg: '#1c1a16' },
}

interface PlateProps {
  tone: PlateTone
  motif: ReactNode
  index: string
  caption: string
  className?: string
  /**
   * The image div's only content is absolutely positioned (motif, grain,
   * label), so it has no intrinsic height of its own — it needs either a
   * definite height from an ancestor (grid track, or a parent with h-full
   * driven by its own explicit height) or an explicit floor here. Callers
   * that fully control height elsewhere (e.g. Hero's wrapper) can pass
   * "min-h-0"; the default gives every plate a sane floor at breakpoints
   * where no grid row height is defined (below lg in the Gallery grid).
   */
  imageMinHeight?: string
}

/**
 * Stand-in for editorial photography: a duotone gradient field with a
 * restrained architectural line motif and a plate number, styled the way a
 * printed plate caption would sit under a real photograph. Keeps the layout
 * legible for composition/typography review without real images.
 */
export function Plate({
  tone,
  motif,
  index,
  caption,
  className = '',
  imageMinHeight = 'min-h-[240px] sm:min-h-[280px] lg:min-h-0',
}: PlateProps) {
  const { bg, fg } = TONE_STYLES[tone]
  return (
    <figure className={`group flex flex-col ${className}`}>
      <div
        className={`relative flex-1 overflow-hidden ${imageMinHeight}`}
        style={{ background: bg, color: fg }}
      >
        <div className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40">
          {motif}
        </div>
        <div className="absolute inset-0 bg-grain" />
        <span className="absolute left-3 top-3 font-sans text-[11px] tracking-[0.18em] uppercase" style={{ color: fg, opacity: 0.85 }}>
          {index}
        </span>
      </div>
      <figcaption className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-line pt-2 font-sans text-[11px] tracking-[0.06em] text-ink-soft">
        <span>{caption}</span>
      </figcaption>
    </figure>
  )
}
