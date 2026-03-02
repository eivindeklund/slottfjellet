/**
 * carousel.js – minimal JS for hero-carousel.
 *
 * All motion (image slide, body-text fade) is driven by CSS transitions;
 * JS only manages state (which slide is active), the auto-advance timer,
 * and user-interaction pausing.
 *
 * Timing (can be tuned here):
 *   SLIDE_DURATION  – how long a slide is fully visible before the next one
 *                     starts sliding in  (ms)
 *   TRANS_DURATION  – must match the CSS transition time for the image slide
 *                     and the transition-delay on .is-active body/.is-visible
 *                     desc fade-in
 */

(function () {
        "use strict";

        /* ── Timing constants ─────────────────────────────────────────────────── */
        var SLIDE_DURATION = 5000; // ms a slide is on display before auto-advancing
        var TRANS_DURATION = 900;  // ms for the image sliding transition (matches CSS)

        /* ── Cache elements ───────────────────────────────────────────────────── */
        var root = document.getElementById("hero-carousel");
        if (!root) return;

        var slides = Array.from(root.querySelectorAll(".carousel-slide"));
        var bodyItems = Array.from(root.querySelectorAll(".carousel-body-item"));
        var descSpan = root.querySelector("#carousel-curr-desc");
        var btnPrev = root.querySelector(".carousel-btn--prev");
        var btnNext = root.querySelector(".carousel-btn--next");

        var total = slides.length;
        var current = 0;
        var timerId = null;
        var paused = false;
        var descChangeTimer = null; // guards text‑swap inside a running fade

        /* ── Initialise: populate the description span from the active slide ──── */
        descSpan.textContent = slides[0].dataset.desc || "";
        /* Kick off the initial fade-in on the next frame (after no-anim removal) */
        requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                        descSpan.classList.add("is-visible");
                });
        });

        /* ── Core state‑change routine ────────────────────────────────────────── */
        function goTo(nextIndex) {
                if (nextIndex === current) return;
                var prev = current;
                current = ((nextIndex % total) + total) % total;

                /* 1. Outgoing slide moves left ──────────────────────────────────────── */
                slides[prev].classList.remove("is-active");
                slides[prev].classList.add("is-prev");

                /* 2. New slide: snap it to the right (remove any leftover is-prev /
                      is-active, force reflow so the browser sees translateX(100%),
                      then add is-active so the CSS transition fires) */
                slides[current].classList.remove("is-prev", "is-active");
                /* eslint-disable-next-line no-unused-expressions */
                slides[current].offsetWidth; // force reflow
                slides[current].classList.add("is-active");

                /* 3. Body text: swap active class
                      CSS transition-delay on .is-active handles the 900ms wait */
                bodyItems[prev].classList.remove("is-active");
                bodyItems[current].classList.add("is-active");

                /* 4. Title description: remove is-visible → CSS fades it to opacity 0.
                      After TRANS_DURATION, swap the text and restore is-visible so CSS
                      fades it back in.  Cancel any in-progress swap first. */
                clearTimeout(descChangeTimer);
                descSpan.classList.remove("is-visible");

                descChangeTimer = setTimeout(function () {
                        descSpan.textContent = slides[current].dataset.desc || "";
                        /* Force a reflow so the browser registers the text change at opacity 0
                           before re-adding is-visible which triggers the fade-in transition. */
                        /* eslint-disable-next-line no-unused-expressions */
                        descSpan.offsetWidth;
                        descSpan.classList.add("is-visible");
                }, TRANS_DURATION);
        }

        /* ── Auto‑advance ─────────────────────────────────────────────────────── */
        function advance() {
                goTo(current + 1);
        }

        function startTimer() {
                if (timerId) clearInterval(timerId);
                timerId = setInterval(advance, SLIDE_DURATION);
        }

        function pause() {
                paused = true;
                clearInterval(timerId);
                timerId = null;
        }

        /* ── Arrow buttons ────────────────────────────────────────────────────── */
        btnPrev.addEventListener("click", function (e) {
                e.stopPropagation();
                pause();
                goTo(current - 1);
        });

        btnNext.addEventListener("click", function (e) {
                e.stopPropagation();
                pause();
                goTo(current + 1);
        });

        /* ── Keyboard navigation (when carousel has focus) ───────────────────── */
        root.addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft") {
                        pause();
                        goTo(current - 1);
                } else if (e.key === "ArrowRight") {
                        pause();
                        goTo(current + 1);
                }
        });

        /* ── Stop auto‑advance on any user interaction with the carousel ─────── */
        root.addEventListener("pointerdown", function (e) {
                /* ignore clicks on the buttons – they call pause() themselves */
                if (e.target.closest(".carousel-btn")) return;
                pause();
        });

        /* Slides that have exited stay at translateX(-100%) with .is-prev.
           This is intentional: goTo() removes .is-prev and forces a reflow so the
           slide snaps to translateX(100%) (the classless default) before the next
           is-active transition fires. */

        /* ── Remove no-anim on the first frame so the initial state doesn't
              animate in from translateX(100%) ───────────────────────────────── */
        requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                        slides.forEach(function (s) { s.classList.remove("no-anim"); });
                        bodyItems.forEach(function (b) { b.classList.remove("no-anim"); });
                });
        });

        /* ── Start ────────────────────────────────────────────────────────────── */
        startTimer();
})();
