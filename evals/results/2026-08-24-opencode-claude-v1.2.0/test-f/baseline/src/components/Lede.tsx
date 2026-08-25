export function Lede() {
  return (
    <section className="border-t border-ink/90 bg-paper">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-7 lg:col-start-1">
          <p className="mb-5 text-[12px] tracking-[0.18em] text-clay uppercase">From the Editor</p>
          <p className="font-display text-[21px] leading-[1.6] text-ink sm:text-[23px]">
            <span className="float-left mr-3 font-display text-[68px] leading-[0.85] font-medium text-ink sm:text-[80px]">
              W
            </span>
            e have spent this issue in the company of buildings that decline to
            announce themselves. Not monuments so much as manners &mdash; a
            weight-bearing wall left honest, a corridor that narrows before it
            opens, a window sized to the hand rather than the skyline. There is
            a confidence in a structure that stops arguing for your attention.
          </p>
          <p className="mt-6 max-w-[620px] font-display text-[21px] leading-[1.6] text-ink sm:text-[23px]">
            Elena Marchetti spent three weeks with the archive of Casa
            Serralves for our lead feature; Tomas Reyes returned with plates
            that read more like weather reports than photographs. Elsewhere,
            a portfolio on load-bearing brick, and a shorter piece on the
            architecture of waiting rooms, of all things.
          </p>
        </div>

        <aside className="border-t border-ink pt-6 lg:col-span-4 lg:col-start-9 lg:border-t-0 lg:border-l lg:pt-1 lg:pl-8">
          <p className="font-display text-[26px] leading-[1.4] text-ink italic sm:text-[28px]">
            &ldquo;A building that whispers outlives the one that shouts.&rdquo;
          </p>
          <p className="mt-4 text-[12px] tracking-[0.1em] text-ink-soft uppercase">
            Elena Marchetti, p. 42
          </p>
        </aside>
      </div>
    </section>
  )
}
