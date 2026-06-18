import { useState } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { defineCapsule } from './openui.ts'
import { number, string, table } from '@ship-fast/lakebed/server'
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
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import FlightSimulator, { flightSimulatorProps } from '#/components/game/flight-simulator.tsx'

export const FlightSimulatorKimiPage = defineCapsule({
  name: 'FlightSimulatorKimiPage',
  description:
    'Full-screen single-player 3D flight simulator game built with Three.js. Every visual aspect is customizable via props — aircraft model/color/scale, sky/fog/grass/water/building/robot/castle colors, world size, building count/height, tree/cloud counts, terrain amplitude, flight speed, and HUD visibility. Use for game demos, interactive 3D experiences, or flight simulation pages. Supply any subset of props; the game renders a complete experience with sensible defaults.',
  props: flightSimulatorProps,
  lakebed: {
    schema: {
      savedConfigs: table({
        name: string(),
        aircraftModel: string(),
        aircraftColor: string(),
        aircraftScale: string(),
        skyColor: string(),
        fogColor: string(),
        grassColor: string(),
        waterColor: string(),
        buildingColor: string(),
        worldSize: string(),
        buildingCount: string(),
        buildingHeight: string(),
        treeCount: string(),
        cloudCount: string(),
        terrainAmplitude: string(),
        flightSpeed: string(),
        hudVisible: string(),
      }),
      flightSessions: table({
        duration: number(),
        distance: number(),
        configName: string(),
      }),
    },
    queries: {
      savedConfigs: ({ db }) => db.savedConfigs.orderBy('createdAt').all(),
      flightSessions: ({ db }) =>
        db.flightSessions.orderBy('createdAt').take(10),
    },
    mutations: {
      saveConfig: ({ db }, config: Record<string, string>) => {
        db.savedConfigs.insert(config)
        return db.savedConfigs.all()
      },
      deleteConfig: ({ db }, id: string) => {
        db.savedConfigs.delete(id)
        return db.savedConfigs.all()
      },
      loadConfig: ({ db }, id: string) => {
        return db.savedConfigs.get(id)
      },
      recordFlight: ({ db }, session: { duration: number; distance: number; configName: string }) => {
        db.flightSessions.insert(session)
        return db.flightSessions.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const savedConfigs = lakebed.useQuery('savedConfigs')
    const flightSessions = lakebed.useQuery('flightSessions')
    const saveConfig = lakebed.useMutation('saveConfig')
    const deleteConfig = lakebed.useMutation('deleteConfig')
    const loadConfig = lakebed.useMutation('loadConfig')
    const recordFlight = lakebed.useMutation('recordFlight')
    const auth = lakebed.useAuth()

    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Pilot'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'PI'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const SaveIcon = () => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    )

    const TrashIcon = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    )

    const TrophyIcon = () => (
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    )

    return (
      <div
        className={cn(
          'flex min-h-svh flex-col bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* === Navbar === */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <svg
                className="size-8 text-foreground"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 4L4 12v16l16 8 16-8V12L20 4zm0 4l12 6v12l-12 6-12-6V14l12-6z"
                  fill="currentColor"
                />
                <path
                  d="M20 12l-6 3v6l6 3 6-3v-6l-6-3z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
              <span>FlightSim</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open pilot menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Saved configurations"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SaveIcon />
                    {savedConfigs && savedConfigs.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {savedConfigs.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">
                      Saved Configurations
                    </SheetTitle>
                    <SheetDescription>
                      {savedConfigs && savedConfigs.length > 0
                        ? `${savedConfigs.length} saved configuration${savedConfigs.length === 1 ? '' : 's'}`
                        : 'No saved configurations yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {savedConfigs && savedConfigs.length > 0 ? (
                      <div className="space-y-4">
                        {savedConfigs.map((config) => (
                          <div
                            key={config.id}
                            className="rounded-lg border border-border bg-muted/40 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {config.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {config.aircraftModel} · {config.aircraftColor}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void deleteConfig(config.id)}
                                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                aria-label={`Delete ${config.name}`}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No saved configurations
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Customize your aircraft and world settings, then save
                          them for quick access.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="w-full space-y-3">
                      <div className="rounded-lg bg-muted/40 p-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <TrophyIcon />
                          Recent Flights
                        </h4>
                        {flightSessions && flightSessions.length > 0 ? (
                          <div className="space-y-2">
                            {flightSessions.map((session) => (
                              <div
                                key={session.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {session.configName || 'Custom'}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No flights recorded yet.
                          </p>
                        )}
                      </div>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4">
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        {/* === Main === */}
        <main className="flex flex-1 flex-col">
          <div className="relative flex-1">
            <FlightSimulator {...props} />
          </div>
        </main>
      </div>
    )
  },
})
