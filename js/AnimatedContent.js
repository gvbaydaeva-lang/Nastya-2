/**
 * AnimatedContent — vanilla JS (логика как в React-компоненте).
 * Требует GSAP + ScrollTrigger (подключить до этого файла).
 */
(function (global) {
  "use strict";

  if (typeof gsap === "undefined") {
    console.warn("AnimatedContent: GSAP не загружен");
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /**
   * @param {HTMLElement} el
   * @param {Object} options
   * @returns {function|undefined} cleanup
   */
  function mountAnimatedContent(el, options) {
    if (!el) return;

    options = options || {};
    var container = options.container;
    var distance = options.distance !== undefined ? options.distance : 60;
    var direction = options.direction || "vertical";
    var reverse = options.reverse !== false;
    var duration = options.duration !== undefined ? options.duration : 0.9;
    var ease = options.ease || "power3.out";
    var initialOpacity = options.initialOpacity !== undefined ? options.initialOpacity : 0;
    var animateOpacity = options.animateOpacity !== false;
    var scale = options.scale !== undefined ? options.scale : 1;
    var threshold = options.threshold !== undefined ? options.threshold : 0.15;
    var delay = options.delay !== undefined ? options.delay : 0;

    var scrollerTarget = container || document.getElementById("snap-main-container") || null;

    if (typeof scrollerTarget === "string") {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    var axis = direction === "horizontal" ? "x" : "y";
    var offset = reverse ? -distance : distance;
    var startPct = (1 - threshold) * 100;

    gsap.set(el, {
      [axis]: offset,
      scale: scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: "visible"
    });

    var tl = gsap.timeline({
      paused: true,
      delay: delay
    });

    tl.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration: duration,
      ease: ease
    });

    var st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget,
      start: "top " + startPct + "%",
      once: true,
      onEnter: function () {
        tl.play();
      }
    });

    return function cleanup() {
      st.kill();
      tl.kill();
    };
  }

  /**
   * Инициализация по data-атрибутам на элементе.
   * @param {HTMLElement} el
   */
  function initFromElement(el) {
    var delay = parseFloat(el.getAttribute("data-delay") || "0", 10);
    var distance = parseFloat(el.getAttribute("data-distance") || "60", 10);
    var threshold = parseFloat(el.getAttribute("data-threshold") || "0.15", 10);

    el.style.visibility = "hidden";

    return mountAnimatedContent(el, {
      delay: isNaN(delay) ? 0 : delay,
      distance: isNaN(distance) ? 60 : distance,
      threshold: isNaN(threshold) ? 0.15 : threshold
    });
  }

  global.AnimatedContent = {
    mount: mountAnimatedContent,
    init: initFromElement
  };
})(typeof window !== "undefined" ? window : this);
