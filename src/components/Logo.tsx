interface Props {
  size?: number
  /** show wordmark text next to the mark */
  withText?: boolean
  /** rounded square badge background behind the mark (for sidebar/splash) */
  badge?: boolean
}

/**
 * BrainDrop logo — water droplet split down the middle:
 *  left half = brain gyri (outline), right half = blue→indigo gradient fill.
 * Pure SVG: transparent bg, scales to any size, theme-safe.
 */
export default function Logo({ size = 34, withText = false, badge = false }: Props) {
  const uid = 'bd-' + size
  const w = Math.round(size * 0.8) // viewBox is 120×150 → keep 0.8 aspect ratio
  const mark = (
    <svg width={w} height={size} viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BrainDrop">
      <defs>
        <linearGradient id={`${uid}-grad`} x1="60" y1="12" x2="105" y2="142" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.6" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d="M60 12 C92 50 106 78 106 98 A46 46 0 1 1 14 98 C14 78 28 50 60 12 Z" />
        </clipPath>
      </defs>

      {/* Right half — gradient fill, clipped to droplet shape */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="60" y="0" width="60" height="150" fill={`url(#${uid}-grad)`} />
        {/* subtle highlight on the right edge */}
        <path d="M92 60 C100 78 102 92 98 108" stroke="rgba(255,255,255,0.45)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* Droplet outline */}
      <path d="M60 12 C92 50 106 78 106 98 A46 46 0 1 1 14 98 C14 78 28 50 60 12 Z"
        stroke="#4F46E5" strokeWidth="4" fill="none" strokeLinejoin="round" />

      {/* Center divider */}
      <line x1="60" y1="12" x2="60" y2="142" stroke="#4F46E5" strokeWidth="3.5" />

      {/* Left half — brain gyri (stylized), clipped so strokes stay inside */}
      <g clipPath={`url(#${uid}-clip)`} stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M52 44 C40 42 33 50 35 60 C25 62 24 74 33 78 C26 84 30 96 40 96 C42 106 54 106 54 96" />
        <path d="M52 56 C44 56 42 62 47 66" />
        <path d="M52 72 C43 72 41 80 48 84" />
        <path d="M52 44 L52 100" opacity="0.0" />
      </g>
    </svg>
  )

  const badged = badge ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 12, height: size + 12, borderRadius: (size + 12) * 0.3,
      background: 'var(--accent-light)',
    }}>
      {mark}
    </span>
  ) : mark

  if (!withText) return badged

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {badged}
      <span style={{
        fontFamily: 'var(--font)', fontWeight: 700,
        fontSize: size * 0.46, letterSpacing: '-0.3px',
        color: 'var(--text)', whiteSpace: 'nowrap',
      }}>
        Brain<span style={{ color: 'var(--accent)' }}>Drop</span>
      </span>
    </span>
  )
}
