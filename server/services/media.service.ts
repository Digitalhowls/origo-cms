import { Request, Response } from 'express';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { insertMediaSchema } from '@shared/schema';
import { z } from 'zod';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Get media files
export async function getMediaFiles(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any).organizationId;
    const search = req.query.search as string || '';
    const type = req.query.type as string || 'all';
    const folder = req.query.folder as string || 'all';
    
    const result = await storage.getMediaFiles(organizationId, { search, type, folder });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting media files:', error);
    res.status(500).json({ message: 'Error al obtener archivos multimedia' });
  }
}

// Upload media
export async function uploadMedia(req: Request, res: Response) {
  try {
    // Use multer to handle the file upload
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No se han proporcionado archivos' });
      }
      
      const uploadedFiles = [];
      const user = req.user as any;
      
      for (const file of files) {
        // In a real app, you would upload this to a storage service like S3, Cloudinary, etc.
        // For this implementation, we'll simulate storing metadata
        
        // Generate a unique filename
        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
        
        // Detect file type
        let fileType = file.mimetype;
        if (file.buffer) {
          const detectedType = await fileTypeFromBuffer(file.buffer);
          if (detectedType) {
            fileType = detectedType.mime;
          }
        }
        
        // Determine the file type category
        let fileTypeCategory = 'document';
        if (fileType.startsWith('image/')) {
          fileTypeCategory = 'image';
        } else if (fileType.startsWith('video/')) {
          fileTypeCategory = 'video';
        }
        
        // Simulate a URL (in a real app, this would be the URL from the storage service)
        // For images, let's generate a placeholder URL
        const url = `https://api.origo.app/media/${fileName}`;
        
        // For images, generate a thumbnail URL
        let thumbnailUrl = null;
        if (fileTypeCategory === 'image') {
          thumbnailUrl = `https://api.origo.app/media/thumbnails/${fileName}`;
        }
        
        // Create media entry
        const mediaData = {
          name: path.basename(file.originalname, fileExtension),
          fileName,
          fileType: fileTypeCategory,
          mimeType: fileType,
          size: file.size,
          url,
          thumbnailUrl,
          folder: req.body.folder || '',
          organizationId: user.organizationId,
          uploadedById: user.id,
        };
        
        const newMedia = await storage.createMedia(mediaData);
        uploadedFiles.push(newMedia);
      }
      
      res.status(201).json(uploadedFiles);
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Error al subir archivos multimedia' });
  }
}

// Delete media
export async function deleteMedia(req: Request, res: Response) {
  try {
    const mediaId = parseInt(req.params.id);
    
    // Check if the media exists
    const mediaItem = await storage.getMedia(mediaId);
    if (!mediaItem) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    // Verify organization access
    if (mediaItem.organizationId !== (req.user as any).organizationId) {
      return res.status(403).json({ message: 'No tienes acceso a este archivo' });
    }
    
    // In a real app, you would delete the file from the storage service here
    
    // Delete the media record
    await storage.deleteMedia(mediaId);
    
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Error al eliminar el archivo' });
  }
}
