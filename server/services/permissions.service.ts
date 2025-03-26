import { Request, Response } from 'express';
import { storage } from '../storage';
import { Resource, Action } from '@shared/types';
import { insertUserPermissionSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Obtiene los permisos de un usuario específico
 */
export async function getUserPermissions(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar permiso para ver permisos
    const canViewPermissions = await storage.hasPermission(
      req.user!.id,
      Resource.USER,
      Action.MANAGE
    );

    if (!canViewPermissions && req.user!.id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver los permisos de este usuario' });
    }

    const permissions = await storage.getUserPermissions(userId);
    res.json(permissions);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ error: 'Error al obtener los permisos del usuario' });
  }
}

/**
 * Añade un nuevo permiso específico a un usuario
 */
export async function addUserPermission(req: Request, res: Response) {
  try {
    // Verificar permiso para gestionar permisos
    const canManagePermissions = await storage.hasPermission(
      req.user!.id,
      Resource.USER,
      Action.MANAGE
    );

    if (!canManagePermissions) {
      return res.status(403).json({ error: 'No tienes permiso para gestionar permisos' });
    }

    // Validar datos de entrada
    const permissionData = insertUserPermissionSchema.parse(req.body);
    
    // Añadir el permiso
    const newPermission = await storage.addUserPermission(permissionData);
    res.status(201).json(newPermission);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    console.error('Error al añadir permiso:', error);
    res.status(500).json({ error: 'Error al añadir el permiso al usuario' });
  }
}

/**
 * Actualiza un permiso existente
 */
export async function updateUserPermission(req: Request, res: Response) {
  try {
    const permissionId = parseInt(req.params.id);
    if (isNaN(permissionId)) {
      return res.status(400).json({ error: 'ID de permiso inválido' });
    }

    // Verificar permiso para gestionar permisos
    const canManagePermissions = await storage.hasPermission(
      req.user!.id,
      Resource.USER,
      Action.MANAGE
    );

    if (!canManagePermissions) {
      return res.status(403).json({ error: 'No tienes permiso para gestionar permisos' });
    }

    // Validar datos de entrada
    const { allowed } = req.body;
    if (typeof allowed !== 'boolean') {
      return res.status(400).json({ error: 'El valor "allowed" debe ser un booleano' });
    }

    // Actualizar el permiso
    const updatedPermission = await storage.updateUserPermission(permissionId, { allowed });
    
    if (!updatedPermission) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    
    res.json(updatedPermission);
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    res.status(500).json({ error: 'Error al actualizar el permiso' });
  }
}

/**
 * Elimina un permiso específico
 */
export async function deleteUserPermission(req: Request, res: Response) {
  try {
    const permissionId = parseInt(req.params.id);
    if (isNaN(permissionId)) {
      return res.status(400).json({ error: 'ID de permiso inválido' });
    }

    // Verificar permiso para gestionar permisos
    const canManagePermissions = await storage.hasPermission(
      req.user!.id,
      Resource.USER,
      Action.MANAGE
    );

    if (!canManagePermissions) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar permisos' });
    }

    // Eliminar el permiso
    const success = await storage.deleteUserPermission(permissionId);
    
    if (!success) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    res.status(500).json({ error: 'Error al eliminar el permiso' });
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function checkPermission(req: Request, res: Response) {
  try {
    const { userId, resource, action } = req.params;
    
    if (!userId || !resource || !action) {
      return res.status(400).json({ error: 'Se requieren userId, resource y action' });
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Solo los administradores o el propio usuario pueden verificar sus permisos
    if (req.user!.id !== userIdNum && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ error: 'No tienes permiso para verificar los permisos de este usuario' });
    }

    const hasPermission = await storage.hasPermission(userIdNum, resource, action);
    res.json({ hasPermission });
  } catch (error) {
    console.error('Error al verificar permiso:', error);
    res.status(500).json({ error: 'Error al verificar el permiso' });
  }
}