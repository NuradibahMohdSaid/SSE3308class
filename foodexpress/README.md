# ForkSpoon 🍴🥄 – Food Delivery Web App

SSE3308 Web Application Development – Assignment 1.
Built with **React + Vite + Tailwind CSS v4 + daisyUI v5**, using a custom yellow theme.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features

| Feature | Where |
| --- | --- |
| Browse restaurants | Home (categories, promo carousel, popular, trending dishes) |
| Search & filter | `/restaurants`: search restaurants and dishes, cuisine, price, rating, fee, time, open/free/promo toggles, sort, grid/list, pagination |
| Add to cart & checkout | Item modal (size, add-ons, spice, notes) → basket drawer → 4-step checkout (basket, delivery, payment, review) with promo codes `FORK10`, `FREESHIP`, `YELLOW5` |
| Track order | `/track`: live status steps, countdown, radial progress, simulated map, rider chat, timeline, cancel, rate, reorder |
| User account | `/account`: sign in/register (demo), profile and photo upload, ForkPoints, order history, saved addresses, favourites, settings and themes |
| Restaurant info ("For Restaurants") | `/restaurant-info`: restaurant directory with search and cuisine filter; tap a name to see address, hours, fees, rating and the full menu by section |
| Responsive design | Mobile dock, side drawer, filter drawer, responsive grids; 8 switchable themes including light and dark yellow |

Data is stored in the browser's `localStorage`. Use **Reset demo data** in Account → Settings to clear orders, basket and reviews.

## daisyUI components used

navbar, drawer, dock, fab, dropdown, menu, button, badge, indicator, avatar / avatar-group, card, hero, carousel, stats, steps, timeline, tabs (box & lift), collapse / accordion, join, modal, toast, alert, list, table, breadcrumbs, pagination, input, textarea, select, checkbox, radio, toggle, range, rating, file-input, fieldset, label, validator, filter, kbd, divider, tooltip, skeleton, loading, progress, radial-progress, countdown, chat, swap, stack, mask, status, diff, hover-gallery, hover-3d, text-rotate, aura, mockup-phone, footer, link, theme-controller.

## Project structure

```
src/
  components/   reusable UI (Navbar, Layout, RestaurantCard, MenuItemCard, ItemModal, CartPanel, ...)
  context/      StoreContext: cart, orders, user, favourites, toasts (persisted to localStorage)
  data/         seed restaurants, menus, promo codes
  pages/        Home, Restaurants, RestaurantDetail, Checkout, TrackOrder, Account, RestaurantInfo
  index.css     Tailwind + daisyUI plugin + custom "forkspoon" yellow themes
```
