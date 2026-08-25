import type { ReaderProfile } from '../data/readerProfile'

export function PlayfulProfileCard({ profile }: { profile: ReaderProfile }) {
  return (
    <section
      aria-label={`Reading profile for ${profile.name}`}
      className="group w-full max-w-md rounded-[28px] border border-orange-100 bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 p-6 shadow-[0_8px_30px_-8px_rgba(251,146,60,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-10px_rgba(251,146,60,0.45)]"
    >
      {/* Header: avatar + name + follow */}
      <header className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${profile.avatarGradient} font-display-warm text-lg font-bold text-white shadow-inner ring-4 ring-white`}
          >
            {profile.avatarInitials}
          </div>
          <span
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow ring-2 ring-white"
            aria-hidden="true"
            title={profile.moodLabel}
          >
            {profile.moodEmoji}
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="truncate font-display-warm text-xl font-bold text-stone-800">{profile.name}</h2>
          <p className="truncate font-sans-warm text-sm font-semibold text-orange-400">{profile.username}</p>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-full bg-stone-800 px-4 py-2 font-sans-warm text-xs font-bold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-stone-900 hover:shadow-md focus-visible:scale-105 active:scale-95"
        >
          + Follow
        </button>
      </header>

      {/* Bio */}
      <p className="mt-4 font-sans-warm text-[13.5px] leading-relaxed text-stone-600">{profile.bio}</p>

      {/* Streak + books this year */}
      <div className="mt-4 flex gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-orange-100">
          <span className="animate-flame-wiggle text-2xl" aria-hidden="true">
            🔥
          </span>
          <div>
            <p className="font-display-warm text-lg font-bold leading-none text-stone-800">{profile.streakDays}</p>
            <p className="font-sans-warm text-[11px] font-medium text-stone-500">day streak</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-orange-100">
          <span className="text-2xl" aria-hidden="true">
            📚
          </span>
          <div>
            <p className="font-display-warm text-lg font-bold leading-none text-stone-800">{profile.booksThisYear}</p>
            <p className="font-sans-warm text-[11px] font-medium text-stone-500">books in 2026</p>
          </div>
        </div>
      </div>

      {/* Currently reading */}
      <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-orange-100">
        <p className="font-sans-warm text-[11px] font-bold uppercase tracking-wide text-orange-400">
          Currently reading
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className={`h-14 w-10 shrink-0 rounded-md ${profile.currentlyReading.coverColor} shadow-sm`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans-warm text-sm font-bold text-stone-800">
              {profile.currentlyReading.title}
            </p>
            <p className="truncate font-sans-warm text-xs text-stone-500">{profile.currentlyReading.author}</p>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100"
              role="progressbar"
              aria-valuenow={profile.currentlyReading.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${profile.currentlyReading.title} reading progress`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                style={{ width: `${profile.currentlyReading.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Favorite genres */}
      <div className="mt-4">
        <p className="font-sans-warm text-[11px] font-bold uppercase tracking-wide text-orange-400">
          Favorite genres
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {profile.favoriteGenres.map((genre) => (
            <li
              key={genre.label}
              className={`rounded-full px-3 py-1 font-sans-warm text-xs font-semibold ${genre.color}`}
            >
              {genre.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Badges + friends */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-sans-warm text-[11px] font-bold uppercase tracking-wide text-orange-400">Badges</p>
          <ul className="mt-2 flex gap-1.5">
            {profile.badges.map((badge) => (
              <li
                key={badge.label}
                title={badge.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow ring-1 ring-orange-100 transition-transform hover:scale-110"
              >
                <span aria-hidden="true">{badge.emoji}</span>
                <span className="sr-only">{badge.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-right">
          <p className="font-sans-warm text-[11px] font-bold uppercase tracking-wide text-orange-400">Friends</p>
          <div className="mt-2 flex">
            {profile.friends.map((friend, i) => (
              <div
                key={friend.initials}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${friend.color} font-sans-warm text-[11px] font-bold text-stone-800 ring-2 ring-orange-50`}
                style={{ marginLeft: i === 0 ? 0 : -10, zIndex: profile.friends.length - i }}
              >
                {friend.initials}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
