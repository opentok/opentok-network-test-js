const path = require('path');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  entry: './src/network-connectivity/index.ts',
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
  plugins: [
    // new webpack.optimize.UglifyJsPlugin(),
    new TypedocWebpackPlugin({
      name: 'OpenTok Network Connectivity Test',
      readme: './README.md',
      module: 'commonjs',
      mode: 'modules',
      theme: 'minimal',
      exclude: '**/{errors,util,node_modules}/*.ts',
      includeDeclarations: false,
      ignoreCompilerErrors: true,
  }, './src')
  ]
};