/* CMS GSJA City Blessing — panel admin tanpa server.
   Konten disimpan sebagai file JSON di repo GitHub lewat GitHub API (token pribadi),
   lalu situs membaca file tersebut. Setiap publikasi = satu commit. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  kids.flat(9).forEach(x => { if (x != null && x !== false) e.append(x.nodeType ? x : document.createTextNode(x)); });
  return e;
};
const LANGS = [['id', 'Indonesia'], ['en', 'English'], ['zh', '中文'], ['ko', '한국어']];
const PAGES = ['index.html', 'ibadah.html', 'kegiatan.html', 'tentang.html', 'kontak.html', 'generasi.html', 'registrasi.html'];
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/* ---------- Skema konten ---------- */
const SCHEMA = {
  beranda: {
    title: 'Beranda', kind: 'single', page: 'index.html', icon: 'home',
    hint: 'Teks slide utama, bar info biru, dan teks berjalan di halaman depan.',
    fields: [
      { k: 'slides', type: 'list', label: 'Slide utama', item: 'Slide', fixed: true, fields: [
        { k: 'eyebrow', label: 'Teks kecil di atas judul', i18n: 1 },
        { k: 'baris1', label: 'Judul — baris 1', i18n: 1 }, { k: 'baris2', label: 'Judul — baris 2', i18n: 1 },
        { k: 'sub', label: 'Kalimat pendukung', i18n: 1 },
        { k: 'tombol1', label: 'Tombol 1 — teks', i18n: 1 }, { k: 'link1', label: 'Tombol 1 — tautan', type: 'link' },
        { k: 'tombol2', label: 'Tombol 2 — teks', i18n: 1 }, { k: 'link2', label: 'Tombol 2 — tautan', type: 'link' },
        { k: 'foto', label: 'Foto latar (khusus slide ke-2; slide 1 memakai montase tetap)', type: 'image' }] },
      { k: 'quick', type: 'list', label: 'Info cepat (bar biru di bawah slide)', item: 'Info', max: 4, fields: [
        { k: 'label', label: 'Judul kecil', i18n: 1 }, { k: 'nilai', label: 'Isi', i18n: 1 }] },
      { k: 'kata', type: 'list', label: 'Teks berjalan (marquee)', item: 'Teks', fields: [{ k: 'teks', label: 'Teks', i18n: 1 }] }]
  },
  jadwal: {
    title: 'Jadwal Ibadah', kind: 'list', page: 'ibadah.html', icon: 'clock', item: 'jadwal',
    hint: 'Tampil di halaman Ibadah, dan di Beranda bila “Tampilkan di Beranda” aktif.',
    titleOf: i => i.nama, subOf: i => `${i.hari || ''} · ${i.jam || ''} WIB${i.lokasi ? ' · ' + i.lokasi : ''}`,
    fields: [
      { k: 'nama', label: 'Nama ibadah', req: 1, i18n: 1, ph: 'Mis. Ibadah Raya I' },
      { k: 'hari', label: 'Hari', type: 'select', options: DAYS, req: 1 },
      { k: 'jam', label: 'Jam (WIB)', req: 1, ph: '07.00', help: 'Tulis dengan titik, mis. 07.00' },
      { k: 'lokasi', label: 'Lokasi', i18n: 1, ph: 'GSJA City Blessing, lantai 2' },
      { k: 'pelayan', label: 'Pelayan / penanggung jawab', i18n: 1 },
      { k: 'ket', label: 'Keterangan singkat', i18n: 1 },
      { k: 'link', label: 'Tautan di Beranda', type: 'link', help: 'Halaman yang dibuka saat baris ini diklik' },
      { k: 'beranda', label: 'Tampilkan di Beranda', type: 'bool', def: true },
      { k: 'nama_beranda', label: 'Nama khusus di Beranda (opsional)', i18n: 1, adv: 1 },
      { k: 'jam_beranda', label: 'Jam khusus di Beranda (opsional)', i18n: 1, adv: 1, ph: '07.00 & 09.15' },
      { k: 'ket_beranda', label: 'Keterangan khusus di Beranda (opsional)', i18n: 1, adv: 1 }]
  },
  kegiatan: {
    title: 'Kegiatan & Berita', kind: 'list', page: 'kegiatan.html', icon: 'news', item: 'kegiatan', sort: 'tanggal',
    hint: 'Dokumentasi kegiatan. Urutan tampil otomatis dari tanggal terbaru.',
    titleOf: i => i.judul, subOf: i => `${i.tanggal || ''}${i.tempat ? ' · ' + i.tempat : ''}`, thumbOf: i => i.foto,
    badgeOf: i => i.terbit === false ? 'Draf' : '',
    fields: [
      { k: 'judul', label: 'Judul', req: 1, i18n: 1 },
      { k: 'tanggal', label: 'Tanggal', type: 'date', req: 1 },
      { k: 'tempat', label: 'Tempat', i18n: 1, ph: 'Mis. GSJA City Blessing' },
      { k: 'kategori', label: 'Label kategori', i18n: 1, ph: 'KEBERSAMAAN', help: 'Tampil sebagai label kecil di atas foto' },
      { k: 'foto', label: 'Foto sampul', type: 'image' },
      { k: 'isi', label: 'Isi berita', type: 'textarea', rows: 9, i18n: 1, help: 'Pisahkan paragraf dengan satu baris kosong.' },
      { k: 'terbit', label: 'Terbitkan (matikan untuk menyimpan sebagai draf)', type: 'bool', def: true },
      { k: 'beranda', label: 'Tampilkan di slider Beranda', type: 'bool', def: true },
      { k: 'judul_beranda', label: 'Judul khusus di slider Beranda (opsional)', i18n: 1, adv: 1 },
      { k: 'alt', label: 'Deskripsi foto di slider (opsional)', i18n: 1, adv: 1 }]
  },
  tim: {
    title: 'Tim Pelayan', kind: 'list', page: 'tentang.html', icon: 'people', item: 'pelayan',
    hint: 'Struktur organisasi di halaman Tentang Kami. Urutan di sini = urutan tampil.',
    titleOf: i => i.nama, subOf: i => i.jabatan, thumbOf: i => i.foto,
    fields: [
      { k: 'nama', label: 'Nama', req: 1, i18n: 1 },
      { k: 'jabatan', label: 'Jabatan', i18n: 1, ph: 'Mis. Gembala Sidang' },
      { k: 'bio', label: 'Keterangan singkat', type: 'textarea', rows: 3, i18n: 1 },
      { k: 'foto', label: 'Foto', type: 'image', help: 'Kosongkan untuk menampilkan inisial.' },
      { k: 'inisial', label: 'Inisial (bila tanpa foto)', ph: 'SR', adv: 1 }]
  },
  tentang: {
    title: 'Halaman Tentang', kind: 'single', page: 'tentang.html', icon: 'info',
    hint: 'Profil, visi, misi, dan perjalanan gereja.',
    fields: [
      { k: 'profil', label: 'Profil gereja', type: 'textarea', rows: 8, i18n: 1, help: 'Pisahkan paragraf dengan satu baris kosong.' },
      { k: 'visi', label: 'Visi', type: 'textarea', rows: 3, i18n: 1 },
      { k: 'misi', label: 'Misi', type: 'textarea', rows: 3, i18n: 1 },
      { k: 'timeline', type: 'list', label: 'Perjalanan (timeline)', item: 'Tonggak', fields: [
        { k: 'tahun', label: 'Tahun / waktu', i18n: 1, ph: '2026' }, { k: 'judul', label: 'Judul', i18n: 1 },
        { k: 'isi', label: 'Keterangan', type: 'textarea', rows: 3, i18n: 1 }] }]
  },
  situs: {
    title: 'Kontak & Situs', kind: 'single', page: 'kontak.html', icon: 'pin',
    hint: 'Alamat, nomor WhatsApp, email, media sosial, dan pesan pembuka WhatsApp. Dipakai di footer, Kontak, dan Beranda.',
    fields: [
      { k: 'alamat', label: 'Alamat (jalan)', i18n: 1 }, { k: 'kota', label: 'Kota / kode pos', i18n: 1 },
      { k: 'wa_admin', label: 'WhatsApp admin — angka saja (kode negara 62)', ph: '6285717547266', help: 'Dipakai untuk tautan wa.me. Tanpa +, spasi, atau 0 di depan.' },
      { k: 'wa_admin_tampil', label: 'WhatsApp admin — cara tampil', ph: '+62 857 1754 7266' },
      { k: 'wa_sekretariat', label: 'WhatsApp sekretariat — angka saja', ph: '6281288175905' },
      { k: 'wa_sekretariat_tampil', label: 'WhatsApp sekretariat — cara tampil', ph: '+62 812 8817 5905' },
      { k: 'email', label: 'Email' },
      { k: 'instagram', label: 'Tautan Instagram', ph: 'https://www.instagram.com/…' },
      { k: 'youtube', label: 'Tautan YouTube', ph: 'https://www.youtube.com/@…' },
      { k: 'maps', label: 'Tautan Google Maps (petunjuk arah)', ph: 'https://maps.app.goo.gl/…' },
      { k: 'pesan_doa', label: 'Pesan pembuka WhatsApp — dukungan doa', type: 'textarea', rows: 3 },
      { k: 'pesan_info', label: 'Pesan pembuka WhatsApp — pertanyaan umum', type: 'textarea', rows: 3 },
      { k: 'pesan_kunjungan', label: 'Pesan pembuka WhatsApp — ingin berkunjung', type: 'textarea', rows: 3 }]
  }
};
const NAMES = Object.keys(SCHEMA);
const ICONS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  news: 'M5 4h11l3 3v13H5zM8 9h8M8 13h8M8 17h5', people: 'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 19v-1a3 3 0 0 0-2-2.8M16 5.2a3 3 0 0 1 0 5.6',
  info: 'M12 8h.01M11 12h1v5h1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  image: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9h.01', hist: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 8v5l3 2', dash: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  plus: 'M12 5v14M5 12h14', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6',
  copy: 'M9 9h10v11H9zM5 15V4h10', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  drag: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01', up2: 'M12 16V4M7 9l5-5 5 5M5 20h14', check: 'M5 12.5l4.5 4.5L19 7.5', sun: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', moon: 'M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z'
};
const ico = (n, s = 18) => h('span', { class: 'ico', html: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]}"/></svg>` });

/* ---------- State ---------- */
const S = { cfg: null, head: null, treeSha: null, tree: [], base: {}, shas: {}, data: {}, media: {}, view: { name: 'dash' }, lang: 'id', user: null, history: null };
let lsCfg = null;
const store = () => (localStorage.getItem('cms-remember') === '0' ? sessionStorage : localStorage);
const lsGet = (k) => { try { return store().getItem(k) || localStorage.getItem(k); } catch (e) { return null; } };
const draftKey = () => `cms-draft:${S.cfg.owner}/${S.cfg.repo}@${S.cfg.branch}`;
const canon = (o) => JSON.stringify(o);
const pretty = (o) => JSON.stringify(o, null, 2) + '\n';
const slug = (t) => String(t || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 48) || 'item';
const uid = () => Math.random().toString(36).slice(2, 6);
const toast = (msg, kind = '') => {
  const t = h('div', { class: 'toast ' + kind, role: 'status' }, msg); $('#toasts').append(t);
  setTimeout(() => t.classList.add('out'), kind === 'err' ? 6500 : 2800); setTimeout(() => t.remove(), kind === 'err' ? 7000 : 3200);
};

/* ---------- IndexedDB kecil untuk foto yang belum dipublikasikan ---------- */
const idb = {
  db: null,
  open() { return this.db || (this.db = new Promise((res, rej) => { const r = indexedDB.open('cms-media', 1); r.onupgradeneeded = () => r.result.createObjectStore('m'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('m', mode), q = fn(t.objectStore('m')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); },
  set(k, v) { return this.tx('readwrite', s => s.put(v, k)).catch(() => {}); },
  del(k) { return this.tx('readwrite', s => s.delete(k)).catch(() => {}); },
  all() { return this.open().then(db => new Promise(res => { const out = {}, t = db.transaction('m'), c = t.objectStore('m').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; c.onerror = () => res({}); })).catch(() => ({}));
  }
};

/* ---------- GitHub API ---------- */
class GhError extends Error { constructor(msg, status) { super(msg); this.status = status; } }
async function gh(path, opt = {}) {
  const { owner, repo, token } = S.cfg;
  const url = path.startsWith('http') ? path : `https://api.github.com/repos/${owner}/${repo}${path}`;
  let r;
  try {
    r = await fetch(url, { method: opt.method || 'GET', headers: { Authorization: 'Bearer ' + token, Accept: opt.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opt.body ? { 'Content-Type': 'application/json' } : {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined, cache: 'no-store' });
  } catch (e) { throw new GhError('Tidak bisa terhubung ke GitHub. Periksa koneksi internet.', 0); }
  if (!r.ok) {
    let m = ''; try { m = (await r.json()).message || ''; } catch (e) {}
    if (r.status === 401) throw new GhError('Token tidak valid atau sudah kedaluwarsa. Buat token baru lalu masuk lagi.', 401);
    if (r.status === 403) throw new GhError('Token tidak punya izin menulis ke repo ini (butuh “Contents: Read and write”), atau batas permintaan GitHub tercapai.', 403);
    if (r.status === 404) throw new GhError('Repo/branch/berkas tidak ditemukan, atau token tidak punya akses ke repo ini.', 404);
    if (r.status === 409 || r.status === 422) throw new GhError('Konflik saat menyimpan: ' + m, r.status);
    throw new GhError(`GitHub ${r.status}: ${m}`, r.status);
  }
  return opt.raw ? r.text() : r.json();
}
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };

async function loadRemote() {
  const repo = await gh('');
  if (repo.permissions && repo.permissions.push === false) throw new GhError('Akun/token ini tidak punya izin menulis ke repo.', 403);
  S.repoInfo = repo;
  const ref = await gh(`/git/ref/heads/${S.cfg.branch}`);
  S.head = ref.object.sha;
  const commit = await gh(`/git/commits/${S.head}`);
  S.treeSha = commit.tree.sha;
  const tree = await gh(`/git/trees/${S.treeSha}?recursive=1`);
  S.tree = tree.tree.filter(t => t.type === 'blob');
  S.shas = {};
  S.tree.forEach(t => { S.shas[t.path] = t.sha; });
  for (const n of NAMES) {
    const p = `content/${n}.json`;
    if (!S.shas[p]) throw new GhError(`Berkas ${p} belum ada di repo. Unggah versi situs terbaru (yang berisi folder content/) terlebih dulu.`, 404);
    const text = await gh(`/contents/${p}?ref=${S.head}`, { raw: true });
    S.base[n] = canon(JSON.parse(text));
    S.data[n] = JSON.parse(text);
  }
}

/* ---------- Draf lokal ---------- */
let saveT;
function saveDraft() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try {
      const d = {};
      NAMES.forEach(n => { if (canon(S.data[n]) !== S.base[n]) d[n] = { base: S.base[n], data: S.data[n] }; });
      if (Object.keys(d).length) localStorage.setItem(draftKey(), JSON.stringify(d)); else localStorage.removeItem(draftKey());
    } catch (e) {}
  }, 400);
}
async function restoreDraft() {
  let d = null; try { d = JSON.parse(localStorage.getItem(draftKey()) || 'null'); } catch (e) {}
  let n = 0, dropped = 0;
  if (d) NAMES.forEach(k => { if (d[k]) { if (d[k].base === S.base[k]) { S.data[k] = d[k].data; n++; } else dropped++; } });
  const m = await idb.all();
  Object.entries(m).forEach(([p, v]) => { if (v && v.b64) S.media[p] = v; });
  if (n) toast(`Draf yang belum dipublikasikan dipulihkan (${n} bagian).`);
  if (dropped) toast(`${dropped} draf dibuang karena berkas sudah berubah di GitHub.`, 'err');
}
const changed = () => NAMES.filter(n => canon(S.data[n]) !== S.base[n]);
function usedMedia() {
  const used = new Set(), walk = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk); for (const [k, v] of Object.entries(o)) { if (k === 'foto' && typeof v === 'string' && S.media[v]) used.add(v); else walk(v); } };
  walk(S.data); return [...used];
}
function touch() {
  saveDraft(); updateChg();
  if ($('#dlg-preview').open) refreshPreview();
}
function updateChg() {
  const n = changed().length + usedMedia().length * 0;
  const b = $('#chg'); b.textContent = n; b.hidden = !n;
  $('#btn-publish').disabled = !n;
  $$('.nav-dot').forEach(d => { d.hidden = !changed().includes(d.dataset.n); });
}

/* ---------- Nilai & terjemahan ---------- */
const getV = (rec, k, lang) => (lang === 'id' ? (rec[k] == null ? '' : rec[k]) : ((rec.t && rec.t[lang] && rec.t[lang][k]) || ''));
function setV(rec, k, lang, v) {
  if (lang === 'id') { rec[k] = v; return; }
  rec.t = rec.t || {}; rec.t[lang] = rec.t[lang] || {};
  if (v === '') delete rec.t[lang][k]; else rec.t[lang][k] = v;
  if (!Object.keys(rec.t[lang]).length) delete rec.t[lang];
}
const hasI18n = (fields) => fields.some(f => f.i18n || (f.type === 'list' && hasI18n(f.fields)));

/* ---------- Pembentuk form ---------- */
function labelWrap(f, control, extra) {
  return h('label', { class: 'fld' + (f.type === 'bool' ? ' fld-bool' : '') }, h('span', { class: 'fld-l' }, f.label, f.req ? h('i', { class: 'req', title: 'Wajib diisi' }, '*') : null), control, f.help ? h('small', { class: 'fld-h' }, f.help) : null, extra);
}
function fieldEl(f, rec, lang, onStruct) {
  if (lang !== 'id' && !(f.i18n || (f.type === 'list' && hasI18n(f.fields)))) return null;
  const ph = lang !== 'id' ? (rec[f.k] || '') : (f.ph || '');
  const on = (fn) => (e) => { fn(e); touch(); };
  switch (f.type) {
    case 'textarea': return labelWrap(f, h('textarea', { rows: f.rows || 4, placeholder: ph, oninput: on(e => setV(rec, f.k, lang, e.target.value)) }, getV(rec, f.k, lang)));
    case 'date': return labelWrap(f, h('input', { type: 'date', value: getV(rec, f.k, lang), oninput: on(e => setV(rec, f.k, lang, e.target.value)) }));
    case 'select': return labelWrap(f, h('select', { onchange: on(e => setV(rec, f.k, lang, e.target.value)) }, h('option', { value: '' }, '— pilih —'), f.options.map(o => h('option', { value: o, selected: rec[f.k] === o }, o))));
    case 'bool': {
      const val = rec[f.k] === undefined ? f.def !== false : !!rec[f.k];
      return labelWrap(f, h('span', { class: 'sw' }, h('input', { type: 'checkbox', checked: val, onchange: on(e => { rec[f.k] = e.target.checked; }) }), h('i', {})));
    }
    case 'link': {
      const id = 'dl-' + uid();
      return labelWrap(f, [h('input', { type: 'text', list: id, value: getV(rec, f.k, lang), placeholder: 'ibadah.html atau https://…', oninput: on(e => setV(rec, f.k, lang, e.target.value)) }), h('datalist', { id }, [...PAGES, 'youth.html', 'kids.html', 'persekutuan.html', 'pelayanan.html', 'doa.html'].map(p => h('option', { value: p })))]);
    }
    case 'image': return imageField(f, rec);
    case 'list': return listField(f, rec, lang, onStruct);
    default: return labelWrap(f, h('input', { type: 'text', value: getV(rec, f.k, lang), placeholder: ph, oninput: on(e => setV(rec, f.k, lang, e.target.value)) }));
  }
}
const imgSrc = (p) => !p ? '' : (S.media[p] ? 'data:' + S.media[p].mime + ';base64,' + S.media[p].b64 : '../' + p);
function imageField(f, rec) {
  const box = h('div', { class: 'fld' });
  const draw = () => {
    box.replaceChildren(h('span', { class: 'fld-l' }, f.label), h('div', { class: 'imgf' },
      rec[f.k] ? h('img', { src: imgSrc(rec[f.k]), alt: '' }) : h('div', { class: 'imgf-empty' }, ico('image', 26)),
      h('div', { class: 'imgf-a' }, h('button', { type: 'button', class: 'btn sm', onclick: () => pickMedia(p => { rec[f.k] = p; touch(); draw(); }) }, ico('image', 16), rec[f.k] ? 'Ganti foto' : 'Pilih / unggah foto'),
        rec[f.k] ? h('button', { type: 'button', class: 'btn sm ghost', onclick: () => { rec[f.k] = ''; touch(); draw(); } }, 'Hapus') : null,
        rec[f.k] ? h('code', { class: 'imgf-p' }, rec[f.k]) : null)), f.help ? h('small', { class: 'fld-h' }, f.help) : null);
  };
  draw(); return box;
}
function recordForm(fields, rec, lang, rerender) {
  const wrap = h('div', { class: 'form' });
  const main = fields.filter(f => !f.adv), adv = fields.filter(f => f.adv);
  main.forEach(f => { const e = fieldEl(f, rec, lang, rerender); if (e) wrap.append(e); });
  const advEls = adv.map(f => fieldEl(f, rec, lang, rerender)).filter(Boolean);
  if (advEls.length) wrap.append(h('details', { class: 'adv' }, h('summary', {}, 'Pengaturan lanjutan'), h('div', { class: 'form' }, advEls)));
  return wrap;
}
function listField(f, rec, lang, onStruct) {
  const arr = rec[f.k] = rec[f.k] || [];
  const box = h('div', { class: 'rep' });
  box.append(h('div', { class: 'rep-h' }, h('span', { class: 'fld-l' }, f.label), f.fixed || lang !== 'id' ? null : null));
  arr.forEach((it, i) => {
    const title = (it[f.fields[0].k] || '') || `${f.item} ${i + 1}`;
    const card = h('div', { class: 'rep-i' }, h('div', { class: 'rep-t' }, h('b', {}, `${f.item} ${i + 1}`), h('span', { class: 'rep-s' }, String(title).slice(0, 48)),
      lang === 'id' && !f.fixed ? h('span', { class: 'rep-a' },
        h('button', { type: 'button', class: 'ib', title: 'Naik', disabled: i === 0, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; touch(); onStruct(); } }, ico('up', 15)),
        h('button', { type: 'button', class: 'ib', title: 'Turun', disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; touch(); onStruct(); } }, ico('down', 15)),
        h('button', { type: 'button', class: 'ib danger', title: 'Hapus', onclick: () => { if (confirm(`Hapus ${f.item.toLowerCase()} ini?`)) { arr.splice(i, 1); touch(); onStruct(); } } }, ico('trash', 15))) : null),
      recordForm(f.fields, it, lang, onStruct));
    box.append(card);
  });
  if (lang === 'id' && !f.fixed && (!f.max || arr.length < f.max)) box.append(h('button', { type: 'button', class: 'btn sm', onclick: () => { arr.push({ t: {} }); touch(); onStruct(); } }, ico('plus', 15), `Tambah ${f.item.toLowerCase()}`));
  return box;
}

/* ---------- Media ---------- */
function resizeImage(file, max = 1600) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const sc = Math.min(1, max / Math.max(im.width, im.height)), w = Math.round(im.width * sc), hh = Math.round(im.height * sc);
      const c = document.createElement('canvas'); c.width = w; c.height = hh;
      const png = file.type === 'image/png'; const ctx = c.getContext('2d');
      if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, hh); }
      ctx.drawImage(im, 0, 0, w, hh); URL.revokeObjectURL(url);
      const mime = png ? 'image/png' : 'image/jpeg';
      c.toBlob(async b => { if (!b) return rej(new Error('Gagal memproses gambar')); res({ mime, ext: png ? 'png' : 'jpg', b64: b64(new Uint8Array(await b.arrayBuffer())), w, h: hh, size: b.size }); }, mime, 0.86);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Berkas bukan gambar yang valid')); };
    im.src = url;
  });
}
async function addMedia(file) {
  if (!/^image\//.test(file.type)) throw new Error('Pilih berkas gambar (JPG, PNG, atau WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('Gambar terlalu besar (maks 25 MB).');
  const r = await resizeImage(file), d = new Date(), ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const path = `assets/uploads/${ymd}-${slug(file.name.replace(/\.[^.]+$/, ''))}-${uid()}.${r.ext}`;
  S.media[path] = r; await idb.set(path, r); return path;
}
const isImg = (p) => /\.(jpe?g|png|webp|gif|svg)$/i.test(p);
function pickMedia(cb) {
  const dlg = $('#dlg-media'), grid = $('#media-grid', dlg), up = $('#media-up', dlg);
  const paint = () => {
    const paths = new Set([...Object.keys(S.media), ...S.tree.map(t => t.path).filter(p => /^assets\//.test(p) && isImg(p) && !/\/fonts\//.test(p))]);
    grid.replaceChildren(...[...paths].sort((a, b) => (S.media[b] ? 1 : 0) - (S.media[a] ? 1 : 0) || b.localeCompare(a)).map(p =>
      h('button', { type: 'button', class: 'mi', onclick: () => { dlg.close(); cb(p); }, title: p }, h('img', { src: imgSrc(p), alt: '', loading: 'lazy' }), h('span', {}, p.replace(/^assets\//, '')), S.media[p] ? h('i', { class: 'mi-new' }, 'baru') : null)));
  };
  up.onchange = async () => {
    for (const f of [...up.files]) { try { const p = await addMedia(f); touch(); paint(); toast('Foto ditambahkan: ' + p.split('/').pop()); } catch (e) { toast(e.message, 'err'); } }
    up.value = '';
  };
  paint(); dlg.showModal();
}

/* ---------- Tampilan ---------- */
const view = () => $('#view');
function setView(v) { S.view = v; S.lang = 'id'; render(); window.scrollTo(0, 0); }
function render() {
  $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.v === S.view.name));
  const v = S.view;
  if (v.name === 'dash') return renderDash();
  if (v.name === 'media') return renderMedia();
  if (v.name === 'hist') return renderHist();
  const sc = SCHEMA[v.name];
  if (sc.kind === 'single' || v.idx != null) return renderEditor();
  return renderList();
}
function pageHead(title, sub, actions) {
  return h('div', { class: 'ph' }, h('div', {}, h('h1', {}, title), sub ? h('p', { class: 'muted' }, sub) : null), h('div', { class: 'ph-a' }, actions));
}
function renderDash() {
  const ch = changed();
  const cards = NAMES.map(n => {
    const sc = SCHEMA[n], cnt = sc.kind === 'list' ? S.data[n].items.length : null;
    return h('a', { href: '#' + n, class: 'card dc', onclick: (e) => { e.preventDefault(); setView({ name: n }); } }, ico(sc.icon, 22), h('b', {}, sc.title), h('span', { class: 'muted' }, cnt != null ? `${cnt} ${sc.item}` : 'Satu halaman'), ch.includes(n) ? h('i', { class: 'badge' }, 'diubah') : null);
  });
  view().replaceChildren(pageHead('Selamat datang 👋', `Anda masuk sebagai ${S.user || 'admin'} · repo ${S.cfg.owner}/${S.cfg.repo} (${S.cfg.branch})`, [
    h('a', { class: 'btn ghost', href: '../index.html', target: '_blank', rel: 'noopener' }, ico('eye', 16), 'Buka situs')]),
    h('div', { class: 'grid dgrid' }, cards,
      h('a', { href: '#media', class: 'card dc', onclick: e => { e.preventDefault(); setView({ name: 'media' }); } }, ico('image', 22), h('b', {}, 'Pustaka Foto'), h('span', { class: 'muted' }, 'Unggah & kelola foto')),
      h('a', { href: '#hist', class: 'card dc', onclick: e => { e.preventDefault(); setView({ name: 'hist' }); } }, ico('hist', 22), h('b', {}, 'Riwayat'), h('span', { class: 'muted' }, 'Pulihkan versi lama'))),
    h('div', { class: 'card tips' }, h('h3', {}, 'Cara kerjanya'),
      h('ol', {}, h('li', {}, 'Pilih bagian di menu, lalu ubah atau tambah isi. Setiap ketikan tersimpan sebagai ', h('b', {}, 'draf'), ' di perangkat ini.'),
        h('li', {}, 'Klik ', h('b', {}, 'Pratinjau'), ' untuk melihat hasilnya di Desktop / HP, dalam 4 bahasa.'),
        h('li', {}, 'Klik ', h('b', {}, 'Publikasikan'), '. Situs ter-update dalam ±1 menit dan tiap publikasi tercatat di Riwayat.'),
        h('li', {}, 'Kolom terjemahan (EN / 中文 / 한국어) boleh dikosongkan — situs memakai Bahasa Indonesia.'))));
}
function renderList() {
  const n = S.view.name, sc = SCHEMA[n], items = S.data[n].items;
  const order = sc.sort ? [...items.keys()].sort((a, b) => String(items[b][sc.sort] || '').localeCompare(String(items[a][sc.sort] || ''))) : [...items.keys()];
  const rows = order.map((i, pos) => {
    const it = items[i];
    const row = h('div', { class: 'row', draggable: !sc.sort, 'data-i': i },
      !sc.sort ? h('span', { class: 'grip', title: 'Seret untuk mengubah urutan' }, ico('drag', 18)) : null,
      sc.thumbOf && sc.thumbOf(it) ? h('img', { class: 'thumb', src: imgSrc(sc.thumbOf(it)), alt: '' }) : (sc.thumbOf ? h('span', { class: 'thumb ph0' }, ico('image', 18)) : null),
      h('button', { type: 'button', class: 'row-m', onclick: () => setView({ name: n, idx: i }) }, h('b', {}, sc.titleOf(it) || h('i', { class: 'muted' }, '(tanpa judul)')), h('span', { class: 'muted' }, sc.subOf(it))),
      sc.badgeOf && sc.badgeOf(it) ? h('i', { class: 'badge' }, sc.badgeOf(it)) : null,
      h('span', { class: 'row-a' },
        !sc.sort ? [h('button', { type: 'button', class: 'ib', title: 'Naik', disabled: pos === 0, onclick: () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; touch(); render(); } }, ico('up', 16)),
          h('button', { type: 'button', class: 'ib', title: 'Turun', disabled: pos === order.length - 1, onclick: () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; touch(); render(); } }, ico('down', 16))] : null,
        h('button', { type: 'button', class: 'ib', title: 'Gandakan', onclick: () => { const c = JSON.parse(JSON.stringify(it)); c.id = slug((c.nama || c.judul || 'salinan') + '-salinan') + '-' + uid(); items.splice(i + 1, 0, c); touch(); render(); toast('Digandakan'); } }, ico('copy', 16)),
        h('button', { type: 'button', class: 'ib danger', title: 'Hapus', onclick: () => { if (confirm(`Hapus “${sc.titleOf(it) || 'item ini'}”?\n\nBisa dipulihkan lewat Riwayat selama belum lama dipublikasikan.`)) { items.splice(i, 1); touch(); render(); } } }, ico('trash', 16))));
    if (!sc.sort) {
      row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', String(i)); row.classList.add('drag'); });
      row.addEventListener('dragend', () => row.classList.remove('drag'));
      row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('over'); });
      row.addEventListener('dragleave', () => row.classList.remove('over'));
      row.addEventListener('drop', e => { e.preventDefault(); const from = +e.dataTransfer.getData('text/plain'); if (from === i || isNaN(from)) return; const [m] = items.splice(from, 1); items.splice(i, 0, m); touch(); render(); });
    }
    return row;
  });
  view().replaceChildren(pageHead(sc.title, sc.hint, [
    h('button', { class: 'btn', onclick: () => previewPage(sc.page) }, ico('eye', 16), 'Pratinjau'),
    h('button', { class: 'btn primary', onclick: () => addItem(n) }, ico('plus', 16), `Tambah ${sc.item}`)]),
    rows.length ? h('div', { class: 'card list' }, rows) : h('div', { class: 'card empty' }, h('p', {}, `Belum ada ${sc.item}.`), h('button', { class: 'btn primary', onclick: () => addItem(n) }, `Tambah ${sc.item} pertama`)));
}
function addItem(n) {
  const sc = SCHEMA[n], it = { id: n + '-' + uid(), t: {} };
  sc.fields.forEach(f => { if (f.type === 'bool') it[f.k] = f.def !== false; else if (f.type === 'date') it[f.k] = new Date().toISOString().slice(0, 10); else if (f.type === 'select') it[f.k] = ''; else if (f.type !== 'list') it[f.k] = ''; });
  S.data[n].items.push(it); touch(); setView({ name: n, idx: S.data[n].items.length - 1 });
}
function renderEditor() {
  const n = S.view.name, sc = SCHEMA[n], isList = sc.kind === 'list';
  const rec = isList ? S.data[n].items[S.view.idx] : S.data[n];
  if (!rec) return setView({ name: n });
  const tabs = h('div', { class: 'tabs', role: 'tablist' }, LANGS.map(([c, l]) => h('button', { type: 'button', role: 'tab', class: c === S.lang ? 'on' : '', 'aria-selected': c === S.lang, onclick: () => { S.lang = c; draw(); } }, l)));
  const body = h('div', {});
  const note = h('div', { class: 'langnote' });
  const draw = () => {
    $$('button', tabs).forEach((b, i) => { const on = LANGS[i][0] === S.lang; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    note.textContent = S.lang === 'id' ? '' : `Terjemahan ${LANGS.find(l => l[0] === S.lang)[1]} — kolom yang dikosongkan memakai Bahasa Indonesia. Hanya kolom teks yang bisa diterjemahkan.`;
    note.hidden = S.lang === 'id';
    body.replaceChildren(recordForm(sc.fields, rec, S.lang, draw));
  };
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const title = isList ? (sc.titleOf(rec) || `${cap(sc.item)} baru`) : sc.title;
  view().replaceChildren(
    h('div', { class: 'crumb' }, isList ? h('a', { href: '#' + n, onclick: e => { e.preventDefault(); setView({ name: n }); } }, '← ' + sc.title) : null),
    pageHead(title, isList ? null : sc.hint, [h('button', { class: 'btn', onclick: () => previewPage(sc.page, isList && n === 'kegiatan' ? rec.id : null) }, ico('eye', 16), 'Pratinjau'), isList ? h('button', { class: 'btn primary', onclick: () => setView({ name: n }) }, ico('check', 16), 'Selesai') : null]),
    h('div', { class: 'card editor' }, tabs, note, body));
  draw();
}
function renderMedia() {
  const up = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: async () => { for (const f of [...up.files]) { try { await addMedia(f); touch(); toast('Foto ditambahkan'); } catch (e) { toast(e.message, 'err'); } } up.value = ''; renderMedia(); } });
  const paths = [...new Set([...Object.keys(S.media), ...S.tree.map(t => t.path).filter(p => /^assets\//.test(p) && isImg(p) && !/\/fonts\//.test(p))])];
  const used = JSON.stringify(S.data);
  view().replaceChildren(pageHead('Pustaka Foto', 'Foto diperkecil otomatis (maks 1600 px) sebelum diunggah. Foto baru ikut terunggah saat Anda menekan Publikasikan.', [up, h('button', { class: 'btn primary', onclick: () => up.click() }, ico('up2', 16), 'Unggah foto')]),
    h('div', { class: 'card' }, h('div', { class: 'mgrid' }, paths.sort((a, b) => b.localeCompare(a)).map(p => h('figure', { class: 'mi2' }, h('img', { src: imgSrc(p), alt: '', loading: 'lazy' }), h('figcaption', {}, h('span', {}, p.replace(/^assets\//, '')), S.media[p] ? h('i', { class: 'mi-new' }, 'baru') : (used.includes(p) ? h('i', { class: 'mi-use' }, 'dipakai') : null)))))));
}
async function renderHist() {
  view().replaceChildren(pageHead('Riwayat perubahan', 'Setiap publikasi tercatat. Pulihkan versi lama ke draf, lalu publikasikan bila sudah sesuai.', []), h('div', { class: 'card', id: 'hist' }, h('p', { class: 'muted' }, 'Memuat…')));
  try {
    const list = await gh(`/commits?sha=${S.cfg.branch}&path=content&per_page=25`);
    $('#hist').replaceChildren(...list.map(c => h('div', { class: 'row hrow' }, h('div', { class: 'row-m static' }, h('b', {}, c.commit.message.split('\n')[0]), h('span', { class: 'muted' }, `${new Date(c.commit.author.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} · ${c.commit.author.name} · ${c.sha.slice(0, 7)}`)),
      h('span', { class: 'row-a' }, h('button', { class: 'btn sm', onclick: () => restoreCommit(c.sha) }, ico('hist', 15), 'Pulihkan ke draf')))));
    if (!list.length) $('#hist').replaceChildren(h('p', { class: 'muted' }, 'Belum ada riwayat.'));
  } catch (e) { $('#hist').replaceChildren(h('p', { class: 'err' }, e.message)); }
}
async function restoreCommit(sha) {
  if (!confirm('Ganti isi draf dengan versi ini? Perubahan draf saat ini akan tertimpa.')) return;
  try {
    for (const n of NAMES) { try { const t = await gh(`/contents/content/${n}.json?ref=${sha}`, { raw: true }); S.data[n] = JSON.parse(t); } catch (e) { if (e.status !== 404) throw e; } }
    touch(); toast('Versi lama dimuat ke draf. Cek lalu klik Publikasikan.'); setView({ name: 'dash' });
  } catch (e) { toast(e.message, 'err'); }
}

/* ---------- Pratinjau ---------- */
let pvPage = 'index.html', pvLang = 'id', pvDev = 'desktop';
window.CMS_PREVIEW = { data: () => S.data, media: {} };
function previewMedia() { const m = {}; Object.keys(S.media).forEach(p => { m[p] = imgSrc(p); }); window.CMS_PREVIEW.media = m; }
function previewPage(p, slugId) { pvPage = slugId ? 'berita.html?s=' + slugId : (p || 'index.html'); openPreview(); }
function pvUrl() { const u = new URL('../' + pvPage, location.href); u.searchParams.set('lang', pvLang); return u.href; }
function openPreview() {
  previewMedia();
  const dlg = $('#dlg-preview'), fr = $('#pv-frame');
  $('#pv-page').value = pvPage.startsWith('berita') ? 'berita' : pvPage;
  $$('#pv-dev button').forEach(b => b.classList.toggle('on', b.dataset.d === pvDev));
  $$('#pv-lang button').forEach(b => b.classList.toggle('on', b.dataset.l === pvLang));
  fr.className = pvDev; fr.src = pvUrl(); if (!dlg.open) dlg.showModal();
}
function refreshPreview() { previewMedia(); try { $('#pv-frame').contentWindow.CMS_REFRESH && $('#pv-frame').contentWindow.CMS_REFRESH(); } catch (e) {} }

/* ---------- Publikasi ---------- */
function validate() {
  const errs = [];
  ['jadwal', 'kegiatan', 'tim'].forEach(n => {
    const sc = SCHEMA[n]; S.data[n].items.forEach((it, i) => sc.fields.filter(f => f.req).forEach(f => { if (!String(it[f.k] || '').trim()) errs.push(`${sc.title} #${i + 1}: “${f.label}” belum diisi`); }));
  });
  const ids = S.data.kegiatan.items.map(i => i.id); if (new Set(ids).size !== ids.length) errs.push('Kegiatan: ada ID ganda');
  const wa = S.data.situs.wa_admin; if (wa && !/^\d{8,15}$/.test(wa)) errs.push('Kontak: nomor WhatsApp admin harus angka saja (mis. 6285717547266)');
  return errs;
}
function summary() {
  const out = [];
  changed().forEach(n => {
    const sc = SCHEMA[n];
    if (sc.kind === 'list') {
      const o = JSON.parse(S.base[n]).items, c = S.data[n].items, om = new Map(o.map(i => [i.id, canon(i)])), cm = new Map(c.map(i => [i.id, canon(i)]));
      const add = c.filter(i => !om.has(i.id)).length, del = o.filter(i => !cm.has(i.id)).length, mod = c.filter(i => om.has(i.id) && om.get(i.id) !== cm.get(i.id)).length;
      const reord = !add && !del && !mod ? 'urutan diubah' : '';
      out.push(`${sc.title}: ${[add && `${add} ditambah`, mod && `${mod} diubah`, del && `${del} dihapus`, reord].filter(Boolean).join(', ')}`);
    } else out.push(`${sc.title}: diubah`);
  });
  const m = usedMedia(); if (m.length) out.push(`${m.length} foto baru diunggah`);
  return out;
}
function fixIds() {
  const old = new Set(JSON.parse(S.base.kegiatan).items.map(i => i.id)), items = S.data.kegiatan.items;
  items.forEach(it => {
    if (old.has(it.id) || !/^kegiatan-[a-z0-9]{4}$/.test(it.id) || !it.judul) return;
    let s = slug(it.judul), k = 2; while (items.some(x => x !== it && x.id === s)) s = slug(it.judul) + '-' + k++;
    it.id = s;
  });
}
function openPublish() {
  fixIds();
  const errs = validate(), dlg = $('#dlg-pub'), sum = summary();
  $('#pub-sum').replaceChildren(...sum.map(s => h('li', {}, s)));
  $('#pub-err').replaceChildren(...errs.map(s => h('li', {}, s))); $('#pub-errbox').hidden = !errs.length;
  $('#pub-go').disabled = !!errs.length; $('#pub-msg').value = ''; $('#pub-msg').placeholder = 'CMS: ' + changed().map(n => SCHEMA[n].title).join(', ');
  $('#pub-prog').textContent = ''; dlg.showModal();
}
async function publish() {
  const btn = $('#pub-go'), prog = $('#pub-prog'); btn.disabled = true;
  const step = (t) => { prog.textContent = t; };
  try {
    step('Memeriksa versi terbaru di GitHub…');
    const ref = await gh(`/git/ref/heads/${S.cfg.branch}`), head = ref.object.sha;
    const names = changed();
    if (head !== S.head) {
      const c = await gh(`/git/commits/${head}`), t = await gh(`/git/trees/${c.tree.sha}?recursive=1`);
      const sh = {}; t.tree.forEach(x => { sh[x.path] = x.sha; });
      const clash = names.filter(n => sh[`content/${n}.json`] !== S.shas[`content/${n}.json`]);
      if (clash.length) throw new GhError(`Bagian “${clash.map(n => SCHEMA[n].title).join(', ')}” sudah diubah orang/perangkat lain di GitHub sejak Anda masuk. Keluar lalu masuk lagi untuk memuat versi terbaru (draf Anda tidak hilang bila tidak bentrok).`, 409);
      S.treeSha = c.tree.sha;
    }
    const entries = [], media = usedMedia();
    let k = 0, total = names.length + media.length;
    for (const n of names) { step(`Mengunggah ${SCHEMA[n].title}… (${++k}/${total})`); const b = await gh('/git/blobs', { method: 'POST', body: { content: pretty(S.data[n]), encoding: 'utf-8' } }); entries.push({ path: `content/${n}.json`, mode: '100644', type: 'blob', sha: b.sha }); }
    for (const p of media) { step(`Mengunggah foto… (${++k}/${total})`); const b = await gh('/git/blobs', { method: 'POST', body: { content: S.media[p].b64, encoding: 'base64' } }); entries.push({ path: p, mode: '100644', type: 'blob', sha: b.sha }); }
    step('Membuat commit…');
    const parentCommit = await gh(`/git/commits/${head}`);
    const tree = await gh('/git/trees', { method: 'POST', body: { base_tree: parentCommit.tree.sha, tree: entries } });
    const msg = $('#pub-msg').value.trim() || 'CMS: ' + names.map(n => SCHEMA[n].title).join(', ');
    const commit = await gh('/git/commits', { method: 'POST', body: { message: msg, tree: tree.sha, parents: [head] } });
    await gh(`/git/refs/heads/${S.cfg.branch}`, { method: 'PATCH', body: { sha: commit.sha } });
    step('Selesai.');
    // sinkronkan state
    S.head = commit.sha; S.treeSha = tree.sha;
    names.forEach(n => { S.base[n] = canon(S.data[n]); S.shas[`content/${n}.json`] = entries.find(e => e.path === `content/${n}.json`).sha; });
    for (const p of media) { const e = entries.find(x => x.path === p); S.tree.push({ path: p, sha: e.sha, type: 'blob' }); S.shas[p] = e.sha; delete S.media[p]; await idb.del(p); }
    Object.keys(S.media).forEach(p => { if (!media.includes(p)) { delete S.media[p]; idb.del(p); } });
    saveDraft(); updateChg();
    $('#dlg-pub').close(); toast('Terpublikasi! Situs diperbarui dalam ±1 menit.'); render();
  } catch (e) { prog.textContent = ''; toast(e.message, 'err'); btn.disabled = false; }
}

/* ---------- Login & boot ---------- */
function showLogin(msg) {
  $('#app').hidden = true; $('#login').hidden = false;
  const c = (() => { try { return JSON.parse(lsGet('cms-cfg') || '{}'); } catch (e) { return {}; } })();
  $('#l-repo').value = c.owner ? `${c.owner}/${c.repo}` : 'PrasetyoAmos/gsja-city-blessing'; $('#l-branch').value = c.branch || 'main'; $('#l-token').value = '';
  $('#l-err').textContent = msg || '';
}
async function enter(cfg, remember) {
  S.cfg = cfg; $('#l-err').textContent = ''; const go = $('#l-go'); go.disabled = true; go.textContent = 'Memeriksa…';
  try {
    const me = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + cfg.token } }); if (me.ok) S.user = (await me.json()).login;
    await loadRemote(); await restoreDraft();
    localStorage.setItem('cms-remember', remember ? '1' : '0');
    const st = remember ? localStorage : sessionStorage; localStorage.removeItem('cms-cfg'); sessionStorage.removeItem('cms-cfg');
    st.setItem('cms-cfg', JSON.stringify(cfg));
    $('#login').hidden = true; $('#app').hidden = false; $('#who').textContent = S.user || ''; buildNav(); updateChg(); render();
  } catch (e) { S.cfg = null; showLogin(e.message); }
  go.disabled = false; go.textContent = 'Masuk';
}
function buildNav() {
  const items = [['dash', 'Ringkasan', 'dash'], ...NAMES.map(n => [n, SCHEMA[n].title, SCHEMA[n].icon]), ['media', 'Pustaka Foto', 'image'], ['hist', 'Riwayat', 'hist']];
  $('#nav').replaceChildren(...items.map(([n, t, i]) => h('a', { href: '#' + n, 'data-v': n, onclick: e => { e.preventDefault(); setView({ name: n }); document.body.classList.remove('navopen'); } }, ico(i, 18), h('span', {}, t), h('i', { class: 'nav-dot', 'data-n': n, hidden: true }))));
}
function theme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('gsja-theme', t); } catch (e) {} const b = $('#btn-theme'); b.replaceChildren(ico(t === 'dark' ? 'sun' : 'moon', 18)); b.title = t === 'dark' ? 'Mode terang' : 'Mode gelap'; }

document.addEventListener('DOMContentLoaded', () => {
  let t = null; try { t = localStorage.getItem('gsja-theme'); } catch (e) {}
  theme(t || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $('#btn-theme').onclick = () => theme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  $('#login-form').onsubmit = (e) => {
    e.preventDefault();
    const [owner, repo] = $('#l-repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').split('/');
    const token = $('#l-token').value.trim();
    if (!owner || !repo || !token) { $('#l-err').textContent = 'Lengkapi repo dan token.'; return; }
    enter({ owner, repo, branch: $('#l-branch').value.trim() || 'main', token }, $('#l-remember').checked);
  };
  $('#btn-out').onclick = () => { if (changed().length && !confirm('Ada perubahan yang belum dipublikasikan. Draf tetap tersimpan di perangkat ini. Keluar?')) return; localStorage.removeItem('cms-cfg'); sessionStorage.removeItem('cms-cfg'); S.cfg = null; showLogin(); };
  $('#btn-publish').onclick = openPublish; $('#btn-preview').onclick = () => previewPage('index.html');
  $('#pub-go').onclick = publish; $$('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  $('#btn-menu').onclick = () => document.body.classList.toggle('navopen');
  $('#pv-page').onchange = (e) => { const v = e.target.value; pvPage = v === 'berita' ? 'berita.html?s=' + ((S.data.kegiatan.items[0] || {}).id || '') : v; openPreview(); };
  $$('#pv-dev button').forEach(b => b.onclick = () => { pvDev = b.dataset.d; openPreview(); });
  $$('#pv-lang button').forEach(b => b.onclick = () => { pvLang = b.dataset.l; openPreview(); });
  $('#pv-frame').addEventListener('load', previewMedia);
  const saved = (() => { try { return JSON.parse(lsGet('cms-cfg') || 'null'); } catch (e) { return null; } })();
  if (saved && saved.token) { $('#login').hidden = false; enter(saved, localStorage.getItem('cms-remember') !== '0'); } else showLogin();
  addEventListener('beforeunload', (e) => { if (S.cfg && Object.values(S.media).length && false) e.preventDefault(); });
});
