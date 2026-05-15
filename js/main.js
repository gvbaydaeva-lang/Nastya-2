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

  /* Отзывы: стопка карточек, смена при скролле страницы */
  function initReviewsStack() {
    var section = document.getElementById("reviews");
    var scroller = document.getElementById("reviews-stack-scroller");
    var stack = document.getElementById("reviews-stack");
    if (!section || !scroller || !stack) return;

    var cards = stack.querySelectorAll(".review-card");
    var count = cards.length;
    if (count < 2) return;

    var ticking = false;

    function setCardVars(card, vars) {
      Object.keys(vars).forEach(function (key) {
        card.style.setProperty(key, vars[key]);
      });
    }

    function updateReviewsStack() {
      var start = scroller.offsetTop;
      var end = start + scroller.offsetHeight - window.innerHeight;
      var range = Math.max(end - start, 1);
      var p = (window.scrollY - start) / range;
      p = Math.max(0, Math.min(1, p));

      var raw = p * (count - 1);
      var currentTop = Math.min(Math.floor(raw), count - 1);
      var dismissT = raw - currentTop;
      var mobile =
        window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
      var stackYOffset = mobile ? 10 : 12;
      var stackRot = mobile ? 2.2 : 2.8;
      var stackScaleStep = mobile ? 0.024 : 0.028;

      cards.forEach(function (card, i) {
        if (i < currentTop) {
          setCardVars(card, {
            "--dismiss-y": "-125%",
            "--dismiss-rot": "-9deg",
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
          "--stack-y": sp * stackYOffset + "px",
          "--stack-rot": sp * stackRot + "deg",
          "--card-scale": String(1 - sp * stackScaleStep),
          "--card-opacity": String(Math.max(0.4, 1 - sp * 0.07)),
          "--card-z": String(100 - sp)
        });
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        updateReviewsStack();
        ticking = false;
      });
    }

    if (prefersReduced) {
      section.classList.add("reviews-stack--static");
      cards.forEach(function (card) {
        card.style.cssText = "";
      });
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateReviewsStack();
  }

  initReviewsStack();
})();
