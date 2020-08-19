module.exports = {
    entry: ['./src/js/index.js'],
    node: {
      fs: "empty",
      net: "empty"
    },
    mode: "none",
    output: {
        path: __dirname,
        filename: "bundle.js"
    }
}
