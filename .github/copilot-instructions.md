# Copilot Instructions for Slottsfjellet

This is a static site built with **Eleventy (11ty)** for Slottsfjellet Spillforening, a gaming organization in Tønsberg, Norway.

## Build & Development Commands

- **Local development server**: `npx @11ty/eleventy --serve --port=8080`
  - Site reloads on file changes (hard refresh if caching issues: Cmd-Shift-R on Mac, Ctrl-Shift-R on Linux/Windows)
  - Run with different `--port` if multiple instances needed
  
- **Build for production**: `npx @11ty/eleventy`
  - Outputs to `_site/` directory
  
- **Deploy to production**: `bin/deploy.sh`
  - Requires `.env` file with `SLOTTSFJELLET_URL`, `SLOTTSFJELLET_WWW_SUBDIR`, and optionally `LFTP_PASSWORD`
  - Verifies git state (main branch, no uncommitted changes, up to date)
  - Creates timestamped backups before deploying

## Project Structure

- **`src/`** - All page source files and assets
  - `*.html` - Main pages (index.html, boardgames.html, rpg.html, tirsdag.html, ttt.html, about.html, countdown.html)
  - `_includes/` - Reusable template fragments (header, footer, nav, content blocks)
  - `_data/` - Eleventy data configuration (e.g., permalink settings)
  - `css/`, `js/`, `images/` - Static assets
  - `_extra_for_root/` - Files copied to root (robots.txt, etc.)

- **`_site/`** - Built output (auto-generated, do not edit)

- **`shared/`** - Non-web assets
  - Python scripts for card generation and PDF manipulation
  - Design assets (SVGs, images, PDFs)

- **`bin/`** - Deployment and utility scripts

## Key Conventions

### Navigation & Page Structure

Each page gets a unique CSS class on the `<body>` element to indicate which page is active:
- `index-page`, `boardgames-page`, `rpg-page`, `tirsdag-page`, `ttt-page`, `about-page`, etc.

Navigation links in `src/_includes/nav.html` use matching CSS classes:
- `index-link`, `boardgames-link`, `rpg-link`, `tirsdag-link`, `ttt-link`, `about-link`

CSS in `src/css/style.css` uses selectors like `.index-page .index-link` to style active nav items (bold, black, non-clickable).

**When adding a new page:**
1. Create `src/newpage.html` with `<body class="newpage-page">`
2. Add link to `src/_includes/nav.html` with `<li class="nav-item newpage-link">`
3. Add CSS rule in `src/css/style.css`: `.newpage-page .newpage-link { /* active styles */ }`

### Template Includes

Use Liquid templating syntax with `{% render %}` to include templates:

```liquid
{% render "head.html", title: "Page Title" %}
{% render "header.html" %}
```

Templates can accept parameters and use `{{ variable }}` to output values.

### Time-Sensitive Content

Elements that should show/hide based on date/time use JavaScript attributes:

```html
<div data-show-after="2026-04-01">Content visible after April 1st</div>
<div data-hide-after="2026-04-01">Content hidden after April 1st</div>
```

JavaScript in `src/js/` handles these automatically.

### Content Sections

Content body sections for different events/topics are in `src/_includes/`:
- `content_body_tt_*.html` - Tønsberg Tabletop variants
- `content_body_samlingsdatoer.html` - Collection dates

Include these in main pages with `{% render "content_body_tt_hosten_2025.html" %}`.

## Language

The content in the web pages is in Norwegian; the code is in English.
Comments, variable names, tag names, etc are all in English. Maintain this
consistency when making changes.

## Git & Deployment Workflow

- Git autofetch and auto-push are configured in `.vscode/settings.json` for convenience
- Always fetch latest changes before starting work: `git pull`
- Commit and push changes with descriptive messages
- Run full build (`npx @11ty/eleventy`) to verify before committing
- Never commit `.env` file (it contains credentials)

## Known TODOs

- Refactor `src/_includes/infobox_om_oss.html` to match content body structure
- Move nav include to be called from header (currently separate)
- Migrate from `src/foo.html` to `src/foo/index.html` structure (currently using filename in URLs)

## Design Notes

The site uses minimal JavaScript intentionally (no build step needed for JS, easy to maintain). 
- CSS handles most interactive states (active nav, page styling)
- JavaScript is used only for time-based visibility and specific interactive features
- No package.json; Eleventy is the only runtime dependency
