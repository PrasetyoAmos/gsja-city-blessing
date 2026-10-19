/* hero slideshow */
const slides=$$('.hero-slide'),dots=$$('.hero-dot');let hi=0,paused=reduced,hover=false,timer;
function showHero(n){hi=(n+slides.length)%slides.length;slides.forEach((s,i)=>{const on=i===hi;s.classList.toggle('active',on);s.setAttribute('aria-hidden',String(!on));s.inert=!on;dots[i].classList.toggle('selected',on);if(on)dots[i].setAttribute('aria-current','true');else dots[i].removeAttribute('aria-current')});restart()}
function restart(){clearTimeout(timer);if(!paused)timer=setTimeout(()=>{if(hover||document.hidden)restart();else showHero(hi+1)},9000)}
$('.hero-next').addEventListener('click',()=>showHero(hi+1));
dots.forEach((d,i)=>d.addEventListener('click',()=>showHero(i)));
const mc=$('.motion-control');
function setMotion(){document.body.classList.toggle('paused',paused);mc.textContent=paused?'▶':'Ⅱ';mc.setAttribute('aria-label',paused?'Putar animasi':'Jeda animasi');mc.setAttribute('aria-pressed',String(paused));restart()}
mc.addEventListener('click',()=>{paused=!paused;setMotion()});
$('.hero').addEventListener('mouseenter',()=>hover=true);$('.hero').addEventListener('mouseleave',()=>hover=false);
setMotion();

/* carousel kegiatan */
const track=$('.ev-track');
function scrollEv(d){const c=track.querySelector('.ev');track.scrollBy({left:d*(c.getBoundingClientRect().width+24),behavior:reduced?'auto':'smooth'})}
$('.ev-next').addEventListener('click',()=>scrollEv(1));$('.ev-prev').addEventListener('click',()=>scrollEv(-1));
