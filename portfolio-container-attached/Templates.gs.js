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
    let copy = original.makeCopy(original.getName() + suffix, folder);
    return copy.getUrl();
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
