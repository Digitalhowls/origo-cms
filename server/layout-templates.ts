/**
 * Funciones de utilidad para gestionar plantillas de diseño
 */

import { storage } from './storage';
import { LayoutTemplate, InsertLayoutTemplate } from '@shared/schema';

/**
 * Obtiene todas las plantillas de diseño para una organización
 * con opciones de filtrado
 */
export async function getLayoutTemplates(
  organizationId: number,
  filters?: {
    category?: string;
    includeSystem?: boolean;
    includePublic?: boolean;
    search?: string;
  }
): Promise<LayoutTemplate[]> {
  return storage.getLayoutTemplates(organizationId, filters);
}

/**
 * Obtiene una plantilla de diseño específica por su ID
 */
export async function getLayoutTemplate(id: number): Promise<LayoutTemplate | undefined> {
  return storage.getLayoutTemplate(id);
}

/**
 * Crea una nueva plantilla de diseño
 */
export async function createLayoutTemplate(
  templateData: InsertLayoutTemplate
): Promise<LayoutTemplate> {
  return storage.createLayoutTemplate(templateData);
}

/**
 * Actualiza una plantilla de diseño existente
 */
export async function updateLayoutTemplate(
  id: number,
  templateData: Partial<InsertLayoutTemplate>
): Promise<LayoutTemplate | undefined> {
  return storage.updateLayoutTemplate(id, templateData);
}

/**
 * Elimina una plantilla de diseño
 */
export async function deleteLayoutTemplate(id: number): Promise<boolean> {
  return storage.deleteLayoutTemplate(id);
}

/**
 * Incrementa el contador de popularidad de una plantilla
 */
export async function incrementTemplatePopularity(id: number): Promise<void> {
  return storage.incrementLayoutTemplatePopularity(id);
}

/**
 * Obtiene las plantillas destacadas o populares
 */
export async function getFeaturedTemplates(
  organizationId: number,
  category?: string,
  limit: number = 10
): Promise<LayoutTemplate[]> {
  return storage.getFeaturedLayoutTemplates(organizationId, category, limit);
}