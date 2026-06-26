import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MARKER = 'data-sf-storefront-cart-ui'

export function stripStorefrontCartUi(html) {
  if (!html || typeof html !== 'string') return html
  return html.replace(
    /\n?<div id="sf-cart-backdrop"[\s\S]*?<\/script>\s*/i,
    '\n',
  )
}

function readVariantMapFromWorkspace(workspace) {
  if (!workspace) return null
  try {
    const p = join(workspace, 'medusa-variants.json')
    if (!existsSync(p)) return null
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

export function injectMedusaVariantDataAttributes(html, byTitle = {}) {
  if (
    !html ||
    typeof html !== 'string' ||
    !byTitle ||
    typeof byTitle !== 'object'
  )
    return html
  let next = html
  for (const [title, vid] of Object.entries(byTitle)) {
    if (!title || !vid) continue
    const dq = `data-product="${title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`
    const sq = `data-product='${title.replace(/'/g, '&#39;')}'`
    if (next.includes(dq)) {
      next = next
        .split(dq)
        .join(`${dq} data-medusa-variant-id="${String(vid).replace(/"/g, '')}"`)
    } else if (next.includes(sq)) {
      next = next
        .split(sq)
        .join(`${sq} data-medusa-variant-id="${String(vid).replace(/"/g, '')}"`)
    }
  }
  return next
}

function buildBlock(medusaMapJson) {
  return `<div id="sf-cart-backdrop" class="sf-cart-backdrop" hidden></div>
<aside id="sf-cart-drawer" class="sf-cart-drawer" aria-label="Shopping cart" hidden>
  <div class="sf-cart-drawer__head">
    <span>Your cart</span>
    <button type="button" id="sf-cart-close" class="sf-cart-drawer__close" aria-label="Close cart">×</button>
  </div>
  <div id="sf-cart-drawer-body" class="sf-cart-drawer__body">
    <p id="sf-cart-summary" class="sf-cart-drawer__summary"></p>
    <ul id="sf-cart-lines" class="sf-cart-lines" aria-label="Cart items"></ul>
    <p id="sf-cart-total" class="sf-cart-total" hidden></p>
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
.sf-cart-drawer__body{padding:1rem 1.1rem 1.25rem;display:flex;flex-direction:column;gap:.75rem;flex:1;overflow:auto}
.sf-cart-drawer__summary{font-size:.9rem;line-height:1.45;margin:0;opacity:.85}
.sf-cart-lines{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem;font-size:.88rem}
.sf-cart-lines li{display:flex;justify-content:space-between;gap:.5rem;border-bottom:1px solid rgba(0,0,0,.06);padding-bottom:.35rem}
.sf-cart-total{font-weight:600;margin:0;font-size:.95rem}
.sf-cart-drawer__cta{display:inline-flex;align-items:center;justify-content:center;padding:.65rem 1rem;border-radius:.65rem;background:#8b2332;color:#fff;font-weight:600;text-decoration:none;text-align:center}
.sf-cart-drawer__cta:hover{filter:brightness(1.05)}
header .utilities,header .site-header__utilities,.site-header .utilities,nav .utilities{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:.75rem!important}
header .utilities>a[href*="search"],header .utilities button[aria-label="Search"],header .utilities a[aria-label="Search"],.utilities .search-toggle,.utilities [aria-label="Search"]{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:2.5rem!important;min-width:2.5rem!important;box-sizing:border-box!important}
#cart-toggle,button#cart-toggle,header #cart-toggle{position:relative!important;display:inline-flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;align-self:center!important;gap:.35rem!important;line-height:1!important;padding:.35rem .45rem!important;box-sizing:border-box!important;vertical-align:middle!important;margin:0!important;min-height:2.5rem!important;min-width:auto!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:none!important;box-shadow:none!important;color:#111827!important;border-radius:.5rem!important;font:inherit!important;-webkit-appearance:none!important;appearance:none!important}
#cart-toggle:hover{background:rgba(15,23,42,.06)!important}
#cart-toggle .sf-cart-bag-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;color:inherit!important}
#cart-toggle .sf-cart-bag-icon svg{display:block!important;width:22px!important;height:22px!important;color:inherit!important;stroke:currentColor!important}
#cart-toggle .cart-badge{position:static!important;top:auto!important;right:auto!important;inset:auto!important;transform:none!important;box-sizing:border-box!important;min-width:1.25rem!important;height:1.25rem!important;padding:0 .35rem!important;font-size:.65rem!important;font-weight:600!important;line-height:1.25rem!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;background:rgba(15,23,42,.1)!important;color:#111827!important;border:0!important}
</style>
<script>
(function(){
  var root=document.documentElement;
  if(root.hasAttribute('${MARKER}'))return;
  root.setAttribute('${MARKER}','');
  var MEDUSA_MAP=${medusaMapJson};
  var API_BASE='/api/storefront/medusa';
  var LS_CART='sf_medusa_cart_id';
  var cartBtn=document.getElementById('cart-toggle')||document.querySelector('header .utilities button[aria-label="Cart"]')||document.querySelector('.utilities button[aria-label="Cart"]');
  var backdrop=document.getElementById('sf-cart-backdrop');
  var drawer=document.getElementById('sf-cart-drawer');
  var closeBtn=document.getElementById('sf-cart-close');
  var summary=document.getElementById('sf-cart-summary');
  var linesEl=document.getElementById('sf-cart-lines');
  var totalEl=document.getElementById('sf-cart-total');
  var countEl=document.getElementById('cart-count');
  var storeEnabled=false;
  var lastCart=null;

  function bagSvg(){
    return '<span class="sf-cart-bag-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.331 8h11.338a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1-2.966 2.544H9.215a3 3 0 0 1-2.965-2.54L4.995 10.304A2 2 0 0 1 6.331 8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11V6a3 3 0 0 1 6 0v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  }
  function normalizeCartToggleIcon(){
    if(!cartBtn)return;
    var badge=countEl;
    var n=badge?badge.textContent:'0';
    cartBtn.textContent='';
    var tempDiv=document.createElement('div');
    tempDiv.innerHTML=bagSvg();
    while(tempDiv.firstChild)cartBtn.appendChild(tempDiv.firstChild);
    if(badge){
      var badgeSpan=document.createElement('span');
      badgeSpan.className='cart-badge';
      badgeSpan.id='cart-count';
      badgeSpan.textContent=n;
      cartBtn.appendChild(badgeSpan);
    }
    countEl=document.getElementById('cart-count');
    if(cartBtn.style){
      cartBtn.style.removeProperty('background');
      cartBtn.style.removeProperty('background-color');
      cartBtn.style.removeProperty('background-image');
      cartBtn.style.removeProperty('box-shadow');
    }
  }
  normalizeCartToggleIcon();

  function fmtMoney(amount,currency){
    if(amount==null)return'';
    try{return new Intl.NumberFormat('en-US',{style:'currency',currency:(currency||'usd').toUpperCase()}).format(amount/100);}catch(e){return String(amount);}
  }

  function renderMedusaCart(cart){
    lastCart=cart;
    if(!summary)return;
    var items=cart&&cart.items?cart.items:[];
    var n=items.reduce(function(a,it){return a+(it.quantity||0);},0);
    if(countEl)countEl.textContent=String(n);
    if(!linesEl)return;
    while(linesEl.firstChild)linesEl.removeChild(linesEl.firstChild);
    for(var i=0;i<items.length;i++){
      var it=items[i];
      var li=document.createElement('li');
      li.appendChild(document.createTextNode((it.title||it.variant?.title||'Item')+' ×'+(it.quantity||1)));
      var pr=document.createElement('span');
      var sub=it.subtotal!=null?it.subtotal:((it.unit_price||0)*(it.quantity||1));
      pr.textContent=fmtMoney(sub,cart.region?.currency_code);
      li.appendChild(pr);
      linesEl.appendChild(li);
    }
    summary.textContent=n<1?'Your bag is empty.':('You have '+n+(n===1?' item':' items')+' in your cart.');
    if(totalEl&&cart&&cart.total!=null){
      totalEl.hidden=false;
      totalEl.textContent='Subtotal: '+fmtMoney(cart.total,cart.region?.currency_code);
    }else if(totalEl){totalEl.hidden=true;}
  }

  function syncSummaryMock(){
    if(!summary)return;
    var n=countEl?parseInt(String(countEl.textContent||'0').replace(/\\D/g,''),10)||0:0;
    summary.textContent=n<1?'Your bag is empty.':('You have '+n+(n===1?' item':' items')+' in your cart.');
  }

  function openD(){
    if(!drawer||!backdrop)return;
    if(storeEnabled&&lastCart)renderMedusaCart(lastCart);
    else syncSummaryMock();
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

  function medusaMapUsable(){
    return MEDUSA_MAP&&(MEDUSA_MAP.byTitle||MEDUSA_MAP.byHandle);
  }

  fetch(API_BASE+'/config').then(function(r){return r.json();}).then(function(d){
    storeEnabled=!!(d&&d.enabled&&medusaMapUsable());
    if(storeEnabled)return refreshMedusaCart();
    syncSummaryMock();
  }).catch(function(){syncSummaryMock();});

  function ensureMedusaCart(){
    return fetch(API_BASE+'/config').then(function(r){return r.json();}).then(function(d){
      if(!d||!d.enabled)return Promise.reject(new Error('off'));
      var id=localStorage.getItem(LS_CART);
      if(id){
        return fetch(API_BASE+'/cart/'+encodeURIComponent(id)).then(function(r){
          if(!r.ok)throw new Error('bad');
          return r.json();
        }).then(function(j){
          if(j.cart&&j.cart.id&&!j.cart.completed_at)return j.cart;
          throw new Error('stale');
        }).catch(function(){
          localStorage.removeItem(LS_CART);
          return createCart();
        });
      }
      return createCart();
    });
  }
  function createCart(){
    return fetch(API_BASE+'/cart',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){
      return r.json();
    }).then(function(j){
      if(j.cart&&j.cart.id){
        localStorage.setItem(LS_CART,j.cart.id);
        return j.cart;
      }
      throw new Error('no cart');
    });
  }

  function refreshMedusaCart(){
    return ensureMedusaCart().then(function(cart){
      return fetch(API_BASE+'/cart/'+encodeURIComponent(cart.id)).then(function(r){return r.json();});
    }).then(function(j){
      if(j.cart){
        renderMedusaCart(j.cart);
        return j.cart;
      }
    }).catch(function(){syncSummaryMock();});
  }

  document.addEventListener('click',function(e){
    var el=e.target&&e.target.closest?e.target.closest('[data-medusa-variant-id]'):null;
    if(!el||!storeEnabled)return;
    var vid=el.getAttribute('data-medusa-variant-id');
    if(!vid)return;
    e.preventDefault();
    e.stopPropagation();
    var id=localStorage.getItem(LS_CART);
    var p=id?fetch(API_BASE+'/cart/'+encodeURIComponent(id)).then(function(r){return r.json();}).then(function(j){if(j.cart&&!j.cart.completed_at)return j.cart;throw new Error('x');}):Promise.reject();
    p=p.catch(function(){localStorage.removeItem(LS_CART);return fetch(API_BASE+'/cart',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(j){if(j.cart&&j.cart.id){localStorage.setItem(LS_CART,j.cart.id);return j.cart;}throw new Error('x');});});
    p.then(function(cart){
      return fetch(API_BASE+'/cart/line-items',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart_id:cart.id,variant_id:vid,quantity:1})});
    }).then(function(r){return r.json();}).then(function(j){
      if(j.cart)renderMedusaCart(j.cart);
    }).catch(function(){});
  },true);

  if(cartBtn&&drawer){
    cartBtn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      if(drawer.classList.contains('is-open'))closeD();
      else{
        if(storeEnabled)refreshMedusaCart().then(function(){openD();});
        else openD();
      }
    },true);
  }
  if(backdrop)backdrop.addEventListener('click',closeD);
  if(closeBtn)closeBtn.addEventListener('click',closeD);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeD();});
  var mo=countEl&&window.MutationObserver?new MutationObserver(function(){
    if(!storeEnabled)syncSummaryMock();
  }):null;
  if(mo&&countEl)mo.observe(countEl,{childList:true,characterData:true,subtree:true});
  syncSummaryMock();
})();
</script>
`
}

export function injectStorefrontCartUi(html, options = {}) {
  if (!html || typeof html !== 'string') return html
  const force = Boolean(options.force)
  if (force && /id=["']sf-cart-backdrop["']/.test(html)) {
    html = stripStorefrontCartUi(html)
  }
  if (
    (html.includes(`id="sf-cart-drawer"`) ||
      html.includes(`id='sf-cart-drawer'`)) &&
    !force
  )
    return html
  const hasCart =
    /id\s*=\s*["']cart-toggle["']/i.test(html) ||
    /class\s*=\s*["'][^"']*utilities[^"']*["'][^>]*>[\s\S]*aria-label\s*=\s*["']Cart["']/i.test(
      html,
    ) ||
    (/class\s*=\s*["'][^"']*product-card/i.test(html) &&
      /cart-badge|cart-count/i.test(html))

  if (!hasCart) return html

  let map = options.variantMap || null
  if (!map && options.workspace) {
    map = readVariantMapFromWorkspace(options.workspace)
  }
  const medusaMapJson =
    map && (map.byTitle || map.byHandle) ? JSON.stringify(map) : 'null'

  const block = buildBlock(medusaMapJson)
  if (!/<\/body>/i.test(html)) return `${html}\n${block}`
  return html.replace(/<\/body>/i, `${block}\n</body>`)
}
