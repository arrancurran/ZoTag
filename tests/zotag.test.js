const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

function loadZoTag() {
  const context = vm.createContext({ console });
  vm.runInContext(fs.readFileSync("zotag.js", "utf8"), context);
  return context.ZoTag;
}

test("injects one scoped stylesheet and removes it cleanly", () => {
  const ZoTag = loadZoTag();
  const nodes = new Map();
  const document = {
    createElement: tag => ({
      tag,
      remove() { nodes.delete(this.id); }
    }),
    getElementById: id => nodes.get(id) || null,
    documentElement: {
      appendChild(node) { nodes.set(node.id, node); }
    }
  };
  const window = { document };
  ZoTag.init({ rootURI: "file:///zotag/", version: "1.0.4" });
  ZoTag.addToWindow(window);
  ZoTag.addToWindow(window);

  assert.equal(nodes.size, 1);
  const stylesheet = nodes.get("zotag-chip-styles");
  assert.equal(stylesheet.tag, "link");
  assert.equal(stylesheet.rel, "stylesheet");
  assert.equal(stylesheet.href, "file:///zotag/zotag.css?v=1.0.4");

  ZoTag.removeFromWindow(window);
  assert.equal(nodes.size, 0);
});

test("cache-busts the stylesheet URL with the installed version", () => {
  const bootstrap = fs.readFileSync("bootstrap.js", "utf8");
  const script = fs.readFileSync("zotag.js", "utf8");
  assert.match(bootstrap, /startup\(\{ version, rootURI \}\)/);
  assert.match(bootstrap, /ZoTag\.init\(\{ rootURI, version \}\)/);
  assert.match(script, /zotag\.css\?v=/);
});

test("styles tag rows as spaced, wrapping chips", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  assert.match(css, /tags-box \.body \.tags-box-list\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /tags-box \.body \.tags-box-list\s*\{[^}]*gap:\s*8px/s);
  assert.match(css, /tags-box \.body \.row\s*\{[^}]*border-radius:\s*8px/s);
  assert.match(css, /tags-box \.body \.row\s*\{[^}]*background-color:\s*#e1e6ea\s*!important/s);
});

test("darkens chips on hover and preserves colored-tag identity", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  assert.match(css, /\.row\s*\{[^}]*background-color:\s*#e1e6ea\s*!important/s);
  assert.match(css, /\.row:is\(:hover, :focus-within\)\s*\{[^}]*background-color:\s*#d2d9df\s*!important/s);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /\.row\s*\{[^}]*transition:\s*background-color 120ms ease/s);
  assert.match(css, /\.row\.has-color \.zotero-box-icon\s*\{[^}]*background:\s*var\(--tag-color\)/s);
});

test("targets Zotero 10 tag markup without changing tag data", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  const script = fs.readFileSync("zotag.js", "utf8");
  assert.match(css, /tags-box \.body \.row/);
  assert.match(css, /\.zotero-box-label/);
  assert.doesNotMatch(script, /getTags|setTags|addTag|removeTag/);
});
