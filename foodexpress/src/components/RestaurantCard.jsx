import { Bike, Clock, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money, useStore } from '../context/StoreContext'
import { SafeImage } from './ui'

const PRICE = ['', '$', '$$', '$$$']

export default function RestaurantCard({ restaurant: r, layout = 'grid' }) {
  const { favorites, toggleFavorite } = useStore()
  const fav = favorites.includes(r.id)
  // restaurant photo first, then a few dishes revealed on hover (daisyUI hover-gallery)
  const gallery = [r.image, ...r.menu.slice(0, 3).map((m) => m.image)]

  const favButton = (
    <button
      className={`btn btn-circle btn-sm swap swap-rotate bg-base-100/90 absolute top-3 right-3 z-10 border-0 ${fav ? 'swap-active' : ''}`}
      aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
      onClick={(e) => {
        e.preventDefault()
        toggleFavorite(r.id)
      }}
    >
      <Heart className="swap-off size-4" />
      <Heart className="swap-on text-secondary fill-secondary size-4" />
    </button>
  )

  const badges = (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
      {r.promo && <span className="badge badge-secondary badge-sm shadow">🔥 Promo</span>}
      {r.freeDelivery && <span className="badge badge-primary badge-sm shadow">Free delivery</span>}
    </div>
  )

  if (layout === 'list')
    return (
      <Link to={`/restaurant/${r.id}`} className="card card-side bg-base-100 border-base-300 border transition hover:shadow-lg">
        <figure className="relative w-32 shrink-0 sm:w-48">
          <SafeImage src={r.image} alt={r.name} className={`h-full w-full object-cover ${r.isOpen ? '' : 'grayscale'}`} />
          {favButton}
        </figure>
        <div className="card-body gap-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="card-title text-base">{r.name}</h3>
            {!r.isOpen && <span className="badge badge-error badge-sm">Closed</span>}
          </div>
          <p className="text-base-content/60 line-clamp-1 text-sm">{r.description}</p>
          <div className="text-base-content/70 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1"><Star className="fill-warning text-warning size-4" /> {r.rating} ({r.reviews})</span>
            <span>{r.cuisine} · {PRICE[r.price]}</span>
            <span className="flex items-center gap-1"><Clock className="size-4" /> {r.eta[0]}–{r.eta[1]} min</span>
            <span className="flex items-center gap-1"><Bike className="size-4" /> {r.freeDelivery ? 'Free' : money(r.deliveryFee)}</span>
          </div>
          {r.promo && <p className="text-secondary text-xs font-semibold">🎁 {r.promo}</p>}
        </div>
      </Link>
    )

  return (
    <Link
      to={`/restaurant/${r.id}`}
      className="card bg-base-100 border-base-300 group border transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <figure className="relative h-44">
        <div className={`hover-gallery h-full ${r.isOpen ? '' : 'grayscale'}`}>
          {gallery.map((src, i) => (
            <SafeImage key={i} src={src} alt={i === 0 ? r.name : ''} className="h-44 w-full object-cover" />
          ))}
        </div>
        {badges}
        {favButton}
        {!r.isOpen && (
          <div className="bg-neutral/60 absolute inset-0 grid place-items-center">
            <span className="badge badge-lg badge-error">Closed now</span>
          </div>
        )}
      </figure>
      <div className="card-body gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base leading-tight">{r.name}</h3>
          <span className="badge badge-ghost badge-sm shrink-0 gap-1">
            <Star className="fill-warning text-warning size-3" /> {r.rating}
          </span>
        </div>
        <p className="text-base-content/60 text-sm">
          {r.cuisine} · {PRICE[r.price]} · {r.distance} km
        </p>
        <div className="text-base-content/70 mt-1 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1"><Clock className="size-4" /> {r.eta[0]}–{r.eta[1]} min</span>
          <span className="flex items-center gap-1"><Bike className="size-4" /> {r.freeDelivery ? 'Free' : money(r.deliveryFee)}</span>
        </div>
      </div>
    </Link>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="card bg-base-100 border-base-300 border">
      <div className="skeleton h-44 rounded-b-none" />
      <div className="card-body gap-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  )
}
