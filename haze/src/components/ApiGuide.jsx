import { API_BANDS, API_MAX, APIMS_URL, bandFor } from '../data.js'
import Section from './Section.jsx'

function ApiGuide({ api, onApiChange }) {
  const current = bandFor(api)

  return (
    <Section
      id="api"
      tinted
      eyebrow="Read the API"
      title="One number tells you how to plan your day"
      intro="Malaysia's Air Pollutant Index turns pollution measurements into a single reading. Pick a band to see what it looks like on a phone."
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Reading</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">What to do</th>
                <th>
                  <span className="sr-only">Preview</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {API_BANDS.map((band) => {
                const selected = band === current
                return (
                  <tr key={band.label} className={selected ? 'bg-base-200' : ''}>
                    <td className="font-semibold whitespace-nowrap tabular-nums">
                      {band.min}–{band.max === API_MAX ? `${band.max}+` : band.max}
                    </td>
                    <td>
                      <span
                        className="badge border-0 font-semibold whitespace-nowrap"
                        style={{ backgroundColor: band.color, color: band.text }}
                      >
                        {band.label}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">{band.advice}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-ghost'}`}
                        aria-pressed={selected}
                        onClick={() =>
                          onApiChange(Math.round((band.min + band.max) / 2))
                        }
                      >
                        {selected ? 'Showing' : 'Show'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mockup-phone mx-auto w-60 lg:-mt-36">
          <div className="mockup-phone-camera"></div>
          <div className="mockup-phone-display bg-base-100 text-base-content">
            <div className="flex h-full w-full flex-col items-center gap-3 px-4 pt-20 pb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-base-content/60">
                Air quality now
              </p>
              <div
                className="tooltip"
                data-tip={`${api} out of ${API_MAX} on the API scale`}
              >
                <div
                  className="radial-progress font-display text-3xl font-semibold"
                  style={{
                    '--value': (api / API_MAX) * 100,
                    '--size': '7rem',
                    '--thickness': '0.55rem',
                    color: current.color,
                  }}
                  role="progressbar"
                  aria-valuenow={api}
                  aria-valuemin={0}
                  aria-valuemax={API_MAX}
                  aria-label="Air Pollutant Index"
                >
                  <span className="text-base-content">{api}</span>
                </div>
              </div>
              <span
                className="badge badge-lg border-0 font-semibold"
                style={{ backgroundColor: current.color, color: current.text }}
              >
                {current.label}
              </span>
              <p className="text-sm">{current.advice}</p>
              <p className="mt-auto text-xs text-base-content/60">
                Demo screen. For live readings visit{' '}
                <a
                  className="link"
                  href={APIMS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  APIMS
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default ApiGuide
