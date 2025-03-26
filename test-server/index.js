/**
 * Servidor mínimo para ejecutar pruebas e2e sin necesidad de construir el cliente
 */
import express from 'express';
import { registerRoutes } from '../server/routes.js';

// Configuración de entorno de prueba
process.env.NODE_ENV = 'test';

const app = express();

// Configuración básica de express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Respuesta HTML mínima para rutas no-API
app.use('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Environment</title>
      </head>
      <body>
        <div id="root">Test Environment</div>
      </body>
    </html>
  `);
});

// Registrar rutas de la API
const server = await registerRoutes(app);

// Puerto para las pruebas
const port = 5001;
server.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});

export default server;