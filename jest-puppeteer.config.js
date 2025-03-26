export default {
  launch: {
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
  server: {
    command: 'node --experimental-vm-modules test-server/index.js',
    port: 5001,
    launchTimeout: 30000,
    debug: true,
  },
};