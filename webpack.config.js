const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (env = {}) {
  console.log({ env });
  const isDev = !env.build;
  return {
    entry: "./src/index.tsx",
    output: {
      filename: "[name].js",
      chunkFilename: "[name].chunk.js",
      path: __dirname + "/dist",
    },
    plugins: [
      new HtmlWebpackPlugin({ title: "Stats", template: "./src/index.html" }),
    ],

    optimization: { splitChunks: { chunks: "all" } },

    // Enable sourcemaps for debugging webpack's output.
    devtool: isDev ? "eval-source-map" : "source-map",

    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js", ".json"],
      modules: ["node_modules"],
      // webpack 5 no longer polyfills node core modules by default
      fallback: {
        fs: false,
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        path: require.resolve("path-browserify"),
      },
      // graphql@14 exposes an .mjs file via the "module" field whose bare
      // relative imports webpack 5 cannot resolve; force the CJS build instead.
      alias: {
        graphql$: require.resolve("graphql/index.js"),
      },
    },

    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: [/node_modules/, /__test__/],
        },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
          exclude: [/node_modules/, /__test__/],
        },
      ],
    },

    devServer: {
      port: 3000,
      historyApiFallback: true,
    },
  };
};
