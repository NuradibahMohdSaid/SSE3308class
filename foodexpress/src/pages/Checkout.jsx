import { ArrowLeft, ArrowRight, Banknote, CircleCheck, CreditCard, Landmark, Lock, MapPin, Smartphone, Tag, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState, QtyStepper, SafeImage } from '../components/ui'
import { computeTotals, money, useStore } from '../context/StoreContext'
import { PROMO_CODES } from '../data/restaurants'

const STEPS = ['Basket', 'Delivery', 'Payment', 'Review']
const PAYMENTS = [
  { id: 'card', label: 'Credit / Debit card', icon: CreditCard, desc: 'Visa, Mastercard, AMEX' },
  { id: 'fpx', label: 'FPX Online Banking', icon: Landmark, desc: 'All major Malaysian banks' },
  { id: 'ewallet', label: 'E-Wallet', icon: Smartphone, desc: "Touch 'n Go, GrabPay, Boost" },
  { id: 'cod', label: 'Cash on delivery', icon: Banknote, desc: 'Pay the rider in cash' },
]
const BANKS = ['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Bank Islam', 'Hong Leong Connect']
const WALLETS = ["Touch 'n Go", 'GrabPay', 'Boost', 'ShopeePay']
const SLOTS = ['12:00 – 12:30', '12:30 – 13:00', '13:00 – 13:30', '18:00 – 18:30', '18:30 – 19:00', '19:00 – 19:30']
const TIPS = [0, 2, 3, 5]

function Summary({ totals, cart, restaurant }) {
  const { applyPromo, removePromo, toast } = useStore()
  const [code, setCode] = useState('')
  const apply = (e) => {
    e.preventDefault()
    if (applyPromo(code)) {
      toast(`Promo ${code.toUpperCase()} applied 🎉`)
      setCode('')
    } else toast('That promo code is not valid', 'error')
  }
  return (
    <div className="card bg-base-100 border-base-300 border shadow-sm">
      <div className="card-body p-5">
        <h3 className="card-title">Order summary</h3>
        <p className="-mt-1 text-sm opacity-60">{restaurant?.name}</p>
        {cart.promo ? (
          <div className="alert alert-success alert-soft py-2">
            <Tag className="size-4" />
            <span className="text-sm"><b>{cart.promo}</b> – {PROMO_CODES[cart.promo].label}</span>
            <button className="btn btn-ghost btn-xs btn-circle" onClick={removePromo} aria-label="Remove promo"><X className="size-4" /></button>
          </div>
        ) : (
          <form onSubmit={apply} className="join w-full">
            <input className="input join-item w-full uppercase" placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-neutral join-item" disabled={!code}>Apply</button>
          </form>
        )}
        <p className="text-xs opacity-60">Try FORK10, FREESHIP or YELLOW5</p>
        <div className="divider my-1" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery fee</span><span>{totals.deliveryFee ? money(totals.deliveryFee) : <span className="badge badge-success badge-sm">FREE</span>}</span></div>
          <div className="flex justify-between"><span>Service fee</span><span>{money(totals.serviceFee)}</span></div>
          {totals.tip > 0 && <div className="flex justify-between"><span>Rider tip</span><span>{money(totals.tip)}</span></div>}
          {totals.discount > 0 && <div className="text-success flex justify-between"><span>Discount</span><span>-{money(totals.discount)}</span></div>}
        </div>
        <div className="divider my-1" />
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(totals.total)}</span></div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { cart, cartRestaurant: restaurant, setQty, clearCart, placeOrder, user, confirm, toast } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [placedId, setPlacedId] = useState(null)
  const [tip, setTip] = useState(0)
  const [agree, setAgree] = useState(false)
  const defaultAddr = user?.addresses?.find((a) => a.default) || user?.addresses?.[0]
  const [delivery, setDelivery] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: defaultAddr?.address || '',
    city: defaultAddr?.city || 'Kuala Lumpur',
    postcode: defaultAddr?.postcode || '',
    note: '',
    when: 'asap',
    slot: SLOTS[0],
    cutlery: false,
  })
  const [pay, setPay] = useState({ method: 'card', cardName: '', cardNumber: '', expiry: '', cvv: '', bank: BANKS[0], wallet: WALLETS[0] })
  const successRef = useRef(null)

  const totals = computeTotals(cart, restaurant, tip)
  const belowMin = restaurant && totals.subtotal < restaurant.minOrder
  const setD = (patch) => setDelivery((d) => ({ ...d, ...patch }))
  const setP = (patch) => setPay((p) => ({ ...p, ...patch }))

  useEffect(() => {
    document.title = 'Checkout | ForkSpoon'
  }, [])
  useEffect(() => {
    if (placedId) successRef.current?.showModal()
  }, [placedId])

  const next = (e) => {
    e?.preventDefault()
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  const submitOrder = async () => {
    if (!agree) return toast('Please accept the terms to continue', 'warning')
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 1500)) // pretend to talk to the payment gateway
    const id = placeOrder({
      tip,
      delivery,
      payment: {
        method: pay.method,
        detail: pay.method === 'card' ? `•••• ${pay.cardNumber.replace(/\s/g, '').slice(-4)}` : pay.method === 'fpx' ? pay.bank : pay.method === 'ewallet' ? pay.wallet : 'Cash',
      },
    })
    setPlacing(false)
    setPlacedId(id)
  }

  if (!cart.items.length && !placedId)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon="🛒" title="Your basket is empty" text="Looks like you haven't added anything yet. Let's fix that!">
          <Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>
        </EmptyState>
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">Home</Link></li>
          {restaurant && <li><Link to={`/restaurant/${restaurant.id}`}>{restaurant.name}</Link></li>}
          <li>Checkout</li>
        </ul>
      </div>
      <h1 className="text-3xl font-bold">Checkout</h1>

      <ul className="steps mt-6 w-full">
        {STEPS.map((s, i) => (
          <li key={s} className={`step ${i <= step ? 'step-primary' : ''}`} data-content={i < step ? '✓' : i + 1}>
            <button className="text-xs sm:text-sm" disabled={i > step} onClick={() => setStep(i)}>{s}</button>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* STEP 1 — BASKET */}
          {step === 0 && (
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">Your basket ({cart.items.length})</h2>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={async () => (await confirm('Clear basket?', 'This removes every item.', 'Clear')) && clearCart()}
                  >
                    <Trash2 className="size-4" /> Clear all
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr><th>Item</th><th className="text-center">Qty</th><th className="text-right">Price</th></tr>
                    </thead>
                    <tbody>
                      {cart.items.map((i) => (
                        <tr key={i.key}>
                          <td>
                            <div className="flex items-center gap-3">
                              <SafeImage src={i.image} alt={i.name} className="rounded-field size-12 object-cover" />
                              <div>
                                <div className="font-semibold">{i.name}</div>
                                <div className="text-xs opacity-60">
                                  {[i.options?.size?.label, ...(i.options?.addons || []).map((a) => a.label), i.options?.spice].filter(Boolean).join(' · ')}
                                </div>
                                {i.options?.note && <div className="text-xs italic opacity-60">“{i.options.note}”</div>}
                              </div>
                            </div>
                          </td>
                          <td className="text-center"><QtyStepper value={i.qty} onChange={(v) => setQty(i.key, v)} size="btn-xs" /></td>
                          <td className="text-right font-semibold">{money(i.price * i.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {belowMin && (
                  <div role="alert" className="alert alert-warning alert-soft">
                    <span>Minimum order for {restaurant.name} is {money(restaurant.minOrder)}. Add {money(restaurant.minOrder - totals.subtotal)} more.</span>
                  </div>
                )}
                {!restaurant?.isOpen && (
                  <div role="alert" className="alert alert-error alert-soft"><span>{restaurant?.name} is currently closed.</span></div>
                )}
                <div className="card-actions mt-2 justify-between">
                  <Link to={`/restaurant/${restaurant?.id}`} className="btn btn-ghost"><ArrowLeft className="size-4" /> Add more items</Link>
                  <button className="btn btn-primary" disabled={belowMin || !restaurant?.isOpen} onClick={next}>
                    Continue <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — DELIVERY */}
          {step === 1 && (
            <form onSubmit={next} className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title"><MapPin className="size-5" /> Delivery details</h2>
                {user?.addresses?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.addresses.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        className={`btn btn-sm ${delivery.address === a.address ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setD({ address: a.address, city: a.city, postcode: a.postcode })}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Full name</legend>
                    <input className="input validator w-full" required minLength={3} value={delivery.name} onChange={(e) => setD({ name: e.target.value })} placeholder="Ali bin Abu" />
                    <p className="validator-hint hidden">Please enter your name</p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Phone number</legend>
                    <input type="tel" className="input validator w-full" required pattern="(\+?6?01)[0-9\-\s]{7,11}" value={delivery.phone} onChange={(e) => setD({ phone: e.target.value })} placeholder="012-345 6789" />
                    <p className="validator-hint hidden">Enter a valid Malaysian mobile number</p>
                  </fieldset>
                </div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Street address</legend>
                  <textarea className="textarea validator w-full" required minLength={8} rows={2} value={delivery.address} onChange={(e) => setD({ address: e.target.value })} placeholder="Unit, building, street" />
                  <p className="validator-hint hidden">Please enter your full address</p>
                </fieldset>
                <div className="grid gap-x-4 sm:grid-cols-2">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">City</legend>
                    <select className="select w-full" value={delivery.city} onChange={(e) => setD({ city: e.target.value })}>
                      {['Kuala Lumpur', 'Petaling Jaya', 'Subang Jaya', 'Shah Alam', 'Putrajaya', 'Cyberjaya', 'Serdang'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Postcode</legend>
                    <input className="input validator w-full" required pattern="[0-9]{5}" maxLength={5} value={delivery.postcode} onChange={(e) => setD({ postcode: e.target.value })} placeholder="43400" />
                    <p className="validator-hint hidden">5-digit postcode</p>
                  </fieldset>
                </div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Note for rider <span className="badge badge-ghost badge-xs">optional</span></legend>
                  <input className="input w-full" value={delivery.note} onChange={(e) => setD({ note: e.target.value })} placeholder="e.g. Leave at the guardhouse" />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Delivery time</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[['asap', '⚡ As soon as possible', `${restaurant?.eta[0]}–${restaurant?.eta[1]} min`], ['schedule', '🗓️ Schedule for later', 'Pick a time slot']].map(([v, l, d]) => (
                      <label key={v} className={`border-base-300 rounded-box flex cursor-pointer items-center gap-3 border p-4 ${delivery.when === v ? 'border-primary bg-primary/10' : ''}`}>
                        <input type="radio" name="when" className="radio radio-primary" checked={delivery.when === v} onChange={() => setD({ when: v })} />
                        <span><span className="block font-semibold">{l}</span><span className="text-xs opacity-60">{d}</span></span>
                      </label>
                    ))}
                  </div>
                  {delivery.when === 'schedule' && (
                    <select className="select mt-2 w-full" value={delivery.slot} onChange={(e) => setD({ slot: e.target.value })}>
                      {SLOTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  )}
                </fieldset>
                <label className="label text-base-content mt-2 cursor-pointer gap-3">
                  <input type="checkbox" className="toggle toggle-accent" checked={delivery.cutlery} onChange={(e) => setD({ cutlery: e.target.checked })} />
                  Include plastic cutlery 🍴 <span className="text-xs opacity-60">(help us reduce waste 🌱)</span>
                </label>
                <div className="card-actions mt-4 justify-between">
                  <button type="button" className="btn btn-ghost" onClick={back}><ArrowLeft className="size-4" /> Back</button>
                  <button className="btn btn-primary">Continue to payment <ArrowRight className="size-4" /></button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3 — PAYMENT */}
          {step === 2 && (
            <form onSubmit={next} className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title"><Lock className="size-5" /> Payment method</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENTS.map(({ id, label, icon: Icon, desc }) => (
                    <label key={id} className={`border-base-300 rounded-box flex cursor-pointer items-center gap-3 border p-4 transition ${pay.method === id ? 'border-primary bg-primary/10 ring-primary ring-1' : 'hover:bg-base-200'}`}>
                      <input type="radio" name="payment" className="radio radio-primary radio-sm" checked={pay.method === id} onChange={() => setP({ method: id })} />
                      <Icon className="size-6 opacity-70" />
                      <span><span className="block font-semibold">{label}</span><span className="text-xs opacity-60">{desc}</span></span>
                    </label>
                  ))}
                </div>

                {pay.method === 'card' && (
                  <div className="bg-base-200 rounded-box mt-2 grid gap-x-4 p-4 sm:grid-cols-2">
                    <div role="alert" className="alert alert-info alert-soft text-xs sm:col-span-2">
                      Demo checkout — no real payment is taken. Use the test card 4242 4242 4242 4242.
                    </div>
                    <fieldset className="fieldset sm:col-span-2">
                      <legend className="fieldset-legend">Name on card</legend>
                      <input className="input validator w-full" required value={pay.cardName} onChange={(e) => setP({ cardName: e.target.value })} placeholder="ALI BIN ABU" />
                    </fieldset>
                    <fieldset className="fieldset sm:col-span-2">
                      <legend className="fieldset-legend">Card number</legend>
                      <label className="input validator w-full">
                        <CreditCard className="size-4 opacity-50" />
                        <input
                          required
                          inputMode="numeric"
                          pattern="[0-9 ]{19}"
                          maxLength={19}
                          value={pay.cardNumber}
                          onChange={(e) => setP({ cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ') })}
                          placeholder="4242 4242 4242 4242"
                        />
                      </label>
                      <p className="validator-hint hidden">16-digit card number</p>
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Expiry</legend>
                      <input className="input validator w-full" required pattern="(0[1-9]|1[0-2])/[0-9]{2}" maxLength={5} value={pay.expiry}
                        onChange={(e) => setP({ expiry: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/') })} placeholder="MM/YY" />
                      <p className="validator-hint hidden">Format MM/YY</p>
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">CVV</legend>
                      <input type="password" className="input validator w-full" required pattern="[0-9]{3,4}" maxLength={4} value={pay.cvv} onChange={(e) => setP({ cvv: e.target.value.replace(/\D/g, '') })} placeholder="123" autoComplete="off" />
                    </fieldset>
                  </div>
                )}
                {pay.method === 'fpx' && (
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Choose your bank</legend>
                    <select className="select w-full" value={pay.bank} onChange={(e) => setP({ bank: e.target.value })}>
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </fieldset>
                )}
                {pay.method === 'ewallet' && (
                  <div className="join mt-2 flex-wrap">
                    {WALLETS.map((w) => (
                      <input key={w} type="radio" name="wallet" className="btn join-item" aria-label={w} checked={pay.wallet === w} onChange={() => setP({ wallet: w })} />
                    ))}
                  </div>
                )}
                {pay.method === 'cod' && (
                  <div role="alert" className="alert alert-warning alert-soft"><Banknote className="size-5" /> Please prepare exact change of {money(totals.total)} if possible.</div>
                )}

                <fieldset className="fieldset mt-4">
                  <legend className="fieldset-legend">Tip your rider 🛵</legend>
                  <div className="join">
                    {TIPS.map((t) => (
                      <button type="button" key={t} className={`btn join-item ${tip === t ? 'btn-primary' : ''}`} onClick={() => setTip(t)}>
                        {t === 0 ? 'No tip' : `RM${t}`}
                      </button>
                    ))}
                  </div>
                  <p className="label">100% of your tip goes to the rider.</p>
                </fieldset>

                <div className="card-actions mt-4 justify-between">
                  <button type="button" className="btn btn-ghost" onClick={back}><ArrowLeft className="size-4" /> Back</button>
                  <button className="btn btn-primary">Review order <ArrowRight className="size-4" /></button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 4 — REVIEW */}
          {step === 3 && (
            <div className="card bg-base-100 border-base-300 border">
              <div className="card-body">
                <h2 className="card-title">Review & place order</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-base-200 rounded-box p-4 text-sm">
                    <p className="mb-1 font-semibold">📍 Deliver to</p>
                    <p>{delivery.name} · {delivery.phone}</p>
                    <p className="opacity-70">{delivery.address}, {delivery.postcode} {delivery.city}</p>
                    <p className="mt-1 opacity-70">{delivery.when === 'asap' ? '⚡ ASAP' : `🗓️ ${delivery.slot}`}</p>
                    <button className="link link-secondary mt-1 text-xs" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="bg-base-200 rounded-box p-4 text-sm">
                    <p className="mb-1 font-semibold">💳 Payment</p>
                    <p>{PAYMENTS.find((p) => p.id === pay.method).label}</p>
                    <p className="opacity-70">
                      {pay.method === 'card' && `•••• ${pay.cardNumber.slice(-4)}`}
                      {pay.method === 'fpx' && pay.bank}
                      {pay.method === 'ewallet' && pay.wallet}
                      {pay.method === 'cod' && 'Pay on arrival'}
                    </p>
                    <button className="link link-secondary mt-1 text-xs" onClick={() => setStep(2)}>Edit</button>
                  </div>
                </div>
                <ul className="mt-2 text-sm">
                  {cart.items.map((i) => (
                    <li key={i.key} className="border-base-300 flex justify-between border-b border-dashed py-2">
                      <span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <label className="label text-base-content mt-4 cursor-pointer gap-3 whitespace-normal">
                  <input type="checkbox" className="checkbox checkbox-primary" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  I agree to the ForkSpoon Terms of Service and confirm my order details are correct.
                </label>
                <div className="card-actions mt-4 justify-between">
                  <button className="btn btn-ghost" onClick={back}><ArrowLeft className="size-4" /> Back</button>
                  <div className="aura text-primary">
                    <button className="btn btn-primary btn-lg" disabled={placing || !agree} onClick={submitOrder}>
                      {placing ? <><span className="loading loading-spinner" /> Processing…</> : `Place order · ${money(totals.total)}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="sticky top-20">
            <Summary totals={totals} cart={cart} restaurant={restaurant} />
          </div>
        </aside>
      </div>

      {/* order placed modal */}
      <dialog ref={successRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box text-center">
          <CircleCheck className="text-success mx-auto size-20" />
          <h3 className="mt-2 text-2xl font-bold">Order placed! 🎉</h3>
          <p className="py-2 opacity-70">Your order <kbd className="kbd kbd-sm">{placedId}</kbd> has been sent to the restaurant.</p>
          <div className="modal-action justify-center">
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to home</button>
            <button className="btn btn-primary" onClick={() => navigate(`/track/${placedId}`)}>Track my order</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
