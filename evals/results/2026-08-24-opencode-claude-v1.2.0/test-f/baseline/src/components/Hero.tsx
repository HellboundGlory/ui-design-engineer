import { Plate } from './Plate'
import { MotifColonnade } from './motifs'

export function Hero() {
  return (
    <section id="top" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
        <div className="order-2 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:order-1 lg:col-span-7 lg:py-24 lg:pr-14">
          <div className="max-w-[640px]">
            <p className="mb-6 flex items-center gap-3 text-[12px] tracking-[0.18em] text-clay uppercase">
              <span className="h-px w-8 bg-clay" aria-hidden="true" />
              Issue No. 47 &mdash; Feature
            </p>

            <h1 className="font-display text-[44px] leading-[1.04] font-medium tracking-[-0.015em] text-ink text-balance sm:text-[58px] lg:text-[68px]">
              The Grammar of{' '}
              <span className="italic font-normal">Light</span> and Weight
            </h1>

            <p className="mt-7 max-w-[480px] font-display text-[19px] leading-[1.55] text-ink-soft italic sm:text-[21px]">
              Ten essays on the architecture of restraint &mdash; how mass, shadow, and
              silence still shape the rooms we live in.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 text-[12.5px] tracking-[0.03em] text-ink-soft">
              <span>Words by Elena Marchetti</span>
              <span className="h-1 w-1 rounded-full bg-ink-faint" aria-hidden="true" />
              <span>Photography by Tomas Reyes</span>
              <span className="h-1 w-1 rounded-full bg-ink-faint" aria-hidden="true" />
              <span>14 min read</span>
            </div>

            <a
              href="#gallery"
              className="mt-10 inline-flex items-center gap-2 text-[14px] font-medium tracking-[0.02em] text-ink underline decoration-clay decoration-2 underline-offset-[6px] transition-colors hover:text-clay"
            >
              Read the Feature
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        <div className="order-1 min-h-[52vw] sm:min-h-[420px] lg:order-2 lg:col-span-5 lg:min-h-[calc(100vh-140px)]">
          <Plate
            tone="clay"
            motif={<MotifColonnade />}
            index="Plate I"
            caption="Portico, Casa Serralves — study in repetition"
            className="h-full"
            imageMinHeight="min-h-0"
          />
        </div>
      </div>
    </section>
  )
}
