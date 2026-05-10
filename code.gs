const API_TOKEN = "DashboardKedatangan2026";

// Optional Telegram alarm. Isi jika ingin aktifkan notifikasi Telegram dari backend.
const TELEGRAM_ENABLED = false;
const TELEGRAM_BOT_TOKEN = "";
const TELEGRAM_CHAT_ID = "";
const TIMEZONE = "GMT+7";

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const token = params.token || "";

  if (token !== API_TOKEN) {
    return jsonResponse({ success: false, message: "Unauthorized: token tidak valid" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName("DASHBOARD");
  const dailyTebonSheet = ss.getSheetByName("REPORT DAILY TEBON");

  // Fallback lama jika sheet REPORT DAILY TEBON belum ada.
  const pivot = ss.getSheetByName("Pivot");
  const monthlyBKSheet = ss.getSheetByName("REPORT MONTHLY BK");

  if (!dashboard) {
    return jsonResponse({ success: false, message: "Sheet DASHBOARD tidak ditemukan" });
  }

  const dateRange = getDateRange(params);
  const dailyReport = getReportDailyTebon(dailyTebonSheet, dateRange);

  // Rule terbaru:
  // DASHBOARD!B5 = Target Harian
  // DASHBOARD!D5 = Total Kedatangan / total proses hari ini
  const targetHarian = toNumber(dashboard.getRange("B5").getValue());
  const totalKedatangan = toNumber(dashboard.getRange("D5").getValue());
  const kebutuhan = targetHarian;
  const tebonJagung = totalKedatangan;
  const silage = toNumber(dashboard.getRange("H5").getValue());
  const note = toNumber(dashboard.getRange("J5").getValue());
  const rumputOdot = toNumber(dashboard.getRange("F29").getValue());
  const estEndProcess = dashboard.getRange("L5").getDisplayValue();

  const pickup = toNumber(dashboard.getRange("D14").getValue());
  const engkel = toNumber(dashboard.getRange("F14").getValue());
  const truk = toNumber(dashboard.getRange("H14").getValue());

  const hasDailyReport = dailyReport && dailyReport.source === "REPORT DAILY TEBON";

  const result = {
    success: true,
    branch: params.branch || "",
    filter: params.filter || "month",
    startDate: dateRange.start ? formatDate(dateRange.start) : "",
    endDate: dateRange.end ? formatDate(dateRange.end) : "",
    dataSource: hasDailyReport ? "REPORT DAILY TEBON" : "fallback",
    serverTime: Utilities.formatDate(new Date(), TIMEZONE, "dd MMM yyyy HH:mm:ss"),

    // Summary realtime tetap dari sheet DASHBOARD.
    estEndProcess: estEndProcess,
    kebutuhan: kebutuhan,
    tebonJagung: tebonJagung,
    silage: silage,
    note: note,
    rumputOdot: rumputOdot,
    targetHarian: targetHarian,
    totalKedatangan: totalKedatangan,
    totalProses: totalKedatangan,
    targetGap: totalKedatangan - targetHarian,
    targetAchievement: targetHarian > 0 ? (totalKedatangan / targetHarian) * 100 : 0,
    harianPercent: targetHarian > 0 ? (totalKedatangan / targetHarian) * 100 : 0,
    silagePercent: tebonJagung > 0 ? (silage / tebonJagung) * 100 : 0,
    kendaraan: {
      pickup: pickup,
      engkel: engkel,
      truk: truk,
      total: pickup + engkel + truk
    },

    // Data historis sekarang diprioritaskan dari REPORT DAILY TEBON.
    dailyTebon: hasDailyReport ? dailyReport : null,
    pivot: hasDailyReport ? {
      labels: dailyReport.odot.labels,
      sumKedatangan: dailyReport.odot.kedatangan
    } : getPivotData(pivot),
    monthlyBK: hasDailyReport ? {
      labels: dailyReport.supplier.labels,
      salasin: dailyReport.supplier.salasin,
      aminoto: dailyReport.supplier.aminoto,
      sandry: dailyReport.supplier.sandry,
      frengky: dailyReport.supplier.frengky,
      dany: dailyReport.supplier.dany,
      totalPerhari: dailyReport.supplier.totalPerhari
    } : getMonthlyBK(monthlyBKSheet),
    bahanKering: getBahanKering(dashboard)
  };

  maybeSendTelegramAlert(result);
  return jsonResponse(result);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0;
}

function getDateRange(params) {
  const filter = params.filter || "month";
  const today = dateOnly(new Date());
  const dayMs = 24 * 60 * 60 * 1000;

  if (params.start && params.end) {
    return { start: parseDateValue(params.start), end: parseDateValue(params.end) };
  }

  if (filter === "all") return { start: null, end: null };
  if (filter === "today") return { start: today, end: today };
  if (filter === "yesterday") {
    const y = new Date(today.getTime() - dayMs);
    return { start: y, end: y };
  }
  if (filter === "week") {
    const start = new Date(today.getTime() - 6 * dayMs);
    return { start: start, end: today };
  }

  // Default: 31 hari terakhir agar cocok untuk dashboard operasional.
  const start = new Date(today.getTime() - 30 * dayMs);
  return { start: start, end: today };
}

function dateOnly(date) {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
  return Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd");
}

function isInRange(date, range) {
  if (!date) return false;
  const d = dateOnly(date);
  if (range.start && d < dateOnly(range.start)) return false;
  if (range.end && d > dateOnly(range.end)) return false;
  return true;
}

function parseDateValue(value) {
  if (value instanceof Date && !isNaN(value)) return dateOnly(value);
  if (value === "" || value === null || value === undefined) return null;

  const s = String(value).trim();
  if (!s) return null;

  // yyyy-mm-dd
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

  // dd/mm/yyyy atau dd-mm-yyyy
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return new Date(y, Number(m[2]) - 1, Number(m[1]));
  }

  // 14 Dec 25, 14 Dec 2025, 14 Des 25
  m = s.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{2,4})$/);
  if (m) {
    const months = {
      jan: 0, january: 0, januari: 0,
      feb: 1, february: 1, februari: 1,
      mar: 2, march: 2, maret: 2,
      apr: 3, april: 3,
      may: 4, mei: 4,
      jun: 5, june: 5, juni: 5,
      jul: 6, july: 6, juli: 6,
      aug: 7, august: 7, agustus: 7, agu: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9, okt: 9, oktober: 9,
      nov: 10, november: 10,
      dec: 11, december: 11, des: 11, desember: 11
    };
    const key = m[2].toLowerCase();
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    if (months[key] !== undefined) return new Date(y, months[key], Number(m[1]));
  }

  const d = new Date(s);
  return isNaN(d) ? null : dateOnly(d);
}

function getReportDailyTebon(sheet, range) {
  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    return {
      source: "REPORT DAILY TEBON",
      supplier: emptySupplier(),
      tebonJagung: emptyTebon(),
      odot: emptyOdot()
    };
  }

  const values = sheet.getRange(4, 1, lastRow - 3, 17).getDisplayValues(); // A:Q mulai baris 4

  const supplier = emptySupplier();
  const tebonJagung = emptyTebon();
  const odot = emptyOdot();

  values.forEach(row => {
    // A:G = REPORT SUPPLIER
    const supplierDate = parseDateValue(row[0]);
    if (supplierDate && isInRange(supplierDate, range)) {
      supplier.labels.push(formatDate(supplierDate));
      supplier.salasin.push(toNumber(row[1]));
      supplier.aminoto.push(toNumber(row[2]));
      supplier.sandry.push(toNumber(row[3]));
      supplier.frengky.push(toNumber(row[4]));
      supplier.dany.push(toNumber(row[5]));
      supplier.totalPerhari.push(toNumber(row[6]));
    }

    // I:M = REPORT TEBON JAGUNG
    const tebonDate = parseDateValue(row[8]);
    if (tebonDate && isInRange(tebonDate, range)) {
      tebonJagung.labels.push(formatDate(tebonDate));
      tebonJagung.chopper.push(toNumber(row[9]));
      tebonJagung.silage.push(toNumber(row[10]));
      tebonJagung.ampar.push(toNumber(row[11]));
      tebonJagung.totalPerhari.push(toNumber(row[12]));
    }

    // O:Q = REPORT RUMPUT ODOT
    const odotDate = parseDateValue(row[14]);
    if (odotDate && isInRange(odotDate, range)) {
      odot.labels.push(formatDate(odotDate));
      odot.kedatangan.push(toNumber(row[15]));
      odot.month.push(row[16] || "");
    }
  });

  return {
    source: "REPORT DAILY TEBON",
    supplier: supplier,
    tebonJagung: tebonJagung,
    odot: odot
  };
}

function emptySupplier() {
  return { labels: [], salasin: [], aminoto: [], sandry: [], frengky: [], dany: [], totalPerhari: [] };
}

function emptyTebon() {
  return { labels: [], chopper: [], silage: [], ampar: [], totalPerhari: [] };
}

function emptyOdot() {
  return { labels: [], kedatangan: [], month: [] };
}

function getPivotData(sheet) {
  const output = { labels: [], sumKedatangan: [] };
  if (!sheet) return output;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return output;
  const values = sheet.getRange("F2:J" + lastRow).getValues();
  values.forEach(row => {
    const tanggal = row[0];
    const sumKedatangan = row[4];
    if (tanggal !== "" && tanggal !== null) {
      const d = parseDateValue(tanggal);
      output.labels.push(d ? formatDate(d) : String(tanggal));
      output.sumKedatangan.push(toNumber(sumKedatangan));
    }
  });
  return output;
}

function getMonthlyBK(sheet) {
  const output = { labels: [], salasin: [], aminoto: [], sandry: [], frengky: [], dany: [] };
  if (!sheet) return output;
  const lastRow = sheet.getLastRow();
  if (lastRow < 4) return output;
  const values = sheet.getRange("A4:F" + lastRow).getDisplayValues();
  values.forEach(row => {
    const tanggal = row[0];
    if (tanggal !== "" && tanggal !== null) {
      output.labels.push(tanggal);
      output.salasin.push(toNumber(row[1]));
      output.aminoto.push(toNumber(row[2]));
      output.sandry.push(toNumber(row[3]));
      output.frengky.push(toNumber(row[4]));
      output.dany.push(toNumber(row[5]));
    }
  });
  return output;
}

function getBahanKering(sheet) {
  const rows = [];
  const values = sheet.getRange("B34:D50").getDisplayValues();
  values.forEach(row => {
    if (row[0] !== "") {
      rows.push({ komoditi: row[0], supplier: row[1], netto: row[2] });
    }
  });
  return rows;
}

function maybeSendTelegramAlert(data) {
  if (!TELEGRAM_ENABLED || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const alerts = [];
  if (data.totalProses < data.targetHarian) alerts.push("Total kedatangan kurang dari target: kurang " + Math.abs(data.targetGap));
  if ((data.kendaraan && data.kendaraan.total || 0) < 20) alerts.push("Peak kendaraan < 20: " + (data.kendaraan && data.kendaraan.total || 0));
  if ((data.rumputOdot || 0) === 0) alerts.push("Tidak ada kedatangan odot hari ini");
  if (alerts.length === 0) return;

  const cache = CacheService.getScriptCache();
  const key = "telegram_alert_" + Utilities.formatDate(new Date(), TIMEZONE, "yyyyMMddHH");
  if (cache.get(key)) return;
  cache.put(key, "1", 3600);

  const url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";
  UrlFetchApp.fetch(url, {
    method: "post",
    muteHttpExceptions: true,
    payload: {
      chat_id: TELEGRAM_CHAT_ID,
      text: "Warning Dashboard Kedatangan Pakan:\n" + alerts.join("\n")
    }
  });
}
