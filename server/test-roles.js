import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

let authToken = null;
let userId = null;
let organizationId = 1; // Suponiendo que existe una organización con ID 1
let createdRoleId = null;

async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@origo.com',
        password: 'admin123',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error de autenticación: ${response.statusText}`);
    }

    const user = await response.json();
    console.log('Usuario autenticado:', user);
    userId = user.id;
    
    // Extraer JWT token del resultado
    if (user.token) {
      authToken = user.token;
      console.log('Token obtenido de la respuesta');
    }
    
    return user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

async function createCustomRole() {
  try {
    const roleData = {
      name: 'Editor de Contenido',
      description: 'Puede editar contenido pero no publicar',
      organizationId,
      basedOnRole: 'editor',
      isDefault: false,
      permissions: {
        'page.publish': false,
        'blog.publish': false,
        'page.create': true,
        'page.update': true,
        'blog.create': true,
        'blog.update': true,
      }
    };
    
    const response = await fetch(`${API_BASE}/roles/custom`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(roleData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear rol: ${response.status} - ${errorText}`);
    }
    
    const role = await response.json();
    console.log('Rol creado:', role);
    createdRoleId = role.id;
    return role;
  } catch (error) {
    console.error('Error al crear rol personalizado:', error);
    throw error;
  }
}

async function getCustomRoles() {
  try {
    const response = await fetch(`${API_BASE}/roles/custom?organizationId=${organizationId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener roles: ${response.statusText}`);
    }
    
    const roles = await response.json();
    console.log('Roles obtenidos:', roles);
    return roles;
  } catch (error) {
    console.error('Error al obtener roles personalizados:', error);
    throw error;
  }
}

async function getCustomRole(roleId) {
  try {
    const response = await fetch(`${API_BASE}/roles/custom/${roleId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener rol: ${response.statusText}`);
    }
    
    const role = await response.json();
    console.log('Rol obtenido:', role);
    return role;
  } catch (error) {
    console.error(`Error al obtener rol personalizado ${roleId}:`, error);
    throw error;
  }
}

async function updateCustomRole(roleId) {
  try {
    const updateData = {
      name: 'Editor de Contenido (actualizado)',
      description: 'Rol actualizado para pruebas',
      permissions: {
        'page.publish': true,
        'blog.publish': false,
      }
    };
    
    const response = await fetch(`${API_BASE}/roles/custom/${roleId}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar rol: ${response.statusText}`);
    }
    
    const role = await response.json();
    console.log('Rol actualizado:', role);
    return role;
  } catch (error) {
    console.error(`Error al actualizar rol personalizado ${roleId}:`, error);
    throw error;
  }
}

async function assignRoleToUser(userId, roleId) {
  try {
    const response = await fetch(`${API_BASE}/roles/assign`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ userId, roleId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error al asignar rol: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Rol asignado:', result);
    return result;
  } catch (error) {
    console.error(`Error al asignar rol ${roleId} al usuario ${userId}:`, error);
    throw error;
  }
}

async function deleteCustomRole(roleId) {
  try {
    const response = await fetch(`${API_BASE}/roles/custom/${roleId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar rol: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Rol eliminado:', result);
    return result;
  } catch (error) {
    console.error(`Error al eliminar rol personalizado ${roleId}:`, error);
    throw error;
  }
}

async function runTest() {
  try {
    // Login
    await login();
    
    // Crear un rol personalizado
    const newRole = await createCustomRole();
    
    // Obtener todos los roles
    await getCustomRoles();
    
    // Obtener un rol específico
    await getCustomRole(createdRoleId);
    
    // Actualizar un rol
    await updateCustomRole(createdRoleId);
    
    // Asignar rol a un usuario (usamos el mismo usuario autenticado para pruebas)
    await assignRoleToUser(userId, createdRoleId);
    
    // Eliminar rol (comentado para evitar eliminar el rol si se quiere seguir probando)
    // await deleteCustomRole(createdRoleId);
    
    console.log('Pruebas completadas con éxito');
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

runTest();