function createShortcutMenu(ui) {
  return ui
    .createMenu("Shortcuts")
    .addItem("Set up shortcut sheet", "formatShortcutSheet")
    .addItem("Create shortcuts", "createShortcutsFromSheet");
}

let SC_ROOT_COL = "Root Folder Name";
let SC_SUB_COL = "Sub-Folder Names (comma separated list)";
let SC_COMPLETE = "Created";
// SID defined elsewhere

function getContainerShortcutSheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss, "Shortcuts", [
    SID,
    SC_ROOT_COL,
    SC_SUB_COL,
    SC_COMPLETE,
  ]);
  return dataSheet;
}

function formatShortcutSheet() {
  let dataSheet = getContainerShortcutSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function createShortcutsFromSheet() {
  let shortcutDataSheet = getContainerShortcutSheet();
  for (let rn = 1; rn < shortcutDataSheet.length; rn++) {
    let row = shortcutDataSheet[rn];
    if (!row[SC_COMPLETE]) {
      console.log(
        "Add template for row:",
        row[SID],
        row[SC_ROOT_COL],
        row[SC_SUB_COL]
      );
      let parents = row[SC_SUB_COL].split(/\s*,\s*/);
      console.log("Parents:", parents);
      row[SC_COMPLETE] = addShortcut(row[SID], row[SC_ROOT_COL], parents);
      updateUiEvery(2);
    }
  }
}
