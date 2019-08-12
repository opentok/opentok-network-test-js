module.exports = {
    entry: ['babel-polyfill', './src/js/index.js'],
    node: {
      fs: "empty",
      net: "empty"
    },
    mode: "none",
    module: {
      rules: [
          {
              loader: 'babel-loader',
              exclude: /node_modules/,
              query: {
                "presets": [
                  ["env", {
                      "targets": {
                          "ie": 11
                      }
                    }]
                ]
              }
          }
      ],
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    }
}
