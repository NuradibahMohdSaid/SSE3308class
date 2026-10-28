import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ORDER_STEPS, PROMO_CODES, RIDERS, SEED_RESTAURANTS } from '../data/restaurants'

const StoreContext = createContext(null)

// useState that survives page reloads by mirroring itself into localStorage
function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : structuredClone(initial)
    } catch {
      return structuredClone(initial)
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked - keep working in memory */
    }
  }, [key, value])
  return [value, setValue]
}

export const money = (n) => `RM ${Number(n || 0).toFixed(2)}`
export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 8).toUpperCase()

// Order progress is simulated from the time it was placed.
export function getOrderStatus(order, now = Date.now()) {
  if (order.cancelled) return -1
  const elapsed = (now - order.placedAt) / 1000
  let idx = 0
  ORDER_STEPS.forEach((s, i) => {
    if (elapsed >= s.at) idx = i
  })
  return idx
}

export function computeTotals(cart, restaurant, tip = 0) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  let deliveryFee = restaurant && !restaurant.freeDelivery ? restaurant.deliveryFee : 0
  let discount = 0
  const promo = cart.promo ? PROMO_CODES[cart.promo] : null
  if (promo) {
    if (promo.type === 'percent') discount = (subtotal * promo.value) / 100
    if (promo.type === 'flat' && subtotal >= (promo.min || 0)) discount = promo.value
    if (promo.type === 'delivery') deliveryFee = 0
  }
  const serviceFee = subtotal > 0 ? 1 : 0
  const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount + Number(tip || 0))
  return { subtotal, deliveryFee, serviceFee, discount, tip: Number(tip || 0), total }
}

const EMPTY_CART = { restaurantId: null, items: [], promo: null }

// restaurants and menus are read-only for customers
const restaurants = SEED_RESTAURANTS

export function StoreProvider({ children }) {
  const [cart, setCart] = usePersistentState('fs_cart', EMPTY_CART)
  const [user, setUser] = usePersistentState('fs_user', null)
  const [orders, setOrders] = usePersistentState('fs_orders', [])
  const [favorites, setFavorites] = usePersistentState('fs_favs', [])
  const [reviews, setReviews] = usePersistentState('fs_reviews', {})
  const [theme, setTheme] = usePersistentState('fs_theme', 'forkspoon')
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  useEffect(() => {
    // only light and dark exist; an old saved theme falls back to light
    if (theme !== 'forkspoon' && theme !== 'forkspoon-dark') {
      setTheme('forkspoon')
      return
    }
    document.documentElement.dataset.theme = theme
  }, [theme, setTheme])

  /* ---------- feedback helpers ---------- */
  const toast = useCallback((message, type = 'success') => {
    const id = uid()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  // promise-based replacement for window.confirm, rendered as a daisyUI modal
  const confirm = useCallback(
    (title, message, okLabel = 'Confirm') =>
      new Promise((resolve) => setConfirmState({ title, message, okLabel, resolve })),
    [],
  )
  const closeConfirm = (result) => {
    confirmState?.resolve(result)
    setConfirmState(null)
  }

  /* ---------- restaurants ---------- */
  const getRestaurant = useCallback((id) => restaurants.find((r) => r.id === id), [])

  /* ---------- cart ---------- */
  const cartRestaurant = (cart.restaurantId && getRestaurant(cart.restaurantId)) || null
  const cartCount = cart.items.reduce((n, i) => n + i.qty, 0)

  // a basket saved for a restaurant that no longer exists (e.g. after the restaurant list changed) is emptied
  useEffect(() => {
    if (cart.restaurantId && !getRestaurant(cart.restaurantId)) setCart(EMPTY_CART)
  }, [cart.restaurantId, getRestaurant, setCart])

  const addToCart = async (restaurant, item, qty = 1, options = {}) => {
    if (cart.items.length && cart.restaurantId !== restaurant.id) {
      const ok = await confirm(
        'Start a new basket?',
        `Your basket has items from ${cartRestaurant?.name ?? 'another restaurant'}. Adding this will clear it.`,
        'Start new basket',
      )
      if (!ok) return false
    }
    const extras = (options.addons || []).reduce((s, a) => s + a.price, 0) + (options.size?.price || 0)
    const unit = item.price + extras
    const key = [item.id, options.size?.label, (options.addons || []).map((a) => a.label).join('+'), options.spice, options.note].join('|')
    setCart((c) => {
      const base = c.restaurantId === restaurant.id ? c : { ...EMPTY_CART, restaurantId: restaurant.id }
      const existing = base.items.find((i) => i.key === key)
      const items = existing
        ? base.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
        : [...base.items, { key, itemId: item.id, name: item.name, image: item.image, price: unit, qty, options }]
      return { ...base, items }
    })
    toast(`${qty} × ${item.name} added to basket`)
    return true
  }
  const setQty = (key, qty) =>
    setCart((c) => {
      const items = qty <= 0 ? c.items.filter((i) => i.key !== key) : c.items.map((i) => (i.key === key ? { ...i, qty } : i))
      return items.length ? { ...c, items } : EMPTY_CART
    })
  const clearCart = () => setCart(EMPTY_CART)
  const applyPromo = (code) => {
    const c = code.trim().toUpperCase()
    if (!PROMO_CODES[c]) return false
    setCart((x) => ({ ...x, promo: c }))
    return true
  }
  const removePromo = () => setCart((x) => ({ ...x, promo: null }))

  /* ---------- orders ---------- */
  const placeOrder = (details) => {
    const totals = computeTotals(cart, cartRestaurant, details.tip)
    const order = {
      id: 'FS' + Math.floor(100000 + Math.random() * 900000),
      restaurantId: cartRestaurant.id,
      restaurantName: cartRestaurant.name,
      restaurantImage: cartRestaurant.image,
      items: cart.items,
      totals,
      promo: cart.promo,
      ...details,
      customer: user?.name || details.name,
      rider: RIDERS[Math.floor(Math.random() * RIDERS.length)],
      placedAt: Date.now(),
      cancelled: false,
      rated: null,
    }
    setOrders((o) => [order, ...o])
    setCart(EMPTY_CART)
    return order.id
  }
  const reorder = async (order) => {
    const restaurant = getRestaurant(order.restaurantId)
    if (!restaurant) {
      toast('This restaurant is no longer available', 'error')
      return false
    }
    if (cart.items.length && cart.restaurantId !== restaurant.id) {
      const ok = await confirm('Start a new basket?', `Your current basket will be replaced with this ${restaurant.name} order.`, 'Replace basket')
      if (!ok) return false
    }
    const items = order.items.filter((i) => restaurant.menu.some((m) => m.id === i.itemId && m.available))
    setCart({ ...EMPTY_CART, restaurantId: restaurant.id, items })
    toast(`${items.length} item(s) added back to your basket`)
    return true
  }
  const updateOrder = (id, patch) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  /* ---------- user ---------- */
  const login = (profile) =>
    setUser((u) => ({
      addresses: [],
      notifications: { email: true, sms: false, promos: true },
      points: 120,
      joined: Date.now(),
      ...u,
      ...profile,
    }))
  const logout = () => setUser(null)
  const updateUser = (patch) => setUser((u) => ({ ...u, ...patch }))

  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id)
    setFavorites((f) => (isFav ? f.filter((x) => x !== id) : [...f, id]))
    toast(isFav ? 'Removed from favourites' : 'Saved to favourites', isFav ? 'info' : 'success')
  }

  const addReview = (restaurantId, review) =>
    setReviews((r) => ({ ...r, [restaurantId]: [review, ...(r[restaurantId] || [])] }))

  const resetDemo = () => {
    setOrders([])
    setCart(EMPTY_CART)
    setReviews({})
  }

  const value = useMemo(
    () => ({
      restaurants, getRestaurant,
      cart, cartRestaurant, cartCount, addToCart, setQty, clearCart, applyPromo, removePromo,
      orders, placeOrder, updateOrder, reorder,
      user, login, logout, updateUser,
      favorites, toggleFavorite,
      reviews, addReview,
      theme, setTheme,
      toast, toasts, confirm, confirmState, closeConfirm,
      resetDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, user, orders, favorites, reviews, theme, toasts, confirmState],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)

// re-render every `ms` milliseconds - used for live order tracking
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
