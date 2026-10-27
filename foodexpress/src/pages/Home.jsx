import { ArrowRight, Bike, ChefHat, ChevronLeft, ChevronRight, Clock, Copy, MapPin, Plus, Search, ShieldCheck, Star, Utensils } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ItemModal from '../components/ItemModal'
import { ItemTags } from '../components/MenuItemCard'
import RestaurantCard from '../components/RestaurantCard'
import { Avatar, RatingStars, SafeImage, SectionHeader } from '../components/ui'
import { money, useNow, useStore } from '../context/StoreContext'
import { CATEGORIES, IMG, PROMO_CODES } from '../data/restaurants'

const PROMO_STYLE = {
  FORK10: 'bg-primary text-primary-content',
  FREESHIP: 'bg-secondary text-secondary-content',
  YELLOW5: 'bg-neutral text-neutral-content',
}
const PROMO_EMOJI = { FORK10: '🍔', FREESHIP: '🛵', YELLOW5: '🍰' }

const TESTIMONIALS = [
  { name: 'Nur Aisyah', text: 'Ordered nasi lemak at 7am and it arrived still steaming. ForkSpoon is my breakfast hero!', side: 'chat-start', time: '07:42' },
  { name: 'Jason Lim', text: 'Love the live tracking — I can see exactly when the rider is downstairs.', side: 'chat-end', time: '12:15' },
  { name: 'Priya S.', text: 'The FORK10 promo code saved me so much on our office lunch order 🙌', side: 'chat-start', time: '13:03' },
]

const FAQ = [
  ['How long does delivery take?', 'Most orders arrive in 20–40 minutes. You can watch your rider live on the Track Order page.'],
  ['Is there a minimum order?', 'Each restaurant sets its own minimum order, shown on the restaurant page and in your basket.'],
  ['Which payment methods do you accept?', 'Credit/debit cards, FPX online banking, e-wallets (Touch ’n Go, GrabPay, Boost) and cash on delivery.'],
  ['Can I cancel my order?', 'Yes — you can cancel any time before the restaurant starts preparing your food.'],
  ['Where can I see a restaurant’s details and menu?', 'Open the “For Restaurants” page and tap a restaurant name to see its address, opening hours, delivery fees and full menu.'],
]

// time left until 2 PM today (lunch deal)
function useLunchCountdown() {
  const now = useNow(1000)
  const end = new Date()
  end.setHours(14, 0, 0, 0)
  if (end.getTime() < now) end.setDate(end.getDate() + 1)
  const s = Math.floor((end.getTime() - now) / 1000)
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export default function Home() {
  const { restaurants, toast, cart } = useStore()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [selected, setSelected] = useState(null)
  const carouselRef = useRef(null)
  const time = useLunchCountdown()

  const popular = useMemo(() => [...restaurants].filter((r) => r.isOpen).sort((a, b) => b.rating - a.rating).slice(0, 8), [restaurants])
  const trending = useMemo(
    () =>
      restaurants
        .filter((r) => r.isOpen)
        .flatMap((r) => r.menu.filter((m) => m.tags.includes('popular') && m.available).map((m) => ({ ...m, restaurant: r })))
        .slice(0, 12),
    [restaurants],
  )

  const findFood = (e) => {
    e.preventDefault()
    if (address.trim()) toast(`Showing restaurants that deliver to ${address}`, 'info')
    navigate('/restaurants')
  }
  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {})
    toast(`Promo code ${code} copied!`)
  }
  const scrollTrending = (dir) => carouselRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  useEffect(() => {
    document.title = 'ForkSpoon | Food Delivery'
  }, [])

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="bg-neutral text-neutral-content relative overflow-hidden">
        <div className="bg-primary/30 absolute -top-32 -right-32 size-96 rounded-full blur-3xl" />
        <div className="bg-secondary/20 absolute -bottom-40 -left-20 size-96 rounded-full blur-3xl" />
        <div className="hero relative mx-auto max-w-7xl px-4 py-12 lg:py-20">
          <div className="hero-content w-full flex-col gap-10 p-0 lg:flex-row-reverse lg:justify-between">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="hover-3d w-full">
                <figure className="rounded-box aspect-square w-full overflow-hidden shadow-2xl">
                  <SafeImage src={IMG.burgerFries} alt="Burger and fries" className="h-full w-full object-cover" />
                </figure>
                <div /><div /><div /><div /><div /><div /><div /><div />
              </div>
              <div className="bg-base-100 text-base-content rounded-box animate-float absolute -bottom-4 -left-2 flex items-center gap-3 p-3 shadow-xl sm:-left-8">
                <div className="bg-primary/20 rounded-field grid size-10 place-items-center"><Clock className="text-primary-content size-5" /></div>
                <div>
                  <p className="text-xs opacity-60">Avg. delivery</p>
                  <p className="font-bold">25 min</p>
                </div>
              </div>
              <div className="bg-base-100 text-base-content rounded-box animate-float absolute -top-4 -right-2 flex items-center gap-2 p-3 shadow-xl [animation-delay:1.5s] sm:-right-6">
                <Star className="fill-warning text-warning size-5" />
                <span className="font-bold">4.9</span>
                <span className="text-xs opacity-60">app rating</span>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <span className="badge badge-primary mb-4 gap-1 font-semibold">🛵 Free delivery on your first order</span>
              <h1 className="text-4xl leading-tight font-extrabold md:text-5xl lg:text-6xl">
                Your favourite food, delivered{' '}
                <span className="text-rotate text-primary">
                  <span>
                    <span>fast.</span>
                    <span>hot.</span>
                    <span>fresh.</span>
                    <span>happy.</span>
                  </span>
                </span>
              </h1>
              <p className="text-neutral-content/70 mt-4 text-lg">
                Discover the best restaurants near you — from mamak favourites to sushi platters — and get them at your door in minutes.
              </p>

              <form onSubmit={findFood} className="join mt-6 w-full shadow-lg">
                <label className="input input-lg join-item text-base-content w-full">
                  <MapPin className="text-secondary size-5" />
                  <input type="text" placeholder="Enter your delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
                <button className="btn btn-primary btn-lg join-item">
                  <Search className="size-5" /> <span className="hidden sm:inline">Find Food</span>
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="avatar-group -space-x-4">
                  {['Aisyah Rahman', 'Jason Lim', 'Priya Devi', 'Hafiz Zain'].map((n) => (
                    <Avatar key={n} name={n} size="w-10" />
                  ))}
                  <div className="avatar avatar-placeholder">
                    <div className="bg-secondary text-secondary-content w-10 rounded-full"><span className="text-xs">+10k</span></div>
                  </div>
                </div>
                <div className="text-sm">
                  <RatingStars value={5} size="rating-xs" />
                  <p className="text-neutral-content/70">10,000+ happy foodies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10">
        {/* ---------------- CATEGORIES ---------------- */}
        <section>
          <SectionHeader eyebrow="What are you craving?" title="Browse by category" />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={c.id === 'all' ? '/restaurants' : `/restaurants?cat=${encodeURIComponent(c.id)}`}
                className="card bg-base-100 border-base-300 hover:border-primary hover:bg-primary/10 w-28 shrink-0 border text-center transition"
              >
                <div className="card-body items-center gap-1 p-4">
                  <span className="text-4xl">{c.icon}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- PROMOS ---------------- */}
        <section id="promos" className="scroll-mt-20">
          <SectionHeader
            eyebrow="Deals for you"
            title="Today's promo codes"
            action={
              <div className="text-right text-sm">
                <p className="opacity-60">Lunch deal ends in</p>
                <span className="countdown font-mono text-xl font-bold">
                  <span style={{ '--value': time.h }} aria-live="polite" aria-label={time.h}>{time.h}</span>:
                  <span style={{ '--value': time.m, '--digits': 2 }} aria-live="polite" aria-label={time.m}>{time.m}</span>:
                  <span style={{ '--value': time.s, '--digits': 2 }} aria-live="polite" aria-label={time.s}>{time.s}</span>
                </span>
              </div>
            }
          />
          <div className="carousel carousel-center rounded-box w-full gap-4">
            {Object.entries(PROMO_CODES).map(([code, p]) => (
              <div key={code} className="carousel-item w-[85%] sm:w-[48%] lg:w-[32%]">
                <div className={`card w-full ${PROMO_STYLE[code]}`}>
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="card-title text-2xl font-extrabold">{p.label}</h3>
                        <p className="opacity-80">Use code at checkout{p.min ? ` · min ${money(p.min)}` : ''}</p>
                      </div>
                      <span className="text-5xl">{PROMO_EMOJI[code]}</span>
                    </div>
                    <div className="card-actions mt-2 items-center justify-between">
                      <kbd className="kbd kbd-lg text-base-content font-bold tracking-widest">{code}</kbd>
                      <button className="btn btn-sm bg-base-100 text-base-content border-0" onClick={() => copyCode(code)}>
                        <Copy className="size-4" /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {cart.promo && (
            <div role="alert" className="alert alert-success alert-soft mt-4">
              <span>✅ Promo <b>{cart.promo}</b> is applied to your basket.</span>
            </div>
          )}
        </section>

        {/* ---------------- POPULAR ---------------- */}
        <section>
          <SectionHeader
            eyebrow="Top rated near you"
            title="Popular restaurants"
            action={
              <Link to="/restaurants" className="btn btn-ghost btn-sm text-secondary">
                See all <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
          <p className="text-base-content/50 mt-3 text-center text-xs">Tip: hover over a restaurant photo to preview its dishes 👀</p>
        </section>

        {/* ---------------- TRENDING DISHES ---------------- */}
        <section>
          <SectionHeader
            eyebrow="Trending now"
            title="Dishes everyone is ordering"
            action={
              <div className="join hidden sm:flex">
                <button className="btn btn-circle join-item" onClick={() => scrollTrending(-1)} aria-label="Scroll left"><ChevronLeft className="size-5" /></button>
                <button className="btn btn-circle join-item" onClick={() => scrollTrending(1)} aria-label="Scroll right"><ChevronRight className="size-5" /></button>
              </div>
            }
          />
          <div ref={carouselRef} className="carousel w-full gap-4 pb-2">
            {trending.map((d) => (
              <div key={d.id} className="carousel-item">
                <div className="card bg-base-100 border-base-300 w-60 border">
                  <figure className="relative">
                    <SafeImage src={d.image} alt={d.name} className="h-36 w-full object-cover" />
                    <button className="btn btn-primary btn-circle btn-sm absolute right-2 bottom-2 shadow" onClick={() => setSelected(d)} aria-label={`Add ${d.name}`}>
                      <Plus className="size-4" />
                    </button>
                  </figure>
                  <div className="card-body gap-1 p-4">
                    <ItemTags tags={d.tags} />
                    <h3 className="line-clamp-1 font-semibold">{d.name}</h3>
                    <Link to={`/restaurant/${d.restaurant.id}`} className="link link-hover text-base-content/60 text-xs">
                      {d.restaurant.name}
                    </Link>
                    <p className="font-bold">{money(d.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- HOW IT WORKS + STATS ---------------- */}
        <section className="bg-base-200 rounded-box p-6 md:p-10">
          <SectionHeader eyebrow="Simple as 1-2-3" title="How ForkSpoon works" />
          <ul className="steps steps-vertical lg:steps-horizontal w-full">
            <li data-content="🔍" className="step step-primary">Choose a restaurant</li>
            <li data-content="🛒" className="step step-primary">Add dishes to basket</li>
            <li data-content="💳" className="step step-primary">Checkout securely</li>
            <li data-content="🛵" className="step step-primary">Track rider live</li>
            <li data-content="😋" className="step">Enjoy your meal</li>
          </ul>
          <div className="stats stats-vertical bg-base-100 mt-8 w-full shadow md:stats-horizontal">
            <div className="stat">
              <div className="stat-figure text-primary"><Utensils className="size-8" /></div>
              <div className="stat-title">Partner restaurants</div>
              <div className="stat-value">{restaurants.length * 50}+</div>
              <div className="stat-desc">across the Klang Valley</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary"><Bike className="size-8" /></div>
              <div className="stat-title">Active riders</div>
              <div className="stat-value">1.2K</div>
              <div className="stat-desc">↗︎ 12% this month</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-accent"><ChefHat className="size-8" /></div>
              <div className="stat-title">Meals delivered</div>
              <div className="stat-value">86K</div>
              <div className="stat-desc">since 2024</div>
            </div>
            <div className="stat">
              <div className="stat-figure"><ShieldCheck className="text-success size-8" /></div>
              <div className="stat-title">On-time rate</div>
              <div className="stat-value">97%</div>
              <div className="stat-desc">
                <progress className="progress progress-success w-full" value={97} max={100} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- WHY + DIFF ---------------- */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Why ForkSpoon?" title="Skip the cooking, keep the flavour" />
            <p className="text-base-content/70">
              Drag the slider to compare a sad, empty plate with a ForkSpoon feast. We handle the cooking and the delivery so you can focus on eating.
            </p>
            <ul className="mt-4 space-y-2">
              {['Real-time order tracking', 'Hundreds of halal-certified kitchens', 'Secure payments & easy refunds', 'Weekly promo codes'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="status status-success status-lg" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <figure className="diff rounded-box aspect-[16/10] shadow-xl" tabIndex={0}>
            <div className="diff-item-1" role="img" tabIndex={0}>
              <SafeImage src={IMG.food} alt="ForkSpoon feast" className="object-cover" />
            </div>
            <div className="diff-item-2" role="img">
              <SafeImage src={IMG.plate} alt="Home-cooked plate" className="object-cover grayscale" />
            </div>
            <div className="diff-resizer" />
          </figure>
        </section>

        {/* ---------------- TESTIMONIALS + APP ---------------- */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Loved by foodies" title="What our customers say" />
            <div className="space-y-2">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className={`chat ${t.side}`}>
                  <div className="chat-image">
                    <Avatar name={t.name} size="w-10" />
                  </div>
                  <div className="chat-header">
                    {t.name} <time className="text-xs opacity-50">{t.time}</time>
                  </div>
                  <div className={`chat-bubble ${t.side === 'chat-end' ? 'chat-bubble-primary' : ''}`}>{t.text}</div>
                  <div className="chat-footer opacity-60">
                    <RatingStars value={5} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row lg:justify-end">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">Get the ForkSpoon app</h3>
              <p className="text-base-content/70 my-2">Exclusive app-only deals and faster checkout.</p>
              <div className="flex justify-center gap-2 sm:justify-start">
                <button className="btn btn-neutral" onClick={() => toast('App Store link coming soon!', 'info')}>App Store</button>
                <button className="btn btn-neutral" onClick={() => toast('Play Store link coming soon!', 'info')}>▶ Google Play</button>
              </div>
            </div>
            <div className="mockup-phone border-primary scale-90">
              <div className="mockup-phone-camera" />
              <div className="mockup-phone-display bg-base-100 text-base-content grid place-content-center">
                <div className="w-64 space-y-3 p-4 pt-12">
                  <p className="text-lg font-bold">Hi there 👋</p>
                  <div className="bg-primary text-primary-content rounded-box p-3 text-sm font-semibold">🛵 Your rider is 3 min away</div>
                  <progress className="progress progress-primary" value={80} max={100} />
                  {popular.slice(0, 3).map((r) => (
                    <div key={r.id} className="bg-base-200 rounded-box flex items-center gap-2 p-2">
                      <SafeImage src={r.image} alt="" className="rounded-field size-10 object-cover" />
                      <div className="text-xs">
                        <p className="font-semibold">{r.name}</p>
                        <p className="opacity-60">⭐ {r.rating} · {r.eta[0]} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20">
          <SectionHeader eyebrow="Need help?" title="Frequently asked questions" />
          <div className="join join-vertical bg-base-100 w-full">
            {FAQ.map(([q, a], i) => (
              <div key={q} className="collapse-arrow join-item border-base-300 collapse border">
                <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
                <div className="collapse-title font-semibold">{q}</div>
                <div className="collapse-content text-base-content/70 text-sm">{a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ItemModal item={selected} restaurant={selected?.restaurant} onClose={() => setSelected(null)} />
    </>
  )
}
