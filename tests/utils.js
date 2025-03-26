/**
 * Utilidades para las pruebas
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Constantes globales
const BASE_URL = 'http://localhost:5000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Asegurarnos de que el directorio de capturas existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Hace una captura de pantalla para el reporte
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} name - Nombre de la captura de pantalla
 */
async function takeScreenshot(page, name) {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

/**
 * Espera a que un elemento sea visible
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} selector - Selector CSS del elemento
 * @param {number} timeout - Tiempo de espera máximo en ms
 */
async function waitForElementVisible(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { visible: true, timeout });
}

/**
 * Completa un formulario con los datos proporcionados
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {Object} data - Datos para completar el formulario (campo: valor)
 */
async function fillForm(page, data) {
  for (const [field, value] of Object.entries(data)) {
    await page.waitForSelector(`input[name="${field}"]`);
    await page.type(`input[name="${field}"]`, value);
  }
}

/**
 * Inicia sesión en la aplicación
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 */
async function login(page, email, password) {
  await page.goto(`${BASE_URL}/auth`);
  await waitForElementVisible(page, 'form');
  
  await fillForm(page, {
    email: email,
    password: password
  });
  
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

/**
 * Registra un nuevo usuario
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {Object} userData - Datos del usuario
 */
async function register(page, userData) {
  await page.goto(`${BASE_URL}/auth`);
  
  // Cambiar a la pestaña de registro
  await page.click('button[value="register"]');
  await waitForElementVisible(page, 'form');
  
  await fillForm(page, userData);
  
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

/**
 * Función para solicitar restablecimiento de contraseña
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} email - Correo electrónico
 */
async function requestPasswordReset(page, email) {
  await page.goto(`${BASE_URL}/auth`);
  
  // Hacer clic en el enlace "Olvidaste tu contraseña"
  await page.click('button:text("¿Olvidaste tu contraseña?")');
  await waitForElementVisible(page, 'input[name="email"]');
  
  await page.type('input[name="email"]', email);
  await page.click('button[type="submit"]');
  
  // Esperar a que aparezca la notificación
  await waitForElementVisible(page, '[role="status"]');
  
  // Extraer el token desde la respuesta (solo para pruebas)
  const responseText = await page.$eval('[role="status"]', el => el.textContent);
  const tokenMatch = responseText.match(/token: "([^"]+)"/);
  return tokenMatch ? tokenMatch[1] : null;
}

/**
 * Función para restablecer contraseña
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 */
async function resetPassword(page, token, newPassword) {
  // Navegar directamente a la pestaña de restablecimiento (simulando clic en enlace de email)
  await page.goto(`${BASE_URL}/auth`);
  
  // Simular activación del tab de reset-password
  await page.evaluate((token) => {
    // Simular almacenamiento del token y activación de la pestaña
    localStorage.setItem('resetToken', token);
    const tabTrigger = Array.from(document.querySelectorAll('button[role="tab"]'))
      .find(el => el.value === 'reset-password');
    if (tabTrigger) tabTrigger.click();
  }, token);
  
  await waitForElementVisible(page, 'input[name="password"]');
  
  await fillForm(page, {
    password: newPassword,
    confirmPassword: newPassword
  });
  
  await page.click('button[type="submit"]');
  
  // Esperar a que aparezca la notificación de éxito
  await waitForElementVisible(page, '[role="status"]');
}

/**
 * Realiza una limpieza después de las pruebas
 * @param {Page} page - Instancia de la página de Puppeteer
 */
async function cleanup(page) {
  // Cerrar sesión si está iniciada
  try {
    await page.goto(`${BASE_URL}/`);
    const logoutButton = await page.$('button:text("Cerrar sesión")');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
  } catch (error) {
    console.warn('Error durante la limpieza:', error.message);
  }
}

/**
 * Genera un correo electrónico único para pruebas
 * @returns {string} Correo electrónico
 */
function generateTestEmail() {
  return `test.${Date.now()}@example.com`;
}

/**
 * Genera datos para un usuario de prueba
 * @returns {Object} Datos del usuario
 */
function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `test.${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'Test123!',
    confirmPassword: 'Test123!',
  };
}

module.exports = {
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  cleanup,
  generateTestEmail,
  generateTestUser,
};