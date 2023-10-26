function getNamedChildFolder(parent, name) {
  let matching = parent.getFoldersByName(name);
  if (matching.hasNext()) {
    return matching.next();
  } else {
    return parent.createFolder(name);
  }
}

function addTemplate(sid, templateUrl, parentNames, suffix = "") {
  let portfolio = getPortfolioFolder(sid);
  if (portfolio) {
    let folder = portfolio;
    for (let i = 0; i < parentNames.length; i++) {
      folder = getNamedChildFolder(folder, parentNames[i]);
    }
    let id = getIdFromUrl(templateUrl);
    let original = DriveApp.getFileById(id);
    if (suffix) {
      suffix = ` ${suffix}`;
    }
    let targetName = original.getName() + suffix;
    // Check if a file with the target name already exists
    let existingFiles = folder.getFilesByName(targetName);
    if (existingFiles.hasNext()) {
      // File already exists, return its URL
      return existingFiles.next().getUrl();
    } else {
      // File doesn't exist, make a copy
      let copy = original.makeCopy(targetName, folder);
      return copy.getUrl();
    }
  } else {
    return false;
  }
}

function testAddTemplate() {
  addTemplate(
    1234,
    "https://docs.google.com/document/d/192VIvTFjKZmfdydgMkizfTomv98lnc1ba3aZNhcnclQ/edit",
    ["Overview Test"],
    "Test Student"
  );
}
