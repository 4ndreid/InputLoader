# Dashboard Kedatangan Pakan PWA - V10 Industrial Enterprise

Versi ini menambahkan:

1. Alert Center sesuai rule operasional:
   - Total kedatangan/proses dari `DASHBOARD!D5` < target harian dari `DASHBOARD!B5`
   - Peak kendaraan < 20
   - Tidak ada kedatangan odot hari ini
2. Activity Log
3. Typography lebih profesional
4. Mini KPI Trend
5. Forecast chart untuk Odot
6. Historical analytics
7. Heatmap operasional
8. Realtime mode dengan WebSocket fallback ke polling

## Catatan WebSocket
Google Apps Script Web App tidak mendukung WebSocket native. Tombol Realtime akan memakai polling cepat 15 detik. Jika nanti memakai backend realtime seperti Firebase, Supabase, atau Node WebSocket, isi `WEBSOCKET_URL` di `config.js`.

## Sumber data utama

- `DASHBOARD!B5` = target harian
- `DASHBOARD!D5` = total kedatangan
- `REPORT DAILY TEBON` = data historis harian
- `DASHBOARD` = KPI realtime dan bahan kering hari ini

## Deploy

Upload semua file ke GitHub Pages. Jika URL Apps Script berubah, edit `config.js`.

## Update scroll mobile

Versi ini menambahkan perbaikan agar saat dashboard auto-refresh di HP, posisi scroll tidak lompat ke atas:

- tinggi panel Forecast Odot dibuat tetap
- update Chart.js tetap memakai `update('none')`
- `fetchData()` menyimpan posisi scroll sebelum update dan mengembalikannya setelah render selesai


## Rule KPI Target Harian

- Target Harian: `DASHBOARD!B5`
- Total Kedatangan Tebon: `DASHBOARD!D5`
- Chopper Tebon Jagung: `DASHBOARD!F5`
- Chopper Rumput Odot: `DASHBOARD!F29`
- Total Proses: `F5 + F29`
- Persentase Target: `(F5 + F29) / B5 * 100`
- Gap Target: `B5 - (F5 + F29)`

Warna KPI:
- Merah: < 80%
- Kuning: 80% sampai < 100%
- Hijau: >= 100%


## Update V10 Industrial Enterprise

Versi ini meningkatkan aspek profesional dashboard:

1. Shadow dan glow dibuat lebih lembut agar nyaman untuk monitor 24 jam.
2. Font diganti ke Segoe UI untuk readability yang lebih modern.
3. Alert Center dibuat lebih pintar:
   - Target proses belum tercapai
   - Peak kendaraan rendah
   - Odot kosong
   - Silage rendah
   - Anomali proses turun tajam dibanding rata-rata 7 hari
   - Odot kosong 3 data terakhir
4. Heatmap operasional ditingkatkan menjadi 21 data terakhir dengan tooltip detail Tebon, Odot, dan total proses.
5. Historical analytics ditingkatkan dengan Total Proses dan rolling average 7 hari.
6. Loading skeleton ditambahkan saat dashboard sync.
7. Error fallback visual ditambahkan saat API/koneksi bermasalah.
8. Export PDF sekarang memakai html2pdf.js jika tersedia, dengan layout report khusus.


## V10 Industrial Enterprise

Versi ini mengembalikan visual style hijau/industrial dan font Courier New, sambil mempertahankan fitur enterprise: alert pintar, loading skeleton, error fallback, heatmap detail, historical analytics lanjutan, export PDF html2pdf, dan perbaikan scroll mobile.
