import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initEmailService, createTestAccount } from "./services/email.service";
import cors from 'cors';
import { customDomainMiddleware } from "./middleware/custom-domain.middleware";
// Importar implementación de métodos para layout templates
import "./layout-templates";

const app = express();

// Configurar CORS para permitir credenciales
app.use(cors({
  origin: function (origin, callback) {
    // Permitir cualquier origen en desarrollo
    callback(null, true);
  },
  credentials: true, // Importante para enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Añadir encabezados de seguridad para cookies
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar middleware de dominio personalizado
app.use(customDomainMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Inicializar el servicio de correo electrónico
  try {
    // En desarrollo, crear una cuenta de prueba de Ethereal
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await createTestAccount();
      log(`Cuenta de prueba de correo creada: ${testAccount.user} / ${testAccount.pass}`);
    } else {
      initEmailService();
      log('Servicio de correo electrónico inicializado para producción');
    }
  } catch (error) {
    log(`Error al inicializar el servicio de correo electrónico: ${error}`);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
