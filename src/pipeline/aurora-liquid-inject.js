export const injectAuroraLiquidHero = (html, log) => {
  if (!html || html.includes('id="sf-aurora-grid"')) return html

  const heroOpenRe =
    /<section(?=[^>]*\bclass\s*=\s*["'][^"']*\bhero\b[^"']*["'])(?![^>]*\bid\s*=\s*["']sf-aurora-hero["'])[^>]*>/i
  if (!heroOpenRe.test(html)) {
    log?.('  homepage: aurora liquid skipped (no <section> with class token hero)')
    return html
  }

  const layers = `<div class="sf-aurora-liquid" aria-hidden="true"></div><canvas class="sf-aurora-canvas" id="sf-aurora-grid" aria-hidden="true"></canvas><div class="sf-aurora-halo" aria-hidden="true"></div>`

  let out = html.replace(heroOpenRe, (openTag) => {
    if (/\bid\s*=/.test(openTag)) {
      return openTag.replace(/\bid\s*=\s*["'][^"']*["']/i, 'id="sf-aurora-hero"')
    }
    return openTag.replace('<section', '<section id="sf-aurora-hero"')
  })
  if (/<div[^>]*\bhero-grid\b[^>]*>\s*<\/div>/i.test(out)) {
    out = out.replace(/<div[^>]*\bhero-grid\b[^>]*>\s*<\/div>/i, layers)
  } else {
    out = out.replace(/(<section[^>]*\bid\s*=\s*["']sf-aurora-hero["'][^>]*>)/i, `$1${layers}`)
  }

  if (!out.includes('id="sf-aurora-grid"')) {
    log?.('  homepage: aurora liquid skipped (could not insert canvas into hero)')
    return html
  }

  const auroraCss = `<style id="sf-aurora-liquid-styles">
#sf-aurora-hero{isolation:isolate;--mx:50%;--my:50%;--halo-opacity:0;--ease-out-expo:cubic-bezier(0.22,1,0.36,1)}
#sf-aurora-hero .hero-grid{display:none!important}
.sf-aurora-liquid{position:absolute;inset:-28%;z-index:-5;pointer-events:none;background:radial-gradient(ellipse 72% 58% at 16% 26%,rgba(124,92,245,.32),transparent 58%),radial-gradient(ellipse 68% 52% at 84% 74%,rgba(192,38,211,.16),transparent 54%),radial-gradient(ellipse 88% 48% at 46% 92%,rgba(20,184,166,.18),transparent 56%),radial-gradient(ellipse 55% 42% at 58% 12%,rgba(250,204,21,.09),transparent 52%);filter:blur(76px);opacity:.94;animation:sfHeroLiquid 26s ease-in-out infinite alternate}
@keyframes sfHeroLiquid{0%{transform:translate(-5%,-4%) scale(1) rotate(-1.2deg)}100%{transform:translate(6%,5%) scale(1.12) rotate(2.2deg)}}
#sf-aurora-hero::before{content:"";position:absolute;inset:0;z-index:-3;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M0 0H32M0 0V32' stroke='rgba(186,214,255,0.075)' stroke-width='1' stroke-dasharray='2 4' fill='none'/></svg>");background-repeat:repeat;background-position:top left}
#sf-aurora-hero::after{content:"";position:absolute;inset:0;z-index:-2;background:radial-gradient(ellipse 800px 400px at 50% 0%,rgba(124,92,245,.10),transparent 70%);pointer-events:none}
.sf-aurora-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block}
.sf-aurora-halo{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:var(--halo-opacity);transition:opacity 400ms var(--ease-out-expo);background:radial-gradient(circle 220px at var(--mx) var(--my),rgba(124,92,245,.18),rgba(124,92,245,.06) 60%,transparent 100%);mix-blend-mode:screen}
#sf-aurora-hero>*:not(.sf-aurora-liquid):not(.sf-aurora-canvas):not(.sf-aurora-halo){position:relative;z-index:1}
@media (prefers-reduced-motion:reduce){.sf-aurora-liquid,.sf-aurora-canvas,.sf-aurora-halo{display:none!important;opacity:0!important}}
</style>`

  if (!out.includes('</head>')) return html
  out = out.replace('</head>', `${auroraCss}</head>`)

  const auroraJs = `<script data-sf-aurora-liquid="1">
(function(){var hero=document.getElementById("sf-aurora-hero");var canvas=document.getElementById("sf-aurora-grid");if(!hero||!canvas)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var ctx=canvas.getContext("2d",{alpha:true});if(!ctx)return;var GRID_CELL=32,BASE_RADIUS=1.65,HOT_RADIUS=3.85,BASE_ALPHA=0.36,HOT_ALPHA=0.95,PUSH_RADIUS=180,PUSH_RADIUS_SQ=PUSH_RADIUS*PUSH_RADIUS,HOT_RADIUS_PX=80,HOT_RADIUS_SQ=HOT_RADIUS_PX*HOT_RADIUS_PX,MAX_PUSH=24,LINK_DIST=42,LINK_DIST_SQ=LINK_DIST*LINK_DIST,SPRING=0.06,DAMPING=0.86,REST_EPSILON=0.1,BASE_R=255,BASE_G=255,BASE_B=255,HOT_R=124,HOT_G=92,HOT_B=245,LINK_STROKE="rgba(186,220,255,0.14)";var dpr=Math.max(1,Math.min(window.devicePixelRatio||1,2)),width=0,height=0,particles=[],mouseX=-9999,mouseY=-9999,pointerInside=false,touchUntil=0,t0=performance.now()+Math.random()*1000;function rebuildGrid(){var rect=hero.getBoundingClientRect();width=Math.max(1,Math.floor(rect.width));height=Math.max(1,Math.floor(rect.height));dpr=Math.max(1,Math.min(window.devicePixelRatio||1,2));canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+"px";canvas.style.height=height+"px";ctx.setTransform(dpr,0,0,dpr,0,0);var cols=Math.max(2,Math.floor(width/GRID_CELL)),rows=Math.max(2,Math.floor(height/GRID_CELL)),offsetX=(width-(cols-1)*GRID_CELL)/2,offsetY=(height-(rows-1)*GRID_CELL)/2;particles=new Array(cols*rows);var i=0;for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var hx=offsetX+c*GRID_CELL,hy=offsetY+r*GRID_CELL;particles[i++]={hx:hx,hy:hy,x:hx,y:hy,vx:0,vy:0,phase:(c*12.9898+r*78.233)%(Math.PI*2),col:c,row:r}}}function updatePointer(clientX,clientY){var rect=hero.getBoundingClientRect();mouseX=clientX-rect.left;mouseY=clientY-rect.top;hero.style.setProperty("--mx",mouseX+"px");hero.style.setProperty("--my",mouseY+"px")}function onPointerMove(e){updatePointer(e.clientX,e.clientY)}function onPointerEnter(e){pointerInside=true;updatePointer(e.clientX,e.clientY);hero.style.setProperty("--halo-opacity","1")}function onPointerLeave(){pointerInside=false;mouseX=-9999;mouseY=-9999;hero.style.setProperty("--halo-opacity","0")}function onTouchStart(e){var touch=e.touches&&e.touches[0];if(!touch)return;updatePointer(touch.clientX,touch.clientY);touchUntil=performance.now()+900;hero.style.setProperty("--halo-opacity","1")}hero.addEventListener("pointermove",onPointerMove,{passive:true});hero.addEventListener("pointerenter",onPointerEnter);hero.addEventListener("pointerleave",onPointerLeave);hero.addEventListener("touchstart",onTouchStart,{passive:true});var resizeTimer=null;function scheduleRebuild(){if(resizeTimer)clearTimeout(resizeTimer);resizeTimer=setTimeout(rebuildGrid,120)}var ro=null;if(typeof ResizeObserver!=="undefined"){ro=new ResizeObserver(scheduleRebuild);ro.observe(hero)}else{window.addEventListener("resize",scheduleRebuild)}function maybeLine(a,b){var dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;if(d2<LINK_DIST_SQ){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}}function frame(now){var tSec=(now-t0)/1000,drawLinks=width>=768;if(touchUntil&&now>touchUntil){touchUntil=0;if(!pointerInside){hero.style.setProperty("--halo-opacity","0");mouseX=-9999;mouseY=-9999}}ctx.clearRect(0,0,width,height);for(var i=0;i<particles.length;i++){var p=particles[i];var ambX=Math.sin(tSec*0.78+p.phase)*1.15+Math.sin(tSec*0.31+p.phase*1.7)*0.75;var ambY=Math.cos(tSec*0.62+p.phase*1.3)*1.15+Math.cos(tSec*0.27+p.phase)*0.75;var targetHx=p.hx+ambX,targetHy=p.hy+ambY;p.vx+=(targetHx-p.x)*SPRING;p.vy+=(targetHy-p.y)*SPRING;var dx=p.x-mouseX,dy=p.y-mouseY,distSq=dx*dx+dy*dy,heat=0;if(distSq<PUSH_RADIUS_SQ&&distSq>0.01){var dist=Math.sqrt(distSq),falloff=1-dist/PUSH_RADIUS,force=falloff*falloff,push=Math.min(MAX_PUSH,force*MAX_PUSH)*0.22,nx=dx/dist,ny=dy/dist;p.vx+=nx*push;p.vy+=ny*push;if(distSq<HOT_RADIUS_SQ){heat=1-dist/HOT_RADIUS_PX;if(heat<0)heat=0}}p.vx*=DAMPING;p.vy*=DAMPING;p.x+=p.vx;p.y+=p.vy;p._heat=heat}if(drawLinks){ctx.strokeStyle=LINK_STROKE;ctx.lineWidth=1;ctx.beginPath();var cols=0;while(cols<particles.length&&particles[cols].row===0)cols++;for(var j=0;j<particles.length;j++){var a=particles[j];var rN=particles[j+1];if(rN&&rN.row===a.row)maybeLine(a,rN);var dN=particles[j+cols];if(dN)maybeLine(a,dN);var drN=particles[j+cols+1];if(drN&&drN.row===a.row+1)maybeLine(a,drN)}ctx.stroke()}for(var k=0;k<particles.length;k++){var pp=particles[k],h=pp._heat||0,radius=BASE_RADIUS+(HOT_RADIUS-BASE_RADIUS)*h,alpha=BASE_ALPHA+(HOT_ALPHA-BASE_ALPHA)*h;var cr=Math.round(BASE_R+(HOT_R-BASE_R)*h),cg=Math.round(BASE_G+(HOT_G-BASE_G)*h),cb=Math.round(BASE_B+(HOT_B-BASE_B)*h);ctx.fillStyle="rgba("+cr+","+cg+","+cb+","+alpha+")";ctx.beginPath();ctx.arc(pp.x,pp.y,radius,0,Math.PI*2);ctx.fill()}requestAnimationFrame(frame)}rebuildGrid();requestAnimationFrame(frame)})();
</script>`

  if (!out.includes('</body>')) return html
  out = out.replace('</body>', `${auroraJs}</body>`)

  log?.('  homepage: aurora liquid + dashed grid + particle field injected')
  return out
}
