/* eslint-disable no-unused-vars */
/* global DataSheet, getContainerTemplateSheet, addTemplate, updateUiEvery, YOG, SpreadsheetApp */

function createYOGTemplateMenu(ui) {
  let templateMenu = ui
    .createMenu("YOG Templates")
    .addItem("Set up YOG template sheet", "formatYOGTemplateSheet")
    .addItem("Add YOG templates", "addYOGTemplatesInteractive");
  return templateMenu;
}

//let SID = "Student ID";

let YOG_TURL = "Template URL";
let YOG_PARENTS = "Parent Folders (comma separated list)";
let YOG_COMPLETE = "Initial Setup Complete";
let START_DATE = "Start Date";
let END_DATE = "End Date";

function getContainerYOGTemplateSheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss, "YOG Templates", [    
    YOG,
    YOG_TURL,
    YOG_PARENTS,
    COMPLETE,
    START_DATE,
    END_DATE,
  ]);
  return dataSheet;
}

function formatYOGTemplateSheet() {
  let dataSheet = getContainerYOGTemplateSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function getTemplatesByYOG () {
  let templateDataSheet = getContainerYOGTemplateSheet();
  let byYog = {};
  for (let rn=1; rn< templateDataSheet.length; rn++) {
    let row = templateDataSheet[rn];
    let yog = row[YOG];
    if (yog) {
      let template = row[YOG_TURL];
      let parents = row[YOG_PARENTS];
      let startDate = row[START_DATE];
      let endDate = row[END_DATE];
      let complete = row[COMPLETE];
      if (!byYog[yog]) {
        byYog[yog] = [];
      }
      byYog[yog].push({template, parents, startDate, endDate, complete});
    }
  }
  return byYog;
}

function addYOGTemplatesInteractive() {
  let templatesByYog = getTemplatesByYOG();
  let templateSheet = getContainerTemplateSheet();
  for (let yog in templatesByYog) {
    let templates = templatesByYog[yog];    
    for (let template of templates) {
      // Now let's add them to the template sheet...
      // existing?
      if (template.complete) {
        console.log('Template already complete, skipping:', template);
        continue;
      } else if (template.endDate && new Date() > new Date(template.endDate)) {
        console.log('Template expired, skipping:', template);
        continue;
      }
      console.log('Continuing with template!');
      let students = getStudentsByYog(yog);
      for (let student of students) {
        if (
          templateSheet.find(
            (r) => (r[YOG] == yog && lasEq(r[SID], student.LASID)
            && r[TURL] == template.template)
          )
        ) {
          console.log("Template already added for", student.LASID, yog);
        } else {
          // Let's add a row...
          templateSheet.pushRow({
            [TURL]: template.template,
            [Email] : student.Email,
            [PARENTS]: template.parents,
            [COMPLETE]: false,
            [SID]: student.LASID,
            [NAME]: student.Name,
            [YOG]: yog,
          });
          updateUiEvery(10);
        }
      }
    }
  }
}
