/* from: https://stackoverflow.com/questions/16840038/easiest-way-to-get-file-id-from-url-on-google-apps-script
 */
function getIdFromUrl(url) {
  return url.match(/[-\w]{25,}/);
}

let actionCount = 0;
function updateUiEvery(n) {
  actionCount++;
  if (actionCount % n == 0) {
    SpreadsheetApp.flush();
  }
}

function lasEq (a, b) {
  let aString = `${a}`;
  let bString = `${b}`;
  if (aString.trim() == bString.trim()) return true;
  aString = aString.replace(/^0/,'');
  bString = bString.replace(/^0/,'');
  return aString == bString;
}

