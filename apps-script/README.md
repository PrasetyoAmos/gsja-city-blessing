# Backend registrasi jemaat (Google Sheets + Apps Script)

Data pendaftar masuk ke Google Sheets. Foto disimpan di Google Drive, email konfirmasi terkirim otomatis.
Tanpa server dan tanpa biaya.

## Pasang (sekitar 5 menit)
1. Buat Google Sheets baru, misalnya "Data Jemaat GSJA City Blessing".
2. Menu **Ekstensi > Apps Script**. Hapus isi default, tempel seluruh isi `Code.gs`, simpan.
3. Pilih fungsi **setup** lalu klik **Jalankan**. Izinkan akses yang diminta (Sheets, Drive, Gmail).
   Ini membuat header, dropdown kolom Status, dan trigger email persetujuan.
4. **Terapkan > Deployment baru > Jenis: Aplikasi web**. Jalankan sebagai: **Saya**. Yang memiliki akses: **Siapa saja**. Salin URL yang berakhiran `/exec`.
5. Buka `config.js` di situs, isi: `window.GSJA_CONFIG = { regEndpoint: 'URL /exec tadi' };` lalu deploy ulang situs.

## Cara kerja
- Pendaftar mengisi formulir, data masuk sebagai baris baru berstatus **Menunggu Konfirmasi**, dan pendaftar serta admin menerima email.
- Admin mengubah kolom **Status** menjadi **Disetujui**: ID jemaat otomatis dibuat (CB-2026-0001, dst.) dan dikirim ke email pendaftar.
  **Ditolak** mengirim email pemberitahuan.
- NIK atau email yang sama ditolak sebagai duplikat.

## Catatan keamanan
- Sheets berisi NIK dan data pribadi. Jangan bagikan Sheets selain ke admin yang berwenang.
- Setiap perubahan kode Apps Script perlu **Deployment baru** (atau Kelola deployment > edit versi) agar berlaku.
