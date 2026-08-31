import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);
const mobileCssUrl = new URL("../css/mobile-directions-labels.css", import.meta.url);
const approvedThemeUrl = new URL("../css/approved-visual-theme.css", import.meta.url);
const notebookImageUrl = new URL("../assets/support-notebook-pen.png", import.meta.url);

test("mobile directions labels remain inside the learning map", () => {
  const html = fs.readFileSync(pageUrl, "utf8");
  const css = fs.readFileSync(mobileCssUrl, "utf8");

  for (const label of ["wb-ozon", "telegram", "ai", "design"]) {
    assert.match(html, new RegExp(`directions-map__label--${label}`));
  }
  assert.match(css, /directions-map__label--wb-ozon[\s\S]*x:\s*78px/);
  assert.match(css, /directions-map__label--telegram[\s\S]*x:\s*78px/);
  assert.match(css, /directions-map__label--ai[\s\S]*x:\s*382px/);
  assert.match(css, /directions-map__label--design[\s\S]*x:\s*382px/);
});

test("support quotation uses the notebook image and the audience card has no mini route", () => {
  const html = fs.readFileSync(pageUrl, "utf8");
  const css = fs.readFileSync(approvedThemeUrl, "utf8");

  assert.ok(fs.existsSync(notebookImageUrl), "missing notebook and pen visual");
  assert.match(css, /support-notebook-pen\.png/);
  assert.doesNotMatch(html, /preview-mini-route/);
});
