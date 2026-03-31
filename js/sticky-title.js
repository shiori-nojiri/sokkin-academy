"use strict";
document.addEventListener("DOMContentLoaded", function () {
  var ems = Array.from(document.querySelectorAll("article[id] > .title em"));
  if (!ems.length) return;

  var update = function () {
    if (window.innerWidth >= 768) {
      /* PC: em is colored only while sticky (top ≈ 12rem from viewport top).
         When the article ends and em starts moving upward, top drops below
         the sticky value → remove outside → gray. */
      var stickyTop = parseFloat(getComputedStyle(document.documentElement).fontSize) * 12;
      ems.forEach(function (em) {
        var top = em.getBoundingClientRect().top;
        /* colored (outside) unless em has risen above sticky position = article ending */
        em.classList.toggle("outside", top >= stickyTop - 10);
      });
    } else {
      /* SP: colored while article is in viewport */
      ems.forEach(function (em) {
        var r = em.closest("article[id]").getBoundingClientRect();
        em.classList.toggle("outside", r.top < window.innerHeight && r.bottom > 0);
      });
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
});
