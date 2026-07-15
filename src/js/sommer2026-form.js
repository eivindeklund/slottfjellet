/* ==========================================================================
   Sommerregistrering 2026
   Ranking widget (drag-and-drop preference ranking with ties) + calendar
   availability widget (paint-bucket style) + submission to a Google Apps
   Script Web App.

   Config (date range, game types, Apps Script URL) lives in the
   <script type="application/json" id="sommer-form-config"> block in
   src/forms/sommer2026.md - edit that instead of this file when reusing
   this form for a future summer.
   ========================================================================== */
(function () {
  "use strict";

  const configEl = document.getElementById("sommer-form-config");
  if (!configEl) return; // Not on the form page.
  const CONFIG = JSON.parse(configEl.textContent);

  const DAY_NAMES = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
  const MONTH_ABBR = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

  // ------------------------------------------------------------------
  // Date helpers
  // ------------------------------------------------------------------
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function parseISODate(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  function toISODate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }
  function mondayOf(d) {
    const wd = (d.getDay() + 6) % 7; // 0 = Monday
    return addDays(d, -wd);
  }
  function isoWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const diff = date - firstThursday;
    return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
  }

  // Returns the actual in-range dates, plus a padded grid (full Mon-Sun weeks)
  // for layout purposes.
  function buildDateRange() {
    const specifiedStart = parseISODate(CONFIG.startDate);
    const start = new Date(Math.max(specifiedStart.getTime(), startOfToday().getTime()));
    const end = parseISODate(CONFIG.endDate);
    const gridStart = mondayOf(start);
    const gridEnd = addDays(mondayOf(end), 6); // Sunday of the week containing `end`
    const gridDates = [];
    let cur = gridStart;
    let safety = 0;
    while (cur <= gridEnd && safety < 400) {
      gridDates.push(new Date(cur));
      cur = addDays(cur, 1);
      safety++;
    }
    const inRangeDates = gridDates.filter((d) => d >= start && d <= end);
    return { start, end, gridDates, inRangeDates };
  }

  const RANGE = buildDateRange();

  // ------------------------------------------------------------------
  // Ranking widget state
  // ------------------------------------------------------------------
  const gameById = {};
  CONFIG.gameTypes.forEach((g) => (gameById[g.id] = g));

  const rankState = {
    pool: CONFIG.gameTypes.map((g) => g.id),
    vilIkke: [],
    ranks: [], // array of arrays of game ids, in preference order (each inner array = a tie group)
  };

  function findLocation(id) {
    if (rankState.pool.includes(id)) return { list: "pool" };
    if (rankState.vilIkke.includes(id)) return { list: "vilIkke" };
    for (let i = 0; i < rankState.ranks.length; i++) {
      if (rankState.ranks[i].includes(id)) return { list: "ranks", index: i };
    }
    return null;
  }

  function removeFromCurrentLocation(id) {
    rankState.pool = rankState.pool.filter((x) => x !== id);
    rankState.vilIkke = rankState.vilIkke.filter((x) => x !== id);
    rankState.ranks.forEach((slot, i) => {
      rankState.ranks[i] = slot.filter((x) => x !== id);
    });
    rankState.ranks = rankState.ranks.filter((slot) => slot.length > 0);
  }

  function moveToPool(id) {
    removeFromCurrentLocation(id);
    rankState.pool.push(id);
    renderRanking();
  }
  function moveToVilIkke(id) {
    removeFromCurrentLocation(id);
    rankState.vilIkke.push(id);
    renderRanking();
  }
  function moveToNewSlotAt(id, index) {
    removeFromCurrentLocation(id);
    rankState.ranks.splice(index, 0, [id]);
    renderRanking();
  }
  function moveToExistingSlot(id, index) {
    removeFromCurrentLocation(id);
    if (!rankState.ranks[index]) rankState.ranks[index] = [];
    rankState.ranks[index].push(id);
    renderRanking();
  }
  function moveSlotSwap(id, direction) {
    const loc = findLocation(id);
    if (!loc || loc.list !== "ranks") return;
    const from = loc.index;
    const to = from + direction;
    removeFromCurrentLocation(id);
    const clampedTo = Math.max(0, Math.min(to, rankState.ranks.length));
    rankState.ranks.splice(clampedTo, 0, [id]);
    renderRanking();
  }

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function makeTile(id, opts) {
    opts = opts || {};
    const game = gameById[id];
    const tile = el("div", "rank-tile");
    tile.dataset.id = id;
    tile.setAttribute("draggable", "false");

    const label = document.createElement("span");
    label.textContent = game.label;
    tile.appendChild(label);

    if (opts.showUpDown) {
      const btnWrap = el("span", "rank-tile-buttons");
      const up = el("button", "", "▲");
      up.type = "button";
      up.title = "Flytt opp";
      up.addEventListener("click", (ev) => {
        ev.stopPropagation();
        moveSlotSwap(id, -1);
      });
      const down = el("button", "", "▼");
      down.type = "button";
      down.title = "Flytt ned";
      down.addEventListener("click", (ev) => {
        ev.stopPropagation();
        moveSlotSwap(id, 1);
      });
      btnWrap.appendChild(up);
      btnWrap.appendChild(down);
      tile.appendChild(btnWrap);
    }

    if (opts.showAdd) {
      const addBtn = el("button", "rank-tile-remove", "→");
      addBtn.type = "button";
      addBtn.title = "Legg til i rangering";
      addBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        moveToNewSlotAt(id, rankState.ranks.length);
      });
      tile.appendChild(addBtn);
    }

    if (opts.showRestore) {
      const restoreBtn = el("button", "rank-tile-remove", "↺");
      restoreBtn.type = "button";
      restoreBtn.title = "Sett tilbake";
      restoreBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        moveToPool(id);
      });
      tile.appendChild(restoreBtn);
    }

    if (opts.showRemove) {
      const removeBtn = el("button", "rank-tile-remove", "✕");
      removeBtn.type = "button";
      removeBtn.title = "Vil ikke";
      removeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        moveToVilIkke(id);
      });
      tile.appendChild(removeBtn);
    }

    attachDrag(tile, id);
    return tile;
  }

  function renderRanking() {
    const container = document.getElementById("ranking-widget");
    container.innerHTML = "";
    const wrap = el("div", "ranking-widget");

    // --- Pool column ---
    const poolCol = el("div", "ranking-column rank-pool");
    poolCol.appendChild(el("h3", "", "Ikke tatt stilling til"));
    const poolZone = el("div", "ranking-dropzone");
    poolZone.dataset.dropTarget = "pool";
    rankState.pool.forEach((id) => poolZone.appendChild(makeTile(id, { showAdd: true, showRemove: true })));
    poolCol.appendChild(poolZone);
    attachDropZone(poolZone, { list: "pool" });
    wrap.appendChild(poolCol);

    // --- Ranked column ---
    const rankCol = el("div", "ranking-column rank-ranked");
    rankCol.appendChild(el("h3", "", "Rangert etter preferanse"));
    const slotsWrap = el("div", "rank-slots");
    rankState.ranks.forEach((slot, index) => {
      const row = el("div", "rank-slot-row");
      row.appendChild(el("span", "rank-slot-label", String(computeRankNumber(index))));
      slot.forEach((id) => row.appendChild(makeTile(id, { showUpDown: true, showRemove: true })));
      slotsWrap.appendChild(row);
      attachDropZone(row, { list: "ranks", index: index });
    });
    // Always-available trailing empty slot to drag new items into.
    const emptyRow = el("div", "rank-slot-row is-empty-slot");
    emptyRow.appendChild(el("span", "rank-slot-label", "+"));
    slotsWrap.appendChild(emptyRow);
    attachDropZone(emptyRow, { list: "ranks", index: rankState.ranks.length });
    rankCol.appendChild(slotsWrap);
    wrap.appendChild(rankCol);

    // --- Vil ikke column ---
    const vilIkkeCol = el("div", "ranking-column rank-vilikke");
    vilIkkeCol.appendChild(el("h3", "", "Vil ikke"));
    const vilIkkeZone = el("div", "ranking-dropzone");
    vilIkkeZone.dataset.dropTarget = "vilIkke";
    rankState.vilIkke.forEach((id) => vilIkkeZone.appendChild(makeTile(id, { showRestore: true })));
    vilIkkeCol.appendChild(vilIkkeZone);
    attachDropZone(vilIkkeZone, { list: "vilIkke" });
    wrap.appendChild(vilIkkeCol);

    container.appendChild(wrap);
  }

  function computeRankNumber(slotIndex) {
    let rank = 1;
    for (let i = 0; i < slotIndex; i++) rank += rankState.ranks[i].length;
    return rank;
  }

  // ------------------------------------------------------------------
  // Drag and drop (Pointer Events, works for mouse/touch/pen alike)
  // ------------------------------------------------------------------
  let dragCtx = null;

  function attachDrag(tile, id) {
    tile.addEventListener("pointerdown", (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      const rect = tile.getBoundingClientRect();
      const ghost = tile.cloneNode(true);
      ghost.className = "rank-tile rank-tile-drag-ghost";
      ghost.style.width = rect.width + "px";
      document.body.appendChild(ghost);
      positionGhost(ghost, ev.clientX, ev.clientY, rect);

      tile.classList.add("is-dragging");
      dragCtx = {
        id,
        ghost,
        offsetX: ev.clientX - rect.left,
        offsetY: ev.clientY - rect.top,
        sourceRect: rect,
        sourceLocation: findLocation(id),
        currentZone: null,
      };

      document.addEventListener("pointermove", onDragMove);
      document.addEventListener("pointerup", onDragEnd, { once: true });
    });
  }

  function positionGhost(ghost, clientX, clientY, rect) {
    ghost.style.left = clientX - rect.width / 2 + "px";
    ghost.style.top = clientY - rect.height / 2 + "px";
  }

  function onDragMove(ev) {
    if (!dragCtx) return;
    positionGhost(dragCtx.ghost, ev.clientX, ev.clientY, dragCtx.sourceRect);
    dragCtx.ghost.style.display = "none";
    const under = document.elementFromPoint(ev.clientX, ev.clientY);
    dragCtx.ghost.style.display = "";
    const zone = under && under.closest(".ranking-dropzone, .rank-slot-row");
    if (zone !== dragCtx.currentZone) {
      if (dragCtx.currentZone) dragCtx.currentZone.classList.remove("is-drag-over");
      if (zone) zone.classList.add("is-drag-over");
      dragCtx.currentZone = zone || null;
    }
  }

  function onDragEnd() {
    if (!dragCtx) return;
    document.removeEventListener("pointermove", onDragMove);
    const zone = dragCtx.currentZone;
    dragCtx.ghost.remove();
    if (zone) {
      zone.classList.remove("is-drag-over");
      const target = zone.dataset.dropTarget;
      if (target === "pool") {
        if (!dragCtx.sourceLocation || dragCtx.sourceLocation.list !== "pool") moveToPool(dragCtx.id);
      } else if (target === "vilIkke") {
        if (!dragCtx.sourceLocation || dragCtx.sourceLocation.list !== "vilIkke") moveToVilIkke(dragCtx.id);
      }
      else if (target === "ranks-slot") moveToExistingSlot(dragCtx.id, Number(zone.dataset.rankIndex));
      else if (target === "ranks-new") moveToNewSlotAt(dragCtx.id, Number(zone.dataset.rankIndex));
    }
    dragCtx = null;
    // renderRanking() already called by the move* functions above when a
    // valid drop happened; if not (dropped outside any zone), just clean up
    // the dragging visual state.
    document.querySelectorAll(".rank-tile.is-dragging").forEach((t) => t.classList.remove("is-dragging"));
  }

  function attachDropZone(elm, info) {
    if (info.list === "pool") elm.dataset.dropTarget = "pool";
    else if (info.list === "vilIkke") elm.dataset.dropTarget = "vilIkke";
    else if (info.list === "ranks") {
      const isExisting = info.index < rankState.ranks.length;
      elm.dataset.dropTarget = isExisting ? "ranks-slot" : "ranks-new";
      elm.dataset.rankIndex = String(info.index);
    }
  }

  // ------------------------------------------------------------------
  // Calendar widget state
  // ------------------------------------------------------------------
  const calState = {}; // dateISO -> { day: null|0|1|2, evening: null|0|1|2 }
  const AVAIL_LEVELS = [0, 1, 2];

  function ensureCalEntry(iso) {
    if (!calState[iso]) calState[iso] = { day: null, evening: null };
    return calState[iso];
  }

  function getLevel(iso, part) {
    const entry = calState[iso];
    if (!entry) return null;
    return entry[part];
  }

  function setLevel(iso, part, level) {
    const entry = ensureCalEntry(iso);
    entry[part] = level;
  }

  function nextIndividualLevel(level) {
    if (level === null || level === undefined) return 0;
    return (level + 1) % AVAIL_LEVELS.length;
  }

  function nextGroupLevel(level) {
    if (level === null || level === undefined) return 0;
    return (level + 1) % AVAIL_LEVELS.length;
  }

  function availClass(level) {
    if (level === null || level === undefined) return "avail-unset";
    return "avail-" + level;
  }

  function getDatesForWeekday(weekdayIndex) {
    return RANGE.inRangeDates.filter((d) => (d.getDay() + 6) % 7 === weekdayIndex).map((d) => toISODate(d));
  }

  function getDatesForWeek(weekDates) {
    return weekDates.filter((d) => d >= RANGE.start && d <= RANGE.end).map((d) => toISODate(d));
  }

  function getUniformLevel(dateIsos, part) {
    if (dateIsos.length === 0) return null;
    const first = getLevel(dateIsos[0], part);
    for (let i = 1; i < dateIsos.length; i++) {
      if (getLevel(dateIsos[i], part) !== first) return null;
    }
    return first;
  }

  function cycleDateLevel(iso, part) {
    const next = nextIndividualLevel(getLevel(iso, part));
    setLevel(iso, part, next);
  }

  function cycleGroupLevel(dateIsos, part) {
    if (dateIsos.length === 0) return;
    const uniform = getUniformLevel(dateIsos, part);
    const target = typeof uniform === "number" ? nextGroupLevel(uniform) : 0;
    dateIsos.forEach((iso) => setLevel(iso, part, target));
  }

  function makeAvailButton(opts) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "availability-btn " + availClass(opts.level);
    btn.title = opts.title;
    btn.setAttribute("aria-label", opts.ariaLabel);
    btn.addEventListener("click", opts.onClick);
    return btn;
  }

  function makeControlStack(dayButton, eveningButton) {
    const stack = el("div", "calendar-control-stack");
    const dayWrap = el("div", "calendar-control-row");
    const eveningWrap = el("div", "calendar-control-row");
    dayWrap.appendChild(dayButton);
    eveningWrap.appendChild(eveningButton);
    stack.appendChild(dayWrap);
    stack.appendChild(eveningWrap);
    return stack;
  }

  function renderCalendar() {
    const container = document.getElementById("calendar-widget");
    container.innerHTML = "";
    const wrap = el("div", "calendar-widget");
    const table = document.createElement("table");
    table.className = "calendar-grid";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(el("th", "", "Uke"));
    headRow.appendChild(el("th", "", "Ukevalg"));
    DAY_NAMES.forEach((name, weekdayIndex) => {
      const th = el("th", "calendar-day-header");
      const title = el("div", "calendar-day-title", name);
      th.appendChild(title);
      const weekdayDates = getDatesForWeekday(weekdayIndex);
      const dayUniform = getUniformLevel(weekdayDates, "day");
      const eveningUniform = getUniformLevel(weekdayDates, "evening");
      const dayBtn = makeAvailButton({
        level: dayUniform,
        title: "Sett dag for alle " + name.toLowerCase(),
        ariaLabel: "Sett dag for alle " + name.toLowerCase(),
        onClick: () => {
          cycleGroupLevel(weekdayDates, "day");
          renderCalendar();
        },
      });
      const eveningBtn = makeAvailButton({
        level: eveningUniform,
        title: "Sett kveld for alle " + name.toLowerCase(),
        ariaLabel: "Sett kveld for alle " + name.toLowerCase(),
        onClick: () => {
          cycleGroupLevel(weekdayDates, "evening");
          renderCalendar();
        },
      });
      th.appendChild(makeControlStack(dayBtn, eveningBtn));
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < RANGE.gridDates.length; i += 7) {
      const week = RANGE.gridDates.slice(i, i + 7);
      const row = document.createElement("tr");
      const weekLabel = el("td", "calendar-week-label", "Uke " + isoWeekNumber(week[0]));
      row.appendChild(weekLabel);

      const weekControlCell = el("td", "calendar-week-controls");
      const weekDates = getDatesForWeek(week);
      const weekDayUniform = getUniformLevel(weekDates, "day");
      const weekEveningUniform = getUniformLevel(weekDates, "evening");
      const weekDayBtn = makeAvailButton({
        level: weekDayUniform,
        title: "Sett dag for hele uke " + isoWeekNumber(week[0]),
        ariaLabel: "Sett dag for hele uke " + isoWeekNumber(week[0]),
        onClick: () => {
          cycleGroupLevel(weekDates, "day");
          renderCalendar();
        },
      });
      const weekEveningBtn = makeAvailButton({
        level: weekEveningUniform,
        title: "Sett kveld for hele uke " + isoWeekNumber(week[0]),
        ariaLabel: "Sett kveld for hele uke " + isoWeekNumber(week[0]),
        onClick: () => {
          cycleGroupLevel(weekDates, "evening");
          renderCalendar();
        },
      });
      weekControlCell.appendChild(makeControlStack(weekDayBtn, weekEveningBtn));
      row.appendChild(weekControlCell);

      week.forEach((d) => {
        const inRange = d >= RANGE.start && d <= RANGE.end;
        const cell = el("td", "calendar-date-cell" + (inRange ? "" : " is-outside-range"));
        if (inRange) {
          const iso = toISODate(d);
          const label = d.getDate() === 1 ? d.getDate() + ". " + MONTH_ABBR[d.getMonth()] : String(d.getDate());
          const dateLabel = el("div", "date-number", label);
          cell.appendChild(dateLabel);
          const weekdayName = DAY_NAMES[(d.getDay() + 6) % 7];
          const dayBtn = makeAvailButton({
            level: getLevel(iso, "day"),
            title: weekdayName + " " + label + ": Dag",
            ariaLabel: weekdayName + " " + label + ", dag",
            onClick: () => {
              cycleDateLevel(iso, "day");
              renderCalendar();
            },
          });
          const eveningBtn = makeAvailButton({
            level: getLevel(iso, "evening"),
            title: weekdayName + " " + label + ": Kveld",
            ariaLabel: weekdayName + " " + label + ", kveld",
            onClick: () => {
              cycleDateLevel(iso, "evening");
              renderCalendar();
            },
          });
          cell.appendChild(makeControlStack(dayBtn, eveningBtn));
        }
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  // ------------------------------------------------------------------
  // Form wiring: validation + submission
  // ------------------------------------------------------------------
  function computePreferencesExport() {
    const prefs = {};
    let rank = 1;
    rankState.ranks.forEach((slot) => {
      slot.forEach((id) => (prefs[id] = rank));
      rank += slot.length;
    });
    CONFIG.gameTypes.forEach((g) => {
      if (!(g.id in prefs)) prefs[g.id] = 0;
    });
    return prefs;
  }

  function computeCalendarExport() {
    const out = {};
    RANGE.inRangeDates.forEach((d) => {
      const iso = toISODate(d);
      const entry = calState[iso];
      out[iso] = {
        day: entry && entry.day !== null && entry.day !== undefined ? entry.day : "",
        evening: entry && entry.evening !== null && entry.evening !== undefined ? entry.evening : "",
      };
    });
    return out;
  }

  function hasAnyRankedItem() {
    return rankState.ranks.some((slot) => slot.length > 0);
  }

  function hasPositiveAvailability() {
    return Object.values(calState).some((v) => (v.day !== null && v.day >= 1) || (v.evening !== null && v.evening >= 1));
  }

  function setStatus(message, kind) {
    const statusEl = document.getElementById("form-status");
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + (kind === "error" ? "is-error" : "is-success");
  }

  function clearStatus() {
    const statusEl = document.getElementById("form-status");
    statusEl.className = "form-status";
    statusEl.textContent = "";
  }

  function wireForm() {
    const form = document.getElementById("sommer-form");
    const nameInput = document.getElementById("field-name");
    const contactInput = document.getElementById("field-contact");
    const commentInput = document.getElementById("field-comment");
    const websiteInput = document.getElementById("field-website"); // honeypot
    const submitButton = document.getElementById("submit-button");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearStatus();

      // Honeypot: a filled hidden field almost certainly means a bot. Pretend
      // success without actually submitting anything.
      if (websiteInput.value.trim() !== "") {
        setStatus("Takk for at du meldte fra om når du kan!", "success");
        form.reset();
        return;
      }

      const problems = [];
      nameInput.classList.remove("field-invalid");
      contactInput.classList.remove("field-invalid");
      if (!nameInput.value.trim()) {
        problems.push("Fyll inn navn.");
        nameInput.classList.add("field-invalid");
      }
      if (!contactInput.value.trim()) {
        problems.push("Fyll inn epost eller Discord-handle.");
        contactInput.classList.add("field-invalid");
      }
      if (!hasAnyRankedItem()) {
        problems.push("Ranger minst ett spilltype du har lyst til å spille.");
      }
      if (!hasPositiveAvailability()) {
        problems.push("Merk minst én dato hvor du er tilgjengelig (dag eller kveld).");
      }

      if (problems.length > 0) {
        setStatus(problems.join(" "), "error");
        return;
      }

      const payload = {
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        comment: commentInput.value.trim(),
        startDate: toISODate(RANGE.start),
        endDate: CONFIG.endDate,
        preferences: computePreferencesExport(),
        calendar: computeCalendarExport(),
      };

      submitButton.disabled = true;
      setStatus("Sender inn...", "success");

      fetch(CONFIG.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // keeps this a CORS "simple request" for Apps Script
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((data) => {
          submitButton.disabled = false;
          if (data && data.ok) {
            setStatus("Takk! Vi har registrert svaret ditt.", "success");
            form.reset();
            rankState.pool = CONFIG.gameTypes.map((g) => g.id);
            rankState.vilIkke = [];
            rankState.ranks = [];
            renderRanking();
            Object.keys(calState).forEach((k) => delete calState[k]);
            renderCalendar();
          } else {
            setStatus("Noe gikk galt: " + ((data && data.error) || "ukjent feil") + ". Prøv igjen, eller ta kontakt på Discord.", "error");
          }
        })
        .catch(() => {
          submitButton.disabled = false;
          setStatus("Kunne ikke sende inn skjemaet. Sjekk nettforbindelsen og prøv igjen.", "error");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderRanking();
    renderCalendar();
    wireForm();
  });
})();
