import { ArrowUp, Bike, Home, LifeBuoy, MapPin, Plus, Search, Ticket, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { CATEGORIES } from '../data/restaurants'
import CartPanel from './CartPanel'
import { ConfirmDialog, Toaster } from './Feedback'
import Footer from './Footer'
import Logo from './Logo'
import MobileDock from './MobileDock'
import Navbar from './Navbar'
import ThemeSwitcher from './ThemeSwitcher'
import { Avatar } from './ui'

const SIDE_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/restaurants', label: 'Restaurants', icon: Search },
  { to: '/track', label: 'Track order', icon: MapPin },
  { to: '/account', label: 'My account', icon: User },
]

function SideMenu({ onClose }) {
  const { user } = useStore()
  return (
    <div className="bg-base-100 flex min-h-full w-80 flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <Logo />
        <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      {user ? (
        <div className="bg-base-200 rounded-box mb-4 flex items-center gap-3 p-3">
          <Avatar name={user.name} src={user.avatar} />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-base-content/60 text-xs">{user.points} ForkPoints</p>
          </div>
        </div>
      ) : (
        <Link to="/account" className="btn btn-primary mb-4">
          Sign in or register
        </Link>
      )}
      <ul className="menu w-full gap-1 p-0">
        {SIDE_LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'menu-active' : '')}>
              <Icon className="size-4" /> {label}
            </NavLink>
          </li>
        ))}
        <li>
          <details>
            <summary>Cuisines</summary>
            <ul>
              {CATEGORIES.slice(1).map((c) => (
                <li key={c.id}>
                  <Link to={`/restaurants?cat=${encodeURIComponent(c.id)}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
      </ul>
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-sm opacity-70">Light / dark mode</span>
        <ThemeSwitcher />
      </div>
    </div>
  )
}

// floating quick-action button (daisyUI FAB) for desktop
function QuickFab() {
  return (
    <div className="fab hidden lg:flex">
      <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-primary shadow-lg" aria-label="Quick actions">
        <Plus className="size-6" />
      </div>
      <div className="fab-close">
        Close <span className="btn btn-circle btn-lg btn-error"><X className="size-6" /></span>
      </div>
      <div>
        Back to top
        <button className="btn btn-lg btn-circle" onClick={() => window.scrollTo({ top: 0 })} aria-label="Back to top">
          <ArrowUp className="size-5" />
        </button>
      </div>
      <div>
        Promo codes
        <Link to="/#promos" className="btn btn-lg btn-circle" aria-label="Promo codes"><Ticket className="size-5" /></Link>
      </div>
      <div>
        Track my order
        <Link to="/track" className="btn btn-lg btn-circle" aria-label="Track order"><Bike className="size-5" /></Link>
      </div>
      <div>
        Help & FAQ
        <Link to="/#faq" className="btn btn-lg btn-circle" aria-label="Help"><LifeBuoy className="size-5" /></Link>
      </div>
    </div>
  )
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { pathname, hash } = useLocation()

  // close drawers and jump to the top (or to an anchor) when the route changes
  useEffect(() => {
    setMenuOpen(false)
    setCartOpen(false)
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <div className="drawer">
        <input id="nav-drawer" type="checkbox" className="drawer-toggle" checked={menuOpen} onChange={(e) => setMenuOpen(e.target.checked)} />
        <div className="drawer-content flex min-h-screen flex-col">
          <Navbar onOpenMenu={() => setMenuOpen(true)} onOpenCart={() => setCartOpen(true)} />
          <main className="flex-1 overflow-x-clip">
            <Outlet />
          </main>
          <Footer />
        </div>
        <div className="drawer-side z-50">
          <label htmlFor="nav-drawer" aria-label="close sidebar" className="drawer-overlay" />
          <SideMenu onClose={() => setMenuOpen(false)} />
        </div>
      </div>

      <div className="drawer drawer-end">
        <input id="cart-drawer" type="checkbox" className="drawer-toggle" checked={cartOpen} onChange={(e) => setCartOpen(e.target.checked)} />
        <div className="drawer-content" />
        <div className="drawer-side z-50">
          <label htmlFor="cart-drawer" aria-label="close basket" className="drawer-overlay" />
          <CartPanel onClose={() => setCartOpen(false)} />
        </div>
      </div>

      <MobileDock onOpenCart={() => setCartOpen(true)} />
      <QuickFab />
      <Toaster />
      <ConfirmDialog />
    </>
  )
}
