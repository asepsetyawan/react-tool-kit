const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const fs = require('fs');

const { log } = require('../util/log');
const { generateKitConfig } = require('../util/config');
const { resolveDir, resolveCwd } = require('../util/path');
const baseConfig = require('./webpack.base.config');
const project = require('./project.config');

const kitConfig = generateKitConfig(project);

let vendorManifest;

if (project.globals.__DEV__) {
  try {
    vendorManifest = require(project.paths.dist('./vendorDll-manifest.json'));
    log('DLL ready.');
  } catch (e) {
    log('DLL not ready. You can create one by running `react-tool-kit build-dll`.');
  }
}

const publicExists = fs.existsSync(project.dir_public);
const sw = kitConfig.sw;
if (sw) {
  log('SW ready.');
} else {
  log('SW not ready. Define "sw" option on config to activate');
}

let clientBabelrc = resolveDir('../config/.client.babelrc');
const cwdClientBabelrc = resolveCwd('.client.babelrc');
if (fs.existsSync(cwdClientBabelrc)) {
  log('.client.babelrc exists');
  clientBabelrc = cwdClientBabelrc;
}

const devMode = project.globals.__DEV__;

const config = {
  devtool: project.globals.__PROD__ ? false : 'cheap-module-eval-source-map',
  entry: {
    app: [
      ...(project.globals.__DEV__ ? ['webpack-hot-middleware/client'] : []),
      project.paths.client('renderer/client')
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          extends: clientBabelrc
        }
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              url: true
            }
          },
          {
            loader: 'sass-loader',
            options: kitConfig.webpack.sassOptions || {}
          }
        ]
      }
    ]
  },
  output: {
    filename: project.globals.__DEV__ ? '[name].js' : `[name].[chunkhash].js`,
    path: project.paths.dist()
  },
  plugins: [
    ...(project.globals.__DEV__
      ? [
          vendorManifest &&
            new webpack.DllReferencePlugin({
              context: '.',
              manifest: vendorManifest
            }),
          new webpack.HotModuleReplacementPlugin()
        ]
      : [
          new ManifestPlugin({
            fileName: 'build-manifest.json'
          }),
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false
          })
        ]),
    sw &&
      new GenerateSW({
        swDest: 'service-worker.js',
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: sw.homePath + '?rkit-shell',
        include: [/vendor.*\.js$/, /app.*\.js$/, /app.*\.css$/],
        exclude: [/hot-update.*\.js$/],
        templatedUrls: {
          [sw.homePath + '?rkit-shell']: 'app-shell-v' + Date.now()
        },
        runtimeCaching: [
          {
            urlPattern: new RegExp(
              `${sw.homePath.replace(/\//g, '')}\/((?!hot-update).)*$`
            ),
            handler: 'staleWhileRevalidate',
            options: {
              cacheableResponse: {
                statuses: [200]
              },
              cacheName: 'rkit-assets-runtime'
            }
          }
        ]
      }),
    new LoadablePlugin({
      writeToDisk: true
    }),
    publicExists && new CopyWebpackPlugin([project.dir_public]),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
    })
  ].filter(p => !!p),
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          filename: project.globals.__DEV__
            ? 'vendor.js'
            : 'vendor.[chunkhash].js'
        }
      }
    }
  }
};

/**
 * Allow webpack overrides
 */
let custom = {};
if (kitConfig.webpack.client) {
  const webpackConfig = kitConfig.webpack.client(config);
  if (!webpackConfig) {
    log('`webpack.client` field should return config.');
  } else {
    log('`webpack.client` modify is applied.');
    custom = webpackConfig;
  }
}

let finalConfig = merge(baseConfig, config, custom);

module.exports = finalConfig;
