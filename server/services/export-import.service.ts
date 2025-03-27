/**
 * Servicio para exportar e importar bloques y plantillas
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import * as fs from "fs";
import archiver from "archiver";
import * as path from "path";
import * as os from "os";
//import { extract } from "node:tar";
import multer from "multer";
import { getOrganizationFromRequest } from "../middleware/organization";
import { validatePermission } from "../middleware/permissions";
import { BlockTemplate, SmartArea, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Configuración para el almacenamiento temporal de archivos subidos
const upload = multer({ 
  dest: os.tmpdir(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
});

// Middleware para manejar la subida de archivos
export const uploadZipMiddleware = upload.single('file');

/**
 * Exporta un bloque o plantilla a un archivo ZIP
 */
export async function exportTemplate(req: Request, res: Response) {
  try {
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verificar permisos
    const canExport = await validatePermission(req, "templates", "read");
    if (!canExport) {
      return res.status(403).json({ error: "Not authorized to export templates" });
    }

    const { id, type } = req.params;
    
    // Validar que se ha especificado un tipo válido
    if (type !== 'template' && type !== 'smartarea' && type !== 'block') {
      return res.status(400).json({ error: "Invalid export type. Use 'template', 'smartarea', or 'block'" });
    }
    
    // Obtener el template, smartarea o bloque individual
    let item: BlockTemplate | SmartArea | any;
    if (type === 'template') {
      item = await storage.getBlockTemplate(parseInt(id));
    } else if (type === 'smartarea') {
      item = await storage.getSmartArea(parseInt(id));
    } else if (type === 'block') {
      // Para bloques individuales, necesitamos obtener la página y extraer el bloque específico
      const pageId = req.query.pageId ? parseInt(req.query.pageId as string) : undefined;
      if (!pageId) {
        return res.status(400).json({ error: "pageId query parameter is required for block export" });
      }
      
      const page = await storage.getPage(pageId);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      // Verificar que la página pertenezca a la organización
      if (page.organizationId !== organization.id) {
        return res.status(403).json({ error: "Not authorized to access this page" });
      }
      
      // Obtenemos el contenido de la página y convertimos a objeto para acceder a los bloques
      const pageContent = typeof page.content === 'string' 
        ? JSON.parse(page.content) 
        : page.content;
        
      // Encontrar el bloque específico por su ID
      const block = pageContent.blocks?.find((b: any) => b.id === id);
      if (!block) {
        return res.status(404).json({ error: "Block not found in the specified page" });
      }
      
      // Crear un objeto similar a BlockTemplate/SmartArea para mantener consistencia
      item = {
        name: block.type + '-' + id.substring(0, 8),
        description: `Block exported from page "${page.title}"`,
        organizationId: organization.id,
        block: block,
        content: block, // Para mantener la consistencia con el código posterior
        category: 'exported-block'
      };
    }
    
    if (!item) {
      return res.status(404).json({ error: type === 'template' ? "Template not found" : "Smart area not found" });
    }
    
    // Verificar que pertenezca a la organización
    if (item.organizationId !== organization.id) {
      return res.status(403).json({ error: "Not authorized to access this resource" });
    }
    
    // Crear un objeto para el contenido del archivo JSON
    const exportData = {
      type: type,
      name: item.name,
      description: item.description,
      createdAt: new Date().toISOString(),
      category: type === 'template' ? (item as BlockTemplate).category : undefined,
      content: type === 'smartarea' ? (item as SmartArea).content : (item as BlockTemplate).block,
      resourceUrls: extractResourceUrls(type === 'smartarea' ? (item as SmartArea).content : (item as BlockTemplate).block)
    };
    
    // Crear un directorio temporal para los archivos
    const tempDir = path.join(os.tmpdir(), `origo-export-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });
    
    // Guardar el archivo JSON principal
    const jsonFilePath = path.join(tempDir, 'data.json');
    await fs.promises.writeFile(jsonFilePath, JSON.stringify(exportData, null, 2));
    
    // Guardar los recursos (imágenes, etc.)
    const resourcesDir = path.join(tempDir, 'resources');
    await fs.promises.mkdir(resourcesDir, { recursive: true });
    
    // TODO: Si se necesita exportar recursos adicionales (archivos, imágenes), añadirlos aquí
    
    // Crear el archivo ZIP
    const zipFileName = `${type}-${item.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.zip`;
    const zipFilePath = path.join(os.tmpdir(), zipFileName);
    
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nivel de compresión máximo
    });
    
    // Escuchar eventos de finalización y error
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
    });
    
    // Adjuntar el archivo de salida al archivo
    archive.pipe(output);
    
    // Añadir archivos al ZIP
    archive.file(jsonFilePath, { name: 'data.json' });
    archive.directory(resourcesDir, 'resources');
    
    // Finalizar el archivo
    await archive.finalize();
    await archivePromise;
    
    // Enviar el archivo como descarga
    res.download(zipFilePath, zipFileName, async (err) => {
      // Limpiar archivos temporales después de la descarga
      try {
        if (fs.existsSync(tempDir)) {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
        if (fs.existsSync(zipFilePath)) {
          await fs.promises.unlink(zipFilePath);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up temp files:", cleanupError);
      }
    });
  } catch (error) {
    console.error("Error exporting template:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Importa un bloque o plantilla desde un archivo ZIP
 */
export async function importTemplate(req: Request, res: Response) {
  try {
    const organization = await getOrganizationFromRequest(req);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verificar permisos
    const canImport = await validatePermission(req, "templates", "create");
    if (!canImport) {
      return res.status(403).json({ error: "Not authorized to import templates" });
    }

    // Verificar que se ha subido un archivo
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const zipFilePath = req.file.path;
    
    // Crear un directorio temporal para extraer el contenido
    const extractDir = path.join(os.tmpdir(), `origo-import-${Date.now()}`);
    await fs.promises.mkdir(extractDir, { recursive: true });
    
    // Extraer el archivo ZIP
    try {
      await extractZip(zipFilePath, extractDir);
    } catch (error) {
      console.error("Error extracting ZIP file:", error);
      return res.status(400).json({ error: "Invalid ZIP file format" });
    }
    
    // Cargar y validar el archivo JSON de datos
    const jsonFilePath = path.join(extractDir, 'data.json');
    if (!await fileExists(jsonFilePath)) {
      return res.status(400).json({ error: "Invalid export file: missing data.json" });
    }
    
    // Leer el archivo JSON
    const jsonContent = await fs.promises.readFile(jsonFilePath, 'utf8');
    let importData;
    try {
      importData = JSON.parse(jsonContent);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON data in the export file" });
    }
    
    // Validar el contenido
    if (!importData.type || !importData.name || !importData.content) {
      return res.status(400).json({ error: "Missing required data in export file" });
    }
    
    // Crear el template, smart area o bloque según el tipo
    let result;
    if (importData.type === 'template') {
      // Crear block template
      result = await storage.createBlockTemplate({
        name: importData.name,
        block: importData.content,
        preview: null, // Si hay previsualización, habría que procesarla
        description: importData.description || null,
        organizationId: organization.id,
        createdById: req.user?.id || 0,
        category: importData.category || 'imported',
        tags: []
      });
    } else if (importData.type === 'smartarea') {
      // Crear smart area
      result = await storage.createSmartArea({
        name: importData.name,
        content: importData.content,
        type: 'header', // Por defecto, podría ser personalizable
        description: importData.description || null,
        organizationId: organization.id,
        createdById: req.user?.id || 0,
        status: 'draft',
        isGlobal: false,
        displayConditions: null
      });
    } else if (importData.type === 'block') {
      // Para bloques individuales, guardamos como template pero con una categoría especial
      result = await storage.createBlockTemplate({
        name: importData.name,
        block: importData.content,
        preview: null,
        description: importData.description || 'Bloque importado',
        organizationId: organization.id,
        createdById: req.user?.id || 0,
        category: 'imported-block',
        tags: []
      });
    } else {
      return res.status(400).json({ error: "Invalid import type" });
    }
    
    // Limpiar archivos temporales
    try {
      if (fs.existsSync(extractDir)) {
        await fs.promises.rm(extractDir, { recursive: true, force: true });
      }
      if (fs.existsSync(zipFilePath)) {
        await fs.promises.unlink(zipFilePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
    
    return res.status(201).json({ 
      message: "Import successful",
      result 
    });
  } catch (error) {
    console.error("Error importing template:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Función auxiliar para verificar si un archivo existe
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrae las URLs de recursos (imágenes, vídeos, etc.) de un objeto de contenido
 */
function extractResourceUrls(content: any): string[] {
  const urls: Set<string> = new Set();
  
  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (typeof obj === 'object') {
      // Buscar propiedades que puedan contener URLs
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          // Verificar si la propiedad parece ser una URL de recurso
          if (
            key.includes('image') || 
            key.includes('background') || 
            key.includes('src') || 
            key.includes('url') || 
            key.includes('media')
          ) {
            const value = obj[key];
            if (value.startsWith('http') || value.startsWith('/')) {
              urls.add(value);
            }
          }
        } else if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
          traverse(obj[key]);
        }
      }
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        traverse(item);
      }
    }
  }
  
  traverse(content);
  return Array.from(urls);
}

/**
 * Extrae el ID de un recurso desde su URL
 */
function extractResourceIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  // Ejemplo: extraer ID de URLs como /api/media/123 o https://ejemplo.com/media/123
  const matches = url.match(/\/media\/(\d+)/);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  return null;
}

/**
 * Función auxiliar para extraer archivos ZIP
 */
async function extractZip(zipPath: string, destPath: string): Promise<void> {
  // Importamos la biblioteca de forma dinámica para evitar problemas de dependencias
  const extract = require('extract-zip');
  
  try {
    await extract(zipPath, { dir: destPath });
  } catch (error: any) {
    console.error('Error extracting ZIP file:', error);
    throw new Error(`Failed to extract ZIP file: ${error.message || 'Unknown error'}`);
  }
}