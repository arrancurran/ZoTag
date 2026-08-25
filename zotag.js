var ZoTag = (() => {
  "use strict";

  const STYLE_ID = "zotag-chip-styles";
  let stylesheetURL;

  function init(options) {
    stylesheetURL = options.rootURI + "zotag.css?v=" + encodeURIComponent(options.version || "dev");
  }

  function addToWindow(window) {
    const doc = window?.document;
    if (!doc || doc.getElementById(STYLE_ID)) return;

    const stylesheet = doc.createElement("link");
    stylesheet.id = STYLE_ID;
    stylesheet.rel = "stylesheet";
    stylesheet.type = "text/css";
    stylesheet.href = stylesheetURL;
    doc.documentElement.appendChild(stylesheet);
  }

  function removeFromWindow(window) {
    window?.document?.getElementById(STYLE_ID)?.remove();
  }

  function addToAllWindows() {
    for (const window of Zotero.getMainWindows()) addToWindow(window);
  }

  function shutdown() {
    for (const window of Zotero.getMainWindows()) removeFromWindow(window);
  }

  return {
    init,
    addToWindow,
    removeFromWindow,
    addToAllWindows,
    shutdown,
    _test: { STYLE_ID }
  };
})();
