/**
 * Configuración de pruebas para Jest y Puppeteer
 */
import { jest } from '@jest/globals';

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
  try {
    await page.exposeFunction('__testInfo', (message) => {
      console.log(`[Browser] ${message}`);
    });
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
  
  // Capturar logs de la consola del navegador
  page.on('console', msg => {
    const msgType = msg.type();
    if (msgType === 'error') {
      console.log(`[Browser Error] ${msg.text()}`);
    } else if (msgType === 'warning') {
      console.log(`[Browser Warning] ${msg.text()}`);
    }
  });
  
  // Capturar errores de red
  page.on('pageerror', error => {
    console.log(`[Browser PageError] ${error.message}`);
  });
  
  // Capturar requests fallidos
  page.on('requestfailed', request => {
    console.log(`[Network Error] ${request.url()} ${request.failure()?.errorText || 'Unknown error'}`);
  });
});