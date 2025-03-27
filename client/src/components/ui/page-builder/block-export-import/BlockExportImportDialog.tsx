import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Download, FileUp, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Block } from '@shared/types';

interface BlockExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockId?: string;
  pageId?: number;
  onImportSuccess?: (blockTemplate: any) => void;
}

export function BlockExportImportDialog({
  open,
  onOpenChange,
  blockId,
  pageId,
  onImportSuccess
}: BlockExportImportDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  // Estado para la exportación
  const [isExporting, setIsExporting] = useState(false);
  
  // Mutación para importar un bloque
  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
        // No especificamos Content-Type para que el navegador lo establezca automáticamente con el boundary correcto
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al importar el bloque');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Bloque importado correctamente',
        description: 'El bloque ha sido importado y está disponible en la biblioteca de bloques',
        variant: 'default',
      });
      
      if (onImportSuccess) {
        onImportSuccess(data.result);
      }
      
      // Limpiar estado y cerrar el diálogo
      setFile(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al importar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Función para manejar la exportación
  const handleExport = async () => {
    if (!blockId || !pageId) {
      toast({
        title: 'Error',
        description: 'Se requiere un ID de bloque y página para exportar',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Construimos la URL de exportación
      const exportUrl = `/api/export/block/${blockId}?pageId=${pageId}`;
      
      // Iniciamos la descarga
      window.location.href = exportUrl;
      
      toast({
        title: 'Exportación iniciada',
        description: 'La descarga del bloque comenzará en breve',
        variant: 'default',
      });
      
      // Pequeño temporizador para dar tiempo a que comience la descarga
      setTimeout(() => {
        setIsExporting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error al exportar el bloque:', error);
      toast({
        title: 'Error al exportar',
        description: 'No se pudo exportar el bloque. Inténtelo de nuevo más tarde.',
        variant: 'destructive',
      });
      setIsExporting(false);
    }
  };
  
  // Función para manejar la selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Verificar que sea un archivo ZIP
    if (!selectedFile.name.endsWith('.zip')) {
      setFileError('El archivo debe ser un archivo ZIP');
      setFile(null);
      return;
    }
    
    // Verificar tamaño (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError('El archivo es demasiado grande. El tamaño máximo es 50MB');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  // Función para manejar la importación
  const handleImport = () => {
    if (!file) {
      setFileError('Por favor, seleccione un archivo para importar');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    importMutation.mutate(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar / Importar Bloque</DialogTitle>
          <DialogDescription>
            Exporte bloques individuales como archivos ZIP para reutilizarlos o compartirlos, o importe bloques previamente exportados.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="export" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'export' | 'import')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Exporta el bloque seleccionado actualmente como un archivo ZIP que podrás importar luego o compartir con otros.
              </p>
              
              {blockId ? (
                <div className="pt-2">
                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting || !blockId}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparando descarga...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar bloque actual
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center p-3 border rounded-md bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    Selecciona un bloque para exportar
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="py-4 space-y-4">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="import-file">Archivo ZIP</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {fileError && (
                  <p className="text-sm text-red-500 mt-1">{fileError}</p>
                )}
                {file && (
                  <div className="flex items-center p-2 border rounded-md bg-green-50 border-green-200 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-green-700 truncate">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleImport} 
                disabled={!file || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar bloque
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BlockExportImportDialog;