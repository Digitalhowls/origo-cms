/**
 * Prueba simple para verificar que el entorno de pruebas funcione
 */

describe('Prueba Simple', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:5000/auth');
  });

  it('Debería mostrar algún contenido en la página', async () => {
    // Esperar a que se cargue algún contenido en la página
    await page.waitForSelector('body');
    
    // Tomar una captura de pantalla
    await page.screenshot({ path: 'tests/screenshots/simple-test.png' });
    
    // Verificar que existe algún contenido en la página
    const content = await page.evaluate(() => document.body.textContent);
    expect(content).toBeTruthy();
  });
});