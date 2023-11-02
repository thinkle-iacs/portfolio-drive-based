function createTemplateMenu(ui) {
  let templateMenu = ui
    .createMenu("Templates")
    .addItem("Set up template sheet", "formatTemplateSheet")
    .addItem("Add templates", "addTemplatesInteractive");
  return templateMenu;
}

let SID = "Student ID";
let Email = "Student Email";
let YOG = "YOG";
let TURL = "Template URL";
let PARENTS = "Parent Folders (comma separated list)";
let COMPLETE = "Created";
let NAME = "Name";

function getContainerTemplateSheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss, "Templates", [
    SID,
    Email,
    NAME,
    YOG,
    TURL,
    PARENTS,
    COMPLETE,
  ]);
  return dataSheet;
}

function formatTemplateSheet() {
  let dataSheet = getContainerTemplateSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function addTemplatesInteractive() {
  let templateDataSheet = getContainerTemplateSheet();
  for (let rn = 1; rn < templateDataSheet.length; rn++) {
    let row = templateDataSheet[rn];
    if (!row[COMPLETE] && row[TURL]) {
      console.log("Add template for row:", row[SID], row[TURL], row[PARENTS]);
      let parents = row[PARENTS].split(/\s*,\s*/).filter((p) => p);
      console.log("Parents:", parents);
      let success;
      try {
        success = addTemplate(row[SID], row[TURL], parents, row[NAME]);
      } catch (err) {
        console.log("Ran into error with row", row);
        console.log(err);
        row[COMPLETE] = "ERROR: " + err;
      }
      if (success) {
        row[COMPLETE] = success;
      } else {
        row[COMPLETE] = false;
      }
      updateUiEvery(10);
    }
  }
}
