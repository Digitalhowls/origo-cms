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
  // Initialize session storage
  const MemoryStoreSession = MemoryStore(session);
  
  // Configure session middleware
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || 'origo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  };

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
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
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

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    res.json(req.user);
  });
}