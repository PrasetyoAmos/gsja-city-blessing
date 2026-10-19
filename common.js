const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.documentElement;

/* tema gelap / terang */
const tbtn=$('.theme-toggle');
function currentTheme(){return root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}
function paintToggle(){const t=currentTheme();tbtn.textContent=t==='dark'?'☀':'☾';tbtn.setAttribute('aria-label',t==='dark'?'Ganti ke mode terang':'Ganti ke mode gelap');tbtn.title=tbtn.getAttribute('aria-label')}
tbtn.addEventListener('click',()=>{const n=currentTheme()==='dark'?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('gsja-theme',n)}catch(e){}paintToggle()});
paintToggle();

/* menu mobile */
const menu=$('#mobile-menu'),mbtn=$('.menu-button');
function setMenu(o){menu.hidden=!o;mbtn.setAttribute('aria-expanded',String(o));mbtn.setAttribute('aria-label',o?'Tutup menu':'Buka menu');mbtn.textContent=o?'×':'☰';document.body.style.overflow=o?'hidden':''}
mbtn.addEventListener('click',()=>setMenu(menu.hidden));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
matchMedia('(min-width:1021px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});

/* header: sembunyi saat scroll turun, progress bar */
const header=$('.header'),bar=$('.progress');let lastY=scrollY,ticking=false;
function onScroll(){const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  if(bar)bar.style.transform=`scaleX(${max>0?Math.min(1,y/max):0})`;
  header.classList.toggle('small',y>40);
  if(!reduced&&menu.hidden){if(y>lastY+6&&y>260)header.classList.add('hide');else if(y<lastY-6||y<260)header.classList.remove('hide')}
  lastY=y;ticking=false}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();

/* reveal dengan jeda bertahap */
$$('[data-stagger]').forEach(c=>[...c.children].forEach((el,i)=>{el.style.transitionDelay=(i*90)+'ms'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -6% 0px'});
$$('.reveal,.img-reveal').forEach(el=>io.observe(el));
