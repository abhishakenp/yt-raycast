const MARKER = 'data-sf-storefront-cart-ui'

const BLOCK = `<div id="sf-cart-backdrop" class="sf-cart-backdrop" hidden></div>
<aside id="sf-cart-drawer" class="sf-cart-drawer" aria-label="Shopping cart" hidden>
  <div class="sf-cart-drawer__head">
    <span>Your cart</span>
    <button type="button" id="sf-cart-close" class="sf-cart-drawer__close" aria-label="Close cart">×</button>
  </div>
  <div id="sf-cart-drawer-body" class="sf-cart-drawer__body">
    <p id="sf-cart-summary" class="sf-cart-drawer__summary"></p>
    <a id="sf-cart-view-full" class="sf-cart-drawer__cta" href="cart.html">View full cart</a>
  </div>
</aside>
<style id="sf-storefront-cart-style">
.sf-cart-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9998;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s}
.sf-cart-backdrop.is-open{opacity:1;visibility:visible}
.sf-cart-drawer{position:fixed;top:0;right:0;height:100%;width:min(100%,22rem);max-width:100vw;background:#fdfcf9;color:#111;z-index:9999;box-shadow:-8px 0 32px rgba(0,0,0,.12);transform:translateX(100%);transition:transform .28s ease,visibility .28s;visibility:hidden;display:flex;flex-direction:column}
.sf-cart-drawer.is-open{transform:translateX(0);visibility:visible}
.sf-cart-drawer__head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.1rem;border-bottom:1px solid rgba(0,0,0,.08);font-family:inherit;font-weight:600}
.sf-cart-drawer__close{font-size:1.5rem;line-height:1;padding:.15rem .45rem;background:transparent;border:0;cursor:pointer;opacity:.75}
.sf-cart-drawer__close:hover{opacity:1}
.sf-cart-drawer__body{padding:1rem 1.1rem 1.25rem;display:flex;flex-direction:column;gap:.75rem;flex:1}
.sf-cart-drawer__summary{font-size:.9rem;line-height:1.45;margin:0;opacity:.85}
.sf-cart-drawer__cta{display:inline-flex;align-items:center;justify-content:center;padding:.65rem 1rem;border-radius:.65rem;background:#8b2332;color:#fff;font-weight:600;text-decoration:none;text-align:center}
.sf-cart-drawer__cta:hover{filter:brightness(1.05)}
</style>
<script>
(function(){
  var root=document.documentElement;
  if(root.hasAttribute('${MARKER}'))return;
  root.setAttribute('${MARKER}','');
  var cartBtn=document.getElementById('cart-toggle')||document.querySelector('header .utilities button[aria-label="Cart"]')||document.querySelector('.utilities button[aria-label="Cart"]');
  var backdrop=document.getElementById('sf-cart-backdrop');
  var drawer=document.getElementById('sf-cart-drawer');
  var closeBtn=document.getElementById('sf-cart-close');
  var summary=document.getElementById('sf-cart-summary');
  var countEl=document.getElementById('cart-count');
  function syncSummary(){
    if(!summary)return;
    var n=countEl?parseInt(String(countEl.textContent||'0').replace(/\\D/g,''),10)||0:0;
    summary.textContent=n<1?'Your bag is empty.':('You have '+n+(n===1?' item':' items')+' in your cart.');
  }
  function openD(){
    if(!drawer||!backdrop)return;
    syncSummary();
    backdrop.hidden=false;
    drawer.hidden=false;
    requestAnimationFrame(function(){
      backdrop.classList.add('is-open');
      drawer.classList.add('is-open');
    });
    document.body.style.overflow='hidden';
  }
  function closeD(){
    if(!drawer||!backdrop)return;
    backdrop.classList.remove('is-open');
    drawer.classList.remove('is-open');
    document.body.style.overflow='';
    function hide(){backdrop.hidden=true;drawer.hidden=true;backdrop.removeEventListener('transitionend',hide);}
    backdrop.addEventListener('transitionend',hide,{once:true});
    setTimeout(hide,320);
  }
  if(cartBtn&&drawer){
    cartBtn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      if(drawer.classList.contains('is-open'))closeD();else openD();
    },true);
  }
  if(backdrop)backdrop.addEventListener('click',closeD);
  if(closeBtn)closeBtn.addEventListener('click',closeD);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeD();});
  var mo=countEl&&window.MutationObserver?new MutationObserver(syncSummary):null;
  if(mo&&countEl)mo.observe(countEl,{childList:true,characterData:true,subtree:true});
  syncSummary();
})();
</script>`

export function injectStorefrontCartUi(html) {
  if (!html || typeof html !== 'string') return html
  if (html.includes(`id="sf-cart-drawer"`) || html.includes(`id='sf-cart-drawer'`)) return html
  const hasCart =
    /id\s*=\s*["']cart-toggle["']/i.test(html) ||
    /class\s*=\s*["'][^"']*utilities[^"']*["'][^>]*>[\s\S]*aria-label\s*=\s*["']Cart["']/i.test(html) ||
    (/class\s*=\s*["'][^"']*product-card/i.test(html) && /cart-badge|cart-count/i.test(html))
  if (!hasCart) return html
  if (!/<\/body>/i.test(html)) return `${html}\n${BLOCK}`
  return html.replace(/<\/body>/i, `${BLOCK}\n</body>`)
}
