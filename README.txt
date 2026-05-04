# TMR Loader PWA

Cara pakai:
1. Upload semua file/folder ini ke hosting HTTPS.
   Contoh: GitHub Pages, Netlify, Vercel, atau hosting internal.
2. Buka `index.html` dari browser HP.
3. Di Chrome Android: tekan menu titik tiga > Add to Home screen / Install app.
4. Aplikasi akan muncul seperti app biasa di Home Screen.

Catatan penting:
- PWA wajib dijalankan dari HTTPS, kecuali saat testing di localhost.
- Request ke Google Apps Script tidak di-cache agar data spreadsheet tetap fresh.
- Offline queue tetap memakai localStorage dari script utama.
