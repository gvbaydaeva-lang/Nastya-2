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
})();
