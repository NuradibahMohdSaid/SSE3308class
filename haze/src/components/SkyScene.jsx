import { bandFor } from '../data.js'

const HAZE = '#c4b08d'

// A city skyline that disappears layer by layer as the API rises,
// the same way distant buildings vanish first on a hazy day.
function SkyScene({ api }) {
  const haze = Math.min(api / 400, 1)
  const band = bandFor(api)

  return (
    <div className="relative">
      <svg
        viewBox="0 0 800 460"
        className="block w-full"
        role="img"
        aria-label={`City skyline at an API of ${api}, ${band.label.toLowerCase()} air`}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fa9e3" />
            <stop offset="1" stopColor="#d5ebf8" />
          </linearGradient>
        </defs>

        <rect width="800" height="460" fill="url(#sky)" />
        <circle
          className="sky-layer"
          cx="640"
          cy="105"
          r="42"
          fill={haze > 0.45 ? '#e0552c' : '#ffd866'}
        />
        <rect className="sky-layer" width="800" height="460" fill={HAZE} opacity={haze * 0.92} />

        {/* Distant hills */}
        <path
          d="M0 330 Q120 245 240 300 T480 275 T800 300 V460 H0Z"
          fill="#8ea6b8"
        />
        <rect className="sky-layer" width="800" height="460" fill={HAZE} opacity={haze * 0.8} />

        {/* Landmark towers */}
        <g fill="#5f7689">
          <rect x="352" y="170" width="36" height="290" />
          <rect x="358" y="140" width="24" height="30" />
          <rect x="364" y="118" width="12" height="22" />
          <polygon points="370,78 367,118 373,118" />
          <rect x="416" y="170" width="36" height="290" />
          <rect x="422" y="140" width="24" height="30" />
          <rect x="428" y="118" width="12" height="22" />
          <polygon points="434,78 431,118 437,118" />
          <rect x="388" y="272" width="28" height="8" />
          <rect x="560" y="160" width="8" height="300" />
          <ellipse cx="564" cy="158" rx="24" ry="12" />
          <rect x="562.5" y="92" width="3" height="56" />
          <rect x="120" y="250" width="56" height="210" />
          <rect x="196" y="215" width="44" height="245" />
          <rect x="262" y="270" width="60" height="190" />
          <rect x="474" y="240" width="50" height="220" />
          <rect x="610" y="262" width="62" height="198" />
          <rect x="694" y="228" width="46" height="232" />
        </g>
        <rect className="sky-layer" width="800" height="460" fill={HAZE} opacity={haze * 0.62} />

        {/* Nearby rooftops and trees */}
        <g fill="#2c3b49">
          <rect x="0" y="350" width="90" height="110" />
          <rect x="76" y="318" width="64" height="142" />
          <rect x="160" y="366" width="96" height="94" />
          <rect x="276" y="338" width="70" height="122" />
          <rect x="366" y="380" width="110" height="80" />
          <rect x="496" y="330" width="72" height="130" />
          <rect x="588" y="372" width="90" height="88" />
          <rect x="700" y="340" width="100" height="120" />
        </g>
        <g fill="#27432f">
          <circle cx="40" cy="448" r="34" />
          <circle cx="232" cy="452" r="28" />
          <circle cx="420" cy="455" r="30" />
          <circle cx="640" cy="452" r="32" />
          <circle cx="770" cy="450" r="26" />
        </g>
        <rect className="sky-layer" width="800" height="460" fill={HAZE} opacity={haze * 0.38} />
      </svg>

      <span
        className="badge badge-lg absolute bottom-3 left-3 border-0 font-semibold"
        style={{ backgroundColor: band.color, color: band.text }}
      >
        API {api} · {band.label}
      </span>
    </div>
  )
}

export default SkyScene
