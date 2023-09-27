
function DataSheet (ss, sheetname, columns, idheader) {
  let existing = ss.getSheetByName(sheetname);
  if (existing) {
    return Table(existing.getDataRange(),idheader)
  } else {
    let newSheet = ss.insertSheet();
    newSheet.setName(sheetname);
    newSheet.appendRow(columns);
    return Table(newSheet.getDataRange(),idheader);
  }    
}
