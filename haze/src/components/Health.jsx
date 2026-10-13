import { useState } from 'react'
import { CHECKLIST, HEALTH } from '../data.js'
import Section from './Section.jsx'

function Health() {
  const [done, setDone] = useState(() => new Set())
  const allDone = done.size === CHECKLIST.length

  function toggle(item) {
    setDone((previous) => {
      const next = new Set(previous)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  return (
    <Section
      id="health"
      eyebrow="Health"
      title="What haze does to your body, and how to protect it"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          {HEALTH.map((item, index) => (
            <div
              key={item.title}
              className="collapse-arrow collapse border border-base-300 bg-base-100"
            >
              <input
                type="radio"
                name="health-accordion"
                defaultChecked={index === 0}
                aria-label={item.title}
              />
              <div className="collapse-title font-semibold">{item.title}</div>
              <div className="collapse-content text-base-content/80">
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card border border-base-300 bg-base-200">
          <div className="card-body">
            <h3 className="card-title font-display text-2xl">
              Your haze-ready checklist
            </h3>
            <p className="text-sm text-base-content/80">
              Tick each habit you already have.
            </p>

            <div className="mt-2 flex items-center gap-3">
              <progress
                className="progress progress-accent flex-1"
                value={done.size}
                max={CHECKLIST.length}
                aria-label="Checklist progress"
              ></progress>
              <span className="text-sm font-semibold tabular-nums">
                {done.size} of {CHECKLIST.length}
              </span>
            </div>

            <ul className="mt-2 space-y-1">
              {CHECKLIST.map((item) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-field p-2 hover:bg-base-300/50">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-accent mt-0.5"
                      checked={done.has(item)}
                      onChange={() => toggle(item)}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div aria-live="polite">
              {allDone && (
                <div role="status" className="alert alert-success mt-2">
                  <span>
                    You are ready for the next haze season. Help a neighbour
                    get ready too.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default Health
