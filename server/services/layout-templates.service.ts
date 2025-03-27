/**
 * Servicio para gestionar plantillas de diseño predefinidas
 * 
 * Este servicio proporciona funcionalidades para administrar plantillas de diseño
 * que los usuarios pueden utilizar como punto de partida para crear nuevas páginas
 * en lugar de empezar desde cero.
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { LayoutTemplate, InsertLayoutTemplate } from '@shared/schema';
import { isAdmin, getOrganizationIdFromRequest, isResourceOwner } from '../utils/request-utils';

/**
 * Obtiene todas las plantillas de diseño disponibles para una organización
 * 
 * Incluye plantillas propias de la organización, plantillas del sistema y
 * plantillas públicas (compartidas por otras organizaciones)
 */
export const getLayoutTemplates = async (req: Request, res: Response) => {
  try {
    const organizationId = getOrganizationIdFromRequest(req);
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Se requiere un ID de organización' });
    }
    
    // Obtener filtros de la consulta
    const filters = {
      category: req.query.category as string | undefined,
      includeSystem: req.query.includeSystem === 'true',
      includePublic: req.query.includePublic === 'true',
      search: req.query.search as string | undefined
    };
    
    const templates = await storage.getLayoutTemplates(organizationId, filters);
    
    return res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas de diseño:', error);
    return res.status(500).json({ error: 'Error al obtener plantillas de diseño' });
  }
};

/**
 * Obtiene una plantilla de diseño específica por su ID
 */
export const getLayoutTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'ID de plantilla inválido' });
    }
    
    const template = await storage.getLayoutTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    // Verificar si el usuario tiene acceso a esta plantilla
    const organizationId = getOrganizationIdFromRequest(req);
    
    if (!template.isSystem && !template.isPublic && template.organizationId !== organizationId) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta plantilla' });
    }
    
    return res.json(template);
  } catch (error) {
    console.error('Error al obtener plantilla de diseño:', error);
    return res.status(500).json({ error: 'Error al obtener plantilla de diseño' });
  }
};

/**
 * Crea una nueva plantilla de diseño
 * 
 * La plantilla puede ser creada a partir del contenido de una página existente
 * o desde cero con un contenido personalizado.
 */
export const createLayoutTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = getOrganizationIdFromRequest(req);
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Se requiere un ID de organización' });
    }
    
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const userId = (req.user as any).id;
    
    const templateData: InsertLayoutTemplate = {
      ...req.body,
      organizationId,
      createdById: userId,
      popularity: 0 // Inicia con 0 popularidad
    };
    
    const newTemplate = await storage.createLayoutTemplate(templateData);
    
    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error al crear plantilla de diseño:', error);
    return res.status(500).json({ error: 'Error al crear plantilla de diseño' });
  }
};

/**
 * Actualiza una plantilla de diseño existente
 */
export const updateLayoutTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'ID de plantilla inválido' });
    }
    
    const template = await storage.getLayoutTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    // Verificar permisos: sólo el creador o un administrador puede modificar la plantilla
    const isOwner = isResourceOwner(req, template.createdById);
    if (!isOwner && !isAdmin(req) && template.isSystem) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta plantilla' });
    }
    
    // Para plantillas del sistema o públicas de otra organización, sólo el administrador puede modificarlas
    if ((template.isSystem || (template.isPublic && template.organizationId !== getOrganizationIdFromRequest(req))) && !isAdmin(req)) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta plantilla' });
    }
    
    const updatedTemplate = await storage.updateLayoutTemplate(templateId, req.body);
    
    return res.json(updatedTemplate);
  } catch (error) {
    console.error('Error al actualizar plantilla de diseño:', error);
    return res.status(500).json({ error: 'Error al actualizar plantilla de diseño' });
  }
};

/**
 * Elimina una plantilla de diseño
 */
export const deleteLayoutTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'ID de plantilla inválido' });
    }
    
    const template = await storage.getLayoutTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    // Verificar permisos: sólo el creador o un administrador puede eliminar la plantilla
    const isOwner = isResourceOwner(req, template.createdById);
    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta plantilla' });
    }
    
    // Las plantillas del sistema no pueden ser eliminadas, ni siquiera por un administrador
    if (template.isSystem) {
      return res.status(403).json({ error: 'No se pueden eliminar plantillas del sistema' });
    }
    
    await storage.deleteLayoutTemplate(templateId);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar plantilla de diseño:', error);
    return res.status(500).json({ error: 'Error al eliminar plantilla de diseño' });
  }
};

/**
 * Incrementa el contador de popularidad de una plantilla
 * cuando es utilizada para crear una nueva página
 */
export const incrementTemplatePopularity = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'ID de plantilla inválido' });
    }
    
    const template = await storage.getLayoutTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    await storage.incrementLayoutTemplatePopularity(templateId);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al incrementar popularidad de plantilla:', error);
    return res.status(500).json({ error: 'Error al incrementar popularidad de plantilla' });
  }
};

/**
 * Obtiene las plantillas destacadas o más populares,
 * filtradas opcionalmente por categoría
 */
export const getFeaturedTemplates = async (req: Request, res: Response) => {
  try {
    const organizationId = getOrganizationIdFromRequest(req);
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Se requiere un ID de organización' });
    }
    
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const templates = await storage.getFeaturedLayoutTemplates(organizationId, category, limit);
    
    return res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas destacadas:', error);
    return res.status(500).json({ error: 'Error al obtener plantillas destacadas' });
  }
};