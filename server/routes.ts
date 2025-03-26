import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import MemoryStore from 'memorystore';
import { db } from "./db";
import { storage } from "./storage";
import * as authService from './services/auth.service';
import * as pagesService from './services/pages.service';
import * as blogService from './services/blog.service';
import * as mediaService from './services/media.service';
import * as coursesService from './services/courses.service';
import * as organizationService from './services/organization.service';
import { authMiddleware } from './middleware/auth.middleware';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session storage
  const MemoryStoreSession = MemoryStore(session);
  
  // Configure session middleware
  app.use(session({
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
  }));
  
  // Initialize and configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await authService.validateUser(email, password);
        if (!user) {
          return done(null, false, { message: 'Credenciales incorrectas' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
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
  
  // ==== API Routes ====
  
  // Auth routes
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
  
  // Organization routes
  app.get('/api/organizations', authMiddleware, organizationService.getOrganizations);
  app.post('/api/organizations/switch/:id', authMiddleware, organizationService.switchOrganization);
  app.get('/api/organizations/branding', authMiddleware, organizationService.getBranding);
  app.patch('/api/organizations/branding', authMiddleware, organizationService.updateBranding);
  app.post('/api/organizations/check-domain', authMiddleware, organizationService.checkDomain);
  
  // Dashboard routes
  app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
      const data = {
        stats: {
          pageViews: 5248,
          averageTime: '2m 32s',
          totalUsers: 124,
          totalPages: 32,
          viewsChart: [
            { name: 'Lun', views: 800 },
            { name: 'Mar', views: 1200 },
            { name: 'Mié', views: 1100 },
            { name: 'Jue', views: 1500 },
            { name: 'Vie', views: 2100 },
            { name: 'Sáb', views: 1800 },
            { name: 'Dom', views: 1200 },
          ],
          usersChart: [
            { name: 'Lun', users: 40 },
            { name: 'Mar', users: 45 },
            { name: 'Mié', users: 55 },
            { name: 'Jue', users: 70 },
            { name: 'Vie', users: 85 },
            { name: 'Sáb', users: 70 },
            { name: 'Dom', users: 60 },
          ],
        },
        recentActivities: [],
        recentPages: await pagesService.getRecentPages(req),
        recentBlogPosts: await blogService.getRecentPosts(req),
      };
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al cargar el dashboard' });
    }
  });
  
  // Pages routes
  app.get('/api/pages', authMiddleware, pagesService.getPages);
  app.get('/api/pages/:id', authMiddleware, pagesService.getPage);
  app.post('/api/pages', authMiddleware, pagesService.createPage);
  app.patch('/api/pages/:id', authMiddleware, pagesService.updatePage);
  app.delete('/api/pages/:id', authMiddleware, pagesService.deletePage);
  app.post('/api/pages/:id/duplicate', authMiddleware, pagesService.duplicatePage);
  app.get('/api/preview/pages/:slug', authMiddleware, pagesService.previewPage);
  
  // Blog routes
  app.get('/api/blog', authMiddleware, blogService.getPosts);
  app.get('/api/blog/:id', authMiddleware, blogService.getPost);
  app.post('/api/blog', authMiddleware, blogService.createPost);
  app.patch('/api/blog/:id', authMiddleware, blogService.updatePost);
  app.delete('/api/blog/:id', authMiddleware, blogService.deletePost);
  app.post('/api/blog/:id/duplicate', authMiddleware, blogService.duplicatePost);
  app.get('/api/blog/categories', authMiddleware, blogService.getCategories);
  app.get('/api/blog/tags', authMiddleware, blogService.getTags);
  app.get('/api/preview/blog/:slug', authMiddleware, blogService.previewPost);
  
  // Media routes
  app.get('/api/media', authMiddleware, mediaService.getMediaFiles);
  app.post('/api/media/upload', authMiddleware, mediaService.uploadMedia);
  app.delete('/api/media/:id', authMiddleware, mediaService.deleteMedia);
  
  // Course routes
  app.get('/api/courses', authMiddleware, coursesService.getCourses);
  app.get('/api/courses/:id', authMiddleware, coursesService.getCourse);
  app.post('/api/courses', authMiddleware, coursesService.createCourse);
  app.patch('/api/courses/:id', authMiddleware, coursesService.updateCourse);
  app.delete('/api/courses/:id', authMiddleware, coursesService.deleteCourse);
  app.post('/api/courses/:id/duplicate', authMiddleware, coursesService.duplicateCourse);
  
  // User routes
  app.get('/api/users', authMiddleware, authService.getUsers);
  app.post('/api/users/invite', authMiddleware, authService.inviteUser);
  app.patch('/api/users/:id', authMiddleware, authService.updateUser);
  app.delete('/api/users/:id', authMiddleware, authService.deleteUser);
  
  // Settings routes
  app.get('/api/settings/appearance', authMiddleware, (req, res) => {
    res.json({
      theme: 'light',
      layout: 'default',
      radius: 0.5,
      animations: true,
      menuPosition: 'left',
      menuStyle: 'vertical',
      variantStyle: 'professional',
    });
  });
  
  app.patch('/api/settings/appearance', authMiddleware, (req, res) => {
    // In a real app, would save to database
    res.json(req.body);
  });
  
  app.get('/api/settings/integrations', authMiddleware, (req, res) => {
    res.json({
      analytics: {
        googleAnalyticsId: '',
        enabled: false,
      },
      email: {
        provider: 'none',
        apiKey: '',
        enabled: false,
      },
      payment: {
        provider: 'none',
        apiKey: '',
        enabled: false,
      },
      social: {
        facebook: false,
        twitter: false,
        instagram: false,
        youtube: false,
      },
      automation: {
        zapier: false,
        make: false,
      },
    });
  });
  
  app.patch('/api/settings/integrations', authMiddleware, (req, res) => {
    // In a real app, would save to database
    res.json(req.body);
  });
  
  // API Keys routes
  app.get('/api/api-keys', authMiddleware, authService.getApiKeys);
  app.post('/api/api-keys', authMiddleware, authService.createApiKey);
  app.delete('/api/api-keys/:id', authMiddleware, authService.deleteApiKey);
  
  // Initial setup route - this should only be accessible when no users exist
  app.post('/api/setup', authService.setupAdmin);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
