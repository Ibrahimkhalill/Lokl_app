// Extends app.json with values that differ per environment / must not live in git.
// Set them in .env locally and as EAS environment variables for cloud builds:
//   eas env:create --name GOOGLE_MAPS_API_KEY --value <key> --environment production --visibility sensitive
module.exports = ({ config }) => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY ?? config.android?.config?.googleMaps?.apiKey;

  return {
    ...config,
    ios: {
      ...config.ios,
      // react-native-maps uses PROVIDER_GOOGLE on iOS too
      config: { ...config.ios?.config, googleMapsApiKey: mapsKey },
    },
    android: {
      ...config.android,
      config: { ...config.android?.config, googleMaps: { apiKey: mapsKey } },
    },
  };
};
