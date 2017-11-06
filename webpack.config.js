const path = require('path');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  entry: './src/networkConnectivity/index.ts',
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.ts(x?)$/,
      loader: 'babel-loader!ts-loader'
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
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
      exclude: '**/{errors,util}/*.ts',
      module: 'commonjs',
      theme: 'minimal',
      includeDeclarations: true,
      ignoreCompilerErrors: true,
      target: 'ES6',
      media: './media'
    }, './src')
  ]
};
