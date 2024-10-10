/**
 * StudentData
 *
 * We pull data from our student information system into google drive in the form
 * of a CSV file.
 *
 * The code here allows us to:
 * 1. Make a mapping from our LASID to Existing Portfolio Data
 * 2. Grab data from our CSV file (latest import from Aspen)
 * 3. Update our sheets with portfolios we need to create
 *    from AirTable
 * 4. Update templates as well based on the data we have
 ***/

const LASIDLOOKUP = "LasidLookup";
const LASIDLOOKUPTIME = "LasicTimestamp";
const LASTSUPDATE = "studentUpdate";

function updateStudentsIfNeeded() {
  let lastUpdate =
    PropertiesService.getScriptProperties().getProperty(LASTSUPDATE) || 0;
  let fileChange = DriveApp.getFileById(studentCSVID)
    .getLastUpdated()
    .getTime();
  console.log("Last update at ", lastUpdate);
  console.log("File changed at ", fileChange);
  if (fileChange > lastUpdate) {
    console.log("We need to update");
    checkForNewStudents();
    console.log("Udpate complete");
  } else {
    console.log("No need to update);");
  }
}

/* Do the update */
function checkForNewStudents() {
  let lookup = getLasidLookup();
  let data = readStudentCsvData();
  var templateSheet = getContainerYOGTemplateSheet();
  var containerPortfolioSheet = getContainerPortfolioSheet();

  console.log('Specifically',data.filter((r)=>r.psnNameLast.match(/mcguire/i)))
    
  for (let row of data) {    
    let lasid = row["relPsnStdOid.stdIDLocal"];
    let existingData = lookup[lasid];
    if (!existingData && lasid[0] == "0") {
      existingData = lookup[lasid.substr(1)];
    }
    if (!existingData) {
      console.info("Adding", row.psnNameLast, row.psnNameFirst);
      fields = {...row};
      for (let key in fieldMap) {
        fields[key] = fieldMap[key](row);
      }
      
      console.info("Got",fields);
      handleNewStudent(fields);
    }
    
  }

  
  function handleNewStudent ({
    Email, YOG, Advisor, Name, LASID,
    First, Last
  }) {
    containerPortfolioSheet.pushRow({
      [PM_TITLE]: `${Name}'s Digital Portfolio`,
      [PM_EMAIL]: Email,
      [SID]: LASID,
      [PM_FIRST]: First,
      [PM_LAST]: Last,
      [PM_MESSAGE]: `This google drive folder is your portfolio. Your Advisor will tell you more about this soon! Please save this email. If you know how to, make a shortcut to this folder on your Google Drive`,
      [PM_SHARE]: "TRUE",
      [PM_YOG]: YOG,
    });    
    let templatesByYOG = getTemplatesByYOG();
    if (templatesByYOG[YOG]) {
      let templates = templatesByYOG[YOG];
      for (let template of templates) {
        if (template.endDate && new Date() > new Date(template.endDate)) {
          console.log('Template expired, skipping:', template);
          continue
        }
         templateSheet.pushRow({
           [TURL]: template.template,
           [Email]: Email,
           [PARENTS]: template.parents,
           [COMPLETE]: false,
           [SID]: LASID,
           [NAME]: Name,
           [YOG]: YOG,
         });    
      }
    }
  }
}

function readStudentJsonFromCsv () {
  /* Read our CSV data and add some convenience fields */
  let data = readCsvToJson(studentCSVID);
  for (let row of data) {
    for (let field in fieldMap) {
      row[field] = fieldMap[field](row);
    }
  }
  return data;
}

var studentCsvData;

/* Get a list of students by YOG */
/* 
* @function getStudentsByYog
* @global 
*/
function getStudentsByYog(yog) {
  if (!studentCsvData) {
    // Read only once per run...
    studentCsvData = readStudentJsonFromCsv();
  }
  return studentCsvData.filter((r) => r.YOG == yog);
}


/* Grab Staff Data from CSV in Google Drive */
function readStudentCsvData() {
  return readCsvToJson(studentCSVID);  
}

var fieldMap = {
  Email: (r) => r.psnEmail01,
  //First: (r) => r.psnNameFirst,
  //Last: (r) => r.psnNameLast,
  YOG: (r) => r["relPsnStdOid.stdYog"],
  Advisor: (r) => r["relPsnStdOid.stdHomeroom"],
  Name: (r) => `${r.psnNameFirst} ${r.psnNameLast}`,
  First : (r) => r.psnNameFirst,
  Last : (r) => r.psnNameLast,
  LASID: (r) => r["relPsnStdOid.stdIDLocal"],
};


/* Get a lookup table to map Aspen PsnOid to Airtable record ID */
function getLasidLookup() {
  // Get a list of student LASIDs from our Portfolio Maker
  // Sheet...
  let lookup = {};
  let containerPortfolioSheet = getContainerPortfolioSheet();
  let permanentPortfolioSheet = getPortfolioDataSheet();
  for (let rn=1; rn<containerPortfolioSheet.length; rn++) {
    let row = containerPortfolioSheet[rn];
    let sid = row[SID]; // student ID
    lookup[sid] = { container: row };
  }
  for (let rn=1; rn<permanentPortfolioSheet.length; rn++) {
    let row = permanentPortfolioSheet[rn];
    let sid = row[SID]; // student ID
    if (lookup[sid]) {
      lookup[sid].permanent = row;
    } else {
      lookup[sid] = { permanent: row };
    }
  }
  return lookup;
}
