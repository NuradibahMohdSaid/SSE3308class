import { TIMELINE } from '../data.js'
import Section from './Section.jsx'
import Smoke from './Smoke.jsx'

function History() {
  return (
    <Section
      id="history"
      tinted
      backdrop={<Smoke />}
      eyebrow="History"
      title="Haze keeps coming back"
      intro="Southeast Asia has faced severe haze again and again. These are some of the episodes Malaysia remembers most."
    >
      <ul className="timeline timeline-vertical timeline-snap-icon max-md:timeline-compact">
        {TIMELINE.map((event, index) => {
          const isLast = index === TIMELINE.length - 1
          const side = index % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'
          return (
            <li key={event.year}>
              {index > 0 && <hr className="bg-base-300" />}
              <div className="timeline-middle">
                <span className="block size-4 rounded-full bg-accent"></span>
              </div>
              <div className={`${side} mb-10 max-md:ms-4 md:mx-6`}>
                <time className="font-display text-2xl font-semibold text-primary">
                  {event.year}
                </time>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-base-content/80">{event.body}</p>
              </div>
              {!isLast && <hr className="bg-base-300" />}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export default History
