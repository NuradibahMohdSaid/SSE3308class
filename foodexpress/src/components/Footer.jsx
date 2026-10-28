import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { PHOTO_CREDITS } from '../data/restaurants'
import Logo from './Logo'

export default function Footer() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-neutral text-neutral-content mt-16">
      <div className="footer sm:footer-horizontal mx-auto max-w-7xl p-10">
        <aside className="max-w-xs">
          <Logo light />
          <p className="text-neutral-content/70 mt-2">
            Delicious food, delivered with a smile. Local favourites from Serdang, Seri Kembangan, Bangi and Klang.
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">Explore</h6>
          <Link to="/restaurants" className="link link-hover">All restaurants</Link>
          <Link to="/restaurants?cat=Malaysian" className="link link-hover">Malaysian food</Link>
          <Link to="/restaurants?cat=Kopitiam" className="link link-hover">Kopitiam</Link>
          <Link to="/track" className="link link-hover">Track an order</Link>
        </nav>
        <nav>
          <h6 className="footer-title">Account</h6>
          <Link to="/account" className="link link-hover">Sign in / Register</Link>
          <Link to="/account?tab=orders" className="link link-hover">Order history</Link>
        </nav>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            toast(`Subscribed ${email} to ForkSpoon deals!`)
            setEmail('')
          }}
        >
          <h6 className="footer-title">Newsletter</h6>
          <fieldset className="fieldset w-72">
            <label className="fieldset-label text-neutral-content/70">Get weekly promo codes</label>
            <div className="join">
              <label className="input join-item text-base-content">
                <Mail className="size-4 opacity-50" />
                <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <button className="btn btn-primary join-item">Subscribe</button>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="footer footer-center border-neutral-content/10 border-t p-4 pb-24 text-sm lg:pb-4">
        <p>© {new Date().getFullYear()} ForkSpoon · SSE3308 Web Application Development · Built with TailwindCSS + daisyUI</p>
        <p className="text-neutral-content/60 max-w-3xl text-xs">
          Student demo project. Restaurant names are real places in Selangor, but ForkSpoon is not affiliated with them; menus, prices, ratings and
          reviews are made up.
        </p>
        {/* CC BY / CC BY-SA photos must be credited */}
        <details className="collapse-arrow collapse max-w-3xl text-xs">
          <summary className="collapse-title text-neutral-content/70 min-h-0 py-1">Food photo credits (Wikimedia Commons)</summary>
          <div className="collapse-content text-neutral-content/60 text-left">
            <ul className="columns-1 gap-6 sm:columns-2">
              {PHOTO_CREDITS.map((c) => (
                <li key={c.key} className="break-inside-avoid">
                  <a href={c.page} target="_blank" rel="noreferrer" className="link link-hover">
                    {c.key}
                  </a>{' '}
                  by {c.artist || 'unknown'}, {c.license}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </footer>
  )
}
