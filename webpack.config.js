const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/NetworkTest/index.ts',
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: "ts-loader",
    }],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'opentok-network-test-js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            keep_classnames: true,
            keep_fnames: true,
          }
        }
      })
    ]
  }
};