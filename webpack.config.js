const path = require("path");
const rawpath = "./public/js/plain/main/";
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  mode: "production",
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  entry: {
    /*settings: rawpath + "Psettings.js",
    leaderboard: rawpath + "leaderboard.js",
    scriptureportion: rawpath + "scriptureportion.js",
    search: rawpath + "search.js",
    onlinequizzing: rawpath + "onlinequizzing.js",
    typequiz: rawpath + "typequiz.js",
    voicequiz: rawpath + "voicequiz.js",
    nav: rawpath + "nav.js",
    offline: rawpath + "offline.js",
    chat: "./public/js/raw/react/chat.js",*/
    main: [
      "whatwg-fetch",
      "@babel/polyfill",
      rawpath + "addlogin.js",
      rawpath + "login.js"
    ]
  },
  output: {
    path: path.resolve(__dirname, "./public/js/bundles"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};
