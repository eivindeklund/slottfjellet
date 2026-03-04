# Content overview and user stories, for site refactoring

## Content overview

### /

FUNCTION: Main landing page

CONTENT:

* Nav bar
* Experimental carousel over our different activities and most important context
* Sidebar w/about us (including a not particularly prominent link to where our
  main online social activity/coordination is, on Discord
* "Aktuelt nå" - semi-blog with the most important stuff going on / calls for
  people (rarely updated).  Currently contains something saying we play in
  English if wanted, information about the Tuesday gatherings, and a pointer at
  the upcoming "Tønsberg Tabletop".  Not updated in blog order, just filled in
  as appropriate.  The bit about English play being available is very important,
  since a fair fraction of people that want to play don't speak Norwegian well,
  and have been reluctant to come because of this.
* Dates and times for our meetups.  These used to be important when we were only
  meeting every second week, and when we had different focuses for different tuesday meetings.  We hope to add in something more like that again, but 
  now they're not that interesting 

### /about

FUNCTION: Informational page about the association itself

CONTENT:

* Sidebar "Om oss" infobox (same as on index): brief description, links to
  Discord, Facebook, Google Calendar, and membership sign-up; pointers to the
  two main club projects (Tuesday gatherings, Tønsberg Tabletop)
* Main "Foreningsinformasjon" section with several sub-boxes:
  * **Styret** - current board: Daniel T. Bekmand (Chair), Stig Magne E.
    Brekken (Treasurer), Joakim Tvededal (Media), Per O. Isdahl (Member),
    Kristian (Member)
  * **Kontakt** - email (post@slottsfjellet.org, rendered via JS to avoid
    scraping) and Discord link
  * **Dokumenter** - link to Google Drive folder with bylaws, meeting minutes,
    etc.
  * **Kalender** - link to subscribe to the club's Google Calendar
  * **Diverse nummer** - Vipps numbers (967991 gift, 830821 event menu) and
    org number 931 955 144

### /boardgames

FUNCTION: Catalogue of the club's board game library

CONTENT:

* Intro text: the club plays board games at Tuesday gatherings and other
  events; these are the games the club owns and that members can play or borrow
* Each game is an expandable `<details>` element with a thumbnail image,
  description, BGG and Outland links, player count, typical duration, and
  complexity rating
* Current games in the library:
  * **Cartographers** – roll & write map-drawing game, 1–8 players, 30–45 min,
    complexity 2/5, Norwegian
  * **Cartographers: Heroes** – sequel/expansion with new heroes and enemies,
    1–10 players, 30–45 min, complexity 2/5, Norwegian
  * **Citadels** – classic city-building card game with bluffing and role
    selection, 2–7 players, 20–60 min, complexity 2/5, English
  * **Flip 7** – quick push-your-luck card game, 3–9 players, 20 min,
    complexity 1/5, English
  * **Marvel Mayhem** – superhero combat card game, 2–4 players, 10 min,
    complexity 1.5/5
  * **Risk Legacy** (sealed/unused) – evolving campaign Risk, 4–5 players,
    60 min per round, complexity 3/5, English
  * **UNO: Show 'em No Mercy** – chaos UNO variant, 2–6 players, 15–30 min,
    complexity 1/5, English (no text on cards)
  * **Yucatan** – resource-gathering strategy set in ancient Mexico, 2–4
    players, 90 min, complexity 3/5, English

### /countdown

Technical page for use during Tønsberg Tabletop, accessed directly and not
relevant for information architecture / layout

### /rpg

FUNCTION: Information about the club's RPG activities

CONTENT:

* Short page acknowledging that an active RPG environment takes more
  organizational effort than other game types
* Honest admission that the club hasn't yet had the capacity to get it
  properly off the ground
* Open invitation: if you'd like to help organize RPG activities, please get
  in touch

### /tirsdag

FUNCTION: Dedicated page for the weekly Tuesday gatherings

CONTENT:

* **Dates sidebar** (left column): upcoming gathering dates rendered from the
  `content_body_samlingsdatoer.html` include
* **General info** (right, wider column):
  * Location: Tønsberg Bibliotek, room in the basement, every Tuesday
    17:30–22:00 (flexible arrival/departure)
  * Free to attend; no membership required; bring your own games or borrow
    from the club
  * What's usually happening:
    * Frostgrave (fantasy miniature game, loner models available)
    * Warhammer Kill Team (5–20 model skirmish game)
    * Miniature painting
    * Magic: the Gathering – mostly Commander; willing to teach, loaner decks
      available
    * Roleplaying – check Discord #rollespill for what's running
  * Friendly invitation to just drop by
* **Parking guide**: prominent warning that parking costs vary widely (7 kr to
  275 kr for a 17–22 session); color-coded legend (red = expensive ~275 kr,
  yellow = medium ~75 kr, green = cheap ~13 kr, dark green = very cheap ~7 kr);
  embedded Google My Maps iframe showing specific parking areas near the library

### /ttt

FUNCTION: Dedicated page for Tønsberg Tabletop (the bi-annual miniature gaming
event)

CONTENT:

* **Quick info sidebar**:
  * Event held twice a year (April and October)
  * Low-threshold Warhammer 40k and Warhammer: The Old World tournaments
  * Shared pizza lunch (from Balkan Tønsberg)
  * Dedicated painting table
  * Free-play tables for other games

* **Aktuelt Nå** (news column, rendered from includes):
  * *Spring 2026 specific info*: planning underway; venue is Søndre Skagen
    Samfunnshus, April 17–19; tournaments in 40k and Old World on Saturday;
    Sunday plans still TBD; discussion on Discord
  * *Generic Tønsberg Tabletop description*: what the event is, the
    low-threshold philosophy (no experience or painted models required; even
    paper-cone proxies have been used; only requirement is models are
    identifiable and roughly correct size), loaner armies available for
    beginners, painting table with equipment to borrow, open to all experience
    levels; historical note that it has grown out of its previous venue (Solhaug
    KFUK/KFUM)
  * *Typical schedule*:
    * Friday 13:00–23:00 – free play and setup
    * Saturday 09:00–10:00 – tournament registration
    * Saturday 10:00–13:00 – Round 1
    * Saturday 13:30–16:30 – Round 2
    * Saturday 16:30–17:30 – Break + pizza
    * Saturday 17:30–20:30 – Round 3
    * Saturday ~21:00 – Closing ceremony and prizes

## New ideas

We should get potential volunteers to register; form here: https://forms.gle/1xvumSdhAMhyNBka6

We should get people that want to play TTRPGs to register, form here: https://forms.gle/teyKmsqegEcjWJ6t9

## User stories

**US-01 – New local resident looking for a gaming group**
"I've just moved to Tønsberg and want to find people to play board games or
miniatures with. I heard there's a club somewhere."
→ Lands on `/` or finds the club via search. Needs to quickly understand:
what games they play, when and where gatherings are, and that it's free and
welcoming. The English-play notice is especially important if their Norwegian
is limited.

**US-02 – English-speaker unsure they'd be welcome**
"I want to join but I only speak a little Norwegian. Will I fit in?"
→ The prominent English notice on `/` ("games can be run in English, we are
very happy to do so!") directly addresses this. The Google Translate flags
in the header also help.

**US-03 – Miniature painter / Warhammer player**
"I paint 40k and want to find people to play against and share the hobby with."
→ Wants to see that Kill Team and Frostgrave are regulars on Tuesdays, that
Tønsberg Tabletop exists with real tournaments, and that there's a painting
table at both venues. `/tirsdag` and `/ttt` are the key pages.

**US-04 – Prospective Tønsberg Tabletop participant**
"I've heard about TTT and want to know if I'm good enough / if I need a painted
army."
→ The explicit low-threshold messaging on `/ttt` (paper proxies welcome, loaner
armies available, no experience required) directly addresses this anxiety.

**US-05 – RPG player looking for a campaign**
"I want to find a local TTRPG group. Does this club do that?"
→ `/rpg` is honest that it's not yet well-organized but invites people to help,
and `/tirsdag` mentions roleplaying as an activity with a pointer to Discord
#rollespill.

**US-06 – Parent looking for a hobby activity for a teenager**
"Is this appropriate / safe for a 16-year-old? What age range is this for?"
→ Currently the site doesn't explicitly address this. The welcoming/friendly
tone helps. Ages could be addressed more directly.

**US-07 – Potential volunteer / organizer**
"I want to help run the club. How do I get involved?"
→ `/rpg` hints at this. The about page has contact info. But there is no
dedicated call-to-action for volunteering on the main pages. The new volunteer
registration form (Google Forms) is not yet linked from the site.

**US-08 – Existing member looking up dates or parking**
"When is the next Tuesday gathering? Where do I park cheaply?"
→ `/tirsdag` has both: the dates sidebar and the parking map/legend. The
parking info is especially practical and well-executed.

**US-09 – Someone curious about what games the club owns**
"Can I borrow a board game? What do they have?"
→ `/boardgames` provides a good browsable catalogue with images, descriptions,
and BGG links.

**US-10 – Someone wanting to formally join / become a member**
"I want to be an official member. How do I sign up and what does it cost?"
→ The "Om oss" infobox has a "Bli medlem" link. The about page has contact info
and the Vipps numbers. But membership cost/benefits aren't stated anywhere.

# New layout

## Description of typical layout types and their pros and cons

**Single-column (full-width)**
All content stacks vertically in one column. Simple, mobile-friendly, easy to
scan. Loses ability to show related content side-by-side. Works well for
content-heavy pages (e.g. /boardgames).

**Two-column (sidebar + main)**
A narrow sidebar for persistent/secondary info alongside a wider main content
column. The current site does this with "Om oss" + news on `/` and `/about`.
Good for letting users orient themselves (who we are) while reading
current content. Risk: sidebar can feel redundant when its content doesn't
change.

**Three-column grid**
The current site uses a 3-column CSS grid on some pages. Allows info-box,
main content, and optional third column. Can feel cramped on narrow screens
and adds layout complexity; often collapses to 2-col or 1-col on mobile.

**Card/grid layout**
A grid of equal-sized cards, each representing an activity, event, or game.
Great for discovery-oriented pages (e.g. "what does the club do?", game
catalogue). Easy to scan visually. Less well-suited for long narrative content.

**Landing page with hero/carousel**
A prominent hero section (image carousel currently on `/`) followed by
sections. Good first impression and visual identity. Carousel can be ignored
or cause accessibility issues if not done well.

## Particular concerns for Slottsfjellet Spillerforening

* **Bilingual audience**: A meaningful share of potential members don't speak
  Norwegian (or aren't comfortable with it). The English notice needs to be
  unmissable, and key CTAs should be clear without language proficiency.
* **Multiple distinct audiences**: Miniature gamers, board gamers, RPG players,
  and people new to the hobby all have different needs. The navigation and
  homepage need to route them quickly to the right content.
* **Low staff / volunteer capacity**: The site is maintained by volunteers.
  Layout and content must be easy to update (e.g. changing dates, the "Aktuelt
  nå" section). Complexity should be kept low.
* **Event-driven spikes**: Tønsberg Tabletop generates a spike of interest
  twice a year. The homepage needs to be able to surface TTT info prominently
  when relevant and gracefully when it isn't.
* **Parking is a genuine pain point**: The parking info on `/tirsdag` is
  practically important and rarely seen on club sites. It should stay prominent.
* **Welcoming/low-threshold tone is core to the brand**: Any redesign must
  preserve the explicit "you don't need experience / painted minis / membership
  to join us" messaging.

## Suggested layout for remake of site

**`/` (index)**: Hero section with a one-liner ("We play board games, miniatures,
card games and RPGs in Tønsberg. Drop by any Tuesday – free and open to all.")
+ CTA buttons ("When do we meet?" → /tirsdag, "Tønsberg Tabletop" → /ttt).
Below hero: a card row for the three activity areas (Board Games, Miniatures /
TTT, RPG). Then an "Aktuelt Nå" news block (keep current semi-blog approach).
The English-language notice should be in the hero or immediately below it, not
buried.  TODO: 

**`/tirsdag`**: Keep current two-column layout (dates sidebar + info). Consider
pulling the parking section into a clearly-labeled collapsible or tab to reduce
page length while keeping it discoverable.

**`/ttt`**: A dedicated event page with: event dates & registration CTA at top,
then the what-is-it/low-threshold explainer, then the schedule. Consider a
"past events" gallery section to build credibility/community feel.

**`/boardgames`**: Current expandable list works well. Could add a filter/tag
system (by player count, complexity) if the library grows.  TODO: Add image

**`/miniaturegames`**: TODO: Missing.  Add content & image.

**`/rpg`**: Currently very sparse. Should either be fleshed out with what's
actually running (Discord-linked), a registration form for interested players,
and the volunteer/organizer recruitment CTA – or removed from the nav until
there's more to show.

**`/tradingcardgames`**: TODO: Missing.  Add content & image.

**`/about`**: Keep as-is but add a clear membership cost/benefits section and
a dedicated volunteer recruitment call to action (linking to the Google Form).