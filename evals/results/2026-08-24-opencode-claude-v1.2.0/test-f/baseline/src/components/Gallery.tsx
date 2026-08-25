import { Plate } from './Plate'
import {
  MotifArch,
  MotifFacadeGrid,
  MotifSkylight,
  MotifStair,
  MotifTower,
} from './motifs'

const PLATES = [
  {
    tone: 'pine' as const,
    motif: <MotifFacadeGrid />,
    index: 'Plate II',
    caption: 'Vertical court, Kyoto — light shafts at midday',
    span: 'lg:col-span-4 lg:row-span-2',
  },
  {
    tone: 'stone' as const,
    motif: <MotifSkylight />,
    index: 'Plate III',
    caption: 'Glazing detail, Atelier Voss',
    span: 'lg:col-span-2',
  },
  {
    tone: 'ink' as const,
    motif: <MotifStair />,
    index: 'Plate IV',
    caption: 'Service stair, Lisbon terminal',
    span: 'lg:col-span-2',
  },
  {
    tone: 'clay' as const,
    motif: <MotifArch />,
    index: 'Plate V',
    caption: 'Threshold, Chapel of Rest',
    span: 'lg:col-span-3',
  },
  {
    tone: 'pine' as const,
    motif: <MotifTower />,
    index: 'Plate VI',
    caption: 'Water tower, Douro Valley',
    span: 'lg:col-span-3',
  },
  {
    tone: 'stone' as const,
    motif: <MotifFacadeGrid />,
    index: 'Plate VII',
    caption: 'Curtain wall, Meridian House — full elevation',
    span: 'lg:col-span-6',
  },
]

export function Gallery() {
  return (
    <section id="gallery" className="border-t border-ink/90 bg-paper-dim">
      <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-line pb-8 sm:flex-row sm:items-end lg:mb-16">
          <div>
            <p className="mb-4 text-[12px] tracking-[0.18em] text-clay uppercase">
              Selected Works
            </p>
            <h2 className="font-display text-[36px] leading-[1.1] font-medium text-ink sm:text-[44px]">
              The Collection
            </h2>
          </div>
          <p className="max-w-[360px] text-[14px] leading-[1.6] text-ink-soft">
            Seven plates from this quarter&rsquo;s field work, arranged as they
            ran in print &mdash; unevenly, on purpose.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-6 lg:auto-rows-[200px] lg:gap-x-6 lg:gap-y-12">
          {PLATES.map((plate) => (
            <Plate
              key={plate.index}
              tone={plate.tone}
              motif={plate.motif}
              index={plate.index}
              caption={plate.caption}
              className={plate.span}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
