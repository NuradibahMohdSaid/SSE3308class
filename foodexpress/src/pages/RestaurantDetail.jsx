import { Bike, Clock, Heart, MapPin, Search, Share2, ShoppingBag, Star, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ItemModal from '../components/ItemModal'
import MenuItemCard from '../components/MenuItemCard'
import { Avatar, EmptyState, QtyStepper, RatingInput, RatingStars, SafeImage } from '../components/ui'
import { computeTotals, money, useStore } from '../context/StoreContext'
import { SEED_REVIEWS } from '../data/restaurants'

const PRICE = ['', '$', '$$', '$$$']

function BasketSummary({ restaurant }) {
  const { cart, setQty } = useStore()
  const mine = cart.restaurantId === restaurant.id ? cart : { items: [] }
  const totals = computeTotals(mine.items.length ? cart : { items: [] }, restaurant)
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body p-5">
        <h3 className="card-title"><ShoppingBag className="size-5" /> Your basket</h3>
        {mine.items.length === 0 ? (
          <p className="text-base-content/60 py-6 text-center text-sm">Tap a dish to add it to your basket.</p>
        ) : (
          <>
            <ul className="divide-base-300 divide-y">
              {mine.items.map((i) => (
                <li key={i.key} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs opacity-60">{money(i.price * i.qty)}</p>
                  </div>
                  <QtyStepper value={i.qty} onChange={(v) => setQty(i.key, v)} size="btn-xs" />
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{totals.deliveryFee ? money(totals.deliveryFee) : 'Free'}</span></div>
              <progress
                className="progress progress-primary mt-2"
                value={Math.min(totals.subtotal, restaurant.minOrder)}
                max={restaurant.minOrder}
              />
              <p className="text-xs opacity-60">
                {totals.subtotal >= restaurant.minOrder ? '✅ Minimum order reached' : `${money(restaurant.minOrder - totals.subtotal)} to minimum order`}
              </p>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-block mt-2">
              Checkout · {money(totals.total)}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function RestaurantDetail() {
  const { id } = useParams()
  const { getRestaurant, favorites, toggleFavorite, toast, cart, reviews, addReview, user } = useStore()
  const r = getRestaurant(id)
  const [tab, setTab] = useState('menu')
  const [section, setSection] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [myRating, setMyRating] = useState(5)
  const [myText, setMyText] = useState('')

  useEffect(() => {
    if (r) document.title = `${r.name} | ForkSpoon`
  }, [r])

  const sections = useMemo(() => (r ? ['All', ...new Set(r.menu.map((m) => m.section))] : []), [r])
  const allReviews = useMemo(() => [...(reviews[id] || []), ...SEED_REVIEWS], [reviews, id])

  if (!r)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon="🏚️" title="Restaurant not found" text="It may have been removed by the owner.">
          <Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>
        </EmptyState>
      </div>
    )

  const fav = favorites.includes(r.id)
  const items = r.menu.filter(
    (m) => (section === 'All' || m.section === section) && (!search || m.name.toLowerCase().includes(search.toLowerCase())),
  )
  const grouped = items.reduce((acc, m) => ({ ...acc, [m.section]: [...(acc[m.section] || []), m] }), {})
  const qtyFor = (itemId) => (cart.restaurantId === r.id ? cart.items.filter((i) => i.itemId === itemId).reduce((n, i) => n + i.qty, 0) : 0)
  const basketCount = cart.restaurantId === r.id ? cart.items.reduce((n, i) => n + i.qty, 0) : 0
  const basketTotal = cart.restaurantId === r.id ? computeTotals(cart, r).subtotal : 0

  const starCounts = [5, 4, 3, 2, 1].map((s) => allReviews.filter((x) => x.rating === s).length)

  const share = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    toast('Link copied to clipboard')
  }
  const submitReview = (e) => {
    e.preventDefault()
    if (myText.trim().length < 5) return toast('Please write at least a few words', 'warning')
    addReview(r.id, { name: user?.name || 'Guest', rating: myRating, text: myText.trim(), date: 'Just now' })
    setMyText('')
    toast('Thanks for your review!')
  }

  return (
    <div className="pb-24 lg:pb-0">
      {/* banner */}
      <div className="relative h-52 md:h-72">
        <SafeImage src={r.image} alt={r.name} className="h-full w-full object-cover" />
        <div className="from-neutral/90 via-neutral/30 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="card bg-base-100 relative -mt-20 shadow-xl">
          <div className="card-body gap-4 md:flex-row md:items-center">
            <div className="avatar">
              <div className="mask mask-squircle w-20 md:w-24">
                <SafeImage src={r.menu[0]?.image || r.image} alt="" />
              </div>
            </div>
            <div className="flex-1">
              <div className="breadcrumbs py-0 text-xs">
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/restaurants">Restaurants</Link></li>
                  <li><Link to={`/restaurants?cat=${encodeURIComponent(r.cuisine)}`}>{r.cuisine}</Link></li>
                </ul>
              </div>
              <h1 className="text-2xl font-extrabold md:text-3xl">{r.name}</h1>
              <div className="text-base-content/70 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="fill-warning text-warning size-4" /> <b className="text-base-content">{r.rating}</b> ({r.reviews.toLocaleString()} reviews)
                </span>
                <span>{r.cuisine} · {PRICE[r.price]}</span>
                <span className="flex items-center gap-1">
                  <span className={`status ${r.isOpen ? 'status-success animate-pulse' : 'status-error'}`} /> {r.isOpen ? 'Open now' : 'Closed'} · {r.hours}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={`btn btn-circle swap swap-rotate ${fav ? 'swap-active' : ''}`} onClick={() => toggleFavorite(r.id)} aria-label="Favourite">
                <Heart className="swap-off size-5" />
                <Heart className="swap-on fill-secondary text-secondary size-5" />
              </button>
              <div className="tooltip" data-tip="Copy link">
                <button className="btn btn-circle" onClick={share} aria-label="Share"><Share2 className="size-5" /></button>
              </div>
            </div>
          </div>
          <div className="stats stats-horizontal border-base-300 w-full overflow-x-auto rounded-t-none border-t">
            <div className="stat place-items-center py-3">
              <div className="stat-title flex items-center gap-1"><Clock className="size-4" /> Delivery</div>
              <div className="stat-value text-lg">{r.eta[0]}–{r.eta[1]} min</div>
            </div>
            <div className="stat place-items-center py-3">
              <div className="stat-title flex items-center gap-1"><Bike className="size-4" /> Fee</div>
              <div className="stat-value text-lg">{r.freeDelivery ? 'Free' : money(r.deliveryFee)}</div>
            </div>
            <div className="stat place-items-center py-3">
              <div className="stat-title flex items-center gap-1"><Wallet className="size-4" /> Min order</div>
              <div className="stat-value text-lg">{money(r.minOrder)}</div>
            </div>
            <div className="stat place-items-center py-3">
              <div className="stat-title flex items-center gap-1"><MapPin className="size-4" /> Distance</div>
              <div className="stat-value text-lg">{r.distance} km</div>
            </div>
          </div>
        </div>

        {!r.isOpen && (
          <div role="alert" className="alert alert-error alert-soft mt-4">
            <span>😴 {r.name} is closed right now. You can browse the menu but ordering is paused. Opening hours: {r.hours}</span>
          </div>
        )}
        {r.promo && (
          <div role="alert" className="alert alert-warning alert-soft mt-4">
            <span>🎁 <b>Promo:</b> {r.promo}</span>
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div role="tablist" className="tabs tabs-lift">
            {/* ---------- MENU ---------- */}
            <input type="radio" name="restaurant-tabs" role="tab" className="tab" aria-label="Menu" checked={tab === 'menu'} onChange={() => setTab('menu')} />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="input w-full sm:max-w-xs">
                  <Search className="size-4 opacity-50" />
                  <input type="search" placeholder="Search this menu" value={search} onChange={(e) => setSearch(e.target.value)} />
                </label>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {sections.map((s) => (
                    <button key={s} className={`btn btn-sm shrink-0 rounded-full ${section === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSection(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {items.length === 0 && <p className="py-10 text-center opacity-60">No dishes match “{search}”.</p>}
              {Object.entries(grouped).map(([sec, list]) => (
                <div key={sec} className="mt-6">
                  <div className="divider divider-start font-bold">{sec}</div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {list.map((m) => (
                      <MenuItemCard key={m.id} item={m} qtyInCart={qtyFor(m.id)} disabled={!r.isOpen} onSelect={setSelected} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- REVIEWS ---------- */}
            <input type="radio" name="restaurant-tabs" role="tab" className="tab" aria-label={`Reviews (${allReviews.length})`} checked={tab === 'reviews'} onChange={() => setTab('reviews')} />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4 md:p-6">
              <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                <div className="text-center">
                  <p className="text-6xl font-extrabold">{r.rating}</p>
                  <RatingStars value={r.rating} size="rating-sm" />
                  <p className="text-sm opacity-60">{r.reviews.toLocaleString()} ratings</p>
                </div>
                <div className="space-y-1">
                  {starCounts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-6">{5 - i}★</span>
                      <progress className="progress progress-warning flex-1" value={c} max={allReviews.length} />
                      <span className="w-6 text-right opacity-60">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={submitReview} className="bg-base-200 rounded-box mt-6 space-y-2 p-4">
                <p className="font-semibold">Rate your experience</p>
                <RatingInput value={myRating} onChange={setMyRating} name="new-review" />
                <textarea className="textarea w-full" rows={2} placeholder="What did you love? What could be better?" value={myText} onChange={(e) => setMyText(e.target.value)} />
                <button className="btn btn-primary btn-sm">Post review</button>
              </form>

              <ul className="mt-6 space-y-4">
                {allReviews.map((rv, i) => (
                  <li key={i} className="flex gap-3">
                    <Avatar name={rv.name} size="w-10" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{rv.name}</span>
                        <RatingStars value={rv.rating} />
                        <span className="text-xs opacity-50">{rv.date}</span>
                      </div>
                      <p className="text-base-content/80 text-sm">{rv.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- INFO ---------- */}
            <input type="radio" name="restaurant-tabs" role="tab" className="tab" aria-label="Info" checked={tab === 'info'} onChange={() => setTab('info')} />
            <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4 md:p-6">
              <p className="mb-4">{r.description}</p>
              <div className="overflow-x-auto">
                <table className="table">
                  <tbody>
                    <tr><th>Address</th><td>{r.address}</td></tr>
                    <tr><th>Opening hours</th><td>{r.hours}</td></tr>
                    <tr><th>Cuisine</th><td>{r.cuisine}</td></tr>
                    <tr><th>Delivery fee</th><td>{r.freeDelivery ? 'Free' : money(r.deliveryFee)}</td></tr>
                    <tr><th>Minimum order</th><td>{money(r.minOrder)}</td></tr>
                    <tr><th>Halal</th><td><span className="badge badge-success badge-sm">Certified</span></td></tr>
                  </tbody>
                </table>
              </div>
              <iframe
                title="Map"
                className="rounded-box border-base-300 mt-4 h-64 w-full border"
                loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=101.66%2C3.11%2C101.73%2C3.17&layer=mapnik"
              />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <BasketSummary restaurant={r} />
            </div>
          </aside>
        </div>
      </div>

      {/* mobile basket bar */}
      {basketCount > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-2 lg:hidden">
          <Link to="/checkout" className="btn btn-primary btn-block btn-lg shadow-xl">
            <span className="badge badge-neutral">{basketCount}</span> View basket · {money(basketTotal)}
          </Link>
        </div>
      )}

      <ItemModal item={selected} restaurant={r} onClose={() => setSelected(null)} />
    </div>
  )
}
