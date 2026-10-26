import { Palette } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export const THEMES = [
  { id: 'forkspoon', label: 'ForkSpoon Yellow' },
  { id: 'forkspoon-dark', label: 'ForkSpoon Night' },
  { id: 'bumblebee', label: 'Bumblebee' },
  { id: 'lemonade', label: 'Lemonade' },
  { id: 'cupcake', label: 'Cupcake' },
  { id: 'retro', label: 'Retro' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'dark', label: 'Dark' },
]

// dropdown of daisyUI theme-controller radios
export default function ThemeSwitcher({ align = 'dropdown-end', name = 'theme-dropdown' }) {
  const { theme, setTheme } = useStore()
  return (
    <div className={`dropdown ${align}`}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="Change theme">
        <div className="tooltip tooltip-bottom" data-tip="Theme">
          <Palette className="size-5" />
        </div>
      </div>
      <ul tabIndex={0} className="dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow-xl">
        {THEMES.map((t) => (
          <li key={t.id}>
            <label className="btn btn-sm btn-block btn-ghost justify-start gap-3" data-theme={t.id}>
              <input
                type="radio"
                name={name}
                className="theme-controller hidden"
                value={t.id}
                checked={theme === t.id}
                onChange={() => setTheme(t.id)}
              />
              <span className="flex gap-0.5">
                <span className="bg-primary size-2 rounded-full" />
                <span className="bg-secondary size-2 rounded-full" />
                <span className="bg-accent size-2 rounded-full" />
              </span>
              <span className="text-base-content">{t.label}</span>
              {theme === t.id && <span className="badge badge-primary badge-xs ml-auto">on</span>}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
