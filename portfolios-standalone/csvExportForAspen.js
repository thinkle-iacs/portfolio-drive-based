/// <reference types="/usr/local/lib/node_modules/@types/google-apps-script" />

/* Our DP import looks like:

LASID,DP

And our Link import (for the alerts) looks like:
LASID,Desc
LASID,<a href="URL">URL</a>
*/

function exportAspenCsvFromPortfolioData() {
  let dataSheet = getPortfolioDataSheet();
  let toPush = [];
  for (let row of dataSheet) {
    if (row.url && !row[EXPORTED_TO_ASPEN]) {
      toPush.push(row);
    }
  }
  createDPAspenImportCsvFiles(toPush);
  for (let row of toPush) {
    row[EXPORTED_TO_ASPEN] = true;
  }
}

function createDPAspenImportCsvFiles(data) {
  let urlCsv = data.map((row) => `${fixLasid(row.sid)},${row.url}`).join("\n");
  let linkCsv = data.map(
    (row) => `${fixLasid(row.sid)},<a href="${row.url}">${row.url}</a>`
  );
  writeData("DPImport.csv", urlCsv);
  writeData("DPLinkExport.csv", linkCsv);
}

function fixLasid(id) {
  id = "" + id;
  while (id.length < 5) {
    id = "0" + id;
  }
  return id;
}

/* This code duplicates some old code which can be found here:
 * https://script.google.com/u/0/home/projects/1Q-4oqTTM8XnPyBHSmYt9acJcw2_41h0AXIB9rhfbE5hgftGTtAfGikEP/edit
 *
 * That said: we want this portfolio code to work in a stand-alone fashion
 * so we're not going to touch that old code :-)
 */

/***
This file has simple code to write code to our CSV uploads folder

That code will automatically get synced onto 
code.innovationcharter.org in the x2 account ~/uploads/
From there we can import to X2 :)
***/

function writeData(fileName, data) {
  file = getOrCreateFile(fileName);
  file.setContent(data);

  var outputFolderId = "0B_Wihdetm5vOanJqaVBMZ0dzZUE";

  function getOrCreateFile(fileName) {
    folder = DriveApp.getFolderById(outputFolderId);
    var files = folder.getFilesByName(fileName);
    if (files.hasNext()) {
      var file = files.next();
    }
    if (files.hasNext()) {
      throw "ERROR: MORE THAN ONE FILE WITH NAME???";
    }
    if (!file) {
      file = DriveApp.createFile(fileName, "");
      folder.addFile(file);
    }
    return file;
  }
}

function testWriteData() {
  writeData("hello.txt", "hello world\nhere is\nsome data");
}
