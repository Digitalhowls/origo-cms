import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertBlockTemplateSchema } from '@shared/schema';
import { z } from 'zod';

/**
 * Obtiene todas las plantillas de bloques para la organización actual.
 */
export async function getBlockTemplates(req: Request, res: Response) {
  try {
    const { organizationId } = req.body;
    const { search, category } = req.query;

    if (!organizationId) {
      return res.status(400).json({ message: 'Se requiere un contexto de organización' });
    }

    const options: { search?: string, category?: string } = {};
    if (search) options.search = search.toString();
    if (category) options.category = category.toString();

    const templates = await storage.getBlockTemplates(organizationId, options);
    return res.json(templates);
  } catch (error) {
    console.error('Error al obtener plantillas de bloques:', error);
    return res.status(500).json({ message: 'Error al obtener plantillas de bloques' });
  }
}

/**
 * Obtiene una plantilla de bloque específica.
 */
export async function getBlockTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const template = await storage.getBlockTemplate(Number(id));
    
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    
    return res.json(template);
  } catch (error) {
    console.error('Error al obtener plantilla de bloque:', error);
    return res.status(500).json({ message: 'Error al obtener plantilla de bloque' });
  }
}

/**
 * Crea una nueva plantilla de bloque.
 */
export async function createBlockTemplate(req: Request, res: Response) {
  try {
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Se requiere un contexto de organización' });
    }
    
    // Validar los datos de entrada
    const validationResult = insertBlockTemplateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos para la plantilla',
        errors: validationResult.error.errors 
      });
    }
    
    const newTemplate = await storage.createBlockTemplate(validationResult.data);
    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error al crear plantilla de bloque:', error);
    return res.status(500).json({ message: 'Error al crear plantilla de bloque' });
  }
}

/**
 * Actualiza una plantilla de bloque existente.
 */
export async function updateBlockTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Se requiere un contexto de organización' });
    }
    
    // Verificar que la plantilla existe
    const template = await storage.getBlockTemplate(Number(id));
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    
    // Verificar que la plantilla pertenece a la organización del usuario
    if (template.organizationId !== organizationId) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta plantilla' });
    }
    
    // Actualizar la plantilla
    const updatedTemplate = await storage.updateBlockTemplate(Number(id), req.body);
    return res.json(updatedTemplate);
  } catch (error) {
    console.error('Error al actualizar plantilla de bloque:', error);
    return res.status(500).json({ message: 'Error al actualizar plantilla de bloque' });
  }
}

/**
 * Elimina una plantilla de bloque.
 */
export async function deleteBlockTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { organizationId } = req.body;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Se requiere un contexto de organización' });
    }
    
    // Verificar que la plantilla existe
    const template = await storage.getBlockTemplate(Number(id));
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    
    // Verificar que la plantilla pertenece a la organización del usuario
    if (template.organizationId !== organizationId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta plantilla' });
    }
    
    // Eliminar la plantilla
    await storage.deleteBlockTemplate(Number(id));
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar plantilla de bloque:', error);
    return res.status(500).json({ message: 'Error al eliminar plantilla de bloque' });
  }
}

/**
 * Incrementa el contador de uso de una plantilla de bloque.
 */
export async function incrementTemplateUsage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar que la plantilla existe
    const template = await storage.getBlockTemplate(Number(id));
    if (!template) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }
    
    // Incrementar el contador
    await storage.incrementBlockTemplateUsage(Number(id));
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al incrementar uso de plantilla:', error);
    return res.status(500).json({ message: 'Error al incrementar uso de plantilla' });
  }
}