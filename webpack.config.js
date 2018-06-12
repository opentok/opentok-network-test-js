const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/NetworkTest/index.ts',
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
    }],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/NetworkTest/'),
    library: 'OpenTokNetworkTest',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        sourceMap: true,
      }),
    ],
  }
};