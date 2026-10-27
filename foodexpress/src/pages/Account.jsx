import { Bell, Eye, EyeOff, Heart, KeyRound, LogOut, Mail, MapPin, Package, Pencil, Phone, Plus, Settings, Trash2, User } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { THEMES } from '../data/themes'
import { Avatar, EmptyState, SafeImage, StatusBadge } from '../components/ui'
import { getOrderStatus, money, uid, useNow, useStore } from '../context/StoreContext'
import { ORDER_STEPS } from '../data/restaurants'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'favourites', label: 'Favourites', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
]
const TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 250 },
  { name: 'Gold', min: 500 },
  { name: 'Platinum', min: 1000 },
]

function passwordStrength(pw) {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

/* ---------------------------- AUTH ---------------------------- */
function AuthCard() {
  const { login, toast } = useStore()
  const [mode, setMode] = useState('login')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', agree: false })
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const strength = passwordStrength(form.password)

  const submit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && form.password !== form.confirm) return toast('Passwords do not match', 'error')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    // demo auth: the password is only validated, never stored
    const name = mode === 'register' ? form.name : form.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    login({ name, email: form.email, phone: form.phone })
    setLoading(false)
    toast(mode === 'register' ? `Welcome to ForkSpoon, ${name}! 🎉` : `Welcome back, ${name}!`)
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold">Hungry? <span className="text-primary">Sign in</span> and let's eat.</h1>
        <p className="text-base-content/70 mt-3">Save your addresses, track orders live, collect ForkPoints and reorder favourites in one tap.</p>
        <div className="stack mt-8 w-80">
          <div className="card bg-primary text-primary-content shadow-md"><div className="card-body">🍔 Earn 1 ForkPoint for every RM1 spent</div></div>
          <div className="card bg-secondary text-secondary-content shadow-md"><div className="card-body">🛵 Live rider tracking</div></div>
          <div className="card bg-accent text-accent-content shadow-md"><div className="card-body">❤️ Save favourites</div></div>
        </div>
      </div>

      <div className="card bg-base-100 border-base-300 w-full border shadow-xl">
        <div className="card-body">
          <div role="tablist" className="tabs tabs-box mb-2">
            <button role="tab" className={`tab flex-1 ${mode === 'login' ? 'tab-active' : ''}`} onClick={() => setMode('login')}>Sign in</button>
            <button role="tab" className={`tab flex-1 ${mode === 'register' ? 'tab-active' : ''}`} onClick={() => setMode('register')}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-1">
            {mode === 'register' && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Full name</legend>
                <label className="input validator w-full">
                  <User className="size-4 opacity-50" />
                  <input required minLength={3} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nur Aisyah" />
                </label>
                <p className="validator-hint hidden">At least 3 characters</p>
              </fieldset>
            )}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <label className="input validator w-full">
                <Mail className="size-4 opacity-50" />
                <input type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" />
              </label>
              <p className="validator-hint hidden">Enter a valid email address</p>
            </fieldset>
            {mode === 'register' && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Phone</legend>
                <label className="input validator w-full">
                  <Phone className="size-4 opacity-50" />
                  <input type="tel" required pattern="(\+?6?01)[0-9\-\s]{7,11}" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="012-345 6789" />
                </label>
                <p className="validator-hint hidden">Malaysian mobile number, e.g. 012-345 6789</p>
              </fieldset>
            )}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <label className="input validator w-full">
                <KeyRound className="size-4 opacity-50" />
                <input type={show ? 'text' : 'password'} required minLength={6} value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="At least 6 characters" />
                <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </label>
              {mode === 'register' && form.password && (
                <div className="flex items-center gap-2">
                  <progress className={`progress w-full ${strength <= 2 ? 'progress-error' : strength <= 3 ? 'progress-warning' : 'progress-success'}`} value={strength} max={5} />
                  <span className="text-xs whitespace-nowrap">{['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength]}</span>
                </div>
              )}
            </fieldset>
            {mode === 'register' && (
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Confirm password</legend>
                <input type="password" className={`input w-full ${form.confirm && form.confirm !== form.password ? 'input-error' : ''}`} required value={form.confirm} onChange={(e) => set({ confirm: e.target.value })} />
                {form.confirm && form.confirm !== form.password && <p className="text-error text-xs">Passwords do not match</p>}
              </fieldset>
            )}
            {mode === 'login' ? (
              <div className="flex items-center justify-between py-2">
                <label className="label text-base-content cursor-pointer gap-2"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" defaultChecked /> Remember me</label>
                <button type="button" className="link link-hover text-sm" onClick={() => toast('Password reset link sent (demo)', 'info')}>Forgot password?</button>
              </div>
            ) : (
              <label className="label text-base-content cursor-pointer gap-2 py-2 whitespace-normal">
                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" required checked={form.agree} onChange={(e) => set({ agree: e.target.checked })} />
                I agree to the Terms of Service and Privacy Policy
              </label>
            )}
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading && <span className="loading loading-spinner" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <div className="divider text-xs">DEMO MODE</div>
          <p className="text-center text-xs opacity-60">Any email and a 6+ character password will work. Passwords are never saved.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- TABS ---------------------------- */
function ProfileTab({ stats }) {
  const { user, updateUser, toast } = useStore()
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '', birthday: user.birthday || '', bio: user.bio || '' })
  const tierIdx = TIERS.findLastIndex((t) => stats.points >= t.min)
  const nextTier = TIERS[tierIdx + 1]
  const pct = nextTier ? Math.round(((stats.points - TIERS[tierIdx].min) / (nextTier.min - TIERS[tierIdx].min)) * 100) : 100

  const onAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) return toast('Please choose an image under 1 MB', 'warning')
    const reader = new FileReader()
    reader.onload = () => {
      updateUser({ avatar: reader.result })
      toast('Profile photo updated')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border-base-300 w-full border">
        <div className="stat">
          <div className="stat-title">Orders</div>
          <div className="stat-value">{stats.count}</div>
          <div className="stat-desc">{stats.active} in progress</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total spent</div>
          <div className="stat-value text-2xl">{money(stats.spent)}</div>
          <div className="stat-desc">all time</div>
        </div>
        <div className="stat">
          <div className="stat-figure">
            <div className="radial-progress text-primary" style={{ '--value': pct, '--size': '4rem' }} role="progressbar" aria-valuenow={pct}>
              {pct}%
            </div>
          </div>
          <div className="stat-title">ForkPoints</div>
          <div className="stat-value">{stats.points}</div>
          <div className="stat-desc">
            <span className="badge badge-primary badge-sm">{TIERS[tierIdx].name}</span> {nextTier ? `${nextTier.min - stats.points} pts to ${nextTier.name}` : 'Top tier!'}
          </div>
        </div>
      </div>

      <form
        className="card bg-base-100 border-base-300 border"
        onSubmit={(e) => {
          e.preventDefault()
          updateUser(form)
          toast('Profile saved')
        }}
      >
        <div className="card-body">
          <h2 className="card-title"><Pencil className="size-5" /> Edit profile</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user.name} src={user.avatar} size="w-20" ring />
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Profile photo</legend>
              <input type="file" accept="image/*" className="file-input file-input-primary file-input-sm" onChange={onAvatar} />
              <p className="label">PNG or JPG, max 1 MB</p>
            </fieldset>
          </div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Name</legend>
              <input className="input w-full" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input type="email" className="input validator w-full" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Phone</legend>
              <input type="tel" className="input w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Birthday <span className="badge badge-ghost badge-xs">free dessert 🎂</span></legend>
              <input type="date" className="input w-full" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
            </fieldset>
          </div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Food preferences</legend>
            <textarea className="textarea w-full" rows={2} placeholder="e.g. vegetarian, no peanuts, loves spicy food" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </fieldset>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Save changes</button>
          </div>
        </div>
      </form>
    </div>
  )
}

function OrdersTab() {
  const { orders, reorder } = useStore()
  const navigate = useNavigate()
  const now = useNow(5000)
  const [filter, setFilter] = useState('all')
  const list = orders.filter((o) => {
    const s = getOrderStatus(o, now)
    return filter === 'all' || (filter === 'active' ? s >= 0 && s < 4 : filter === 'delivered' ? s === 4 : s === -1)
  })

  if (!orders.length)
    return (
      <EmptyState icon="🧾" title="No orders yet" text="Your order history will appear here.">
        <Link to="/restaurants" className="btn btn-primary">Start ordering</Link>
      </EmptyState>
    )

  return (
    <div className="card bg-base-100 border-base-300 border">
      <div className="card-body">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-title">Order history</h2>
          <select className="select select-sm w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All orders</option>
            <option value="active">In progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="table-zebra table">
            <thead>
              <tr><th>Order</th><th>Restaurant</th><th>Date</th><th>Total</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const s = getOrderStatus(o, now)
                return (
                  <tr key={o.id} className="hover:bg-base-200">
                    <td className="font-mono text-xs">{o.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <SafeImage src={o.restaurantImage} alt="" className="mask mask-squircle size-9 object-cover" />
                        <span className="font-medium">{o.restaurantName}</span>
                      </div>
                    </td>
                    <td className="text-xs whitespace-nowrap">{new Date(o.placedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="font-semibold">{money(o.totals.total)}</td>
                    <td><StatusBadge status={s} label={ORDER_STEPS[Math.max(0, s)].label} /></td>
                    <td>
                      <div className="flex gap-1">
                        <Link to={`/track/${o.id}`} className="btn btn-xs btn-primary">Track</Link>
                        <button className="btn btn-xs" onClick={async () => (await reorder(o)) && navigate('/checkout')}>Reorder</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-6 text-center opacity-60">No orders in this category.</p>}
        </div>
      </div>
    </div>
  )
}

function AddressesTab() {
  const { user, updateUser, toast, confirm } = useStore()
  const ref = useRef(null)
  const empty = { label: 'Home', address: '', city: 'Kuala Lumpur', postcode: '', default: false }
  const [form, setForm] = useState(empty)
  const addresses = user.addresses || []

  const save = (e) => {
    e.preventDefault()
    let list = [...addresses, { ...form, id: uid('A') }]
    if (form.default || list.length === 1) list = list.map((a, i) => ({ ...a, default: i === list.length - 1 }))
    updateUser({ addresses: list })
    ref.current.close()
    toast('Address saved')
  }
  const setDefault = (id) => updateUser({ addresses: addresses.map((a) => ({ ...a, default: a.id === id })) })
  const remove = async (id) => {
    if (await confirm('Delete address?', 'This address will be removed from your account.', 'Delete')) {
      updateUser({ addresses: addresses.filter((a) => a.id !== id) })
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Saved addresses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(empty); ref.current.showModal() }}>
          <Plus className="size-4" /> Add address
        </button>
      </div>
      {addresses.length === 0 ? (
        <EmptyState icon="📍" title="No saved addresses" text="Save your home or office for faster checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={`card bg-base-100 border ${a.default ? 'border-primary' : 'border-base-300'}`}>
              <div className="card-body p-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.label === 'Home' ? '🏠' : a.label === 'Work' ? '🏢' : '📍'}</span>
                  <h3 className="font-bold">{a.label}</h3>
                  {a.default && <span className="badge badge-primary badge-sm">Default</span>}
                </div>
                <p className="text-sm opacity-70">{a.address}, {a.postcode} {a.city}</p>
                <div className="card-actions mt-2 justify-end">
                  {!a.default && <button className="btn btn-ghost btn-xs" onClick={() => setDefault(a.id)}>Set default</button>}
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => remove(a.id)} aria-label="Delete address"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
        <form onSubmit={save} className="modal-box">
          <h3 className="text-lg font-bold">New address</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Label</legend>
            <div className="join">
              {['Home', 'Work', 'Other'].map((l) => (
                <input key={l} type="radio" name="addr-label" className="btn join-item" aria-label={l} checked={form.label === l} onChange={() => setForm({ ...form, label: l })} />
              ))}
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Address</legend>
            <textarea className="textarea validator w-full" required minLength={8} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Unit, building, street" />
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">City</legend>
              <select className="select w-full" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                {['Kuala Lumpur', 'Petaling Jaya', 'Subang Jaya', 'Shah Alam', 'Putrajaya', 'Cyberjaya', 'Serdang'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Postcode</legend>
              <input className="input validator w-full" required pattern="[0-9]{5}" maxLength={5} value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
            </fieldset>
          </div>
          <label className="label text-base-content mt-3 cursor-pointer gap-2">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={form.default} onChange={(e) => setForm({ ...form, default: e.target.checked })} />
            Set as default address
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => ref.current.close()}>Cancel</button>
            <button className="btn btn-primary">Save address</button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  )
}

function FavouritesTab() {
  const { favorites, restaurants } = useStore()
  const list = restaurants.filter((r) => favorites.includes(r.id))
  if (!list.length)
    return (
      <EmptyState icon="💛" title="No favourites yet" text="Tap the heart on any restaurant to save it here.">
        <Link to="/restaurants" className="btn btn-primary">Discover restaurants</Link>
      </EmptyState>
    )
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
    </div>
  )
}

function SettingsTab() {
  const { user, updateUser, theme, setTheme, logout, resetDemo, confirm, toast } = useStore()
  const navigate = useNavigate()
  const n = user.notifications || {}
  const setN = (k, v) => updateUser({ notifications: { ...n, [k]: v } })

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title"><Bell className="size-5" /> Notifications</h2>
          {[
            ['email', 'Order updates by email'],
            ['sms', 'SMS when rider is nearby'],
            ['promos', 'Promotions & weekly deals'],
          ].map(([k, label]) => (
            <label key={k} className="label text-base-content cursor-pointer justify-between py-2">
              {label}
              <input type="checkbox" className="toggle toggle-primary" checked={!!n[k]} onChange={(e) => setN(k, e.target.checked)} />
            </label>
          ))}
        </div>
      </div>

      <div className="card bg-base-100 border-base-300 border">
        <div className="card-body">
          <h2 className="card-title">🎨 Appearance</h2>
          <div className="grid max-w-sm grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <label key={t.id} data-theme={t.id} className={`rounded-box bg-base-100 text-base-content cursor-pointer border-2 p-3 ${theme === t.id ? 'border-primary' : 'border-base-300'}`}>
                <input type="radio" name="theme-radios" className="theme-controller hidden" value={t.id} checked={theme === t.id} onChange={() => setTheme(t.id)} />
                <div className="mb-2 flex gap-1">
                  <span className="bg-primary h-6 w-3 rounded" />
                  <span className="bg-secondary h-6 w-3 rounded" />
                  <span className="bg-accent h-6 w-3 rounded" />
                  <span className="bg-neutral h-6 w-3 rounded" />
                </div>
                <span className="text-xs font-semibold">{t.label}</span>
              </label>
            ))}
          </div>
          <fieldset className="fieldset mt-2 max-w-xs">
            <legend className="fieldset-legend">Language</legend>
            <select className="select" defaultValue="en" onChange={() => toast('Language preference saved', 'info')}>
              <option value="en">English</option>
              <option value="ms">Bahasa Melayu</option>
              <option value="zh">中文</option>
              <option value="ta">தமிழ்</option>
            </select>
          </fieldset>
        </div>
      </div>

      <div className="card border-error/40 bg-error/5 border">
        <div className="card-body">
          <h2 className="card-title text-error">Danger zone</h2>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-outline" onClick={() => { logout(); navigate('/') }}>
              <LogOut className="size-4" /> Log out
            </button>
            <button
              className="btn btn-error"
              onClick={async () => {
                if (await confirm('Reset all demo data?', 'This clears your orders, basket and reviews, and logs you out.', 'Reset everything')) {
                  resetDemo()
                  logout()
                  toast('Demo data reset', 'info')
                  navigate('/')
                }
              }}
            >
              <Trash2 className="size-4" /> Reset demo data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Account() {
  const { user, orders } = useStore()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'profile'
  const setTab = (t) => setParams({ tab: t })
  const now = useNow(10000)

  useEffect(() => {
    document.title = 'My account | ForkSpoon'
  }, [])

  const stats = useMemo(() => {
    const valid = orders.filter((o) => !o.cancelled)
    const spent = valid.reduce((s, o) => s + o.totals.total, 0)
    return {
      count: orders.length,
      active: orders.filter((o) => {
        const s = getOrderStatus(o, now)
        return s >= 0 && s < 4
      }).length,
      spent,
      points: (user?.points || 0) + Math.floor(spent),
    }
  }, [orders, user, now])

  if (!user) return <AuthCard />

  const content = {
    profile: <ProfileTab stats={stats} />,
    orders: <OrdersTab />,
    addresses: <AddressesTab />,
    favourites: <FavouritesTab />,
    settings: <SettingsTab />,
  }[tab]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul><li><Link to="/">Home</Link></li><li>My account</li><li className="capitalize">{tab}</li></ul>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="card bg-neutral text-neutral-content">
            <div className="card-body items-center text-center">
              <Avatar name={user.name} src={user.avatar} size="w-20" ring />
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm opacity-70">{user.email}</p>
              <span className="badge badge-primary">{stats.points} ForkPoints</span>
            </div>
          </div>
          {/* vertical menu on desktop, scrollable tabs on mobile */}
          <ul className="menu bg-base-100 rounded-box border-base-300 hidden w-full border lg:flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button className={tab === id ? 'menu-active' : ''} onClick={() => setTab(id)}>
                  <Icon className="size-4" /> {label}
                  {id === 'orders' && stats.active > 0 && <span className="badge badge-secondary badge-sm">{stats.active}</span>}
                </button>
              </li>
            ))}
          </ul>
          <div role="tablist" className="tabs tabs-box no-scrollbar flex-nowrap overflow-x-auto lg:hidden">
            {TABS.map(({ id, label }) => (
              <button key={id} role="tab" className={`tab shrink-0 ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </aside>
        <section>{content}</section>
      </div>
    </div>
  )
}
