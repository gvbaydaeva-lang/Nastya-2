(function () {
  "use strict";

  var section = document.getElementById("platform");
  if (!section) return;

  var animEls = section.querySelectorAll(".platform-fit__anim");
  if (!animEls.length) return;

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || typeof AnimatedContent === "undefined") {
    animEls.forEach(function (el) {
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  var cleanups = [];

  animEls.forEach(function (el) {
    var cleanup = AnimatedContent.init(el);
    if (typeof cleanup === "function") {
      cleanups.push(cleanup);
    }
  });
})();
