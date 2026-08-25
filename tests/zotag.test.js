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
  ZoTag.init({ rootURI: "file:///zotag/", version: "1.0.8" });
  ZoTag.addToWindow(window);
  ZoTag.addToWindow(window);

  assert.equal(nodes.size, 1);
  const stylesheet = nodes.get("zotag-chip-styles");
  assert.equal(stylesheet.tag, "link");
  assert.equal(stylesheet.rel, "stylesheet");
  assert.equal(stylesheet.href, "file:///zotag/zotag.css?v=1.0.8");

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

test("styles the library tag selector as shaded chips", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  assert.match(css, /#zotero-tag-selector \.tag-selector-list \.tag-selector-item\s*\{/);
  assert.match(css, /\.tag-selector-item::after\s*\{[^}]*background-color:\s*#e1e6ea/s);
  assert.match(css, /\.tag-selector-item\s*\{[^}]*border-radius:\s*7px/s);
  assert.match(css, /\.tag-selector-item::after\s*\{[^}]*inset:\s*1px 2px/s);
  assert.doesNotMatch(css, /tags-box|\.zotero-box-label/);
});

test("darkens chips on hover and preserves colored-tag identity", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  assert.match(css, /\.tag-selector-item:hover:not\(\.disabled\)::after\s*\{[^}]*background-color:\s*#d2d9df/s);
  assert.match(css, /\.tag-selector-item\.selected::after\s*\{[^}]*background-color:/s);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.doesNotMatch(css, /\.colored[^}]*display:\s*none/s);
});

test("targets Zotero 10 library tag-selector markup without changing tag data", () => {
  const css = fs.readFileSync("zotag.css", "utf8");
  const script = fs.readFileSync("zotag.js", "utf8");
  assert.match(css, /#zotero-tag-selector/);
  assert.match(css, /\.tag-selector-list/);
  assert.match(css, /\.tag-selector-item/);
  assert.doesNotMatch(script, /getTags|setTags|addTag|removeTag/);
});
