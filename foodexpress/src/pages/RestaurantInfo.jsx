import { Bike, Clock, MapPin, Search, ShoppingBag, Store, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ItemTags } from '../components/MenuItemCard'
import { EmptyState, RatingStars, SafeImage } from '../components/ui'
import { money, useStore } from '../context/StoreContext'
import { CATEGORIES } from '../data/restaurants'

const PRICE = ['', '$', '$$', '$$$']

// Full details and menu of one restaurant (read-only, for customers)
function RestaurantDetails({ restaurant: r }) {
  const [section, setSection] = useState('All')
  const sections = ['All', ...new Set(r.menu.map((m) => m.section))]
  const dishes = r.menu.filter((m) => section === 'All' || m.section === section)

  return (
    <div className="card bg-base-100 border-base-300 overflow-hidden border">
      <figure className="relative h-48 md:h-56">
        <SafeImage src={r.image} alt={r.name} className={`h-full w-full object-cover ${r.isOpen ? '' : 'grayscale'}`} />
        <div className="from-neutral/90 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="text-neutral-content absolute bottom-4 left-5 right-5">
          <span className={`badge badge-sm mb-2 ${r.isOpen ? 'badge-success' : 'badge-error'}`}>{r.isOpen ? 'Open now' : 'Closed'}</span>
          <h2 className="text-2xl font-extrabold md:text-3xl">{r.name}</h2>
          <p className="text-sm opacity-80">{r.cuisine} · {PRICE[r.price]}</p>
        </div>
      </figure>

      <div className="card-body gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <RatingStars value={r.rating} size="rating-sm" />
          <span className="font-semibold">{r.rating}</span>
          <span className="text-sm opacity-60">({r.reviews.toLocaleString()} reviews)</span>
        </div>
        <p className="text-base-content/80">{r.description}</p>
        {r.promo && (
          <div role="alert" className="alert alert-warning alert-soft">
            <span>🎁 <b>Promo:</b> {r.promo}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            [Clock, 'Delivery time', `${r.eta[0]}–${r.eta[1]} min`],
            [Bike, 'Delivery fee', r.freeDelivery ? 'Free' : money(r.deliveryFee)],
            [Wallet, 'Minimum order', money(r.minOrder)],
            [MapPin, 'Distance', `${r.distance} km`],
          ].map(([Icon, label, value]) => (
            <div key={label} className="bg-base-200 rounded-box p-3">
              <p className="flex items-center gap-1 text-xs opacity-60"><Icon className="size-3" /> {label}</p>
              <p className="font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <tbody>
              <tr><th className="w-36">Address</th><td>{r.address}</td></tr>
              <tr><th>Opening hours</th><td>{r.hours}</td></tr>
              <tr><th>Cuisine</th><td>{r.cuisine}</td></tr>
              <tr><th>Halal</th><td><span className="badge badge-success badge-sm">Certified</span></td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-bold">Menu <span className="text-base font-normal opacity-60">({r.menu.length} dishes)</span></h3>
          </div>
          <div role="tablist" className="tabs tabs-box no-scrollbar flex-nowrap overflow-x-auto">
            {sections.map((s) => (
              <button key={s} role="tab" className={`tab shrink-0 ${section === s ? 'tab-active' : ''}`} onClick={() => setSection(s)}>
                {s}
              </button>
            ))}
          </div>
          <ul className="list mt-2">
            {dishes.map((m) => (
              <li key={m.id} className={`list-row items-center ${m.available ? '' : 'opacity-60'}`}>
                <SafeImage src={m.image} alt={m.name} className="rounded-box size-14 object-cover" />
                <div className="min-w-0">
                  <ItemTags tags={m.tags} />
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-base-content/60 line-clamp-2 text-xs">{m.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold whitespace-nowrap">{money(m.price)}</p>
                  {!m.available && <span className="badge badge-error badge-xs">Sold out</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-actions justify-end">
          <Link to={`/restaurant/${r.id}`} className="btn btn-primary">
            <ShoppingBag className="size-4" /> {r.isOpen ? `Order from ${r.name}` : 'View ordering page'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RestaurantInfo() {
  const { restaurants, getRestaurant } = useStore()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('all')
  const detailRef = useRef(null)

  useEffect(() => {
    document.title = 'Restaurant info | ForkSpoon'
  }, [])

  const list = restaurants.filter(
    (r) => (cuisine === 'all' || r.cuisine === cuisine) && r.name.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const selected = getRestaurant(params.get('id'))

  const select = (id) => {
    setParams({ id })
    // on phones the details sit below the list, so bring them into view
    if (window.innerWidth < 1024) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul><li><Link to="/">Home</Link></li><li>For Restaurants</li>{selected && <li>{selected.name}</li>}</ul>
      </div>
      <h1 className="text-3xl font-bold">Restaurant directory</h1>
      <p className="opacity-60">Tap a restaurant name to see its details, opening hours and full menu.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card bg-base-100 border-base-300 self-start border lg:sticky lg:top-20">
          <div className="card-body gap-3 p-4">
            <label className="input w-full">
              <Search className="size-4 opacity-50" />
              <input type="search" placeholder="Search restaurant name" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <select className="select w-full" value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label="Filter by cuisine">
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.id === 'all' ? 'All cuisines' : c.name}</option>
              ))}
            </select>
            <p className="text-xs opacity-60">{list.length} restaurants</p>
            <ul className="menu w-full gap-1 p-0 lg:max-h-[60vh] lg:flex-nowrap lg:overflow-y-auto">
              {list.map((r) => (
                <li key={r.id}>
                  <button className={selected?.id === r.id ? 'menu-active' : ''} onClick={() => select(r.id)}>
                    <div className="avatar">
                      <div className="mask mask-squircle size-10"><SafeImage src={r.image} alt="" /></div>
                    </div>
                    <span className="flex-1 text-left">
                      <span className="block font-semibold">{r.name}</span>
                      <span className="text-xs opacity-70">{r.cuisine} · ⭐ {r.rating}</span>
                    </span>
                    <span className={`status ${r.isOpen ? 'status-success' : 'status-error'}`} aria-label={r.isOpen ? 'Open' : 'Closed'} />
                  </button>
                </li>
              ))}
            </ul>
            {list.length === 0 && <p className="py-4 text-center text-sm opacity-60">No restaurants match.</p>}
          </div>
        </aside>

        <section ref={detailRef} className="scroll-mt-20">
          {selected ? (
            <RestaurantDetails key={selected.id} restaurant={selected} />
          ) : (
            <EmptyState icon={<Store className="mx-auto size-14 opacity-60" />} title="Choose a restaurant" text="Select a restaurant name from the list to view its details and menu." />
          )}
        </section>
      </div>
    </div>
  )
}
