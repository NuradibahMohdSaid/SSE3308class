import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useStore } from '../context/StoreContext'

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info, warning: TriangleAlert }
// full class names so Tailwind can detect them
const ALERT = { success: 'alert-success', error: 'alert-error', info: 'alert-info', warning: 'alert-warning' }

// daisyUI toast stack fed by the store's toast() helper
export function Toaster() {
  const { toasts } = useStore()
  return (
    <div className="toast toast-top toast-center z-[100] mt-16">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div key={t.id} role="status" className={`alert ${ALERT[t.type] || 'alert-info'} shadow-lg`}>
            <Icon className="size-5" />
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}

// daisyUI modal that resolves the store's confirm() promise
export function ConfirmDialog() {
  const { confirmState, closeConfirm } = useStore()
  const ref = useRef(null)

  useEffect(() => {
    if (confirmState && !ref.current.open) ref.current.showModal()
    if (!confirmState && ref.current.open) ref.current.close()
  }, [confirmState])

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onCancel={() => closeConfirm(false)}>
      <div className="modal-box">
        <h3 className="text-lg font-bold">{confirmState?.title}</h3>
        <p className="text-base-content/70 py-4">{confirmState?.message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => closeConfirm(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => closeConfirm(true)}>
            {confirmState?.okLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => closeConfirm(false)}>close</button>
      </form>
    </dialog>
  )
}
