// Minimal line-art motifs used to give placeholder "photography" plates a
// considered, architectural character instead of a flat gradient block.
// Rendered with currentColor so each plate can tint them to its duotone.

export function MotifColonnade() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="150" x2="200" y2="150" stroke="currentColor" strokeWidth="1" />
      {[20, 52, 84, 116, 148, 180].map((x) => (
        <rect key={x} x={x - 4} y="60" width="8" height="90" fill="currentColor" opacity="0.9" />
      ))}
      <line x1="0" y1="56" x2="200" y2="56" stroke="currentColor" strokeWidth="6" />
    </svg>
  )
}

export function MotifFacadeGrid() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={12 + col * 38}
            y={16 + row * 30}
            width="26"
            height="18"
            fill="currentColor"
            opacity={(row + col) % 3 === 0 ? 0.95 : 0.35}
          />
        )),
      )}
    </svg>
  )
}

export function MotifStair() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="10,190 10,160 60,160 60,130 110,130 110,100 160,100 160,70 190,70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line x1="0" y1="190" x2="200" y2="190" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function MotifArch() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M 30 190 L 30 100 A 70 70 0 0 1 170 100 L 170 190"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <line x1="0" y1="190" x2="200" y2="190" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

export function MotifSkylight() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="20" x2="200" y2="180" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <line x1="0" y1="70" x2="200" y2="230" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <line x1="0" y1="230" x2="200" y2="70" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <line x1="0" y1="180" x2="200" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    </svg>
  )
}

export function MotifTower() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <rect x="70" y="20" width="60" height="170" fill="currentColor" opacity="0.85" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="76" y={30 + i * 20} width="48" height="8" fill="var(--color-paper)" opacity="0.5" />
      ))}
    </svg>
  )
}
