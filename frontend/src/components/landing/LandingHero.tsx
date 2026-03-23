import { Link } from 'react-router-dom'

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBNlgo4Up8vBtQxoUxfLg_7UbqnR6uG5Nj9D596W0f3KuJREmrUtKTPO4DvUVdDp8ipyr0hTpMaAyxDjtyQ_h8R-kzDoizFWdEjbfJ4G_5sUfTMzQmtG-PAfRkp6spnlggYDRHPfU75STjl15F8CHIzeHgrsoAk7EUgn3Il60ELkhNJt6fXC4uEE9N6_VigiQH1Waq-9WoovG7R3XQ6WLyH1tFu0mG64NQ-Dghnnw0NIpnqxX8PTibNU3NUergkXNVO5jkus1CE9AeO'

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-8 py-20 text-center md:py-32">
      <h1 className="mb-8 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tighter text-on-background md:text-7xl font-headline">
        Turn your scattered thoughts into a{' '}
        <span className="text-primary italic">private gallery.</span>
      </h1>
      <p className="mb-12 max-w-2xl text-xl leading-relaxed text-on-surface-variant md:text-2xl font-body">
        Notely is your calm space to capture ideas, search them in seconds, and tune the
        interface to how you think.
      </p>
      <div className="mb-20 flex flex-col gap-4 sm:flex-row">
        <Link
          to="/register"
          className="rounded-full bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          Get started free
        </Link>
        <a
          href="#features"
          className="rounded-full bg-surface-container-low px-8 py-4 text-lg font-bold text-on-surface-variant transition-colors hover:bg-surface-container font-body"
        >
          Explore features
        </a>
      </div>
      <div className="group relative w-full">
        <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-primary/5 blur-3xl transition-transform group-hover:scale-100" />
        <div className="overflow-hidden rounded-4xl bg-surface-container-lowest p-4 shadow-2xl aspect-video md:aspect-[21/9] flex items-center justify-center">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low">
            <img
              src={HERO_IMG}
              alt="Abstract visualization of connected ideas and notes"
              className="h-full w-full object-cover opacity-90 mix-blend-multiply"
            />
            <div className="glass-effect absolute left-12 top-12 max-w-xs rounded-2xl p-6 text-left shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  hub
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">
                  Linked notes
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold font-headline">Smart connections</h3>
              <p className="text-sm text-on-surface-variant font-body">
                Surface patterns between ideas—without losing the privacy of your own vault.
              </p>
            </div>
            <div className="glass-effect absolute bottom-12 right-12 flex items-center gap-4 rounded-xl p-4 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed">
                <span className="material-symbols-outlined text-on-tertiary-fixed">auto_awesome</span>
              </div>
              <span className="text-sm font-semibold font-body">Fast search, your data</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
