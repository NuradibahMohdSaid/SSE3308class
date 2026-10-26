import { Home, MapPin, Search, ShoppingBag, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

// daisyUI dock: bottom navigation for phones
export default function MobileDock({ onOpenCart }) {
  const { cartCount } = useStore()
  const item = ({ isActive }) => (isActive ? 'dock-active text-primary-content' : '')
  return (
    <nav className="dock dock-md bg-base-100 border-base-300 z-40 border-t lg:hidden">
      <NavLink to="/" end className={item}>
        <Home className="size-5" />
        <span className="dock-label">Home</span>
      </NavLink>
      <NavLink to="/restaurants" className={item}>
        <Search className="size-5" />
        <span className="dock-label">Explore</span>
      </NavLink>
      <button onClick={onOpenCart} aria-label="Open basket">
        <span className="indicator">
          <span className="bg-primary text-primary-content grid size-11 -translate-y-3 place-items-center rounded-full shadow-lg">
            <ShoppingBag className="size-5" />
          </span>
          {cartCount > 0 && <span className="badge badge-secondary badge-xs indicator-item -translate-y-3">{cartCount}</span>}
        </span>
      </button>
      <NavLink to="/track" className={item}>
        <MapPin className="size-5" />
        <span className="dock-label">Track</span>
      </NavLink>
      <NavLink to="/account" className={item}>
        <User className="size-5" />
        <span className="dock-label">Account</span>
      </NavLink>
    </nav>
  )
}
