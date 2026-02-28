// Stub for react-native-sensors on web
const noop = { subscribe: () => ({ unsubscribe: () => {} }) };
export const accelerometer = noop;
export const gyroscope = noop;
export const magnetometer = noop;
export const barometer = noop;
export const SensorTypes = {
  accelerometer: 'accelerometer',
  gyroscope: 'gyroscope',
  magnetometer: 'magnetometer',
  barometer: 'barometer',
};
export const setUpdateIntervalForType = () => {};
export default { accelerometer, gyroscope, magnetometer, barometer };
