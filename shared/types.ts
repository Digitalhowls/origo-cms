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

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
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
