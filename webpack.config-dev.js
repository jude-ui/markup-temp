const path = require('path');
const { cssEntries, ejsEntries, jsEntries, configJsEntry } = require("./config.lib");
const RemoveJsFromEjsPlugin = require('./remove-js-from-ejs-plugin')
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin')
const fs = require('fs');
const devServerConfig = fs.existsSync('./dev-server-config.js') ? require('./dev-server-config') : false;
const port = devServerConfig && devServerConfig['DEV_SERVER_PORT'] ? devServerConfig['DEV_SERVER_PORT'] : 8080;
const sourceMap = devServerConfig && devServerConfig['USE_SOURCE_MAP'] ? 'eval-cheap-module-source-map' : false;

module.exports = {
  mode: 'development',
  entry: () => {
    const entry = {
      ...cssEntries(),
      ...ejsEntries()
    }
    return configJsEntry ? { ...entry, ...jsEntries() } : entry
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name(resourcePath) {
                const remove = path.resolve(__dirname, 'src/templates/pages/')
                return resourcePath.replace(remove, 'html').replace(/\.ejs$/, '.html')
              },
            }
          },
          "extract-loader",
          {
            loader: 'html-loader',
            options: {
              attributes: false
            }
          },
          "ejs-plain-loader"
        ]
      }
    ]
  },
  plugins: [
    new ExtraWatchWebpackPlugin({
      dirs: [
        path.resolve(__dirname, 'src/css'),
        path.resolve(__dirname, 'src/templates/pages')
      ],
    }),
    new RemoveJsFromEjsPlugin(),
  ],
  devtool: sourceMap,
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dev"),
      watch: true,
    },
    devMiddleware: {
      writeToDisk: true
    },
    // open: ['html/page-list.html'],
    open: false,
    allowedHosts: 'all',
    port,
    host: 'localhost',
    // client: {
    //   webSocketURL: {
    //     port: 8082
    //   }
    // }
  },
  performance: {
    hints: false,
    maxEntrypointSize: 5120000,
    maxAssetSize: 5120000
  }
};