function getNamedChildFolder (parent, name) {  
  let matching = parent.getFoldersByName(name);
  if (matching.hasNext()) {
    return matching.next();
  } else {
    return parent.createFolder(name)
  }
}

function addTemplate (sid, templateUrl, parentNames) {
  let portfolio = getPortfolioFolder(sid);
  if (portfolio) {
    let folder = portfolio;
    for (let i=0; i<parentNames.length; i++) {
      folder = getNamedChildFolder (folder,parentNames[i]);
    }
    debugger;
    let id = getIdFromUrl(templateUrl);
    let copy = DriveApp.getFileById(id).makeCopy()
    copy.moveTo(folder);
    copy.setName(copy.getName().replace('Copy of ',''));
  }
}

function testAddTemplate () {
  addTemplate(
    1234, 
    "https://docs.google.com/document/d/192VIvTFjKZmfdydgMkizfTomv98lnc1ba3aZNhcnclQ/edit",
    ["2023-2024","Testing2","Also Nested"]
  )
}