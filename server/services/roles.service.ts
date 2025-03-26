import { Request, Response } from 'express';
import { storage } from '../storage';
import { CustomRoleDefinition, SystemRole, isSystemRole } from '@shared/types';
import { eq } from 'drizzle-orm';
import { customRoles, rolePermissions, users, CustomRole } from '@shared/schema';

/**
 * Obtiene los roles personalizados de una organización
 */
export async function getCustomRoles(req: Request, res: Response) {
  try {
    const organizationId = req.query.organizationId as string;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Se requiere el ID de la organización' });
    }
    
    const roles = await storage.getCustomRoles(Number(organizationId));
    
    return res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles personalizados:', error);
    return res.status(500).json({ message: 'Error al obtener roles personalizados' });
  }
}

/**
 * Obtiene un rol personalizado por su ID, incluyendo sus permisos
 */
export async function getCustomRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Se requiere el ID del rol' });
    }
    
    const role = await storage.getFullCustomRoleDefinition(Number(id));
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    return res.json(role);
  } catch (error) {
    console.error('Error al obtener rol personalizado:', error);
    return res.status(500).json({ message: 'Error al obtener rol personalizado' });
  }
}

/**
 * Crea un nuevo rol personalizado
 */
export async function createCustomRole(req: Request, res: Response) {
  try {
    const { name, description, organizationId, basedOnRole, isDefault, permissions } = req.body;
    
    if (!name || !organizationId || !basedOnRole) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    
    // Validar que el rol base sea válido
    if (!isSystemRole(basedOnRole)) {
      return res.status(400).json({ message: 'Rol base inválido' });
    }
    
    // Verificar si ya existe un rol con el mismo nombre en la organización
    const existingRole = await storage.getCustomRoleByName(organizationId, name);
    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre en la organización' });
    }
    
    // Crear el rol personalizado
    const role = await storage.createCustomRole({
      name,
      description: description || null,
      organizationId,
      basedOnRole,
      isDefault: isDefault || false,
      createdById: req.user?.id || null
    });
    
    // Si se proporcionaron permisos específicos, crearlos
    if (permissions && Object.keys(permissions).length > 0) {
      for (const [key, allowedValue] of Object.entries(permissions)) {
        const [resource, action] = key.split('.');
        const allowed = Boolean(allowedValue);
        
        await storage.addRolePermission({
          roleId: role.id,
          resource,
          action,
          allowed
        });
      }
    }
    
    // Obtener la definición completa del rol para devolver
    const fullRole = await storage.getFullCustomRoleDefinition(role.id);
    
    return res.status(201).json(fullRole);
  } catch (error) {
    console.error('Error al crear rol personalizado:', error);
    return res.status(500).json({ message: 'Error al crear rol personalizado' });
  }
}

/**
 * Actualiza un rol personalizado existente
 */
export async function updateCustomRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, basedOnRole, isDefault, permissions } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Se requiere el ID del rol' });
    }
    
    // Verificar que el rol exista
    const existingRole = await storage.getCustomRole(Number(id));
    if (!existingRole) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Validar que el rol base sea válido si se proporciona
    if (basedOnRole && !isSystemRole(basedOnRole)) {
      return res.status(400).json({ message: 'Rol base inválido' });
    }
    
    // Si se cambia el nombre, verificar que no exista otro rol con ese nombre
    if (name && name !== existingRole.name) {
      const roleWithName = await storage.getCustomRoleByName(existingRole.organizationId, name);
      if (roleWithName && roleWithName.id !== Number(id)) {
        return res.status(400).json({ message: 'Ya existe un rol con ese nombre en la organización' });
      }
    }
    
    // Actualizar los datos básicos del rol
    const updatedRoleData: Partial<CustomRole> = {};
    if (name) updatedRoleData.name = name;
    if (description !== undefined) updatedRoleData.description = description;
    if (basedOnRole) updatedRoleData.basedOnRole = basedOnRole;
    if (isDefault !== undefined) updatedRoleData.isDefault = isDefault;
    
    // Actualizar el rol
    await storage.updateCustomRole(Number(id), updatedRoleData);
    
    // Si se proporcionaron permisos, actualizar
    if (permissions && Object.keys(permissions).length > 0) {
      // Obtener los permisos actuales del rol
      const currentPermissions = await storage.getRolePermissions(Number(id));
      const currentPermissionsMap = new Map(
        currentPermissions.map(p => [`${p.resource}.${p.action}`, p])
      );
      
      // Procesar cada permiso nuevo o actualizado
      for (const [key, allowedValue] of Object.entries(permissions)) {
        const [resource, action] = key.split('.');
        const allowed = Boolean(allowedValue);
        const existingPermission = currentPermissionsMap.get(key);
        
        if (existingPermission) {
          // Actualizar permiso existente
          if (existingPermission.allowed !== allowed) {
            await storage.updateRolePermission(existingPermission.id, { allowed });
          }
        } else {
          // Crear nuevo permiso
          await storage.addRolePermission({
            roleId: Number(id),
            resource,
            action,
            allowed
          });
        }
      }
    }
    
    // Obtener la definición completa actualizada
    const fullRole = await storage.getFullCustomRoleDefinition(Number(id));
    
    return res.json(fullRole);
  } catch (error) {
    console.error('Error al actualizar rol personalizado:', error);
    return res.status(500).json({ message: 'Error al actualizar rol personalizado' });
  }
}

/**
 * Elimina un rol personalizado
 */
export async function deleteCustomRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Se requiere el ID del rol' });
    }
    
    // Verificar que el rol exista
    const existingRole = await storage.getCustomRole(Number(id));
    if (!existingRole) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Verificar si hay usuarios con este rol asignado
    const usersWithRole = await storage.getUsers({ role: `custom:${id}` });
    if (usersWithRole.totalItems > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el rol porque hay usuarios que lo tienen asignado',
        usersCount: usersWithRole.totalItems
      });
    }
    
    // Eliminar el rol
    await storage.deleteCustomRole(Number(id));
    
    return res.status(200).json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol personalizado:', error);
    return res.status(500).json({ message: 'Error al eliminar rol personalizado' });
  }
}

/**
 * Obtiene los permisos de un rol personalizado
 */
export async function getRolePermissions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Se requiere el ID del rol' });
    }
    
    const permissions = await storage.getRolePermissions(Number(id));
    
    return res.json(permissions);
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    return res.status(500).json({ message: 'Error al obtener permisos del rol' });
  }
}

/**
 * Asigna un rol personalizado a un usuario
 */
export async function assignRoleToUser(req: Request, res: Response) {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ message: 'Se requieren el ID del usuario y el ID del rol' });
    }
    
    // Verificar que el usuario exista
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el rol exista
    const role = await storage.getCustomRole(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Rol personalizado no encontrado' });
    }
    
    // Actualizar el rol del usuario
    const updatedUser = await storage.updateUser(userId, { role: `custom:${roleId}` });
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error al asignar rol al usuario:', error);
    return res.status(500).json({ message: 'Error al asignar rol al usuario' });
  }
}

/**
 * Verifica si un string es un rol de sistema válido
 */
function isValidSystemRole(role: string): boolean {
  return ['superadmin', 'admin', 'editor', 'reader', 'viewer'].includes(role);
}