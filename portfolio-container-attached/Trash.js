function createDeleteMenu(ui) {
  return ui
    .createMenu("Delete Files")
    .addItem("Set up delete sheet", "formatDeleteSheet")
    .addItem("Delete files from sheet", "deleteFilesFromSheet");
}

const T_FILE_URL = "File URL";
const T_STATUS = "Status";
const T_TRASHED = "Trashed";

function getDeleteSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = DataSheet(ss, "Delete", [T_FILE_URL, T_STATUS]);
  return dataSheet;
}

function formatDeleteSheet() {
  const dataSheet = getDeleteSheet();
  const sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function deleteFilesFromSheet() {
  const T_TRASHEDataSheet = getDeleteSheet();
  const rows = T_TRASHEDataSheet.rows;

  for (let rn = 1; rn < rows.length; rn++) {
    const row = rows[rn];
    const url = row[T_FILE_URL];
    const T_STATUS = row[T_STATUS];

    if (url && T_STATUS !== T_TRASHED) {
      try {
        const id = getIdFromUrl(url);
        const file = DriveApp.getFileById(id);
        file.setTrashed(true);
        row[T_STATUS] = T_TRASHED;
      } catch (e) {
        row[T_STATUS] = "ERROR: " + e.toString();
      }
    }
  }
}
