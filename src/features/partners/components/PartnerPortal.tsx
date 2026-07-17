import { DubEmbed } from '@dub/embed-react'
import { LoaderCircle, LogIn, RefreshCw } from 'lucide-react'

import { usePartnerPortalController } from '@/features/partners/hooks/usePartnerPortalController'

function StatusPanel({
  action,
  actionLabel,
  message,
}: {
  action?: () => void
  actionLabel?: 'Retry' | 'Sign in'
  message: string
}): React.ReactNode {
  return (
    <div className="grid min-h-[55vh] place-items-center px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm text-white/65">{message}</p>
        {action && actionLabel ? (
          <button
            className="mx-auto inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-white/90"
            onClick={action}
            type="button"
          >
            {actionLabel === 'Retry' ? (
              <RefreshCw aria-hidden="true" size={16} />
            ) : (
              <LogIn aria-hidden="true" size={16} />
            )}
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function PartnerPortal(): React.ReactNode {
  const { publicToken, retry, signIn, status } = usePartnerPortalController()

  return (
    <main className="min-h-screen bg-[#06070d] px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-white/10 pb-5">
          <h1 className="text-2xl font-semibold">Partner program</h1>
          <p className="mt-1 text-sm text-white/55">Referrals and payouts</p>
        </header>

        {status === 'unavailable' ? (
          <StatusPanel message="Partner program is unavailable." />
        ) : status === 'signed_out' ? (
          <StatusPanel
            action={signIn}
            actionLabel="Sign in"
            message="Sign in to access your partner account."
          />
        ) : status === 'loading' ? (
          <div
            className="grid min-h-[55vh] place-items-center text-white/60"
            role="status"
          >
            <LoaderCircle
              aria-label="Loading partner portal"
              className="animate-spin"
              size={24}
            />
          </div>
        ) : status === 'error' || !publicToken ? (
          <StatusPanel
            action={retry}
            actionLabel="Retry"
            message="Partner portal could not be loaded."
          />
        ) : (
          <DubEmbed
            className="min-h-[720px] w-full"
            data="referrals"
            options={{
              theme: 'dark',
              themeOptions: { backgroundColor: '#06070d' },
            }}
            token={publicToken}
          />
        )}
      </div>
    </main>
  )
}
