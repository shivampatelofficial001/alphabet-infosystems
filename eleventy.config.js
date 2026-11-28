/**
 * Eleventy (11ty) Configuration for Alphabet Infosystems
 * Phase 1: Foundation Setup
 */

module.exports = function (eleventyConfig) {
  // Passthrough copy for static assets, stylesheet, and client-side scripts
  // Paths are relative to the project root and copied directly to _site/
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("script.js");

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
