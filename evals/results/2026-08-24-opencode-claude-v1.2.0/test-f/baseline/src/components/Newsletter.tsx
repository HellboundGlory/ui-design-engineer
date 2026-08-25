import { useId, useState } from 'react'

export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')
  const [email, setEmail] = useState('')
  const emailId = useId()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) return
    setStatus('submitted')
  }

  return (
    <section id="subscribe" className="border-t border-ink/90 bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-5">
          <p className="mb-5 text-[12px] tracking-[0.18em] text-clay-soft uppercase">
            The Newsletter
          </p>
          <h2 className="font-display text-[34px] leading-[1.1] font-medium text-paper sm:text-[42px]">
            Four issues a year. Nothing in between.
          </h2>
          <p className="mt-5 max-w-[420px] text-[15px] leading-[1.65] text-paper-dim">
            A short dispatch when a new issue ships — a lead essay, the
            plates we couldn&rsquo;t fit in print, and nothing else. No
            algorithm, no daily digest.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-8">
          {status === 'idle' ? (
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-4 border-b border-paper-dim/40 pb-4 sm:flex-row sm:items-end sm:gap-6">
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full flex-1 rounded-sm border-0 border-b border-paper/70 bg-transparent pb-3 font-display text-[22px] text-paper italic placeholder:text-paper/40 focus:border-clay-soft focus:outline-2 focus:outline-offset-4 focus:outline-clay-soft sm:border-b-0 sm:pb-0"
                />
                <button
                  type="submit"
                  className="shrink-0 border border-paper px-6 py-3 text-[12.5px] font-medium tracking-[0.12em] text-paper uppercase transition-colors hover:border-clay-soft hover:bg-clay-soft hover:text-ink"
                >
                  Subscribe &rarr;
                </button>
              </div>
              <p className="mt-4 text-[12px] leading-[1.6] text-paper-dim/80">
                One email, four times a year. Unsubscribe whenever you like.
              </p>
            </form>
          ) : (
            <div
              role="status"
              className="border-b border-paper-dim/40 pb-6 font-display text-[22px] leading-[1.5] text-paper italic"
            >
              You&rsquo;re on the list — the next issue lands in your inbox
              when it ships.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
