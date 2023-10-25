function createPortfolioMenu (ui) {
  let menu = ui.createMenu(
    "New Portfolios"
  )
  .addItem(
    'Set up portfolio sheet','formatPortfolioSheet'
  )
  .addItem(
      "Add portfolios","addPortfoliosInteractive"
    )
  .addItem(
    'Share Portfolios','sharePortfoliosInteractive'
  );
  return menu;
}



//let SID = "Student ID";
let EMAIL = 'Student Email';
let First = 'First';
let Last = 'Last';
//let YOG = 'YOG';
let TITLE = 'Title';
//let COMPLETE = 'Created';
let URL = 'URL';
let SHARE = 'Share (FORCE|TRUE|False)';
let SHARED = 'Shared'

function getContainerPortfolioSheet () {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = DataSheet(ss,"New Portfolios",[SID,EMAIL,First,Last,YOG,TITLE,COMPLETE,URL,SHARE,SHARED])
  return dataSheet
}

function formatPortfolioSheet () {
  let dataSheet = getContainerPortfolioSheet();
  let sheet = dataSheet.sheet;
  sheet.setFrozenRows(1);
}

function addPortfoliosInteractive () {
  let dataSheet = getContainerPortfolioSheet();
  for (let rn=1; rn<dataSheet.length; rn++) {
    let row = dataSheet[rn];
    if (!row[COMPLETE] && row[TITLE] && row[SID] && row[Email]) {
      let url
      try {
        url = getPortfolioUrl(row[SID],row[TITLE],row[YOG],row[EMAIL]);        
      } catch (err) {
        console.log('Error creating portfolio for row',row);
        console.log(err);
        row[COMPLETE] = `Error: ${err}`;
        return;
      }
      if (url) {
        row[COMPLETE] = true;
        row[URL] = url;
      } else {
        row[COMPLETE] = false;
      }
    }
  }
}


function sharePortfoliosInteractive () {
  let dataSheet = getContainerPortfolioSheet(); // container-attached sheet
  let portfolioDataSheet = getPortfolioDataSheet(); // permanent big sheet
  for (let rn=1; rn<dataSheet.length; rn++) {
    let row = dataSheet[rn];
    if (row[URL] && !row[SHARED] && row[SHARE] && row[SHARE]) {       
      let existing = portfolioDataSheet.getRow(row[SID]);
      if (!existing.shared || row[SHARE]=='FORCE') {
        console.log("Sharing!")
        if (row[EMAIL] != existing.email) {
          console.log('Warning: email conflict?');
          // Go ahead and prompt the user, let them know about the two emails...
          // if they confirm, then set the row.email to the existing email
          // and in that case, do a flush to update the spreadsheet
           // Show dialog box
          let response = ui.alert(
            'Email Conflict',
            `The email in the sheet here (${row[EMAIL]}) is different from email we already have on file (${existing.email}). Do you want to use the new email and update our records to reference that one instead?`,
            ui.ButtonSet.YES_NO
          );
          
          // Handle response
          if (response === ui.Button.YES) {
            existing.email = row[EMAIL];            
            SpreadsheetApp.flush();
          } else {
            row[EMAIL] = existing.email;
          }
        }        
        sharePortfolio(row[SID]);
        row[SHARED] = true;
      }
    }
  }
}
