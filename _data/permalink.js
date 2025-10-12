// Keep the filenames we have as inputs instead of creating "pretty" urls
// Transforming to "pretty" URLs will change ttt.html to ttt (by creating
// _site/ttt/index.thml)
//
// We already have the HTML paths exported, and we should keep stable URLs
module.exports = '/{{ page.filePathStem }}.html';

