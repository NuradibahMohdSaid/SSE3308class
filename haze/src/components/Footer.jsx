import { APIMS_URL, NAV_LINKS } from '../data.js'

function Footer() {
  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="footer sm:footer-horizontal mx-auto max-w-6xl px-4 py-12">
        <aside className="max-w-xs">
          <p className="font-display text-2xl font-semibold">Jerebu</p>
          <p>
            Jerebu is the Malay word for haze. This site was made to help
            people understand it and stay safe.
          </p>
        </aside>
        <nav>
          <h2 className="footer-title">Explore</h2>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="link link-hover">
              {link.label}
            </a>
          ))}
        </nav>
        <nav>
          <h2 className="footer-title">Sources and live data</h2>
          <a
            className="link link-hover"
            href={APIMS_URL}
            target="_blank"
            rel="noreferrer"
          >
            APIMS, Department of Environment Malaysia
          </a>
          <a
            className="link link-hover"
            href="https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health"
            target="_blank"
            rel="noreferrer"
          >
            WHO fact sheet on outdoor air quality
          </a>
          <a
            className="link link-hover"
            href="https://hazeportal.asean.org"
            target="_blank"
            rel="noreferrer"
          >
            ASEAN Haze Portal
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
