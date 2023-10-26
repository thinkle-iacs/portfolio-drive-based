function addShortcut(sid, root, parents) {
  let portfolio = getPortfolioFolder(sid);
  if (!portfolio) {
    return false;
  }
  let topLevel = getCommonFolder(PORTFOLIO_HOME, PORTFOLIO_HOME);
  let parentFolder = getCommonFolder(root, root, topLevel);
  for (let p of parents) {
    parentFolder = getNamedChildFolder(parentFolder, p);
  }
  let shortcut = DriveApp.createShortcut(portfolio.getId());
  shortcut.moveTo(parentFolder);
  return shortcut.getUrl();
}
