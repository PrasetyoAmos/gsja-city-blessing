/* Templat render konten GSJA City Blessing.
   Dipakai bersama oleh: build (Node, untuk HTML statis), situs (cms.js), dan pratinjau admin.
   Satu sumber templat = hasil HTML selalu sama di mana pun. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CMSR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var ARROW = '↗';
  var MONTHS = {
    id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };
  var DAYS = {
    senin: { id: 'SENIN', en: 'MONDAY', zh: '星期一', ko: '월요일' },
    selasa: { id: 'SELASA', en: 'TUESDAY', zh: '星期二', ko: '화요일' },
    rabu: { id: 'RABU', en: 'WEDNESDAY', zh: '星期三', ko: '수요일' },
    kamis: { id: 'KAMIS', en: 'THURSDAY', zh: '星期四', ko: '목요일' },
    jumat: { id: 'JUMAT', en: 'FRIDAY', zh: '星期五', ko: '금요일' },
    sabtu: { id: 'SABTU', en: 'SATURDAY', zh: '星期六', ko: '토요일' },
    minggu: { id: 'MINGGU', en: 'SUNDAY', zh: '星期日', ko: '일요일' }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* nilai field untuk bahasa tertentu; jika kosong, kembali ke bahasa Indonesia */
  function tr(rec, field, lang) {
    if (!rec) return '';
    if (lang && lang !== 'id' && rec.t && rec.t[lang] && rec.t[lang][field]) return rec.t[lang][field];
    return rec[field] == null ? '' : rec[field];
  }
  function fmtDate(iso, lang) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return iso || '';
    var y = +m[1], mo = +m[2], d = +m[3];
    if (lang === 'en') return d + ' ' + MONTHS.en[mo - 1] + ' ' + y;
    if (lang === 'zh') return y + '年' + mo + '月' + d + '日';
    if (lang === 'ko') return y + '년 ' + mo + '월 ' + d + '일';
    return d + ' ' + MONTHS.id[mo - 1] + ' ' + y;
  }
  function dayName(h, lang) {
    var k = String(h || '').toLowerCase().trim(), e = DAYS[k];
    if (!e) return esc(String(h || '').toUpperCase());
    return e[lang] || e.id;
  }
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  }
  function initials(n) {
    return String(n || '').replace(/^(Pdt|Pdp|Pi|Ps|Sdr|Sdri|Bpk|Ibu)\.?\s+/i, '').split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ''; }).join('').toUpperCase();
  }
  function href(u) { return esc(u || '#'); }
  function sortPosts(list) {
    return (list || []).filter(function (p) { return p.terbit !== false; }).slice().sort(function (a, b) {
      return String(b.tanggal || '').localeCompare(String(a.tanggal || ''));
    });
  }
  function postHref(p) { return 'berita?s=' + encodeURIComponent(p.id); }
  function lines(text, start) {
    return text.split('|').map(function (t, i) { return '<span class="line" style="--i:' + ((start || 0) + i) + '"><span>' + t + '</span></span>'; }).join('');
  }
  function summary(text) { return paras(text)[0] ? paras(text)[0].slice(0, 120) + '…' : ''; }

  var S = {};
  S['jadwal-home'] = function (D, c) {
    return ((D.jadwal && D.jadwal.items) || []).filter(function (j) { return j.beranda !== false; }).map(function (j) {
      var nama = tr(j, 'nama_beranda', c.lang) || tr(j, 'nama', c.lang);
      return '<a class="sched-row reveal" href="' + href(j.link || 'ibadah') + '"><div><h3>' + esc(nama) + '</h3></div><div class="t"><small>' + dayName(j.hari, c.lang) + '</small>' + esc(tr(j, 'jam_beranda', c.lang) || j.jam) + '</div><div class="w">' + esc(tr(j, 'lokasi', c.lang)) + '</div><div class="p"><b>' + esc(tr(j, 'pelayan', c.lang)) + '</b>' + esc(tr(j, 'ket_beranda', c.lang) || tr(j, 'ket', c.lang)) + '</div></a>';
    }).join('\n');
  };
  S['jadwal-full'] = function (D, c) {
    return ((D.jadwal && D.jadwal.items) || []).map(function (j) {
      return '<div class="sched-row reveal"><div><h3>' + esc(tr(j, 'nama', c.lang)) + '</h3></div><div class="t"><small>' + dayName(j.hari, c.lang) + '</small>' + esc(j.jam) + ' WIB</div><div class="w">' + esc(tr(j, 'lokasi', c.lang)) + '</div><div class="p"><b>' + esc(tr(j, 'pelayan', c.lang)) + '</b>' + esc(tr(j, 'ket', c.lang)) + '</div></div>';
    }).join('');
  };
  S.news = function (D, c) {
    var cards = sortPosts(D.kegiatan && D.kegiatan.items).map(function (p) {
      var judul = tr(p, 'judul', c.lang);
      return '<a class="news-card reveal" href="' + postHref(p) + '"><div class="ph"><img src="' + esc(c.img(p.foto)) + '" alt="' + esc(judul) + '"></div><div class="meta">' + esc(fmtDate(p.tanggal, c.lang)) + '</div><h3>' + esc(judul) + '</h3><p>' + esc(summary(tr(p, 'isi', c.lang))) + '</p></a>';
    }).join('');
    return cards + '\n<a class="news-card invite reveal" href="ibadah"><div class="ph"><small>GSJA CITY BLESSING</small><strong>SEE YOU<br>THIS<br><em>SUNDAY.</em></strong><small>07.00 &amp; 09.15 WIB</small></div><div class="meta">Undangan</div><h3>Sampai jumpa hari Minggu</h3><p>Undangan untuk Anda dan keluarga.</p></a>';
  };
  S.ev = function (D, c) {
    var cards = sortPosts(D.kegiatan && D.kegiatan.items).filter(function (p) { return p.beranda !== false; }).slice(0, 8).map(function (p) {
      var judul = tr(p, 'judul_beranda', c.lang) || tr(p, 'judul', c.lang), tempat = String(tr(p, 'tempat', c.lang)).split(',')[0];
      return '<a class="ev" href="' + postHref(p) + '"><div class="ph"><img src="' + esc(c.img(p.foto)) + '" alt="' + esc(tr(p, 'alt', c.lang) || tr(p, 'judul', c.lang)) + '"><span class="chip">' + esc(tr(p, 'kategori', c.lang)) + '</span></div><div class="cap"><div><h3>' + esc(judul) + '</h3><p>' + esc(fmtDate(p.tanggal, c.lang) + ' · ' + tempat) + '</p></div><span class="go">' + ARROW + '</span></div></a>';
    }).join('\n');
    return cards + '\n<a class="ev invite" href="ibadah"><div class="ph"><small>GSJA CITY BLESSING</small><strong>SEE YOU<br>THIS<br><em>SUNDAY.</em></strong><span class="bt">07.00 &amp; 09.15 WIB ' + ARROW + '</span></div><div class="cap"><div><h3>Sampai jumpa hari Minggu</h3><p>Undangan untuk Anda dan keluarga</p></div><span class="go">' + ARROW + '</span></div></a>';
  };
  S.team = function (D, c) {
    return ((D.tim && D.tim.items) || []).map(function (p) {
      var av = p.foto ? '<img src="' + esc(c.img(p.foto)) + '" alt="" loading="lazy">' : esc(p.inisial || initials(p.nama));
      return '<div class="person reveal"><div class="avatar">' + av + '</div><h3>' + esc(tr(p, 'nama', c.lang)) + '</h3><span class="role">' + esc(tr(p, 'jabatan', c.lang)) + '</span><p>' + esc(tr(p, 'bio', c.lang)) + '</p></div>';
    }).join('\n');
  };
  S.timeline = function (D, c) {
    return ((D.tentang && D.tentang.timeline) || []).map(function (t) {
      return '<div class="tl reveal"><span class="yr">' + esc(tr(t, 'tahun', c.lang)) + '</span><h3>' + esc(tr(t, 'judul', c.lang)) + '</h3><p>' + esc(tr(t, 'isi', c.lang)) + '</p></div>';
    }).join('\n');
  };
  S.profil = function (D, c) {
    return paras(tr(D.tentang, 'profil', c.lang)).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  };
  S.quick = function (D, c) {
    return ((D.beranda && D.beranda.quick) || []).map(function (q) {
      return '<div><small>' + esc(tr(q, 'label', c.lang)) + '</small><b>' + esc(tr(q, 'nilai', c.lang)) + '</b></div>';
    }).join('');
  };
  S.marquee = function (D, c) {
    var k = ((D.beranda && D.beranda.kata) || []).map(function (x) { return '<span>' + esc(tr(x, 'teks', c.lang)) + '</span>'; }).join('');
    return k ? new Array(7).join(k) : '';
  };

  /* halaman artikel (berita?s=slug) */
  function article(D, id, c) {
    var p = ((D.kegiatan && D.kegiatan.items) || []).filter(function (x) { return x.id === id; })[0];
    if (!p) return null;
    var judul = tr(p, 'judul', c.lang), tgl = fmtDate(p.tanggal, c.lang), tempat = tr(p, 'tempat', c.lang), isi = paras(tr(p, 'isi', c.lang));
    var html = '<section class="phero rise c-cream"><div class="phero-in"><nav class="crumbs fade-up" style="--i:0" aria-label="Breadcrumb"><a href="./">Beranda</a><i>/</i><a href="kegiatan">Kegiatan</a><i>/</i><span>' + esc(judul) + '</span></nav><span class="eyebrow fade-up" style="--i:1">' + esc(tr(p, 'kategori', c.lang)) + '</span><h1>' + lines(esc(judul), 1) + '</h1><p class="lead fade-up" style="--i:5">' + esc(tgl + ' · ' + tempat) + '</p></div></section>' +
      '<section class="section"><div class="article">' + (p.foto ? '<div class="cover img-reveal"><img src="' + esc(c.img(p.foto)) + '" alt="' + esc(judul) + '"></div>' : '') +
      '<div class="facts"><span>Tanggal<b>' + esc(tgl) + '</b></span><span>Lokasi<b>' + esc(tempat) + '</b></span></div>' +
      isi.map(function (t) { return '<p class="reveal">' + esc(t) + '</p>'; }).join('') +
      '<p style="margin-top:40px"><a class="ulink" href="kegiatan">← Semua kegiatan</a></p></div></section>';
    return { title: judul, desc: isi[0] ? isi[0].slice(0, 150) : '', html: html };
  }

  function hash(str) { var h = 5381, i = str.length; while (i) h = (h * 33) ^ str.charCodeAt(--i); return (h >>> 0).toString(36); }

  return { hash: hash, S: S, article: article, esc: esc, tr: tr, fmtDate: fmtDate, dayName: dayName, paras: paras, initials: initials, ARROW: ARROW, sortPosts: sortPosts };
});
