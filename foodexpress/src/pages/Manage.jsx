import { ChartColumn, DollarSign, Eye, Pencil, Plus, RotateCcw, Search, ShoppingBag, Star, Store, Trash2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ItemTags } from '../components/MenuItemCard'
import { EmptyState, SafeImage, StatusBadge } from '../components/ui'
import { getOrderStatus, money, uid, useNow, useStore } from '../context/StoreContext'
import { CATEGORIES, IMG, ORDER_STEPS } from '../data/restaurants'

const CUISINES = CATEGORIES.slice(1).map((c) => c.id)
const IMAGE_CHOICES = Object.entries(IMG)
const TAGS = ['popular', 'new', 'spicy', 'veg']

const BLANK_RESTAURANT = {
  name: '', cuisine: 'Malaysian', image: IMG.food, description: '', address: '', hours: '10:00 AM - 10:00 PM',
  eta: [20, 30], deliveryFee: 3, minOrder: 15, price: 1, distance: 2, rating: 4.5, reviews: 0,
  isOpen: true, freeDelivery: false, promo: '', menu: [],
}
const BLANK_ITEM = { name: '', desc: '', price: 10, section: 'Mains', image: IMG.plate, tags: [], available: true }

// shared image picker: preset food photos or a custom URL
function ImagePicker({ value, onChange }) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Photo</legend>
      <div className="flex items-center gap-3">
        <SafeImage src={value} alt="preview" className="rounded-box size-16 shrink-0 object-cover" />
        <div className="w-full space-y-2">
          <select className="select select-sm w-full" value={IMAGE_CHOICES.find(([, url]) => url === value)?.[0] || ''} onChange={(e) => e.target.value && onChange(IMG[e.target.value])}>
            <option value="">Custom URL…</option>
            {IMAGE_CHOICES.map(([k]) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="url" className="input input-sm w-full" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
        </div>
      </div>
    </fieldset>
  )
}

function RestaurantForm({ dialogRef, initial, onSave }) {
  const [f, setF] = useState(initial)
  useEffect(() => {
    setF(initial)
  }, [initial])
  const set = (patch) => setF((x) => ({ ...x, ...patch }))

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <form
        className="modal-box max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(f)
        }}
      >
        <h3 className="text-lg font-bold">{initial.id ? 'Edit restaurant' : 'Add a new restaurant'}</h3>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Restaurant name</legend>
            <input className="input validator w-full" required minLength={3} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Kopi & Kuih" />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Cuisine</legend>
            <select className="select w-full" value={f.cuisine} onChange={(e) => set({ cuisine: e.target.value })}>
              {CUISINES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </fieldset>
        </div>
        <ImagePicker value={f.image} onChange={(image) => set({ image })} />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea className="textarea w-full" rows={2} value={f.description} onChange={(e) => set({ description: e.target.value })} />
        </fieldset>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Address</legend>
            <input className="input w-full" required value={f.address} onChange={(e) => set({ address: e.target.value })} />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Opening hours</legend>
            <input className="input w-full" value={f.hours} onChange={(e) => set({ hours: e.target.value })} />
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">ETA from (min)</legend>
            <input type="number" min={5} max={90} className="input w-full" value={f.eta[0]} onChange={(e) => set({ eta: [+e.target.value, f.eta[1]] })} />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">ETA to (min)</legend>
            <input type="number" min={f.eta[0]} max={120} className="input w-full" value={f.eta[1]} onChange={(e) => set({ eta: [f.eta[0], +e.target.value] })} />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Delivery fee (RM)</legend>
            <input type="number" min={0} step={0.1} className="input w-full" value={f.deliveryFee} onChange={(e) => set({ deliveryFee: +e.target.value })} />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Min order (RM)</legend>
            <input type="number" min={0} className="input w-full" value={f.minOrder} onChange={(e) => set({ minOrder: +e.target.value })} />
          </fieldset>
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Price level</legend>
            <div className="join">
              {[1, 2, 3].map((p) => (
                <input key={p} type="radio" name="price-level" className="btn btn-sm join-item" aria-label={'$'.repeat(p)} checked={f.price === p} onChange={() => set({ price: p })} />
              ))}
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Promo text</legend>
            <input className="input w-full" value={f.promo} onChange={(e) => set({ promo: e.target.value })} placeholder="e.g. 10% off all set meals" />
          </fieldset>
        </div>
        <div className="mt-3 flex flex-wrap gap-6">
          <label className="label text-base-content cursor-pointer gap-2">
            <input type="checkbox" className="toggle toggle-success" checked={f.isOpen} onChange={(e) => set({ isOpen: e.target.checked })} /> Open for orders
          </label>
          <label className="label text-base-content cursor-pointer gap-2">
            <input type="checkbox" className="checkbox checkbox-primary" checked={f.freeDelivery} onChange={(e) => set({ freeDelivery: e.target.checked })} /> Free delivery
          </label>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current.close()}>Cancel</button>
          <button className="btn btn-primary">{initial.id ? 'Save changes' : 'Add restaurant'}</button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  )
}

function MenuItemForm({ dialogRef, initial, sections, onSave }) {
  const [f, setF] = useState(initial)
  useEffect(() => {
    setF(initial)
  }, [initial])
  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  const toggleTag = (t) => set({ tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] })

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
      <form className="modal-box" onSubmit={(e) => { e.preventDefault(); onSave(f) }}>
        <h3 className="text-lg font-bold">{initial.id ? 'Edit dish' : 'Add a dish'}</h3>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Dish name</legend>
          <input className="input validator w-full" required value={f.name} onChange={(e) => set({ name: e.target.value })} />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Description</legend>
          <textarea className="textarea w-full" rows={2} value={f.desc} onChange={(e) => set({ desc: e.target.value })} />
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Price (RM)</legend>
            <input type="number" min={0.5} step={0.1} required className="input validator w-full" value={f.price} onChange={(e) => set({ price: +e.target.value })} />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Menu section</legend>
            <input className="input w-full" list="menu-sections" required value={f.section} onChange={(e) => set({ section: e.target.value })} />
            <datalist id="menu-sections">{sections.map((s) => <option key={s} value={s} />)}</datalist>
          </fieldset>
        </div>
        <ImagePicker value={f.image} onChange={(image) => set({ image })} />
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <label key={t} className="label text-base-content cursor-pointer gap-1 capitalize">
                <input type="checkbox" className="checkbox checkbox-sm checkbox-secondary" checked={f.tags.includes(t)} onChange={() => toggleTag(t)} /> {t}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="label text-base-content mt-2 cursor-pointer gap-2">
          <input type="checkbox" className="toggle toggle-success toggle-sm" checked={f.available} onChange={(e) => set({ available: e.target.checked })} /> Available (uncheck to mark sold out)
        </label>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current.close()}>Cancel</button>
          <button className="btn btn-primary">Save dish</button>
        </div>
      </form>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  )
}

export default function Manage() {
  const { restaurants, saveRestaurant, deleteRestaurant, updateRestaurant, orders, updateOrder, confirm, toast, resetDemo } = useStore()
  const now = useNow(3000)
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(BLANK_RESTAURANT)
  const [menuFor, setMenuFor] = useState(restaurants[0]?.id || '')
  const [editingItem, setEditingItem] = useState(BLANK_ITEM)
  const [orderFilter, setOrderFilter] = useState('all')
  const restRef = useRef(null)
  const itemRef = useRef(null)

  useEffect(() => {
    document.title = 'Restaurant management | ForkSpoon'
  }, [])

  const selected = restaurants.find((r) => r.id === menuFor) || restaurants[0]
  const sections = selected ? [...new Set(selected.menu.map((m) => m.section))] : []

  const stats = useMemo(() => {
    const valid = orders.filter((o) => !o.cancelled)
    const revenue = valid.reduce((s, o) => s + o.totals.subtotal, 0)
    const byRestaurant = restaurants
      .map((r) => {
        const mine = valid.filter((o) => o.restaurantId === r.id)
        return { r, count: mine.length, revenue: mine.reduce((s, o) => s + o.totals.subtotal, 0) }
      })
      .sort((a, b) => b.revenue - a.revenue)
    const statusCounts = ORDER_STEPS.map((_, i) => orders.filter((o) => getOrderStatus(o, now) === i).length)
    return {
      revenue,
      byRestaurant,
      statusCounts,
      open: restaurants.filter((r) => r.isOpen).length,
      avgRating: restaurants.length ? restaurants.reduce((s, r) => s + r.rating, 0) / restaurants.length : 0,
      dishes: restaurants.reduce((n, r) => n + r.menu.length, 0),
    }
  }, [orders, restaurants, now])

  /* restaurant CRUD */
  const openNewRestaurant = () => {
    setEditing({ ...BLANK_RESTAURANT })
    restRef.current.showModal()
  }
  const openEditRestaurant = (r) => {
    setEditing(r)
    restRef.current.showModal()
  }
  const handleSaveRestaurant = (data) => {
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uid().toLowerCase()
    saveRestaurant({ ...data, id })
    restRef.current.close()
    toast(data.id ? `${data.name} updated` : `${data.name} added — now add some dishes!`)
    if (!data.id) {
      setMenuFor(id)
      setTab('menu')
    }
  }
  const handleDeleteRestaurant = async (r) => {
    if (await confirm(`Delete ${r.name}?`, 'The restaurant and its whole menu will be removed. Existing orders are kept.', 'Delete')) {
      deleteRestaurant(r.id)
      toast(`${r.name} deleted`, 'info')
    }
  }

  /* menu CRUD */
  const saveMenu = (menu) => updateRestaurant(selected.id, { menu })
  const openNewItem = () => {
    setEditingItem({ ...BLANK_ITEM, section: sections[0] || 'Mains' })
    itemRef.current.showModal()
  }
  const openEditItem = (item) => {
    setEditingItem(item)
    itemRef.current.showModal()
  }
  const handleSaveItem = (item) => {
    saveMenu(item.id ? selected.menu.map((m) => (m.id === item.id ? item : m)) : [...selected.menu, { ...item, id: uid('M') }])
    itemRef.current.close()
    toast(`${item.name} saved`)
  }
  const handleDeleteItem = async (item) => {
    if (await confirm(`Delete ${item.name}?`, 'This dish will be removed from the menu.', 'Delete')) {
      saveMenu(selected.menu.filter((m) => m.id !== item.id))
    }
  }

  const filteredRestaurants = restaurants.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders = orders.filter((o) => orderFilter === 'all' || String(getOrderStatus(o, now)) === orderFilter)
  const maxRevenue = Math.max(1, ...stats.byRestaurant.map((x) => x.revenue))

  const TAB_LIST = [
    ['overview', 'Overview', ChartColumn],
    ['restaurants', `Restaurants (${restaurants.length})`, Store],
    ['menu', 'Menu', UtensilsCrossed],
    ['orders', `Orders (${orders.length})`, ShoppingBag],
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul><li><Link to="/">Home</Link></li><li>Restaurant management</li></ul>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Partner Dashboard</h1>
          <p className="opacity-60">Manage restaurants, menus and incoming orders.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              if (await confirm('Reset demo data?', 'Restaurants, menus and orders go back to the original sample data.', 'Reset')) {
                resetDemo()
                toast('Demo data restored', 'info')
              }
            }}
          >
            <RotateCcw className="size-4" /> Reset demo
          </button>
          <button className="btn btn-primary btn-sm" onClick={openNewRestaurant}><Plus className="size-4" /> Add restaurant</button>
        </div>
      </div>

      <div role="alert" className="alert alert-info alert-soft mt-4">
        <span>💡 Changes here update the customer app instantly — try closing a restaurant or marking a dish sold out, then visit its page.</span>
      </div>

      <div className="stats stats-vertical bg-base-100 border-base-300 mt-6 w-full border sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-primary"><Store className="size-8" /></div>
          <div className="stat-title">Restaurants</div>
          <div className="stat-value">{restaurants.length}</div>
          <div className="stat-desc">{stats.open} open now</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary"><ShoppingBag className="size-8" /></div>
          <div className="stat-title">Orders</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-desc">{stats.statusCounts.slice(0, 4).reduce((a, b) => a + b, 0)} in progress</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success"><DollarSign className="size-8" /></div>
          <div className="stat-title">Revenue</div>
          <div className="stat-value text-2xl">{money(stats.revenue)}</div>
          <div className="stat-desc">food subtotal, excl. fees</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-warning"><Star className="size-8" /></div>
          <div className="stat-title">Avg rating</div>
          <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
          <div className="stat-desc">{stats.dishes} dishes listed</div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-box no-scrollbar mt-6 flex-nowrap overflow-x-auto">
        {TAB_LIST.map(([id, label, Icon]) => (
          <button key={id} role="tab" className={`tab shrink-0 gap-2 ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* ------------ OVERVIEW ------------ */}
        {tab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title">Revenue by restaurant</h2>
                {stats.revenue === 0 ? (
                  <p className="py-8 text-center text-sm opacity-60">No sales yet. Place an order from the customer side to see data here.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.byRestaurant.slice(0, 6).map(({ r, count, revenue }) => (
                      <li key={r.id}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{r.name}</span>
                          <span className="opacity-70">{count} orders · {money(revenue)}</span>
                        </div>
                        <progress className="progress progress-primary" value={revenue} max={maxRevenue} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title">Orders by status</h2>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                  {ORDER_STEPS.map((s, i) => {
                    const pct = orders.length ? Math.round((stats.statusCounts[i] / orders.length) * 100) : 0
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-1 text-center">
                        <div className="radial-progress text-secondary text-sm" style={{ '--value': pct, '--size': '4rem' }} role="progressbar" aria-valuenow={pct}>
                          {stats.statusCounts[i]}
                        </div>
                        <span className="text-xs">{s.label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="divider" />
                <h3 className="font-semibold">Closed restaurants</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurants.filter((r) => !r.isOpen).map((r) => (
                    <button key={r.id} className="badge badge-error badge-soft gap-1" onClick={() => updateRestaurant(r.id, { isOpen: true })}>
                      {r.name} · tap to open
                    </button>
                  ))}
                  {stats.open === restaurants.length && <span className="text-sm opacity-60">All restaurants are open 🎉</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------ RESTAURANTS ------------ */}
        {tab === 'restaurants' && (
          <div className="card bg-base-100 border-base-300 border">
            <div className="card-body">
              <label className="input w-full sm:max-w-sm">
                <Search className="size-4 opacity-50" />
                <input type="search" placeholder="Search by name or cuisine" value={search} onChange={(e) => setSearch(e.target.value)} />
              </label>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr><th>Restaurant</th><th>Cuisine</th><th>Rating</th><th>Fee</th><th>Dishes</th><th>Open</th><th>Free delivery</th><th className="text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredRestaurants.map((r) => (
                      <tr key={r.id} className="hover:bg-base-200">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar"><div className="mask mask-squircle size-12"><SafeImage src={r.image} alt="" /></div></div>
                            <div>
                              <div className="font-bold">{r.name}</div>
                              <div className="max-w-56 truncate text-xs opacity-60">{r.address}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-ghost badge-sm whitespace-nowrap">{r.cuisine}</span></td>
                        <td>⭐ {r.rating}</td>
                        <td>{money(r.deliveryFee)}</td>
                        <td>{r.menu.length}</td>
                        <td>
                          <input type="checkbox" className="toggle toggle-success toggle-sm" checked={r.isOpen} aria-label="Open for orders"
                            onChange={(e) => { updateRestaurant(r.id, { isOpen: e.target.checked }); toast(`${r.name} is now ${e.target.checked ? 'open' : 'closed'}`, 'info') }} />
                        </td>
                        <td>
                          <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={r.freeDelivery} aria-label="Free delivery" onChange={(e) => updateRestaurant(r.id, { freeDelivery: e.target.checked })} />
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <div className="tooltip" data-tip="View page"><Link to={`/restaurant/${r.id}`} className="btn btn-ghost btn-xs btn-square"><Eye className="size-4" /></Link></div>
                            <div className="tooltip" data-tip="Edit menu"><button className="btn btn-ghost btn-xs btn-square" onClick={() => { setMenuFor(r.id); setTab('menu') }}><UtensilsCrossed className="size-4" /></button></div>
                            <div className="tooltip" data-tip="Edit details"><button className="btn btn-ghost btn-xs btn-square" onClick={() => openEditRestaurant(r)}><Pencil className="size-4" /></button></div>
                            <div className="tooltip" data-tip="Delete"><button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDeleteRestaurant(r)}><Trash2 className="size-4" /></button></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRestaurants.length === 0 && <p className="py-6 text-center opacity-60">No restaurants match “{search}”.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ------------ MENU ------------ */}
        {tab === 'menu' && (
          !selected ? (
            <EmptyState icon="🏪" title="No restaurants yet" text="Add a restaurant first.">
              <button className="btn btn-primary" onClick={openNewRestaurant}>Add restaurant</button>
            </EmptyState>
          ) : (
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <div className="flex flex-wrap items-center gap-3">
                  <select className="select w-full sm:w-72" value={selected.id} onChange={(e) => setMenuFor(e.target.value)} aria-label="Choose restaurant">
                    {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <span className={`badge ${selected.isOpen ? 'badge-success' : 'badge-error'}`}>{selected.isOpen ? 'Open' : 'Closed'}</span>
                  <button className="btn btn-primary btn-sm ml-auto" onClick={openNewItem}><Plus className="size-4" /> Add dish</button>
                </div>
                {selected.menu.length === 0 ? (
                  <EmptyState icon="🍳" title="This menu is empty" text="Add your first dish so customers can order." />
                ) : (
                  <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {selected.menu.map((m) => (
                      <div key={m.id} className={`card card-side bg-base-100 border-base-300 border ${m.available ? '' : 'opacity-60'}`}>
                        <figure className="w-24 shrink-0"><SafeImage src={m.image} alt={m.name} className="h-full w-full object-cover" /></figure>
                        <div className="card-body gap-1 p-3">
                          <ItemTags tags={m.tags} />
                          <h3 className="text-sm font-semibold">{m.name}</h3>
                          <p className="text-xs opacity-60">{m.section} · {money(m.price)}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <label className="label text-base-content cursor-pointer gap-1 text-xs">
                              <input type="checkbox" className="toggle toggle-success toggle-xs" checked={m.available}
                                onChange={(e) => saveMenu(selected.menu.map((x) => (x.id === m.id ? { ...x, available: e.target.checked } : x)))} />
                              {m.available ? 'Available' : 'Sold out'}
                            </label>
                            <div className="flex">
                              <button className="btn btn-ghost btn-xs btn-square" onClick={() => openEditItem(m)} aria-label={`Edit ${m.name}`}><Pencil className="size-3" /></button>
                              <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDeleteItem(m)} aria-label={`Delete ${m.name}`}><Trash2 className="size-3" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ------------ ORDERS ------------ */}
        {tab === 'orders' && (
          <div className="card bg-base-100 border-base-300 border">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="card-title">Incoming orders</h2>
                <select className="select select-sm w-auto" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                  <option value="all">All statuses</option>
                  {ORDER_STEPS.map((s, i) => <option key={s.key} value={i}>{s.label}</option>)}
                  <option value="-1">Cancelled</option>
                </select>
              </div>
              {orders.length === 0 ? (
                <EmptyState icon="📭" title="No orders yet" text="Orders placed by customers will appear here in real time.">
                  <Link to="/restaurants" className="btn btn-primary">Place a test order</Link>
                </EmptyState>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-zebra table">
                    <thead>
                      <tr><th>Order</th><th>Customer</th><th>Restaurant</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th></tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const s = getOrderStatus(o, now)
                        return (
                          <tr key={o.id}>
                            <td>
                              <Link to={`/track/${o.id}`} className="link link-hover font-mono text-xs">{o.id}</Link>
                              <div className="text-xs opacity-50">{new Date(o.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td>{o.customer}</td>
                            <td className="whitespace-nowrap">{o.restaurantName}</td>
                            <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                            <td className="font-semibold">{money(o.totals.total)}</td>
                            <td><StatusBadge status={s} label={ORDER_STEPS[Math.max(0, s)].label} /></td>
                            <td>
                              <select
                                className="select select-xs w-36"
                                value={o.cancelled ? 'cancel' : o.manualStatus == null ? 'auto' : String(o.manualStatus)}
                                onChange={(e) => {
                                  const v = e.target.value
                                  if (v === 'cancel') updateOrder(o.id, { cancelled: true })
                                  else updateOrder(o.id, { cancelled: false, manualStatus: v === 'auto' ? null : +v })
                                  toast(`Order ${o.id} updated`, 'info')
                                }}
                              >
                                <option value="auto">Auto (simulated)</option>
                                {ORDER_STEPS.map((st, i) => <option key={st.key} value={i}>{st.label}</option>)}
                                <option value="cancel">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <RestaurantForm dialogRef={restRef} initial={editing} onSave={handleSaveRestaurant} />
      <MenuItemForm dialogRef={itemRef} initial={editingItem} sections={sections} onSave={handleSaveItem} />
    </div>
  )
}
