/**
 * Backend registrasi jemaat GSJA City Blessing (Google Apps Script + Google Sheets).
 * Petunjuk pemasangan ada di README.md pada folder ini.
 */
const ADMIN_EMAIL = 'gsjacityblessing@gmail.com'; // penerima notifikasi pendaftar baru
const SHEET_NAME = 'Pendaftaran';
const FOTO_FOLDER = 'Foto Jemaat GSJA City Blessing';
const HEADERS = ['Waktu', 'ID Jemaat', 'Nama', 'NIK', 'Jenis Kelamin', 'WhatsApp', 'Tempat Lahir', 'Tanggal Lahir', 'Email',
  'Provinsi', 'Kabupaten/Kota', 'Kecamatan', 'Kelurahan/Desa', 'Alamat Lengkap', 'Anggota Keluarga', 'Minat Pelayanan', 'Foto', 'Status'];
const COL = {}; HEADERS.forEach((h, i) => COL[h] = i + 1);
const STATUS = ['Menunggu Konfirmasi', 'Disetujui', 'Ditolak'];

/** Jalankan SEKALI dari editor: membuat sheet, header, dropdown Status, dan trigger. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#1b4fd8').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.getRange(2, COL['Status'], 1000, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
  sh.getRange(2, COL['NIK'], 1000, 1).setNumberFormat('@');
  sh.getRange(2, COL['WhatsApp'], 1000, 1).setNumberFormat('@');
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onStatusEdit').forSpreadsheet(ss).onEdit().create();
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
const clean_ = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n || 200);
// cegah formula injection di Google Sheets
const safe_ = v => /^[=+\-@]/.test(v) ? "'" + v : v;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true }); // honeypot untuk bot
    const nama = clean_(d.nama, 100), nik = clean_(d.nik, 16), email = clean_(d.email, 150).toLowerCase();
    if (!nama || !/^\d{16}$/.test(nik) || !/^\S+@\S+\.\S+$/.test(email)) return json_({ ok: false, error: 'invalid' });
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const last = sh.getLastRow();
    if (last > 1) {
      const niks = sh.getRange(2, COL['NIK'], last - 1, 1).getValues().flat().map(String);
      const emails = sh.getRange(2, COL['Email'], last - 1, 1).getValues().flat().map(s => String(s).toLowerCase());
      if (niks.includes(nik) || emails.includes(email)) return json_({ ok: false, error: 'duplicate' });
    }
    const fotoUrl = saveFoto_(d.foto, nama);
    const kel = (d.keluarga || []).slice(0, 15).map(k => clean_(k.nama, 80) + ' (' + clean_(k.hubungan, 20) + (k.tgl ? ', ' + clean_(k.tgl, 12) : '') + ')').join('; ');
    const min = (d.minat || []).slice(0, 15).map(m => clean_(m.bidang, 40) + (m.keterangan ? ': ' + clean_(m.keterangan, 100) : '')).join('; ');
    const row = [new Date(), '', nama, nik, clean_(d.jk, 20), clean_(d.wa, 30), clean_(d.tl, 60), clean_(d.tgl, 12), email,
      clean_(d.prov, 60), clean_(d.kota, 60), clean_(d.kec, 60), clean_(d.kel, 80), clean_(d.alamat, 300), kel, min, fotoUrl, STATUS[0]].map(v => typeof v === 'string' ? safe_(v) : v);
    sh.appendRow(row);
    const r = sh.getLastRow();
    sh.getRange(r, COL['NIK']).setNumberFormat('@').setValue(nik);
    MailApp.sendEmail({ to: email, subject: 'Pendaftaran jemaat GSJA City Blessing diterima',
      body: 'Shalom ' + nama + ',\n\nTerima kasih sudah mendaftar sebagai jemaat GSJA City Blessing. Data Anda sedang diperiksa admin (status: Menunggu Konfirmasi). ID jemaat akan dikirim ke email ini setelah disetujui.\n\nTuhan memberkati,\nGSJA City Blessing' });
    MailApp.sendEmail({ to: ADMIN_EMAIL, subject: 'Pendaftar jemaat baru: ' + nama,
      body: 'Ada pendaftar baru: ' + nama + ' (' + email + ').\nBuka Google Sheets, sheet "' + SHEET_NAME + '", lalu ubah kolom Status menjadi Disetujui atau Ditolak.' });
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

function doGet() { return json_({ ok: true, service: 'registrasi-jemaat' }); }

function saveFoto_(dataUrl, nama) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(dataUrl || '');
  if (!m || m[1].length > 2000000) return '';
  const it = DriveApp.getFoldersByName(FOTO_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOTO_FOLDER);
  const blob = Utilities.newBlob(Utilities.base64Decode(m[1]), 'image/jpeg', nama.replace(/[^\w\- ]/g, '') + '-' + Date.now() + '.jpg');
  return folder.createFile(blob).getUrl();
}

/** Trigger onEdit: saat Status diubah admin, buat ID jemaat dan kirim email. */
function onStatusEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== SHEET_NAME || e.range.getColumn() !== COL['Status'] || e.range.getRow() < 2) return;
  const r = e.range.getRow(), status = e.range.getValue();
  const get = h => sh.getRange(r, COL[h]).getValue();
  const nama = get('Nama'), email = get('Email');
  if (!email) return;
  if (status === 'Disetujui') {
    let id = get('ID Jemaat');
    if (!id) {
      const n = sh.getRange(2, COL['ID Jemaat'], sh.getLastRow() - 1, 1).getValues().flat().filter(String).length + 1;
      id = 'CB-' + new Date().getFullYear() + '-' + ('0000' + n).slice(-4);
      sh.getRange(r, COL['ID Jemaat']).setValue(id);
    }
    MailApp.sendEmail({ to: email, subject: 'Pendaftaran disetujui, ID jemaat Anda ' + id,
      body: 'Shalom ' + nama + ',\n\nPendaftaran Anda sebagai jemaat GSJA City Blessing telah disetujui.\nID jemaat Anda: ' + id + '\n\nSampai jumpa di ibadah hari Minggu, pukul 07.00 dan 09.15 WIB.\n\nTuhan memberkati,\nGSJA City Blessing' });
  } else if (status === 'Ditolak') {
    MailApp.sendEmail({ to: email, subject: 'Pendaftaran jemaat GSJA City Blessing',
      body: 'Shalom ' + nama + ',\n\nPendaftaran Anda belum dapat kami setujui. Silakan hubungi admin lewat WhatsApp +62 857-1754-7266 untuk informasi lebih lanjut.\n\nTuhan memberkati,\nGSJA City Blessing' });
  }
}
