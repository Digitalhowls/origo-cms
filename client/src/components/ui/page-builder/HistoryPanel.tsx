import React, { useState, useEffect } from 'react';
import { HistoryEntry, HistoryActionType } from '@shared/types';
import { historyService } from '@/lib/history-service';
import { usePageStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  History,
  Undo2,
  Redo2,
  Save,
  Clock,
  Star,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  Search,
  Plus,
  Calendar,
  ListFilter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryItemProps {
  entry: HistoryEntry;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const getHistoryTypeIcon = (type: HistoryActionType) => {
  switch (type) {
    case HistoryActionType.ADD_BLOCK:
      return <Plus className="h-4 w-4 mr-2 text-green-500" />;
    case HistoryActionType.REMOVE_BLOCK:
      return <Trash2 className="h-4 w-4 mr-2 text-red-500" />;
    case HistoryActionType.UPDATE_BLOCK:
      return <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />;
    case HistoryActionType.MOVE_BLOCK:
      return <ListFilter className="h-4 w-4 mr-2 text-amber-500" />;
    case HistoryActionType.UPDATE_PAGE_META:
      return <FileText className="h-4 w-4 mr-2 text-purple-500" />;
    case HistoryActionType.SAVED_SNAPSHOT:
      return <Star className="h-4 w-4 mr-2 text-yellow-500" />;
    case HistoryActionType.AUTO_SAVED:
      return <Clock className="h-4 w-4 mr-2 text-teal-500" />;
    case HistoryActionType.IMPORTED:
      return <RefreshCw className="h-4 w-4 mr-2 text-indigo-500" />;
    case HistoryActionType.INITIAL:
    default:
      return <History className="h-4 w-4 mr-2 text-gray-500" />;
  }
};

const HistoryItem: React.FC<HistoryItemProps> = ({
  entry,
  isActive,
  onClick,
  onDelete,
  showDelete = false
}) => {
  const formattedDate = format(parseISO(entry.timestamp), 'dd MMM yyyy, HH:mm:ss', { locale: es });
  
  return (
    <div 
      className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer hover:bg-gray-100 ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {getHistoryTypeIcon(entry.type)}
        <div className="ml-2">
          <h4 className="text-sm font-medium">{entry.label}</h4>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-7 w-7 p-0"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </Button>
      )}
    </div>
  );
};

interface HistoryPanelProps {
  pageId?: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ pageId }) => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [snapshots, setSnapshots] = useState<HistoryEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number>(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('history');
  
  const { currentPage, setCurrentPage } = usePageStore();
  
  // Actualizar historial cuando cambia
  useEffect(() => {
    if (!currentPage) return;
    
    const updateHistory = () => {
      const entries = historyService.getHistory();
      setHistory(entries);
      
      // Determinar posición actual
      setCurrentPosition(
        entries.findIndex(e => e.id === entries[historyService.getHistory().length - 1]?.id)
      );
      
      // Actualizar snapshots
      setSnapshots(historyService.getSnapshots());
    };
    
    updateHistory();
    
    // Establecer intervalo para actualizar periódicamente
    const interval = setInterval(updateHistory, 5000);
    
    return () => clearInterval(interval);
  }, [currentPage]);
  
  // Filtrar historia por término de búsqueda
  const filteredHistory = history.filter(
    entry => entry.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSnapshots = snapshots.filter(
    entry => entry.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejar deshacer
  const handleUndo = () => {
    const previousState = historyService.undo();
    if (previousState) {
      setCurrentPage(previousState);
      toast({
        title: 'Cambio deshecho',
        description: 'Se ha restaurado el estado anterior.',
      });
    } else {
      toast({
        title: 'No se puede deshacer',
        description: 'No hay más acciones para deshacer.',
        variant: 'destructive',
      });
    }
  };
  
  // Manejar rehacer
  const handleRedo = () => {
    const nextState = historyService.redo();
    if (nextState) {
      setCurrentPage(nextState);
      toast({
        title: 'Cambio rehecho',
        description: 'Se ha restaurado el estado siguiente.',
      });
    } else {
      toast({
        title: 'No se puede rehacer',
        description: 'No hay más acciones para rehacer.',
        variant: 'destructive',
      });
    }
  };
  
  // Manejar guardar instantánea
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor, introduce un nombre para la instantánea.',
        variant: 'destructive',
      });
      return;
    }
    
    historyService.saveSnapshot(snapshotName);
    setSnapshotName('');
    setIsDialogOpen(false);
    
    // Actualizar lista de instantáneas
    setSnapshots(historyService.getSnapshots());
  };
  
  // Manejar restaurar instantánea
  const handleRestoreSnapshot = (id: string) => {
    const restoredState = historyService.restoreSnapshot(id);
    if (restoredState) {
      setCurrentPage(restoredState);
      toast({
        title: 'Instantánea restaurada',
        description: 'El estado ha sido restaurado correctamente.',
      });
    }
  };
  
  // Manejar eliminar instantánea
  const handleDeleteSnapshot = (id: string) => {
    historyService.deleteSnapshot(id);
    
    // Actualizar lista de instantáneas
    setSnapshots(historyService.getSnapshots());
    
    toast({
      title: 'Instantánea eliminada',
      description: 'La instantánea ha sido eliminada correctamente.',
    });
  };
  
  // Verificar si hay acciones disponibles
  const canUndo = currentPosition > 0;
  const canRedo = currentPosition < history.length - 1;
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="text-lg font-medium flex items-center">
          <History className="h-5 w-5 mr-2" />
          Historial
        </h3>
        <div className="mt-4 flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deshacer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rehacer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Save className="h-4 w-4 mr-1" />
                Guardar instantánea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guardar instantánea</DialogTitle>
                <DialogDescription>
                  Guarda el estado actual del editor para poder volver a él más tarde.
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-4">
                <Label htmlFor="snapshot-name">Nombre de la instantánea</Label>
                <Input
                  id="snapshot-name"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Ej. Antes de cambiar encabezado"
                  className="mt-1"
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSnapshot}>
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar en el historial..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              <Clock className="h-4 w-4 mr-1" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="snapshots" className="flex-1">
              <Star className="h-4 w-4 mr-1" />
              Instantáneas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[calc(100vh-340px)]">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay entradas en el historial</p>
                </div>
              ) : (
                <div>
                  {filteredHistory.map((entry, index) => (
                    <HistoryItem
                      key={entry.id}
                      entry={entry}
                      isActive={index === currentPosition}
                      onClick={() => {
                        // Implementar navegación directa a un punto del historial
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="snapshots" className="mt-4">
            <ScrollArea className="h-[calc(100vh-340px)]">
              {filteredSnapshots.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Star className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay instantáneas guardadas</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Crear instantánea
                  </Button>
                </div>
              ) : (
                <div>
                  {filteredSnapshots.map((snapshot) => (
                    <HistoryItem
                      key={snapshot.id}
                      entry={snapshot}
                      isActive={false}
                      onClick={() => handleRestoreSnapshot(snapshot.id)}
                      onDelete={() => handleDeleteSnapshot(snapshot.id)}
                      showDelete
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HistoryPanel;