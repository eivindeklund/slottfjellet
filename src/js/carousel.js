/**
 * carousel.js – minimal JS for hero-carousel.
 *
 * All motion (image slide, body-text fade) is driven by CSS transitions;
 * JS only manages state (which slide is active), the auto-advance timer,
 * and user-interaction pausing.
 *
 * Timing (can be tuned here):
 *   SLIDE_DURATION     – how long a slide is fully visible before the next
 *                        one starts sliding in  (ms)
 *   TRANS_DURATION     – must match the CSS transition on .carousel-slide
 *                        .is-active  (transform 0.9s)
 *   DESC_FADE_DURATION – must match the CSS opacity transition duration on
 *                        #carousel-curr-desc (currently 0.35s = 350 ms).
 *                        Text swap fires at TRANS_DURATION − DESC_FADE_DURATION
 *                        so the fade-in is COMPLETE when the slide stops.
 *                        To finish even earlier, lower DESC_FADE_DURATION and
 *                        set the matching CSS transition to the same value.
 */

(function () {
        "use strict";

        /* ── Timing constants ─────────────────────────────────────────────────── */
        var SLIDE_DURATION = 5000;     // ms a slide is on display before auto-advancing
        var TRANS_DURATION = 900;      // ms for the image slide transition (matches CSS)
        /* Tune both this value AND the CSS transition on #carousel-curr-desc together.
           Text swap fires at (TRANS_DURATION - DESC_FADE_DURATION) so the
           fade-in finishes exactly when the slide stops. */
        var DESC_FADE_DURATION = 350;  // ms — must match CSS opacity 0.35s on #carousel-curr-desc

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

        /* ── Slide-class housekeeping ─────────────────────────────────────────── */
        function clearSlideClasses(slide) {
                slide.classList.remove(
                        "is-active",
                        "is-enter-left",
                        "is-exit-left",
                        "is-exit-right"
                );
        }

        /* ── Core state‑change routine ────────────────────────────────────────── */
        /* direction: "forward" (default) → new slide enters from the right;
                      "backward"          → new slide enters from the left  */
        function goTo(nextIndex, direction) {
                if (nextIndex === current) return;
                direction = direction || "forward";
                var prev = current;
                current = ((nextIndex % total) + total) % total;

                /* 1. Outgoing slide exits in the appropriate direction ───────────────── */
                slides[prev].classList.remove("is-active");
                slides[prev].classList.add(
                        direction === "backward" ? "is-exit-right" : "is-exit-left"
                );

                /* 2. Incoming slide: clear all state, snap to entry position,
                      force reflow, then apply is-active so CSS transition fires */
                clearSlideClasses(slides[current]);
                if (direction === "backward") {
                        /* Snap off-screen LEFT so it slides in from the left */
                        slides[current].classList.add("is-enter-left");
                }
                /* else: no class = default translateX(100%), enters from right */
                /* eslint-disable-next-line no-unused-expressions */
                slides[current].offsetWidth; // force reflow
                slides[current].classList.add("is-active");

                /* 3. Body text: swap active class
                      CSS transition-delay on .is-active handles the 900ms wait */
                bodyItems[prev].classList.remove("is-active");
                bodyItems[current].classList.add("is-active");

                /* 4. Title description: fade out immediately, then start the fade-in
                      early enough that it FINISHES when the slide stops (TRANS_DURATION).
                      Cancel any in-progress swap first. */
                clearTimeout(descChangeTimer);
                descSpan.classList.remove("is-visible");

                /* Schedule the text swap + fade-in so it completes at TRANS_DURATION */
                var swapAt = Math.max(0, TRANS_DURATION - DESC_FADE_DURATION);
                descChangeTimer = setTimeout(function () {
                        descSpan.textContent = slides[current].dataset.desc || "";
                        /* Force a reflow so the browser sees the text at opacity 0
                           before re-adding is-visible which triggers the fade-in. */
                        /* eslint-disable-next-line no-unused-expressions */
                        descSpan.offsetWidth;
                        descSpan.classList.add("is-visible");
                }, swapAt);
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
                goTo(current - 1, "backward");
        });

        btnNext.addEventListener("click", function (e) {
                e.stopPropagation();
                pause();
                goTo(current + 1, "forward");
        });

        /* ── Keyboard navigation (document-level — no need to focus the carousel) ── */
        /* Skip when the user is actively typing in a form field or rich-text editor. */
        document.addEventListener("keydown", function (e) {
                var tag = document.activeElement ? document.activeElement.tagName : "";
                var isEditable = document.activeElement &&
                        document.activeElement.getAttribute("contenteditable") !== null;
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || isEditable) {
                        return;
                }
                if (e.key === "ArrowLeft") {
                        pause();
                        goTo(current - 1, "backward");
                } else if (e.key === "ArrowRight") {
                        pause();
                        goTo(current + 1, "forward");
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
