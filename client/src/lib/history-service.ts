import { v4 as uuidv4 } from 'uuid';
import { PageData, HistoryEntry, HistoryActionType, Block } from '@shared/types';
import { toast } from '@/hooks/use-toast';

// Número máximo de entradas en el historial
const MAX_HISTORY_ENTRIES = 100;

// Clave para almacenar el historial en localStorage
const HISTORY_STORAGE_KEY = 'origo_page_history';

// Clave para almacenar la posición actual en el historial
const HISTORY_POSITION_KEY = 'origo_history_position';

// Clave para almacenar los snapshots guardados
const SNAPSHOTS_STORAGE_KEY = 'origo_page_snapshots';

// Interface para la configuración del servicio
export interface HistoryServiceConfig {
  maxEntries?: number;
  autosaveInterval?: number; // en milisegundos, 0 para deshabilitar
}

/**
 * Servicio para gestionar el historial de cambios en el editor de páginas.
 * Permite deshacer/rehacer operaciones y guardar instantáneas (snapshots).
 */
export class HistoryService {
  private entries: HistoryEntry[] = [];
  private position: number = -1;
  private snapshots: Map<string, HistoryEntry> = new Map();
  private config: HistoryServiceConfig;
  private autosaveTimer: NodeJS.Timeout | null = null;
  private pageId?: number;
  private initialized = false;

  constructor(config: HistoryServiceConfig = {}) {
    this.config = {
      maxEntries: MAX_HISTORY_ENTRIES,
      autosaveInterval: 60000, // autosave cada minuto por defecto
      ...config
    };
  }

  /**
   * Inicializa el servicio de historial para una página específica
   * @param pageData Datos iniciales de la página
   */
  public init(pageData: PageData): void {
    if (this.initialized) {
      this.clear();
    }

    this.pageId = pageData.id;
    
    // Cargar historial y snapshots almacenados para esta página
    this.loadFromStorage();
    
    // Si no hay historial o es para otra página, crear entrada inicial
    if (this.entries.length === 0) {
      const initialEntry: HistoryEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        label: 'Estado inicial',
        state: structuredClone(pageData),
        type: HistoryActionType.INITIAL
      };
      
      this.entries = [initialEntry];
      this.position = 0;
      this.saveToStorage();
    }
    
    // Configurar autosave si está habilitado
    this.setupAutosave();
    
    this.initialized = true;
  }

  /**
   * Obtiene el estado actual de la página según la posición en el historial
   */
  public getCurrentState(): PageData | null {
    if (this.position < 0 || this.position >= this.entries.length) {
      return null;
    }
    
    return structuredClone(this.entries[this.position].state);
  }

  /**
   * Añade una nueva entrada al historial
   * @param state Nuevo estado de la página
   * @param type Tipo de acción realizada
   * @param label Etiqueta descriptiva para la acción
   */
  public addEntry(state: PageData, type: HistoryActionType, label: string): void {
    if (!this.initialized) {
      console.warn('HistoryService not initialized');
      return;
    }
    
    // Si hay acciones deshechas y se hace un cambio, eliminar esas entradas
    if (this.position < this.entries.length - 1) {
      this.entries = this.entries.slice(0, this.position + 1);
    }
    
    // Crear nueva entrada
    const entry: HistoryEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      label,
      state: structuredClone(state),
      type
    };
    
    // Añadir entrada al historial
    this.entries.push(entry);
    this.position = this.entries.length - 1;
    
    // Limitar tamaño del historial
    if (this.entries.length > (this.config.maxEntries || MAX_HISTORY_ENTRIES)) {
      this.entries = this.entries.slice(this.entries.length - (this.config.maxEntries || MAX_HISTORY_ENTRIES));
      this.position = this.entries.length - 1;
    }
    
    // Guardar en localStorage
    this.saveToStorage();
  }

  /**
   * Deshace la última acción realizada
   * @returns El estado anterior de la página o null si no hay acciones para deshacer
   */
  public undo(): PageData | null {
    if (!this.initialized || this.position <= 0) {
      return null;
    }
    
    this.position--;
    
    // Guardar posición en localStorage
    localStorage.setItem(
      `${HISTORY_POSITION_KEY}_${this.pageId}`,
      this.position.toString()
    );
    
    return this.getCurrentState();
  }

  /**
   * Rehace la última acción deshecha
   * @returns El estado siguiente de la página o null si no hay acciones para rehacer
   */
  public redo(): PageData | null {
    if (!this.initialized || this.position >= this.entries.length - 1) {
      return null;
    }
    
    this.position++;
    
    // Guardar posición en localStorage
    localStorage.setItem(
      `${HISTORY_POSITION_KEY}_${this.pageId}`,
      this.position.toString()
    );
    
    return this.getCurrentState();
  }

  /**
   * Guarda una instantánea del estado actual con un nombre personalizado
   * @param name Nombre de la instantánea
   * @param state Estado a guardar (opcional, por defecto usa el estado actual)
   */
  public saveSnapshot(name: string, state?: PageData): void {
    if (!this.initialized) {
      return;
    }
    
    const snapshotState = state || this.getCurrentState();
    if (!snapshotState) return;
    
    const entry: HistoryEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      label: name,
      state: structuredClone(snapshotState),
      type: HistoryActionType.SAVED_SNAPSHOT
    };
    
    this.snapshots.set(entry.id, entry);
    
    // Guardar snapshots en localStorage
    this.saveSnapshotsToStorage();
    
    toast({
      title: 'Instantánea guardada',
      description: `La instantánea "${name}" ha sido guardada correctamente.`,
    });
  }

  /**
   * Obtiene todas las instantáneas guardadas
   */
  public getSnapshots(): HistoryEntry[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Restaura el estado desde una instantánea guardada
   * @param id ID de la instantánea a restaurar
   * @returns El estado de la instantánea o null si no existe
   */
  public restoreSnapshot(id: string): PageData | null {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) return null;
    
    // Crear nueva entrada en el historial
    this.addEntry(
      snapshot.state,
      HistoryActionType.IMPORTED,
      `Restaurado desde: ${snapshot.label}`
    );
    
    return this.getCurrentState();
  }

  /**
   * Elimina una instantánea guardada
   * @param id ID de la instantánea a eliminar
   */
  public deleteSnapshot(id: string): void {
    if (this.snapshots.has(id)) {
      this.snapshots.delete(id);
      this.saveSnapshotsToStorage();
    }
  }

  /**
   * Obtiene el historial completo
   */
  public getHistory(): HistoryEntry[] {
    return [...this.entries];
  }

  /**
   * Limpia todo el historial para la página actual
   */
  public clear(): void {
    this.entries = [];
    this.position = -1;
    this.initialized = false;
    
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    
    // Limpiar localStorage
    localStorage.removeItem(`${HISTORY_STORAGE_KEY}_${this.pageId}`);
    localStorage.removeItem(`${HISTORY_POSITION_KEY}_${this.pageId}`);
  }

  /**
   * Genera un mensaje descriptivo para la acción
   * @param type Tipo de acción
   * @param blockType Tipo de bloque (opcional)
   */
  public static getActionLabel(type: HistoryActionType, blockType?: string): string {
    const blockName = blockType ? ` ${blockType}` : '';
    
    switch (type) {
      case HistoryActionType.ADD_BLOCK:
        return `Bloque${blockName} añadido`;
      case HistoryActionType.UPDATE_BLOCK:
        return `Bloque${blockName} actualizado`;
      case HistoryActionType.REMOVE_BLOCK:
        return `Bloque${blockName} eliminado`;
      case HistoryActionType.MOVE_BLOCK:
        return `Bloque${blockName} movido`;
      case HistoryActionType.UPDATE_PAGE_META:
        return 'Metadatos de página actualizados';
      case HistoryActionType.SAVED_SNAPSHOT:
        return 'Instantánea guardada';
      case HistoryActionType.IMPORTED:
        return 'Estado importado';
      case HistoryActionType.AUTO_SAVED:
        return 'Guardado automático';
      case HistoryActionType.INITIAL:
      default:
        return 'Estado inicial';
    }
  }

  /**
   * Carga el historial y snapshots desde localStorage
   */
  private loadFromStorage(): void {
    try {
      // Cargar historial
      const historyJson = localStorage.getItem(`${HISTORY_STORAGE_KEY}_${this.pageId}`);
      if (historyJson) {
        this.entries = JSON.parse(historyJson);
      }
      
      // Cargar posición
      const positionStr = localStorage.getItem(`${HISTORY_POSITION_KEY}_${this.pageId}`);
      if (positionStr) {
        this.position = parseInt(positionStr, 10);
      } else if (this.entries.length > 0) {
        this.position = this.entries.length - 1;
      }
      
      // Cargar snapshots
      const snapshotsJson = localStorage.getItem(`${SNAPSHOTS_STORAGE_KEY}_${this.pageId}`);
      if (snapshotsJson) {
        const snapshotsArray: HistoryEntry[] = JSON.parse(snapshotsJson);
        this.snapshots = new Map(snapshotsArray.map(s => [s.id, s]));
      }
    } catch (error) {
      console.error('Error al cargar el historial:', error);
      // Si hay error, reiniciar
      this.entries = [];
      this.position = -1;
      this.snapshots = new Map();
    }
  }

  /**
   * Guarda el historial en localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        `${HISTORY_STORAGE_KEY}_${this.pageId}`,
        JSON.stringify(this.entries)
      );
      
      localStorage.setItem(
        `${HISTORY_POSITION_KEY}_${this.pageId}`,
        this.position.toString()
      );
    } catch (error) {
      console.error('Error al guardar el historial:', error);
      toast({
        title: 'Error al guardar historial',
        description: 'No se pudo guardar el historial en el almacenamiento local.',
        variant: 'destructive',
      });
    }
  }

  /**
   * Guarda los snapshots en localStorage
   */
  private saveSnapshotsToStorage(): void {
    try {
      localStorage.setItem(
        `${SNAPSHOTS_STORAGE_KEY}_${this.pageId}`,
        JSON.stringify(Array.from(this.snapshots.values()))
      );
    } catch (error) {
      console.error('Error al guardar instantáneas:', error);
      toast({
        title: 'Error al guardar instantáneas',
        description: 'No se pudieron guardar las instantáneas en el almacenamiento local.',
        variant: 'destructive',
      });
    }
  }

  /**
   * Configura el guardado automático si está habilitado
   */
  private setupAutosave(): void {
    if (!this.config.autosaveInterval || this.config.autosaveInterval <= 0) {
      return;
    }
    
    // Limpiar temporizador anterior si existe
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
    }
    
    // Crear nuevo temporizador
    this.autosaveTimer = setInterval(() => {
      const currentState = this.getCurrentState();
      if (currentState) {
        this.saveSnapshot('Autosave', currentState);
      }
    }, this.config.autosaveInterval);
  }
}

// Exportar instancia singleton
export const historyService = new HistoryService();