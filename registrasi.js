const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

/* mobile menu */
const menu=$('#mobile-menu'),mbtn=$('.menu-btn');
function setMenu(o){menu.hidden=!o;mbtn.setAttribute('aria-expanded',String(o));mbtn.innerHTML=o?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>'}
mbtn.addEventListener('click',()=>setMenu(menu.hidden));

/* data wilayah CONTOH (di web asli dimuat dari server) */
const WIL={
'Banten':{'Kab. Tangerang':{'Teluknaga':['Kampung Melayu Barat','Kampung Melayu Timur','Pangkalan','Tegal Angus','Muara'],'Kosambi':['Dadap','Belimbing','Salembaran Jaya'],'Kemiri':['Kemiri','Klebet','Patramanggala']},'Kota Tangerang':{'Neglasari':['Neglasari','Karang Sari','Mekar Sari'],'Cipondoh':['Cipondoh','Poris Plawad','Gondrong']}},
'DKI Jakarta':{'Jakarta Utara':{'Penjaringan':['Kapuk Muara','Pluit','Penjaringan'],'Kelapa Gading':['Kelapa Gading Barat','Kelapa Gading Timur']},'Jakarta Barat':{'Kembangan':['Joglo','Meruya Utara','Srengseng']}},
'Jawa Barat':{'Kota Depok':{'Pancoran Mas':['Pancoran Mas','Depok','Mampang'],'Sawangan':['Sawangan','Bedahan','Pasir Putih']},'Kota Bekasi':{'Bekasi Barat':['Bintara','Kota Baru','Kranji']}}};
const fill=(sel,items,ph)=>{sel.innerHTML=`<option value="">${ph}</option>`+items.map(i=>`<option>${i}</option>`).join('');sel.disabled=!items.length};
const prov=$('#prov'),kota=$('#kota'),kec=$('#kec'),kel=$('#kel');
setTimeout(()=>fill(prov,Object.keys(WIL),'Pilih Provinsi'),250);
prov.addEventListener('change',()=>{fill(kota,prov.value?Object.keys(WIL[prov.value]):[],prov.value?'Pilih Kabupaten / Kota':'Pilih Provinsi Dahulu');fill(kec,[],'Pilih Kota Dahulu');fill(kel,[],'Pilih Kecamatan Dahulu')});
kota.addEventListener('change',()=>{fill(kec,kota.value?Object.keys(WIL[prov.value][kota.value]):[],kota.value?'Pilih Kecamatan':'Pilih Kota Dahulu');fill(kel,[],'Pilih Kecamatan Dahulu')});
kec.addEventListener('change',()=>fill(kel,kec.value?WIL[prov.value][kota.value][kec.value]:[],kec.value?'Pilih Kelurahan / Desa':'Pilih Kecamatan Dahulu'));

/* foto profil */
$('#foto').addEventListener('change',e=>{const f=e.target.files[0],h=$('#foto-hint'),p=$('#photo-prev');
  if(!f)return;
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>5*1024*1024){e.target.value='';h.style.color='#d6336c';h.textContent='File harus JPG, PNG, atau WEBP dan maksimal 5 MB.';p.innerHTML='<i class="fa-solid fa-user"></i>';return}
  h.style.color='';h.textContent=f.name;const r=new FileReader();r.onload=()=>{p.innerHTML='';const i=new Image();i.alt='Pratinjau foto profil';i.src=r.result;p.appendChild(i)};r.readAsDataURL(f)});

/* baris dinamis */
const MINAT=['Musik / Worship','Multimedia','Usher / Penyambut','Kids / Sekolah Minggu','Youth & Campus','Doa & Konseling','Dokumentasi','Konsumsi','Lainnya'];
const HUB=['Suami / Istri','Anak','Orang Tua','Saudara'];
function addRow(listId,html,cls=''){const d=document.createElement('div');d.className='row-card '+cls;d.innerHTML=html+'<button type="button" class="rm" aria-label="Hapus baris"><i class="fa-solid fa-trash-can"></i></button>';d.querySelector('.rm').addEventListener('click',()=>d.remove());$(listId).appendChild(d);d.querySelector('input,select').focus()}
$('#add-fam').addEventListener('click',()=>addRow('#fam-list',`<div><label>Nama</label><input name="fam_nama[]" placeholder="Nama lengkap"></div><div><label>Hubungan</label><select name="fam_hub[]">${HUB.map(h=>`<option>${h}</option>`).join('')}</select></div><div><label>Tanggal Lahir</label><input type="date" name="fam_tgl[]"></div>`));
$('#add-min').addEventListener('click',()=>addRow('#min-list',`<div><label>Bidang</label><select name="min_bidang[]">${MINAT.map(h=>`<option>${h}</option>`).join('')}</select></div><div><label>Keterangan / talenta</label><input name="min_ket[]" placeholder="Mis. gitar, desain, fotografi"></div>`,'minat'));

/* validasi & kirim */
const form=$('#reg-form');
form.addEventListener('submit',e=>{e.preventDefault();
  let first=null;$$('[required]').forEach(el=>{const bad=!el.value.trim()||(el.type==='email'&&!/^\S+@\S+\.\S+$/.test(el.value));el.classList.toggle('bad',bad);if(bad&&!first)first=el});
  const nik=$('#nik');if(nik.value&&!/^\d{16}$/.test(nik.value)){nik.classList.add('bad');first=first||nik}else nik.classList.remove('bad');
  if(first){first.focus();first.scrollIntoView({block:'center',behavior:'smooth'});return}
  $('#ok-name').textContent=$('#nama').value.trim();$('#ok-mail').textContent=$('#email').value.trim();
  form.hidden=true;$('#success').hidden=false;$('#success').scrollIntoView({block:'center'});
});
form.addEventListener('input',e=>e.target.classList.remove('bad'));
