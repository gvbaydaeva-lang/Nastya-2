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

  /* Направления: поочерёдное появление карточек (адаптация AnimatedList) */
  function initDirectionsStagger() {
    var grid = document.getElementById("directions-grid");
    if (!grid) return;

    var cards = grid.querySelectorAll(".direction-card--entrance");
    if (!cards.length) return;

    var staggerMs = 90;

    function revealCards() {
      cards.forEach(function (card, index) {
        card.style.setProperty("--entrance-delay", index * staggerMs + "ms");
        card.classList.add("is-inview");
      });
    }

    if (prefersReduced) {
      revealCards();
      return;
    }

    if ("IntersectionObserver" in window) {
      var gridIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            revealCards();
            gridIo.unobserve(grid);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
      );
      gridIo.observe(grid);
    } else {
      revealCards();
    }
  }

  initDirectionsStagger();
})();