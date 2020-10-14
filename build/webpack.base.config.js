const path = require('path')
const webpack = require('webpack')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd
    ? false
    : '#cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/dist/',
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    alias: {
      'public': path.resolve(__dirname, '../public')
    }
  },
  module: {
    noParse: /es6-promise\.js$/, // avoid webpack shimming process
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          },
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      },
    ]
  },
  performance: {
    hints: false
  },
  plugins: isProd
    ? [
        new VueLoaderPlugin(),
        // new BundleAnalyzerPlugin(),
        // new webpack.optimize.ModuleConcatenationPlugin(),
        // new MiniCssExtractPlugin({
        //   filename: 'common.[chunkhash].css'
        // })
      ]
    : [
        new VueLoaderPlugin(),
        new FriendlyErrorsPlugin()
      ]
}
