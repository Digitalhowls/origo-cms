/**
 * Servicio para gestionar Smart Areas (áreas inteligentes) del CMS
 * Las Smart Areas son componentes reutilizables como headers, footers, etc.
 * que pueden ser asignados a múltiples páginas basado en condiciones
 */

import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { SmartArea, insertSmartAreaSchema } from "@shared/schema";
import { getOrganizationFromRequest } from "../middleware/organization";
import { validatePermission } from "../middleware/permissions";

/**
 * Obtiene todas las Smart Areas para la organización actual
 */
export async function getSmartAreas(req: Request, res: Response) {
  try {
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const { type, search } = req.query;
    
    const result = await storage.getSmartAreas(organization.id, {
      type: typeof type === 'string' ? type : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    
    res.json(result);
  } catch (error) {
    console.error("Error getting smart areas:", error);
    res.status(500).json({ error: "Failed to get smart areas" });
  }
}

/**
 * Obtiene una Smart Area específica por ID
 */
export async function getSmartArea(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const smartArea = await storage.getSmartArea(parseInt(id));
    if (!smartArea) {
      return res.status(404).json({ error: "Smart area not found" });
    }
    
    // Verificar pertenencia a la organización del usuario
    const organization = await getOrganizationFromRequest(req);
    if (!organization || smartArea.organizationId !== organization.id) {
      return res.status(403).json({ error: "Not authorized to access this smart area" });
    }
    
    res.json(smartArea);
  } catch (error) {
    console.error("Error getting smart area:", error);
    res.status(500).json({ error: "Failed to get smart area" });
  }
}

/**
 * Crea una nueva Smart Area
 */
export async function createSmartArea(req: Request, res: Response) {
  try {
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    // Verificar permisos
    const canCreate = await validatePermission(req, "smartAreas", "create");
    if (!canCreate) {
      return res.status(403).json({ error: "Not authorized to create smart areas" });
    }
    
    // Validar datos de entrada
    const validationSchema = insertSmartAreaSchema;
    const validationResult = validationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input data", 
        details: validationResult.error.errors 
      });
    }
    
    // Crear la Smart Area
    const smartAreaData = {
      ...validationResult.data,
      organizationId: organization.id,
      createdById: req.user?.id || 0,
    };
    
    const smartArea = await storage.createSmartArea(smartAreaData);
    
    res.status(201).json(smartArea);
  } catch (error) {
    console.error("Error creating smart area:", error);
    res.status(500).json({ error: "Failed to create smart area" });
  }
}

/**
 * Actualiza una Smart Area existente
 */
export async function updateSmartArea(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar que la Smart Area existe
    const existingSmartArea = await storage.getSmartArea(parseInt(id));
    if (!existingSmartArea) {
      return res.status(404).json({ error: "Smart area not found" });
    }
    
    // Verificar pertenencia a la organización del usuario
    const organization = await getOrganizationFromRequest(req);
    if (!organization || existingSmartArea.organizationId !== organization.id) {
      return res.status(403).json({ error: "Not authorized to update this smart area" });
    }
    
    // Verificar permisos
    const canUpdate = await validatePermission(req, "smartAreas", "update");
    if (!canUpdate) {
      return res.status(403).json({ error: "Not authorized to update smart areas" });
    }
    
    // Validar datos de actualización
    const validationSchema = insertSmartAreaSchema.partial();
    const validationResult = validationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input data", 
        details: validationResult.error.errors 
      });
    }
    
    // Actualizar la Smart Area
    const updatedSmartArea = await storage.updateSmartArea(parseInt(id), validationResult.data);
    
    res.json(updatedSmartArea);
  } catch (error) {
    console.error("Error updating smart area:", error);
    res.status(500).json({ error: "Failed to update smart area" });
  }
}

/**
 * Elimina una Smart Area
 */
export async function deleteSmartArea(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verificar que la Smart Area existe
    const existingSmartArea = await storage.getSmartArea(parseInt(id));
    if (!existingSmartArea) {
      return res.status(404).json({ error: "Smart area not found" });
    }
    
    // Verificar pertenencia a la organización del usuario
    const organization = await getOrganizationFromRequest(req);
    if (!organization || existingSmartArea.organizationId !== organization.id) {
      return res.status(403).json({ error: "Not authorized to delete this smart area" });
    }
    
    // Verificar permisos
    const canDelete = await validatePermission(req, "smartAreas", "delete");
    if (!canDelete) {
      return res.status(403).json({ error: "Not authorized to delete smart areas" });
    }
    
    // Eliminar la Smart Area
    const result = await storage.deleteSmartArea(parseInt(id));
    
    if (result) {
      res.json({ success: true, message: "Smart area deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete smart area" });
    }
  } catch (error) {
    console.error("Error deleting smart area:", error);
    res.status(500).json({ error: "Failed to delete smart area" });
  }
}

/**
 * Obtiene las Smart Areas globales para mostrar en una página
 * Puede filtrarse por tipo de página o ID de página específica
 */
export async function getGlobalSmartAreas(req: Request, res: Response) {
  try {
    const { pageId, pageType } = req.query;
    
    // Obtener organización desde el dominio/subdominio
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    
    // Obtener todas las Smart Areas globales para esta organización
    const globalSmartAreas = await storage.getGlobalSmartAreas(organization.id, {
      pageId: typeof pageId === 'string' ? parseInt(pageId) : undefined,
      pageType: typeof pageType === 'string' ? pageType : undefined
    });
    
    res.json(globalSmartAreas);
  } catch (error) {
    console.error("Error getting global smart areas:", error);
    res.status(500).json({ error: "Failed to get global smart areas" });
  }
}