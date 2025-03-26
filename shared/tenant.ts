/**
 * Definiciones de planes y límites para el sistema multi-tenant
 */

// Tipos de planes disponibles
export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// Estructura de límites por plan
export interface PlanLimits {
  maxUsers: number;         // Número máximo de usuarios
  maxPages: number;         // Número máximo de páginas
  maxPosts: number;         // Número máximo de publicaciones de blog
  maxCourses: number;       // Número máximo de cursos
  maxStorage: number;       // Almacenamiento máximo en MB
  customDomain: boolean;    // Soporte para dominio personalizado
  whiteLabel: boolean;      // Opción de marca blanca
  advancedAnalytics: boolean; // Analíticas avanzadas
  support: 'email' | 'priority' | '24/7'; // Nivel de soporte
  apiAccess: boolean;       // Acceso a la API
}

// Definición de los planes del sistema
export const PLAN_DEFINITIONS: Record<PlanType, PlanLimits & { name: string, price: number, description: string }> = {
  [PlanType.FREE]: {
    name: 'Gratis',
    price: 0,
    description: 'Ideal para probar el sistema o proyectos personales',
    maxUsers: 1,
    maxPages: 5,
    maxPosts: 10,
    maxCourses: 0,
    maxStorage: 100,
    customDomain: false,
    whiteLabel: false,
    advancedAnalytics: false,
    support: 'email',
    apiAccess: false
  },
  [PlanType.BASIC]: {
    name: 'Básico',
    price: 9.99,
    description: 'Para blogs y sitios web pequeños',
    maxUsers: 3,
    maxPages: 20,
    maxPosts: 50,
    maxCourses: 1,
    maxStorage: 1000,
    customDomain: true,
    whiteLabel: false,
    advancedAnalytics: false,
    support: 'email',
    apiAccess: true
  },
  [PlanType.PROFESSIONAL]: {
    name: 'Profesional',
    price: 29.99,
    description: 'Para negocios y proyectos profesionales',
    maxUsers: 10,
    maxPages: 100,
    maxPosts: 500,
    maxCourses: 10,
    maxStorage: 10000,
    customDomain: true,
    whiteLabel: true,
    advancedAnalytics: true,
    support: 'priority',
    apiAccess: true
  },
  [PlanType.ENTERPRISE]: {
    name: 'Empresarial',
    price: 99.99,
    description: 'Para empresas con necesidades avanzadas',
    maxUsers: 50,
    maxPages: 1000,
    maxPosts: 5000,
    maxCourses: 100,
    maxStorage: 100000,
    customDomain: true,
    whiteLabel: true,
    advancedAnalytics: true,
    support: '24/7',
    apiAccess: true
  }
};

/**
 * Comprueba si un recurso está dentro de los límites del plan
 * @param plan El plan a comprobar
 * @param resourceType El tipo de recurso
 * @param currentCount La cantidad actual del recurso
 */
export function isWithinPlanLimits(plan: PlanType, resourceType: keyof PlanLimits, currentCount: number): boolean {
  const limits = PLAN_DEFINITIONS[plan];
  
  // Para recursos booleanos, comprobamos si están permitidos
  if (typeof limits[resourceType] === 'boolean') {
    return limits[resourceType] as boolean;
  }
  
  // Para límites numéricos, comprobamos si está dentro del límite
  if (typeof limits[resourceType] === 'number') {
    return currentCount < (limits[resourceType] as number);
  }
  
  // Para otros tipos (como el soporte), asumimos que está permitido
  return true;
}

/**
 * Obtiene los límites de un plan específico
 * @param plan Tipo de plan
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_DEFINITIONS[plan];
}

/**
 * Obtiene información sobre todos los planes disponibles
 */
export function getAvailablePlans() {
  return Object.values(PLAN_DEFINITIONS);
}

/**
 * Interfaz para estadísticas de uso de una organización
 */
export interface OrganizationUsageStats {
  users: number;
  pages: number;
  posts: number;
  courses: number;
  storage: number; // en MB
}

/**
 * Interfaz para validación del uso de recursos
 */
export interface ResourceValidation {
  isValid: boolean;
  currentUsage: number;
  limit: number;
  resourceType: string;
}