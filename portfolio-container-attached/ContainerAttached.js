function onOpen (e) {
  let ui = SpreadsheetApp.getUi()
  let templateMenu = createTemplateMenu(ui);
  let shortcutMenu = createShortcutMenu(ui);
  let portfolioMenu = createPortfolioMenu(ui);
  ui.createMenu(
    "IACS Portfolios"
  )
  .addItem('Authorize','authorizeScript')
  .addSeparator()
  .addSubMenu(templateMenu)
  .addSubMenu(shortcutMenu)
  .addSubMenu(portfolioMenu)
  .addToUi();
}


function authorizeScript () {
  SpreadsheetApp.getUi().alert("Ready to roll!");
}
  
