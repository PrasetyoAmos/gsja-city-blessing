# Panduan CMS GSJA City Blessing

Panel ada di **`/admin/`** (mis. `https://situs-anda/admin/`). Tidak butuh server: isi situs disimpan sebagai file JSON di folder `content/` pada repo GitHub, dan panel ini mengubah file tersebut lewat GitHub API.

## 1. Masuk
1. Di GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access** → *Only select repositories* → pilih repo situs ini.
3. **Permissions → Repository permissions → Contents → Read and write**.
4. Pilih masa berlaku, **Generate token**, salin.
5. Buka `/admin/`, isi `pemilik/nama-repo`, branch (`main`), tempel token, **Masuk**.

Token hanya disimpan di browser Anda dan hanya dikirim ke `api.github.com`. Siapa pun yang memegang token dapat mengubah situs; cabut token di GitHub bila perangkat hilang. Untuk beberapa pengurus, buat satu token per orang (tiap orang harus menjadi *collaborator* repo).

## 2. Mengubah isi
| Menu | Yang bisa diubah |
|---|---|
| Beranda | Teks slide utama, bar info biru, teks berjalan |
| Jadwal Ibadah | Nama, hari, jam, lokasi, pelayan; tampil di Beranda atau tidak |
| Kegiatan & Berita | Judul, tanggal, tempat, foto, isi, terbit/draf, tampil di slider Beranda |
| Tim Pelayan | Nama, jabatan, keterangan, foto (urutan = urutan tampil) |
| Halaman Tentang | Profil, visi, misi, perjalanan |
| Kontak & Situs | Alamat, WhatsApp, email, Instagram, YouTube, Maps, pesan pembuka WhatsApp |
| Pustaka Foto | Unggah foto (otomatis diperkecil maks 1600 px) |
| Riwayat | Daftar publikasi; **Pulihkan ke draf** untuk kembali ke versi lama |

- **Terjemahan:** tiap kolom teks punya tab *English / 中文 / 한국어*. Kosongkan bila tidak ingin diterjemahkan — situs memakai Bahasa Indonesia (dan kamus bawaan untuk teks standar).
- **Draf:** setiap ketikan tersimpan otomatis di perangkat. Belum tampil di situs sampai **Publikasikan**.
- **Pratinjau:** lihat hasil di Desktop/Tablet/HP dalam 4 bahasa sebelum publikasi.
- **Publikasikan:** satu commit ke GitHub. Situs ter-update ±1 menit (GitHub Pages / Cloudflare Pages).
- Berita baru otomatis mendapat alamat `berita.html?s=<judul-berita>`.

## 3. Keamanan & batas
- Halaman `/admin/` boleh diakses siapa saja, tetapi tanpa token yang punya izin tulis ke repo, ia tidak bisa mengubah apa pun.
- Jika dua orang menyunting bagian yang sama, panel akan menolak publikasi yang bentrok dan meminta masuk ulang.
- Berkas besar (>25 MB) ditolak. Foto sebaiknya JPG/PNG/WebP.
- Pesan pembuka WhatsApp dan email notifikasi registrasi tetap berbahasa Indonesia.

## 4. Untuk pengembang
- Data: `content/{beranda,jadwal,kegiatan,tim,tentang,situs}.json`. Foto unggahan: `assets/uploads/`.
- Templat tampilan satu sumber: `cms-render.js` (dipakai build, situs, dan pratinjau). `cms.js` memuat JSON di halaman; HTML statis hasil build tetap ada sebagai cadangan/SEO.
- Saat membangun ulang situs dari sumber, **ambil dulu `content/` dan `assets/uploads/` dari repo** agar suntingan CMS tidak tertimpa.
