// Each puff: where it starts (left), how big it is, how far it drifts sideways,
// how long one rise takes and how long it waits before starting.
const PUFFS = [
  { left: '2%', size: '22rem', drift: '6rem', duration: '26s', delay: '0s' },
  { left: '22%', size: '16rem', drift: '-4rem', duration: '32s', delay: '-9s' },
  { left: '40%', size: '26rem', drift: '8rem', duration: '38s', delay: '-20s' },
  { left: '58%', size: '18rem', drift: '-6rem', duration: '29s', delay: '-4s' },
  { left: '72%', size: '24rem', drift: '5rem', duration: '35s', delay: '-15s' },
  { left: '88%', size: '15rem', drift: '-8rem', duration: '31s', delay: '-24s' },
]

// Decorative smoke that drifts up behind a section's content.
function Smoke() {
  return (
    <div className="smoke" aria-hidden="true">
      {PUFFS.map((puff) => (
        <span
          key={puff.left}
          className="smoke-puff"
          style={{
            left: puff.left,
            '--size': puff.size,
            '--drift': puff.drift,
            animationDuration: puff.duration,
            animationDelay: puff.delay,
          }}
        ></span>
      ))}
    </div>
  )
}

export default Smoke
