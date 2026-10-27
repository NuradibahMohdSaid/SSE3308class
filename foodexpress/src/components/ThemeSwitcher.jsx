import { Moon, Sun } from 'lucide-react'
import { useStore } from '../context/StoreContext'

// sun/moon swap that flips between light and dark (daisyUI swap + theme-controller)
export default function ThemeSwitcher() {
  const { theme, setTheme } = useStore()
  const isDark = theme === 'forkspoon-dark'
  return (
    <label className="btn btn-ghost btn-circle swap swap-rotate" aria-label="Toggle dark mode">
      <input
        type="checkbox"
        className="theme-controller"
        value="forkspoon-dark"
        checked={isDark}
        onChange={() => setTheme(isDark ? 'forkspoon' : 'forkspoon-dark')}
      />
      <Sun className="swap-off size-5" />
      <Moon className="swap-on size-5" />
    </label>
  )
}
