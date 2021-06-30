let promoteFormId = '19mCIVQftsqvyNucJlGkaCvb4d2w6CQibiyelKOdXjW8';
let sessionFormId = '1FAIpQLScvXb98QdeBSl-QgatWKRaZj_MW267K4KgcQqNxJmETqtng1g';
let itemIdMap = {
  "Your name": "1229604979",
  "Twitter handle": "2120066464",
  "Session title": "507105526",
  "Description": "1584054690",
  "Session type": "1673969671",
  "Level of audience": "112937989",
  "Session focus": "1616639240",
  "Tags": "1458376580"
};

function submit(event){
  let form = event.source;
  let formResponse = event.response;
  let prefilledUrl = buildURL(formResponse, sessionFormId, itemIdMap);

  sendEmailNotification(formResponse, prefilledUrl);
}


function testSubmit() {
  let form = FormApp.openById(promoteFormId);
  submit({
    "response": form.getResponses()[form.getResponses().length-1],
    "source": form
  });
}


function buildURL(formResponse, sessionFormId, itemIdMap) {
  let prefilledUrl = `https://docs.google.com/forms/d/e/${sessionFormId}/viewform?usp=pp_url`;
  let itemResponses = formResponse.getItemResponses();

  for (var i = 0; i < itemResponses.length; i++) {
    let itemResponse = itemResponses[i];
    Logger.log(itemResponse.getItem().getTitle());
    Logger.log(itemResponse.getResponse());
    prefilledUrl += `&entry.${itemIdMap[itemResponse.getItem().getTitle()]}=${encodeURIComponent(itemResponse.getResponse())}`;
  }
  Logger.log(prefilledUrl);
  return prefilledUrl;
}

function createSpreadsheetFormSubmitTrigger(){
  let promoteTalkForm = FormApp.openById(promoteFormId);
  let spreadsheetId = promoteTalkForm.getDestinationId();
  let spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  let sheets = spreadsheet.getSheets();
  let formId = promoteTalkForm.getId();

  for (var i = 0; i < sheets.length; i++) {
    linkedFormUrl = sheets[i].getFormUrl();
    if (linkedFormUrl && linkedFormUrl.includes(formId)) {
      ScriptApp.newTrigger("updateSpreadsheetResponseData")
        .forSpreadsheet(spreadsheet)
        .onFormSubmit()
        .create();
    }
  }
}

function updateSpreadsheetResponseData(event) {
  let sheet = event.range.getSheet();
  let titleRange = sheet.getRange(1, Object.keys(itemIdMap).length+3);
  titleRange.setValues([["Prefilled url"]]);
  let valuesRange = sheet.getRange(event.range.getLastRow(), Object.keys(itemIdMap).length+3);

  let formula = `="https://docs.google.com/forms/d/e/${sessionFormId}/viewform?usp=pp_url`
  for (key in event.namedValues) {
    formula += `&entry.${itemIdMap[key]}=${encodeURIComponent(event.namedValues[key][0])}`;
  }
  formula += '"'
  valuesRange.setFormula(formula);
}

function sendEmailNotification(formResponse, prefilledUrl){
  var email = formResponse.getRespondentEmail();

  GmailApp.sendEmail(
    email,
    '"Promote you MeasureCamp talk" form submitted',
    '',
    {
      from: 'europe@measurecamp.org',
      name: 'MeasureCamp Europe',
      htmlBody: `Happy to see you as a speaker!<br>
      During a welcome session of the MeasureCamp event a session board will be opened for registrations.<br>
      You will need to use <a href="${prefilledUrl}">your personalised pre-filled link</a> and simply select a timeslot for your talk.<br>
      See you soon.`
    }
  );
}


