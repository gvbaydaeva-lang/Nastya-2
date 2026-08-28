import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : force;
    if (enabled) this.add(name);
    else this.remove(name);
    return enabled;
  }
}

class FakeElement {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.childrenBySelector = new Map();
    this.childrenListsBySelector = new Map();
    this.style = { setProperty() {} };
    this.focused = false;
    this.inert = false;
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  dispatch(type, details = {}) {
    const event = { preventDefault() {}, ...details };
    (this.listeners.get(type) || []).forEach((handler) => handler(event));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  querySelector(selector) {
    return this.childrenBySelector.get(selector) || null;
  }

  querySelectorAll(selector) {
    return this.childrenListsBySelector.get(selector) || [];
  }

  focus() {
    this.focused = true;
  }
}

function loadPageScript() {
  const previewTrigger = new FakeElement({
    "data-tariff-preview": "tariff-preview-modal",
    "data-preview-src": "assets/tariffs/tariff-03.jpg?v=preview-test",
    "data-preview-alt": "Тариф «Премиум»"
  });
  const previewImage = new FakeElement();
  const closeButton = new FakeElement();
  const overlay = new FakeElement();
  const previewModal = new FakeElement({ hidden: "", "aria-hidden": "true" });
  const pageRegions = [new FakeElement(), new FakeElement(), new FakeElement()];
  previewModal.childrenBySelector.set(".tariff-preview-modal__image", previewImage);
  previewModal.childrenBySelector.set(".tariff-preview-modal__close", closeButton);
  previewModal.childrenListsBySelector.set("[data-close-tariff-preview]", [overlay, closeButton]);

  const documentListeners = new Map();
  const body = new FakeElement();
  const document = {
    body,
    activeElement: null,
    getElementById(id) {
      return id === "tariff-preview-modal" ? previewModal : null;
    },
    querySelector(selector) {
      if (selector === ".tariff-preview-modal.is-open" && previewModal.classList.contains("is-open")) {
        return previewModal;
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-tariff-preview]") return [previewTrigger];
      if (selector === "body > header, body > main, body > footer") return pageRegions;
      return [];
    },
    addEventListener(type, handler) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(handler);
    },
    dispatch(type, details = {}) {
      (documentListeners.get(type) || []).forEach((handler) => handler(details));
    }
  };

  const window = {
    matchMedia() {
      return { matches: true };
    },
    addEventListener() {},
    requestAnimationFrame(callback) {
      callback();
    }
  };

  const source = fs.readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
  vm.runInNewContext(source, { document, window });

  return {
    body,
    closeButton,
    document,
    overlay,
    pageRegions,
    previewImage,
    previewModal,
    previewTrigger
  };
}

test("clicking a tariff image opens its full preview", () => {
  const { body, closeButton, pageRegions, previewImage, previewModal, previewTrigger } = loadPageScript();

  previewTrigger.dispatch("click");

  assert.equal(previewModal.classList.contains("is-open"), true);
  assert.equal(previewModal.getAttribute("hidden"), null);
  assert.equal(previewModal.getAttribute("aria-hidden"), "false");
  assert.equal(previewImage.getAttribute("src"), "assets/tariffs/tariff-03.jpg?v=preview-test");
  assert.equal(previewImage.getAttribute("alt"), "Тариф «Премиум»");
  assert.equal(body.classList.contains("tariff-preview-open"), true);
  assert.equal(closeButton.focused, true);
  pageRegions.forEach((region) => assert.equal(region.inert, true));
});

test("the backdrop closes the tariff preview and returns focus", () => {
  const { body, overlay, pageRegions, previewModal, previewTrigger } = loadPageScript();

  previewTrigger.dispatch("click");
  overlay.dispatch("click");

  assert.equal(previewModal.classList.contains("is-open"), false);
  assert.equal(previewModal.getAttribute("hidden"), "");
  assert.equal(previewModal.getAttribute("aria-hidden"), "true");
  assert.equal(body.classList.contains("tariff-preview-open"), false);
  assert.equal(previewTrigger.focused, true);
  pageRegions.forEach((region) => assert.equal(region.inert, false));
});

test("Escape closes an open tariff preview", () => {
  const { document, previewModal, previewTrigger } = loadPageScript();

  previewTrigger.dispatch("click");
  assert.equal(previewModal.classList.contains("is-open"), true);

  document.dispatch("keydown", { key: "Escape" });

  assert.equal(previewModal.classList.contains("is-open"), false);
  assert.equal(previewModal.getAttribute("aria-hidden"), "true");
});
