import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingNav,
} from '@/components/landing'

export function HomePage() {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary-fixed selection:text-primary dark:bg-slate-950">
      <LandingNav />
      <main className="pt-24">
        <LandingHero />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
