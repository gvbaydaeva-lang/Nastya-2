(function () {
  "use strict";

  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced) {
    var revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Направления: скролл-список + появление карточек при прокрутке (AnimatedList) */
  function initDirectionsScrollList() {
    var wrap = document.getElementById("directions-scroll");
    var list = document.getElementById("directions-scroll-list");
    if (!wrap || !list) return;

    var cards = list.querySelectorAll(".direction-card--entrance");
    if (!cards.length) return;

    function updateScrollGradients() {
      var scrollTop = list.scrollTop;
      var scrollHeight = list.scrollHeight;
      var clientHeight = list.clientHeight;
      var canScroll = scrollHeight > clientHeight + 2;

      wrap.classList.toggle("is-scrollable", canScroll);

      if (!canScroll) {
        wrap.classList.remove("is-scrolled-top", "is-scrolled-mid", "is-scrolled-bottom");
        return;
      }

      var atTop = scrollTop <= 4;
      var atBottom = scrollTop + clientHeight >= scrollHeight - 4;

      wrap.classList.toggle("is-scrolled-top", atTop);
      wrap.classList.toggle("is-scrolled-bottom", atBottom);
      wrap.classList.toggle("is-scrolled-mid", !atTop && !atBottom);
    }

    function revealAllCards() {
      cards.forEach(function (card) {
        card.classList.add("is-inview");
      });
    }

    if (prefersReduced) {
      revealAllCards();
      updateScrollGradients();
      list.addEventListener("scroll", updateScrollGradients, { passive: true });
      window.addEventListener("resize", updateScrollGradients);
      return;
    }

    if ("IntersectionObserver" in window) {
      var cardIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              cardIo.unobserve(entry.target);
            }
          });
        },
        {
          root: list,
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.35
        }
      );

      cards.forEach(function (card) {
        cardIo.observe(card);
      });
    } else {
      revealAllCards();
    }

    list.addEventListener("scroll", updateScrollGradients, { passive: true });
    window.addEventListener("resize", updateScrollGradients);
    updateScrollGradients();

    /* Первые карточки в видимой зоне — сразу после отрисовки */
    window.requestAnimationFrame(function () {
      updateScrollGradients();
    });
  }

  initDirectionsScrollList();

  /* Тарифы: горизонтальная лента, появление по одной, лёгкий параллакс при скролле */
  function initTariffsFeed() {
    var feed = document.getElementById("tariffs-feed");
    var track = document.getElementById("tariffs-track");
    if (!feed || !track) return;

    var cards = track.querySelectorAll(".tariff-slide--entrance");
    if (!cards.length) return;

    function updateFeedEdges() {
      var scrollLeft = feed.scrollLeft;
      var scrollWidth = feed.scrollWidth;
      var clientWidth = feed.clientWidth;
      var canScroll = scrollWidth > clientWidth + 2;

      feed.classList.toggle("is-scrollable", canScroll);

      if (!canScroll) {
        feed.classList.remove("is-scrolled-start", "is-scrolled-end", "is-scrolled-mid");
        return;
      }

      var atStart = scrollLeft <= 4;
      var atEnd = scrollLeft + clientWidth >= scrollWidth - 4;

      feed.classList.toggle("is-scrolled-start", atStart);
      feed.classList.toggle("is-scrolled-end", atEnd);
      feed.classList.toggle("is-scrolled-mid", !atStart && !atEnd);
    }

    var mobileTariffMq =
      window.matchMedia && window.matchMedia("(max-width: 767px)");

    function isMobileTariffView() {
      return mobileTariffMq && mobileTariffMq.matches;
    }

    function updateTariffParallax() {
      if (prefersReduced) return;

      var feedRect = feed.getBoundingClientRect();
      var feedCenter = feedRect.left + feedRect.width * 0.5;
      var mobile = isMobileTariffView();

      cards.forEach(function (card) {
        if (!card.classList.contains("is-inview")) return;

        /* На мобиле карточка 2: без дробного сдвига — иначе Safari размывает JPEG */
        if (mobile && card.getAttribute("data-tariff") === "2") {
          card.style.setProperty("--tariff-lift", "0px");
          return;
        }

        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width * 0.5;
        var dist = (cardCenter - feedCenter) / Math.max(feedRect.width, 1);
        var lift = dist * -14;

        card.style.setProperty("--tariff-lift", lift.toFixed(2) + "px");
      });
    }

    function revealAllTariffs() {
      cards.forEach(function (card) {
        card.classList.add("is-inview");
      });
      updateTariffParallax();
    }

    function updateCard2Centered() {
      if (!isMobileTariffView()) {
        feed.classList.remove("tariffs-feed--card-2-centered");
        return;
      }

      var card2 = track.querySelector('[data-tariff="2"]');
      if (!card2) return;

      var feedRect = feed.getBoundingClientRect();
      var cardRect = card2.getBoundingClientRect();
      var feedCenter = feedRect.left + feedRect.width * 0.5;
      var cardCenter = cardRect.left + cardRect.width * 0.5;
      var centered = Math.abs(cardCenter - feedCenter) < Math.max(28, cardRect.width * 0.14);

      feed.classList.toggle("tariffs-feed--card-2-centered", centered);
    }

    function onFeedScroll() {
      updateFeedEdges();
      updateTariffParallax();
      updateCard2Centered();
    }

    if (prefersReduced) {
      revealAllTariffs();
      updateFeedEdges();
      feed.addEventListener("scroll", onFeedScroll, { passive: true });
      window.addEventListener("resize", updateFeedEdges);
      return;
    }

    if ("IntersectionObserver" in window) {
      var cardIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              cardIo.unobserve(entry.target);
              updateTariffParallax();
              updateCard2Centered();
            }
          });
        },
        {
          root: feed,
          rootMargin: "0px 8% 0px 8%",
          threshold: 0.28
        }
      );

      cards.forEach(function (card) {
        cardIo.observe(card);
      });
    } else {
      revealAllTariffs();
    }

    feed.addEventListener("scroll", onFeedScroll, { passive: true });
    window.addEventListener("resize", function () {
      updateFeedEdges();
      updateTariffParallax();
      updateCard2Centered();
    });

    window.requestAnimationFrame(function () {
      updateFeedEdges();
      updateTariffParallax();
      updateCard2Centered();
    });
  }

  initTariffsFeed();

  /* Тарифы: полноэкранный просмотр изображения карточки */
  function initTariffPreviews() {
    var modal = document.getElementById("tariff-preview-modal");
    var previewBtns = document.querySelectorAll("[data-tariff-preview]");
    var pageRegions = document.querySelectorAll("body > header, body > main, body > footer");
    if (!modal || !previewBtns.length) return;

    var activeBtn = null;

    function setPageInert(inert) {
      pageRegions.forEach(function (region) {
        region.inert = inert;
      });
    }

    function openPreview(btn) {
      var image = modal.querySelector(".tariff-preview-modal__image");
      if (!image) return;

      image.setAttribute("src", btn.getAttribute("data-preview-src") || "");
      image.setAttribute("alt", btn.getAttribute("data-preview-alt") || "Тариф");
      activeBtn = btn;
      modal.removeAttribute("hidden");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("tariff-preview-open");
      setPageInert(true);

      var closeBtn = modal.querySelector(".tariff-preview-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    function closePreview() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      modal.setAttribute("hidden", "");
      document.body.classList.remove("tariff-preview-open");
      setPageInert(false);

      if (activeBtn) {
        activeBtn.focus();
        activeBtn = null;
      }
    }

    previewBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openPreview(btn);
      });
    });

    modal.querySelectorAll("[data-close-tariff-preview]").forEach(function (el) {
      el.addEventListener("click", closePreview);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closePreview();
      }
    });
  }

  initTariffPreviews();

  /* Попапы выбора способа оплаты — тарифы */
  function initPaymentModals() {
    var modal = document.getElementById("payment-modal");
    var title = document.getElementById("payment-modal-title");
    var options = document.getElementById("payment-modal-options");
    var openBtns = document.querySelectorAll("[data-payment-tariff]");
    var pageRegions = document.querySelectorAll("body > header, body > main, body > footer");
    if (!modal || !title || !options || !openBtns.length || !window.PaymentModal) return;

    var activeBtn = null;

    function setPageInert(inert) {
      pageRegions.forEach(function (region) {
        region.inert = inert;
      });
    }

    function openModal(btn) {
      var tariffKey = btn.getAttribute("data-payment-tariff");
      var rendered = window.PaymentModal.renderPaymentOptions(
        tariffKey,
        title,
        options,
        document
      );
      if (!rendered) return;

      activeBtn = btn;
      modal.removeAttribute("hidden");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("payment-modal-open");
      setPageInert(true);

      var closeBtn = modal.querySelector(".payment-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal(modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("payment-modal-open");
      modal.setAttribute("hidden", "");
      setPageInert(false);

      if (activeBtn) {
        activeBtn.focus();
        activeBtn = null;
      }
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(btn);
      });
    });

    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal(modal);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        closeModal(modal);
        return;
      }

      if (e.key !== "Tab") return;

      var focusable = modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      var currentIndex = Array.prototype.indexOf.call(focusable, document.activeElement);
      var nextIndex = window.PaymentModal.getWrappedFocusIndex(
        currentIndex,
        focusable.length,
        e.shiftKey
      );

      if (nextIndex !== -1) {
        e.preventDefault();
        focusable[nextIndex].focus();
      }
    });
  }

  initPaymentModals();

  /* Отзывы: стопка карточек; смена только горизонтальным жестом по карточке (без scroll-trap) */
  function initReviewsStack() {
    var section = document.getElementById("reviews");
    var scroller = document.getElementById("reviews-stack-scroller");
    var stack = document.getElementById("reviews-stack");
    var sticky = scroller && scroller.querySelector(".reviews-stack-sticky");
    if (!section || !scroller || !stack || !sticky) return;

    var cards = stack.querySelectorAll(".review-card");
    var count = cards.length;
    if (count < 2) return;

    var activeIndex = 0;
    var isAnimating = false;
    var animLockMs = 520;
    var swipeThresholdPx = 48;
    var axisRatioTouch = 1.3;
    var axisRatioMouse = 1.12;

    function isMobileStack() {
      return window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
    }

    function setCardVars(card, vars) {
      Object.keys(vars).forEach(function (key) {
        card.style.setProperty(key, vars[key]);
      });
    }

    function applyStackState(currentTop, dismissT) {
      var mobile = isMobileStack();
      var stackYOffset = mobile ? 12 : 12;
      var stackRot = mobile ? 3.6 : 2.8;
      var stackScaleStep = mobile ? 0.03 : 0.028;
      var stackXStep = mobile ? 14 : 0;

      cards.forEach(function (card, i) {
        if (i < currentTop) {
          setCardVars(card, {
            "--dismiss-y": "-125%",
            "--dismiss-rot": "-9deg",
            "--stack-x": "0px",
            "--stack-y": "0px",
            "--stack-rot": "0deg",
            "--card-scale": "0.96",
            "--card-opacity": "0",
            "--card-z": "0"
          });
          return;
        }

        if (i === currentTop) {
          setCardVars(card, {
            "--dismiss-y": -dismissT * 118 + "%",
            "--dismiss-rot": -dismissT * 7 + "deg",
            "--stack-x": "0px",
            "--stack-y": "0px",
            "--stack-rot": "0deg",
            "--card-scale": String(1 - dismissT * 0.045),
            "--card-opacity": String(1 - dismissT * 0.9),
            "--card-z": "100"
          });
          return;
        }

        var sp = i - currentTop;
        setCardVars(card, {
          "--dismiss-y": "0%",
          "--dismiss-rot": "0deg",
          "--stack-x": stackXStep ? sp * stackXStep + "px" : "0px",
          "--stack-y": sp * stackYOffset + "px",
          "--stack-rot": sp * stackRot + "deg",
          "--card-scale": String(1 - sp * stackScaleStep),
          "--card-opacity": String(
            mobile ? Math.max(0.52, 1 - sp * 0.06) : Math.max(0.4, 1 - sp * 0.07)
          ),
          "--card-z": String(100 - sp)
        });
      });
    }

    function updateReviewsStack() {
      applyStackState(activeIndex, 0);
    }

    function goToIndex(nextIndex) {
      nextIndex = Math.max(0, Math.min(count - 1, nextIndex));
      if (isAnimating || nextIndex === activeIndex) return;
      isAnimating = true;
      activeIndex = nextIndex;
      updateReviewsStack();
      window.setTimeout(function () {
        isAnimating = false;
      }, animLockMs);
    }

    function bindCardGestures(card) {
      var startX = 0;
      var startY = 0;
      var tracking = false;
      var gestureHorizontal = false;
      var decided = false;
      var activePointerId = null;
      var activePointerType = "";

      function reset() {
        tracking = false;
        decided = false;
        gestureHorizontal = false;
        activePointerId = null;
        activePointerType = "";
      }

      function axisRatioFor(type) {
        return type === "touch" ? axisRatioTouch : axisRatioMouse;
      }

      card.addEventListener(
        "pointerdown",
        function (e) {
          if (isAnimating || e.button !== 0) return;
          tracking = true;
          decided = false;
          gestureHorizontal = false;
          activePointerId = e.pointerId;
          activePointerType = e.pointerType || "";
          startX = e.clientX;
          startY = e.clientY;
          try {
            card.setPointerCapture(e.pointerId);
          } catch (err) {}
        },
        { passive: true }
      );

      card.addEventListener(
        "pointermove",
        function (e) {
          if (
            !tracking ||
            activePointerId === null ||
            e.pointerId !== activePointerId
          )
            return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          if (!decided && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
            decided = true;
            var ratio = axisRatioFor(activePointerType);
            gestureHorizontal = Math.abs(dx) > Math.abs(dy) * ratio;
            if (!gestureHorizontal) {
              try {
                card.releasePointerCapture(activePointerId);
              } catch (err2) {}
              reset();
            }
          }
        },
        { passive: true }
      );

      card.addEventListener(
        "pointerup",
        function (e) {
          if (
            activePointerId === null ||
            e.pointerId !== activePointerId
          )
            return;
          try {
            card.releasePointerCapture(e.pointerId);
          } catch (err3) {}
          if (!tracking) return;
          if (!gestureHorizontal) {
            reset();
            return;
          }
          var dx = e.clientX - startX;
          if (!decided || Math.abs(dx) < swipeThresholdPx) {
            reset();
            return;
          }
          reset();
          if (dx < 0) goToIndex(activeIndex + 1);
          else goToIndex(activeIndex - 1);
        },
        { passive: true }
      );

      card.addEventListener(
        "pointercancel",
        function (e) {
          if (e.pointerId !== activePointerId) return;
          try {
            card.releasePointerCapture(e.pointerId);
          } catch (err4) {}
          reset();
        },
        { passive: true }
      );

      card.addEventListener(
        "lostpointercapture",
        function (e) {
          if (e.pointerId !== activePointerId) return;
          reset();
        },
        { passive: true }
      );
    }

    if (prefersReduced) {
      section.classList.add("reviews-stack--static");
      cards.forEach(function (card) {
        card.style.cssText = "";
      });
      return;
    }

    cards.forEach(bindCardGestures);

    window.addEventListener("resize", function () {
      updateReviewsStack();
    });

    activeIndex = 0;
    updateReviewsStack();
  }

  initReviewsStack();
})();
