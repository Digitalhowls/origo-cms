/**
 * Pruebas E2E para el módulo de medios
 */
const { 
  BASE_URL,
  takeScreenshot,
  waitForElementVisible,
  login,
  cleanup,
} = require('../utils');
const path = require('path');

describe('Módulo de Media', () => {
  const testUser = {
    email: 'admin@origo.com',
    password: 'admin123'
  };
  
  beforeAll(async () => {
    // Iniciar sesión antes de las pruebas
    await login(page, testUser.email, testUser.password);
  });
  
  afterEach(async () => {
    await takeScreenshot(page, 'media-test');
  });

  afterAll(async () => {
    await cleanup(page);
  });

  test('Debería mostrar la biblioteca de medios', async () => {
    await page.goto(`${BASE_URL}/media`);
    await waitForElementVisible(page, 'h1');
    
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Biblioteca de Medios');
  });

  test('Debería poder subir un archivo de imagen', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Iniciar la carga de archivos
    await page.click('button:has-text("Subir medios")');
    await waitForElementVisible(page, 'input[type="file"]');
    
    // Crear una imagen de prueba
    const filePath = path.join(__dirname, '..', 'test-image.png');
    await page.waitForTimeout(500);
    
    // Seleccionar y subir el archivo
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Esperar que la carga se complete
    await waitForElementVisible(page, '[role="status"]');
    const successMessage = await page.$eval('[role="status"]', el => el.textContent);
    expect(successMessage).toContain('subido');
    
    // Verificar que aparece en la galería
    await page.waitForSelector('img[alt="test-image.png"]');
    const imageExists = await page.$('img[alt="test-image.png"]') !== null;
    expect(imageExists).toBeTruthy();
  });

  test('Debería poder crear una carpeta', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Hacer clic en el botón de nueva carpeta
    await page.click('button:has-text("Nueva carpeta")');
    await waitForElementVisible(page, 'input[placeholder="Nombre de la carpeta"]');
    
    // Ingresar nombre de la carpeta
    const folderName = `Carpeta-${Date.now()}`;
    await page.type('input[placeholder="Nombre de la carpeta"]', folderName);
    await page.click('button:has-text("Crear")');
    
    // Verificar que la carpeta se ha creado
    await waitForElementVisible(page, `[data-testid="folder-${folderName}"]`);
    const folderExists = await page.$(`[data-testid="folder-${folderName}"]`) !== null;
    expect(folderExists).toBeTruthy();
  });

  test('Debería poder navegar entre carpetas', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Buscar una carpeta existente y hacer clic en ella
    const folder = await page.$('[data-testid^="folder-"]');
    if (folder) {
      const folderName = await folder.evaluate(el => el.getAttribute('data-testid').replace('folder-', ''));
      await folder.click();
      
      // Verificar que estamos dentro de la carpeta
      await waitForElementVisible(page, 'nav.breadcrumb');
      const breadcrumbText = await page.$eval('nav.breadcrumb', el => el.textContent);
      expect(breadcrumbText).toContain(folderName);
      
      // Volver a la raíz
      await page.click('nav.breadcrumb a:first-child');
      await waitForElementVisible(page, 'h1');
      
      // Verificar que estamos en la raíz
      const isRoot = await page.$eval('nav.breadcrumb', el => el.textContent.includes('Inicio'));
      expect(isRoot).toBeTruthy();
    } else {
      console.log('No hay carpetas para navegar');
    }
  });

  test('Debería poder ver detalles de un archivo', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Buscar un archivo y hacer clic en él
    const mediaItem = await page.$('[data-testid^="media-"]');
    if (mediaItem) {
      await mediaItem.click();
      
      // Verificar que el panel de detalles se abre
      await waitForElementVisible(page, 'div.media-details');
      const panelExists = await page.$('div.media-details') !== null;
      expect(panelExists).toBeTruthy();
      
      // Verificar que contiene información del archivo
      const panelText = await page.$eval('div.media-details', el => el.textContent);
      expect(panelText).toContain('Nombre');
      expect(panelText).toContain('Tipo');
      expect(panelText).toContain('Tamaño');
      
      // Cerrar el panel
      await page.click('button[aria-label="Close"]');
    } else {
      console.log('No hay archivos para ver detalles');
    }
  });

  test('Debería poder editar metadatos de un archivo', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Buscar un archivo y hacer clic en él
    const mediaItem = await page.$('[data-testid^="media-"]');
    if (mediaItem) {
      await mediaItem.click();
      
      // Verificar que el panel de detalles se abre
      await waitForElementVisible(page, 'div.media-details');
      
      // Editar el texto alternativo
      const altText = `Texto alternativo ${Date.now()}`;
      await page.evaluate(() => {
        document.querySelector('input[name="alt"]').value = '';
      });
      await page.type('input[name="alt"]', altText);
      
      // Editar la leyenda
      const caption = `Leyenda ${Date.now()}`;
      await page.evaluate(() => {
        document.querySelector('input[name="caption"]').value = '';
      });
      await page.type('input[name="caption"]', caption);
      
      // Guardar cambios
      await page.click('button:has-text("Guardar")');
      
      // Verificar mensaje de éxito
      await waitForElementVisible(page, '[role="status"]');
      const successMessage = await page.$eval('[role="status"]', el => el.textContent);
      expect(successMessage).toContain('actualizado');
      
      // Cerrar el panel
      await page.click('button[aria-label="Close"]');
    } else {
      console.log('No hay archivos para editar');
    }
  });

  test('Debería poder eliminar un archivo', async () => {
    await page.goto(`${BASE_URL}/media`);
    
    // Contar archivos iniciales
    const initialCount = await page.$$eval('[data-testid^="media-"]', items => items.length);
    
    // Buscar un archivo y hacer clic en su botón de eliminar
    const mediaItem = await page.$('[data-testid^="media-"]');
    if (mediaItem) {
      await mediaItem.hover();
      await page.click('[data-testid^="media-"]:hover button[aria-label="Delete"]');
      
      // Confirmar eliminación
      await waitForElementVisible(page, 'div[role="alertdialog"]');
      await page.click('div[role="alertdialog"] button:has-text("Eliminar")');
      
      // Verificar mensaje de éxito
      await waitForElementVisible(page, '[role="status"]');
      const successMessage = await page.$eval('[role="status"]', el => el.textContent);
      expect(successMessage).toContain('eliminado');
      
      // Verificar que hay un archivo menos
      await page.waitForTimeout(1000); // Esperar a que se actualice la lista
      const finalCount = await page.$$eval('[data-testid^="media-"]', items => items.length);
      expect(finalCount).toBe(initialCount - 1);
    } else {
      console.log('No hay archivos para eliminar');
    }
  });
});