const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '../../packages')];

config.resolver.extraNodeModules = {
  '@shared': path.resolve(__dirname, '../../packages/shared'),
};

module.exports = config;
