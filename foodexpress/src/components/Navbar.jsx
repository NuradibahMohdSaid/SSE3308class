import { Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, Sun, Moon, User } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { money, useStore } from '../context/StoreContext'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import { Avatar } from './ui'

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/track', label: 'Track Order' },
  { to: '/manage', label: 'For Restaurants' },
]

export default function Navbar({ onOpenMenu, onOpenCart }) {
  const { cartCount, cart, user, logout, toast, theme, setTheme } = useStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0)
  const isDark = theme === 'forkspoon-dark' || theme === 'dark' || theme === 'coffee'

  const submit = (e) => {
    e.preventDefault()
    navigate(`/restaurants?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="navbar bg-base-100/90 border-base-300 sticky top-0 z-40 border-b px-2 backdrop-blur md:px-6">
      <div className="navbar-start gap-1">
        <button className="btn btn-ghost btn-circle lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
          <Menu className="size-5" />
        </button>
        <Logo />
      </div>

      <nav className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1 font-medium">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => (isActive ? 'menu-active' : '')}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-end gap-1">
        <form onSubmit={submit} className="hidden md:block">
          <label className="input input-sm w-44 xl:w-64">
            <Search className="size-4 opacity-50" />
            <input type="search" placeholder="Search food or restaurants" value={q} onChange={(e) => setQ(e.target.value)} />
            <kbd className="kbd kbd-xs hidden xl:inline-flex">↵</kbd>
          </label>
        </form>

        {/* quick light/dark swap; the palette dropdown has more themes */}
        <label className="btn btn-ghost btn-circle swap swap-rotate" aria-label="Toggle dark mode">
          <input type="checkbox" checked={isDark} onChange={() => setTheme(isDark ? 'forkspoon' : 'forkspoon-dark')} />
          <Sun className="swap-off size-5" />
          <Moon className="swap-on size-5" />
        </label>
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>

        {/* cart preview dropdown on desktop, drawer on click */}
        <div className="dropdown dropdown-end dropdown-hover hidden lg:block">
          <button tabIndex={0} className="btn btn-ghost btn-circle" onClick={onOpenCart} aria-label="Open basket">
            <div className="indicator">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <span className="badge badge-sm badge-secondary indicator-item">{cartCount}</span>}
            </div>
          </button>
          <div tabIndex={0} className="card card-sm dropdown-content bg-base-100 z-50 mt-3 w-64 shadow-xl">
            <div className="card-body">
              <span className="text-lg font-bold">{cartCount} items</span>
              <span className="text-base-content/70">Subtotal: {money(subtotal)}</span>
              <div className="card-actions">
                <button className="btn btn-primary btn-block" onClick={onOpenCart}>
                  View basket
                </button>
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-circle lg:hidden" onClick={onOpenCart} aria-label="Open basket">
          <div className="indicator">
            <ShoppingBag className="size-5" />
            {cartCount > 0 && <span className="badge badge-xs badge-secondary indicator-item">{cartCount}</span>}
          </div>
        </button>

        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <Avatar name={user.name} src={user.avatar} size="w-9" />
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow-xl">
              <li className="menu-title">
                <span>Hi, {user.name.split(' ')[0]} 👋</span>
              </li>
              <li><Link to="/account"><User className="size-4" /> My profile</Link></li>
              <li><Link to="/account?tab=orders"><Package className="size-4" /> My orders</Link></li>
              <li><Link to="/account?tab=favourites"><Heart className="size-4" /> Favourites</Link></li>
              <li><Link to="/manage"><LayoutDashboard className="size-4" /> Manage restaurants</Link></li>
              <div className="divider my-0" />
              <li>
                <button
                  className="text-error"
                  onClick={() => {
                    logout()
                    toast('You have been logged out', 'info')
                    navigate('/')
                  }}
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/account" className="btn btn-primary btn-sm ml-1">
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
