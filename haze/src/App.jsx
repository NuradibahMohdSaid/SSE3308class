import { useEffect, useState } from 'react'
import './App.css'
import ApiGuide from './components/ApiGuide.jsx'
import Facts from './components/Facts.jsx'
import Footer from './components/Footer.jsx'
import Health from './components/Health.jsx'
import Hero from './components/Hero.jsx'
import History from './components/History.jsx'
import Navbar from './components/Navbar.jsx'
import Pledge from './components/Pledge.jsx'
import Quiz from './components/Quiz.jsx'

function initialDark() {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'hazenight'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function App() {
  const [dark, setDark] = useState(initialDark)
  const [api, setApi] = useState(40)

  useEffect(() => {
    const theme = dark ? 'hazenight' : 'clearsky'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [dark])

  return (
    <>
      <Navbar dark={dark} onToggleTheme={() => setDark((value) => !value)} />
      <main>
        <Hero api={api} onApiChange={setApi} />
        <Facts />
        <ApiGuide api={api} onApiChange={setApi} />
        <Health />
        <History />
        <Quiz />
        <Pledge />
      </main>
      <Footer />
    </>
  )
}

export default App
