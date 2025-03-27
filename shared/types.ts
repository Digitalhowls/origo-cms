// Page Builder Types
// Grid Types
export interface GridCell {
  id: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export interface Grid {
  id: string;
  name?: string;
  columns: number;
  rows: number;
  columnWidths?: string[];
  rowHeights?: string[];
  gap?: number;
  padding?: number;
  cells?: GridCell[];
  responsive?: {
    tablet?: Partial<Grid>;
    mobile?: Partial<Grid>;
  };
}

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  settings: any;
  animation?: AnimationProps;
  gridPosition?: GridCell;
  data?: {
    title?: string;
    description?: string;
    items?: Array<{
      id: string;
      title: string;
      content: string;
      isOpen?: boolean;
      icon?: string;  // Para pestañas con ícono
    }>;
    // Para el bloque de tabla
    headers?: Array<{
      id: string;
      label: string;
      key: string;
      align?: 'left' | 'center' | 'right';
      width?: string;
      sortable?: boolean;
    }>;
    rows?: Array<{
      id: string;
      cells: Record<string, string | number | boolean>;
      isHighlighted?: boolean;
    }>;
    // Para el bloque de galería
    images?: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      title?: string;
      caption?: string;
      altText?: string;
    }>;
    settings?: {
      // Estilos comunes y configuraciones para todos los bloques
      style?: 'basic' | 'bordered' | 'shadowed' | 'faq' | 'default' | 'boxed' | 'underline' | 'pills' | 'minimal' | 'striped' | 'compact';
      
      // Configuraciones específicas para el bloque acordeón
      allowMultiple?: boolean;
      defaultValues?: string[];
      showControls?: boolean;
      headerTag?: string;
      
      // Configuraciones específicas para el bloque de pestañas
      orientation?: 'horizontal' | 'vertical';
      defaultTab?: string;
      showIcons?: boolean;
      fullWidth?: boolean;
      animationType?: 'fade' | 'slide' | 'scale' | 'none';
      
      // Configuraciones específicas para el bloque de tabla
      isResponsive?: boolean;
      hasFixedHeader?: boolean;
      enableSorting?: boolean;
      enablePagination?: boolean;
      rowsPerPage?: number;
      enableSearch?: boolean;
      enableRowHighlight?: boolean;
      showAlternatingRows?: boolean;
      tableWidth?: 'auto' | 'full';
      captionPosition?: 'top' | 'bottom';
      
      // Configuraciones específicas para el bloque de galería
      autoplay?: boolean;
      autoplaySpeed?: number;
      showDots?: boolean;
      showArrows?: boolean;
      infinite?: boolean;
      enableLightbox?: boolean;
      enableCaptions?: boolean;
      enableFullscreen?: boolean;
      aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
      animation?: 'slide' | 'fade' | 'zoom';
      imgFit?: 'cover' | 'contain' | 'fill';
    };
  };
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
  ACCORDION = 'accordion',
  TABS = 'tabs',
  TABLE = 'table',
}

export interface PageData {
  id?: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  blocks: Block[];
  grid?: Grid; // Configuración del sistema de rejilla
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  lastModified?: string; // Fecha de última modificación
}

// History Related Types
export interface HistoryEntry {
  id: string;
  timestamp: string;
  label: string;
  state: PageData;
  type: HistoryActionType;
  // Metadatos adicionales para la interfaz
  preview?: {
    thumbnail?: string;    // Una vista previa en miniatura (base64)
    blocksChanged?: number; // Número de bloques afectados
    blockTypes?: BlockType[]; // Tipos de bloques afectados
    changeDescription?: string; // Descripción detallada del cambio
  };
  metadata?: {
    userId?: number;    // Usuario que realizó el cambio
    userName?: string;  // Nombre del usuario
    device?: string;    // Dispositivo desde donde se hizo
    important?: boolean; // Marcar como cambio importante
    tags?: string[];    // Etiquetas asociadas al cambio
  };
}

export enum HistoryActionType {
  INITIAL = 'initial',
  ADD_BLOCK = 'add_block',
  UPDATE_BLOCK = 'update_block',
  REMOVE_BLOCK = 'remove_block',
  MOVE_BLOCK = 'move_block',
  UPDATE_PAGE_META = 'update_page_meta',
  SAVED_SNAPSHOT = 'saved_snapshot',
  IMPORTED = 'imported',
  AUTO_SAVED = 'auto_saved',
  SAVED_TEMPLATE = 'saved_template',
  UPDATE_ANIMATION = 'update_animation',
  UPDATE_GRID = 'update_grid',
  ADD_GRID = 'add_grid',
  UPDATE_BLOCK_POSITION = 'update_block_position'
}

// Tipos de animación
export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  ROTATE = 'rotate',
  FLIP = 'flip',
  SPECIAL = 'special'
}

// Tipos de eventos que pueden desencadenar animaciones
export enum AnimationTrigger {
  LOAD = 'load',
  SCROLL = 'scroll',
  CLICK = 'click',
  HOVER = 'hover',
  MOUSE_ENTER = 'mouseenter',
  MOUSE_LEAVE = 'mouseleave'
}

// Interface para las propiedades de animación
export interface AnimationProps {
  type: AnimationType;
  subType: string;
  trigger: AnimationTrigger;
  duration: number;
  delay: number;
  easing: string;
  direction?: string;
  iterations?: number;
  reverse?: boolean;
  autoplay?: boolean;
  offset?: number;
  custom?: Record<string, any>;
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
export type SystemRole = 'superadmin' | 'admin' | 'editor' | 'reader' | 'viewer';
export type UserRole = SystemRole | string; // Permite roles personalizados como string

export interface CustomRoleDefinition {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  basedOnRole: SystemRole;
  isDefault: boolean;
  permissions?: PermissionSet;
  createdAt?: string;
  updatedAt?: string;
}

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
// Agrupaciones de recursos para la interfaz de usuario
export const ResourceGroups = {
  'Contenido': [Resource.PAGE, Resource.BLOG, Resource.COURSE],
  'Medios': [Resource.MEDIA],
  'Taxonomía': [Resource.CATEGORY, Resource.TAG],
  'Usuarios': [Resource.USER, Resource.ORGANIZATION],
  'Sistema': [Resource.SETTING, Resource.ANALYTICS, Resource.API_KEY]
};

// Etiquetas para los recursos (traducciones amigables)
export const resourceLabels: Record<Resource, string> = {
  [Resource.PAGE]: 'Páginas',
  [Resource.BLOG]: 'Blog',
  [Resource.MEDIA]: 'Medios',
  [Resource.COURSE]: 'Cursos',
  [Resource.USER]: 'Usuarios',
  [Resource.ORGANIZATION]: 'Organización',
  [Resource.SETTING]: 'Configuración',
  [Resource.ANALYTICS]: 'Analíticas',
  [Resource.API_KEY]: 'Claves API',
  [Resource.CATEGORY]: 'Categorías',
  [Resource.TAG]: 'Etiquetas'
};

// Etiquetas para las acciones (traducciones amigables)
export const actionLabels: Record<string, string> = {
  // Acciones genéricas
  'create': 'Crear',
  'read': 'Ver',
  'update': 'Editar',
  'delete': 'Eliminar',
  'publish': 'Publicar',
  'unpublish': 'Despublicar',
  'invite': 'Invitar',
  'manage': 'Gestionar',
  'admin': 'Administrar',
  
  // Acciones específicas con descripciones personalizadas
  'page.create': 'Crear páginas',
  'page.read': 'Ver páginas',
  'page.update': 'Editar páginas',
  'page.delete': 'Eliminar páginas',
  'page.publish': 'Publicar páginas',
  'page.unpublish': 'Despublicar páginas',

  'blog.create': 'Crear artículos',
  'blog.read': 'Ver artículos',
  'blog.update': 'Editar artículos',
  'blog.delete': 'Eliminar artículos',
  'blog.publish': 'Publicar artículos',
  'blog.unpublish': 'Despublicar artículos',

  'media.create': 'Subir archivos',
  'media.read': 'Ver archivos',
  'media.update': 'Editar archivos',
  'media.delete': 'Eliminar archivos',

  'course.create': 'Crear cursos',
  'course.read': 'Ver cursos',
  'course.update': 'Editar cursos',
  'course.delete': 'Eliminar cursos',
  'course.publish': 'Publicar cursos',
  'course.unpublish': 'Despublicar cursos',

  'user.create': 'Crear usuarios',
  'user.read': 'Ver usuarios',
  'user.update': 'Editar usuarios',
  'user.delete': 'Eliminar usuarios',
  'user.invite': 'Invitar usuarios',
  'user.manage': 'Gestionar permisos',

  'organization.read': 'Ver detalles de organización',
  'organization.update': 'Editar detalles de organización',
  'organization.manage': 'Gestionar organización',
  'organization.admin': 'Configuración avanzada',

  'setting.read': 'Ver configuración',
  'setting.update': 'Modificar configuración',
  'setting.manage': 'Gestionar configuración',

  'analytics.read': 'Ver analíticas',
  'analytics.manage': 'Gestionar analíticas',

  'api_key.create': 'Crear claves API',
  'api_key.read': 'Ver claves API',
  'api_key.update': 'Modificar claves API',
  'api_key.delete': 'Eliminar claves API',

  'category.create': 'Crear categorías',
  'category.read': 'Ver categorías',
  'category.update': 'Editar categorías',
  'category.delete': 'Eliminar categorías',

  'tag.create': 'Crear etiquetas',
  'tag.read': 'Ver etiquetas',
  'tag.update': 'Editar etiquetas',
  'tag.delete': 'Eliminar etiquetas',
};

export const RolePermissions: Record<SystemRole, PermissionSet> = {
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

/**
 * Determina si una cadena es un rol del sistema
 * @param role Rol a comprobar
 */
export function isSystemRole(role: string): role is SystemRole {
  return ['superadmin', 'admin', 'editor', 'reader', 'viewer'].includes(role);
}

/**
 * Obtiene los permisos base de un rol (sistema o personalizado)
 * @param role Rol para el que obtener los permisos
 * @param customRoles Lista de roles personalizados disponibles
 */
export function getBaseRolePermissions(role: UserRole, customRoles?: CustomRoleDefinition[]): PermissionSet {
  // Si es un rol del sistema, devolvemos sus permisos predefinidos
  if (isSystemRole(role)) {
    return RolePermissions[role];
  }
  
  // Si es un rol personalizado, buscamos su definición
  if (customRoles) {
    const customRole = customRoles.find(r => r.name === role);
    if (customRole && customRole.permissions) {
      return customRole.permissions;
    }
    // Si se encontró el rol personalizado pero no tiene permisos definidos,
    // utilizamos los permisos del rol base en el que se basa
    if (customRole && customRole.basedOnRole) {
      return RolePermissions[customRole.basedOnRole];
    }
  }
  
  // Si no se encuentra, devolvemos los permisos de viewer como fallback
  return RolePermissions.viewer;
}

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

// Templates/Block Reutilizables
export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string; // URL de imagen de vista previa
  category: string;
  organizationId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  block: Block; // El bloque que se puede reutilizar
  usageCount?: number; // Contador de cuántas veces se ha usado
  tags?: string[]; // Etiquetas para categorizar y buscar
}
