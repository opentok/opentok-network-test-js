module.exports = {
    entry: ['./src/js/index.ts'],
    mode: "none",
    module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
    ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    }
}
