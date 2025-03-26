import { Request, Response } from 'express';
import { storage } from '../storage';
import { CustomRoleDefinition, SystemRole } from '@shared/types';
import { customRoles, insertCustomRoleSchema, rolePermissions } from '@shared/schema';
import { InsertRolePermission } from '@shared/schema';
import { z } from 'zod';

/**
 * Obtiene los roles personalizados de una organización
 */
export async function getCustomRoles(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);
    if (isNaN(organizationId)) {
      return res.status(400).json({ error: 'ID de organización inválido' });
    }

    const roles = await storage.getCustomRoles(organizationId);
    return res.status(200).json(roles);
  } catch (error) {
    console.error('Error al obtener roles personalizados:', error);
    return res.status(500).json({ error: 'Error al obtener roles personalizados' });
  }
}

/**
 * Obtiene un rol personalizado por su ID, incluyendo sus permisos
 */
export async function getCustomRole(req: Request, res: Response) {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: 'ID de rol inválido' });
    }

    const role = await storage.getFullCustomRoleDefinition(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    return res.status(200).json(role);
  } catch (error) {
    console.error('Error al obtener rol personalizado:', error);
    return res.status(500).json({ error: 'Error al obtener rol personalizado' });
  }
}

/**
 * Crea un nuevo rol personalizado
 */
export async function createCustomRole(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const roleSchema = insertCustomRoleSchema.extend({
      permissions: z.record(z.string(), z.boolean()).optional()
    });

    const validationResult = roleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: validationResult.error.format()
      });
    }

    const { permissions, ...roleData } = validationResult.data;
    
    // Verificar que el rol base sea válido
    if (!isValidSystemRole(roleData.basedOnRole)) {
      return res.status(400).json({ error: 'Rol base inválido' });
    }

    // Verificar que no exista otro rol con el mismo nombre en la organización
    const existingRole = await storage.getCustomRoleByName(roleData.organizationId, roleData.name);
    if (existingRole) {
      return res.status(409).json({ error: 'Ya existe un rol con ese nombre en la organización' });
    }

    // Crear el rol
    const role = await storage.createCustomRole({
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Si se proporcionaron permisos, añadirlos
    if (permissions && Object.keys(permissions).length > 0) {
      for (const [key, allowed] of Object.entries(permissions)) {
        const [resource, action] = key.split('.');
        if (resource && action) {
          const permissionData: InsertRolePermission = {
            roleId: role.id,
            resource,
            action,
            allowed,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await storage.addRolePermission(permissionData);
        }
      }
    }

    // Obtener el rol completo con permisos
    const fullRole = await storage.getFullCustomRoleDefinition(role.id);
    return res.status(201).json(fullRole);
  } catch (error) {
    console.error('Error al crear rol personalizado:', error);
    return res.status(500).json({ error: 'Error al crear rol personalizado' });
  }
}

/**
 * Actualiza un rol personalizado existente
 */
export async function updateCustomRole(req: Request, res: Response) {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: 'ID de rol inválido' });
    }

    // Obtener el rol existente
    const existingRole = await storage.getCustomRole(roleId);
    if (!existingRole) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Validar datos de entrada
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      basedOnRole: z.string().optional(),
      isDefault: z.boolean().optional(),
      permissions: z.record(z.string(), z.boolean()).optional()
    });

    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: validationResult.error.format()
      });
    }

    const { permissions, ...roleData } = validationResult.data;
    
    // Verificar que el rol base sea válido si se está actualizando
    if (roleData.basedOnRole && !isValidSystemRole(roleData.basedOnRole)) {
      return res.status(400).json({ error: 'Rol base inválido' });
    }

    // Verificar que no exista otro rol con el mismo nombre en la organización
    if (roleData.name && roleData.name !== existingRole.name) {
      const existingRoleWithName = await storage.getCustomRoleByName(existingRole.organizationId, roleData.name);
      if (existingRoleWithName) {
        return res.status(409).json({ error: 'Ya existe un rol con ese nombre en la organización' });
      }
    }

    // Actualizar el rol
    const updatedRole = await storage.updateCustomRole(roleId, {
      ...roleData,
      updatedAt: new Date()
    });

    // Si se proporcionaron permisos, actualizar permisos
    if (permissions && Object.keys(permissions).length > 0) {
      // Primero eliminar permisos existentes
      const currentPermissions = await storage.getRolePermissions(roleId);
      for (const permission of currentPermissions) {
        await storage.deleteRolePermission(permission.id);
      }

      // Luego añadir los nuevos permisos
      for (const [key, allowed] of Object.entries(permissions)) {
        const [resource, action] = key.split('.');
        if (resource && action) {
          const permissionData: InsertRolePermission = {
            roleId,
            resource,
            action,
            allowed,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await storage.addRolePermission(permissionData);
        }
      }
    }

    // Obtener el rol completo con permisos
    const fullRole = await storage.getFullCustomRoleDefinition(roleId);
    return res.status(200).json(fullRole);
  } catch (error) {
    console.error('Error al actualizar rol personalizado:', error);
    return res.status(500).json({ error: 'Error al actualizar rol personalizado' });
  }
}

/**
 * Elimina un rol personalizado
 */
export async function deleteCustomRole(req: Request, res: Response) {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: 'ID de rol inválido' });
    }

    // Verificar que el rol exista
    const role = await storage.getCustomRole(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Eliminar el rol (esto también eliminará sus permisos asociados debido a la implementación en storage)
    const result = await storage.deleteCustomRole(roleId);
    
    if (result) {
      return res.status(200).json({ message: 'Rol personalizado eliminado correctamente' });
    } else {
      return res.status(500).json({ error: 'Error al eliminar rol personalizado' });
    }
  } catch (error) {
    console.error('Error al eliminar rol personalizado:', error);
    return res.status(500).json({ error: 'Error al eliminar rol personalizado' });
  }
}

/**
 * Obtiene los permisos de un rol personalizado
 */
export async function getRolePermissions(req: Request, res: Response) {
  try {
    const roleId = parseInt(req.params.id);
    if (isNaN(roleId)) {
      return res.status(400).json({ error: 'ID de rol inválido' });
    }

    const permissions = await storage.getRolePermissions(roleId);
    return res.status(200).json(permissions);
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    return res.status(500).json({ error: 'Error al obtener permisos del rol' });
  }
}

/**
 * Asigna un rol personalizado a un usuario
 */
export async function assignRoleToUser(req: Request, res: Response) {
  try {
    const roleId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(roleId) || isNaN(userId)) {
      return res.status(400).json({ error: 'ID de rol o usuario inválido' });
    }

    // Verificar que el rol exista
    const role = await storage.getCustomRole(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar que el usuario exista
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar el rol del usuario
    const updatedUser = await storage.updateUser(userId, {
      role: `custom_${roleId}`,
      updatedAt: new Date()
    });

    if (updatedUser) {
      // Excluir la contraseña del usuario
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({
        message: 'Rol asignado correctamente',
        user: userWithoutPassword
      });
    } else {
      return res.status(500).json({ error: 'Error al asignar rol al usuario' });
    }
  } catch (error) {
    console.error('Error al asignar rol:', error);
    return res.status(500).json({ error: 'Error al asignar rol al usuario' });
  }
}

/**
 * Verifica si un string es un rol de sistema válido
 */
function isValidSystemRole(role: string): boolean {
  return ['superadmin', 'admin', 'editor', 'reader', 'viewer'].includes(role);
}