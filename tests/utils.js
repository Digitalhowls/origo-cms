/**
 * Utilidades para las pruebas
 */
const path = require('path');
const fs = require('fs');

// URL base para las pruebas
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

/**
 * Hace una captura de pantalla para el reporte
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} name - Nombre de la captura de pantalla
 */
async function takeScreenshot(page, name) {
  try {
    const screenshotsDir = path.join(__dirname, 'screenshots');
    
    // Crear directorio si no existe
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const filePath = path.join(screenshotsDir, `${name}-${Date.now()}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Screenshot saved to ${filePath}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

/**
 * Espera a que un elemento sea visible
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} selector - Selector CSS del elemento
 * @param {number} timeout - Tiempo de espera máximo en ms
 */
async function waitForElementVisible(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
  } catch (error) {
    console.error(`Error waiting for element ${selector}:`, error);
    await takeScreenshot(page, `error-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
    throw error;
  }
}

/**
 * Completa un formulario con los datos proporcionados
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {Object} data - Datos para completar el formulario (campo: valor)
 */
async function fillForm(page, data) {
  for (const [field, value] of Object.entries(data)) {
    try {
      const selector = `input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`;
      await page.waitForSelector(selector, { timeout: 3000 });
      
      // Manejar diferentes tipos de campos
      const fieldType = await page.$eval(selector, el => el.type || el.tagName.toLowerCase());
      
      if (fieldType === 'select' || fieldType === 'select-one') {
        await page.select(selector, value);
      } else if (fieldType === 'checkbox') {
        const currentValue = await page.$eval(selector, el => el.checked);
        if ((currentValue && !value) || (!currentValue && value)) {
          await page.click(selector);
        }
      } else if (fieldType === 'date') {
        await page.evaluate((selector, value) => {
          document.querySelector(selector).valueAsDate = new Date(value);
        }, selector, value);
      } else {
        // Limpiar campo primero
        await page.evaluate(selector => {
          document.querySelector(selector).value = '';
        }, selector);
        
        // Luego ingresar el valor
        await page.type(selector, String(value));
      }
    } catch (error) {
      console.error(`Error filling field ${field}:`, error);
    }
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
  
  // Completar formulario de login
  await fillForm(page, {
    'email': email,
    'password': password
  });
  
  // Enviar formulario
  await page.click('form button[type="submit"]');
  
  // Esperar redirección o mensaje de error
  try {
    await Promise.race([
      page.waitForNavigation({ timeout: 5000 }),
      page.waitForSelector('[role="alert"]', { timeout: 5000 })
    ]);
  } catch (error) {
    console.error('Error during login:', error);
    await takeScreenshot(page, 'login-error');
  }
}

/**
 * Registra un nuevo usuario
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {Object} userData - Datos del usuario
 */
async function register(page, userData) {
  await page.goto(`${BASE_URL}/auth`);
  
  // Ir al formulario de registro
  await page.click('button:has-text("Crear cuenta")');
  
  // Completar formulario
  await fillForm(page, {
    'name': userData.name,
    'email': userData.email,
    'password': userData.password,
    'confirmPassword': userData.password
  });
  
  // Enviar formulario
  await page.click('form button[type="submit"]');
  
  // Esperar redirección o mensaje de error
  try {
    await Promise.race([
      page.waitForNavigation({ timeout: 5000 }),
      page.waitForSelector('[role="alert"]', { timeout: 5000 })
    ]);
  } catch (error) {
    console.error('Error during registration:', error);
    await takeScreenshot(page, 'register-error');
  }
}

/**
 * Función para solicitar restablecimiento de contraseña
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} email - Correo electrónico
 */
async function requestPasswordReset(page, email) {
  await page.goto(`${BASE_URL}/auth`);
  
  // Ir al formulario de recuperación de contraseña
  await page.click('a:has-text("¿Olvidaste tu contraseña?")');
  
  // Completar formulario
  await fillForm(page, { 'email': email });
  
  // Enviar formulario
  await page.click('form button[type="submit"]');
  
  // Esperar mensaje de confirmación o error
  try {
    await Promise.race([
      page.waitForSelector('[role="status"]', { timeout: 5000 }),
      page.waitForSelector('[role="alert"]', { timeout: 5000 })
    ]);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    await takeScreenshot(page, 'forgot-password-error');
  }
}

/**
 * Función para restablecer contraseña
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 */
async function resetPassword(page, token, newPassword) {
  await page.goto(`${BASE_URL}/auth/reset-password?token=${token}`);
  
  // Completar formulario
  await fillForm(page, {
    'password': newPassword,
    'confirmPassword': newPassword
  });
  
  // Enviar formulario
  await page.click('form button[type="submit"]');
  
  // Esperar redirección o mensaje de error
  try {
    await Promise.race([
      page.waitForNavigation({ timeout: 5000 }),
      page.waitForSelector('[role="alert"]', { timeout: 5000 })
    ]);
  } catch (error) {
    console.error('Error resetting password:', error);
    await takeScreenshot(page, 'reset-password-error');
  }
}

/**
 * Realiza una limpieza después de las pruebas
 * @param {Page} page - Instancia de la página de Puppeteer
 */
async function cleanup(page) {
  try {
    // Cerrar sesión si estamos autenticados
    const isLoggedIn = await page.evaluate(() => {
      return window.localStorage.getItem('authenticated') === 'true';
    });
    
    if (isLoggedIn) {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.click('button[aria-label="User menu"]');
      await waitForElementVisible(page, '[role="menu"]');
      await page.click('[role="menuitem"]:has-text("Cerrar sesión")');
      await page.waitForNavigation();
    }
    
    // Limpiar localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Limpiar cookies
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

/**
 * Genera un correo electrónico único para pruebas
 * @returns {string} Correo electrónico
 */
function generateTestEmail() {
  return `test-${Date.now()}@origo-test.com`;
}

/**
 * Genera datos para un usuario de prueba
 * @returns {Object} Datos del usuario
 */
function generateTestUser() {
  const timestamp = Date.now();
  return {
    name: `Usuario Prueba ${timestamp}`,
    email: generateTestEmail(),
    password: `Test${timestamp}!`,
    role: 'editor'
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
  generateTestUser
};