import { ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { computeTotals, money, useStore } from '../context/StoreContext'
import { QtyStepper, SafeImage } from './ui'

// Basket shown inside the right-hand drawer
export default function CartPanel({ onClose }) {
  const { cart, cartRestaurant, setQty, clearCart, confirm } = useStore()
  const totals = computeTotals(cart, cartRestaurant)

  const handleClear = async () => {
    if (await confirm('Clear basket?', 'All items in your basket will be removed.', 'Clear')) clearCart()
  }

  return (
    <aside className="bg-base-100 flex min-h-full w-full max-w-sm flex-col">
      <div className="border-base-300 flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-bold">Your Basket</h2>
          {cartRestaurant && <p className="text-base-content/60 text-sm">from {cartRestaurant.name}</p>}
        </div>
        <div className="flex gap-1">
          {cart.items.length > 0 && (
            <button className="btn btn-ghost btn-sm text-error" onClick={handleClear}>
              Clear all
            </button>
          )}
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close basket">
            <X className="size-5" />
          </button>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="bg-primary/20 grid size-24 place-items-center rounded-full">
            <ShoppingBag className="text-primary size-10" />
          </div>
          <h3 className="font-bold">Your basket is empty</h3>
          <p className="text-base-content/60 text-sm">Hungry? Add something tasty from a restaurant.</p>
          <Link to="/restaurants" className="btn btn-primary" onClick={onClose}>
            Browse restaurants
          </Link>
        </div>
      ) : (
        <>
          <ul className="list flex-1 overflow-y-auto">
            {cart.items.map((i) => (
              <li key={i.key} className="list-row items-center">
                <SafeImage src={i.image} alt={i.name} className="rounded-box size-14 object-cover" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{i.name}</div>
                  <div className="text-base-content/60 truncate text-xs">
                    {[i.options?.size?.label, ...(i.options?.addons || []).map((a) => a.label)].filter(Boolean).join(', ')}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <QtyStepper value={i.qty} onChange={(v) => setQty(i.key, v)} size="btn-xs" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold">{money(i.price * i.qty)}</span>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => setQty(i.key, 0)} aria-label={`Remove ${i.name}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-base-300 bg-base-200 space-y-2 border-t p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>{totals.deliveryFee === 0 ? <span className="badge badge-success badge-sm">FREE</span> : money(totals.deliveryFee)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="text-success flex justify-between"><span>Discount ({cart.promo})</span><span>-{money(totals.discount)}</span></div>
            )}
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(totals.total)}</span></div>
            {cartRestaurant && totals.subtotal < cartRestaurant.minOrder && (
              <div role="alert" className="alert alert-warning alert-soft py-2 text-xs">
                Add {money(cartRestaurant.minOrder - totals.subtotal)} more to reach the minimum order.
              </div>
            )}
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg mt-2" onClick={onClose}>
              Go to checkout
            </Link>
          </div>
        </>
      )}
    </aside>
  )
}
