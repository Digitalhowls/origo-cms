// Page Builder Types
export interface Block {
  id: string;
  type: BlockType;
  content: any;
  settings: any;
}

export enum BlockType {
  HEADER = 'header',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  FEATURES = 'features',
  TEXT_MEDIA = 'text-media',
  CTA = 'cta',
  COLUMNS = 'columns',
  VIDEO = 'video',
  TESTIMONIAL = 'testimonial',
  PRICING = 'pricing',
  CONTACT = 'contact',
  GALLERY = 'gallery',
  FAQ = 'faq',
  HERO = 'hero',
  STATS = 'stats',
}

export interface PageData {
  id?: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  blocks: Block[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

// Media Types
export interface MediaFile {
  id: number;
  name: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  folder: string;
  uploadedById: number;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
}

// Organization Types
export interface OrganizationBranding {
  logo?: string;
  favicon?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    headings: string;
  };
}

// User Types
export type UserRole = 'superadmin' | 'admin' | 'editor' | 'reader' | 'viewer';

// Permissions and Resource Types
export enum Resource {
  PAGE = 'page',
  BLOG = 'blog',
  MEDIA = 'media',
  COURSE = 'course',
  USER = 'user',
  ORGANIZATION = 'organization',
  SETTING = 'setting',
  ANALYTICS = 'analytics',
  API_KEY = 'api_key',
  CATEGORY = 'category',
  TAG = 'tag'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  INVITE = 'invite',
  MANAGE = 'manage',
  ADMIN = 'admin'
}

export type Permission = `${Resource}.${Action}`;

export interface PermissionSet {
  [key: string]: boolean;
}

// Predefined permission sets for standard roles
export const RolePermissions: Record<UserRole, PermissionSet> = {
  superadmin: {
    '*': true, // Wildcard for all permissions
  },
  admin: {
    'page.*': true,
    'blog.*': true,
    'media.*': true,
    'course.*': true,
    'user.create': true,
    'user.read': true,
    'user.update': true,
    'user.delete': true,
    'user.invite': true,
    'organization.read': true,
    'organization.update': true,
    'setting.*': true,
    'analytics.*': true,
    'api_key.*': true,
    'category.*': true,
    'tag.*': true,
  },
  editor: {
    'page.create': true,
    'page.read': true,
    'page.update': true,
    'page.publish': true,
    'page.unpublish': true,
    'blog.create': true,
    'blog.read': true,
    'blog.update': true,
    'blog.publish': true,
    'blog.unpublish': true,
    'media.create': true,
    'media.read': true,
    'media.update': true,
    'course.create': true,
    'course.read': true,
    'course.update': true,
    'course.publish': true,
    'course.unpublish': true,
    'category.create': true,
    'category.read': true,
    'category.update': true,
    'tag.create': true,
    'tag.read': true,
    'tag.update': true,
    'analytics.read': true,
  },
  reader: {
    'page.read': true,
    'blog.read': true,
    'media.read': true,
    'course.read': true,
    'category.read': true,
    'tag.read': true,
  },
  viewer: {
    'page.read': true,
    'blog.read': true,
    'media.read': true,
    'course.read': true,
  },
};

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions?: PermissionSet;
}

// Dashboard/Analytics Types
export interface AnalyticsData {
  pageViews: number;
  averageTime: string;
  topPages: Array<{
    title: string;
    url: string;
    views: number;
  }>;
}
