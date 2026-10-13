// Each puff: where it starts (left), how big it is, how far it drifts sideways,
// how long one rise takes and how long it waits before starting.
const PUFFS = [
  { left: '-4%', size: '26rem', drift: '6rem', duration: '26s', delay: '0s' },
  { left: '6%', size: '20rem', drift: '-3rem', duration: '34s', delay: '-17s' },
  { left: '16%', size: '24rem', drift: '5rem', duration: '30s', delay: '-8s' },
  { left: '26%', size: '18rem', drift: '-4rem', duration: '32s', delay: '-24s' },
  { left: '34%', size: '28rem', drift: '8rem', duration: '38s', delay: '-20s' },
  { left: '44%', size: '20rem', drift: '-6rem', duration: '28s', delay: '-3s' },
  { left: '52%', size: '26rem', drift: '4rem', duration: '36s', delay: '-30s' },
  { left: '60%', size: '20rem', drift: '-6rem', duration: '29s', delay: '-12s' },
  { left: '68%', size: '28rem', drift: '5rem', duration: '35s', delay: '-15s' },
  { left: '76%', size: '20rem', drift: '-5rem', duration: '27s', delay: '-22s' },
  { left: '84%', size: '24rem', drift: '3rem', duration: '33s', delay: '-6s' },
  { left: '92%', size: '18rem', drift: '-8rem', duration: '31s', delay: '-26s' },
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
