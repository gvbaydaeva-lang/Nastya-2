const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const maxUrl = "https://max.ru/u/f9LHodD0cOIXeL9B0MaUblK6s6ZlVeR6LYzo1x71xv0ybiyzX1vz-I0mtxQ";

test("all tariff purchase links lead directly to MAX", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const tariffLinks = html.match(/<a\b[^>]*class="tariff-slide__buy"[^>]*>/g) || [];

  assert.equal(tariffLinks.length, 7);
  tariffLinks.forEach((link) => {
    assert.match(link, new RegExp(`href="${maxUrl}"`));
    assert.match(link, /target="_blank"/);
    assert.match(link, /rel="noopener noreferrer"/);
  });
});

test("the site no longer contains tariff payment UI or payment links", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const mainJs = fs.readFileSync(path.join(projectRoot, "js/main.js"), "utf8");

  assert.doesNotMatch(html, /data-payment-tariff|id="payment-modal"|js\/payment-modal\.js/);
  assert.doesNotMatch(mainJs, /initPaymentModals|PaymentModal|data-payment-tariff/);
  assert.equal(fs.existsSync(path.join(projectRoot, "js/payment-modal.js")), false);
});

test("the contact block keeps only Telegram, Instagram and MAX", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const labels = Array.from(
    html.matchAll(/<span class="cta-channel__label">([^<]+)<\/span>/g),
    (match) => match[1]
  );

  assert.deepEqual(labels, ["Telegram", "Instagram", "Max"]);
  assert.doesNotMatch(html, /wa\.me|WhatsApp/i);
});
