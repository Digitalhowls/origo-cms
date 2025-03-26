import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import bcrypt from 'bcryptjs';
import MemoryStore from 'memorystore';
import { saveSessionAndRespond, checkAuthenticatedSession } from './utils/session-helper';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Initialize session storage with better logging
  const MemoryStoreSession = MemoryStore(session);
  
  // Configure session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'origo-secret-key-very-long-and-secure-for-better-session-management',
    resave: true, // Guardar la sesión en cada petición para asegurar persistencia
    saveUninitialized: true, // Crear sesión en todas las peticiones para debugging
    rolling: true, // Renovamos el tiempo de expiración en cada petición
    name: 'origo.sid', // Nombre personalizado para la cookie de sesión
    cookie: { 
      // Para entornos de Replit, debemos configurar así:
      secure: false, // En desarrollo no requerimos HTTPS
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días 
      sameSite: 'none' as 'none', // 'none' para permitir cookies cross-site en Replit
      httpOnly: false, // Permitir acceso desde JavaScript para depuración
      path: '/'
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // limpiar sesiones expiradas cada 24h
      ttl: 30 * 24 * 60 * 60 * 1000 // tiempo de vida igual al maxAge
    })
  };
  
  // Para entornos de desarrollo, permite que la cookie funcione sin HTTPS
  app.set('trust proxy', 1); // Confiar en el primer proxy
  
  // Configurar session y passport
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Credenciales incorrectas' });
          }
          
          // Verificar contraseña
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Credenciales incorrectas' });
          }
          
          // No devolvemos la contraseña
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword as Express.User);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    console.log('Serializando usuario a sesión:', user.id);
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: any, done) => {
    try {
      console.log('Deserializando usuario desde sesión. ID:', id, 'Tipo:', typeof id);
      
      // Convertir id a número si es string
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (isNaN(userId)) {
        console.error('ID de usuario inválido en la sesión:', id);
        return done(null, false);
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log('Usuario no encontrado en deserialización. ID:', userId);
        return done(null, false);
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      console.log('Usuario deserializado correctamente:', userWithoutPassword.email);
      done(null, userWithoutPassword as Express.User);
    } catch (error) {
      console.error('Error al deserializar usuario:', error);
      done(error);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      console.log('Intento de registro con email:', req.body.email);
      
      // Validación del cuerpo de la solicitud
      const { name, email, username, password } = req.body;
      
      if (!name || !email || !password) {
        console.log('Registro fallido: campos requeridos faltantes');
        return res.status(400).json({ message: 'Faltan campos requeridos' });
      }
      
      // Verificar si el email ya está registrado
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('Registro fallido: email ya registrado:', email);
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado' });
      }
      
      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear usuario
      const newUser = await storage.createUser({
        name,
        email,
        username: username || email, // Si no se proporciona username, usar email
        password: hashedPassword,
        role: 'editor', // Por defecto, los usuarios nuevos son editores
        organizationId: 1, // Por defecto, se asignan a la organización principal
      });
      
      console.log('Usuario registrado correctamente:', email);
      
      // Login automático después del registro
      req.login(newUser, (err) => {
        if (err) {
          console.error('Error en login automático post-registro:', err);
          return next(err);
        }
        
        console.log('Sesión iniciada después del registro. SessionID:', req.sessionID);
        console.log('Datos de sesión post-registro:', JSON.stringify(req.session));
        
        // Establecer explícitamente passport.user (usando propiedad dinámica)
        (req.session as any).passport = { user: newUser.id };
        
        // Eliminar la contraseña de la respuesta
        const { password, ...userWithoutPassword } = newUser;
        
        // Usar el helper para guardar la sesión y responder
        saveSessionAndRespond(req, res, next, userWithoutPassword);
      });
    } catch (error) {
      console.error('Error en el registro:', error);
      next(error);
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    console.log('Intento de login con:', req.body.email);
    
    passport.authenticate('local', (err: Error | null, user: any, info: any) => {
      if (err) {
        console.error('Error en autenticación:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Autenticación fallida para:', req.body.email);
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
      
      // Login del usuario con Passport.js
      req.login(user, (err) => {
        if (err) {
          console.error('Error en req.login:', err);
          return next(err);
        }
        
        console.log('Usuario autenticado en login:', user.email);
        console.log('SessionID generado:', req.sessionID);
        console.log('Datos de sesión post-login:', JSON.stringify(req.session));
        
        // Establecer explícitamente passport.user (usando propiedad dinámica)
        (req.session as any).passport = { user: user.id };
        
        // Usamos la función helper para guardar sesión y responder
        saveSessionAndRespond(req, res, next, user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res, next) => {
    console.log('Cerrando sesión de usuario:', req.user?.email);
    console.log('SessionID al hacer logout:', req.sessionID);
    
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        
        // Borrar la cookie con el mismo nombre que configuramos
        res.clearCookie('origo.sid', {
          path: '/',
          httpOnly: false,
          secure: false,
          sameSite: 'none'
        });
        
        console.log('Sesión destruida correctamente');
        res.json({ success: true });
      });
    });
  });

  app.get('/api/auth/me', (req, res, next) => {
    console.log('GET /api/auth/me - SessionID:', req.sessionID);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Cookies:', req.headers.cookie);
    
    // Verificación de autenticación utilizando el helper
    if (!checkAuthenticatedSession(req)) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    // Devolver los datos del usuario sin la contraseña
    const user = req.user as any;
    console.log('Usuario autenticado en /api/auth/me:', user?.email);
    
    // Usando el helper para guardar sesión y responder
    saveSessionAndRespond(req, res, next, user);
  });
  
  // Ruta para solicitar un token de recuperación de contraseña
  app.post('/api/forgot-password', async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es requerido' });
      }
      
      // Verificar si el email existe
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Por razones de seguridad, no revelamos si el email existe o no
        return res.status(200).json({ 
          message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' 
        });
      }
      
      // Generar token de recuperación y guardar en la base de datos
      const tokenRecord = await storage.createPasswordResetToken(user.id);
      
      // En un entorno de producción, aquí enviaríamos un email
      // Por ahora, solo devolvemos el token en la respuesta para pruebas
      res.status(200).json({
        message: 'Instrucciones de recuperación enviadas a tu correo',
        token: tokenRecord.token // Solo para pruebas, en producción no se devuelve
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Ruta para restablecer la contraseña con un token
  app.post('/api/reset-password', async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
      }
      
      // Verificar si el token es válido
      const tokenRecord = await storage.getPasswordResetTokenByToken(token);
      if (!tokenRecord) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
      }
      
      // Verificar si el token ya fue usado
      if (tokenRecord.usedAt) {
        return res.status(400).json({ message: 'Este token ya ha sido utilizado' });
      }
      
      // Verificar si el token ha expirado (24 horas)
      const now = new Date();
      const tokenCreatedAt = new Date(tokenRecord.createdAt!);
      const tokenExpiry = new Date(tokenCreatedAt.getTime() + 24 * 60 * 60 * 1000);
      
      if (now > tokenExpiry) {
        return res.status(400).json({ message: 'El token ha expirado' });
      }
      
      // Obtener el usuario
      const user = await storage.getUser(tokenRecord.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Marcar el token como usado
      await storage.markTokenAsUsed(tokenRecord.id);
      
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      next(error);
    }
  });
}