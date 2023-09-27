function createShortcutMenu (ui) {
  return ui.createMenu("Shortcuts")
  .addItem("Set up shortcut sheet","formatShortcutSheet")
  .addItem("Create shortcuts","createShortcutsFromSheet")

}

let ROOT_FOLDER = 'Root Folder Name'
let SUB_FOLDERS = 'Sub-Folder Names (comma separated list)'
// SID defined elsewhere

function getContainerShortcutSheet () {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss,"Shortcuts",[SID,ROOT_FOLDER,SUB_FOLDERS,COMPLETE]);
  return dataSheet
}

function formatShortcutSheet () {
  let dataSheet = getContainerShortcutSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function createShortcutsFromSheet () {
  let shortcutDataSheet = getContainerShortcutSheet();
  for (let rn=1; rn<shortcutDataSheet.length; rn++) {
    let row = shortcutDataSheet[rn];
    if (!row[COMPLETE]) {
      console.log('Add template for row:',row[SID],row[ROOT_FOLDER],row[PARENTS]);
      let parents = row[SUB_FOLDERS].split(/\s*,\s*/);
      console.log('Parnets:',parents);
      row[COMPLETE] = addShortcut(row[SID],row[ROOT_FOLDER],parents);
      /*let success = addTemplate(row[SID],row[ROOT_FOLDER],parents);
      if (success) {
        row[COMPLETE] = success;
      } else {
        row[COMPLETE] = false;
      }*/
    }
  }
}