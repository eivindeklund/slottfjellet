document.addEventListener("DOMContentLoaded", () => {
        const en = document.getElementById("flag-en");
        const no = document.getElementById("flag-no");
        const siteOrigin = "slottsfjellet.org";

        // Detect current language (based on domain)
        const isTranslated = window.location.hostname.includes("translate.goog");
        const currentLang = isTranslated ? "en" : "no";

        // Disable the current language flag
        if (currentLang === "en") en.classList.add("disabled");
        if (currentLang === "no") no.classList.add("disabled");

        // Helper: Get canonical non-translated URL
        function getOriginalUrl() {
                const current = window.location.href;
                if (current.includes(siteOrigin)) return current;

                const m = current.match(/https:\/\/([^.]+)\.translate\.goog(\/[^?]*)?/);
                if (m) {
                        const path = m[2] || "/";
                        return `https://${siteOrigin}${path}`;
                }
                return `https://${siteOrigin}`;
        }

        // 🇬🇧 → English (through Google Translate)
        en.addEventListener("click", () => {
                if (en.classList.contains("disabled")) return; // ignore if current
                const originalUrl = getOriginalUrl();
                const path = new URL(originalUrl).pathname;
                const translateUrl =
                        `https://${siteOrigin.replace(/\./g, "-")}.translate.goog${path}?` +
                        `_x_tr_sl=no&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp&_x_tr_sch=http`;
                window.top.location.href = translateUrl;
        });

        // 🇳🇴 → Norwegian (original site)
        no.addEventListener("click", () => {
                if (no.classList.contains("disabled")) return; // ignore if current
                const originalUrl = getOriginalUrl();
                window.top.location.href = originalUrl;
        });
});