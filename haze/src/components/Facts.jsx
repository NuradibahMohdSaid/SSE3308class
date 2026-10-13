import { useState } from 'react'
import { CAUSES, STATS } from '../data.js'
import Section from './Section.jsx'

function Facts() {
  const [activeId, setActiveId] = useState(CAUSES[0].id)
  const cause = CAUSES.find((item) => item.id === activeId)

  return (
    <Section
      id="facts"
      eyebrow="The facts"
      title="Too small to see, too many to ignore"
      intro="A single particle of haze is invisible. Billions of them turn the sky grey and reach deep into your lungs."
    >
      <div className="stats stats-vertical w-full border border-base-300 bg-base-100 sm:grid sm:grid-cols-2 lg:stats-horizontal lg:flex">
        {STATS.map((stat) => (
          <div key={stat.title} className="stat">
            <div className="stat-title whitespace-normal">{stat.title}</div>
            <div className="stat-value font-display text-3xl text-primary">
              {stat.value}
            </div>
            <div className="stat-desc whitespace-normal">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="divider my-12">Where it comes from</div>

      <div
        role="tablist"
        aria-label="Causes of haze"
        className="tabs tabs-box w-fit max-w-full"
      >
        {CAUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={item.id === activeId}
            aria-controls="cause-panel"
            className={`tab ${item.id === activeId ? 'tab-active' : ''}`}
            onClick={() => setActiveId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id="cause-panel"
        role="tabpanel"
        aria-labelledby={`tab-${cause.id}`}
        className="card mt-4 border border-base-300 bg-base-200"
      >
        <div className="card-body">
          <h3 className="card-title font-display text-2xl">{cause.title}</h3>
          <p className="max-w-prose">{cause.body}</p>
          <div role="note" className="alert alert-info alert-soft mt-2">
            <span>
              <strong>What you can do:</strong> {cause.action}
            </span>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default Facts
