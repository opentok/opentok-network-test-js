const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

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
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'OpenTokNetworkTest',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      mangle: false
    })
  ]
};