const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const DotenvPlugin = require('webpack-dotenv-plugin');
require('dotenv').config({
  path: '.env',
});

module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', path.resolve(__dirname, 'public/index.js')],
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './build/client'),
    // filename: 'scripts/[name].[hash].js',
    filename: 'index.js',
    chunkFilename: 'scripts/[name].[contenthash].js',
  },
  devServer: {
    overlay: true,
    // contentBase: path.resolve(`${__dirname}/`),
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: '/node_modules/',
    }],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html',
      filename: './index.html',
    }),
    new DotenvPlugin({
      path: '.env',
      sample: '.env',
      allowEmptyValues: true,
    })
  ],
};
