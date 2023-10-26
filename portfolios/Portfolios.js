const PORTFOLIO_HOME = "IACS Portfolios";
const PORTFOLIO_SHEET = "IACS Portfolio Sheet";

function getPortfolioUrl(sid, title, yog, email) {
  let portfolioDataSheet = getPortfolioDataSheet();
  let existing = portfolioDataSheet.getRow(sid);
  if (existing) {
    return existing.url;
  } else if (title && yog && email) {
    return createPortfolio(title, yog, sid, email);
  }
}

function getPortfolioFolder(sid, title, yog, email) {
  let url = getPortfolioUrl(sid, title, yog, email);
  let portfolioId = getIdFromUrl(url);
  return DriveApp.getFolderById(portfolioId);
}

function getCommonFolder(key, parent) {
  // Try to grab folder info from PropertiesService
  // cached info...
  let props = PropertiesService.getScriptProperties();
  if (props.getProperty(key)) {
    let value = props.getProperty(key);
    console.log("Get prop...", value);
    let folder = DriveApp.getFolderById(value);
    if (parent) {
      folder.moveTo(parent);
    }
    return folder;
  } else {
    let folder;
    // If it's our hard-coded HOME, we go with that!
    if (key == PORTFOLIO_HOME && PORTFOLIO_HOME_HARDCODED) {
      let id = getIdFromUrl(PORTFOLIO_HOME_HARDCODED);
      folder = DriveApp.getFolderById(id);
    } else {
      // Ok, if not... check our data sheet
      let folderDataSheet = getFolderDataSheet();
      let existing = folderDataSheet.getRow(key);
      if (existing) {
        let folder = DriveApp.getFolderById(existing.folderId);
        if (!folder) {
          throw Error(
            `Unable to find folder ${existing.folderId} stored in folder sheet for key ${key}`
          );
        }
        return folder;
      } else {
        // Create folder!
        folder = DriveApp.createFolder(key);
        if (parent) {
          folder.moveTo(parent);
        }
        // Now cache it in props...
        let id = folder.getId();
        props.setProperty(key, id);
        // And in our sheet...
        let scriptId = ScriptApp.getScriptId();
        folderDataSheet.pushRow({ key, scriptId, folderId: id });
      }
    }

    return folder;
  }
}

function getPortfolioSpreadsheet() {
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
    props.setProperty(PORTFOLIO_SHEET, id);
    return sheet;
  }
}

function getYOGFolder(yog) {
  let title = `${yog} Portfolios`;
  let parent = getCommonFolder("IACS Portfolios");
  let yogFolder = getCommonFolder(title, parent);
  return yogFolder;
}

function getPortfolioDataSheet() {
  let portfolioSheet = getPortfolioSpreadsheet();
  return DataSheet(
    portfolioSheet,
    "Portfolios",
    ["sid", "email", "title", "yog", "url"],
    "sid"
  );
}

function getFolderDataSheet() {
  let folderSheet = getPortfolioSpreadsheet(); // or getMasterSpreadsheet if different
  return DataSheet(folderSheet, "Folders", ["key", "folderId"], "key");
}

function setupCoreSheet() {
  let sheet = getPortfolioSpreadsheet();
  let settingsDataSheet = DataSheet(sheet, "Settings", ["key", "url"], "key");
  settingsDataSheet.updateRow({
    key: "PORTFOLIO_DATA_SHEET",
    url: sheet.getUrl(),
  });
  let home = getCommonFolder(PORTFOLIO_HOME);
  settingsDataSheet.updateRow({ key: "PORTFOLIO_HOME", url: home.getUrl() });
}

function createPortfolio(title, yog, sid, email) {
  let yogFolder = getYOGFolder(yog);
  let portfolioFolder = getCommonFolder(title, yogFolder);
  let portfolioDataSheet = getPortfolioDataSheet();
  let url = portfolioFolder.getUrl();
  portfolioDataSheet.updateRow({ url, email, title, yog, sid });
  return url;
}

function testCreate() {
  createPortfolio(
    "Tom Hinkle - test Portfolio",
    "1997",
    "02-21-79",
    "thinkle@innovationcharter.org"
  );
}

function sharePortfolio(sid) {
  let dataSheet = getPortfolioDataSheet();
  let row = dataSheet.getRow(sid);
  if (!row) {
    throw Error(`Portfolio not found for ${sid}`);
  }
  let folder = getPortfolioFolder(sid);
  let result = Drive.Permissions.insert(
    { role: "writer", type: "user", value: row.email },
    folder.getId(),
    {
      sendNotificationsEmail: "true",
      emailMessage:
        "This google drive folder is your portfolio. Please add a shortcut to it to your drive so you'll be able to find it and add to it when your teachers ask you to.",
    }
  );
  dataSheet.updateRow({ sid, shared: true });
  return result;
}

function testShare() {
  sharePortfolio("22179");
}

/* Convenience functions for handling cached properties */
function deleteCachedProperties() {
  let props = PropertiesService.getScriptProperties();
  let allProps = props.getProperties();

  for (let key in allProps) {
    props.deleteProperty(key);
  }
}

function pushPropertiesToSheet() {
  let folderDataSheet = getFolderDataSheet();
  let props = PropertiesService.getScriptProperties();
  let allProps = props.getProperties();
  let scriptId = ScriptApp.getScriptId();
  for (let key in allProps) {
    folderDataSheet.pushRow({ key, scriptId, folderId: allProps[key] });
    // Optional: You might want to clear the property after dumping it to the sheet
    // props.deleteProperty(key);
  }
}
