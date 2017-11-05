const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: "./src/network-connectivity/index.ts",
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  // plugins: [new webpack.optimize.UglifyJsPlugin()]
};