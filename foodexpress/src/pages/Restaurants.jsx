import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ItemModal from '../components/ItemModal'
import RestaurantCard, { RestaurantCardSkeleton } from '../components/RestaurantCard'
import { EmptyState, SafeImage } from '../components/ui'
import { money, useStore } from '../context/StoreContext'
import { CATEGORIES } from '../data/restaurants'

const PER_PAGE = 6
const DEFAULT_FILTERS = {
  cuisines: [],
  minRating: 0,
  maxFee: 7,
  price: 0,
  maxTime: 60,
  openNow: false,
  freeDelivery: false,
  promoOnly: false,
}
const SORTS = {
  recommended: { label: 'Recommended', fn: (a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews) },
  rating: { label: 'Highest rated', fn: (a, b) => b.rating - a.rating },
  fastest: { label: 'Fastest delivery', fn: (a, b) => a.eta[0] - b.eta[0] },
  fee: { label: 'Lowest delivery fee', fn: (a, b) => (a.freeDelivery ? 0 : a.deliveryFee) - (b.freeDelivery ? 0 : b.deliveryFee) },
  distance: { label: 'Nearest', fn: (a, b) => a.distance - b.distance },
}

function FilterPanel({ filters, setFilters, onReset, counts, prefix }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const toggleCuisine = (c) =>
    set({ cuisines: filters.cuisines.includes(c) ? filters.cuisines.filter((x) => x !== c) : [...filters.cuisines, c] })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <button className="btn btn-ghost btn-xs text-secondary" onClick={onReset}>Reset all</button>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Cuisine</legend>
        {CATEGORIES.slice(1).map((c) => (
          <label key={c.id} className="label text-base-content cursor-pointer justify-between py-1">
            <span className="flex items-center gap-2">
              <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={filters.cuisines.includes(c.id)} onChange={() => toggleCuisine(c.id)} />
              {c.icon} {c.name}
            </span>
            <span className="badge badge-ghost badge-sm">{counts[c.id] || 0}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Price range</legend>
        <div className="filter">
          <input className="btn btn-sm filter-reset" type="radio" name={`${prefix}-price`} aria-label="All" checked={filters.price === 0} onChange={() => set({ price: 0 })} />
          {[1, 2, 3].map((p) => (
            <input key={p} className="btn btn-sm" type="radio" name={`${prefix}-price`} aria-label={'$'.repeat(p)} checked={filters.price === p} onChange={() => set({ price: p })} />
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Minimum rating</legend>
        {[0, 3.5, 4, 4.5].map((r) => (
          <label key={r} className="label text-base-content cursor-pointer gap-2 py-1">
            <input type="radio" name={`${prefix}-rating`} className="radio radio-primary radio-sm" checked={filters.minRating === r} onChange={() => set({ minRating: r })} />
            {r === 0 ? 'Any rating' : `${r}+ ⭐`}
          </label>
        ))}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">
          Max delivery fee: <span className="text-secondary">{filters.maxFee >= 7 ? 'Any' : money(filters.maxFee)}</span>
        </legend>
        <input type="range" min={0} max={7} step={1} value={filters.maxFee} className="range range-primary range-sm w-full" onChange={(e) => set({ maxFee: +e.target.value })} />
        <div className="flex justify-between px-1 text-xs opacity-60">
          <span>Free</span><span>RM2</span><span>RM4</span><span>RM6</span><span>Any</span>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Delivery time</legend>
        <select className="select select-sm w-full" value={filters.maxTime} onChange={(e) => set({ maxTime: +e.target.value })}>
          <option value={60}>Any time</option>
          <option value={20}>Under 20 min</option>
          <option value={30}>Under 30 min</option>
          <option value={45}>Under 45 min</option>
        </select>
      </fieldset>

      <fieldset className="fieldset bg-base-200 rounded-box gap-3 p-3">
        {[
          ['openNow', 'Open now'],
          ['freeDelivery', 'Free delivery'],
          ['promoOnly', 'Has promo'],
        ].map(([key, label]) => (
          <label key={key} className="label text-base-content cursor-pointer justify-between">
            {label}
            <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={filters[key]} onChange={(e) => set({ [key]: e.target.checked })} />
          </label>
        ))}
      </fieldset>
    </div>
  )
}

export default function Restaurants() {
  const { restaurants } = useStore()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, cuisines: params.get('cat') ? [params.get('cat')] : [] }))
  const [sort, setSort] = useState('recommended')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  // keep state in sync when the navbar search or a category link changes the URL
  useEffect(() => {
    setQuery(params.get('q') || '')
    if (params.get('cat')) setFilters((f) => ({ ...f, cuisines: [params.get('cat')] }))
  }, [params])

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    return restaurants
      .filter((r) => {
        const matchesQuery =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.menu.some((m) => m.name.toLowerCase().includes(q))
        const fee = r.freeDelivery ? 0 : r.deliveryFee
        return (
          matchesQuery &&
          (!filters.cuisines.length || filters.cuisines.includes(r.cuisine)) &&
          r.rating >= filters.minRating &&
          (filters.maxFee >= 7 || fee <= filters.maxFee) &&
          (!filters.price || r.price === filters.price) &&
          r.eta[1] <= filters.maxTime &&
          (!filters.openNow || r.isOpen) &&
          (!filters.freeDelivery || r.freeDelivery) &&
          (!filters.promoOnly || r.promo)
        )
      })
      .sort(SORTS[sort].fn)
  }, [restaurants, q, filters, sort])

  const dishes = useMemo(
    () =>
      q.length < 2
        ? []
        : restaurants.flatMap((r) => r.menu.filter((m) => m.name.toLowerCase().includes(q)).map((m) => ({ ...m, restaurant: r }))).slice(0, 6),
    [restaurants, q],
  )

  const counts = useMemo(() => restaurants.reduce((acc, r) => ({ ...acc, [r.cuisine]: (acc[r.cuisine] || 0) + 1 }), {}), [restaurants])

  // brief skeleton state so filtering feels responsive
  useEffect(() => {
    setLoading(true)
    setPage(1)
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [q, filters, sort])

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const visible = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const activeChips = [
    ...filters.cuisines.map((c) => ({ label: c, clear: () => setFilters((f) => ({ ...f, cuisines: f.cuisines.filter((x) => x !== c) })) })),
    filters.minRating && { label: `${filters.minRating}+ ⭐`, clear: () => setFilters((f) => ({ ...f, minRating: 0 })) },
    filters.price && { label: '$'.repeat(filters.price), clear: () => setFilters((f) => ({ ...f, price: 0 })) },
    filters.maxFee < 7 && { label: `Fee ≤ ${money(filters.maxFee)}`, clear: () => setFilters((f) => ({ ...f, maxFee: 7 })) },
    filters.maxTime < 60 && { label: `< ${filters.maxTime} min`, clear: () => setFilters((f) => ({ ...f, maxTime: 60 })) },
    filters.openNow && { label: 'Open now', clear: () => setFilters((f) => ({ ...f, openNow: false })) },
    filters.freeDelivery && { label: 'Free delivery', clear: () => setFilters((f) => ({ ...f, freeDelivery: false })) },
    filters.promoOnly && { label: 'Has promo', clear: () => setFilters((f) => ({ ...f, promoOnly: false })) },
  ].filter(Boolean)

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS)
    setQuery('')
    setParams({})
  }

  const panel = (prefix) => <FilterPanel prefix={prefix} filters={filters} setFilters={setFilters} onReset={resetAll} counts={counts} />

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li>Restaurants</li>
          {filters.cuisines.length === 1 && <li>{filters.cuisines[0]}</li>}
        </ul>
      </div>
      <h1 className="text-3xl font-bold">Restaurants near you</h1>
      <p className="text-base-content/60">Search, filter and sort to find exactly what you're craving.</p>

      {/* category chips */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => {
          const active = c.id === 'all' ? filters.cuisines.length === 0 : filters.cuisines.length === 1 && filters.cuisines[0] === c.id
          return (
            <button
              key={c.id}
              className={`btn btn-sm shrink-0 rounded-full ${active ? 'btn-primary' : 'btn-outline border-base-300'}`}
              onClick={() => setFilters((f) => ({ ...f, cuisines: c.id === 'all' ? [] : [c.id] }))}
            >
              {c.icon} {c.name}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="card bg-base-100 border-base-300 sticky top-20 hidden self-start border p-5 lg:block">{panel('side')}</aside>

        <section>
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="input min-w-0 flex-1">
              <Search className="size-4 opacity-50" />
              <input type="search" placeholder="Search restaurants, cuisines or dishes…" value={query} onChange={(e) => setQuery(e.target.value)} />
              {query && (
                <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setQuery('')} aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <button className="btn lg:hidden" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="size-4" /> Filters
              {activeChips.length > 0 && <span className="badge badge-primary badge-sm">{activeChips.length}</span>}
            </button>
            <select className="select w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              {Object.entries(SORTS).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
            <div className="join" role="group" aria-label="View">
              <button className={`btn join-item btn-square ${view === 'grid' ? 'btn-active btn-primary' : ''}`} onClick={() => setView('grid')} aria-label="Grid view">
                <LayoutGrid className="size-4" />
              </button>
              <button className={`btn join-item btn-square ${view === 'list' ? 'btn-active btn-primary' : ''}`} onClick={() => setView('list')} aria-label="List view">
                <List className="size-4" />
              </button>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeChips.map((c) => (
                <button key={c.label} className="badge badge-primary badge-soft gap-1" onClick={c.clear}>
                  {c.label} <X className="size-3" />
                </button>
              ))}
              <button className="link link-secondary text-xs" onClick={resetAll}>Clear all</button>
            </div>
          )}

          {dishes.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold">Dishes matching “{query}”</h2>
              <ul className="list bg-base-100 rounded-box border-base-300 border">
                {dishes.map((d) => (
                  <li key={d.id} className="list-row items-center">
                    <SafeImage src={d.image} alt={d.name} className="rounded-field size-12 object-cover" />
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs opacity-60">{d.restaurant.name} · {money(d.price)}</div>
                    </div>
                    <button className="btn btn-sm btn-primary" disabled={!d.restaurant.isOpen || !d.available} onClick={() => setSelected(d)}>
                      {d.restaurant.isOpen ? 'Add' : 'Closed'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-base-content/60 mt-6 mb-3 text-sm">
            {loading ? <span className="loading loading-dots loading-sm" /> : <><b className="text-base-content">{results.length}</b> restaurants found</>}
          </p>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <EmptyState icon="🔍" title="No restaurants match" text="Try removing a filter or searching for something else.">
              <button className="btn btn-primary" onClick={resetAll}>Reset filters</button>
            </EmptyState>
          ) : (
            <div className={view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'}>
              {visible.map((r) => <RestaurantCard key={r.id} restaurant={r} layout={view} />)}
            </div>
          )}

          {!loading && pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="join">
                <button className="join-item btn" disabled={page === 1} onClick={() => setPage(page - 1)}>«</button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} className={`join-item btn ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button className="join-item btn" disabled={page === pages} onClick={() => setPage(page + 1)}>»</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* mobile filter drawer */}
      <div className="drawer drawer-end lg:hidden">
        <input id="filter-drawer" type="checkbox" className="drawer-toggle" checked={filterOpen} onChange={(e) => setFilterOpen(e.target.checked)} />
        <div className="drawer-content" />
        <div className="drawer-side z-50">
          <label htmlFor="filter-drawer" aria-label="close filters" className="drawer-overlay" />
          <div className="bg-base-100 flex min-h-full w-80 flex-col p-5">
            {panel('drawer')}
            <button className="btn btn-primary mt-6" onClick={() => setFilterOpen(false)}>
              Show {results.length} results
            </button>
          </div>
        </div>
      </div>

      <ItemModal item={selected} restaurant={selected?.restaurant} onClose={() => setSelected(null)} />
    </div>
  )
}
