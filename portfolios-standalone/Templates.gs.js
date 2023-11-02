function getNamedChildFolder (parent, name) {  
  let matching = parent.getFoldersByName(name);
  if (matching.hasNext()) {
    return matching.next();
  } else {
    return parent.createFolder(name)
  }
}

function addTemplate (sid, templateUrl, parentNames, suffix='') {
  let portfolio = getPortfolioFolder(sid);
  if (portfolio) {
    let folder = portfolio;
    for (let i=0; i<parentNames.length; i++) {
      folder = getNamedChildFolder (folder,parentNames[i]);
    }
    let id = getIdFromUrl(templateUrl);
    let original = DriveApp.getFileById(id);
    let copy = original.makeCopy(original.getName()+suffix,folder);    
    return copy.getUrl();
  }
}

function testAddTemplate () {
  addTemplate(
    1234, 
    "https://docs.google.com/document/d/192VIvTFjKZmfdydgMkizfTomv98lnc1ba3aZNhcnclQ/edit",
    ["2023-2024","Testing2","Also Nested"]
  )
}

const TEMPLATE_COLUMNS = ['SID','Email','First','Last','YOG','Parent Folders','Template','Copied']
function addTemplatesFromSheet () {
  let portfolioSheet = getPortfolioSpreadsheet();
  let templateSheet = DataSheet(portfolioSheet,"Templates",TEMPLATE_COLUMNS);  
  for (let rn=1; rn<templateSheet.length; rn++) {
    let row = templateSheet[rn];
    if (!row.Copied && row.Template) {      
      let name = ''
      if (row.First && row.Last) {
        name = row.First+' '+row.Last
      }
      let suffix = ' - '+name;
      let url = addTemplate(row.SID,row.Template,row['Parent Folders'].split(','),suffix)
      row.Copied = url;
    }
  }
}




