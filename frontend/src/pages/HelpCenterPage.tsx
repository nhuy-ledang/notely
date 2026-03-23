import { useEffect, useMemo, useState } from 'react'

const CATEGORIES = [
  {
    icon: 'rocket_launch' as const,
    title: 'Getting started',
    description: 'Learn the basics of organizing your first notes and collections.',
    links: ['Quick start guide', 'Your first 5 minutes'],
    accent: 'default' as const,
  },
  {
    icon: 'bolt' as const,
    title: 'Using AI',
    description: 'Get the most from smart suggestions and future AI features in Notely.',
    links: ['Prompting basics', 'What’s on the roadmap'],
    accent: 'tertiary' as const,
  },
  {
    icon: 'payments' as const,
    title: 'Billing',
    description: 'Manage your plan, invoices, and payment methods.',
    links: ['Manage subscription', 'Payment methods'],
    accent: 'default' as const,
  },
  {
    icon: 'smartphone' as const,
    title: 'Mobile & sync',
    description: 'Use Notely across devices and keep everything in sync.',
    links: ['Syncing devices', 'Offline access'],
    accent: 'default' as const,
  },
] as const

const FAQ_ITEMS = [
  {
    q: 'How do I export my notes?',
    a: 'Open any note, copy its content, or use your browser print/save as PDF. Full bulk export may arrive in a future update.',
  },
  {
    q: 'Can I share notes with others?',
    a: 'Sharing and collaboration are planned. For now, notes are private to your account.',
  },
  {
    q: 'Is there a storage limit?',
    a: 'Limits depend on your hosting and plan. Contact support if you need a higher quota.',
  },
] as const

const POPULAR = ['Setting up tags', 'Keyboard shortcuts', 'Reset password'] as const

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl bg-surface-container-low transition-colors hover:bg-surface-container-high dark:hover:bg-surface-container">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
        aria-expanded={open}
      >
        <h4 className="font-manrope text-lg font-bold text-on-surface">{question}</h4>
        <span
          className={`material-symbols-outlined shrink-0 text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          expand_more
        </span>
      </button>
      {open ? (
        <div className="border-t border-outline-variant/15 px-6 pb-6 pt-0 dark:border-outline-variant/25">
          <p className="pt-4 text-sm leading-relaxed text-on-surface-variant font-body">{answer}</p>
        </div>
      ) : null}
    </div>
  )
}

export function HelpCenterPage() {
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.title = 'Help Center — Notely'
  }, [])

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return CATEGORIES
    }
    return CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.links.some((l) => l.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <div className="selection:bg-primary-fixed selection:text-on-primary-fixed">
      <section className="mx-auto max-w-4xl px-4 py-10 text-center lg:px-6 lg:py-16">
        <h1 className="mb-8 font-manrope text-4xl font-extrabold tracking-tight text-on-surface lg:text-6xl">
          How can we help?
        </h1>
        <div className="group relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for articles, guides, or tutorials…"
            className="w-full rounded-full border-none bg-surface-container-lowest py-5 pl-14 pr-6 text-lg text-on-surface shadow-lg shadow-on-surface/5 transition-all placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/25 dark:shadow-black/25"
            aria-label="Search help"
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="font-label text-sm text-secondary">Popular:</span>
          {POPULAR.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setQuery(label)}
              className="font-label text-sm text-primary hover:underline"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {filteredCategories.map((cat) => {
          const tertiary = cat.accent === 'tertiary'
          return (
            <div
              key={cat.title}
              className={`group cursor-pointer rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-all hover:shadow-md dark:border dark:border-outline-variant/20 ${
                tertiary ? 'border-l-4 border-tertiary' : ''
              }`}
            >
              <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  tertiary
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant group-hover:bg-tertiary group-hover:text-on-tertiary'
                    : 'bg-primary-fixed text-primary group-hover:bg-primary group-hover:text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <h3 className="mb-3 font-manrope text-xl font-bold text-on-surface">{cat.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-on-surface-variant font-body">{cat.description}</p>
              <ul className="space-y-2">
                {cat.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => setQuery(link)}
                      className="text-left text-xs font-medium text-secondary transition-colors hover:text-primary"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>

      {filteredCategories.length === 0 ? (
        <p className="mx-auto mb-12 max-w-4xl px-4 text-center text-on-surface-variant font-body">
          No topics match “{query}”. Try another search.
        </p>
      ) : null}

      <section className="mx-auto mb-20 max-w-4xl px-4 lg:px-6">
        <h2 className="mb-8 font-manrope text-3xl font-extrabold text-on-surface">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <FaqRow key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-12 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center text-on-primary shadow-2xl sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            aria-hidden
            style={{
              backgroundImage:
                'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 50%, currentColor 50%, currentColor 75%, transparent 75%, transparent)',
              backgroundSize: '12px 12px',
            }}
          />
          <h2 className="relative z-10 mb-4 font-manrope text-3xl font-extrabold">Still need help?</h2>
          <p className="relative z-10 mx-auto mb-8 max-w-lg text-on-primary/85 font-body">
            We’re here for questions about Notely, your account, and getting the most out of your notes.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => window.alert('Live chat is not connected yet. Use email for now.')}
              className="flex items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-8 py-4 font-manrope font-bold text-primary shadow-lg transition-all hover:opacity-95 active:scale-95"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              Contact support
            </button>
            <a
              href="mailto:support@notely.app?subject=Notely%20Help"
              className="flex items-center justify-center gap-2 rounded-full border border-on-primary/25 bg-primary-container px-8 py-4 font-manrope font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined">mail</span>
              Email us
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-6xl border-t border-outline-variant/25 px-4 pb-12 pt-10 text-center dark:border-outline-variant/30">
        <p className="font-label text-xs text-secondary">
          © {new Date().getFullYear()} Notely. Notes and ideas, organized.
        </p>
      </footer>
    </div>
  )
}
