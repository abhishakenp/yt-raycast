import { shouldUseSwiper } from '../lib/swiper-policy'

const SWIPER_CDN_CSS =
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css'
const SWIPER_CDN_JS =
  'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js'
const SPLIDE_CDN_CSS =
  'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css'
const SPLIDE_CDN_JS =
  'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js'
const MARKER = 'data-sf-llm-swiper-injected'
const MARKER_SPLIDE = 'data-sf-llm-splide-runtime'

function buildLlmSwiperInlineScript() {
  return `<script ${MARKER}>
(function(){
function pr(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function hm(el){var t=(el.textContent||'').trim();if(!t)return false;return /new arrivals|featured|best sellers|shop the|our collection|collections|just in|bestseller|new in|curated|gift sets?|bundles?|shop bundles|product carousel|carousel|picks|you may|discover|shop now|products|editor|explore|collection/i.test(t)}
function scope(h){var s=h.closest('section');if(s)return s;var p=h,c=0;while(p&&c++<8){if(p.querySelector&&(p.querySelector('.grid,[class*="grid-cols"]')||p.querySelector('[class*="flex-col"]')))return p;p=p.parentElement}return h.parentElement&&h.parentElement.parentElement}
function kids(el){return [].slice.call(el.children).filter(function(n){return n.nodeType===1})}
function splitTwoColGrid(g){var ch=kids(g);if(ch.length!==2)return null;var a=ch[0],b=ch[1];if(!a.querySelector('h2,h3'))return null;var inner=b.querySelector('.grid,[class*="grid-cols"]');if(inner&&!inner.closest('.swiper')){var ik=kids(inner);if(ik.length>=2)return inner}var bk=kids(b);if(bk.length>=2)return b;return null}
function findTrack(sec){if(!sec)return null;var grids=[].slice.call(sec.querySelectorAll('div.grid,div[class*="grid-cols"]')).filter(function(g){return !g.closest('.swiper')});var i,best=null,bn=0;for(i=0;i<grids.length;i++){var g=grids[i],sg=splitTwoColGrid(g);if(sg){var sk=kids(sg);if(sk.length>=2&&sk.length>bn){bn=sk.length;best=sg;continue}}var ch=kids(g),kk=kids(g);if(ch.length===2&&ch[0].querySelector('h2,h3')&&kids(ch[1]).length<2)continue;if(kk.length>=2&&kk.length>bn){bn=kk.length;best=g}}if(best)return best;var fx=sec.querySelectorAll('div.flex');for(i=0;i<fx.length;i++){var f=fx[i];if(f.closest('.swiper'))continue;var cn=f.className||'';var fk=kids(f);if(/flex-row|flex-nowrap|inline-flex/.test(cn)&&/gap-/.test(cn)&&fk.length>=2&&fk.length>bn){bn=fk.length;best=f}else if(/flex-col|flex-wrap/.test(cn)&&fk.length>=2&&fk.length>bn){bn=fk.length;best=f}}var ox=sec.querySelector('div.overflow-x-auto,div[class*="overflow-x"],div[class*="snap-x"]');if(ox&&!ox.closest('.swiper')){var ok=kids(ox);if(ok.length>=2)return ox}return best}
function fgrid(sec){var t=findTrack(sec);if(t)return t;var g=sec.querySelector('.grid');if(g&&!g.closest('.swiper'))return g;g=sec.querySelector('[class*="grid-cols"]');if(g&&!g.closest('.swiper'))return g;var fx=sec.querySelectorAll('div.flex');for(var i=0;i<fx.length;i++){var f=fx[i];if(f.closest('.swiper'))continue;if(/flex-col|flex-wrap/.test(f.className||'')&&f.children.length>=2)return f}return null}
function navPair(sec,h){var el=h.parentElement;while(el&&el!==sec){var bt=[].slice.call(el.querySelectorAll('button')).filter(function(x){return !x.closest('.swiper')});if(bt.length>=2){var a=bt[bt.length-2],b=bt[bt.length-1];a.classList.add('sf-swiper-prev');b.classList.add('sf-swiper-next');return{prev:a,next:b}}el=el.parentElement}var all=[].slice.call(sec.querySelectorAll('button,a[role="button"]')).filter(function(x){return !x.closest('.swiper')});function hit(el,rx){var s=(el.getAttribute('aria-label')||'')+(el.getAttribute('title')||'')+(el.textContent||'');return rx.test(s)}var prev,next,i;for(i=0;i<all.length;i++){if(hit(all[i],/prev|back|left|‹|«/i)){prev=all[i];prev.classList.add('sf-swiper-prev');break}}for(i=0;i<all.length;i++){if(hit(all[i],/next|forward|right|›|»/i)){next=all[i];next.classList.add('sf-swiper-next');break}}return{prev:prev||null,next:next||null}}
function up(){
if(typeof Swiper==='undefined')return
var heads=document.querySelectorAll('h2,h3')
heads.forEach(function(h){
if(!hm(h))return
var sec=scope(h)
if(!sec)return
var grid=fgrid(sec)
if(!grid||grid.getAttribute('data-sf-swiper-upgraded'))return
var items=kids(grid)
if(items.length<1)return
grid.setAttribute('data-sf-swiper-upgraded','1')
var w=document.createElement('div')
w.className='swiper-wrapper'
items.forEach(function(node){
var sl=document.createElement('div')
sl.className='swiper-slide'
sl.style.width='min(300px,88vw)'
sl.style.flexShrink='0'
sl.appendChild(node)
w.appendChild(sl)
})
var root=document.createElement('div')
root.className='product-carousel swiper sf-llm-swiper'
root.setAttribute('data-sf-swiper','')
root.setAttribute('data-swiper-managed','')
var pg=document.createElement('div')
pg.className='swiper-pagination'
root.appendChild(w)
root.appendChild(pg)
grid.parentNode.replaceChild(root,grid)
var np=navPair(sec,h)
var n=items.length
var opts={slidesPerView:n<2?1.05:'auto',spaceBetween:16,loop:n>2&&!pr(),grabCursor:!pr(),watchOverflow:false,centeredSlides:n<3,speed:pr()?0:450,pagination:{el:pg,clickable:true,dynamicBullets:n>4}}
if(np.prev||np.next)opts.navigation={prevEl:np.prev||undefined,nextEl:np.next||undefined}
new Swiper(root,opts)
})
}
function run(){up()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run()
})()
</script>`
}

function buildLlmSwiperStyleBlock() {
  return `<style ${MARKER}>
.sf-llm-swiper.product-carousel.swiper{overflow:hidden;width:100%;max-width:100%;padding-bottom:2.75rem;margin-top:1rem;box-sizing:border-box}
.sf-llm-swiper .swiper-slide{box-sizing:border-box}
.sf-llm-swiper .swiper-pagination{bottom:0!important}
.splide[data-sf-splide] .splide__pagination__page{background:rgba(255,255,255,.35);opacity:1}
.splide[data-sf-splide] .splide__pagination__page.is-active{background:rgba(255,255,255,.95)}
.splide[data-sf-splide] .splide__arrow{background:rgba(15,23,42,.65);opacity:1}
</style>`
}

function buildSplideInitInlineScript() {
  return `<script ${MARKER_SPLIDE}>
(function(){
function pr(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function run(){
if(typeof Splide==='undefined')return
document.querySelectorAll('.splide[data-sf-splide]').forEach(function(root){
if(root.getAttribute('data-sf-splide-mounted'))return
var slides=root.querySelectorAll('.splide__slide')
var n=slides.length
if(n<1)return
root.setAttribute('data-sf-splide-mounted','1')
new Splide(root,{type:n>2?'loop':'slide',perPage:Math.min(3,n),gap:'1rem',pagination:true,arrows:n>1,rewind:true,speed:pr()?0:480,breakpoints:{640:{perPage:Math.min(2,n)},1024:{perPage:Math.min(3,n)}}}).mount()
})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run()
})()
</script>`
}

export function injectLLMHomepageSwiper(
  html: string,
  siteSpec: { siteType?: string; userPrompt?: string } | null,
): string {
  if (!html || typeof html !== 'string' || !shouldUseSwiper(siteSpec))
    return html
  if (html.includes('./site.js') && html.includes('site-motion.mjs'))
    return html
  const runtimeOk =
    html.includes(MARKER) &&
    html.includes(MARKER_SPLIDE) &&
    html.includes(SPLIDE_CDN_JS)
  if (runtimeOk) return html

  let out = html
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  if (!out.includes(SWIPER_CDN_CSS)) {
    out = /<\/head>/i.test(out)
      ? out.replace(
          /<\/head>/i,
          `  <link rel="stylesheet" href="${SWIPER_CDN_CSS}" />\n  <link rel="stylesheet" href="${SPLIDE_CDN_CSS}" />\n  ${buildLlmSwiperStyleBlock()}\n</head>`,
        )
      : `${buildLlmSwiperStyleBlock()}\n${out}`
  } else if (!out.includes(SPLIDE_CDN_CSS)) {
    out = /<\/head>/i.test(out)
      ? out.replace(
          /<\/head>/i,
          `  <link rel="stylesheet" href="${SPLIDE_CDN_CSS}" />\n</head>`,
        )
      : out
  }
  if (out.includes(SWIPER_CDN_CSS) && !out.includes(`<style ${MARKER}`)) {
    out = /<\/head>/i.test(out)
      ? out.replace(/<\/head>/i, `  ${buildLlmSwiperStyleBlock()}\n</head>`)
      : `${buildLlmSwiperStyleBlock()}\n${out}`
  }

  if (!out.includes(SWIPER_CDN_JS)) {
    out = /<\/body>/i.test(out)
      ? out.replace(
          /<\/body>/i,
          `  <script src="${SWIPER_CDN_JS}" defer></script>\n  <script src="${SPLIDE_CDN_JS}" defer></script>\n  ${buildLlmSwiperInlineScript()}\n  ${buildSplideInitInlineScript()}\n</body>`,
        )
      : `${out}\n<script src="${SWIPER_CDN_JS}" defer></script>\n<script src="${SPLIDE_CDN_JS}" defer></script>\n${buildLlmSwiperInlineScript()}\n${buildSplideInitInlineScript()}`
  } else {
    if (!out.includes(SPLIDE_CDN_JS)) {
      out = out.replace(
        new RegExp(
          `(<script[^>]+src=["']${esc(SWIPER_CDN_JS)}["'][^>]*>\\s*</script>)`,
          'i',
        ),
        `$1\n  <script src="${SPLIDE_CDN_JS}" defer></script>`,
      )
    }
    if (!out.includes(MARKER)) {
      out = /<\/body>/i.test(out)
        ? out.replace(/<\/body>/i, `  ${buildLlmSwiperInlineScript()}\n</body>`)
        : `${out}\n${buildLlmSwiperInlineScript()}`
    }
    if (!out.includes(MARKER_SPLIDE)) {
      out = /<\/body>/i.test(out)
        ? out.replace(
            /<\/body>/i,
            `  ${buildSplideInitInlineScript()}\n</body>`,
          )
        : `${out}\n${buildSplideInitInlineScript()}`
    }
  }
  return out
}
