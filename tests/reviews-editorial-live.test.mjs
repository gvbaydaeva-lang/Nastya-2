import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/reviews-editorial.css", import.meta.url), "utf8");

test("uses the selected Nastya portrait in the existing about block", () => {
  assert.match(html, /class="curator__photo-img"[\s\S]*src="настя2\.jpg"/);
});

test("keeps the new visual treatment scoped from reviews through the footer", () => {
  assert.match(css, /#reviews\.section--dark/);
  assert.match(css, /#curator\.section/);
  assert.match(css, /#faq\.section--tight/);
  assert.match(css, /#contacts\.cta-final/);
  assert.match(css, /#contacts[\s\S]*--ed-terra/);
  assert.doesNotMatch(css, /#support|#directions|#tariffs/);
});
