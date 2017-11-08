const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
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
  target: 'node',
  externals: [nodeExternals({ whitelist: [/^ramda/] })],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'OpenTokNetworkConnectivity',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ minimize: true }),
    new TypedocWebpackPlugin({
      name: 'OpenTok Network Connectivity Test',
      readme: './README.md',
      exclude: '**/**/types.ts',
      module: 'commonjs',
      // theme: 'minimal',
      includeDeclarations: true,
      ignoreCompilerErrors: true,
      target: 'ES6',
      media: './media'
    }, './src')
  ]
};
