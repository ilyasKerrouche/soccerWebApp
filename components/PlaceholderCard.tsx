import { useId } from 'react'
import type { Player } from '@/lib/types'

type Props = {
  player: Pick<Player, 'name' | 'position'>
  width: number
  className?: string
}

// Card provvisoria in stile FUT per chi non ha ancora un'immagine.
// Il viewBox 360x500 ha lo stesso rapporto 0.72 delle card reali, e lo scudo
// occupa piu' o meno la stessa area che occupa nelle immagini (che hanno un
// margine attorno). Sotto certe larghezze il testo piccolo sparisce, cosi'
// resta leggibile quello che conta.
const W = 360
const H = 500
const CX = W / 2
const CREAM = '#fbefcf'
const STATS = ['SPD', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY']
const STAT_X = [69, 114, 158, 202, 246, 290]

// Scudo: punta in alto al centro, spalle incurvate, punta in basso.
const SHIELD =
  'M180 50 L198 64 Q206 69 216 67 C252 63 290 72 312 92 L322 100 ' +
  'L322 432 C300 445 252 452 214 457 L180 470 L146 457 ' +
  'C108 452 60 445 38 432 L38 100 L48 92 C70 72 108 63 144 67 Q154 69 162 64 Z'

// Corpo viola: lo stesso scudo rimpicciolito, il resto fa da cornice.
const INNER = `translate(${CX} 260) scale(0.955) translate(${-CX} -260)`

// Testa e spalle generiche al posto della foto.
const SILHOUETTE =
  'M180 112 C210 112 230 136 230 168 C230 196 216 218 198 226 L198 240 ' +
  'C246 246 284 266 296 300 L304 360 L56 360 L64 300 C76 266 114 246 162 240 ' +
  'L162 226 C144 218 130 196 130 168 C130 136 150 112 180 112 Z'

// Array.from conta i caratteri senza spezzare emoji o lettere composte.
function truncate(text: string, maxChars: number) {
  const chars = Array.from(text)
  return chars.length > maxChars ? `${chars.slice(0, maxChars - 1).join('').trimEnd()}…` : text
}

// Stima a occhio della larghezza del testo in grassetto. Se sfora lo spazio
// dentro lo scudo, textLength lo comprime invece di farlo uscire sulla cornice.
function fitProps(text: string, fontSize: number, maxWidth: number) {
  return Array.from(text).length * fontSize * 0.6 > maxWidth
    ? { textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs' as const }
    : {}
}

export default function PlaceholderCard({ player, width, className = '' }: Props) {
  // useId contiene ":" che rompe url(#...) in alcuni browser.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `pc-${uid}-${name}`

  const full = width >= 96
  const tiny = width < 40
  const position = player.position || '—'
  const name = full
    ? truncate(player.name.trim(), 16)
    : truncate(player.name.trim().split(/\s+/)[0], 9)

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width, aspectRatio: '0.72' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`${player.name}, card provvisoria`}
        className="block"
      >
        <defs>
          <linearGradient id={id('frame')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fdf4ff" />
            <stop offset="0.3" stopColor="#d8b4fe" />
            <stop offset="0.55" stopColor="#f5e1ff" />
            <stop offset="0.8" stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#fef3c7" />
          </linearGradient>
          <linearGradient id={id('body')} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="0.45" stopColor="#4c1d95" />
            <stop offset="1" stopColor="#1e0838" />
          </linearGradient>
          <linearGradient id={id('glow')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9d5ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#e9d5ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#e9d5ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('person')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ddd6fe" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ddd6fe" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={id('shade')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#14052b" stopOpacity="0" />
            <stop offset="1" stopColor="#14052b" stopOpacity="0.75" />
          </linearGradient>
          <clipPath id={id('clip')}>
            <path d={SHIELD} transform={INNER} />
          </clipPath>
        </defs>

        {/* Barre luminose ai lati, come le card reali */}
        <rect x="24" y="140" width="4" height="250" rx="2" fill={`url(#${id('glow')})`} />
        <rect x="332" y="140" width="4" height="250" rx="2" fill={`url(#${id('glow')})`} />

        <path d={SHIELD} fill={`url(#${id('frame')})`} />

        <g clipPath={`url(#${id('clip')})`}>
          <rect width={W} height={H} fill={`url(#${id('body')})`} />
          {/* Fasci di luce diagonali */}
          <path d="M40 300 L250 90 L272 90 L62 300 Z" fill="#c4b5fd" opacity="0.12" />
          <path d="M80 330 L300 110 L310 110 L90 330 Z" fill="#fef3c7" opacity="0.14" />
          <path d="M210 470 L330 250 L330 300 L240 470 Z" fill="#a78bfa" opacity="0.12" />
          <path
            d={SILHOUETTE}
            fill={`url(#${id('person')})`}
            // Nelle card piccole la sagoma si stringe a destra per lasciare spazio al testo.
            transform={full ? undefined : 'translate(250 118) scale(0.7) translate(-180 -112)'}
            opacity={full ? 1 : 0.75}
          />
          <rect width={W} height={H} fill={`url(#${id('shade')})`} />
        </g>
        <path d={SHIELD} transform={INNER} fill="none" stroke="#fef3c7" strokeOpacity="0.55" strokeWidth="2" />

        <g fill={CREAM} textAnchor="middle" fontWeight="800">
          {full ? (
            <>
              <text x="78" y="146" fontSize="50" letterSpacing="-1">??</text>
              <text x="78" y="178" fontSize="24">{position}</text>
              <text x={CX} y="350" fontSize="28" {...fitProps(name, 28, 250)}>{name}</text>
              {STATS.map((label, i) => (
                <g key={label}>
                  <text x={STAT_X[i]} y="380" fontSize="15" fontWeight="700">{label}</text>
                  <text x={STAT_X[i]} y="408" fontSize="22">??</text>
                </g>
              ))}
            </>
          ) : (
            <>
              {/* A width=56 servono ~6.4 unita' per pixel: 108 -> ~17px, 62 -> ~10px, 74 -> ~11.5px */}
              <text x={tiny ? CX : 120} y={tiny ? 400 : 184} fontSize={tiny ? 110 : 108} letterSpacing="-3">
                ??
              </text>
              {!tiny && (
                <>
                  <text x="120" y="252" fontSize="62" {...fitProps(position, 62, 150)}>{position}</text>
                  <text x={CX} y="398" fontSize="74" {...fitProps(name, 74, 244)}>{name}</text>
                </>
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  )
}
