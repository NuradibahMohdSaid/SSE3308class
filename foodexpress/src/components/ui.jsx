// Small reusable building blocks shared across pages.
import { Minus, Plus } from 'lucide-react'
import { FALLBACK_IMG } from '../data/restaurants'

export function SafeImage({ src, alt, className = '', ...rest }) {
  return (
    <img
      src={src || FALLBACK_IMG}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = FALLBACK_IMG
      }}
      {...rest}
    />
  )
}

// read-only star rating built with the daisyUI rating + mask components
export function RatingStars({ value, size = 'rating-xs' }) {
  const rounded = Math.round(value)
  return (
    <div className={`rating ${size}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="mask mask-star-2 bg-warning" aria-current={n === rounded ? 'true' : undefined} />
      ))}
    </div>
  )
}

// interactive star input
export function RatingInput({ value, onChange, name = 'rating', size = 'rating-md' }) {
  return (
    <div className={`rating ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <input
          key={n}
          type="radio"
          name={name}
          className="mask mask-star-2 bg-warning"
          aria-label={`${n} star`}
          checked={value === n}
          onChange={() => onChange(n)}
        />
      ))}
    </div>
  )
}

export function QtyStepper({ value, onChange, min = 0, size = 'btn-sm' }) {
  return (
    <div className="join">
      <button
        type="button"
        className={`btn ${size} join-item btn-square`}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </button>
      <span className={`btn ${size} join-item no-animation pointer-events-none min-w-10 font-semibold`}>{value}</span>
      <button
        type="button"
        className={`btn ${size} join-item btn-square btn-primary`}
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export function SectionHeader({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`mb-5 flex items-end justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="text-secondary text-xs font-bold tracking-widest uppercase">{eyebrow}</p>}
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon = '🍽️', title, text, children }) {
  return (
    <div className="hero bg-base-200 rounded-box py-14">
      <div className="hero-content flex-col text-center">
        <div className="text-6xl">{icon}</div>
        <h3 className="text-xl font-bold">{title}</h3>
        {text && <p className="text-base-content/70 max-w-md">{text}</p>}
        {children}
      </div>
    </div>
  )
}

const STATUS_STYLE = ['badge-neutral', 'badge-info', 'badge-warning', 'badge-secondary', 'badge-success']
export function StatusBadge({ status, label }) {
  if (status === -1) return <span className="badge badge-error badge-soft">Cancelled</span>
  return <span className={`badge ${STATUS_STYLE[status]} whitespace-nowrap`}>{label}</span>
}

export function Avatar({ name = '?', src, size = 'w-10', ring = false }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  if (src)
    return (
      <div className="avatar">
        <div className={`${size} rounded-full ${ring ? 'ring-primary ring-offset-base-100 ring-2 ring-offset-2' : ''}`}>
          <img src={src} alt={name} />
        </div>
      </div>
    )
  return (
    <div className="avatar avatar-placeholder">
      <div className={`bg-primary text-primary-content ${size} rounded-full ${ring ? 'ring-primary ring-offset-base-100 ring-2 ring-offset-2' : ''}`}>
        <span className="font-bold">{initials}</span>
      </div>
    </div>
  )
}
