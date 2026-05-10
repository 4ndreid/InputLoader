function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const dashboard = ss.getSheetByName("DASHBOARD");
  const pivot = ss.getSheetByName("Pivot");
  const monthlyBKSheet = ss.getSheetByName("REPORT MONTHLY BK");

  const kebutuhan = toNumber(dashboard.getRange("C5").getValue());
  const tebonJagung = toNumber(dashboard.getRange("F5").getValue());
  const silage = toNumber(dashboard.getRange("H5").getValue());
  const note = toNumber(dashboard.getRange("J5").getValue());
  const rumputOdot = toNumber(dashboard.getRange("F29").getValue());
  const estEndProcess = dashboard.getRange("L5").getDisplayValue();

  const pickup = toNumber(dashboard.getRange("D14").getValue());
  const engkel = toNumber(dashboard.getRange("F14").getValue());
  const truk = toNumber(dashboard.getRange("H14").getValue());

  const result = {
    estEndProcess: estEndProcess,
    kebutuhan: kebutuhan,
    tebonJagung: tebonJagung,
    silage: silage,
    note: note,
    rumputOdot: rumputOdot,
    harianPercent: kebutuhan > 0 ? (note / kebutuhan) * 100 : 0,
    silagePercent: tebonJagung > 0 ? (silage / tebonJagung) * 100 : 0,
    kendaraan: {
      pickup: pickup,
      engkel: engkel,
      truk: truk,
      total: pickup + engkel + truk
    },
    pivot: getPivotData(pivot),
    monthlyBK: getMonthlyBK(monthlyBKSheet),
    bahanKering: getBahanKering(dashboard)
  };

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  if (typeof value === "number") return value;

  return Number(
    String(value)
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  ) || 0;
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
      output.labels.push(
        tanggal instanceof Date
          ? Utilities.formatDate(tanggal, "GMT+7", "dd MMM yy")
          : String(tanggal)
      );
      output.sumKedatangan.push(toNumber(sumKedatangan));
    }
  });

  return output;
}

function getMonthlyBK(sheet) {
  const output = { labels: [], salasin: [], aminoto: [], sandry: [], frengky: [] };
  if (!sheet) return output;

  const lastRow = sheet.getLastRow();
  if (lastRow < 4) return output;

  const values = sheet.getRange("A4:E" + lastRow).getDisplayValues();

  values.forEach(row => {
    const tanggal = row[0];
    if (tanggal !== "" && tanggal !== null) {
      output.labels.push(tanggal);
      output.salasin.push(toNumber(row[1]));
      output.aminoto.push(toNumber(row[2]));
      output.sandry.push(toNumber(row[3]));
      output.frengky.push(toNumber(row[4]));
    }
  });

  return output;
}

function getBahanKering(sheet) {
  const rows = [];
  const values = sheet.getRange("B34:D50").getDisplayValues();

  values.forEach(row => {
    if (row[0] !== "") {
      rows.push({
        komoditi: row[0],
        supplier: row[1],
        netto: row[2]
      });
    }
  });

  return rows;
}
