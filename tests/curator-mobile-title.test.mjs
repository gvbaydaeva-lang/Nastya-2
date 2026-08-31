import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);
const cssUrl = new URL("../css/reviews-editorial.css", import.meta.url);

test("mobile curator section introduces the photo with its heading", () => {
  const html = fs.readFileSync(pageUrl, "utf8");
  const css = fs.readFileSync(cssUrl, "utf8");
  const curator = html.match(/<section class="section" id="curator">[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(curator, /curator__title--mobile[\s\S]*Обо мне[\s\S]*curator__photo/);
  assert.match(curator, /curator__title--desktop[\s\S]*Обо мне/);
  assert.match(css, /curator__title--mobile\s*\{\s*display:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*curator__title--mobile[\s\S]*display:\s*block/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*curator__title--desktop[\s\S]*display:\s*none/);
});
