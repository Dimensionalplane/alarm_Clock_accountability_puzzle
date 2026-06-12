import { Platform } from 'react-native';

const ENV = 'staging'; // Change to 'production' for release

const CONFIG = {
  staging: {
    BACKEND_URL: 'http://localhost:8080', // In real staging, this would be a real URL
    WS_URL: 'ws://localhost:8080',
  },
  production: {
    BACKEND_URL: 'https://api.snoozetax.com',
    WS_URL: 'wss://api.snoozetax.com',
  }
};

export default CONFIG[ENV];
