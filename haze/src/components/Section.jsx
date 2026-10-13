function Section({ id, eyebrow, title, intro, tinted = false, backdrop, children }) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden px-4 py-16 lg:py-24 ${tinted ? 'bg-base-200' : 'bg-base-100'}`}
    >
      {backdrop}
      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-balance sm:text-4xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-3 max-w-prose text-base-content/80">{intro}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

export default Section
