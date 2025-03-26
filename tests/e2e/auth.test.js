/**
 * Pruebas E2E para el módulo de autenticación
 */
import { jest, describe, test, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  generateTestUser,
  cleanup,
} from '../utils.js';

describe('Módulo de Autenticación', () => {
  // Generar datos de usuario para las pruebas
  const testUser = generateTestUser();
  const defaultUser = {
    email: 'admin@origo.com',
    password: 'admin123'
  };
  
  afterEach(async () => {
    await takeScreenshot(page, 'auth-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la página de autenticación', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Verificar que estamos en la página de autenticación
    const heading = await page.$eval('h1', el => el.textContent);
    expect(heading).toContain('Origo CMS');
    
    // Verificar que existe el formulario de login
    const loginForm = await page.$('form') !== null;
    expect(loginForm).toBeTruthy();
  });

  test('Debería permitir el registro de un nuevo usuario', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Ir al formulario de registro
    await page.click('[data-value="register"]');
    
    // Completar el formulario de registro
    await fillForm(page, {
      'name': testUser.name,
      'email': testUser.email,
      'username': testUser.email.split('@')[0],
      'password': testUser.password,
      'confirmPassword': testUser.password
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar redirección a dashboard después del registro exitoso
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toBe(`${BASE_URL}/dashboard`);
  });

  test('Debería mostrar error con credenciales inválidas', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Completar el formulario con credenciales inválidas
    await fillForm(page, {
      'email': 'usuario.inexistente@test.com',
      'password': 'contrasenainvalida'
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de error
    await waitForElementVisible(page, '[role="alert"]');
    const errorMessage = await page.$eval('[role="alert"]', el => el.textContent);
    expect(errorMessage).toContain('credenciales');
  });

  test('Debería permitir iniciar sesión con credenciales válidas', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Completar el formulario de login
    await fillForm(page, {
      'email': defaultUser.email,
      'password': defaultUser.password
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar redirección a dashboard después del login exitoso
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toBe(`${BASE_URL}/dashboard`);
  });

  test('Debería permitir solicitar restablecimiento de contraseña', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Ir al formulario de recuperación de contraseña
    await page.click('button[variant="link"]:has-text("¿Olvidaste tu contraseña?")');
    
    // Completar formulario con email válido
    await fillForm(page, {
      'email': defaultUser.email
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de confirmación
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('enviado');
  });

  test('Debería permitir restablecer contraseña con token válido', async () => {
    // Esta prueba simula el proceso de restablecimiento de contraseña
    // En un escenario real, el token vendría de un email
    // Para fines de prueba, usamos un token simulado
    
    const token = 'valid-token-12345';
    const newPassword = 'NewPassword123!';
    
    await page.goto(`${BASE_URL}/auth/reset-password?token=${token}`);
    
    // Verificar que estamos en la página de restablecimiento
    const heading = await page.$eval('h2', el => el.textContent);
    expect(heading).toContain('Establece una nueva contraseña');
    
    // Completar formulario
    await fillForm(page, {
      'password': newPassword,
      'confirmPassword': newPassword
    });
    
    // Enviar formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('restablecida');
    
    // Verificar redirección a login
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toContain('/auth');
  });

  test('Debería permitir cerrar sesión', async () => {
    // Primero iniciamos sesión
    await login(page, defaultUser.email, defaultUser.password);
    
    // Verificar que estamos en dashboard
    await page.waitForNavigation();
    let url = page.url();
    expect(url).toBe(`${BASE_URL}/dashboard`);
    
    // Hacer clic en menú de usuario
    await page.click('button[aria-label="Abrir menú de usuario"]');
    await waitForElementVisible(page, '[role="menu"]');
    
    // Hacer clic en cerrar sesión
    await page.click('[data-testid="logout-button"]');
    
    // Verificar redirección a login
    await page.waitForNavigation();
    url = page.url();
    expect(url).toContain('/auth');
  });

  test('Debería redirigir a login al intentar acceder a rutas protegidas sin autenticación', async () => {
    // Intentar acceder a una ruta protegida sin estar autenticado
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verificar redirección a login
    await page.waitForNavigation();
    const url = page.url();
    expect(url).toContain('/auth');
  });

  test('Debería validar el formato de email durante el registro', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Ir al formulario de registro
    await page.click('[data-value="register"]');
    
    // Completar el formulario con email inválido
    await fillForm(page, {
      'name': 'Usuario Prueba',
      'email': 'email_invalido',
      'username': 'usuario_test',
      'password': 'Password123!',
      'confirmPassword': 'Password123!'
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de error
    await waitForElementVisible(page, '[id*="email-error"]');
    const errorMessage = await page.$eval('[id*="email-error"]', el => el.textContent);
    expect(errorMessage).toContain('email');
  });

  test('Debería validar la fortaleza de la contraseña durante el registro', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Ir al formulario de registro
    await page.click('[data-value="register"]');
    
    // Completar el formulario con contraseña débil
    await fillForm(page, {
      'name': 'Usuario Prueba',
      'email': 'usuario.prueba@test.com',
      'username': 'usuario_prueba',
      'password': '123', // Contraseña débil
      'confirmPassword': '123'
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de error
    await waitForElementVisible(page, '[id*="password-error"]');
    const errorMessage = await page.$eval('[id*="password-error"]', el => el.textContent);
    expect(errorMessage).toContain('caracteres');
  });

  test('Debería validar la coincidencia de contraseñas durante el registro', async () => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Ir al formulario de registro
    await page.click('[data-value="register"]');
    
    // Completar el formulario con contraseñas que no coinciden
    await fillForm(page, {
      'name': 'Usuario Prueba',
      'email': 'usuario.prueba@test.com',
      'username': 'usuario_prueba',
      'password': 'Password123!',
      'confirmPassword': 'Password456!'
    });
    
    // Enviar el formulario
    await page.click('form button[type="submit"]');
    
    // Verificar mensaje de error
    await waitForElementVisible(page, '[id*="confirmPassword-error"]');
    const errorMessage = await page.$eval('[id*="confirmPassword-error"]', el => el.textContent);
    expect(errorMessage).toContain('coincidir');
  });
});