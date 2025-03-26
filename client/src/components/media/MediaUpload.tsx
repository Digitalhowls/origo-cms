import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, ImageIcon, Film } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  allowedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFileSize = 10, // 10MB default
  multiple = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndSetFiles(files);
    }
  };

  const validateAndSetFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxFileSize * 1024 * 1024;

    for (const file of files) {
      // Check file type
      const fileType = file.type;
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(`${mainType}/`);
        }
        return type === fileType;
      });

      if (!isValidType) {
        toast({
          title: "Tipo de archivo no permitido",
          description: `${file.name} no es un tipo de archivo permitido.`,
          variant: "destructive",
        });
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        toast({
          title: "Archivo demasiado grande",
          description: `${file.name} excede el tamaño máximo de ${maxFileSize}MB.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (!multiple && validFiles.length > 1) {
      setSelectedFiles([validFiles[0]]);
    } else {
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      validateAndSetFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulating progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 100);

      const response = await apiRequest('POST', '/api/media/upload', formData);
      const uploadedMedia = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: "Archivos subidos correctamente",
        description: `${selectedFiles.length} archivos han sido subidos.`,
      });

      if (onUploadComplete) {
        onUploadComplete(uploadedMedia);
      }

      setSelectedFiles([]);
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir archivos",
        description: "Ha ocurrido un error al subir los archivos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Film className="h-6 w-6 text-purple-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <Card
        className={`border-2 border-dashed p-0 ${
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Arrastra archivos aquí</h3>
          <p className="text-gray-500 mb-4">O haz clic para seleccionar archivos</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Seleccionar archivos
          </Button>
          <div className="mt-2 text-xs text-gray-500">
            {allowedTypes.map(type => type.replace('/*', '')).join(', ')} • Máx. {maxFileSize}MB
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Archivos seleccionados ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                <div className="mr-2">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Subiendo...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <Button className="mt-4 w-full" onClick={handleUpload}>
              Subir {selectedFiles.length} {selectedFiles.length === 1 ? 'archivo' : 'archivos'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
