module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v4 plugin is auto-configured by babel-preset-expo in SDK 55
    // Do NOT manually add react-native-reanimated/plugin here
  };
};
