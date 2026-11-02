module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/main.js": "main.js" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });

  eleventyConfig.addFilter("asset", (value) =>
    typeof value === "string" ? value.replace(/^\//, "") : value,
  );

  eleventyConfig.addFilter("json", (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c"),
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
  };
};
