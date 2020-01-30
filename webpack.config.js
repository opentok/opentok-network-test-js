const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/NetworkTest/index.ts',
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [
        { loader: 'babel-loader' },
        { loader: 'ts-loader' },
      ],
    }],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/NetworkTest/'),
    library: 'OpenTokNetworkConnectivity',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },
};