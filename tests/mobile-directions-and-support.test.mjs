import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);
const mobileCssUrl = new URL("../css/mobile-directions-labels.css", import.meta.url);
const approvedThemeUrl = new URL("../css/approved-visual-theme.css", import.meta.url);
const notebookImageUrl = new URL("../assets/support-notebook-pen.png", import.meta.url);

test("mobile directions use a dedicated in-circle label layout", () => {
  const html = fs.readFileSync(pageUrl, "utf8");
  const css = fs.readFileSync(mobileCssUrl, "utf8");

  assert.match(html, /directions-map__labels--mobile/);
  assert.match(html, />Нейросети<\/text>/);
  assert.match(html, />WB \/ OZON<\/text>/);
  assert.match(html, />TELEGRAM<\/text>/);
  assert.match(css, /directions-map__labels--mobile\s*\{\s*display:\s*none/);
  assert.match(css, /directions-map__labels--mobile\s*\{[\s\S]*display:\s*block/);
  assert.match(css, /directions-map__labels--desktop\s*\{[\s\S]*display:\s*none/);
});

test("support quotation uses the notebook image and the audience card has no mini route", () => {
  const html = fs.readFileSync(pageUrl, "utf8");
  const css = fs.readFileSync(approvedThemeUrl, "utf8");

  assert.ok(fs.existsSync(notebookImageUrl), "missing notebook and pen visual");
  assert.match(css, /support-notebook-pen\.png/);
  assert.doesNotMatch(html, /preview-mini-route/);
});
