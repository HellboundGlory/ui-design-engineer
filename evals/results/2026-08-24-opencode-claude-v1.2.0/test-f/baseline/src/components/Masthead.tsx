const NAV_LINKS = ['Features', 'Criticism', 'Gallery', 'Archive']

export function Masthead() {
  return (
    <header className="border-b border-ink/90">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2 text-[10.5px] tracking-[0.16em] text-ink-soft uppercase sm:px-10">
        <span>No. 47 &mdash; Autumn 2026</span>
        <span className="hidden sm:inline">Edinburgh &middot; Lisbon &middot; Kyoto</span>
      </div>
      <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 border-t border-line px-6 py-5 sm:px-10">
        <a href="#top" className="leading-none">
          <span className="block font-display text-[34px] font-medium tracking-[-0.01em] text-ink sm:text-[40px]">
            Plinth
          </span>
          <span className="mt-1 block text-[10.5px] tracking-[0.2em] text-ink-soft uppercase font-medium">
            A Journal of Architecture &amp; Place
          </span>
        </a>

        <nav className="hidden items-center gap-8 pb-1 text-[13px] tracking-[0.02em] text-ink md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="border-b border-transparent pb-0.5 transition-colors hover:border-clay hover:text-clay"
            >
              {link}
            </a>
          ))}
        </nav>

        <a
          href="#subscribe"
          className="shrink-0 border border-ink px-4 py-2 text-[12px] tracking-[0.1em] text-ink uppercase transition-colors hover:border-clay hover:bg-clay hover:text-paper"
        >
          Subscribe
        </a>
      </div>
    </header>
  )
}
