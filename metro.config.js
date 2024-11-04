const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'stream': require.resolve('stream-browserify'),
  'buffer': require.resolve('buffer/'),
  'net': require.resolve('react-native-tcp'),
  'tls': require.resolve('react-native-tcp'),
  'crypto': require.resolve('react-native-crypto'),
};

module.exports = config;