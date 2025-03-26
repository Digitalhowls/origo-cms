/**
 * Pruebas E2E para el módulo de páginas
 */
const { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  cleanup,
} = require('../utils');

describe('Módulo de Páginas', () => {
  const testUser = {
    email: 'admin@origo.com',
    password: 'admin123'
  };
  
  beforeAll(async () => {
    // Iniciar sesión antes de las pruebas
    await login(page, testUser.email, testUser.password);
  });
  
  afterEach(async () => {
    await takeScreenshot(page, 'pages-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la lista de páginas', async () => {
    await page.goto(`${BASE_URL}/pages`);
    await waitForElementVisible(page, 'h1');
    
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Páginas');
    
    // Verificar que la tabla de páginas existe
    const tableExists = await page.$('table') !== null;
    expect(tableExists).toBeTruthy();
  });

  test('Debería poder crear una nueva página', async () => {
    await page.goto(`${BASE_URL}/pages`);
    
    // Hacer clic en el botón de crear nueva página
    await page.click('button:has-text("Nueva página")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de páginas
    const url = page.url();
    expect(url).toContain('/pages/editor');
    
    // Completar el formulario de creación de página
    const pageTitle = `Página de prueba ${Date.now()}`;
    await page.type('input[name="title"]', pageTitle);
    
    // Seleccionar un bloque para añadir a la página
    await page.click('button:has-text("Añadir bloque")');
    await waitForElementVisible(page, '[data-testid="block-library"]');
    await page.click('button:has-text("Encabezado")');
    
    // Editar el contenido del bloque
    await page.click('[data-testid="block-header"]');
    await waitForElementVisible(page, '[data-testid="properties-panel"]');
    await page.type('input[name="heading"]', 'Título de prueba');
    
    // Guardar la página
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('guardada');
  });

  test('Debería poder editar una página existente', async () => {
    await page.goto(`${BASE_URL}/pages`);
    
    // Hacer clic en la primera página de la lista
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de páginas
    const url = page.url();
    expect(url).toContain('/pages/editor/');
    
    // Modificar el título de la página
    const newTitle = `Página editada ${Date.now()}`;
    await page.evaluate(() => {
      document.querySelector('input[name="title"]').value = '';
    });
    await page.type('input[name="title"]', newTitle);
    
    // Guardar los cambios
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('actualizada');
  });

  test('Debería poder duplicar una página', async () => {
    await page.goto(`${BASE_URL}/pages`);
    
    // Hacer clic en el menú de acciones de la primera página
    await page.click('table tbody tr:first-child button[aria-haspopup="menu"]');
    await waitForElementVisible(page, '[role="menu"]');
    
    // Hacer clic en duplicar
    await page.click('[role="menuitem"]:has-text("Duplicar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('duplicada');
  });

  test('Debería poder eliminar una página', async () => {
    await page.goto(`${BASE_URL}/pages`);
    
    // Contar páginas iniciales
    const initialCount = await page.$$eval('table tbody tr', rows => rows.length);
    
    // Hacer clic en el menú de acciones de la última página
    await page.click('table tbody tr:last-child button[aria-haspopup="menu"]');
    await waitForElementVisible(page, '[role="menu"]');
    
    // Hacer clic en eliminar
    await page.click('[role="menuitem"]:has-text("Eliminar")');
    
    // Confirmar eliminación
    await waitForElementVisible(page, 'div[role="alertdialog"]');
    await page.click('div[role="alertdialog"] button:has-text("Eliminar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('eliminada');
    
    // Verificar que hay una página menos
    await page.waitForTimeout(1000); // Esperar a que se actualice la lista
    const finalCount = await page.$$eval('table tbody tr', rows => rows.length);
    expect(finalCount).toBe(initialCount - 1);
  });

  test('Debería poder previsualizar una página', async () => {
    await page.goto(`${BASE_URL}/pages`);
    
    // Hacer clic en el menú de acciones de la primera página
    await page.click('table tbody tr:first-child button[aria-haspopup="menu"]');
    await waitForElementVisible(page, '[role="menu"]');
    
    // Hacer clic en previsualizar
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('[role="menuitem"]:has-text("Previsualizar")')
    ]);
    
    // Verificar que se abre la página en una nueva pestaña
    await newPage.waitForLoadState();
    const url = newPage.url();
    expect(url).toContain('/preview/page/');
    
    // Cerrar la pestaña de previsualización
    await newPage.close();
  });
});