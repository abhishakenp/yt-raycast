import { ShoppingCart } from 'lucide-react'

const cartCells = Array.from({ length: 30 }, (_, index) => index)

type EcommercifyTransformOverlayProps = {
  fixed?: boolean
}

export function EcommercifyTransformOverlay({
  fixed = false,
}: EcommercifyTransformOverlayProps) {
  return (
    <div
      className={
        fixed
          ? 'ecommercify-transform ecommercify-transform--fixed'
          : 'ecommercify-transform'
      }
      data-testid="ecommercify-transform"
      role="status"
      aria-live="polite"
      aria-label="E-commercify transformation in progress"
    >
      <div className="ecommercify-transform__panel">
        <div className="ecommercify-transform__cart-field" aria-hidden="true">
          {cartCells.map((cell) => (
            <ShoppingCart
              className="ecommercify-transform__cart"
              key={cell}
              style={{ animationDelay: `${(cell % 10) * 130}ms` }}
              strokeWidth={1.7}
            />
          ))}
        </div>

        <div className="ecommercify-transform__brand">
          <span className="ecommercify-transform__mark" aria-hidden="true">
            <img src="/assets/logo-transparent.png" alt="" />
          </span>
          <div>
            <h2>Ship Fast</h2>
            <p>E-commercifying your site</p>
          </div>
        </div>

        <div className="ecommercify-transform__progress" aria-hidden="true">
          <span />
        </div>

        <div className="ecommercify-transform__preview" aria-hidden="true">
          <aside>
            <span />
            <i />
            <i />
            <i />
            <i />
            <i />
          </aside>
          <main>
            <nav>
              <i />
              <i />
              <i />
              <i />
              <i />
            </nav>
            <section>
              <div />
              <article>
                <i />
                <i />
                <i />
                <button type="button" tabIndex={-1} aria-hidden="true" />
              </article>
            </section>
            <div className="ecommercify-transform__products">
              {[0, 1, 2, 3].map((item) => (
                <article key={item}>
                  <span />
                  <i />
                  <i />
                  <i />
                  <button type="button" tabIndex={-1} aria-hidden="true" />
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
