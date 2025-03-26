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
    resave: true, // Cambiado a true para forzar guardar la sesión
    saveUninitialized: true, // Cambiado a true para crear sesión para todas las peticiones
    cookie: { 
      secure: false, // Desactivado en desarrollo para facilitar pruebas
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días para mayor persistencia
      sameSite: 'lax' as 'lax',
      httpOnly: true,
      path: '/'
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
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
  passport.serializeUser((user: Express.User, done) => done(null, user.id));
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword as Express.User);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      // Validación del cuerpo de la solicitud
      const { name, email, username, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
      }
      
      // Verificar si el email ya está registrado
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
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
      
      // Login automático después del registro
      req.login(newUser, (err) => {
        if (err) return next(err);
        
        // Eliminar la contraseña de la respuesta
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: Error | null, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Asegurarse de que la sesión se guarde antes de responder
        req.session.save((err) => {
          if (err) return next(err);
          console.log('Sesión guardada correctamente:', req.sessionID);
          return res.json(user);
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
    });
  });

  app.get('/api/auth/me', (req, res, next) => {
    console.log('GET /api/auth/me - SessionID:', req.sessionID);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('isAuthenticated:', req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    // Asegurarse de que la sesión siga viva
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar sesión en /api/auth/me:', err);
        return next(err);
      }
      
      // Devolver los datos del usuario sin la contraseña
      const user = req.user as any;
      console.log('Usuario autenticado en /api/auth/me:', user?.email);
      res.json(user);
    });
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