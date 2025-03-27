import { pgTable, text, serial, integer, boolean, jsonb, timestamp, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations (multi-tenant)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  subdomain: text("subdomain"),
  plan: text("plan").default("free"),
  logo: text("logo"),
  favicon: text("favicon"),
  colors: jsonb("colors").$type<{
    primary: string;
    secondary: string;
    accent: string;
  }>(),
  typography: jsonb("typography").$type<{
    fontFamily: string;
    headings: string;
  }>(),
  analyticsId: text("analytics_id"),
  domainConfig: jsonb("domain_config").$type<{
    enabled: boolean;
    domain?: string;
    verified?: boolean;
    verificationMethod?: string;
    verificationToken?: string;
    sslEnabled?: boolean;
    customNameservers?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true, 
  createdAt: true, 
  updatedAt: true
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  organizationId: integer("organization_id").references(() => organizations.id),
  role: text("role").default("viewer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations users join table
export const organizationUsers = pgTable("organization_users", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("viewer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    unq: uniqueIndex("unq_org_user").on(table.organizationId, table.userId),
  };
});

// Pages
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: jsonb("content").notNull(),
  status: text("status").default("draft").notNull(),
  seo: jsonb("seo").$type<{
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  }>(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedById: integer("updated_by_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  summary: text("summary"),
  content: jsonb("content").notNull(),
  featuredImage: text("featured_image"),
  status: text("status").default("draft").notNull(),
  seo: jsonb("seo").$type<{
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  }>(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  authorId: integer("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Categories for blog posts
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Join table for posts and categories
export const postCategories = pgTable("post_categories", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => blogPosts.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
}, (table) => {
  return {
    unq: uniqueIndex("unq_post_category").on(table.postId, table.categoryId),
  };
});

// Tags for blog posts
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Join table for posts and tags
export const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => blogPosts.id).notNull(),
  tagId: integer("tag_id").references(() => tags.id).notNull(),
}, (table) => {
  return {
    unq: uniqueIndex("unq_post_tag").on(table.postId, table.tagId),
  };
});

// Media (files, images, videos)
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  alt: text("alt"),
  caption: text("caption"),
  folder: text("folder").default(""),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  content: jsonb("content"),
  featuredImage: text("featured_image"),
  status: text("status").default("draft").notNull(),
  visibility: text("visibility").default("public").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Course modules
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course lessons
export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: jsonb("content"),
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
  moduleId: integer("module_id").references(() => courseModules.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Custom Roles
export const customRoles = pgTable("custom_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  basedOnRole: text("based_on_role").notNull(), // 'superadmin', 'admin', 'editor', 'reader', 'viewer'
  isDefault: boolean("is_default").default(false),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions (for custom roles)
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => customRoles.id).notNull(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  allowed: boolean("allowed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User permissions (overrides for individual users)
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
  allowed: boolean("allowed").notNull().default(true),
  conditions: jsonb("conditions").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OrganizationUser = typeof organizationUsers.$inferSelect;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PostCategory = typeof postCategories.$inferSelect;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type PostTag = typeof postTags.$inferSelect;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type CourseLesson = typeof courseLessons.$inferSelect;

export type ApiKey = typeof apiKeys.$inferSelect;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type CustomRole = typeof customRoles.$inferSelect;
export const insertCustomRoleSchema = createInsertSchema(customRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertCustomRole = z.infer<typeof insertCustomRoleSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserPermission = typeof userPermissions.$inferSelect;
export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

// Block Templates (elementos reutilizables)
export const blockTemplates = pgTable("block_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  preview: text("preview"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  block: jsonb("block").notNull(),
  usageCount: integer("usage_count").default(0),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBlockTemplateSchema = createInsertSchema(blockTemplates).omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true
});
export type BlockTemplate = typeof blockTemplates.$inferSelect;
export type InsertBlockTemplate = z.infer<typeof insertBlockTemplateSchema>;

// Smart Areas (componentes globales reutilizables como headers, footers, etc.)
export const smartAreas = pgTable("smart_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("component"), // component, header, footer, sidebar
  content: jsonb("content").notNull(), // Contenido del área inteligente (bloques)
  isGlobal: boolean("is_global").default(false), // Si es true, aparece en todas las páginas del tipo correspondiente
  displayConditions: jsonb("display_conditions").$type<{
    pageTypes?: string[]; // Tipos de página donde se muestra (all, home, blog, etc.)
    specificPages?: number[]; // IDs de páginas específicas donde se muestra
    excludedPages?: number[]; // IDs de páginas donde no se muestra
    devices?: string[]; // Dispositivos donde se muestra (desktop, tablet, mobile)
    userRoles?: string[]; // Roles de usuario a los que se muestra
  }>(),
  status: text("status").default("draft").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSmartAreaSchema = createInsertSchema(smartAreas).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type SmartArea = typeof smartAreas.$inferSelect;
export type InsertSmartArea = z.infer<typeof insertSmartAreaSchema>;

// Layout Templates (plantillas predefinidas de diseños)
export const layoutTemplates = pgTable("layout_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  preview: text("preview"),
  category: text("category").notNull(), // landing, blog, ecommerce, portfolio, etc.
  tags: text("tags").array(),
  thumbnail: text("thumbnail"), // URL de una miniatura para mostrar en la galería
  structure: jsonb("structure").notNull(), // Estructura del layout (columnas, filas, áreas, etc.)
  content: jsonb("content").notNull(), // Bloques predefinidos en el layout
  popularity: integer("popularity").default(0), // Para ordenar por más utilizadas
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  isSystem: boolean("is_system").default(false), // Si es true, es una plantilla del sistema y no se puede eliminar
  isPublic: boolean("is_public").default(false), // Si es true, está disponible para todos los usuarios
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLayoutTemplateSchema = createInsertSchema(layoutTemplates).omit({
  id: true,
  popularity: true,
  createdAt: true,
  updatedAt: true
});
export type LayoutTemplate = typeof layoutTemplates.$inferSelect;
export type InsertLayoutTemplate = z.infer<typeof insertLayoutTemplateSchema>;
