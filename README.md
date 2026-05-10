# Dashboard Kedatangan Pakan PWA - V7 Professional

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
