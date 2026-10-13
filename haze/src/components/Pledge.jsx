import { useEffect, useState } from 'react'
import { PLEDGES } from '../data.js'
import Section from './Section.jsx'

function Pledge() {
  const [name, setName] = useState('')
  const [pledge, setPledge] = useState('')
  const [share, setShare] = useState(true)
  const [saved, setSaved] = useState(null)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(false), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  function submit(event) {
    event.preventDefault()
    setSaved({ name: name.trim(), pledge, share })
    setToast(true)
  }

  return (
    <Section
      id="pledge"
      tinted
      eyebrow="Pledge"
      title="Clear skies start with one small promise"
      intro="Choose one thing you will do differently. Your pledge stays on this page and is not sent anywhere."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={submit}
          className="card border border-base-300 bg-base-100"
        >
          <div className="card-body gap-4">
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Your name</span>
              <input
                type="text"
                className="input w-full"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="given-name"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-semibold">Your pledge</span>
              <select
                className="select w-full"
                value={pledge}
                onChange={(event) => setPledge(event.target.value)}
                required
              >
                <option value="" disabled>
                  Choose a pledge
                </option>
                {PLEDGES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span>I will tell a friend about this pledge</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={share}
                onChange={(event) => setShare(event.target.checked)}
              />
            </label>

            <div className="card-actions">
              <button type="submit" className="btn btn-primary btn-block">
                Make my pledge
              </button>
            </div>
          </div>
        </form>

        <div className="card border border-dashed border-base-300 bg-base-100">
          <div className="card-body justify-center text-center">
            {saved ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Clean air pledge
                </p>
                <p className="font-display text-3xl font-semibold text-balance">
                  &ldquo;{saved.pledge}.&rdquo;
                </p>
                <p className="text-base-content/80">
                  {saved.name}
                  {saved.share && ', and I am passing it on'}
                </p>
              </>
            ) : (
              <p className="text-base-content/70">
                Your pledge card will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {toast && saved && (
        <div className="toast toast-end z-50" role="status">
          <div className="alert alert-success">
            <span>Thank you, {saved.name}. Your pledge is made.</span>
          </div>
        </div>
      )}
    </Section>
  )
}

export default Pledge
