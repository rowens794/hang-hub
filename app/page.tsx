import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white/70 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-slate-900/70 md:px-6 md:py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl text-center">
              H
            </div>
            <span className="text-lg font-bold tracking-tight text-[#8b5cf6] md:text-xl">
              HangHub
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium hover:text-electric-purple transition-colors"
            >
              Features
            </a>
            <a
              href="/how-it-works"
              className="text-sm font-medium hover:text-electric-purple transition-colors"
            >
              How it Works
            </a>
            <ThemeToggle />
            <a
              href="/get-started"
              className="rounded-full bg-[#8b5cf6] px-5 py-2 text-sm font-bold text-white hover:bg-electric-purple/90 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Get Started
            </a>
          </div>
          <MobileMenu />
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-12 lg:pt-48 lg:pb-32">
          {/* Background Blobs */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-electric-purple/10 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-neon-green/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="text-center lg:text-left">
                <h1 className="mb-4 text-4xl font-black leading-tight tracking-tighter md:text-7xl lg:text-8xl">
                  Coordinate <span className="text-electric-purple">Hangs</span>{" "}
                  Like a Pro.
                </h1>
                <p className="mb-6 text-base font-medium text-slate-600 dark:text-slate-400 md:text-xl md:mb-8">
                  The #1 app for middle schoolers to plan sleepovers,
                  after-school hangs, and more. See who's free and whose parents
                  are cool with it—all in one place.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <a
                    href="/get-started"
                    className="rounded-2xl bg-[#8b5cf6] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-electric-purple/20 transition-all hover:bg-electric-purple/90 hover:scale-105 active:scale-95 text-center"
                  >
                    Start Your Crew
                  </a>
                  <button className="rounded-2xl border-2 border-slate-200 px-8 py-4 text-lg font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900">
                    Watch the Trailer
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl transition-transform hover:rotate-2">
                  <Image
                    src="/hero.png"
                    alt="Middle schoolers hanging out"
                    width={800}
                    height={600}
                    className="w-full object-cover"
                    priority
                  />
                </div>
                {/* Floating Elements */}
                <div className="absolute -bottom-6 -left-6 z-20 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 lg:-left-12">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-neon-green" />
                    <span className="text-sm font-bold">
                      Alex is free tonight!
                    </span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 z-20 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900 lg:-right-12">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      Parents approved! ✅
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-24 bg-slate-50 dark:bg-slate-900/50"
        >
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-4 text-4xl font-black md:text-5xl">
              Built for Your Squad
            </h2>
            <p className="mb-16 text-lg text-slate-600 dark:text-slate-400">
              Everything you need to make the weekend epic.
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-3xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 dark:bg-slate-800">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-electric-purple/10 text-electric-purple group-hover:bg-electric-purple group-hover:text-white transition-colors">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-2xl font-bold">Instant Status</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Instantly see who's around and ready to hang. No more infinite
                  group texts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-3xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 dark:bg-slate-800">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-green/10 text-neon-green group-hover:bg-neon-green group-hover:text-white transition-colors">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-2xl font-bold">Parent Check</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Built-in safety. Parents get a quick ping to say 'Yes' so you
                  can get to the fun faster.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-3xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 dark:bg-slate-800">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sunburst-orange/10 text-sunburst-orange group-hover:bg-sunburst-orange group-hover:text-white transition-colors">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-2xl font-bold">iPad & Mobile</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Works perfectly on iPhones and iPads. Coordinate from your
                  desk or on the go.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mascot CTA */}
        <section className="py-24 overflow-hidden">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative rounded-[3rem] bg-electric-purple px-8 py-16 text-center text-white md:px-16 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:text-left">
                <div className="w-48 shrink-0">
                  <Image
                    src="/mascot1.png"
                    alt="HangHub Mascot"
                    width={200}
                    height={200}
                    className="w-full drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h2 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
                    Ready to hang? Let's go!
                  </h2>
                  <p className="mb-8 text-xl font-medium text-electric-purple-100 opacity-90">
                    Join 10,000+ kids already using HangHub to rule their
                    after-school life.
                  </p>
                  <a
                    href="/get-started"
                    className="rounded-2xl bg-white px-10 py-4 text-lg font-black text-electric-purple shadow-xl transition-all hover:scale-110 active:scale-95 text-center"
                  >
                    Let's Go!
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 dark:border-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-6 w-6 rounded bg-slate-400 flex items-center justify-center text-white font-bold text-sm">
                H
              </div>
              <span className="font-bold">HangHub</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 HangHub App. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
