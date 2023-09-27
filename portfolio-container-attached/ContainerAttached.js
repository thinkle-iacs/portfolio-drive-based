function onOpen (e) {
  let ui = SpreadsheetApp.getUi()
  let templateMenu = createTemplateMenu(ui);
  let shortcutMenu = createShortcutMenu(ui);
  ui.createMenu(
    "IACS Portfolios"
  )
  .addItem('Authorize','authorizeScript')
  .addSeparator()
  .addSubMenu(templateMenu)
  .addSubMenu(shortcutMenu)
  .addToUi();
}


function authorizeScript () {
  SpreadsheetApp.getUi().alert("Ready to roll!");
}
  
