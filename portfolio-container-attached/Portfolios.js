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
  if (url) {
    let portfolioId = getIdFromUrl(url);
    return ensureUntrashedFolder(DriveApp.getFolderById(portfolioId));
  }
}

function ensureUntrashedFolder(folder) {
  if (folder.isTrashed()) {
    console.warn(`Folder ${folder.getId()} was trashed; un-trashing!`);
    folder.setTrashed(false);
  }
  return folder;
}

function getCommonFolder(key, displayName, parent) {
  // Try to grab folder info from PropertiesService
  // cached info...
  const props = PropertiesService.getScriptProperties();
  let folder =
    getHardcodedFolder(key) ||
    getFolderFromProps(key) ||
    getFolderFromSheet(key);
  // Check if folder parent is parent
  if (folder && parent) {
    maybeMoveExistingFolder(folder, parent);
  }
  if (!folder) {
    folder = createFolder();
    folder.moveTo(parent);
  }
  return ensureUntrashedFolder(folder);

  function getFolderFromProps(key) {
    if (props.getProperty(key)) {
      let value = props.getProperty(key);
      console.log("Get prop...", value);
      return DriveApp.getFolderById(value);
    }
  }

  function getFolderFromSheet(key) {
    let folderDataSheet = getFolderDataSheet();
    let existing = folderDataSheet.getRow(key);
    if (existing) {
      try {
        return DriveApp.getFolderById(existing.folderId);
      } catch (err) {
        console.warn(
          `Unable to find folder ${existing.folderId} stored in folder sheet for key ${key}`
        );
        showErrorToUser(
          "Can't Access Folder",
          `Unable to access folder ${displayName} (${key}).`,
          `Found stored ID ${existing.folderId} in "Folders" tab of our master Portfolio Sheet`,
          err
        );
        throw err;
      }
    }
  }

  function getHardcodedFolder(key) {
    // If it's our hard-coded HOME, we go with that!
    if (key == PORTFOLIO_HOME && PORTFOLIO_HOME_HARDCODED) {
      let id = getIdFromUrl(PORTFOLIO_HOME_HARDCODED);
      try {
        return DriveApp.getFolderById(id);
      } catch (err) {
        showErrorToUser(
          "Can't Access Folder",
          "Unable to access folder ${displayName} (${key})",
          `Looking for hard-coded ID: ${id}`,
          err
        );
        console.warn("Unable to access hardcoded folder ID");
        throw err;
      }
    }
  }

  function createFolder() {
    // Create folder!
    let folder = DriveApp.createFolder(displayName);
    if (parent) {
      folder.moveTo(parent);
    }
    // Now cache it in props...
    let id = folder.getId();
    props.setProperty(key, id);
    // And in our sheet...
    let scriptId = ScriptApp.getScriptId();
    let folderDataSheet = getFolderDataSheet();
    folderDataSheet.pushRow({
      key,
      scriptId,
      displayName,
      folderId: id,
    });
    return folder;
  }

  function maybeMoveExistingFolder(folder, parent) {
    let parents = folder.getParents();
    const folderParent = parents.hasNext() && parents.next();
    // We move the folder if there's no current parent OR if
    // the current parent is wrong
    if (!(folderParent && folderParent.getId() === parent.getId())) {
      folder.moveTo(parent);
      if (folderParent) {
        // Warn If we moved it.
        console.warn(
          `Moved folder ${folder.getName()} from ${folderParent.getName()} to ${parent.getName()}
        ${folderParent.getId()}=>${parent.getId()}
        `
        );
      }
    }
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
    DriveApp.getFileById(id).moveTo(
      getCommonFolder(PORTFOLIO_HOME, PORTFOLIO_HOME)
    );
    props.setProperty(PORTFOLIO_SHEET, id);
    return sheet;
  }
}

function getYOGFolder(yog) {
  let title = `${yog} Portfolios`;
  let parent = getCommonFolder(PORTFOLIO_HOME, PORTFOLIO_HOME);
  let yogFolder = getCommonFolder(title, title, parent);
  return yogFolder;
}

let cachedDataSheet = null;
function getPortfolioDataSheet() {
  if (cachedDataSheet) {
    return cachedDataSheet;
  }
  let portfolioSheet = getPortfolioSpreadsheet();
  cachedDataSheet = DataSheet(
    portfolioSheet,
    "Portfolios",
    ["sid", "email", "title", "yog", "url"],
    "sid"
  );
  return cachedDataSheet;
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
  let home = getCommonFolder(PORTFOLIO_HOME, PORTFOLIO_HOME);
  settingsDataSheet.updateRow({ key: "PORTFOLIO_HOME", url: home.getUrl() });
}

function createPortfolio(title, yog, sid, email) {
  let yogFolder = getYOGFolder(yog);
  let portfolioFolder = getCommonFolder(sid, title, yogFolder);
  let portfolioDataSheet = getPortfolioDataSheet();
  let url = portfolioFolder.getUrl();
  portfolioDataSheet.updateRow({ url, email, title, yog, sid });
  return url;
}

function testCreate() {
  createPortfolio(
    "Tom's Test",
    "1997",
    787878788,
    "thinkle@innovationcharter.org"
  );
}
const DEFAULT_MESSAGE = `This google drive folder is your portfolio. Please add a shortcut to it to your drive so you'll be able to find it and add to it when your teachers ask you to.`;
function sharePortfolio(sid, msg = DEFAULT_MESSAGE) {
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
      emailMessage: msg,
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
