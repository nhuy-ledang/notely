import { Link } from 'react-router-dom'
import { GoogleMark } from '@/components/landing/GoogleMark'

export function LandingCta() {
  return (
    <section
      id="pricing"
      className="mx-auto flex max-w-4xl flex-col items-center px-8 py-32 text-center"
    >
      <h2 className="mb-8 text-4xl font-extrabold md:text-5xl font-headline">
        Ready to curate your mind?
      </h2>
      <p className="mb-12 text-lg text-on-surface-variant font-body">
        Join people who treat their notes with care. Private by default, fast when you need it.
      </p>
      <div className="flex w-full max-w-md flex-col gap-4 rounded-4xl bg-surface-container-low p-8">
        <Link
          to="/register"
          className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant bg-white py-4 font-bold text-on-surface transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <GoogleMark />
          Continue with Google
        </Link>
        <Link
          to="/register"
          className="block w-full rounded-full bg-primary py-4 text-center font-bold text-white transition-opacity hover:opacity-90"
        >
          Create account
        </Link>
        <p className="mt-4 text-xs text-on-surface-variant/60 font-body">
          By joining, you agree to our Terms of Service.
        </p>
      </div>
    </section>
  )
}
