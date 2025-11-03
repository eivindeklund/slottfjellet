module.exports = function (eleventyConfig) {
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
