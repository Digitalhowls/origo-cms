import { 
  users, type User, type InsertUser,
  organizations, type Organization, type InsertOrganization,
  organizationUsers, type OrganizationUser,
  pages, type Page, type InsertPage,
  blogPosts, type BlogPost, type InsertBlogPost,
  categories, type Category, type InsertCategory,
  tags, type Tag, type InsertTag,
  postCategories, type PostCategory,
  postTags, type PostTag,
  media, type Media, type InsertMedia,
  courses, type Course, type InsertCourse,
  courseModules, type CourseModule,
  courseLessons, type CourseLesson,
  apiKeys, type ApiKey,
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken,
  userPermissions, type UserPermission, type InsertUserPermission,
  customRoles, type CustomRole, type InsertCustomRole,
  rolePermissions, type RolePermission, type InsertRolePermission,
  blockTemplates, type BlockTemplate, type InsertBlockTemplate,
  smartAreas, type SmartArea, type InsertSmartArea
} from "@shared/schema";
import { RolePermissions, CustomRoleDefinition } from "@shared/types";
import { eq, like, and, or, desc, sql, asc } from "drizzle-orm";
import { db } from "./db";
import * as crypto from "crypto";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(options?: { search?: string, role?: string }): Promise<{ items: User[], totalItems: number }>;
  
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  getOrganizationByCustomDomain(domain: string): Promise<Organization | undefined>;
  getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: number): Promise<Organization[]>;
  updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined>;
  getUserRoleInOrganization(userId: number, organizationId: number): Promise<string | null>;
  createOrganization(orgData: InsertOrganization, creatorId: number): Promise<Organization>;
  updateOrganizationBranding(id: number, branding: Partial<Organization>): Promise<Organization | undefined>;
  updateOrganizationDomains(id: number, domainData: { domain?: string, subdomain?: string, domainConfig?: any }): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  
  // Organization Users methods
  getOrganizationUsers(organizationId: number): Promise<User[]>;
  addUserToOrganization(organizationId: number, userId: number, role: string): Promise<OrganizationUser>;
  
  // Pages methods
  getPages(organizationId: number, options?: { search?: string, status?: string, page?: number, pageSize?: number }): Promise<{ items: Page[], totalItems: number, totalPages: number }>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(organizationId: number, slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, pageData: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  
  // Blog methods
  getBlogPosts(organizationId: number, options?: { search?: string, status?: string, category?: string, page?: number, pageSize?: number }): Promise<{ items: any[], totalItems: number, totalPages: number }>;
  getBlogPost(id: number): Promise<any | undefined>;
  getBlogPostBySlug(organizationId: number, slug: string): Promise<any | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  getCategories(organizationId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getTags(organizationId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // Media methods
  getMediaFiles(organizationId: number, options?: { search?: string, type?: string, folder?: string }): Promise<{ items: Media[], folders: { id: string, name: string }[] }>;
  getMedia(id: number): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Courses methods
  getCourses(organizationId: number, options?: { search?: string, status?: string, visibility?: string, page?: number, pageSize?: number }): Promise<{ items: any[], totalItems: number, totalPages: number }>;
  getCourse(id: number): Promise<any | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // API Keys methods
  getApiKeys(organizationId: number): Promise<ApiKey[]>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(data: { name: string, organizationId: number, createdById: number }): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Password Reset methods
  createPasswordResetToken(userId: number): Promise<PasswordResetToken>;
  getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(id: number): Promise<PasswordResetToken | undefined>;
  
  // Roles methods
  getCustomRoles(organizationId: number): Promise<CustomRole[]>;
  getCustomRole(id: number): Promise<CustomRole | undefined>;
  getCustomRoleByName(organizationId: number, name: string): Promise<CustomRole | undefined>;
  createCustomRole(roleData: InsertCustomRole): Promise<CustomRole>;
  updateCustomRole(id: number, roleData: Partial<CustomRole>): Promise<CustomRole | undefined>;
  deleteCustomRole(id: number): Promise<boolean>;
  
  // Role Permissions methods
  getRolePermissions(roleId: number): Promise<RolePermission[]>;
  addRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  updateRolePermission(id: number, data: Partial<RolePermission>): Promise<RolePermission | undefined>;
  deleteRolePermission(id: number): Promise<boolean>;
  
  // User Permissions methods
  getUserPermissions(userId: number): Promise<UserPermission[]>;
  getPermissionsByResource(userId: number, resource: string): Promise<UserPermission[]>;
  hasPermission(userId: number, resource: string, action: string): Promise<boolean>;
  addUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  updateUserPermission(id: number, data: Partial<UserPermission>): Promise<UserPermission | undefined>;
  deleteUserPermission(id: number): Promise<boolean>;
  
  // Role Management helper
  getFullCustomRoleDefinition(roleId: number): Promise<CustomRoleDefinition | undefined>;
  
  // Block Templates methods
  getBlockTemplates(organizationId: number, options?: { search?: string, category?: string }): Promise<{ items: BlockTemplate[], totalItems: number }>;
  getBlockTemplate(id: number): Promise<BlockTemplate | undefined>;
  createBlockTemplate(template: InsertBlockTemplate): Promise<BlockTemplate>;
  updateBlockTemplate(id: number, templateData: Partial<BlockTemplate>): Promise<BlockTemplate | undefined>;
  deleteBlockTemplate(id: number): Promise<boolean>;
  incrementBlockTemplateUsage(id: number): Promise<boolean>;
  
  // Smart Areas methods
  getSmartAreas(organizationId: number, options?: { type?: string, search?: string }): Promise<{ items: SmartArea[], totalItems: number }>;
  getSmartArea(id: number): Promise<SmartArea | undefined>;
  createSmartArea(smartArea: InsertSmartArea): Promise<SmartArea>;
  updateSmartArea(id: number, smartAreaData: Partial<SmartArea>): Promise<SmartArea | undefined>;
  deleteSmartArea(id: number): Promise<boolean>;
  getGlobalSmartAreas(organizationId: number, options?: { pageId?: number, pageType?: string }): Promise<SmartArea[]>;
}

export class DatabaseStorage implements IStorage {
  // === User methods ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }
  
  async getUsers(options?: { search?: string, role?: string }): Promise<{ items: User[], totalItems: number }> {
    let query = db.select().from(users);
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(users.name, `%${options.search}%`),
          like(users.email, `%${options.search}%`)
        )
      );
    }
    
    if (options?.role && options.role !== 'all') {
      query = query.where(eq(users.role, options.role));
    }
    
    const items = await query.orderBy(desc(users.createdAt));
    
    return {
      items,
      totalItems: items.length
    };
  }
  
  // === Organization methods ===
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return organization;
  }
  
  async getOrganizationByCustomDomain(domain: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.domain, domain));
    return organization;
  }
  
  async getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.subdomain, subdomain));
    return organization;
  }
  
  async getUserOrganizations(userId: number): Promise<Organization[]> {
    const result = await db
      .select({
        organization: organizations
      })
      .from(organizationUsers)
      .innerJoin(organizations, eq(organizationUsers.organizationId, organizations.id))
      .where(eq(organizationUsers.userId, userId));
    
    return result.map(item => item.organization);
  }
  
  async createOrganization(orgData: InsertOrganization, creatorId: number): Promise<Organization> {
    // Crear la organización en una transacción para garantizar que todo se complete o nada
    const result = await db.transaction(async (tx) => {
      // Insertar la organización
      const [organization] = await tx
        .insert(organizations)
        .values(orgData)
        .returning();
      
      // Añadir al creador como administrador de la organización
      await tx
        .insert(organizationUsers)
        .values({
          organizationId: organization.id,
          userId: creatorId,
          role: 'admin' // El creador siempre es administrador
        });
      
      return organization;
    });
    
    return result;
  }
  
  async deleteOrganization(id: number): Promise<boolean> {
    // Debemos comprobar primero si la organización existe
    const organization = await this.getOrganization(id);
    if (!organization) {
      return false;
    }
    
    // Eliminar la organización y todos sus registros asociados en una transacción
    return await db.transaction(async (tx) => {
      // Eliminar relaciones de usuarios con esta organización
      await tx
        .delete(organizationUsers)
        .where(eq(organizationUsers.organizationId, id));
      
      // Eliminar la organización
      const result = await tx
        .delete(organizations)
        .where(eq(organizations.id, id));
      
      return !!result;
    });
  }

  async updateOrganizationBranding(id: number, branding: Partial<Organization>): Promise<Organization | undefined> {
    const [updatedOrg] = await db
      .update(organizations)
      .set({ ...branding, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return updatedOrg;
  }
  
  async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined> {
    const [updatedOrg] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return updatedOrg;
  }
  
  async getUserRoleInOrganization(userId: number, organizationId: number): Promise<string | null> {
    const [orgUser] = await db
      .select()
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.userId, userId),
          eq(organizationUsers.organizationId, organizationId)
        )
      );
    
    return orgUser ? orgUser.role : null;
  }
  
  async updateOrganizationDomains(id: number, domainData: { domain?: string, subdomain?: string, domainConfig?: any }): Promise<Organization | undefined> {
    const updateData: any = { updatedAt: new Date() };
    
    if (domainData.domain !== undefined) {
      updateData.domain = domainData.domain;
    }
    
    if (domainData.subdomain !== undefined) {
      updateData.subdomain = domainData.subdomain;
    }
    
    if (domainData.domainConfig !== undefined) {
      updateData.domainConfig = domainData.domainConfig;
    }
    
    const [updatedOrg] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();
    
    return updatedOrg;
  }
  
  // === Organization Users methods ===
  async getOrganizationUsers(organizationId: number): Promise<User[]> {
    const result = await db
      .select({
        user: users
      })
      .from(organizationUsers)
      .innerJoin(users, eq(organizationUsers.userId, users.id))
      .where(eq(organizationUsers.organizationId, organizationId));
    
    return result.map(item => item.user);
  }
  
  async addUserToOrganization(organizationId: number, userId: number, role: string): Promise<OrganizationUser> {
    const [orgUser] = await db
      .insert(organizationUsers)
      .values({ organizationId, userId, role })
      .returning();
    return orgUser;
  }
  
  // === Pages methods ===
  async getPages(organizationId: number, options?: { search?: string, status?: string, page?: number, pageSize?: number }): Promise<{ items: Page[], totalItems: number, totalPages: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // Build the query
    let query = db.select().from(pages).where(eq(pages.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(pages.title, `%${options.search}%`),
          like(pages.slug, `%${options.search}%`)
        )
      );
    }
    
    if (options?.status && options.status !== 'all') {
      query = query.where(eq(pages.status, options.status));
    }
    
    // Count total items
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pages)
      .where(eq(pages.organizationId, organizationId));
    
    const totalItems = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Get paginated results
    const items = await query
      .orderBy(desc(pages.updatedAt))
      .limit(pageSize)
      .offset(offset);
    
    return {
      items,
      totalItems,
      totalPages
    };
  }
  
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }
  
  async getPageBySlug(organizationId: number, slug: string): Promise<Page | undefined> {
    const [page] = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.organizationId, organizationId),
          eq(pages.slug, slug)
        )
      );
    return page;
  }
  
  async createPage(pageData: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(pageData).returning();
    return page;
  }
  
  async updatePage(id: number, pageData: Partial<Page>): Promise<Page | undefined> {
    const [updatedPage] = await db
      .update(pages)
      .set({ ...pageData, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return updatedPage;
  }
  
  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return !!result;
  }
  
  // === Blog methods ===
  async getBlogPosts(organizationId: number, options?: { search?: string, status?: string, category?: string, page?: number, pageSize?: number }): Promise<{ items: any[], totalItems: number, totalPages: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // Build the query
    let query = db.select({
      post: blogPosts,
      author: users,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(blogPosts.title, `%${options.search}%`),
          like(blogPosts.content, `%${options.search}%`)
        )
      );
    }
    
    if (options?.status && options.status !== 'all') {
      query = query.where(eq(blogPosts.status, options.status));
    }
    
    // Filter by category if provided
    if (options?.category && options.category !== 'all') {
      query = query.innerJoin(
        postCategories, 
        and(
          eq(postCategories.postId, blogPosts.id),
          eq(postCategories.categoryId, parseInt(options.category))
        )
      );
    }
    
    // Count total items
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.organizationId, organizationId));
    
    const totalItems = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Get paginated results
    const results = await query
      .orderBy(desc(blogPosts.updatedAt))
      .limit(pageSize)
      .offset(offset);
    
    // Transform results
    const items = results.map(result => {
      const { password, ...authorWithoutPassword } = result.author || {};
      return {
        ...result.post,
        author: result.author ? authorWithoutPassword : null
      };
    });
    
    // For each post, fetch its categories
    for (const post of items) {
      const categoriesResult = await db
        .select({
          category: categories
        })
        .from(postCategories)
        .innerJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));
      
      post.categories = categoriesResult.map(item => item.category);
    }
    
    return {
      items,
      totalItems,
      totalPages
    };
  }
  
  async getBlogPost(id: number): Promise<any | undefined> {
    const [result] = await db
      .select({
        post: blogPosts,
        author: users,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.id, id));
    
    if (!result) return undefined;
    
    // Transform result
    const { password, ...authorWithoutPassword } = result.author || {};
    const post = {
      ...result.post,
      author: result.author ? authorWithoutPassword : null
    };
    
    // Fetch categories
    const categoriesResult = await db
      .select({
        category: categories
      })
      .from(postCategories)
      .innerJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, post.id));
    
    post.categories = categoriesResult.map(item => item.category);
    
    // Fetch tags
    const tagsResult = await db
      .select({
        tag: tags
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));
    
    post.tags = tagsResult.map(item => item.tag);
    
    return post;
  }
  
  async getBlogPostBySlug(organizationId: number, slug: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        post: blogPosts,
        author: users,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          eq(blogPosts.organizationId, organizationId),
          eq(blogPosts.slug, slug)
        )
      );
    
    if (!result) return undefined;
    
    // Transform result
    const { password, ...authorWithoutPassword } = result.author || {};
    const post = {
      ...result.post,
      author: result.author ? authorWithoutPassword : null
    };
    
    // Fetch categories and tags like in getBlogPost
    // ... (similar code as in getBlogPost)
    
    return post;
  }
  
  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(postData).returning();
    return post;
  }
  
  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    // First delete associated category and tag relationships
    await db.delete(postCategories).where(eq(postCategories.postId, id));
    await db.delete(postTags).where(eq(postTags.postId, id));
    
    // Then delete the post
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return !!result;
  }
  
  async getCategories(organizationId: number): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.organizationId, organizationId))
      .orderBy(asc(categories.name));
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }
  
  async getTags(organizationId: number): Promise<Tag[]> {
    return db
      .select()
      .from(tags)
      .where(eq(tags.organizationId, organizationId))
      .orderBy(asc(tags.name));
  }
  
  async createTag(tagData: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(tagData).returning();
    return tag;
  }
  
  // === Media methods ===
  async getMediaFiles(organizationId: number, options?: { search?: string, type?: string, folder?: string }): Promise<{ items: Media[], folders: { id: string, name: string }[] }> {
    // Build the query
    let query = db.select().from(media).where(eq(media.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(media.name, `%${options.search}%`),
          like(media.fileName, `%${options.search}%`)
        )
      );
    }
    
    if (options?.type && options?.type !== 'all') {
      query = query.where(like(media.fileType, `${options.type}/%`));
    }
    
    if (options?.folder && options?.folder !== 'all') {
      query = query.where(eq(media.folder, options.folder));
    }
    
    // Get results
    const items = await query.orderBy(desc(media.createdAt));
    
    // Get distinct folders
    const folderResults = await db
      .select({ folder: media.folder })
      .from(media)
      .where(eq(media.organizationId, organizationId))
      .groupBy(media.folder);
    
    // Transform folders to the expected format
    const folders = folderResults
      .filter(f => f.folder) // Filter out empty folders
      .map(f => ({
        id: f.folder,
        name: f.folder
      }));
    
    return {
      items,
      folders
    };
  }
  
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }
  
  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [mediaItem] = await db.insert(media).values(mediaData).returning();
    return mediaItem;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id));
    return !!result;
  }
  
  // === Courses methods ===
  async getCourses(organizationId: number, options?: { search?: string, status?: string, visibility?: string, page?: number, pageSize?: number }): Promise<{ items: any[], totalItems: number, totalPages: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // Build the query
    let query = db.select().from(courses).where(eq(courses.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(courses.title, `%${options.search}%`),
          like(courses.description, `%${options.search}%`)
        )
      );
    }
    
    if (options?.status && options.status !== 'all') {
      query = query.where(eq(courses.status, options.status));
    }
    
    if (options?.visibility && options.visibility !== 'all') {
      query = query.where(eq(courses.visibility, options.visibility));
    }
    
    // Count total items
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.organizationId, organizationId));
    
    const totalItems = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Get paginated results
    const items = await query
      .orderBy(desc(courses.updatedAt))
      .limit(pageSize)
      .offset(offset);
    
    // For each course, get the module count
    for (const course of items) {
      const moduleCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id));
      
      course.moduleCount = moduleCountResult[0]?.count || 0;
    }
    
    return {
      items,
      totalItems,
      totalPages
    };
  }
  
  async getCourse(id: number): Promise<any | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    
    if (!course) return undefined;
    
    // Fetch modules
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, id))
      .orderBy(asc(courseModules.order));
    
    // For each module, fetch lessons
    for (const module of modules) {
      const lessons = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.moduleId, module.id))
        .orderBy(asc(courseLessons.order));
      
      module.lessons = lessons;
    }
    
    return { ...course, modules };
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    // First get all modules
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, id));
    
    // Delete lessons for each module
    for (const module of modules) {
      await db.delete(courseLessons).where(eq(courseLessons.moduleId, module.id));
    }
    
    // Delete modules
    await db.delete(courseModules).where(eq(courseModules.courseId, id));
    
    // Delete the course
    const result = await db.delete(courses).where(eq(courses.id, id));
    return !!result;
  }
  
  // === API Keys methods ===
  async getApiKeys(organizationId: number): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.organizationId, organizationId))
      .orderBy(desc(apiKeys.createdAt));
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }
  
  async createApiKey(data: { name: string, organizationId: number, createdById: number }): Promise<ApiKey> {
    const key = `origo_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        key,
        name: data.name,
        organizationId: data.organizationId,
        createdById: data.createdById
      })
      .returning();
    
    return apiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return !!result;
  }

  // === Password Reset Token methods ===
  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    // Generar un token único
    const token = crypto.randomUUID();
    
    // Establecer la fecha de expiración (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Crear el token en la base de datos
    const [passwordResetToken] = await db
      .insert(passwordResetTokens)
      .values({
        userId,
        token,
        expiresAt
      })
      .returning();
    
    return passwordResetToken;
  }

  async getPasswordResetTokenByToken(token: string): Promise<PasswordResetToken | undefined> {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    
    return passwordResetToken;
  }

  async markTokenAsUsed(id: number): Promise<PasswordResetToken | undefined> {
    const [updatedToken] = await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    
    return updatedToken;
  }

  // === Custom Roles methods ===
  async getCustomRoles(organizationId: number): Promise<CustomRole[]> {
    return db
      .select()
      .from(customRoles)
      .where(eq(customRoles.organizationId, organizationId))
      .orderBy(asc(customRoles.name));
  }
  
  async getCustomRole(id: number): Promise<CustomRole | undefined> {
    const [role] = await db.select().from(customRoles).where(eq(customRoles.id, id));
    return role;
  }
  
  async getCustomRoleByName(organizationId: number, name: string): Promise<CustomRole | undefined> {
    const [role] = await db
      .select()
      .from(customRoles)
      .where(
        and(
          eq(customRoles.organizationId, organizationId),
          eq(customRoles.name, name)
        )
      );
    return role;
  }
  
  async createCustomRole(roleData: InsertCustomRole): Promise<CustomRole> {
    const [role] = await db.insert(customRoles).values(roleData).returning();
    return role;
  }
  
  async updateCustomRole(id: number, roleData: Partial<CustomRole>): Promise<CustomRole | undefined> {
    const [updatedRole] = await db
      .update(customRoles)
      .set({ ...roleData, updatedAt: new Date() })
      .where(eq(customRoles.id, id))
      .returning();
    return updatedRole;
  }
  
  async deleteCustomRole(id: number): Promise<boolean> {
    // Primero eliminamos todos los permisos asociados al rol
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    
    // Luego eliminamos el rol
    const result = await db.delete(customRoles).where(eq(customRoles.id, id));
    return !!result;
  }
  
  // === Role Permissions methods ===
  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    return db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .orderBy(asc(rolePermissions.resource), asc(rolePermissions.action));
  }
  
  async addRolePermission(permission: InsertRolePermission): Promise<RolePermission> {
    const [rolePermission] = await db.insert(rolePermissions).values(permission).returning();
    return rolePermission;
  }
  
  async updateRolePermission(id: number, data: Partial<RolePermission>): Promise<RolePermission | undefined> {
    const [updatedPermission] = await db
      .update(rolePermissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rolePermissions.id, id))
      .returning();
    return updatedPermission;
  }
  
  async deleteRolePermission(id: number): Promise<boolean> {
    const result = await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
    return !!result;
  }
  
  // === Role Management helper ===
  async getFullCustomRoleDefinition(roleId: number): Promise<CustomRoleDefinition | undefined> {
    const role = await this.getCustomRole(roleId);
    if (!role) return undefined;
    
    // Obtenemos todos los permisos asociados al rol
    const permissions = await this.getRolePermissions(roleId);
    
    // Convertimos la lista de permisos a un objeto PermissionSet
    const permissionSet: Record<string, boolean> = {};
    permissions.forEach(permission => {
      const key = `${permission.resource}.${permission.action}`;
      permissionSet[key] = permission.allowed;
    });
    
    // Retornamos la definición completa del rol personalizado
    return {
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      organizationId: role.organizationId,
      basedOnRole: role.basedOnRole as any, // Convertimos a SystemRole
      isDefault: role.isDefault,
      permissions: permissionSet,
      createdAt: role.createdAt?.toISOString(),
      updatedAt: role.updatedAt?.toISOString()
    };
  }

  // === User Permissions methods ===
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId))
      .orderBy(asc(userPermissions.resource), asc(userPermissions.action));
  }

  async getPermissionsByResource(userId: number, resource: string): Promise<UserPermission[]> {
    return db
      .select()
      .from(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.resource, resource)
        )
      );
  }

  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    // Primero obtener el usuario para verificar su rol
    const user = await this.getUser(userId);
    if (!user) return false;

    // Si es superadmin, siempre tiene todos los permisos
    if (user.role === 'superadmin') return true;

    // Verificar permisos específicos del usuario (tienen máxima prioridad)
    const [permission] = await db
      .select()
      .from(userPermissions)
      .where(
        and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.resource, resource),
          eq(userPermissions.action, action)
        )
      );

    // Si hay un permiso personalizado para el usuario, devuelve su valor 'allowed'
    if (permission) {
      return permission.allowed;
    }

    // Verificar si es un rol personalizado (comienza con "custom_")
    if (user.role.startsWith('custom_')) {
      // Extraer el ID del rol personalizado a partir del nombre (formato: "custom_ID")
      const roleId = parseInt(user.role.split('_')[1]);
      if (!isNaN(roleId)) {
        // Obtener la definición completa del rol personalizado
        const customRole = await this.getFullCustomRoleDefinition(roleId);
        if (customRole && customRole.permissions) {
          // Verificar si tiene permiso wildcard general
          if (customRole.permissions['*'] === true) return true;
          
          // Verificar si tiene permiso wildcard para el recurso
          if (customRole.permissions[`${resource}.*`] === true) return true;
          
          // Verificar permiso específico
          if (customRole.permissions[`${resource}.${action}`] === true) return true;
          
          // Verificar permisos del rol base (si no se encontró un permiso específico)
          const baseRolePermissions = RolePermissions[customRole.basedOnRole];
          if (baseRolePermissions) {
            if (baseRolePermissions['*'] === true) return true;
            if (baseRolePermissions[`${resource}.*`] === true) return true;
            if (baseRolePermissions[`${resource}.${action}`] === true) return true;
          }
        }
      }
    } else {
      // Verificar permisos basados en rol del sistema
      const rolePermissions = RolePermissions[user.role];
      if (rolePermissions) {
        // Verificar si tiene permiso wildcard general
        if (rolePermissions['*'] === true) return true;
        
        // Verificar si tiene permiso wildcard para el recurso
        if (rolePermissions[`${resource}.*`] === true) return true;
        
        // Verificar permiso específico
        if (rolePermissions[`${resource}.${action}`] === true) return true;
      }
    }

    // Por defecto, denegar
    return false;
  }

  async addUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [newPermission] = await db
      .insert(userPermissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async updateUserPermission(id: number, data: Partial<UserPermission>): Promise<UserPermission | undefined> {
    const [updatedPermission] = await db
      .update(userPermissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPermissions.id, id))
      .returning();
    return updatedPermission;
  }

  async deleteUserPermission(id: number): Promise<boolean> {
    const result = await db.delete(userPermissions).where(eq(userPermissions.id, id));
    return !!result;
  }
  
  // === Block Templates methods ===
  async getBlockTemplates(organizationId: number, options?: { search?: string, category?: string }): Promise<{ items: BlockTemplate[], totalItems: number }> {
    let query = db.select().from(blockTemplates).where(eq(blockTemplates.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(blockTemplates.name, `%${options.search}%`),
          like(blockTemplates.description || '', `%${options.search}%`)
        )
      );
    }
    
    if (options?.category && options.category !== 'all') {
      query = query.where(eq(blockTemplates.category, options.category));
    }
    
    const items = await query.orderBy(desc(blockTemplates.createdAt));
    
    return {
      items,
      totalItems: items.length
    };
  }
  
  async getBlockTemplate(id: number): Promise<BlockTemplate | undefined> {
    const [template] = await db.select().from(blockTemplates).where(eq(blockTemplates.id, id));
    return template;
  }
  
  async createBlockTemplate(templateData: InsertBlockTemplate): Promise<BlockTemplate> {
    const [template] = await db.insert(blockTemplates).values(templateData).returning();
    return template;
  }
  
  async updateBlockTemplate(id: number, templateData: Partial<BlockTemplate>): Promise<BlockTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(blockTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(blockTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteBlockTemplate(id: number): Promise<boolean> {
    const result = await db.delete(blockTemplates).where(eq(blockTemplates.id, id));
    return !!result;
  }
  
  async incrementBlockTemplateUsage(id: number): Promise<boolean> {
    const template = await this.getBlockTemplate(id);
    if (!template) return false;
    
    const [updatedTemplate] = await db
      .update(blockTemplates)
      .set({ 
        usageCount: (template.usageCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(blockTemplates.id, id))
      .returning();
    
    return !!updatedTemplate;
  }

  // === Smart Areas methods ===
  async getSmartAreas(organizationId: number, options?: { type?: string, search?: string }): Promise<{ items: SmartArea[], totalItems: number }> {
    let query = db.select().from(smartAreas).where(eq(smartAreas.organizationId, organizationId));
    
    // Apply filters
    if (options?.search) {
      query = query.where(
        or(
          like(smartAreas.name, `%${options.search}%`),
          like(smartAreas.description || '', `%${options.search}%`)
        )
      );
    }
    
    if (options?.type && options.type !== 'all') {
      query = query.where(eq(smartAreas.type, options.type));
    }
    
    const items = await query.orderBy(desc(smartAreas.updatedAt));
    
    return {
      items,
      totalItems: items.length
    };
  }
  
  async getSmartArea(id: number): Promise<SmartArea | undefined> {
    const [smartArea] = await db.select().from(smartAreas).where(eq(smartAreas.id, id));
    return smartArea;
  }
  
  async createSmartArea(smartAreaData: InsertSmartArea): Promise<SmartArea> {
    const [smartArea] = await db.insert(smartAreas).values(smartAreaData).returning();
    return smartArea;
  }
  
  async updateSmartArea(id: number, smartAreaData: Partial<SmartArea>): Promise<SmartArea | undefined> {
    const [updatedSmartArea] = await db
      .update(smartAreas)
      .set({ ...smartAreaData, updatedAt: new Date() })
      .where(eq(smartAreas.id, id))
      .returning();
    return updatedSmartArea;
  }
  
  async deleteSmartArea(id: number): Promise<boolean> {
    const result = await db.delete(smartAreas).where(eq(smartAreas.id, id));
    return !!result;
  }
  
  async getGlobalSmartAreas(organizationId: number, options?: { pageId?: number, pageType?: string }): Promise<SmartArea[]> {
    let query = db
      .select()
      .from(smartAreas)
      .where(
        and(
          eq(smartAreas.organizationId, organizationId),
          eq(smartAreas.isGlobal, true),
          eq(smartAreas.status, "published")
        )
      );
    
    const smartAreas = await query;
    
    // Filtrar según las condiciones de visualización
    return smartAreas.filter(area => {
      // Si no hay condiciones de visualización, mostrar siempre
      if (!area.displayConditions) return true;
      
      const conditions = area.displayConditions;
      
      // Verificar si hay páginas específicas y si la página actual está incluida
      if (options?.pageId && conditions.specificPages?.length) {
        if (!conditions.specificPages.includes(options.pageId)) {
          return false;
        }
      }
      
      // Verificar si la página actual está excluida
      if (options?.pageId && conditions.excludedPages?.length) {
        if (conditions.excludedPages.includes(options.pageId)) {
          return false;
        }
      }
      
      // Verificar el tipo de página
      if (options?.pageType && conditions.pageTypes?.length) {
        if (!conditions.pageTypes.includes('all') && !conditions.pageTypes.includes(options.pageType)) {
          return false;
        }
      }
      
      return true;
    });
  }
}

export const storage = new DatabaseStorage();
