const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const merge = require('webpack-merge');
const StartServerPlugin = require('start-server-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

const { log } = require('../util/log');
const { generateKitConfig } = require('../util/config');
const baseConfig = require('./webpack.base.config');
const { resolveDir, resolveCwd } = require('../util/path');
const project = require('./project.config');

const kitConfig = generateKitConfig(project);
const ampViewsExists = fs.existsSync(project.dir_amp_views);

if (kitConfig.__found) {
  log('react-tool-kit.config.js found');
}

if (ampViewsExists) {
  log('src/amp/views found');
}

let serverBabelrc = resolveDir('../config/.server.babelrc');
const cwdServerBabelrc = resolveCwd('.server.babelrc');
if (fs.existsSync(cwdServerBabelrc)) {
  log('.server.babelrc exists');
  serverBabelrc = cwdServerBabelrc;
}

let config = {
  target: 'node',
  node: {
    fs: 'empty',
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          extends: serverBabelrc
        }
      },
      {
        test: /\.s?[ac]ss$/,
        use: 'null-loader'
      }
    ]
  },
  entry: {
    bundle: project.paths.client('renderer/server')
  },
  externals: [
    nodeExternals({
      whitelist: ['lodash-es']
    })
  ],
  output: {
    filename: '[name].js',
    path: project.paths.dist()
  }
};

if (project.globals.__DEV__) {
  const addConfig = {
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new StartServerPlugin({
        nodeArgs: ['--preserve-symlinks'],
        entryName: 'bundle'
      })
    ]
  };
  config = merge(config, addConfig);
} else {
  if (ampViewsExists) {
    const addConfig = {
      plugins: [
        new CopyWebpackPlugin([
          {
            from: project.dir_amp_views,
            to: 'views'
          }
        ])
      ]
    };
    config = merge(config, addConfig);
  }
}

/**
 * Allow webpack overrides
 */
let custom = {};
if (kitConfig.webpack.server) {
  const webpackConfig = kitConfig.webpack.server(config);
  if (!webpackConfig) {
    log('`webpack.server` field should return config.');
  } else {
    log('`webpack.server` modify is applied.');
    custom = webpackConfig;
  }
}

let finalConfig = merge(baseConfig, config, custom);

module.exports = finalConfig;
