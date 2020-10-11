const webpack = require('webpack')
const { merge } = require('webpack-merge')
const base = require('./webpack.base.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const isProd = process.env.NODE_ENV === 'production'

const config = merge(base, {
  entry: {
    app: './src/entry-client.js'
  },
  resolve: {
    alias: {
      'create-api': './create-api-client.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.styl(us)?$/,
        use: [
          isProd ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          } : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            }
          },
          'stylus-loader'
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /css$/,
          enforce: true,
        },
        vendor: {
          name: 'vendor',
          test: /[\/]node_modules[\/]/,
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    new MiniCssExtractPlugin({
      filename: 'common.[chunkhash].css'
    }),
    // // extract vendor chunks for better caching
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module) {
    //     // a module is extracted into the vendor chunk if...
    //     return (
    //       // it's inside node_modules
    //       /node_modules/.test(module.context) &&
    //       // and not a CSS file (due to extract-text-webpack-plugin limitation)
    //       !/\.css$/.test(module.request)
    //     )
    //   }
    // }),
    // // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // // on every build.
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest'
    // }),
    new VueSSRClientPlugin()
  ]
})

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    // auto generate service worker
    new SWPrecachePlugin({
      cacheId: 'vue-hn',
      filename: 'service-worker.js',
      minify: true,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst'
        },
        {
          urlPattern: /\/(top|new|show|ask|jobs)/,
          handler: 'networkFirst'
        },
        {
          urlPattern: '/item/:id',
          handler: 'networkFirst'
        },
        {
          urlPattern: '/user/:id',
          handler: 'networkFirst'
        }
      ]
    })
  )
}

module.exports = config
