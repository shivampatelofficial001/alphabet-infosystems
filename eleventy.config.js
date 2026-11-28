/**
 * Eleventy (11ty) Configuration for Alphabet Infosystems
 * Phase 6: SEO, Security & Quality Assurance
 */

module.exports = function (eleventyConfig) {
  // Passthrough copy for static assets, stylesheet, scripts, CMS admin, SEO, and Cloudflare config files
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("_headers");

  // Watch static assets for changes during local development
  eleventyConfig.addWatchTarget("./style.css");
  eleventyConfig.addWatchTarget("./script.js");

  // Blog posts collection sorted newest-first
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("post").sort(function (a, b) {
      return b.date - a.date;
    });
  });

  // Human-readable date filter for blog posts
  eleventyConfig.addFilter("readableDate", function (dateObj) {
    if (!dateObj) { return ""; }
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    }).format(new Date(dateObj));
  });

  // ISO date filter for <time datetime="..."> and structured data
  eleventyConfig.addFilter("isoDate", function (dateObj) {
    if (!dateObj) { return ""; }
    return new Date(dateObj).toISOString().split("T")[0];
  });

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
