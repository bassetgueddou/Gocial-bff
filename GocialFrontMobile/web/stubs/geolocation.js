// Stub for @react-native-community/geolocation on web
// Uses the browser's Geolocation API
const Geolocation = {
  getCurrentPosition: (success, error, options) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else if (error) {
      error({ code: 2, message: 'Geolocation not available' });
    }
  },
  watchPosition: (success, error, options) => {
    if (navigator.geolocation) {
      return navigator.geolocation.watchPosition(success, error, options);
    }
    return -1;
  },
  clearWatch: (watchId) => {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },
};

export default Geolocation;
