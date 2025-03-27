import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import * as authService from './services/auth.service';
import * as pagesService from './services/pages.service';
import * as blogService from './services/blog.service';
import * as mediaService from './services/media.service';
import * as coursesService from './services/courses.service';
import * as organizationService from './services/organization.service';
import * as permissionsService from './services/permissions.service';
import * as rolesService from './services/roles.service';
import * as tenantService from './services/tenant.service';
import * as templatesService from './services/templates.service';
import * as smartAreasService from './services/smart-areas.service';
import * as exportImportService from './services/export-import.service';
import { authMiddleware } from './middleware/auth.middleware';
import { organizationContextMiddleware, requireOrganizationContext } from './middleware/organization.middleware';
import { customDomainMiddleware } from './middleware/custom-domain.middleware';
import { validateResourceMiddleware } from './services/tenant.service';

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar middlewares
  app.use(customDomainMiddleware);
  app.use(organizationContextMiddleware);
  
  // Configurar autenticación
  setupAuth(app);
  
  // ==== API Routes ====
  
  // Organization routes
  app.get('/api/organizations', authMiddleware, organizationService.getOrganizations);
  app.post('/api/organizations', authMiddleware, organizationService.createOrganization);
  app.get('/api/organizations/branding', authMiddleware, organizationService.getBranding);
  app.patch('/api/organizations/branding', authMiddleware, organizationService.updateBranding);
  app.post('/api/organizations/check-domain', authMiddleware, organizationService.checkDomain);
  app.post('/api/organizations/configure-domain', authMiddleware, organizationService.configureCustomDomain);
  app.post('/api/organizations/verify-domain', authMiddleware, organizationService.verifyDomain);
  app.get('/api/organizations/users', authMiddleware, organizationService.getOrganizationUsers);
  app.post('/api/organizations/switch/:id', authMiddleware, organizationService.switchOrganization);
  app.get('/api/organizations/:id', authMiddleware, organizationService.getOrganization);
  app.put('/api/organizations/:id', authMiddleware, organizationService.updateOrganization);
  app.delete('/api/organizations/:id', authMiddleware, organizationService.deleteOrganization);
  app.put('/api/organizations/:id/branding', authMiddleware, organizationService.updateOrganizationBranding);
  
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
  app.post('/api/pages', authMiddleware, requireOrganizationContext, validateResourceMiddleware('pages'), pagesService.createPage);
  app.patch('/api/pages/:id', authMiddleware, pagesService.updatePage);
  app.delete('/api/pages/:id', authMiddleware, pagesService.deletePage);
  app.post('/api/pages/:id/duplicate', authMiddleware, requireOrganizationContext, validateResourceMiddleware('pages'), pagesService.duplicatePage);
  app.get('/api/preview/pages/:slug', authMiddleware, pagesService.previewPage);
  
  // Blog routes
  app.get('/api/blog', authMiddleware, blogService.getPosts);
  app.post('/api/blog', authMiddleware, requireOrganizationContext, validateResourceMiddleware('posts'), blogService.createPost);
  app.get('/api/blog/categories', authMiddleware, blogService.getCategories);
  app.post('/api/blog/categories', authMiddleware, blogService.createCategory);
  app.get('/api/blog/tags', authMiddleware, blogService.getTags);
  app.post('/api/blog/tags', authMiddleware, blogService.createTag);
  app.get('/api/blog/:id', authMiddleware, blogService.getPost);
  app.patch('/api/blog/:id', authMiddleware, blogService.updatePost);
  app.delete('/api/blog/:id', authMiddleware, blogService.deletePost);
  app.post('/api/blog/:id/duplicate', authMiddleware, requireOrganizationContext, validateResourceMiddleware('posts'), blogService.duplicatePost);
  app.get('/api/preview/blog/:slug', authMiddleware, blogService.previewPost);
  
  // Media routes
  app.get('/api/media', authMiddleware, mediaService.getMediaFiles);
  app.post('/api/media/upload', authMiddleware, requireOrganizationContext, validateResourceMiddleware('storage'), mediaService.uploadMedia);
  app.delete('/api/media/:id', authMiddleware, mediaService.deleteMedia);
  
  // Course routes
  app.get('/api/courses', authMiddleware, coursesService.getCourses);
  app.get('/api/courses/:id', authMiddleware, coursesService.getCourse);
  app.post('/api/courses', authMiddleware, requireOrganizationContext, validateResourceMiddleware('courses'), coursesService.createCourse);
  app.patch('/api/courses/:id', authMiddleware, coursesService.updateCourse);
  app.delete('/api/courses/:id', authMiddleware, coursesService.deleteCourse);
  app.post('/api/courses/:id/duplicate', authMiddleware, requireOrganizationContext, validateResourceMiddleware('courses'), coursesService.duplicateCourse);
  
  // User routes
  app.get('/api/users', authMiddleware, authService.getUsers);
  app.post('/api/users/invite', authMiddleware, requireOrganizationContext, validateResourceMiddleware('users'), authService.inviteUser);
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
  
  // Permissions routes
  app.get('/api/permissions/user/:userId', authMiddleware, permissionsService.getUserPermissions);
  app.get('/api/permissions/role/:userId', authMiddleware, permissionsService.getUserRole);
  app.post('/api/permissions', authMiddleware, permissionsService.addUserPermission);
  app.patch('/api/permissions/:id', authMiddleware, permissionsService.updateUserPermission);
  app.delete('/api/permissions/:id', authMiddleware, permissionsService.deleteUserPermission);
  app.get('/api/permissions/check/:userId/:resource/:action', authMiddleware, permissionsService.checkPermission);
  
  // Custom Roles routes
  app.get('/api/roles/custom', authMiddleware, rolesService.getCustomRoles);
  app.get('/api/roles/custom/:id', authMiddleware, rolesService.getCustomRole);
  app.post('/api/roles/custom', authMiddleware, rolesService.createCustomRole);
  app.patch('/api/roles/custom/:id', authMiddleware, rolesService.updateCustomRole);
  app.delete('/api/roles/custom/:id', authMiddleware, rolesService.deleteCustomRole);
  app.get('/api/roles/custom/:id/permissions', authMiddleware, rolesService.getRolePermissions);
  app.post('/api/roles/assign', authMiddleware, rolesService.assignRoleToUser);
  
  // Password reset routes
  app.post('/api/forgot-password', authService.requestPasswordReset);
  app.post('/api/reset-password', authService.resetPassword);
  
  // Initial setup route - this should only be accessible when no users exist
  app.post('/api/setup', authService.setupAdmin);
  
  // Tenant routes
  app.get('/api/plans', authMiddleware, tenantService.getPlans);
  app.get('/api/organization/usage', authMiddleware, requireOrganizationContext, tenantService.getOrganizationUsage);
  app.get('/api/organization/resource-quotas', authMiddleware, requireOrganizationContext, tenantService.getResourceQuotas);
  app.post('/api/organization/change-plan', authMiddleware, requireOrganizationContext, tenantService.changePlan);
  
  // Block Templates routes
  app.get('/api/templates', authMiddleware, requireOrganizationContext, templatesService.getBlockTemplates);
  app.get('/api/templates/:id', authMiddleware, templatesService.getBlockTemplate);
  app.post('/api/templates', authMiddleware, requireOrganizationContext, validateResourceMiddleware('templates'), templatesService.createBlockTemplate);
  app.patch('/api/templates/:id', authMiddleware, templatesService.updateBlockTemplate);
  app.delete('/api/templates/:id', authMiddleware, templatesService.deleteBlockTemplate);
  app.post('/api/templates/:id/usage', authMiddleware, templatesService.incrementTemplateUsage);
  
  // Smart Areas routes
  app.get('/api/smart-areas', authMiddleware, requireOrganizationContext, smartAreasService.getSmartAreas);
  app.get('/api/smart-areas/:id', authMiddleware, smartAreasService.getSmartArea);
  app.post('/api/smart-areas', authMiddleware, requireOrganizationContext, validateResourceMiddleware('smartAreas'), smartAreasService.createSmartArea);
  app.patch('/api/smart-areas/:id', authMiddleware, smartAreasService.updateSmartArea);
  app.delete('/api/smart-areas/:id', authMiddleware, smartAreasService.deleteSmartArea);
  app.get('/api/global-smart-areas', smartAreasService.getGlobalSmartAreas);
  
  // Export/Import routes
  app.get('/api/export/:type/:id', authMiddleware, exportImportService.exportTemplate);
  app.post('/api/import', authMiddleware, exportImportService.uploadZipMiddleware, exportImportService.importTemplate);

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
