var ZoTag;

function log(message) {
  Zotero.debug(`ZoTag: ${message}`);
}

function install() {
  log("Installed");
}

async function startup({ version, rootURI }) {
  await Zotero.initializationPromise;
  Services.scriptloader.loadSubScript(rootURI + "zotag.js");
  ZoTag.init({ rootURI, version });
  ZoTag.addToAllWindows();
  log("Started");
}

function onMainWindowLoad({ window }) {
  ZoTag?.addToWindow(window);
}

function onMainWindowUnload({ window }) {
  ZoTag?.removeFromWindow(window);
}

function shutdown() {
  if (ZoTag) {
    ZoTag.shutdown();
    ZoTag = undefined;
  }
  log("Stopped");
}

function uninstall() {
  log("Uninstalled");
}
