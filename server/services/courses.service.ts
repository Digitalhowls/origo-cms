import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertCourseSchema } from '@shared/schema';
import { z } from 'zod';

// Get courses list
export async function getCourses(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'all';
    const visibility = req.query.visibility as string || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const result = await storage.getCourses(organizationId, { 
      search, 
      status, 
      visibility, 
      page, 
      pageSize 
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ message: 'Error al obtener cursos' });
  }
}

// Get a single course
export async function getCourse(req: Request, res: Response) {
  try {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verify organization access
    if (course.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este curso' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ message: 'Error al obtener el curso' });
  }
}

// Create a new course
export async function createCourse(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const validationResult = insertCourseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos del curso inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // Add organization and user info
    const courseData = {
      ...validationResult.data,
      organizationId: user.organizationId,
      createdById: user.id
    };
    
    const newCourse = await storage.createCourse(courseData);
    
    // If modules are provided, create them
    // Not implemented here for simplicity
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error al crear el curso' });
  }
}

// Update a course
export async function updateCourse(req: Request, res: Response) {
  try {
    const courseId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the course exists
    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verify organization access
    if (course.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este curso' });
    }
    
    // Create a schema for update that makes all fields optional
    const updateCourseSchema = insertCourseSchema.partial();
    const validationResult = updateCourseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos de actualización inválidos',
        errors: validationResult.error.errors
      });
    }
    
    // If the status is being changed to 'published' and publishedAt is not set,
    // set it to the current date
    const updateData = { ...validationResult.data };
    if (updateData.status === 'published' && !updateData.publishedAt && course.status !== 'published') {
      updateData.publishedAt = new Date();
    }
    
    const updatedCourse = await storage.updateCourse(courseId, updateData);
    
    // Update modules and lessons if provided
    // Not implemented here for simplicity
    
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error al actualizar el curso' });
  }
}

// Delete a course
export async function deleteCourse(req: Request, res: Response) {
  try {
    const courseId = parseInt(req.params.id);
    
    // Check if the course exists
    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verify organization access
    if (course.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este curso' });
    }
    
    await storage.deleteCourse(courseId);
    
    res.json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error al eliminar el curso' });
  }
}

// Duplicate a course
export async function duplicateCourse(req: Request, res: Response) {
  try {
    const courseId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Check if the course exists
    const course = await storage.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verify organization access
    if (course.organizationId !== user.organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este curso' });
    }
    
    // Create a copy with modified title, slug, and status
    const newCourse = {
      ...course,
      title: `${course.title} (Copia)`,
      slug: `${course.slug}-copia-${Date.now().toString().substr(-6)}`,
      status: 'draft',
      createdById: user.id,
      publishedAt: null
    };
    
    // Remove ID and modules to create a new record
    delete newCourse.id;
    delete newCourse.modules;
    
    const duplicatedCourse = await storage.createCourse(newCourse);
    
    // Duplicate modules and lessons
    // Not implemented here for simplicity
    
    res.status(201).json(duplicatedCourse);
  } catch (error) {
    console.error('Error duplicating course:', error);
    res.status(500).json({ message: 'Error al duplicar el curso' });
  }
}
