const COLUMNS: { heading: string; links: string[] }[] = [
  { heading: 'Read', links: ['Features', 'Criticism', 'Gallery', 'Archive'] },
  { heading: 'About', links: ['Masthead', 'Contributors', 'Contact', 'Advertise'] },
  { heading: 'Elsewhere', links: ['Instagram', 'RSS', 'Newsstand'] },
]

export function Footer() {
  return (
    <footer className="border-t border-ink/90 bg-paper-deep">
      <div className="mx-auto max-w-[1440px] px-6 py-14 sm:px-10 lg:py-16">
        <div className="grid grid-cols-2 gap-10 gap-y-10 sm:grid-cols-4 lg:gap-12">
          <div className="col-span-2 sm:col-span-1">
            <span className="block font-display text-[26px] font-medium text-ink">
              Plinth
            </span>
            <p className="mt-3 max-w-[220px] text-[13px] leading-[1.6] text-ink-soft">
              A quarterly journal of architecture and place, since 2013.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 text-[11.5px] tracking-[0.14em] text-ink-soft uppercase">
                {column.heading}
              </p>
              <ul className="space-y-2.5 text-[14px] text-ink-soft">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors hover:text-ink hover:underline hover:decoration-clay hover:decoration-2 hover:underline-offset-4"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-[12px] tracking-[0.02em] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Plinth Journal. All rights reserved.</p>
          <a
            href="#top"
            className="text-ink-soft transition-colors hover:text-ink hover:underline hover:decoration-clay hover:decoration-2 hover:underline-offset-4"
          >
            Back to top &uarr;
          </a>
        </div>
      </div>
    </footer>
  )
}
