const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const paymentModal = require(path.join(projectRoot, "js/payment-modal.js"));

const expectedTariffs = {
  base: {
    name: "Базовый",
    options: [
      ["Оплата картой / кредиткой — 2 500 ₽", "https://qr.nspk.ru/BD10007NSJ14O85F932AK2L6LF4NFV8M"]
    ]
  },
  standard: {
    name: "Стандарт",
    options: [
      ["Оплата картой / кредиткой — 4 000 ₽", "https://qr.nspk.ru/BD10006AUBEM8VJA9329PK5U9JDORGMA"]
    ]
  },
  premium: {
    name: "Премиум",
    options: [
      ["Оплата картой / кредиткой", "https://qr.nspk.ru/AD100026ALFJ66039KOB7VM62QII5PFM"],
      ["Рассрочка 3–6 месяцев", "https://forma.tbank.ru/online/sso/218fae51-10da-465c-87fc-2011df4ebae2"]
    ]
  },
  vip: {
    name: "VIP",
    options: [
      ["Оплата картой / кредиткой", "https://qr.nspk.ru/BD10001P5SA7PGSV9SRA1TMVP4QJ2FON"],
      ["Рассрочка 3–10 месяцев", "https://forma.tbank.ru/online/sso/c3e716dd-4c7a-4de8-8562-815a684e4fda"]
    ]
  },
  neurostat: {
    name: "Нейростат",
    options: [
      ["Оплата картой / кредитной", "https://qr.nspk.ru/BD20002DLUP82MFM8AD9R6BG0BB4IF13"]
    ]
  },
  infographic: {
    name: "Инфографика",
    options: [
      ["Оплата картой / кредитной", "https://qr.nspk.ru/BD20002U4T12753O9M8AH6BK7HV1BK9B"],
      ["Рассрочка 3 месяца", "https://forma.tbank.ru/online/sso/89304efd-5dcf-4059-aebf-db2344ab9940"]
    ]
  },
  market: {
    name: "Маркетплейсы",
    options: [
      ["Оплата картой / кредиткой", "https://qr.nspk.ru/AD10002HVAKO55Q28SS9OPU2PAPPM2VS"],
      ["Рассрочка 3–4 месяца", "https://forma.tbank.ru/online/sso/d9321573-e146-40f6-a5ce-5bb0d557a859"]
    ]
  }
};

test("keeps the payment choices for each of the seven tariffs separate", () => {
  for (const [tariffKey, expected] of Object.entries(expectedTariffs)) {
    assert.deepEqual(paymentModal.getPaymentOptions(tariffKey), expected);
  }
});

test("renders only the selected tariff in the shared modal", () => {
  const title = { textContent: "" };
  const options = {
    children: [],
    replaceChildren(...children) {
      this.children = children;
    }
  };
  const fakeDocument = {
    createElement(tagName) {
      return {
        tagName,
        className: "",
        href: "",
        target: "",
        rel: "",
        textContent: ""
      };
    }
  };

  paymentModal.renderPaymentOptions("premium", title, options, fakeDocument);

  assert.equal(title.textContent, "Тариф «Премиум»: выберите способ оплаты");
  assert.deepEqual(
    options.children.map((link) => [link.textContent, link.href]),
    expectedTariffs.premium.options
  );

  paymentModal.renderPaymentOptions("base", title, options, fakeDocument);

  assert.equal(title.textContent, "Тариф «Базовый»: выберите способ оплаты");
  assert.deepEqual(
    options.children.map((link) => [link.textContent, link.href]),
    expectedTariffs.base.options
  );
});

test("wraps keyboard focus only at the edges of the shared modal", () => {
  assert.equal(paymentModal.getWrappedFocusIndex(0, 3, true), 2);
  assert.equal(paymentModal.getWrappedFocusIndex(2, 3, false), 0);
  assert.equal(paymentModal.getWrappedFocusIndex(1, 3, false), -1);
  assert.equal(paymentModal.getWrappedFocusIndex(1, 3, true), -1);
});

test("the page uses one shared dialog for all seven tariff buttons", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const modalTags = html.match(/<div class="payment-modal"/g) || [];
  const buttonTags = html.match(/<button[^>]+data-payment-tariff="[^"]+"[^>]*>/g) || [];
  const tariffKeys = buttonTags.map((tag) => tag.match(/data-payment-tariff="([^"]+)"/)[1]);

  assert.equal(modalTags.length, 1);
  assert.equal(buttonTags.length, 7);
  assert.deepEqual(tariffKeys, Object.keys(expectedTariffs));
  buttonTags.forEach((tag) => assert.match(tag, /aria-controls="payment-modal"/));
  assert.match(html, /<script src="js\/main\.js\?v=20260828-1"><\/script>/);
});
