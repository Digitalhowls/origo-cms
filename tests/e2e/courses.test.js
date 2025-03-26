/**
 * Pruebas E2E para el módulo de cursos
 */
const { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  fillForm,
  login,
  cleanup,
} = require('../utils');

describe('Módulo de Cursos', () => {
  const testUser = {
    email: 'admin@origo.com',
    password: 'admin123'
  };
  
  beforeAll(async () => {
    // Iniciar sesión antes de las pruebas
    await login(page, testUser.email, testUser.password);
  });
  
  afterEach(async () => {
    await takeScreenshot(page, 'courses-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la lista de cursos', async () => {
    await page.goto(`${BASE_URL}/courses`);
    await waitForElementVisible(page, 'h1');
    
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Cursos');
    
    // Verificar que la tabla de cursos existe
    const tableExists = await page.$('table') !== null;
    expect(tableExists).toBeTruthy();
  });

  test('Debería poder crear un nuevo curso', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Hacer clic en el botón de crear nuevo curso
    await page.click('button:has-text("Nuevo curso")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de cursos
    const url = page.url();
    expect(url).toContain('/courses/editor');
    
    // Completar el formulario de creación de curso
    const courseTitle = `Curso de prueba ${Date.now()}`;
    await page.type('input[name="title"]', courseTitle);
    
    // Añadir una descripción
    await page.type('textarea[name="description"]', 'Este es un curso de prueba creado por los tests automatizados');
    
    // Establecer visibilidad
    await page.click('button:has-text("Visibilidad")');
    await waitForElementVisible(page, '[role="menu"]');
    await page.click('[role="menuitem"]:has-text("Público")');
    
    // Guardar el curso
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('guardado');
  });

  test('Debería poder añadir módulos a un curso', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Hacer clic en el primer curso de la lista
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForNavigation();
    
    // Verificar que estamos en el editor de cursos
    const url = page.url();
    expect(url).toContain('/courses/editor/');
    
    // Hacer clic en la pestaña de Módulos
    await page.click('button[role="tab"]:has-text("Módulos")');
    
    // Añadir un nuevo módulo
    await page.click('button:has-text("Añadir módulo")');
    await waitForElementVisible(page, 'input[name="module_title"]');
    
    const moduleTitle = `Módulo de prueba ${Date.now()}`;
    await page.type('input[name="module_title"]', moduleTitle);
    await page.click('form button:has-text("Añadir")');
    
    // Verificar que el módulo se ha creado
    await waitForElementVisible(page, `div:has-text("${moduleTitle}")`);
    
    // Añadir una lección al módulo
    await page.click(`div:has-text("${moduleTitle}") button:has-text("Añadir lección")`);
    await waitForElementVisible(page, 'input[name="lesson_title"]');
    
    const lessonTitle = `Lección de prueba ${Date.now()}`;
    await page.type('input[name="lesson_title"]', lessonTitle);
    await page.click('form button:has-text("Añadir")');
    
    // Verificar que la lección se ha creado
    await waitForElementVisible(page, `div:has-text("${lessonTitle}")`);
    
    // Guardar cambios
    await page.click('button:has-text("Guardar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('actualizado');
  });

  test('Debería poder editar el contenido de una lección', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Hacer clic en el primer curso de la lista
    await page.click('table tbody tr:first-child button:has-text("Editar")');
    await page.waitForNavigation();
    
    // Ir a la pestaña de Módulos
    await page.click('button[role="tab"]:has-text("Módulos")');
    
    // Hacer clic en la primera lección
    await page.click('div[data-testid^="lesson-"]');
    await waitForElementVisible(page, '[data-testid="lesson-editor"]');
    
    // Editar el contenido de la lección
    await page.click('[data-testid="lesson-editor"]');
    await page.keyboard.type('# Contenido actualizado\n\nEste contenido ha sido actualizado por los tests automatizados.');
    
    // Guardar cambios
    await page.click('button:has-text("Guardar lección")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('guardada');
  });

  test('Debería poder publicar un curso', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Buscar un curso en borrador
    const draftRow = await page.$('table tbody tr:has(td:has-text("borrador"))');
    
    if (draftRow) {
      await draftRow.click();
      await page.waitForNavigation();
      
      // Verificar que estamos en el editor de cursos
      const url = page.url();
      expect(url).toContain('/courses/editor/');
      
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
      console.log('No hay cursos en borrador para publicar');
    }
  });

  test('Debería poder duplicar un curso', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Hacer clic en el menú de acciones del primer curso
    await page.click('table tbody tr:first-child button[aria-haspopup="menu"]');
    await waitForElementVisible(page, '[role="menu"]');
    
    // Hacer clic en duplicar
    await page.click('[role="menuitem"]:has-text("Duplicar")');
    
    // Verificar mensaje de éxito
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('duplicado');
  });

  test('Debería poder eliminar un curso', async () => {
    await page.goto(`${BASE_URL}/courses`);
    
    // Contar cursos iniciales
    const initialCount = await page.$$eval('table tbody tr', rows => rows.length);
    
    // Hacer clic en el menú de acciones del último curso
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
    
    // Verificar que hay un curso menos
    await page.waitForTimeout(1000); // Esperar a que se actualice la lista
    const finalCount = await page.$$eval('table tbody tr', rows => rows.length);
    expect(finalCount).toBe(initialCount - 1);
  });
});