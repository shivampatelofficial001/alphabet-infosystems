/**
 * Eleventy (11ty) Configuration for Alphabet Infosystems
 * Phase 3: Clean URL Architecture & Passthrough Assets
 */

module.exports = function (eleventyConfig) {
  // Passthrough copy for static assets, stylesheet, scripts, and Cloudflare Pages config files
  // Paths are relative to the project root and copied directly to _site/
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("_headers");

  // Watch static assets for changes during local development
  eleventyConfig.addWatchTarget("./style.css");
  eleventyConfig.addWatchTarget("./script.js");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
