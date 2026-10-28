import { Heart, LogOut, Menu, Package, Search, ShoppingBag, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { money, useStore } from '../context/StoreContext'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import { Avatar } from './ui'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/track', label: 'Track Order' },
]

export default function Navbar({ onOpenMenu, onOpenCart }) {
  const { cartCount, cart, user, logout, toast } = useStore()
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const navigate = useNavigate()
  // at the top of Home the header takes the hero's dark colour so the two read as one block
  const onHero = useLocation().pathname === '/' && !scrolled
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0)

  const submit = (e) => {
    e.preventDefault()
    navigate(`/restaurants?q=${encodeURIComponent(q)}`)
  }

  return (
    // no border line; dark like the hero at the top of Home, page colour (with a soft shadow) once you scroll
    <header className={`navbar sticky top-0 z-40 px-2 transition-colors md:px-6 ${onHero ? 'bg-neutral text-neutral-content [&_.btn-ghost]:text-neutral-content' : 'bg-base-100'} ${scrolled ? 'shadow-sm' : ''}`}>
      {/* start and end take only the space they need, the links fill the middle, so nothing overlaps */}
      <div className="navbar-start w-auto shrink-0 gap-1">
        <button className="btn btn-ghost btn-circle lg:hidden" aria-label="Open menu" onClick={onOpenMenu}>
          <Menu className="size-5" />
        </button>
        <Logo light={onHero} />
      </div>

      <nav className="hidden min-w-0 flex-1 justify-start lg:ml-6 lg:flex">
        <ul className="menu menu-horizontal flex-nowrap gap-1 px-1 font-medium">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => `whitespace-nowrap ${isActive ? (onHero ? 'bg-primary text-primary-content' : 'menu-active') : ''}`}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="navbar-end ml-auto w-auto shrink-0 gap-1">
        {/* full search box when there is room: tablets (no links shown) and very wide screens */}
        <form onSubmit={submit} className="hidden md:block lg:hidden 2xl:block">
          <label className="input input-sm text-base-content w-52 2xl:w-64">
            <Search className="size-4 opacity-50" />
            <input type="search" placeholder="Search food or restaurants" value={q} onChange={(e) => setQ(e.target.value)} />
            <kbd className="kbd kbd-xs hidden 2xl:inline-flex">↵</kbd>
          </label>
        </form>
        {/* on laptop widths the links need the space, so search collapses into an icon */}
        <div className="dropdown dropdown-end hidden lg:block 2xl:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="Search">
            <Search className="size-5" />
          </div>
          <form tabIndex={0} onSubmit={submit} className="dropdown-content bg-base-100 text-base-content rounded-box z-50 mt-3 w-72 p-2 shadow-xl">
            <label className="input w-full">
              <Search className="size-4 opacity-50" />
              <input type="search" placeholder="Search food or restaurants" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </form>
        </div>

        {/* light / dark mode */}
        <ThemeSwitcher />

        {/* cart preview dropdown on desktop, drawer on click */}
        <div className="dropdown dropdown-end dropdown-hover hidden lg:block">
          <button tabIndex={0} className="btn btn-ghost btn-circle" onClick={onOpenCart} aria-label="Open basket">
            <div className="indicator">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <span className="badge badge-sm badge-secondary indicator-item">{cartCount}</span>}
            </div>
          </button>
          <div tabIndex={0} className="card card-sm dropdown-content bg-base-100 text-base-content z-50 mt-3 w-64 shadow-xl">
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
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-50 mt-3 w-56 p-2 shadow-xl">
              <li className="menu-title">
                <span>Hi, {user.name.split(' ')[0]} 👋</span>
              </li>
              <li><Link to="/account"><User className="size-4" /> My profile</Link></li>
              <li><Link to="/account?tab=orders"><Package className="size-4" /> My orders</Link></li>
              <li><Link to="/account?tab=favourites"><Heart className="size-4" /> Favourites</Link></li>
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
