const WORKSPACE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCyeA7nb9ZmE_pIqfV55Yb6jA5X_qlBhaRaIH3YEdJJKnXDUJiVJGP9WmLzEJA4joNUpkrbrWVxA7ny8fxcOqC4Mg0WnD8VwnUjMApVr9bu7EEc-F8ZQDe6CbGuZT66lFo5_Y1NCE_03Zq9FnLaKU05bKuRzoYL0OThg1n9QA9GOzy8oBlkdLrADdeexASITsvpG9p0wEKdP2X9qHXwEIfB3t5WW1xn5_Yb3sIGRSak_Pe4cC86nSrY6WSW6Td9lz9RHidNqOowQ52S'

const GRAPH_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDctAKATTsGac52_R_AWvz0YB0nB0eAx1PFvM7VChLWXJRAxgvEwbUYB4wia-f0XxRV_JWoz1EIOG1V8JEHhq4iz9M275kWWzd5CJiay8jOW466OJp97w06m7KFMe3A9P3kFy41Eh-bU_f1Vp1K12Oi7gOYZ2u9UvBGH8GQeqWoGaqpbssiaNNwtmHBK1CaVm5CVt_ptoCG2HWGW_LZFFdmzJ23vbb1x-6YpSCYeMD4DvIGeSw-mlvBOuuuPYegppYz2j0idLRKojB0'

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="bg-surface-container-low px-8 py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center md:text-left">
          <h2 className="mb-4 text-4xl font-bold tracking-tight font-headline">
            Built for focused minds
          </h2>
          <p className="max-w-xl text-lg text-on-surface-variant font-body">
            Go beyond flat folders. Notely keeps structure light so you can think clearly and find
            anything quickly.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface-container-lowest p-10 md:col-span-8 group">
            <div className="relative z-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-fixed">
                <span className="material-symbols-outlined text-primary">label</span>
              </div>
              <h3 className="mb-4 text-3xl font-bold font-headline">Organize without friction</h3>
              <p className="max-w-md text-lg text-on-surface-variant font-body">
                Titles, pins, and search that respects your flow—so notes stay easy to file and
                effortless to retrieve.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap gap-2">
              <span className="rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-primary font-label">
                #RESEARCH
              </span>
              <span className="rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-primary font-label">
                #JOURNAL
              </span>
              <span className="rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-primary font-label">
                #PROJECTS
              </span>
            </div>
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-primary p-10 text-on-primary md:col-span-4">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <span className="material-symbols-outlined">collections</span>
              </div>
              <h3 className="mb-4 text-2xl font-bold font-headline">Your canvas</h3>
              <p className="text-on-primary/80 font-body">
                Room for long-form writing, snippets, and references—kept in one private place.
              </p>
            </div>
            <div className="mt-8 h-32 overflow-hidden rounded-xl bg-on-primary/10">
              <img
                src={WORKSPACE_IMG}
                alt="Minimal workspace with warm lighting"
                className="h-full w-full object-cover opacity-50 grayscale"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-12 rounded-3xl bg-surface-container-lowest p-10 md:col-span-12 md:flex-row md:p-16">
            <div className="flex-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-fixed">
                <span className="material-symbols-outlined text-on-tertiary-fixed">schema</span>
              </div>
              <h3 className="mb-6 text-4xl font-bold font-headline">See how ideas connect</h3>
              <p className="text-xl leading-relaxed text-on-surface-variant font-body">
                Visualize relationships across notes when you want depth—without giving up a simple
                day-to-day writing surface.
              </p>
              <button
                type="button"
                className="group mt-8 flex items-center gap-2 font-bold text-primary font-headline"
              >
                Learn about views
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-surface-container-low">
              <img
                src={GRAPH_IMG}
                alt="Abstract network of connected nodes"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
