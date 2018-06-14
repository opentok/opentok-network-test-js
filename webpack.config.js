const path = require('path');
const webpack = require('webpack');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
  entry: './src/NetworkTest/index.ts',
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.(js|ts)$/,
      loader: 'babel-loader!ts-loader'
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'OpenTokNetworkConnectivity',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ minimize: true, mangle: false }),
    new TypedocWebpackPlugin({
      name: 'OpenTok Network Connectivity Test',
      readme: './README.md',
      exclude: '**/**/{types|mapping}.ts',
      module: 'commonjs',
      theme: 'minimal',
      includeDeclarations: true,
      ignoreCompilerErrors: true,
      target: 'ES6',
      media: './media'
    }, './src')
  ]
};
