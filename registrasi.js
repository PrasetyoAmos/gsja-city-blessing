/* data wilayah CONTOH: hanya cadangan bila berkas wilayah/ gagal dimuat */
const WIL={
'Banten':{'Kab. Tangerang':{'Teluknaga':['Kampung Melayu Barat','Kampung Melayu Timur','Pangkalan','Tegal Angus','Muara'],'Kosambi':['Dadap','Belimbing','Salembaran Jaya'],'Kemiri':['Kemiri','Klebet','Patramanggala']},'Kota Tangerang':{'Neglasari':['Neglasari','Karang Sari','Mekar Sari'],'Cipondoh':['Cipondoh','Poris Plawad','Gondrong']}},
'DKI Jakarta':{'Jakarta Utara':{'Penjaringan':['Kapuk Muara','Pluit','Penjaringan'],'Kelapa Gading':['Kelapa Gading Barat','Kelapa Gading Timur']},'Jakarta Barat':{'Kembangan':['Joglo','Meruya Utara','Srengseng']}},
'Jawa Barat':{'Kota Depok':{'Pancoran Mas':['Pancoran Mas','Depok','Mampang'],'Sawangan':['Sawangan','Bedahan','Pasir Putih']},'Kota Bekasi':{'Bekasi Barat':['Bintara','Kota Baru','Kranji']}}};

const fill=(sel,items,ph)=>{sel.innerHTML=`<option value="">${ph}</option>`+items.map(i=>{const [c,n]=Array.isArray(i)?i:[null,i];return `<option value="${n}"${c?` data-code="${c}"`:''}>${n}</option>`}).join('');sel.disabled=!items.length};
const prov=$('#prov'),kota=$('#kota'),kec=$('#kec'),kel=$('#kel');
const OTHER='Lainnya (tulis di alamat lengkap)';
const cache={};let sample=false,curK=[];
const getJ=async f=>cache[f]||(cache[f]=await (await fetch('wilayah/'+f)).json());
const code=s=>s.selectedOptions[0]?.dataset.code;
(async()=>{try{fill(prov,await getJ('p.json'),'Pilih Provinsi')}catch(e){sample=true;fill(prov,Object.keys(WIL),'Pilih Provinsi')}})();
prov.addEventListener('change',async()=>{fill(kec,[],'Pilih Kota Dahulu');fill(kel,[],'Pilih Kecamatan Dahulu');
  if(!prov.value){fill(kota,[],'Pilih Provinsi Dahulu');return}
  if(sample){fill(kota,Object.keys(WIL[prov.value]),'Pilih Kabupaten / Kota');return}
  fill(kota,[],'Memuat…');try{curK=await getJ('k-'+code(prov)+'.json');fill(kota,curK.map(k=>[k[0],k[1]]),'Pilih Kabupaten / Kota')}catch(e){fill(kota,[],'Gagal memuat, muat ulang halaman')}});
kota.addEventListener('change',()=>{fill(kel,[],'Pilih Kecamatan Dahulu');
  if(!kota.value){fill(kec,[],'Pilih Kota Dahulu');return}
  if(sample){fill(kec,Object.keys(WIL[prov.value][kota.value]),'Pilih Kecamatan');return}
  const k=curK.find(x=>x[0]===code(kota));fill(kec,k?k[2]:[],'Pilih Kecamatan')});
kec.addEventListener('change',async()=>{
  if(!kec.value){fill(kel,[],'Pilih Kecamatan Dahulu');return}
  if(sample){fill(kel,WIL[prov.value][kota.value][kec.value],'Pilih Kelurahan / Desa');return}
  fill(kel,[],'Memuat…');try{const d=await getJ('d-'+code(kota)+'.json');fill(kel,(d[code(kec)]||[]).concat([OTHER]),'Pilih Kelurahan / Desa')}catch(e){fill(kel,[OTHER],'Pilih Kelurahan / Desa')}});

/* foto profil */
$('#foto').addEventListener('change',e=>{const f=e.target.files[0],h=$('#foto-hint'),p=$('#photo-prev');
  if(!f)return;
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)||f.size>5*1024*1024){e.target.value='';h.style.color='#d6336c';h.textContent='File harus JPG, PNG, atau WEBP dan maksimal 5 MB.';p.textContent='☺';return}
  h.style.color='';h.textContent=f.name;const r=new FileReader();r.onload=()=>{p.innerHTML='';const i=new Image();i.alt='Pratinjau foto profil';i.src=r.result;p.appendChild(i)};r.readAsDataURL(f)});

/* baris dinamis */
const MINAT=['Musik / Worship','Multimedia','Usher / Penyambut','Kids / Sekolah Minggu','Youth & Campus','Doa & Konseling','Dokumentasi','Konsumsi','Lainnya'];
const HUB=['Suami / Istri','Anak','Orang Tua','Saudara'];
function addRow(listId,html,cls=''){const d=document.createElement('div');d.className='row-card '+cls;d.innerHTML=html+'<button type="button" class="rm" aria-label="Hapus baris"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg></button>';d.querySelector('.rm').addEventListener('click',()=>d.remove());$(listId).appendChild(d);d.querySelector('input,select').focus()}
$('#add-fam').addEventListener('click',()=>addRow('#fam-list',`<div><label>Nama</label><input name="fam_nama[]" placeholder="Nama lengkap"></div><div><label>Hubungan</label><select name="fam_hub[]">${HUB.map(h=>`<option>${h}</option>`).join('')}</select></div><div><label>Tanggal Lahir</label><input type="date" name="fam_tgl[]"></div>`));
$('#add-min').addEventListener('click',()=>addRow('#min-list',`<div><label>Bidang</label><select name="min_bidang[]">${MINAT.map(h=>`<option>${h}</option>`).join('')}</select></div><div><label>Keterangan / talenta</label><input name="min_ket[]" placeholder="Mis. gitar, desain, fotografi"></div>`,'minat'));

/* validasi & kirim ke Google Sheets (Apps Script) */
const form=$('#reg-form'),stat=$('#reg-status'),CFG=window.GSJA_CONFIG||{};
function resizePhoto(file,max=800){return new Promise(res=>{if(!file)return res('');const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.onerror=()=>res('');im.src=r.result};r.onerror=()=>res('');r.readAsDataURL(file)})}
const vals=n=>[...form.querySelectorAll(`[name="${n}"]`)].map(e=>e.value.trim());
form.addEventListener('submit',async e=>{e.preventDefault();
  let first=null;$$('[required]').forEach(el=>{const bad=!el.value.trim()||(el.type==='email'&&!/^\S+@\S+\.\S+$/.test(el.value));el.classList.toggle('bad',bad);if(bad&&!first)first=el});
  const nik=$('#nik');if(nik.value&&!/^\d{16}$/.test(nik.value)){nik.classList.add('bad');first=first||nik}else nik.classList.remove('bad');
  if(first){first.focus();first.scrollIntoView({block:'center',behavior:'smooth'});return}
  const btn=form.querySelector('[type=submit]');
  const done=(demo)=>{$('#ok-name').textContent=$('#nama').value.trim();$('#ok-mail').textContent=$('#email').value.trim();$('#demo-note').hidden=!demo;form.hidden=true;$('#success').hidden=false;$('#success').scrollIntoView({block:'center'})};
  if(!CFG.regEndpoint){done(true);return}
  btn.disabled=true;btn.textContent='Mengirim…';stat.textContent='';stat.style.color='';
  try{
    const data={nama:$('#nama').value.trim(),nik:nik.value.trim(),jk:$('#jk').value,wa:$('#wa').value.trim(),tl:$('#tl').value.trim(),tgl:$('#tgl').value,email:$('#email').value.trim(),
      prov:prov.value,kota:kota.value,kec:kec.value,kel:kel.value,alamat:$('#alamat').value.trim(),
      keluarga:vals('fam_nama[]').map((n,i)=>({nama:n,hubungan:vals('fam_hub[]')[i],tgl:vals('fam_tgl[]')[i]})).filter(x=>x.nama),
      minat:vals('min_bidang[]').map((b,i)=>({bidang:b,keterangan:vals('min_ket[]')[i]||''})),
      foto:await resizePhoto($('#foto').files[0]),website:''};
    const r=await fetch(CFG.regEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});
    const j=await r.json();
    if(j.ok)done(false);
    else{stat.style.color='var(--error)';stat.textContent=j.error==='duplicate'?'NIK atau email ini sudah terdaftar. Hubungi admin bila perlu perubahan data.':'Pendaftaran gagal dikirim. Coba lagi sebentar lagi.'}
  }catch(err){stat.style.color='var(--error)';stat.textContent='Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.'}
  btn.disabled=false;btn.textContent='Kirim Pendaftaran';
});
form.addEventListener('input',e=>e.target.classList.remove('bad'));
