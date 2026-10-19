const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* tema gelap / terang */
const root=document.documentElement,tbtn=$('.theme-toggle');
const sysDark=()=>matchMedia('(prefers-color-scheme: dark)').matches;
function currentTheme(){return root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}
function paintToggle(){const t=currentTheme();tbtn.textContent=t==='dark'?'☀':'☾';tbtn.setAttribute('aria-label',t==='dark'?'Ganti ke mode terang':'Ganti ke mode gelap');tbtn.title=tbtn.getAttribute('aria-label')}
tbtn.addEventListener('click',()=>{const n=currentTheme()==='dark'?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('gsja-theme',n)}catch(e){}paintToggle()});
paintToggle();
/* menu mobile */
const menu=$('#mobile-menu'),mbtn=$('.menu-button');
function setMenu(o){menu.hidden=!o;mbtn.setAttribute('aria-expanded',String(o));mbtn.setAttribute('aria-label',o?'Tutup menu':'Buka menu');mbtn.textContent=o?'×':'☰'}
mbtn.addEventListener('click',()=>setMenu(menu.hidden));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
