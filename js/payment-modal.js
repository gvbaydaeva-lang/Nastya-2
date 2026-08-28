(function (root, factory) {
  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.PaymentModal = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var tariffs = {
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

  function getPaymentOptions(tariffKey) {
    var tariff = tariffs[tariffKey];
    if (!tariff) return null;

    return {
      name: tariff.name,
      options: tariff.options.map(function (option) {
        return option.slice();
      })
    };
  }

  function renderPaymentOptions(tariffKey, titleElement, optionsElement, documentRef) {
    var tariff = getPaymentOptions(tariffKey);
    if (!tariff) return false;

    titleElement.textContent = "Тариф «" + tariff.name + "»: выберите способ оплаты";

    var links = tariff.options.map(function (option) {
      var link = documentRef.createElement("a");
      link.className = "payment-modal__option btn btn--primary btn--block";
      link.href = option[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = option[0];
      return link;
    });

    optionsElement.replaceChildren.apply(optionsElement, links);
    return true;
  }

  function getWrappedFocusIndex(currentIndex, focusableCount, shiftKey) {
    if (focusableCount < 1) return -1;
    if (shiftKey && currentIndex <= 0) return focusableCount - 1;
    if (!shiftKey && currentIndex >= focusableCount - 1) return 0;
    return -1;
  }

  return {
    getPaymentOptions: getPaymentOptions,
    renderPaymentOptions: renderPaymentOptions,
    getWrappedFocusIndex: getWrappedFocusIndex
  };
});
