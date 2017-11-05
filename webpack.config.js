const path = require('path');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  entry: './src/networkConnectivity/index.ts',
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
      exclude: '**/{errors,util,connectivityTest}/*.ts',
      theme: 'minimal',
      includeDeclarations: true,
      ignoreCompilerErrors: true,
      target: 'ES6'
  }, './src')
  ]
};