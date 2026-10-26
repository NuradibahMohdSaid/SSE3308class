import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState icon="🥡" title="404 · This page went out for delivery" text="We couldn't find what you were looking for.">
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </EmptyState>
    </div>
  )
}
