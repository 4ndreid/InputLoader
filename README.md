# Dashboard Kedatangan Pakan PWA

File ini sudah siap untuk di-upload ke GitHub Pages.

## Isi file

- `index.html` - dashboard utama
- `manifest.json` - konfigurasi PWA
- `service-worker.js` - cache PWA/offline
- `Logo BRK JPG.jpg` - logo dashboard
- `icon-192.png` dan `icon-512.png` - icon PWA
- `code.gs` - Apps Script API untuk Google Sheet

## Cara pakai di GitHub Pages

1. Buat repository baru di GitHub.
2. Upload semua file di folder ini ke root repository.
3. Buka Settings > Pages.
4. Pilih Deploy from branch.
5. Pilih branch `main` dan folder `/root`.
6. Klik Save.

## Catatan

Jika deploy Apps Script berubah, edit `config.js`, lalu ganti nilai `API_URL` dengan URL `/exec` terbaru. Pastikan `API_TOKEN` di `config.js` sama dengan `API_TOKEN` di `code.gs`.
