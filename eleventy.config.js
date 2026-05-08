const markdownItAttrs = require("markdown-it-attrs");
const markdownItContainer = require("markdown-it-container");
const markdownItBracketedSpans = require("markdown-it-bracketed-spans");

// Helper: register a simple container that renders as <TAG [attrs]>
function addElementContainer(mdLib, containerName, tag) {
	mdLib.use(markdownItContainer, containerName, {
		render(tokens, idx, _options, _env, slf) {
			const token = tokens[idx];
			if (token.nesting === 1) {
				const attrs = slf.renderAttrs(token);
				return attrs ? `<${tag}${attrs}>\n` : `<${tag}>\n`;
			}
			return `</${tag}>\n`;
		}
	});
}

module.exports = function (eleventyConfig) {
	// Enable HTML passthrough, attribute syntax ({.class}), and inline spans ([text]{.class})
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.set({ html: true });
		mdLib.use(markdownItAttrs);
		mdLib.use(markdownItBracketedSpans);

		// Generic HTML element containers — fallback when no named component fits
		addElementContainer(mdLib, 'div', 'div');
		addElementContainer(mdLib, 'section', 'section');
		addElementContainer(mdLib, 'article', 'article');
		addElementContainer(mdLib, 'aside', 'aside');

		// panel — <article class="comic-panel"><div class="panel-body [attrs]">
		// Attrs go on the inner panel-body (e.g., {style="background: var(--accent-yellow)"})
		mdLib.use(markdownItContainer, 'panel', {
			render(tokens, idx, _options, _env, slf) {
				const token = tokens[idx];
				if (token.nesting === 1) {
					const attrs = slf.renderAttrs(token);
					const bodyOpen = attrs
						? `<div class="panel-body"${attrs}>`
						: `<div class="panel-body">`;
					return `<article class="comic-panel">\n${bodyOpen}\n`;
				}
				return `</div>\n</article>\n`;
			}
		});

		// page-hero — outer hero section; attrs go on the <section> element
		// e.g., ::: page-hero {.library-theme} or ::: page-hero {style="border-color: ..."}
		mdLib.use(markdownItContainer, 'page-hero', {
			render(tokens, idx) {
				const token = tokens[idx];
				if (token.nesting === 1) {
					const extraClass = token.attrGet('class') || '';
					const extraStyle = token.attrGet('style') || '';
					const cls = extraClass ? `comic-panel page-hero ${extraClass}` : 'comic-panel page-hero';
					const stylePart = extraStyle ? ` style="${extraStyle}"` : '';
					return `<section class="${cls}"${stylePart}>\n<div class="page-hero__grid">\n`;
				}
				return `</div>\n</section>\n`;
			}
		});

		// hero-content — plain <div> for the text column inside a page-hero
		addElementContainer(mdLib, 'hero-content', 'div');

		// hero-image — <div class="comic-panel" style="margin: 0"> for the image column
		mdLib.use(markdownItContainer, 'hero-image', {
			render(tokens, idx) {
				const token = tokens[idx];
				if (token.nesting === 1) {
					return `<div class="comic-panel" style="margin: 0">\n`;
				}
				return `</div>\n`;
			}
		});

		// page-grid — section.page-grid with baked-in top margin
		// Use {.page-grid--sidebar} for sidebar layout
		mdLib.use(markdownItContainer, 'page-grid', {
			render(tokens, idx) {
				const token = tokens[idx];
				if (token.nesting === 1) {
					const extraClass = token.attrGet('class') || '';
					const cls = extraClass ? `page-grid ${extraClass}` : 'page-grid';
					return `<section class="${cls}" style="margin-top: 28px">\n`;
				}
				return `</section>\n`;
			}
		});

		// cta-row — button row inside a hero or panel
		mdLib.use(markdownItContainer, 'cta-row', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1 ? `<div class="cta-row">\n` : `</div>\n`;
			}
		});

		// highlight-box — highlighted callout box
		mdLib.use(markdownItContainer, 'highlight-box', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1
					? `<div class="highlight-box">\n`
					: `</div>\n`;
			}
		});

		// split-callout — multi-column callout grid
		mdLib.use(markdownItContainer, 'split-callout', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1
					? `<div class="split-callout">\n`
					: `</div>\n`;
			}
		});

		// detail-card — card inside a split-callout
		mdLib.use(markdownItContainer, 'detail-card', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1
					? `<div class="detail-card">\n`
					: `</div>\n`;
			}
		});

		// rule-note — rules clarification callout
		mdLib.use(markdownItContainer, 'rule-note', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1
					? `<div class="rule-note">\n`
					: `</div>\n`;
			}
		});

		// number-grid — grid of detail-card number items
		mdLib.use(markdownItContainer, 'number-grid', {
			render(tokens, idx) {
				return tokens[idx].nesting === 1
					? `<div class="number-grid">\n`
					: `</div>\n`;
			}
		});

		// library-entry TITLE {open} — boardgame library entry
		// Title is parsed from info string; {open} attribute adds open to <details>
		mdLib.use(markdownItContainer, 'library-entry', {
			render(tokens, idx) {
				const token = tokens[idx];
				if (token.nesting === 1) {
					// token.info = "library-entry Some Game Title {open}"
					let rest = token.info.trim().replace(/^library-entry\s*/, '');
					const isOpen = token.attrGet('open') !== null;
					const title = rest.replace(/\{[^}]*\}/g, '').trim();
					const openAttr = isOpen ? ' open' : '';
					return `<details class="comic-panel library-entry"${openAttr}>\n<summary>${title}</summary>\n<div class="panel-body">\n`;
				}
				return `</div>\n</details>\n`;
			}
		});
	});
	// Input directory: src
	// Output directory: _site

	//
	// Static files to pass through to output
	//

	// TODO: Move these to img/ and css/ and passthrough those folders
	// Stuff that must be in root
	eleventyConfig.addPassthroughCopy("src/favicon.ico");
	eleventyConfig.addPassthroughCopy("src/site.webmanifest");
	// Directories
	eleventyConfig.addPassthroughCopy("src/css");
	eleventyConfig.addPassthroughCopy("src/favicon");
	eleventyConfig.addPassthroughCopy("src/images");
	eleventyConfig.addPassthroughCopy("src/js");
	// Extra files to be in root
	eleventyConfig.addPassthroughCopy({ "src/_extra_for_root": "/" });
	// TODO: .htaccess is probably not necessary (it just sets js files to
	// be the right mime type, and likely the server does that by itself)
	eleventyConfig.addPassthroughCopy("src/js/.htaccess");
	// Pass through during --serve, the default is "copy"
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
	// Tell Eleventy to use src/ as its input directory
	return {
		dir: {
			input: "src",
			output: "_site"
		}
	};
};
