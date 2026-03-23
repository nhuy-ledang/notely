import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthSplitLayoutProps = {
  children: ReactNode
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-surface font-body text-on-surface antialiased md:flex-row">
      <section className="relative hidden flex-col justify-between bg-editorial-gradient p-12 md:flex md:w-5/12 lg:p-16">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <span className="material-symbols-outlined text-white">auto_awesome</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tight text-white">
              Notely
            </span>
          </Link>
        </div>
        <div className="relative z-10">
          <h1 className="mb-6 font-headline text-4xl font-bold leading-[1.1] text-white lg:text-5xl">
            Keep what <br />
            <span className="text-on-primary-container">matters</span>.
          </h1>
          <p className="max-w-xs text-lg font-light leading-relaxed text-white/70">
            A minimal space for notes you actually return to.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 text-xs text-white/40">
          <span>Privacy first</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Your data, your vault</span>
        </div>
      </section>

      <section className="relative flex flex-1 flex-col items-center justify-center bg-surface p-8 md:p-16 lg:p-24">
        <div className="mb-12 flex items-center gap-3 md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
            <span className="material-symbols-outlined text-white">auto_awesome</span>
          </div>
          <span className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Notely
          </span>
        </div>
        {children}
        <div className="absolute bottom-8 left-0 w-full px-8">
          <p className="text-center font-label text-[10px] text-outline/60">
            © {new Date().getFullYear()} Notely.
            <a className="mx-1 transition-colors hover:text-primary" href="#">
              Privacy
            </a>
            •
            <a className="mx-1 transition-colors hover:text-primary" href="#">
              Terms
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
