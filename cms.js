/* Memuat konten dari content/*.json dan menampilkannya di halaman.
   HTML statis hasil build tetap ada sebagai cadangan (SEO & saat JSON gagal dimuat). */
(function () {
  var R = window.CMSR; if (!R) return;
  var NAMES = ['situs', 'jadwal', 'kegiatan', 'tim', 'beranda', 'tentang'];
  var NEED = { 'jadwal-home': 'jadwal', 'jadwal-full': 'jadwal', news: 'kegiatan', ev: 'kegiatan', team: 'tim', timeline: 'tentang', profil: 'tentang', quick: 'beranda', marquee: 'beranda' };
  var preview = null;
  try { if (window.parent !== window && window.parent.CMS_PREVIEW) preview = window.parent.CMS_PREVIEW; } catch (e) {}
  var D = null;
  function lang() { return window.GSJA_LANG || 'id'; }
  function img(p) { var m = preview && preview.media && preview.media[p]; return m || p; }
  function load() {
    if (preview) return Promise.resolve(preview.data());
    return Promise.all(NAMES.map(function (n) {
      return fetch('content/' + n + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (a) { var d = {}; NAMES.forEach(function (n, i) { d[n] = a[i]; }); return d; });
  }
  function reveal(el) { el.querySelectorAll('.reveal,.img-reveal').forEach(function (e) { e.classList.add('in-view'); }); }

  function sections() {
    var l = lang(), c = { lang: l, img: img };
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var k = el.getAttribute('data-cms'), f = R.S[k];
      if (!f || !D[NEED[k]]) return;
      var html = f(D, c);
      if (el.__html === undefined && l === 'id' && el.getAttribute('data-cms-h') === R.hash(html)) { el.__html = html; return; }
      if (el.__html === html) return;
      el.__html = html; el.innerHTML = html; reveal(el);
    });
  }
  function rec(path) {                      // 'situs.email' -> {rec, field}
    var p = path.split('.'); return { rec: D[p[0]], field: p[1] };
  }
  /* tulis teks ke elemen: pakai terjemahan per-bahasa bila ada; jika tidak, tulis teks Indonesia
     lalu biarkan kamus i18n menerjemahkannya (pengamat DOM milik i18n.js) */
  function put(el, text, ov) {
    if (ov) { if (el.__m !== 'ov' || el.__v !== text) el.textContent = text; el.__m = 'ov'; el.__v = text; return; }
    if (lang() === 'id') { if (el.textContent !== text) el.textContent = text; }
    else if (el.__m === 'base' && el.__v === text) return;
    else el.textContent = text;
    el.__m = 'base'; el.__v = text;
  }
  function bindings() {
    var l = lang(), s = D.situs;
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var paths = el.getAttribute('data-bind').split('|'), ov = false;
      var vals = paths.map(function (p) {
        var r = rec(p); if (!r.rec) return '';
        if (l !== 'id' && r.rec.t && r.rec.t[l] && r.rec.t[l][r.field]) ov = true;
        return R.tr(r.rec, r.field, l);
      });
      put(el, (el.getAttribute('data-prefix') || '') + vals.join(el.getAttribute('data-sep') || ''), ov);
    });
    if (s) {
      document.querySelectorAll('[data-bind-href]').forEach(function (el) {
        var v = s[el.getAttribute('data-bind-href').split('.')[1]]; if (v && el.getAttribute('href') !== v) el.setAttribute('href', v);
      });
      document.querySelectorAll('[data-bind-wa]').forEach(function (el) {
        var a = el.getAttribute('data-bind-wa').split('|'), u = 'https://wa.me/' + (s[a[0]] || '');
        if (a[1] && s[a[1]]) u += '?text=' + encodeURIComponent(s[a[1]]);
        if (el.getAttribute('href') !== u) el.setAttribute('href', u);
      });
    }
  }
  function setT(el, rec, field) {
    if (!el) return; var l = lang(), ov = l !== 'id' && rec.t && rec.t[l] && rec.t[l][field];
    put(el, R.tr(rec, field, l), !!ov);
  }
  function hero() {
    var b = D.beranda; if (!b || !b.slides) return;
    var slides = document.querySelectorAll('.hero-slide');
    b.slides.forEach(function (s, i) {
      var el = slides[i]; if (!el) return;
      setT(el.querySelector('.eyebrow'), s, 'eyebrow');
      var ln = el.querySelectorAll('.line>span'); setT(ln[0], s, 'baris1'); setT(ln[1], s, 'baris2');
      setT(el.querySelector('.hero-content p'), s, 'sub');
      var as = el.querySelectorAll('.hero-actions a');
      [['tombol1', 'link1'], ['tombol2', 'link2']].forEach(function (k, j) {
        var a = as[j]; if (!a) return;
        var l = lang(), ov = l !== 'id' && s.t && s.t[l] && s.t[l][k[0]], t = R.tr(s, k[0], l) + ' ', n = a.firstChild;
        if (n && n.nodeType === 3) {
          if (ov) { if (n.data !== t) n.data = t; n.__m = 'ov'; }
          else if (l === 'id') { if (n.data !== t) n.data = t; n.__m = 'base'; n.__v = t; }
          else if (!(n.__m === 'base' && n.__v === t)) { n.data = t; n.__m = 'base'; n.__v = t; }
        }
        if (s[k[1]] && a.getAttribute('href') !== s[k[1]]) a.setAttribute('href', s[k[1]]);
      });
      var ph = el.querySelector('img.second-photo'); if (ph && s.foto) { var u = img(s.foto); if (ph.getAttribute('src') !== u) ph.setAttribute('src', u); }
    });
  }
  function articlePage() {
    var m = document.querySelector('[data-cms-article]'); if (!m) return;
    var id = new URLSearchParams(location.search).get('s'), a = id && R.article(D, id, { lang: lang(), img: img });
    if (!a) { m.innerHTML = '<section class="section"><div class="article"><h2>Artikel tidak ditemukan</h2><p style="margin-top:24px"><a class="ulink" href="kegiatan.html">← Semua kegiatan</a></p></div></section>'; return; }
    if (m.__html !== a.html) { m.__html = a.html; m.innerHTML = a.html; reveal(m); }
    document.title = a.title + ' — GSJA City Blessing';
    var d = document.querySelector('meta[name=description]'); if (d) d.content = a.desc;
  }
  function render() {
    if (!D) return;
    sections(); bindings(); hero(); articlePage();
  }
  function init() { load().then(function (d) { D = d; window.CMS_DATA = d; render(); }); }
  document.addEventListener('gsja-lang', render);
  window.CMS_REFRESH = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
