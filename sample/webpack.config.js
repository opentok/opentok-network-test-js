module.exports = {
    entry: "./src/js/index.js",
    node: {
      fs: "empty",
      net: "empty"
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    }
}
