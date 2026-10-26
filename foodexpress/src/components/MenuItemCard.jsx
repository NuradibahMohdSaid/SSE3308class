import { Flame, Leaf, Plus, Sparkles } from 'lucide-react'
import { money } from '../context/StoreContext'
import { SafeImage } from './ui'

export function ItemTags({ tags = [] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.includes('popular') && <span className="badge badge-primary badge-xs">⭐ Popular</span>}
      {tags.includes('new') && (
        <span className="badge badge-accent badge-xs gap-0.5"><Sparkles className="size-3" /> New</span>
      )}
      {tags.includes('spicy') && (
        <span className="tooltip" data-tip="Spicy">
          <span className="badge badge-secondary badge-soft badge-xs"><Flame className="size-3" /></span>
        </span>
      )}
      {tags.includes('veg') && (
        <span className="tooltip" data-tip="Vegetarian">
          <span className="badge badge-success badge-soft badge-xs"><Leaf className="size-3" /></span>
        </span>
      )}
    </div>
  )
}

export default function MenuItemCard({ item, qtyInCart = 0, disabled, onSelect }) {
  const soldOut = !item.available
  return (
    <div
      className={`card card-side bg-base-100 border-base-300 border transition hover:shadow-md ${soldOut || disabled ? 'opacity-60' : 'cursor-pointer'}`}
      onClick={() => !soldOut && !disabled && onSelect(item)}
    >
      <div className="card-body gap-1 p-4">
        <ItemTags tags={item.tags} />
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-base-content/60 line-clamp-2 text-sm">{item.desc}</p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="font-bold">{money(item.price)}</span>
          {soldOut && <span className="badge badge-error badge-sm">Sold out</span>}
          {qtyInCart > 0 && <span className="badge badge-neutral badge-sm">{qtyInCart} in basket</span>}
        </div>
      </div>
      <figure className="relative w-28 shrink-0 p-3 sm:w-36">
        <SafeImage src={item.image} alt={item.name} className="rounded-box aspect-square h-auto w-full object-cover" />
        {!soldOut && !disabled && (
          <button className="btn btn-primary btn-circle btn-sm absolute right-2 bottom-2 shadow-md" aria-label={`Add ${item.name}`}>
            <Plus className="size-4" />
          </button>
        )}
      </figure>
    </div>
  )
}
