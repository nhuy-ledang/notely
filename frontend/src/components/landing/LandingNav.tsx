import { Link } from 'react-router-dom'

export function LandingNav() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/95 backdrop-blur-md dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <Link
          to="/"
          className="font-headline text-2xl font-bold tracking-tighter text-primary dark:text-primary-fixed-dim"
        >
          Notely
        </Link>
        <div className="hidden items-center space-x-8 md:flex">
          <a
            className="font-headline text-sm font-semibold tracking-tight text-slate-600 transition-colors duration-200 hover:text-primary dark:text-slate-400"
            href="#features"
          >
            Features
          </a>
          <a
            className="font-headline text-sm font-semibold tracking-tight text-slate-600 transition-colors duration-200 hover:text-primary dark:text-slate-400"
            href="#pricing"
          >
            Pricing
          </a>
          <a
            className="font-headline text-sm font-semibold tracking-tight text-slate-600 transition-colors duration-200 hover:text-primary dark:text-slate-400"
            href="#about"
          >
            About
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-primary sm:block"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-200 ease-out hover:scale-105"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
