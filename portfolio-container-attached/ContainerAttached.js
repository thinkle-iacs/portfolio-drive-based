function onOpen(e) {
  let ui = SpreadsheetApp.getUi();
  let templateMenu = createTemplateMenu(ui);
  let shortcutMenu = createShortcutMenu(ui);
  let portfolioMenu = createPortfolioMenu(ui);
  let deleteMenu = createDeleteMenu(ui);
  ui.createMenu("IACS Portfolios")
    .addItem("Authorize", "authorizeScript")
    .addSeparator()
    .addSubMenu(templateMenu)
    .addSubMenu(shortcutMenu)
    .addSubMenu(portfolioMenu)
    .addSubMenu(deleteMenu)
    .addToUi();
}

function authorizeScript() {
  SpreadsheetApp.getUi().alert("Ready to roll!");
}
