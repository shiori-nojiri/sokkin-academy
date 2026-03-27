"use strict";

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("loaded");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  /* contact banner scroll duplication */
  const contactScroller = document.querySelector("#contact .banner .scroller");
  if (contactScroller) {
    const items = Array.from(contactScroller.children);
    items.forEach((item) => {
      contactScroller.appendChild(item.cloneNode(true));
    });
  }

  /* horizontal scroll */
  const stickyContainer = document.querySelector("#issue .sticky_container");
  const scroller = stickyContainer.querySelector(".slide");
  scroller.classList.add("nobar");
  const page1 = stickyContainer.querySelector(".page1");
  const page2 = stickyContainer.querySelector(".page2");
  const footer = document.querySelector("#issue .footer");
  const syncScroll = () => {
    const rect = stickyContainer.getBoundingClientRect();
    const page1Rect = page1.getBoundingClientRect();
    const page2Rect = page2.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
      scroller.scrollLeft = window.scrollY - (rect.top + window.scrollY);
      if (scroller.scrollLeft >= scroller.clientWidth * 0.7) {
        footer.classList.add("visible");
      } else {
        // footer.classList.remove("visible");
      }
      if (page1Rect.left <= 0) {
        requestAnimationFrame(() => {
          page1.classList.add("finish");
        });
      } else {
        requestAnimationFrame(() => {
          page1.classList.remove("finish");
        });
      }
      if (page2Rect.left <= 0) {
        requestAnimationFrame(() => {
          page2.classList.add("finish");
        });
      } else {
        requestAnimationFrame(() => {
          page2.classList.remove("finish");
        });
      }
    } else if (rect.bottom < window.innerHeight) {
      scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
      requestAnimationFrame(() => {
        page1.classList.add("finish");
        page2.classList.add("finish");
      });
    } else {
      scroller.scrollLeft = 0;
      requestAnimationFrame(() => {
        page1.classList.remove("finish");
        page2.classList.remove("finish");
      });
    }
  };
  const issueObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", syncScroll, { passive: true });
          syncScroll();
        } else {
          window.removeEventListener("scroll", syncScroll);
        }
      });
    },
    { threshold: 0 },
  );
  issueObserver.observe(stickyContainer);

  //  fadein_article
  const handleFadeIn = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("outside");
        observer.unobserve(entry.target);
      } else {
        entry.target.classList.add("outside");
      }
    });
  };
  const fadeinObserver = new IntersectionObserver(handleFadeIn, { threshold: 0 });
  const elements = document.querySelectorAll("article:not(#point) .fadein, #issue .title em, #feature .fadein");
  elements.forEach((element) => {
    fadeinObserver.observe(element);
  });

  //  fadein_article half
  const handleOpen = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("outside");
        if (entry.target.querySelector("video")) {
          entry.target.querySelector("video").play();
        }
        observer.unobserve(entry.target);
      } else {
        entry.target.classList.add("outside");
      }
    });
  };
  const openObserver = new IntersectionObserver(handleOpen, { rootMargin: "0px 0px -50% 0px", threshold: 0 });
  const mocks = document.querySelectorAll("article[id] > .title em, #point .image.fadein");
  mocks.forEach((mock) => {
    openObserver.observe(mock);
  });

  /* section counter */
  const counter = document.querySelector("#point > .title span");
  const sections = document.querySelectorAll("#point > .container > section");
  const total = sections.length;
  const pad2 = (n) => String(n).padStart(2, "0");
  sections.forEach((sec, i) => (sec.dataset.index = i + 1));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.getBoundingClientRect().top > 0) {
            const index = parseInt(entry.target.dataset.index, 10);
            requestAnimationFrame(() => {
              counter.textContent = `${pad2(index)}/${pad2(total)}`;
            });
          }
        }
      });
    },
    {
      rootMargin: "0px 0px -50% 0px",
      threshold: 0,
    },
  );
  sections.forEach((sec) => sectionObserver.observe(sec));
  const sectionObserverReverse = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.getBoundingClientRect().bottom < window.innerHeight) {
            const index = parseInt(entry.target.dataset.index, 10);
            requestAnimationFrame(() => {
              counter.textContent = `${pad2(index)}/${pad2(total)}`;
            });
          }
        }
      });
    },
    {
      rootMargin: "-50% 0px 0px 0px",
      threshold: 0,
    },
  );
  sections.forEach((sec) => sectionObserverReverse.observe(sec));

  /* FAQ accordion */
  const faqButtons = document.querySelectorAll("#faq dt button");
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      const dd = button.closest(".faq-item").querySelector("dd");
      dd.classList.toggle("open", !expanded);
    });
  });

  /* curriculum carousel */
  const carousel = document.querySelector("#curriculum .carousel");
  if (carousel) {
    const track = carousel.querySelector(".track");
    const lessons = carousel.querySelectorAll(".lesson");
    const dots = carousel.querySelectorAll(".dot");
    const dotCount = dots.length;
    let extIndex = 0;
    let autoTimer = null;

    /* clone all lessons for seamless infinite loop */
    Array.from(lessons).forEach((l) => track.appendChild(l.cloneNode(true)));

    const getColAdvance = () => {
      if (lessons.length < 5) return 0;
      const r0 = lessons[0].getBoundingClientRect();
      const r4 = lessons[4].getBoundingClientRect();
      return r4.left - r0.left; /* width of 2 columns including 2 gaps */
    };

    const goTo = (index) => {
      extIndex = index;
      const dotIndex = ((index % dotCount) + dotCount) % dotCount;
      track.style.transform = `translateX(-${getColAdvance() * index}px)`;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === dotIndex));
    };

    /* after sliding to cloned section, snap silently back to original */
    track.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      if (extIndex >= dotCount) {
        track.style.transition = "none";
        extIndex -= dotCount;
        track.style.transform = `translateX(-${getColAdvance() * extIndex}px)`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          track.style.transition = "";
        }));
      }
    });

    const stopAuto = () => clearInterval(autoTimer);
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => goTo(extIndex + 1), 4000);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        extIndex = i;
        goTo(i);
        startAuto();
      });
    });

    /* drag / swipe */
    let dragStartX = 0;
    let isDragging = false;

    const onDragStart = (x) => {
      isDragging = true;
      dragStartX = x;
      stopAuto();
      track.style.transition = "none";
    };

    const onDragEnd = (x) => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = "";
      const diff = dragStartX - x;
      const threshold = getColAdvance() * 0.2;
      if (diff > threshold) {
        goTo(extIndex + 1);
      } else if (diff < -threshold) {
        goTo(extIndex - 1 < 0 ? dotCount - 1 : extIndex - 1);
      } else {
        goTo(extIndex);
      }
      startAuto();
    };

    const onDragMove = (x) => {
      if (!isDragging) return;
      const diff = dragStartX - x;
      const base = getColAdvance() * extIndex;
      track.style.transform = `translateX(-${base + diff}px)`;
    };

    /* mouse */
    carousel.addEventListener("mousedown", (e) => { e.preventDefault(); onDragStart(e.clientX); });
    window.addEventListener("mouseup", (e) => onDragEnd(e.clientX));
    window.addEventListener("mousemove", (e) => onDragMove(e.clientX));

    /* touch */
    carousel.addEventListener("touchstart", (e) => onDragStart(e.touches[0].clientX), { passive: true });
    carousel.addEventListener("touchend", (e) => onDragEnd(e.changedTouches[0].clientX), { passive: true });
    carousel.addEventListener("touchmove", (e) => onDragMove(e.touches[0].clientX), { passive: true });

    goTo(0);
    startAuto();

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", () => { if (!isDragging) startAuto(); });

    /* reset to Lesson 1 each time the section enters the viewport */
    const curriculumSection = document.querySelector("#curriculum");
    if (curriculumSection) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track.style.transition = "none";
            goTo(0);
            requestAnimationFrame(() => requestAnimationFrame(() => {
              track.style.transition = "";
            }));
            startAuto();
          } else {
            stopAuto();
          }
        });
      }, { threshold: 0.1 }).observe(curriculumSection);
    }
  }

  // end
});
