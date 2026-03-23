export function LandingFooter() {
  return (
    <footer
      id="about"
      className="mt-20 w-full border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
        <div className="text-xl font-bold text-slate-900 dark:text-white font-headline">Notely</div>
        <div className="flex flex-wrap justify-center gap-8">
          <a
            className="text-xs text-slate-500 underline decoration-primary/30 underline-offset-4 opacity-80 transition-opacity hover:text-primary hover:opacity-100 dark:text-slate-400 font-body"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-xs text-slate-500 underline decoration-primary/30 underline-offset-4 opacity-80 transition-opacity hover:text-primary hover:opacity-100 dark:text-slate-400 font-body"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-xs text-slate-500 underline decoration-primary/30 underline-offset-4 opacity-80 transition-opacity hover:text-primary hover:opacity-100 dark:text-slate-400 font-body"
            href="#"
          >
            Contact
          </a>
          <a
            className="text-xs text-slate-500 underline decoration-primary/30 underline-offset-4 opacity-80 transition-opacity hover:text-primary hover:opacity-100 dark:text-slate-400 font-body"
            href="#"
          >
            Twitter
          </a>
          <a
            className="text-xs text-slate-500 underline decoration-primary/30 underline-offset-4 opacity-80 transition-opacity hover:text-primary hover:opacity-100 dark:text-slate-400 font-body"
            href="#"
          >
            LinkedIn
          </a>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-body">
          © {new Date().getFullYear()} Notely. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
