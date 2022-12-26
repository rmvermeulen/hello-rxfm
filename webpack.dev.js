const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
  {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      port: 4200,
      compress: true,
      historyApiFallback: true,
    },
    entry: "./src/app/index.tsx",
    output: {
      publicPath: "/",
      filename: "app.bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
    module: {
      rules: [
        {
          test: /\.ts(x)?$/,
          loader: "ts-loader",
          exclude: "/node_modules/",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
          exclude: "/node_modules/",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: path.resolve(__dirname, "images/favicon-144x144.png"),
      }),
    ],
  },
];
