import { useRef, useState } from 'react'
import { QUIZ } from '../data.js'
import Section from './Section.jsx'

function Quiz() {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const resultRef = useRef(null)

  const item = QUIZ[index]
  const answered = picked !== null
  const correct = picked === item.answer
  const isLast = index === QUIZ.length - 1

  function choose(option) {
    if (answered) return
    setPicked(option)
    if (option === item.answer) setScore((value) => value + 1)
  }

  function next() {
    if (isLast) {
      resultRef.current?.showModal()
      return
    }
    setIndex((value) => value + 1)
    setPicked(null)
  }

  function restart() {
    setIndex(0)
    setPicked(null)
    setScore(0)
  }

  return (
    <Section
      id="quiz"
      eyebrow="Quiz"
      title="How much do you know about haze?"
      intro="Five quick questions. You will see the answer straight after each one."
    >
      <div className="mx-auto max-w-2xl">
        <ul className="steps w-full">
          {QUIZ.map((question, step) => (
            <li
              key={question.question}
              className={`step ${step <= index ? 'step-primary' : ''}`}
              aria-current={step === index ? 'step' : undefined}
            >
              <span className="sr-only">Question {step + 1}</span>
            </li>
          ))}
        </ul>

        <div className="card mt-8 border border-base-300 bg-base-200">
          <div className="card-body">
            <fieldset>
              <legend className="font-display text-2xl font-semibold">
                {item.question}
              </legend>
              <div className="mt-4 space-y-2">
                {item.options.map((option, optionIndex) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 rounded-field border bg-base-100 p-3 ${
                      answered && optionIndex === item.answer
                        ? 'border-success'
                        : 'border-base-300'
                    } ${answered ? '' : 'cursor-pointer hover:border-primary'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      className="radio radio-primary"
                      checked={picked === optionIndex}
                      disabled={answered && picked !== optionIndex}
                      onChange={() => choose(optionIndex)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div aria-live="polite">
              {answered && (
                <div
                  role="status"
                  className={`alert mt-2 ${correct ? 'alert-success' : 'alert-error'}`}
                >
                  <span>
                    <strong>{correct ? 'Correct.' : 'Not quite.'}</strong>{' '}
                    {item.explain}
                  </span>
                </div>
              )}
            </div>

            <div className="card-actions mt-2 items-center justify-between">
              <span className="text-sm text-base-content/70">
                Question {index + 1} of {QUIZ.length}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!answered}
                onClick={next}
              >
                {isLast ? 'See my score' : 'Next question'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <dialog ref={resultRef} className="modal" onClose={restart}>
        <div className="modal-box text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Your score
          </p>
          <p className="mt-2 font-display text-6xl font-semibold">
            {score}/{QUIZ.length}
          </p>
          <p className="mt-3">
            {score === QUIZ.length
              ? 'Perfect. You know how to stay safe in the haze.'
              : score >= 3
                ? 'Good work. A quick look at the sections above will fill the gaps.'
                : 'Haze is tricky. Read through the sections above and try again.'}
          </p>
          <div className="modal-action justify-center">
            <form method="dialog">
              <button className="btn btn-primary">Try again</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </Section>
  )
}

export default Quiz
