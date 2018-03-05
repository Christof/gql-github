const path = require("path");
const webpack = require("webpack");
const DashboardPlugin = require("webpack-dashboard/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function(env = {}) {
  console.log({ env });
  const isBuild = !!env.build;
  const isDev = !env.build;
  const isSourceMap = !!env.sourceMap || isDev;
  return {
    entry: "./src/index.tsx",
    output: {
      filename: "[name].js",
      path: __dirname + "/dist"
    },
    plugins: [
      new DashboardPlugin(),
      new HtmlWebpackPlugin({ title: "Stats", template: "./src/index.html" })
      /*
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: module =>
          module.context && module.context.indexOf("node_modules") !== -1
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "manifest"
      })
      */
    ],

    optimization: { splitChunks: { chunks: "all" } },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js", ".json"],
      modules: ["src", "node_modules"]
    },

    module: {
      rules: [
        // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
        {
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader",
          exclude: [/node_modules/, /__test__/]
        },

        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
          exclude: [/node_modules/, /__test__/]
        }
      ]
    },

    devServer: {
      port: 3000,
      historyApiFallback: true
    }
  };
};
