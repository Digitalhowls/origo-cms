jest.setTimeout(30000);

beforeAll(async () => {
  // Esperar a que la aplicación se inicie completamente
  await page.goto('http://localhost:5000');
  await page.waitForTimeout(2000);
});