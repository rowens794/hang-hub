import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white/70 px-4 py-2 shadow-lg backdrop-blur-md dark:bg-slate-900/70 md:px-6 md:py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl text-center">
              H
            </div>
            <span className="text-lg font-bold tracking-tight text-[#8b5cf6] md:text-xl">
              HangHub
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/#features"
              className="text-sm font-medium hover:text-electric-purple transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-electric-purple"
            >
              How it Works
            </Link>
            <ThemeToggle />
            <Link
              href="/signup"
              className="rounded-full bg-[#8b5cf6] px-5 py-2 text-sm font-bold text-white hover:bg-electric-purple/90 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Get Started
            </Link>
          </div>
          <MobileMenu />
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-28">
          {/* Background gradient */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-electric-purple to-cool-blue opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-base font-semibold leading-7 text-electric-purple">Streamlined coordination</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Planning hangs made simple
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                No more endless group chats or confused parents. HangHub streamlines the entire process
                from idea to approved hangout in minutes.
              </p>
            </div>
          </div>

          {/* Background gradient bottom */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-neon-green to-electric-purple opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </section>

        {/* Problem Section */}
        <section className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
          <img
            alt="Kids having a chaotic sleepover"
            src="/chaos.jpeg"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 saturate-0"
          />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-96 -z-10 transform-gpu blur-3xl sm:-bottom-64 sm:-left-40 lg:-bottom-32 lg:left-8 xl:-left-10"
            >
              <div
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="aspect-[1266/975] w-[79.125rem] bg-gradient-to-tr from-red-500 to-orange-500 opacity-20"
              />
            </div>
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <p className="text-base font-semibold leading-8 text-red-400">The problem</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Coordinating hangouts is broken
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Every family knows the pain. Endless texts, confused parents, and plans that fall apart at the last minute.
              </p>
            </div>
            <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              <div className="flex flex-col gap-y-3 border-l border-white/20 pl-6">
                <dt className="text-sm leading-6 text-slate-300">Messages to plan one hang</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">50+</dd>
              </div>
              <div className="flex flex-col gap-y-3 border-l border-white/20 pl-6">
                <dt className="text-sm leading-6 text-slate-300">Days of back-and-forth</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">3-5</dd>
              </div>
              <div className="flex flex-col gap-y-3 border-l border-white/20 pl-6">
                <dt className="text-sm leading-6 text-slate-300">Hangs cancelled last-minute</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">40%</dd>
              </div>
              <div className="flex flex-col gap-y-3 border-l border-white/20 pl-6">
                <dt className="text-sm leading-6 text-slate-300">Parent calls per hangout</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight">4-6</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <p className="text-base font-semibold leading-7 text-electric-purple">The solution</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Four steps to a confirmed hangout
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                HangHub replaces the chaos with a simple, streamlined flow.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-5xl">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
                {/* Step 1 */}
                <div className="relative">
                  <div className="flex items-center gap-x-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-electric-purple">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-8">Suggest a hang</h3>
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Tap "Suggest a Hang" and fill in the basics: what you want to do, when, and who to invite. Takes just seconds.
                  </p>
                  <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-electric-purple/10">
                        <svg className="h-5 w-5 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Gaming at Jake's</p>
                        <p className="text-xs text-slate-500">Saturday 3:00 PM</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-electric-purple/10 px-2.5 py-1 text-xs font-medium text-electric-purple">Alex</span>
                      <span className="inline-flex items-center rounded-full bg-electric-purple/10 px-2.5 py-1 text-xs font-medium text-electric-purple">Maya</span>
                      <span className="inline-flex items-center rounded-full bg-electric-purple/10 px-2.5 py-1 text-xs font-medium text-electric-purple">Jordan</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="flex items-center gap-x-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cool-blue">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-8">Friends respond</h3>
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Your friends get a notification and can instantly accept or decline. Everyone sees who's in—no confusion.
                  </p>
                  <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Incoming invite</p>
                    <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cool-blue/10">
                          <svg className="h-4 w-4 text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                          </svg>
                        </div>
                        <span className="font-medium text-sm">Gaming at Jake's</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-green text-white">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="flex items-center gap-x-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sunburst-orange">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-8">Parents approve</h3>
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Once friends confirm, parents automatically get notified. They see all details and can approve with one tap.
                  </p>
                  <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sunburst-orange/10 text-xs font-bold text-sunburst-orange">P</div>
                        <span className="text-xs font-medium text-slate-500">Parent Dashboard</span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-sunburst-orange/10 px-2 py-0.5 text-xs font-medium text-sunburst-orange">1 pending</span>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                      <p className="font-medium text-sm">Gaming at Jake's</p>
                      <p className="text-xs text-slate-500 mt-1">Sat 3PM · 3 friends attending</p>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 rounded-lg bg-neon-green py-2 text-sm font-semibold text-white">Approve</button>
                        <button className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-700 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Decline</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="flex items-center gap-x-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neon-green">
                      <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-8">Hang confirmed</h3>
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Once all parents approve, the hang is locked in. Everyone knows it's happening—no surprises.
                  </p>
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-neon-green/10 to-electric-purple/10 p-6 ring-1 ring-neon-green/20">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neon-green/20">
                        <svg className="h-6 w-6 text-neon-green" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="mt-3 font-semibold">Hang Confirmed!</p>
                      <p className="text-sm text-slate-500 mt-1">Gaming at Jake's is locked in</p>
                      <div className="mt-4 flex justify-center -space-x-2">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-electric-purple text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">J</div>
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cool-blue text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">A</div>
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-hot-pink text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">M</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features for Students & Parents */}
        <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <p className="text-base font-semibold leading-7 text-electric-purple">For everyone</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for students and parents alike
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Whether you're planning or approving, HangHub has you covered.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Students Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-purple/10">
                      <svg className="h-6 w-6 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">For Students</h3>
                      <p className="text-sm text-slate-500">Middle schoolers & teens</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">See who's free</p>
                        <p className="text-sm text-slate-500">Check friends' availability before planning</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Create hangs in seconds</p>
                        <p className="text-sm text-slate-500">Quick form to suggest any activity</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Track approval status</p>
                        <p className="text-sm text-slate-500">See which parents have approved in real-time</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Organize your squad</p>
                        <p className="text-sm text-slate-500">Group friends for quick invites</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Parents Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-sm ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cool-blue/10">
                      <svg className="h-6 w-6 text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">For Parents</h3>
                      <p className="text-sm text-slate-500">Stay in the loop, stress-free</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">One-tap approvals</p>
                        <p className="text-sm text-slate-500">See all details and approve in seconds</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Know who's attending</p>
                        <p className="text-sm text-slate-500">See exactly which kids are going</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Manage multiple kids</p>
                        <p className="text-sm text-slate-500">One dashboard for all your children</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <svg className="h-6 w-6 flex-none text-cool-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Review hang history</p>
                        <p className="text-sm text-slate-500">Track past activities and patterns</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <p className="text-base font-semibold leading-7 text-electric-purple">Benefits</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Why families love HangHub
              </h2>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-purple/10">
                      <svg className="h-5 w-5 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    10x Faster
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">From idea to confirmed hang in minutes instead of days of back-and-forth.</p>
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-purple/10">
                      <svg className="h-5 w-5 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    Peace of Mind
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Nothing happens without parent approval. Safety is built into every step.</p>
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-purple/10">
                      <svg className="h-5 w-5 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    No Spam
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Clear status updates replace endless group chat messages and confusion.</p>
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-purple/10">
                      <svg className="h-5 w-5 text-electric-purple" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    No More Maybe
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Confirmed means confirmed. No last-minute surprises or cancellations.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative isolate overflow-hidden bg-slate-900 dark:bg-slate-800 py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.electric-purple/20),transparent)]" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-slate-900 dark:bg-slate-800 shadow-xl shadow-electric-purple/10 ring-1 ring-slate-100/5 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-4xl lg:text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to simplify hangouts?
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Join thousands of families already using HangHub to coordinate their social lives without the chaos.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
                <Link
                  href="/signup"
                  className="rounded-xl bg-electric-purple px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-electric-purple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-purple transition-all"
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="text-base font-semibold leading-6 text-white hover:text-slate-300 transition-colors"
                >
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-70 transition-opacity">
              <div className="h-6 w-6 rounded bg-slate-400 flex items-center justify-center text-white font-bold text-sm">
                H
              </div>
              <span className="font-semibold">HangHub</span>
            </Link>
            <p className="text-sm text-slate-500">
              © 2026 HangHub App. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-electric-purple transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
