const PORTFOLIO_HOME = 'IACS Portfolios';
const PORTFOLIO_SHEET = 'IACS Portfolio Sheet'

function getPortfolioUrl (sid, title, yog, email) {
  let portfolioDataSheet = getPortfolioDataSheet();  
  let existing = portfolioDataSheet.getRow(sid);  
  if (existing) {
    return existing.url;
  } else if (title && yog && email) {    
    return createPortfolio(title,yog,sid,email);    
  }
}

function getPortfolioFolder (sid, title, yog, email) {
  let url = getPortfolioUrl(sid,title,yog,email);
  let portfolioId = getIdFromUrl(url);
  return DriveApp.getFolderById(portfolioId);
}

function getCommonFolder (key, parent) {
  let props = PropertiesService.getScriptProperties();
  if (props.getProperty(key)) {
    let value = props.getProperty(key);
    console.log('Get prop...',value)
    let folder = DriveApp.getFolderById(value);
    if (parent) {
      folder.moveTo(parent);
    }
    return folder;
  } else {    
    let folder;
    if (key==PORTFOLIO_HOME && PORTFOLIO_HOME_HARDCODED) {
      let id = getIdFromUrl(PORTFOLIO_HOME_HARDCODED);
      folder = DriveApp.getFolderById(id);
    } else {    
      folder = DriveApp.createFolder(key);
    }
    if (parent) {
      folder.moveTo(parent);
    }
    let id = folder.getId();
    props.setProperty(key,id);
    return folder;
  }
}

function getPortfolioSpreadsheet () {
  let props = PropertiesService.getScriptProperties();
  if (props.getProperty(PORTFOLIO_SHEET)) {
    let value = props.getProperty(PORTFOLIO_SHEET);
    let sheet = SpreadsheetApp.openById(value);    
    return sheet;
  } else {
    let sheet;
    if (PORTFOLIO_SHEET_HARDCODED) {
      sheet = SpreadsheetApp.openByUrl(PORTFOLIO_SHEET_HARDCODED);      
    } else {
      sheet = SpreadsheetApp.create(PORTFOLIO_SHEET);
    }
    let id = sheet.getId();
    DriveApp.getFileById(id).moveTo(getCommonFolder(PORTFOLIO_HOME));
    props.setProperty(PORTFOLIO_SHEET,id);
    return sheet;
  }
}


function getYOGFolder (yog) {
  let title = `${yog} Portfolios`;
  let parent = getCommonFolder('IACS Portfolios');
  let yogFolder = getCommonFolder(title,parent)
  return yogFolder;
}

function getPortfolioDataSheet () {
  let portfolioSheet = getPortfolioSpreadsheet();
  return DataSheet(portfolioSheet,"Portfolios",["sid","email","title","yog","url","shared"],'sid');
}

function setupCoreSheet () {
  let sheet = getPortfolioSpreadsheet();
  let settingsDataSheet = DataSheet(sheet,"Settings",["key","url"],"key");
  settingsDataSheet.updateRow({
    key:'PORTFOLIO_DATA_SHEET',url:sheet.getUrl()
  });
  let home = getCommonFolder(PORTFOLIO_HOME);
  settingsDataSheet.updateRow(
    {key:'PORTFOLIO_HOME',url:home.getUrl()}    
  );
}

function createPortfolio (title, yog, sid, email) {
  let yogFolder = getYOGFolder(yog);
  let portfolioFolder = getCommonFolder(title,yogFolder);  
  let portfolioDataSheet = getPortfolioDataSheet();
  let url = portfolioFolder.getUrl()
  portfolioDataSheet.updateRow(
    {url,email,title,yog,sid}
  );  
  return url;
}

function sharePortfolio (sid) {
  let dataSheet = getPortfolioDataSheet();
  let row = dataSheet.getRow(sid);
  if (!row) {
    throw Error(`Portfolio not found for ${sid}`);
  }
  let folder = getPortfolioFolder(sid);
  let result = Drive.Permissions.insert(
        {role:'writer',
        type:'user',
        value:row.email},
        folder.getId(),
        {
          sendNotificationsEmail : 'true',
          emailMessage : "This google drive folder is your portfolio. Please add a shortcut to it to your drive so you'll be able to find it and add to it when your teachers ask you to."
        }
  );
  dataSheet.updateRow({...row,shared:true})
  return result;
}

function testShare () {
  sharePortfolio('22179');
}

function test () {
  createPortfolio('Tom Hinkle - test Portfolio','1997','02-21-79','thinkle@innovationcharter.org');
}