const webpack = require('webpack')
const { merge } = require('webpack-merge')
const base = require('./webpack.base.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin');
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
    new VueSSRClientPlugin()
  ]
})

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    // auto generate service worker
    new WorkboxPlugin.GenerateSW({
      cacheId: 'vue-hn',
      swDest: 'service-worker.js',
      clientsClaim: true,
      skipWaiting: true,
      dontCacheBustURLsMatching: /./,
      exclude: [/\.map$/, /\.json$/],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /\/(top|new|show|ask|jobs)/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: '/item/:id',
          handler: 'NetworkFirst'
        },
        {
          urlPattern: '/user/:id',
          handler: 'NetworkFirst'
        }
      ]
    })
  )
}

module.exports = config
