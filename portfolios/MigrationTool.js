/**
 * This code is set up for "migrating" old style portfolios to new ones.
 *
 * We will begin with a sheet full of portfolios to migrate.
 * For that, we need LASID + email + URL of old portfolio.
 *
 * We will then check the old portfolio to see if it exists.
 * => If it does exist, we will move it into the new folder
 * => If it does not exist, we will REMOVE it from the folder.
 */

const MIGRATION_COLUMNS = [
  "sid",
  "email",
  "url",
  "title",
  "yog",
  "share",
  "shared",
  "migrated",
];

function migrateOldPortfolios() {
  let portfolioSheet = getPortfolioSpreadsheet();
  let migrationSheet = DataSheet(
    portfolioSheet,
    "Migration",
    MIGRATION_COLUMNS
  );
  for (let rn = 1; rn < migrationSheet.length; rn++) {
    let row = migrationSheet[rn];
    if (!row.migrated) {
      let sitesInfo = validateSitesUrl(row.url);
      if (sitesInfo) {
        let doc = createSitesDoc(row.title, sitesInfo.url, sitesInfo.title);
        let folder = getPortfolioFolder(row.sid, row.title, row.yog, row.email);
        doc.moveTo(folder);
        row.migrated = folder.getUrl();
      }
    }
    if (row.share) {
      let folder = getPortfolioFolder(row.sid, row.title, row.yog, row.email);
      let result = Drive.Permissions.insert(
        { role: "writer", type: "user", value: row.email },
        folder.getId(),
        {
          sendNotificationsEmail: "true",
          emailMessage:
            "Hello from the new portfolio tool. This google drive folder is your portfolio. Please add a shortcut to it to your drive so you'll be able to find it and add to it when your teachers ask you to. Please do not delete this folder or move it. If you're getting this, you're probably in Mr. Hinkle's advisory because he's just testing this out for the first time :-)",
        }
      );
      row.shared = result;
    }
  }
}

function createSitesDoc(docTitle, url, siteTitle) {
  let document = DocumentApp.create(`Google Site Link (${docTitle})`);
  let p = document
    .getBody()
    .appendParagraph(`Link to Google Site: ${siteTitle}`);
  p.setLinkUrl(url);
  return DriveApp.getFileById(document.getId());
}

function validateSitesUrl(url) {
  /* Reference code from our old permission fixer script here:
  https://script.google.com/u/0/home/projects/1ngLJfyO41zy6GFBmbMdurI067Kcmg2ZEj24XstG-2zjuoXfQGSCDeLmU/edit
  */
  if (url.match(/https?:\/\/sites.innovationcharter.org/)) {
    url = url.replace(
      /https?:\/\/sites.innovationcharter.org/,
      "https://sites.google.com/a/innovationcharter.org"
    );
  }
  console.log("Attempting to fetch URL:", url);
  try {
    var content = UrlFetchApp.fetch(url).getContentText("UTF-8");
    let titleMatch = content.match(/<title>([^<]+)<\/title/);
    if (titleMatch) {
      return {
        url,
        title: titleMatch[1],
      };
    }
  } catch (err) {
    console.log("Hit error", err);
    return null;
  }
}
