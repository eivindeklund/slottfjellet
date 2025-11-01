// Countdown logic for /countdown.html
(() => {
        function parseLocalISO(s) {
                // Accepts YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS and returns a local Date
                if (!s) return null;
                const dateTime = s.split('T');
                if (dateTime.length !== 2) return null;
                const [y, m, d] = dateTime[0].split('-').map(Number);
                const timeParts = dateTime[1].split(':').map(Number);
                const hh = timeParts[0] || 0;
                const mm = timeParts[1] || 0;
                const ss = timeParts[2] || 0;
                if ([y, m, d, hh, mm].some(v => Number.isNaN(v))) return null;
                return new Date(y, m - 1, d, hh, mm, ss);
        }

        function parseEvents() {
                const tds = Array.from(document.querySelectorAll('td[data-start][data-end]'));
                if (tds.length > 0) {
                        return tds.map(td => {
                                const start = td.getAttribute('data-start');
                                const end = td.getAttribute('data-end');
                                const override = td.getAttribute('data-countdown-title');
                                return {
                                        title: override ? override.trim() : td.textContent.trim(),
                                        start: start ? parseLocalISO(start) : null,
                                        end: end ? parseLocalISO(end) : null,
                                };
                        }).filter(e => e.start instanceof Date && !isNaN(e.start) && e.end instanceof Date && !isNaN(e.end));
                }

                // If there are no table-based schedule entries, fail loudly so
                // editors know to update `_includes/content_body_tt_timeplan.html`.
                console.error('No schedule entries found: ensure the rendered include provides TD elements with data-start and data-end attributes.');
                return [];
        }

        function getNow() {
                return new Date();
        }

        function formatHM(ms) {
                // ms -> "H:MM:SS" or "MM:SS" depending on hours
                if (ms < 0) ms = 0;
                const totalSec = Math.floor(ms / 1000);
                const hours = Math.floor(totalSec / 3600);
                const minutes = Math.floor((totalSec % 3600) / 60);
                const seconds = totalSec % 60;
                const mm = String(minutes).padStart(2, '0');
                const ss = String(seconds).padStart(2, '0');
                return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
        }

        function update() {
                const events = parseEvents();
                const now = getNow();

                // find current event (now within start..end), otherwise next upcoming
                let current = null;
                let next = null;
                for (const ev of events) {
                        if (now >= ev.start && now < ev.end) {
                                current = ev;
                                break;
                        }
                        if (ev.start > now && !next) next = ev;
                }

                const titleEl = document.getElementById('countdown-title');
                const timerEl = document.getElementById('countdown-timer');
                const subEl = document.getElementById('countdown-sub');

                if (current) {
                        // count down to end of current event
                        const remaining = current.end - now;
                        titleEl.textContent = current.title + ' — pågående';
                        timerEl.textContent = formatHM(remaining);
                        subEl.textContent = `Starter kl ${current.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Slutt ${current.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        applyColorState(timerEl, remaining);
                } else if (next) {
                        const remaining = next.start - now;
                        titleEl.textContent = next.title + ' — starter snart';
                        timerEl.textContent = formatHM(remaining);
                        subEl.textContent = `Starter ${next.start.toLocaleDateString()} kl ${next.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        applyColorState(timerEl, remaining);
                } else {
                        titleEl.textContent = 'Ingen flere planlagte hendelser';
                        timerEl.textContent = '';
                        subEl.textContent = '';
                }
        }

        function applyColorState(el, remainingMs) {
                // When there's more than 30 minutes -> black.
                // <=30m -> green, <=15m -> amber, <=3m -> red.
                const minutes = remainingMs / 60000;
                el.classList.remove('state-black', 'state-green', 'state-amber', 'state-red');
                if (minutes <= 3) {
                        el.classList.add('state-red');
                } else if (minutes <= 15) {
                        el.classList.add('state-amber');
                } else if (minutes <= 30) {
                        el.classList.add('state-green');
                } else {
                        el.classList.add('state-black');
                }
        }

        // initial update and interval
        function start() {
                update();
                setInterval(update, 1000);
        }

        if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', start);
        } else {
                start();
        }

})();
