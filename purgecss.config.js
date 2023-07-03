module.exports = {
  content: ['404.html', 'blocks/**/*.js', 'scripts/*.js'], // Files to analyze for used CSS classes
  css: ['node_modules/bootstrap/dist/css/bootstrap.min.css'], // CSS files to include
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
};
