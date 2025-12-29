import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  ListCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    label: "Household-ready",
    value: "15 min",
    detail: "Average time to onboard everyone",
  },
  {
    label: "Tasks resolved",
    value: "92%",
    detail: "Done within the planned week",
  },
  {
    label: "Alerts ignored",
    value: "0",
    detail: "Because notifications target one owner",
  },
];

const features = [
  {
    icon: CalendarCheck,
    title: "Living schedules",
    description:
      "View today, overdue, and upcoming work in one split canvas designed for families, not sprints.",
  },
  {
    icon: UsersRound,
    title: "Household context",
    description:
      "Every task, assignment, and category remains scoped to the same home so nothing leaks between members.",
  },
  {
    icon: BellRing,
    title: "Signal-only alerts",
    description:
      "Due and overdue nudges follow the assignee across devices and disappear the moment the job is done.",
  },
];

const workflow = [
  {
    step: "Plan together",
    detail:
      "Drop chores, repairs, or errands into one shared backlog with categories and priorities everyone understands.",
  },
  {
    step: "Stay unblocked",
    detail:
      "Call out dependencies—like finishing the laundry before folding—so tasks never stall silently.",
  },
  {
    step: "Feel the follow-through",
    detail:
      "Lightweight notifications, clear owners, and a calm dashboard keep momentum without micromanaging anyone.",
  },
];

const sampleTasks = [
  {
    title: "Deep clean the kitchen",
    meta: "Due tomorrow • High priority",
    category: "House reset",
  },
  {
    title: "Set up winter gear shelf",
    meta: "Due Friday • Medium priority",
    category: "Storage",
  },
  {
    title: "Prep Sunday meal plan",
    meta: "Due Sunday • Shared",
    category: "Meals",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-secondary/40 text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 size-[620px] -translate-x-1/2 rounded-full bg-emerald-200 blur-[220px] dark:bg-emerald-400/20" />
        <div className="absolute bottom-0 left-1/4 size-[420px] -translate-x-1/2 rounded-full bg-amber-200 blur-[180px] dark:bg-amber-400/10" />
      </div>
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 sm:px-10 lg:py-24">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70 backdrop-blur dark:bg-white/5">
              <Sparkles className="size-4" />
              Built for calm households
            </div>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Household tasks, timelines, and nudges in one quietly
                opinionated space.
              </h1>
              <p className="text-lg text-muted-foreground">
                Hearth keeps everyone aligned without turning your living room
                into a stand-up. Assign chores, surface blockers, and celebrate
                progress with a dashboard tuned for real homes.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2"
                >
                  Start a household
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign back in</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-foreground/10 bg-white/70 p-5 backdrop-blur dark:bg-white/5"
                >
                  <p className="text-sm font-semibold text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-3xl font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl ring-1 ring-white/20 dark:from-slate-900/90">
            <div className="mb-6 flex items-center justify-between text-sm text-slate-200">
              <p className="font-semibold">Tonight at a glance</p>
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <CheckCircle2 className="size-4" />4 clears pending
              </span>
            </div>
            <div className="space-y-4">
              {sampleTasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-white">
                      {task.title}
                    </p>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                      {task.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{task.meta}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <ListCheck className="size-4" />
                    Dependency chain clear
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-dashed border-white/20 p-4 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">Notifications muted</p>
                <p className="text-xs text-slate-400">
                  All overdue nudges acknowledged
                </p>
              </div>
              <CalendarCheck className="size-5 text-emerald-200" />
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Why Hearth works
            </p>
            <h2 className="text-3xl font-semibold text-foreground">
              Intentional guardrails for real households
            </h2>
            <p className="text-base text-muted-foreground">
              From onboarding to overdue nudges, every pattern reinforces
              clarity and keeps chores collaborative rather than contentious.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-foreground/10 bg-white/70 p-6 backdrop-blur dark:bg-white/5"
              >
                <Icon className="size-8 text-foreground" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-foreground/10 bg-white/80 p-8 backdrop-blur-lg dark:bg-white/5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Simple rhythm
            </p>
            <h2 className="text-3xl font-semibold text-foreground">
              Week-over-week momentum
            </h2>
            <p className="text-sm text-muted-foreground">
              Hearth keeps the loop tight—plan, unblock, finish—so teams of
              roommates, partners, or families see progress faster.
            </p>
          </div>
          <div className="space-y-6">
            {workflow.map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-2xl border border-foreground/10 p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {item.step}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary to-primary/70 px-8 py-12 text-primary-foreground">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">
                Ready when you are
              </p>
              <h2 className="text-3xl font-semibold text-balance">
                Launch Hearth for your household and replace chaotic chats with
                a calm control room.
              </h2>
              <p className="text-base text-primary-foreground/80">
                Spin up a workspace, invite whoever shares your sink, and let
                the product keep chores humane.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2"
                >
                  Create my workspace
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="bg-white/10 text-primary-foreground hover:bg-white/20"
                asChild
              >
                <Link href="/dashboard">See the dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
