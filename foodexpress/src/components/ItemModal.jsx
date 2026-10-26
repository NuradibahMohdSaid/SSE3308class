import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { money, useStore } from '../context/StoreContext'
import { ItemTags } from './MenuItemCard'
import { QtyStepper, SafeImage } from './ui'

const SIZES = [
  { label: 'Regular', price: 0 },
  { label: 'Large', price: 3 },
]
const FOOD_ADDONS = [
  { label: 'Extra sauce', price: 1 },
  { label: 'Extra cheese', price: 2 },
  { label: 'Fried egg', price: 1.5 },
]
const DRINK_ADDONS = [
  { label: 'Extra pearls', price: 1.5 },
  { label: 'Oat milk', price: 2 },
  { label: 'Extra shot', price: 2.5 },
]
const DRINK_SECTIONS = ['Drinks', 'Coffee', 'Milk Tea', 'Smoothies']
const SPICE = ['No chilli', 'Mild', 'Medium', 'Hot', 'Very hot 🔥']

// Customise-and-add dialog for a single menu item
export default function ItemModal({ item, restaurant, onClose }) {
  const { addToCart } = useStore()
  const ref = useRef(null)
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState(SIZES[0])
  const [addons, setAddons] = useState([])
  const [spice, setSpice] = useState(2)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!item) return
    setQty(1)
    setSize(SIZES[0])
    setAddons([])
    setSpice(2)
    setNote('')
    ref.current.showModal()
  }, [item])

  if (!item) return <dialog ref={ref} className="modal" />

  const addonList = DRINK_SECTIONS.includes(item.section) ? DRINK_ADDONS : FOOD_ADDONS
  const spicy = item.tags?.includes('spicy')
  const unit = item.price + size.price + addons.reduce((s, a) => s + a.price, 0)
  const toggleAddon = (a) =>
    setAddons((list) => (list.some((x) => x.label === a.label) ? list.filter((x) => x.label !== a.label) : [...list, a]))

  const close = () => {
    ref.current.close()
    onClose()
  }
  const add = async () => {
    const ok = await addToCart(restaurant, item, qty, {
      size,
      addons,
      spice: spicy ? SPICE[spice] : undefined,
      note: note.trim() || undefined,
    })
    if (ok) close()
  }

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onCancel={onClose}>
      <div className="modal-box max-h-[92vh] p-0">
        <figure className="relative">
          <SafeImage src={item.image} alt={item.name} className="h-52 w-full object-cover" />
          <button className="btn btn-circle btn-sm absolute top-3 right-3" onClick={close} aria-label="Close">
            <X className="size-4" />
          </button>
        </figure>
        <div className="space-y-5 p-5">
          <div>
            <ItemTags tags={item.tags} />
            <h3 className="mt-1 text-xl font-bold">{item.name}</h3>
            <p className="text-base-content/70 text-sm">{item.desc}</p>
            <p className="mt-1 text-lg font-bold">{money(item.price)}</p>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Size <span className="badge badge-xs badge-neutral">Required</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s) => (
                <label key={s.label} className={`border-base-300 rounded-field flex cursor-pointer items-center gap-2 border p-3 ${size.label === s.label ? 'border-primary bg-primary/10' : ''}`}>
                  <input type="radio" name="size" className="radio radio-primary radio-sm" checked={size.label === s.label} onChange={() => setSize(s)} />
                  <span className="flex-1">{s.label}</span>
                  <span className="text-xs opacity-70">{s.price ? `+${money(s.price)}` : 'Free'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Add-ons <span className="badge badge-xs badge-ghost">Optional</span>
            </legend>
            {addonList.map((a) => (
              <label key={a.label} className="label hover:bg-base-200 rounded-field cursor-pointer justify-between p-2 text-base-content">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={addons.some((x) => x.label === a.label)}
                    onChange={() => toggleAddon(a)}
                  />
                  {a.label}
                </span>
                <span className="text-xs">+{money(a.price)}</span>
              </label>
            ))}
          </fieldset>

          {spicy && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                Spice level: <span className="text-secondary">{SPICE[spice]}</span>
              </legend>
              <input type="range" min={0} max={4} value={spice} step={1} className="range range-secondary range-sm w-full" onChange={(e) => setSpice(+e.target.value)} />
              <div className="flex justify-between px-2 text-xs">
                {SPICE.map((_, i) => (
                  <span key={i}>{'🌶'.repeat(i) || '0'}</span>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Special instructions</legend>
            <textarea
              className="textarea w-full"
              rows={2}
              maxLength={120}
              placeholder="e.g. no onions, sauce on the side"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="label">{note.length}/120</p>
          </fieldset>
        </div>
        <div className="bg-base-100 border-base-300 sticky bottom-0 flex items-center gap-3 border-t p-4">
          <QtyStepper value={qty} min={1} onChange={setQty} />
          <button className="btn btn-primary flex-1" onClick={add} disabled={!restaurant?.isOpen}>
            {restaurant?.isOpen ? `Add to basket · ${money(unit * qty)}` : 'Restaurant closed'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
