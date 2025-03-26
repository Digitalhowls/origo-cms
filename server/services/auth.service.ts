import { Request, Response } from 'express';
import { storage } from '../storage';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { users, insertUserSchema, apiKeys, organizations } from '@shared/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { sendInvitationEmail, createTestAccount } from './email.service';

// Validate user credentials
export async function validateUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // Compare passwords
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Get users list
export async function getUsers(req: Request, res: Response) {
  try {
    const search = req.query.search as string || '';
    const role = req.query.role as string || 'all';
    
    const result = await storage.getUsers({ search, role });
    
    // Remove passwords from user objects
    const users = result.items.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      items: users,
      totalItems: result.totalItems
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

// Invite a new user
export async function inviteUser(req: Request, res: Response) {
  try {
    const inviteSchema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      role: z.string(),
    });
    
    const validationResult = inviteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos de invitación inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { email, name, role } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Obtener información del usuario que envía la invitación y su organización
    const currentUser = req.user as any;
    const organization = await storage.getOrganization(currentUser.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create the new user
    const newUser = await storage.createUser({
      email,
      name,
      username: email,
      password: hashedPassword,
      role,
      organizationId: currentUser.organizationId,
    });
    
    // Enviar correo electrónico de invitación
    try {
      // En desarrollo, podemos crear una cuenta de prueba de Ethereal para capturar los correos
      let testAccount;
      if (process.env.NODE_ENV !== 'production' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
        testAccount = await createTestAccount();
      }
      
      await sendInvitationEmail({
        name,
        email,
        tempPassword,
        inviterName: currentUser.name || 'Un administrador',
        organizationName: organization.name,
      });
      
      console.log(`Invitación enviada a ${email} con contraseña temporal: ${tempPassword}`);
      
      // Remove password from response
      const { password, ...userResponse } = newUser;
      
      res.status(201).json({
        user: userResponse,
        message: 'Invitación enviada correctamente',
        // Solo en desarrollo mostramos la contraseña temporal para pruebas
        ...(process.env.NODE_ENV !== 'production' && { tempPassword }),
      });
    } catch (emailError) {
      console.error('Error al enviar el correo de invitación:', emailError);
      
      // Si hay un error al enviar el correo, eliminamos el usuario creado
      await storage.deleteUser(newUser.id);
      
      return res.status(500).json({ 
        message: 'Error al enviar la invitación por correo electrónico',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Error al invitar usuario' });
  }
}

// Update a user
export async function updateUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if the user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Check if the current user has permission to update this user
    const currentUser = req.user as any;
    if (currentUser.id !== userId && currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
    }
    
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      role: z.string().optional(),
    });
    
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos de actualización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Update the user
    const updatedUser = await storage.updateUser(userId, validationResult.data);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Remove password from response
    const { password, ...userResponse } = updatedUser;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
}

// Delete a user
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if the user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Check if the current user has permission to delete this user
    const currentUser = req.user as any;
    if (currentUser.id === userId) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios' });
    }
    
    // Delete the user
    await storage.deleteUser(userId);
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
}

// API Key management
export async function getApiKeys(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const keys = await storage.getApiKeys(organizationId);
    
    res.json(keys);
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ message: 'Error al obtener claves API' });
  }
}

export async function createApiKey(req: Request, res: Response) {
  try {
    const schema = z.object({
      name: z.string().min(2),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { name } = validationResult.data;
    const user = req.user as any;
    
    const apiKey = await storage.createApiKey({
      name,
      organizationId: user.organizationId,
      createdById: user.id
    });
    
    res.status(201).json(apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Error al crear clave API' });
  }
}

export async function deleteApiKey(req: Request, res: Response) {
  try {
    const keyId = parseInt(req.params.id);
    await storage.deleteApiKey(keyId);
    
    res.json({ message: 'Clave API eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ message: 'Error al eliminar clave API' });
  }
}

// Initial setup function to create admin user and organization
// Password Reset functionality
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const schema = z.object({
      email: z.string().email()
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Email inválido',
        errors: validationResult.error.errors
      });
    }
    
    const { email } = validationResult.data;
    
    // Find the user by email
    const user = await storage.getUserByEmail(email);
    
    // If no user found, still return success message for security
    if (!user) {
      return res.json({ 
        message: 'Si existe una cuenta con ese email, se ha enviado un enlace para restablecer la contraseña.'
      });
    }
    
    // Generate password reset token
    const passwordResetToken = await storage.createPasswordResetToken(user.id);
    
    // In a real application, you would send an email with the reset link:
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${passwordResetToken.token}`;
    
    // For development purposes, log the token to the console
    console.log(`Token de restablecimiento generado para ${user.email}: ${passwordResetToken.token}`);
    
    res.json({ 
      message: 'Si existe una cuenta con ese email, se ha enviado un enlace para restablecer la contraseña.',
      // Include token in response for testing purposes only - in production this should be removed
      token: passwordResetToken.token
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error al solicitar restablecimiento de contraseña' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const schema = z.object({
      token: z.string(),
      password: z.string().min(6)
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos para restablecer contraseña',
        errors: validationResult.error.errors
      });
    }
    
    const { token, password } = validationResult.data;
    
    // Get the token from the database
    const passwordResetToken = await storage.getPasswordResetTokenByToken(token);
    
    // Check if token exists and is valid
    if (!passwordResetToken) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    
    // Check if token is already used
    if (passwordResetToken.usedAt) {
      return res.status(400).json({ message: 'Este token ya ha sido utilizado' });
    }
    
    // Check if token is expired (1 hour)
    const now = new Date();
    if (now > new Date(passwordResetToken.expiresAt)) {
      return res.status(400).json({ message: 'El token ha expirado' });
    }
    
    // Get the user
    const user = await storage.getUser(passwordResetToken.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    await storage.updateUser(user.id, { password: hashedPassword });
    
    // Mark the token as used
    await storage.markTokenAsUsed(passwordResetToken.id);
    
    res.json({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
}

export async function setupAdmin(req: Request, res: Response) {
  try {
    // Check if there are any users already
    const existingUsers = await storage.getUsers({});
    if (existingUsers.totalItems > 0) {
      return res.status(400).json({ 
        message: 'Ya existe al menos un usuario en el sistema',
        totalUsers: existingUsers.totalItems
      });
    }
    
    // Validate input
    const setupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      organizationName: z.string().min(2)
    });
    
    const validationResult = setupSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Datos de configuración inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const { email, password, name, organizationName } = validationResult.data;
    
    // 1. Create organization
    const [organization] = await db.insert(organizations).values({
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
      plan: 'free',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Create admin user
    const userData = {
      email,
      name,
      username: email,
      password: hashedPassword,
      role: 'superadmin',
      organizationId: organization.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newUser = await storage.createUser(userData);
    
    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      user: userResponse,
      organization,
      message: 'Configuración inicial completada. Ahora puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    res.status(500).json({ message: 'Error en la configuración inicial' });
  }
}
