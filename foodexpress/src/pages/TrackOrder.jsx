import { Bike, Home, MessageCircle, Phone, RotateCcw, Search, Send, Star, Store, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar, EmptyState, RatingInput, SafeImage, StatusBadge } from '../components/ui'
import { getOrderStatus, money, useNow, useStore } from '../context/StoreContext'
import { ORDER_STEPS } from '../data/restaurants'

const TOTAL_SECONDS = ORDER_STEPS[ORDER_STEPS.length - 1].at
const RIDER_REPLIES = [
  'Okay, noted! 👍',
  "I'm on my way, traffic is light today 🛵",
  'Sure, I will call you when I reach the lobby.',
  'Almost there! Around 2 minutes away.',
]
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// point on the quadratic curve from the restaurant to the customer (percent coords)
function routePoint(t) {
  const p0 = [12, 80], p1 = [40, 10], p2 = [88, 24]
  const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
  const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
  return { x, y }
}

function LiveMap({ status, progress }) {
  // rider waits at the restaurant until "On the Way", then moves along the route
  const onRoad = status >= 3 ? Math.min(1, Math.max(0, (progress - 0.6) / 0.4)) : 0
  const rider = routePoint(status === 4 ? 1 : onRoad)
  return (
    <div className="map-grid rounded-box border-base-300 relative h-64 overflow-hidden border md:h-80">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M12 80 Q40 10 88 24" fill="none" className="stroke-base-content/20" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 80 Q40 10 88 24" fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
      </svg>
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '12%', top: '80%' }}>
        <div className="tooltip tooltip-open tooltip-bottom" data-tip="Restaurant">
          <span className="bg-secondary text-secondary-content grid size-10 place-items-center rounded-full shadow-lg"><Store className="size-5" /></span>
        </div>
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '88%', top: '24%' }}>
        <div className="tooltip tooltip-open tooltip-bottom" data-tip="You">
          <span className="bg-accent text-accent-content grid size-10 place-items-center rounded-full shadow-lg"><Home className="size-5" /></span>
        </div>
      </div>
      {status >= 0 && status < 5 && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear" style={{ left: `${rider.x}%`, top: `${rider.y}%` }}>
          <span className="relative flex size-12">
            {status === 3 && <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />}
            <span className="bg-primary text-primary-content border-base-100 relative grid size-12 place-items-center rounded-full border-4 shadow-xl">
              <Bike className="size-5" />
            </span>
          </span>
        </div>
      )}
      <span className="badge badge-neutral absolute top-3 left-3">Live map · simulated</span>
    </div>
  )
}

function ChatModal({ open, onClose, order }) {
  const ref = useRef(null)
  const endRef = useRef(null)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState(() => [
    { from: 'rider', text: `Hi! I'm ${order.rider.name.split(' ')[0]}, I'll be delivering your order from ${order.restaurantName} 😊`, time: fmtTime(order.placedAt) },
  ])

  useEffect(() => {
    if (open) ref.current.showModal()
    else ref.current.close()
  }, [open])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, typing])

  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setMessages((m) => [...m, { from: 'me', text: text.trim(), time: fmtTime(Date.now()) }])
    setText('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: 'rider', text: RIDER_REPLIES[Math.floor(Math.random() * RIDER_REPLIES.length)], time: fmtTime(Date.now()) }])
    }, 1400)
  }

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onCancel={onClose}>
      <div className="modal-box flex h-[70vh] flex-col p-0">
        <div className="border-base-300 flex items-center gap-3 border-b p-4">
          <Avatar name={order.rider.name} />
          <div className="flex-1">
            <p className="font-semibold">{order.rider.name}</p>
            <p className="flex items-center gap-1 text-xs opacity-60"><span className="status status-success" /> Online</p>
          </div>
          <button className="btn btn-ghost btn-circle btn-sm" onClick={onClose} aria-label="Close chat"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={`chat ${m.from === 'me' ? 'chat-end' : 'chat-start'}`}>
              <div className="chat-header text-xs opacity-60">{m.from === 'me' ? 'You' : order.rider.name.split(' ')[0]} <time>{m.time}</time></div>
              <div className={`chat-bubble ${m.from === 'me' ? 'chat-bubble-primary' : ''}`}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="chat chat-start">
              <div className="chat-bubble"><span className="loading loading-dots loading-sm" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="border-base-300 join border-t p-3">
          <input className="input join-item w-full" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary join-item" aria-label="Send"><Send className="size-4" /></button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  )
}

export default function TrackOrder() {
  const { orderId } = useParams()
  const { orders, updateOrder, confirm, toast, reorder } = useStore()
  const navigate = useNavigate()
  const now = useNow(1000)
  const [lookup, setLookup] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const rateRef = useRef(null)

  const order = orderId ? orders.find((o) => o.id === orderId) : orders.find((o) => getOrderStatus(o, now) >= 0 && getOrderStatus(o, now) < 4) || orders[0]

  useEffect(() => {
    document.title = 'Track order | ForkSpoon'
  }, [])

  if (!order)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon="🛵" title={orderId ? `Order ${orderId} not found` : 'No orders to track yet'} text="Place an order and you'll be able to follow it live here.">
          <form
            className="join"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/track/${lookup.trim().toUpperCase()}`)
            }}
          >
            <label className="input join-item">
              <Search className="size-4 opacity-50" />
              <input placeholder="Order ID e.g. FS123456" value={lookup} onChange={(e) => setLookup(e.target.value)} required />
            </label>
            <button className="btn btn-neutral join-item">Find</button>
          </form>
          <Link to="/restaurants" className="btn btn-primary">Order food now</Link>
        </EmptyState>
      </div>
    )

  const status = getOrderStatus(order, now)
  const elapsed = (now - order.placedAt) / 1000
  const progress = status === -1 ? 0 : Math.min(1, elapsed / TOTAL_SECONDS)
  const remaining = Math.max(0, Math.ceil(TOTAL_SECONDS - elapsed))
  const step = ORDER_STEPS[Math.max(0, status)]

  const cancel = async () => {
    if (await confirm('Cancel this order?', 'The restaurant has not started cooking yet, so you will get a full refund.', 'Cancel order')) {
      updateOrder(order.id, { cancelled: true })
      toast('Order cancelled. Refund is on its way.', 'info')
    }
  }
  const submitRating = () => {
    updateOrder(order.id, { rated: rating })
    rateRef.current.close()
    toast('Thanks for rating your order! ⭐')
  }
  const handleReorder = async () => {
    if (await reorder(order)) navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul><li><Link to="/">Home</Link></li><li>Track order</li><li>{order.id}</li></ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* status header */}
          <div className="card bg-base-100 border-base-300 border">
            <div className="card-body gap-6 md:flex-row md:items-center">
              <div
                className={`radial-progress shrink-0 ${status === -1 ? 'text-error' : status === 4 ? 'text-success' : 'text-primary'} bg-base-200 border-base-200 border-4`}
                style={{ '--value': Math.round(progress * 100), '--size': '7rem', '--thickness': '0.6rem' }}
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
              >
                <span className="text-xl font-bold">{status === -1 ? '✕' : `${Math.round(progress * 100)}%`}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{status === -1 ? 'Order cancelled' : step.label}</h1>
                  <StatusBadge status={status} label={step.label} />
                </div>
                <p className="opacity-70">{status === -1 ? 'This order was cancelled and refunded.' : step.desc}</p>
                <p className="mt-1 text-sm opacity-60">
                  Order <kbd className="kbd kbd-sm">{order.id}</kbd> · {order.restaurantName} · placed {fmtTime(order.placedAt)}
                </p>
              </div>
              {status >= 0 && status < 4 && (
                <div className="bg-primary text-primary-content rounded-box p-4 text-center">
                  <p className="text-xs font-semibold uppercase">Arriving in</p>
                  <span className="countdown font-mono text-4xl font-bold">
                    <span style={{ '--value': Math.floor(remaining / 60), '--digits': 2 }} aria-label={`${Math.floor(remaining / 60)} minutes`}>{Math.floor(remaining / 60)}</span>:
                    <span style={{ '--value': remaining % 60, '--digits': 2 }} aria-label={`${remaining % 60} seconds`}>{remaining % 60}</span>
                  </span>
                </div>
              )}
            </div>
            {status >= 0 && (
              <div className="border-base-300 border-t p-4">
                <ul className="steps steps-vertical md:steps-horizontal w-full">
                  {ORDER_STEPS.map((s, i) => (
                    <li key={s.key} className={`step ${i <= status ? 'step-primary' : ''}`} data-content={i < status ? '✓' : i === status ? '●' : ''}>
                      <span className="text-sm">{s.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {status >= 0 && <LiveMap status={status} progress={progress} />}

          {/* rider */}
          {status >= 1 && status < 4 && (
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body flex-row flex-wrap items-center gap-4">
                <div className="indicator">
                  <span className="indicator-item badge badge-success badge-xs" />
                  <Avatar name={order.rider.name} size="w-14" ring />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{order.rider.name}</p>
                  <p className="text-sm opacity-70">{order.rider.vehicle} · <kbd className="kbd kbd-xs">{order.rider.plate}</kbd></p>
                  <p className="flex items-center gap-1 text-sm"><Star className="fill-warning text-warning size-4" /> {order.rider.rating}</p>
                </div>
                <div className="flex gap-2">
                  <a href="tel:+60123456789" className="btn btn-circle btn-outline" aria-label="Call rider"><Phone className="size-5" /></a>
                  <button className="btn btn-primary" onClick={() => setChatOpen(true)}><MessageCircle className="size-5" /> Chat</button>
                </div>
              </div>
            </div>
          )}

          {status === 4 && (
            <div role="alert" className="alert alert-success">
              <span>🎉 Delivered at {fmtTime(order.placedAt + TOTAL_SECONDS * 1000)}. Enjoy your meal!</span>
              {order.rated ? (
                <span className="flex items-center gap-1">You rated {order.rated} <Star className="size-4 fill-current" /></span>
              ) : (
                <button className="btn btn-sm" onClick={() => rateRef.current.showModal()}>Rate order</button>
              )}
            </div>
          )}

          {/* timeline + details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title">Order timeline</h2>
                <ul className="timeline timeline-vertical timeline-compact">
                  {ORDER_STEPS.map((s, i) => {
                    const done = status >= i
                    return (
                      <li key={s.key}>
                        {i > 0 && <hr className={done ? 'bg-primary' : ''} />}
                        <div className="timeline-middle">
                          <span className={`grid size-5 place-items-center rounded-full text-xs ${done ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>{done ? '✓' : ''}</span>
                        </div>
                        <div className="timeline-end timeline-box">
                          <p className={`font-semibold ${done ? '' : 'opacity-50'}`}>{s.label}</p>
                          <p className="text-xs opacity-60">{done ? fmtTime(order.placedAt + s.at * 1000) : 'Pending'}</p>
                        </div>
                        {i < ORDER_STEPS.length - 1 && <hr className={status > i ? 'bg-primary' : ''} />}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title">Order details</h2>
                <div className="collapse-arrow bg-base-200 collapse">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title font-semibold">{order.items.reduce((n, i) => n + i.qty, 0)} items · {money(order.totals.total)}</div>
                  <div className="collapse-content text-sm">
                    {order.items.map((i) => (
                      <div key={i.key} className="flex items-center justify-between gap-2 py-1">
                        <span className="flex items-center gap-2">
                          <SafeImage src={i.image} alt="" className="rounded-field size-8 object-cover" /> {i.qty} × {i.name}
                        </span>
                        <span>{money(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="divider my-1" />
                    <div className="flex justify-between"><span>Delivery</span><span>{money(order.totals.deliveryFee)}</span></div>
                    {order.totals.discount > 0 && <div className="text-success flex justify-between"><span>Discount</span><span>-{money(order.totals.discount)}</span></div>}
                    <div className="flex justify-between font-bold"><span>Total paid</span><span>{money(order.totals.total)}</span></div>
                  </div>
                </div>
                <div className="collapse-arrow bg-base-200 collapse">
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold">Delivery & payment</div>
                  <div className="collapse-content text-sm">
                    <p>📍 {order.delivery.address}, {order.delivery.postcode} {order.delivery.city}</p>
                    {order.delivery.note && <p className="opacity-70">📝 {order.delivery.note}</p>}
                    <p className="mt-1">💳 {order.payment.method.toUpperCase()} · {order.payment.detail}</p>
                  </div>
                </div>
                <div className="card-actions mt-2">
                  {status >= 0 && status <= 1 && <button className="btn btn-error btn-outline btn-sm" onClick={cancel}>Cancel order</button>}
                  <button className="btn btn-sm" onClick={handleReorder}><RotateCcw className="size-4" /> Reorder</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* other orders */}
        <aside>
          <div className="card bg-base-100 border-base-300 sticky top-20 border">
            <div className="card-body p-4">
              <h2 className="card-title text-base">Your orders</h2>
              <ul className="menu w-full p-0">
                {orders.slice(0, 8).map((o) => {
                  const st = getOrderStatus(o, now)
                  return (
                    <li key={o.id}>
                      <Link to={`/track/${o.id}`} className={o.id === order.id ? 'menu-active' : ''}>
                        <SafeImage src={o.restaurantImage} alt="" className="rounded-field size-10 object-cover" />
                        <span className="flex-1">
                          <span className="block font-semibold">{o.restaurantName}</span>
                          <span className="text-xs opacity-60">{o.id} · {money(o.totals.total)}</span>
                        </span>
                        <StatusBadge status={st} label={ORDER_STEPS[Math.max(0, st)].label} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <ChatModal key={order.id} open={chatOpen} onClose={() => setChatOpen(false)} order={order} />

      <dialog ref={rateRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box text-center">
          <h3 className="text-lg font-bold">How was your order from {order.restaurantName}?</h3>
          <div className="my-4 flex justify-center">
            <RatingInput value={rating} onChange={setRating} name="order-rating" size="rating-lg" />
          </div>
          <div className="modal-action justify-center">
            <form method="dialog"><button className="btn btn-ghost">Later</button></form>
            <button className="btn btn-primary" onClick={submitRating}>Submit rating</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
