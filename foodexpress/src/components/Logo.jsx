import { Link } from 'react-router-dom'

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <g fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-primary-content">
        <path d="M22 14v14a6 6 0 0 0 6 6v16M22 14v10M28 14v10M34 14v14a6 6 0 0 1-6 6" />
        <ellipse cx="44" cy="22" rx="6" ry="9" />
        <path d="M44 31v19" />
      </g>
    </svg>
  )
}

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <LogoMark />
      <span className={light ? 'text-neutral-content' : ''}>
        Fork<span className="text-primary drop-shadow-sm">Spoon</span>
      </span>
    </Link>
  )
}
