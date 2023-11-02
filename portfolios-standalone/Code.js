function listGoogleSites() {
  let query = Utilities.formatString("mimeType='application/vnd.google-apps.site'");
  var files, pageToken, items = [];
  do {
    files = Drive.Files.list(
      {
        corpora : 'domain',
        includeItemsFromAllDrives : true,
        supportsAllDrives : true,
        
      q: query
      }
    );
    items = [...items,...files.items];
    pageToken = files.nextPageToken;
    console.log("up to ",items.length,"items...")
  } while (pageToken)
  console.log('Got',items.length,'items')
  for (let i of items) {
    console.log('Got ',i.title,i.alternateLink);
    console.log(i)
  }
}
