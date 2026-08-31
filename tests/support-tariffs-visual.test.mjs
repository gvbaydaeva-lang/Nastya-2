import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const supportCss = fs.readFileSync(new URL("../css/support-visual.css", import.meta.url), "utf8");
const themeCss = fs.readFileSync(new URL("../css/luxury-dark-theme.css", import.meta.url), "utf8");
const approvedThemeCss = fs.readFileSync(new URL("../css/approved-visual-theme.css", import.meta.url), "utf8");

test("the local first-four-block visual integration stays before tariffs", () => {
  const markers = ["preview-hero", "preview-audience", "directions-intro", "support__shell", "<!-- 6. Тарифы -->"];
  const positions = markers.map((marker) => html.indexOf(marker));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("the current live tariff cards remain unchanged", () => {
  const sources = [...html.matchAll(/data-preview-src="([^"]+)"/g)].map((match) => match[1].split("?")[0]);
  assert.deepEqual(sources, [
    "assets/tariffs/tariff-01.jpg",
    "assets/tariffs/tariff-02.jpg",
    "assets/tariffs/tariff-05.jpg",
    "assets/tariffs/tariff-06.jpg",
    "assets/tariffs/tariff-08.jpg",
    "assets/tariffs/tariff-07.jpg",
    "assets/tariffs/tariff-04.jpg",
  ]);
});

test("support and tariffs use the approved quiet visual treatment", () => {
  assert.match(supportCss, /--support-bg-quiet:\s*#1b211e/);
  assert.match(supportCss, /background:[\s\S]*var\(--support-bg-quiet\)/);
  assert.match(themeCss, /#tariffs\.section--tight/);
  assert.match(themeCss, /#tariffs\.section--tight \.tariffs-feed__fade--left/);
  assert.match(approvedThemeCss, /--font-sans:\s*"Golos Text"/);
  assert.match(approvedThemeCss, /--font-display:\s*"Literata"/);
  assert.match(approvedThemeCss, /#directions\.section--directions/);
  assert.match(approvedThemeCss, /#contacts\.cta-final/);
  assert.match(approvedThemeCss, /flex-wrap:\s*nowrap/);
});
