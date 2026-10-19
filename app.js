const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* mobile menu */
const menu=$('#mobile-menu'),mbtn=$('.menu-btn');
function setMenu(open){menu.hidden=!open;mbtn.setAttribute('aria-expanded',String(open));mbtn.setAttribute('aria-label',open?'Tutup menu':'Buka menu');mbtn.innerHTML=open?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>'}
mbtn.addEventListener('click',()=>setMenu(menu.hidden));
$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

/* hero slideshow */
const slides=$$('.slide'),dots=$$('.dot');let hi=0,paused=reduced,hover=false,timer;
function showHero(n){hi=(n+slides.length)%slides.length;slides.forEach((s,i)=>{const on=i===hi;s.classList.toggle('active',on);s.setAttribute('aria-hidden',String(!on));s.inert=!on});
  dots.forEach((d,i)=>{d.classList.remove('on');d.removeAttribute('aria-current');if(i===hi){void d.offsetWidth;d.classList.add('on');d.setAttribute('aria-current','true')}});restart()}
function restart(){clearTimeout(timer);if(!paused)timer=setTimeout(()=>{if(hover||document.hidden)restart();else showHero(hi+1)},8000)}
$('.h-next').addEventListener('click',()=>showHero(hi+1));$('.h-prev').addEventListener('click',()=>showHero(hi-1));
dots.forEach((d,i)=>d.addEventListener('click',()=>showHero(i)));
const pbtn=$('.h-pause');function setPause(){$('.hero').classList.toggle('paused',paused);pbtn.setAttribute('aria-pressed',String(paused));pbtn.setAttribute('aria-label',paused?'Putar slideshow':'Jeda slideshow');pbtn.innerHTML=paused?'<i class="fa-solid fa-play" style="font-size:14px"></i>':'<i class="fa-solid fa-pause" style="font-size:14px"></i>';restart()}
pbtn.addEventListener('click',()=>{paused=!paused;setPause()});
$('.hero').addEventListener('mouseenter',()=>hover=true);$('.hero').addEventListener('mouseleave',()=>hover=false);
setPause();

/* event carousel (scroll-snap) */
const track=$('.ev-track');
function scrollEv(dir){const card=track.querySelector('.ev');track.scrollBy({left:dir*(card.getBoundingClientRect().width+24),behavior:reduced?'auto':'smooth'})}
$('.ev-next').addEventListener('click',()=>scrollEv(1));$('.ev-prev').addEventListener('click',()=>scrollEv(-1));

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
$$('.reveal').forEach(el=>io.observe(el));

/* nav highlight */
const links=$$('.nav a'),secs=links.map(a=>$(a.getAttribute('href')));
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(s=>s&&so.observe(s));

/* detail dialog */
const details={
gathering:{k:'DOKUMENTASI · 22 AGUSTUS 2026',t:'Gathering Kaum Pria',b:'Gathering Kaum Pria Integritas se-Banten berlangsung di Bukit Doa Salomo, Depok, dihadiri gereja-gereja GSJA dari seluruh wilayah Banten. Momen kebersamaan dan kekeluargaan: GSJA bersatu, gereja pasti maju!',m:'Bukit Doa Salomo, Depok · Jawa Barat'},
independence:{k:'DOKUMENTASI · 17 AGUSTUS 2026',t:'Kemerdekaan HUT ke-81',b:'Keseruan HUT RI ke-81 di GSJA City Blessing menambah keharmonisan dan kekeluargaan jemaat.',m:'GSJA City Blessing · Teluknaga'},
welcome:{k:'UNDANGAN UNTUK ANDA',t:'Sampai jumpa hari Minggu.',b:'Kami menantikan kehadiran Anda dan keluarga. Datang sebagaimana Anda adanya.',m:'Ibadah Raya · Minggu, 07.00 & 09.15 WIB'}};
const dlg=$('#dlg');
$$('[data-detail]').forEach(b=>b.addEventListener('click',()=>{const d=details[b.dataset.detail];$('#d-kicker').textContent=d.k;$('#d-title').textContent=d.t;$('#d-body').textContent=d.b;$('#d-meta').textContent=d.m;dlg.setAttribute('aria-labelledby','d-title');dlg.showModal()}));
$('.d-close').addEventListener('click',()=>dlg.close());$('#d-act').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()});

/* service links prefill contact form */
$$('.svc a[data-msg]').forEach(a=>a.addEventListener('click',()=>{$('#c-kat').value=a.dataset.cat;$('#c-pesan').value=a.dataset.msg}));

/* contact form -> WhatsApp sekretariat */
$('#contact-form').addEventListener('submit',e=>{e.preventDefault();
  const nama=$('#c-nama').value.trim(),pesan=$('#c-pesan').value.trim(),st=$('#c-status');
  if(!nama||!pesan){st.style.color='#ffb3c7';st.textContent='Mohon isi nama dan pesan terlebih dahulu.';return}
  const text=`Shalom, saya ${nama}.\nKategori: ${$('#c-kat').value}\n${$('#c-wa').value?'WhatsApp: '+$('#c-wa').value+'\n':''}${$('#c-email').value?'Email: '+$('#c-email').value+'\n':''}\n${pesan}`;
  st.style.color='';st.textContent='Membuka WhatsApp sekretariat…';
  window.open('https://wa.me/6281288175905?text='+encodeURIComponent(text),'_blank','noopener');
});
