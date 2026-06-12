import { Platform } from 'react-native';

const ENV = 'production'; // Set to production for release

const CONFIG = {
  staging: {
    BACKEND_URL: 'http://localhost:8080',
    WS_URL: 'ws://localhost:8080',
  },
  production: {
    BACKEND_URL: 'https://api.snoozetax.com',
    WS_URL: 'wss://api.snoozetax.com',
  }
};

export default CONFIG[ENV];
