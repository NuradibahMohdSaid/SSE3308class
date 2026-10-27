import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { StoreProvider } from './context/StoreContext'
import Account from './pages/Account'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import RestaurantDetail from './pages/RestaurantDetail'
import RestaurantInfo from './pages/RestaurantInfo'
import Restaurants from './pages/Restaurants'
import TrackOrder from './pages/TrackOrder'

// HashRouter keeps deep links working on any static host (GitHub Pages, Netlify...)
export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurant/:id" element={<RestaurantDetail />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="track" element={<TrackOrder />} />
            <Route path="track/:orderId" element={<TrackOrder />} />
            <Route path="account" element={<Account />} />
            <Route path="restaurant-info" element={<RestaurantInfo />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
