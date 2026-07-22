import React from 'react'
import { createPolotnoApp } from 'polotno'

function App() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const storeRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (containerRef.current && !storeRef.current) {
      const { store } = createPolotnoApp({
        container: containerRef.current,
        key: 'canva-demo'
      })
      storeRef.current = store
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header className="ship-fast-header">
        <div className="ship-fast-logo">
          <img src="/logo.png" alt="Ship Fast Logo" className="ship-fast-logo-img" />
          <span className="ship-fast-logo-text">SHIP FAST</span>
        </div>
      </header>
      <div ref={containerRef} className="polotno-container bp3-dark" style={{ width: '100%', height: 'calc(100vh - 64px)' }} />
    </div>
  )
}

export default App