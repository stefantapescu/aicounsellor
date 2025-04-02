import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.younichoice.app',
  appName: 'Younichoice',
  webDir: '.next', // webDir is less relevant when server.url is set, but keep for consistency
  server: {
    url: 'https://grow.younichoice.com', // Point to production URL
    // cleartext is not needed for HTTPS URLs
  }
};

export default config;
