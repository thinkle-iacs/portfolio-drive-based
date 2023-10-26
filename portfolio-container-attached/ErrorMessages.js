function showErrorToUser(head, msg, detail, errorObject) {
  const template = HtmlService.createTemplateFromFile("ErrorPage");
  template.head = head;
  template.msg = msg;
  template.detail = detail;
  template.errorMessage = errorObject.message;
  template.errorName = errorObject.name;
  template.errorStack = errorObject.stack;
  const htmlOutput = template
    .evaluate()
    .setTitle(head)
    .setWidth(800)
    .setHeight(600);

  SpreadsheetApp.getUi().showModelessDialog(htmlOutput, head);
}
