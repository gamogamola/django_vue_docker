const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  outputDir: '../static/bundles/',
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/static/bundles/'
      : 'http://0.0.0.0:3000/static/bundles/',
  devServer: {
    public: '0.0.0.0:3000',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  productionSourceMap: false,
  configureWebpack: {
    entry: {
      main: './src/main.js'
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        __STATIC__: 'static',
      }
    },
    plugins: [
      new BundleTracker({
        path: __dirname,
        filename: './webpack-stats.json'
      }),
      new CompressionPlugin({
        cache: true,
      }),
    ],
    optimization: {
      splitChunks: false
    }
  }
}