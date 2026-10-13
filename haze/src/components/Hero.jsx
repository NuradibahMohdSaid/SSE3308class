import { API_MAX, APIMS_URL, bandFor } from '../data.js'
import SkyScene from './SkyScene.jsx'

function Hero({ api, onApiChange }) {
  const band = bandFor(api)

  return (
    <section id="top" className="hero bg-base-200">
      <div className="hero-content w-full max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row-reverse lg:gap-14 lg:py-20">
        <div className="mockup-window w-full border border-base-300 bg-base-100 shadow-xl lg:w-1/2">
          <SkyScene api={api} />
        </div>

        <div className="w-full lg:w-1/2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Haze awareness
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-balance sm:text-5xl">
            When the skyline fades, your lungs already know.
          </h1>
          <p className="mt-4 max-w-prose text-lg text-base-content/80">
            Haze is smoke and fine dust hanging in the air. Drag the slider to
            raise the Air Pollutant Index and watch what happens to the view
            from the window.
          </p>

          <div className="mt-8 rounded-box border border-base-300 bg-base-100 p-5">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor="api-range" className="font-semibold">
                Air Pollutant Index
              </label>
              <span className="font-display text-4xl font-semibold tabular-nums">
                {api}
              </span>
            </div>
            <input
              id="api-range"
              type="range"
              min="0"
              max={API_MAX}
              step="5"
              value={api}
              onChange={(event) => onApiChange(Number(event.target.value))}
              className="range range-accent mt-3 w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-base-content/60">
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
            </div>
            <p className="mt-4 text-sm" aria-live="polite">
              <span
                className="badge mr-2 border-0 font-semibold"
                style={{ backgroundColor: band.color, color: band.text }}
              >
                {band.label}
              </span>
              {band.advice}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={APIMS_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Check today&apos;s API
            </a>
            <a href="#quiz" className="btn btn-outline">
              Take the quiz
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
