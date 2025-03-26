/**
 * Utilidades para las pruebas
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  try {
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'login-page');
    
    // Asegurarnos de que estamos en el formulario de login
    const loginTabSelector = '[data-value="login"]';
    if (await page.$(loginTabSelector)) {
      await page.click(loginTabSelector);
    }
    
    // Esperar a que el formulario esté disponible
    await waitForElementVisible(page, 'form input[name="email"]');
    
    // Completar formulario de login
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    
    // Tomar captura antes de enviar
    await takeScreenshot(page, 'login-form-filled');
    
    // Enviar formulario
    await page.click('form button[type="submit"]');
    
    // Esperar redirección o mensaje de error
    await Promise.race([
      page.waitForNavigation({ timeout: 10000 }),
      page.waitForSelector('[role="alert"]', { timeout: 10000 })
    ]);
    
    // Tomar captura después del intento
    await takeScreenshot(page, 'login-attempt-result');
    
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    await takeScreenshot(page, 'login-error');
  }
}

/**
 * Registra un nuevo usuario
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {Object} userData - Datos del usuario
 */
async function register(page, userData) {
  try {
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'register-page');
    
    // Ir al formulario de registro
    const registerTabSelector = '[data-value="register"]';
    if (await page.$(registerTabSelector)) {
      await page.click(registerTabSelector);
      // Esperar a que cambie el formulario
      await page.waitForTimeout(500);
    }
    
    // Esperar a que el formulario de registro esté disponible
    await waitForElementVisible(page, 'form input[name="email"]');
    await takeScreenshot(page, 'register-form');
    
    // Completar formulario de registro
    if (await page.$('input[name="name"]')) {
      await page.type('input[name="name"]', userData.name);
    }
    if (await page.$('input[name="username"]')) {
      await page.type('input[name="username"]', userData.email.split('@')[0]);
    }
    await page.type('input[name="email"]', userData.email);
    await page.type('input[name="password"]', userData.password);
    
    // Verificar si hay campo de confirmar contraseña
    if (await page.$('input[name="confirmPassword"]')) {
      await page.type('input[name="confirmPassword"]', userData.password);
    }
    
    // Tomar captura antes de enviar
    await takeScreenshot(page, 'register-form-filled');
    
    // Enviar formulario
    await page.click('form button[type="submit"]');
    
    // Esperar redirección o mensaje de error
    await Promise.race([
      page.waitForNavigation({ timeout: 10000 }),
      page.waitForSelector('[role="alert"]', { timeout: 10000 })
    ]);
    
    // Tomar captura después del intento
    await takeScreenshot(page, 'register-attempt-result');
    
  } catch (error) {
    console.error('Error durante el registro:', error);
    await takeScreenshot(page, 'register-error');
  }
}

/**
 * Función para solicitar restablecimiento de contraseña
 * @param {Page} page - Instancia de la página de Puppeteer
 * @param {string} email - Correo electrónico
 */
async function requestPasswordReset(page, email) {
  try {
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'forgot-password-page');
    
    // Buscar y hacer clic en el enlace de olvido de contraseña
    const forgotPasswordSelector = 'button[variant="link"]:has-text("¿Olvidaste tu contraseña?")';
    if (await page.$(forgotPasswordSelector)) {
      await page.click(forgotPasswordSelector);
      await page.waitForTimeout(500);
    }
    
    // Esperar a que el formulario esté visible
    await waitForElementVisible(page, 'form input[name="email"]');
    await takeScreenshot(page, 'forgot-password-form');
    
    // Completar formulario
    await page.type('input[name="email"]', email);
    
    // Tomar captura antes de enviar
    await takeScreenshot(page, 'forgot-password-form-filled');
    
    // Enviar formulario
    await page.click('form button[type="submit"]');
    
    // Esperar mensaje de confirmación o error
    await Promise.race([
      page.waitForSelector('[role="status"]', { timeout: 10000 }),
      page.waitForSelector('[role="alert"]', { timeout: 10000 }),
      page.waitForSelector('.toast, .notification', { timeout: 10000 })
    ]);
    
    // Tomar captura después del intento
    await takeScreenshot(page, 'forgot-password-result');
    
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
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
  try {
    // Ir a la página de restablecimiento con el token
    await page.goto(`${BASE_URL}/auth/reset-password?token=${token}`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'reset-password-page');
    
    // Esperar a que el formulario esté disponible
    await waitForElementVisible(page, 'form input[name="password"]');
    
    // Completar formulario
    await page.type('input[name="password"]', newPassword);
    
    // Verificar si hay campo para confirmar contraseña
    if (await page.$('input[name="confirmPassword"]')) {
      await page.type('input[name="confirmPassword"]', newPassword);
    }
    
    // Tomar captura antes de enviar
    await takeScreenshot(page, 'reset-password-form-filled');
    
    // Enviar formulario
    await page.click('form button[type="submit"]');
    
    // Esperar redirección o mensaje de error
    await Promise.race([
      page.waitForNavigation({ timeout: 10000 }),
      page.waitForSelector('[role="alert"]', { timeout: 10000 }),
      page.waitForSelector('.toast, .notification', { timeout: 10000 })
    ]);
    
    // Tomar captura después del intento
    await takeScreenshot(page, 'reset-password-result');
    
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    await takeScreenshot(page, 'reset-password-error');
  }
}

/**
 * Realiza una limpieza después de las pruebas
 * @param {Page} page - Instancia de la página de Puppeteer
 */
async function cleanup(page) {
  try {
    // Intentar limpiar cookies - esto siempre debería funcionar
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    
    // Intentar limpiar localStorage y sessionStorage con manejo de errores
    try {
      // Ir a una página del dominio para tener acceso al localStorage
      await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
      
      await page.evaluate(() => {
        try {
          if (window.localStorage) localStorage.clear();
          if (window.sessionStorage) sessionStorage.clear();
          return true;
        } catch (e) {
          console.warn('Error al limpiar storage:', e);
          return false;
        }
      });
    } catch (storageError) {
      console.warn('No se pudo acceder al almacenamiento del navegador:', storageError.message);
    }
    
    // Intentar cerrar sesión navegando a una ruta específica si es necesario
    try {
      await page.goto(`${BASE_URL}/api/logout`, { waitUntil: 'networkidle0' });
    } catch (logoutError) {
      console.warn('Error al intentar cerrar sesión:', logoutError.message);
    }
  } catch (error) {
    console.error('Error durante la limpieza:', error);
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

export {
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