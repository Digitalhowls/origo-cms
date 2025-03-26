/**
 * Configuración de pruebas para Jest y Puppeteer
 */

// Configuración de la URL base para las pruebas
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
globalThis.BASE_URL = BASE_URL;

// Configuración adicional antes de cada prueba
beforeEach(async () => {
  // Configurar timeout para cada prueba
  jest.setTimeout(30000);
  
  // Opciones para la navegación
  await page.setDefaultNavigationTimeout(30000);
  
  // Exponer funciones para debug en la consola del navegador
  await page.exposeFunction('__testInfo', (message) => {
    console.log(`[Browser] ${message}`);
  });
  
  // Capturar logs de la consola del navegador
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Error] ${msg.text()}`);
    }
  });
  
  // Capturar errores de red
  page.on('pageerror', error => {
    console.log(`[Browser PageError] ${error.message}`);
  });
  
  // Capturar requests fallidos
  page.on('requestfailed', request => {
    console.log(`[Network Error] ${request.url()} ${request.failure().errorText}`);
  });
});