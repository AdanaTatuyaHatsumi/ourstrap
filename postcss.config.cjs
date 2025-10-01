// postcss.config.cjs
// PostCSS config: Autoprefixer + cssnano (minify)
// Used by: `postcss css/ourstrap.css -o css/ourstrap.min.css --map`
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    })
  ]
};
