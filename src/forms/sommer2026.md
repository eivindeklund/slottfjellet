---
layout: layouts/page.html
title: "Sommerregistrering 2026 - Slottsfjellet Spillforening"
bodyClass: sommer2026-form-page
extraCss: /css/sommer2026-form.css
extraJs: /js/sommer2026-form.js
---

::::: page-hero {.library-theme}

:::: hero-content

[Sommeren 2026]{.kicker}

# Sommerregistrering {.page-hero__title style="color: var(--accent-blue)"}

Vi har pauset tirsdagstreffene for sommeren, men det betyr ikke at vi ikke
har lyst til å spille sammen. Siden det er annerledes hvilken tid folk har
om sommeren, tenkte vi vi skulle finne ut når dere kan og se om vi kan få
til noen treff som passer for folk - og kanskje kan de som ellers ikke får
til på tirsdager, få spilt noe i sommer.

Fyll ut skjemaet under, så prøver vi å få til treff for deg!
{.page-hero__lead}

::::

:::::

::: panel

<form id="sommer-form" novalidate>

<div class="form-status" id="form-status" role="status" aria-live="polite"></div>

<div class="form-section">
  <h2>Om deg</h2>

  <div class="form-field">
    <label for="field-name">Navn <span class="required-marker">*</span></label>
    <input type="text" id="field-name" name="name" autocomplete="name" required />
  </div>

  <div class="form-field">
    <label for="field-contact">Epost eller Discord-handle <span class="required-marker">*</span></label>
    <input type="text" id="field-contact" name="contact" autocomplete="email" required />
    <p class="field-hint">Så vi kan kontakte deg om treffene.</p>
  </div>

  <!-- Honeypot: hidden from real users, bots often fill every field they find -->
  <div class="hp-field" aria-hidden="true">
    <label for="field-website">Nettside</label>
    <input type="text" id="field-website" name="website" tabindex="-1" autocomplete="off" />
  </div>
</div>

<div class="form-section">
  <h2>Hva har du lyst til å spille?</h2>
  <p class="field-hint">
    Dra rutene ned i den rangerte listen for å vise hva du prioriterer
    høyest. Du kan slippe flere ruter i samme rad hvis du liker dem like
    godt. Rutene du ikke har lyst til å spille kan du dra til - eller
    trykke krysset for å sende til - "Vil ikke".
  </p>
  <div id="ranking-widget"></div>
</div>

<div class="form-section">
  <h2>Når passer det?</h2>
  <p class="field-hint">
    Velg en tilgjengelighet i fargevelgeren under kalenderen, og klikk
    deretter på enkeltdatoer for å sette den. Klikk på en ukedag øverst
    for å sette hele den ukedagen, eller på et ukenummer til venstre for
    å sette hele uken.
  </p>
  <div id="calendar-widget"></div>
</div>

<div class="form-section">
  <h2>Andre kommentarer</h2>
  <div class="form-field">
    <label for="field-comment">Åpen kommentar</label>
    <textarea id="field-comment" name="comment" rows="4"></textarea>
  </div>
</div>

<div class="form-section form-submit-row">
  <button type="submit" class="btn-primary" id="submit-button">Send inn</button>
</div>

</form>

:::

<script type="application/json" id="sommer-form-config">
{
  "appsScriptUrl": "https://script.google.com/macros/s/AKfycbwDtOTrFgyurfsOMREzqcirYbcx5vJo_HIUtCHvIHg0wVkIAsYe0_Nt2Yiam2xmyiNb/exec",
  "startDate": "2026-06-20",
  "endDate": "2026-08-16",
  "gameTypes": [
    { "id": "brettspill", "label": "Brettspill" },
    { "id": "miniatyrspill", "label": "Miniatyrspill" },
    { "id": "miniatyrmaling", "label": "Miniatyrmaling" },
    { "id": "rollespill_annet", "label": "Rollespill (Annet)" },
    { "id": "rollespill_dnd5e", "label": "Rollespill (D&D 5e)" },
    { "id": "rollespill_osr", "label": "Rollespill (D&D B/X OSR, kampanjen Gull & Gråstein)" },
    { "id": "mtg_commander", "label": "MtG Commander" },
    { "id": "annet", "label": "Annet (beskriv nedenfor)" }
  ]
}
</script>
