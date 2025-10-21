module.exports = function (eleventyConfig) {
	// Input directory: src
	// Output directory: _site

	//eleventyConfig.addPassthroughCopy(["*.png", "*.css", "favicon.ico", "site.webmanifest"]);
	eleventyConfig.addPassthroughCopy("*.png");
	eleventyConfig.addPassthroughCopy("*.css");
	eleventyConfig.addPassthroughCopy("*.svg");
	eleventyConfig.addPassthroughCopy("*.jpg");
	eleventyConfig.addPassthroughCopy("favicon.ico");
	eleventyConfig.addPassthroughCopy("site.webmanifest");
	eleventyConfig.addPassthroughCopy("favicon/*");
	eleventyConfig.addPassthroughCopy("js/*.js");
	// Pass through during --serve, the default is "copy"
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};
