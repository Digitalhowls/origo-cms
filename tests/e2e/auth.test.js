/**
 * Pruebas E2E para el módulo de autenticación
 */
const { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  cleanup,
  generateTestUser
} = require('../utils');

describe('Módulo de Autenticación', () => {
  let testUser;
  let testUserPassword;
  
  beforeAll(() => {
    testUser = generateTestUser();
    testUserPassword = testUser.password;
  });
  
  afterEach(async () => {
    await takeScreenshot(page, 'auth-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la página de autenticación', async () => {
    await page.goto(`${BASE_URL}/auth`);
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Origo CMS');
    
    const loginTabVisible = await page.$eval('[value="login"]', el => el.getAttribute('aria-selected') === 'true');
    expect(loginTabVisible).toBeTruthy();
  });

  test('Debería permitir registrar un nuevo usuario', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Cambiar a la pestaña de registro
    await page.click('[value="register"]');
    await waitForElementVisible(page, 'form');
    
    // Completar el formulario
    await fillForm(page, testUser);
    
    // Enviar el formulario
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Verificar que estamos en la página principal después del registro
    const url = page.url();
    expect(url).toContain('/dashboard');
  });

  test('Debería permitir cerrar sesión', async () => {
    await page.goto(`${BASE_URL}/`);
    
    // Buscar y hacer clic en el botón de cerrar sesión
    const logoutButton = await page.$('button:has-text("Cerrar sesión")');
    if (logoutButton) {
      await Promise.all([
        logoutButton.click(),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      
      // Verificar que redirige a la página de autenticación
      const url = page.url();
      expect(url).toContain('/auth');
    }
  });

  test('Debería permitir iniciar sesión con credenciales correctas', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Completar el formulario de inicio de sesión
    await fillForm(page, {
      email: testUser.email,
      password: testUserPassword
    });
    
    // Enviar el formulario
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Verificar que estamos en la página principal después del inicio de sesión
    const url = page.url();
    expect(url).toContain('/dashboard');
  });

  test('No debería permitir iniciar sesión con credenciales incorrectas', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Completar el formulario con datos incorrectos
    await fillForm(page, {
      email: testUser.email,
      password: 'contraseña_incorrecta'
    });
    
    // Enviar el formulario
    await page.click('button[type="submit"]');
    
    // Verificar que aparece un mensaje de error
    await waitForElementVisible(page, '[role="alert"]');
    const errorMessage = await page.$eval('[role="alert"]', el => el.textContent);
    expect(errorMessage).toContain('Error');
  });

  test('Debería permitir solicitar el restablecimiento de contraseña', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Hacer clic en "¿Olvidaste tu contraseña?"
    await page.click('button:has-text("¿Olvidaste tu contraseña?")');
    await waitForElementVisible(page, 'input[name="email"]');
    
    // Completar el formulario
    await page.type('input[name="email"]', testUser.email);
    
    // Enviar el formulario
    await page.click('button:has-text("Enviar enlace")');
    
    // Verificar que aparece un mensaje de confirmación
    await waitForElementVisible(page, '[role="status"]');
    const confirmationMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(confirmationMessage).toContain('Instrucciones');
  });

  test('Debería permitir restablecer la contraseña con un token válido', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Solicitar restablecimiento para obtener un token
    const token = await requestPasswordReset(page, testUser.email);
    expect(token).toBeTruthy();
    
    // Usar el token para restablecer la contraseña
    const newPassword = 'NuevaContraseña123!';
    await resetPassword(page, token, newPassword);
    
    // Verificar mensaje de éxito
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('actualizada');
    
    // Verificar que la nueva contraseña funciona iniciando sesión
    await page.goto(`${BASE_URL}/auth`);
    await fillForm(page, {
      email: testUser.email,
      password: newPassword
    });
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    const url = page.url();
    expect(url).toContain('/dashboard');
  });
});