/**
 * Pruebas E2E para el módulo de blog
 */
const { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  cleanup,
} = require('../utils');

describe('Módulo de Blog', () => {
  const testUser = {
    email: 'admin@origo.com',
    password: 'admin123'
  };
  
  beforeAll(async () => {
    // Iniciar sesión antes de las pruebas
    await login(page, testUser.email, testUser.password);
  });
  
  afterEach(async () => {
    await takeScreenshot(page, 'blog-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la lista de artículos del blog', async () => {
    await page.goto(`${BASE_URL}/blog`);
    await waitForElementVisible(page, 'h1');
    
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Blog');
    
    // Verificar que la tabla de artículos existe
    const tableExists = await page.$('table') !== null;
    expect(tableExists).toBeTruthy();
  });

  test('Debería poder crear un nuevo artículo de blog', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Hacer clic en el botón de crear nuevo artículo
    await page.click('button:has-text("Nuevo artículo")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de blog
    const url = page.url();
    expect(url).toContain('/blog/editor');
    
    // Completar el formulario de creación de artículo
    const postTitle = `Artículo de prueba ${Date.now()}`;
    await page.type('input[name="title"]', postTitle);
    
    // Escribir un resumen
    await page.type('textarea[name="summary"]', 'Este es un artículo de prueba para verificar la funcionalidad del blog');
    
    // Seleccionar una categoría si existe
    const categorySelector = await page.$('select[name="category"]');
    if (categorySelector) {
      await page.select('select[name="category"]', '1'); // Seleccionar la primera categoría
    }
    
    // Añadir etiquetas
    await page.type('input[name="tags"]', 'prueba,test,e2e');
    await page.keyboard.press('Enter');
    
    // Editar el contenido
    await page.click('[data-testid="content-editor"]');
    await page.keyboard.type('# Contenido de prueba\n\nEste es un artículo creado por los tests automatizados.');
    
    // Guardar el artículo
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('guardado');
  });

  test('Debería poder editar un artículo existente', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Hacer clic en el primer artículo de la lista
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de blog
    const url = page.url();
    expect(url).toContain('/blog/editor/');
    
    // Modificar el título del artículo
    const newTitle = `Artículo editado ${Date.now()}`;
    await page.evaluate(() => {
      document.querySelector('input[name="title"]').value = '';
    });
    await page.type('input[name="title"]', newTitle);
    
    // Guardar los cambios
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('actualizado');
  });

  test('Debería poder gestionar categorías', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Hacer clic en el botón de gestionar categorías
    await page.click('button:has-text("Categorías")');
    await waitForElementVisible(page, 'h2:has-text("Categorías")');
    
    // Crear una nueva categoría
    const categoryName = `Categoría ${Date.now()}`;
    await page.type('input[name="name"]', categoryName);
    await page.type('input[name="slug"]', `categoria-${Date.now()}`);
    await page.click('button:has-text("Añadir categoría")');
    
    // Verificar que la categoría se ha creado
    await waitForElementVisible(page, `td:has-text("${categoryName}")`);
    
    // Cerrar el diálogo de categorías
    await page.click('button[aria-label="Close"]');
  });

  test('Debería poder gestionar etiquetas', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Hacer clic en el botón de gestionar etiquetas
    await page.click('button:has-text("Etiquetas")');
    await waitForElementVisible(page, 'h2:has-text("Etiquetas")');
    
    // Crear una nueva etiqueta
    const tagName = `Etiqueta ${Date.now()}`;
    await page.type('input[name="name"]', tagName);
    await page.type('input[name="slug"]', `etiqueta-${Date.now()}`);
    await page.click('button:has-text("Añadir etiqueta")');
    
    // Verificar que la etiqueta se ha creado
    await waitForElementVisible(page, `td:has-text("${tagName}")`);
    
    // Cerrar el diálogo de etiquetas
    await page.click('button[aria-label="Close"]');
  });

  test('Debería poder publicar un artículo', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Hacer clic en el primer artículo borrador de la lista
    const draftRow = await page.$('table tbody tr:has(td:has-text("borrador"))');
    
    if (draftRow) {
      await draftRow.click();
      await page.waitForNavigation();
      
      // Verificar que estamos en el editor de blog
      const url = page.url();
      expect(url).toContain('/blog/editor/');
      
      // Cambiar el estado a publicado
      await page.click('button:has-text("Borrador")');
      await waitForElementVisible(page, '[role="menu"]');
      await page.click('[role="menuitem"]:has-text("Publicado")');
      
      // Guardar los cambios
      await page.click('button:has-text("Guardar")');
      
      // Verificar mensaje de éxito
      await waitForElementVisible(page, '[role="status"]');
      const successMessage = await page.$eval('[role="status"]', el => el.textContent);
      expect(successMessage).toContain('actualizado');
      
      // Verificar que el estado ha cambiado
      await page.reload();
      const statusText = await page.$eval('button:has-text("Publicado")', el => el.textContent);
      expect(statusText).toContain('Publicado');
    } else {
      console.log('No hay artículos en borrador para publicar');
    }
  });

  test('Debería poder eliminar un artículo', async () => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Contar artículos iniciales
    const initialCount = await page.$$eval('table tbody tr', rows => rows.length);
    
    // Hacer clic en el menú de acciones del último artículo
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
    expect(successMessage).toContain('eliminado');
    
    // Verificar que hay un artículo menos
    await page.waitForTimeout(1000); // Esperar a que se actualice la lista
    const finalCount = await page.$$eval('table tbody tr', rows => rows.length);
    expect(finalCount).toBe(initialCount - 1);
  });
});