import { useState } from 'react'
import { z } from 'zod/v4'
import { number, string, table } from '@ship-fast/lakebed/server'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { defineCapsule } from './openui.ts'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'

export const ScheduleKimiPage5 = defineCapsule({
  name: 'ScheduleKimiPage5',
  description:
    'Schedule fifth style sibling to ScheduleKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    sections: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          body: z.string(),
          items: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    gallery: z
      .array(
        z.object({
          title: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      planItems: table({
        name: string(),
        note: string(),
        count: number(),
      }),
    },
    queries: {
      planItems: ({ db }) => db.planItems.orderBy('createdAt').all(),
    },
    mutations: {
      addPlanItem: ({ db }, name: string) => {
        const normalizedName = name.trim()
        if (!normalizedName) return db.planItems.all()

        const existingItem = db.planItems.where('name', normalizedName).all()[0]

        if (existingItem) {
          db.planItems.update(existingItem.id, {
            count: existingItem.count + 1,
          })
          return db.planItems.all()
        }

        db.planItems.insert({
          name: normalizedName,
          note: 'Saved language class interest',
          count: 1,
        })

        return db.planItems.all()
      },
      setPlanItemCount: ({ db }, name: string, count: number) => {
        const normalizedName = name.trim()
        if (!normalizedName) return db.planItems.all()

        const nextCount = Math.max(0, Math.floor(count))
        const existingItem = db.planItems.where('name', normalizedName).all()[0]

        if (!existingItem) {
          if (!nextCount) return db.planItems.all()

          db.planItems.insert({
            name: normalizedName,
            note: 'Saved language class interest',
            count: nextCount,
          })
          return db.planItems.all()
        }

        if (nextCount === 0) {
          db.planItems.delete(existingItem.id)
        } else {
          db.planItems.update(existingItem.id, { count: nextCount })
        }

        return db.planItems.all()
      },
      removePlanItem: ({ db }, name: string) => {
        const normalizedName = name.trim()
        if (!normalizedName) return db.planItems.all()

        for (const item of db.planItems.where('name', normalizedName).all()) {
          db.planItems.delete(item.id)
        }

        return db.planItems.all()
      },
      clearPlanItems: ({ db }) => {
        for (const item of db.planItems.all()) {
          db.planItems.delete(item.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [planOpen, setPlanOpen] = useState(false)
    const brand = props.brand ?? 'Class Schedule'
    const nav = props.nav?.length
      ? props.nav
      : ['Schedule', 'Languages', 'Teachers', 'Pricing']
    const hero = {
      eyebrow: 'Schedule / Variant 5',
      title: 'Class Schedule',
      description:
        'Class Schedule Language School Schedule Languages Teachers Pricing Class Schedule Learn a new language with expert instructors All Languages Spanish French German Japanese Manda...',
      primaryCta: 'All Languages',
      secondaryCta: 'Spanish',
      imageAlt: 'schedule hero scene',
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: '24/7',
            label: 'Responsive service',
          },
          {
            value: '98%',
            label: 'Positive outcomes',
          },
          {
            value: '4.9',
            label: 'Average rating',
          },
          {
            value: '12+',
            label: 'Core capabilities',
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: 'Overview',
            title: 'Schedule strategy',
            body: 'Class Schedule Language School Schedule Languages Teachers Pricing Class Schedule Learn a new language with expert instructors All Languages Spanish French German Japanese Manda...',
            items: [],
          },
          {
            eyebrow: 'Experience',
            title: 'Schedule services',
            body: "Schedule page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: 'Proof',
            title: 'Schedule results',
            body: "Schedule page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
          {
            eyebrow: 'Next steps',
            title: 'Schedule support',
            body: "Schedule page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: 'Schedule visual 1',
            alt: 'schedule hero scene',
            caption: 'Schedule generated page detail',
          },
          {
            title: 'Schedule visual 2',
            alt: 'schedule customer experience',
            caption: 'Schedule generated page detail',
          },
          {
            title: 'Schedule visual 3',
            alt: 'schedule service detail',
            caption: 'Schedule generated page detail',
          },
        ]
    const storedPlanItems = lakebed.useQuery('planItems')
    const addPlanItem = lakebed.useMutation('addPlanItem')
    const setPlanItemCount = lakebed.useMutation('setPlanItemCount')
    const removePlanItem = lakebed.useMutation('removePlanItem')
    const clearPlanItems = lakebed.useMutation('clearPlanItems')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const fallbackPlanItems = [
      {
        id: 'default-all-languages',
        name: hero.primaryCta,
        note: 'Explore all available language courses.',
        count: 0,
      },
      {
        id: 'default-secondary',
        name: hero.secondaryCta,
        note: 'Start with this featured language.',
        count: 0,
      },
      {
        id: 'default-pricing',
        name: 'Pricing',
        note: 'Review available plans and tuition.',
        count: 0,
      },
    ]
    const hasStoredPlanItems = Boolean(storedPlanItems?.length)
    const planItems = (
      hasStoredPlanItems ? storedPlanItems : fallbackPlanItems
    ) as Array<{
      id: string
      name: string
      note: string
      count: number
    }>
    const planItemCount = planItems.reduce(
      (total, item) => total + item.count,
      0,
    )

    const handleAddPlanItem = (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      void addPlanItem(trimmed)
      setPlanOpen(true)
    }

    const handleSetPlanItemCount = (name: string, count: number) => {
      const trimmed = name.trim()
      if (!trimmed) return
      void setPlanItemCount(trimmed, count)
      if (!hasStoredPlanItems) {
        setPlanOpen(true)
      }
    }

    return (
      <div
        className={cn(
          'min-h-screen bg-background text-foreground',
          props.className,
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go('Home')}
              className="text-left text-lg font-semibold tracking-tight"
            >
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Sheet open={planOpen} onOpenChange={setPlanOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
                  >
                    My Plan
                    {planItemCount > 0 ? (
                      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold text-primary-foreground">
                        {planItemCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent className="flex w-full flex-col">
                  <SheetHeader>
                    <SheetTitle>Learning plan</SheetTitle>
                    <SheetDescription>
                      {planItemCount > 0
                        ? `${planItemCount} item${planItemCount === 1 ? '' : 's'} in your plan`
                        : 'Build your language study plan from anything you like in the page.'}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="min-h-0 flex-1 overflow-auto pt-4">
                    {planItems.length ? (
                      <div className="space-y-3">
                        {planItems.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-lg border border-border bg-muted/40 p-4"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-card-foreground">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.note}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPlanItemCount(
                                    item.name,
                                    item.count - 1,
                                  )
                                }
                                className="grid size-8 place-items-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-foreground">
                                {item.count}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPlanItemCount(
                                    item.name,
                                    item.count + 1,
                                  )
                                }
                                className="grid size-8 place-items-center rounded-md border border-border text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => void removePlanItem(item.name)}
                                className="ml-auto rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                        No entries yet. Add items from sections to build your
                        plan.
                      </div>
                    )}
                  </div>

                  <SheetFooter className="border-t border-border pt-4">
                    <div className="flex w-full flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => go(hero.primaryCta)}
                        className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {hero.primaryCta}
                      </button>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => void clearPlanItems()}
                          className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          Clear plan
                        </button>
                        {isSignedIn ? (
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                          >
                            Sign out
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSignIn}
                            disabled={auth.isLoading}
                            className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-60"
                          >
                            {auth.isLoading ? 'Checking account...' : 'Sign in'}
                          </button>
                        )}
                      </div>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="rounded-md bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted"
                        >
                          Continue
                        </button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-24">
              <div>
                <p className="mb-4 inline-flex rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {hero.eyebrow}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  {hero.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddPlanItem(hero.primaryCta)
                      go(hero.primaryCta)
                    }}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddPlanItem(hero.secondaryCta)
                      go(hero.secondaryCta)
                    }}
                    className="rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Image
                  alt={hero.imageAlt}
                  w={1200}
                  h={900}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-card p-5"
              >
                <p className="text-3xl font-semibold text-card-foreground">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <p className="text-sm font-medium text-primary">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            handleAddPlanItem(item)
                            go(item)
                          }}
                          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{item}</span>
                          <span className="text-primary">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">
                  Generated visuals
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddPlanItem(hero.secondaryCta)
                  go(hero.secondaryCta)
                }}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {hero.secondaryCta}
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <Image
                    alt={item.alt}
                    w={900}
                    h={700}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    {item.caption ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.caption}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">
                    {brand}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Ready for the next step?
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                    {hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleAddPlanItem(hero.primaryCta)
                    go(hero.primaryCta)
                    setPlanOpen(true)
                  }}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              (c) {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
