function createPortfolioMenu(ui) {
  let menu = ui
    .createMenu("New Portfolios")
    .addItem("Set up portfolio sheet", "formatPortfolioSheet")
    .addItem("Add portfolios", "addPortfoliosInteractive")
    .addItem("Share Portfolios", "sharePortfoliosInteractive");
  return menu;
}

//let SID = "Student ID";
const PM_EMAIL = "Student Email";
const PM_FIRST = "First";
const PM_LAST = "Last";
const PM_YOG = "YOG";
const PM_TITLE = "Title";
const PM_COMPLETE = "Created";
const PM_URL = "URL";
const PM_SHARE = "Share (FORCE|TRUE|False)";
const PM_SHARED = "Shared";
const PM_MESSAGE = "Message";
function getContainerPortfolioSheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss, "New Portfolios", [
    SID,
    PM_EMAIL,
    PM_FIRST,
    PM_LAST,
    PM_YOG,
    PM_TITLE,
    PM_COMPLETE,
    PM_URL,
    PM_MESSAGE,
    PM_SHARE,
    PM_SHARED,
  ]);
  return dataSheet;
}

function formatPortfolioSheet() {
  let dataSheet = getContainerPortfolioSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function addPortfoliosInteractive() {
  let dataSheet = getContainerPortfolioSheet();
  for (let rn = 1; rn < dataSheet.length; rn++) {
    let row = dataSheet[rn];
    console.log(
      "Checking ROW",
      row[PM_TITLE],
      row[SID],
      row[PM_EMAIL],
      "=>",
      row[PM_COMPLETE]
    );
    if (!row[PM_COMPLETE] && row[PM_TITLE] && row[SID] && row[PM_EMAIL]) {
      let url;
      try {
        url = getPortfolioUrl(
          row[SID],
          row[PM_TITLE],
          row[PM_YOG],
          row[PM_EMAIL]
        );
      } catch (err) {
        console.log("Error creating portfolio for row", row);
        console.log(err);
        row[PM_COMPLETE] = `Error: ${err}`;
        return;
      }
      if (url) {
        row[PM_COMPLETE] = true;
        row[PM_URL] = url;
      } else {
        row[PM_COMPLETE] = false;
      }
      updateUiEvery(10);
    }
  }
}

function sharePortfoliosInteractive() {
  let dataSheet = getContainerPortfolioSheet(); // container-attached sheet
  let ui = SpreadsheetApp.getUi();
  let portfolioDataSheet = getPortfolioDataSheet(); // permanent big sheet
  for (let rn = 1; rn < dataSheet.length; rn++) {
    let row = dataSheet[rn];
    if (row[PM_URL] && !row[PM_SHARED] && row[PM_SHARE] && row[PM_SHARE]) {
      let existing = portfolioDataSheet.getRow(row[SID]);
      if (!existing.shared || row[PM_SHARE] == "FORCE") {
        console.log("Sharing!");
        if (row[PM_EMAIL] != existing.email) {
          console.log("Warning: Email conflict?");
          // Go ahead and prompt the user, let them know about the two PM_EMAILs...
          // if they confirm, then set the row.PM_EMAIL to the existing PM_EMAIL
          // and in that case, do a flush to update the spreadsheet
          // Show dialog box
          let response = ui.alert(
            "Email Conflict",
            `The Email in the sheet here (${row[PM_EMAIL]}) is different from Email we already have on file (${existing.email}). Do you want to use the new Email and update our records to reference that one instead?`,
            ui.ButtonSet.YES_NO
          );

          // Handle response
          if (response === ui.Button.YES) {
            existing.email = row[PM_EMAIL];
            SpreadsheetApp.flush();
          } else {
            row[PM_EMAIL] = existing.email;
          }
        }
        sharePortfolio(row[SID], row[PM_MESSAGE]);
        row[PM_SHARED] = true;
        updateUiEvery(10);
      }
    }
  }
}
