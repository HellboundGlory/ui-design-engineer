// Domain: "Kindred" — a warm, social reading-tracker app.
// The profile card here is a social artifact: a friend tapping into your
// profile should feel your enthusiasm before they read a single stat. Depth
// is intentionally traded for warmth — mood, streak, and "what I'm reading
// now" carry more weight than precision numbers.

export interface CurrentlyReading {
  title: string
  author: string
  coverColor: string
  progressPct: number
}

export interface Badge {
  emoji: string
  label: string
}

export interface Friend {
  initials: string
  color: string
}

export interface ReaderProfile {
  name: string
  username: string
  avatarInitials: string
  avatarGradient: string
  moodEmoji: string
  moodLabel: string
  bio: string
  streakDays: number
  booksThisYear: number
  currentlyReading: CurrentlyReading
  favoriteGenres: { label: string; color: string }[]
  badges: Badge[]
  friends: Friend[]
}

export const readerProfile: ReaderProfile = {
  name: 'Marisol Vega',
  username: '@marisolreads',
  avatarInitials: 'MV',
  avatarGradient: 'from-rose-300 via-orange-200 to-amber-200',
  moodEmoji: '🌻',
  moodLabel: 'cozy & curious',
  bio: 'Currently obsessed with slow mysteries and anything with a map in the front cover.',
  streakDays: 42,
  booksThisYear: 27,
  currentlyReading: {
    title: 'The Lighthouse Keeper’s Daughter',
    author: 'Noor Al-Sayed',
    coverColor: 'bg-gradient-to-br from-sky-400 to-indigo-500',
    progressPct: 68,
  },
  favoriteGenres: [
    { label: 'Cozy Mystery', color: 'bg-rose-100 text-rose-700' },
    { label: 'Magical Realism', color: 'bg-violet-100 text-violet-700' },
    { label: 'Travel Memoir', color: 'bg-amber-100 text-amber-700' },
    { label: 'Historical Fic', color: 'bg-teal-100 text-teal-700' },
  ],
  badges: [
    { emoji: '🔥', label: '40-Day Streak' },
    { emoji: '🗺️', label: 'World Wanderer' },
    { emoji: '🌙', label: 'Night Owl' },
  ],
  friends: [
    { initials: 'JT', color: 'bg-sky-300' },
    { initials: 'RK', color: 'bg-emerald-300' },
    { initials: 'AH', color: 'bg-fuchsia-300' },
    { initials: 'LB', color: 'bg-amber-300' },
  ],
}
