import { createFileRoute } from '@tanstack/react-router'

const StudioStub = () => (
  <main
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 32,
      background: '#070a12',
      color: '#eef7ff',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}
  >
    <section
      style={{
        maxWidth: 560,
        border: '1px solid rgba(255,255,255,.14)',
        borderRadius: 24,
        padding: 28,
        background: 'rgba(255,255,255,.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,.45)',
      }}
    >
      <p style={{ margin: '0 0 10px', color: '#67e8f9', letterSpacing: '.16em', textTransform: 'uppercase' }}>
        Sanity Studio
      </p>
      <h1 style={{ margin: '0 0 12px', fontSize: 34, lineHeight: 1.05 }}>Studio is not built yet</h1>
      <p style={{ margin: 0, color: 'rgba(238,247,255,.7)', lineHeight: 1.6 }}>
        Build the embedded Sanity Studio from the project root, then reload this panel.
      </p>
      <code
        style={{
          display: 'inline-block',
          marginTop: 18,
          padding: '10px 12px',
          borderRadius: 12,
          background: 'rgba(0,0,0,.36)',
          color: '#a5f3fc',
        }}
      >
        bun run studio:build
      </code>
    </section>
  </main>
)

export const Route = createFileRoute('/studio')({
  component: StudioStub,
})
