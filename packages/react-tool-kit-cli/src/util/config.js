const fs = require('fs');

const { resolveCwd } = require('./path');
const rkitConfigPath = resolveCwd('./react-tool-kit.config.js');

function generateKitConfig(project) {
  let defaultkitConfig = {
    webpack: {}
  };
  if (fs.existsSync(rkitConfigPath)) {
    const userKitConfig = require(rkitConfigPath).config(project) || {};
    const kitConfig = {
      ...defaultkitConfig,
      ...userKitConfig,
      __found: true
    };
    return kitConfig;
  }
  return defaultkitConfig;
}

module.exports = {
  generateKitConfig
};
