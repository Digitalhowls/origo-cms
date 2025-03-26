module.exports = {
  launch: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 800
    }
  },
  server: {
    command: 'npm run dev',
    port: 5000,
    launchTimeout: 30000,
    debug: true,
  },
};