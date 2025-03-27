import { create } from 'zustand';
import { PageData, Block, BlockType, HistoryActionType, Grid, GridCell } from '@shared/types';
import { historyService } from './history-service';
import { v4 as uuidv4 } from 'uuid';

interface PageState {
  currentPage: PageData | null;
  setCurrentPage: (page: PageData) => void;
  updatePageTitle: (title: string) => void;
  updatePageSlug: (slug: string) => void;
  updatePageStatus: (status: 'draft' | 'published' | 'archived') => void;
  addBlock: (block: Block, afterBlockId?: string | null) => void;
  updateBlock: (block: Block) => void;
  updateBlockAnimation: (blockId: string, animation: any) => void;
  updateBlockGridPosition: (blockId: string, position: GridCell) => void;
  removeBlock: (blockId: string) => void;
  moveBlockUp: (blockId: string) => void;
  moveBlockDown: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setBlocksOrder: (blocks: Block[]) => void;
  
  // Grid management
  updatePageGrid: (grid: Grid) => void;
  resetPageGrid: () => void;
}

// Builder store que combina PageState con otras funcionalidades
interface BuilderState extends PageState {
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  viewMode: 'edit' | 'preview';
  setViewMode: (mode: 'edit' | 'preview') => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const usePageStore = create<PageState>((set) => ({
  currentPage: null,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Actualizar la posición de un bloque en la rejilla
  updateBlockGridPosition: (blockId, position) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = state.currentPage.blocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          gridPosition: position
        };
      }
      return block;
    });
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_BLOCK_POSITION,
      `Posición del bloque actualizada en la rejilla`
    );
    
    return { currentPage: updatedPage };
  }),
  
  // Actualizar la configuración de la rejilla de la página
  updatePageGrid: (grid) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    // Si ya había una rejilla, es una actualización, si no, es una adición
    const actionType = state.currentPage.grid ? HistoryActionType.UPDATE_GRID : HistoryActionType.ADD_GRID;
    
    const updatedPage = {
      ...state.currentPage,
      grid
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      actionType,
      actionType === HistoryActionType.ADD_GRID 
        ? `Sistema de rejilla añadido a la página` 
        : `Configuración de rejilla actualizada`
    );
    
    return { currentPage: updatedPage };
  }),
  
  // Eliminar la configuración de rejilla de la página
  resetPageGrid: () => set((state) => {
    if (!state.currentPage || !state.currentPage.grid) return { currentPage: state.currentPage };
    
    // Crear una copia de la página sin la rejilla
    const { grid, ...pageWithoutGrid } = state.currentPage;
    
    // Limpiar las posiciones de rejilla de los bloques
    const blocksWithoutGridPositions = state.currentPage.blocks.map(block => {
      if (block.gridPosition) {
        const { gridPosition, ...blockWithoutGrid } = block;
        return blockWithoutGrid;
      }
      return block;
    });
    
    const updatedPage = {
      ...pageWithoutGrid,
      blocks: blocksWithoutGridPositions
    } as PageData;
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_GRID,
      `Sistema de rejilla desactivado`
    );
    
    return { currentPage: updatedPage };
  }),
  
  updateBlockAnimation: (blockId, animation) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = state.currentPage.blocks.map((block) => {
      if (block.id === blockId) {
        return {
          ...block,
          settings: {
            ...(block.settings || {}),
            animation,
          },
        };
      }
      return block;
    });
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_BLOCK,
      `Animación de bloque actualizada: ${animation.type} (${animation.subType})`
    );
    
    return { currentPage: updatedPage };
  }),
  
  updatePageTitle: (title) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = { ...state.currentPage, title };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_PAGE_META,
      `Título de página actualizado a "${title}"`
    );
    
    return { currentPage: updatedPage };
  }),
  
  updatePageSlug: (slug) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = { ...state.currentPage, slug };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_PAGE_META,
      `URL de página actualizada a "${slug}"`
    );
    
    return { currentPage: updatedPage };
  }),
  
  updatePageStatus: (status) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = { ...state.currentPage, status };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_PAGE_META,
      `Estado de página actualizado a "${status}"`
    );
    
    return { currentPage: updatedPage };
  }),
  
  addBlock: (block, afterBlockId = null) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    let updatedBlocks;
    
    if (afterBlockId) {
      // Si se especifica afterBlockId, inserta el bloque después de ese bloque
      const index = state.currentPage.blocks.findIndex(b => b.id === afterBlockId);
      if (index !== -1) {
        updatedBlocks = [
          ...state.currentPage.blocks.slice(0, index + 1),
          block,
          ...state.currentPage.blocks.slice(index + 1)
        ];
      } else {
        // Si no se encuentra el bloque de referencia, añade al final
        updatedBlocks = [...(state.currentPage.blocks || []), block];
      }
    } else {
      // Si no se especifica afterBlockId, añade al final como antes
      updatedBlocks = [...(state.currentPage.blocks || []), block];
    }
    
    const updatedPage = {
      ...state.currentPage,
      blocks: updatedBlocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.ADD_BLOCK,
      `Bloque ${block.type} añadido`
    );
    
    return { currentPage: updatedPage };
  }),
  
  updateBlock: (updatedBlock) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = {
      ...state.currentPage,
      blocks: state.currentPage.blocks.map((block) => 
        block.id === updatedBlock.id ? updatedBlock : block
      ),
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.UPDATE_BLOCK,
      `Bloque ${updatedBlock.type} actualizado`
    );
    
    return { currentPage: updatedPage };
  }),
  
  removeBlock: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    // Obtenemos el bloque que será eliminado para registrar su tipo en el historial
    const blockToRemove = state.currentPage.blocks.find(block => block.id === blockId);
    if (!blockToRemove) return { currentPage: state.currentPage };
    
    const updatedPage = {
      ...state.currentPage,
      blocks: state.currentPage.blocks.filter((block) => block.id !== blockId),
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.REMOVE_BLOCK,
      `Bloque ${blockToRemove.type} eliminado`
    );
    
    return { currentPage: updatedPage };
  }),
  
  moveBlockUp: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = [...state.currentPage.blocks];
    const index = blocks.findIndex((block) => block.id === blockId);
    
    if (index <= 0) return { currentPage: state.currentPage };
    
    // Swap with previous block
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.MOVE_BLOCK,
      `Bloque ${blocks[index-1].type} movido hacia arriba`
    );
    
    return { currentPage: updatedPage };
  }),
  
  moveBlockDown: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = [...state.currentPage.blocks];
    const index = blocks.findIndex((block) => block.id === blockId);
    
    if (index === -1 || index >= blocks.length - 1) {
      return { currentPage: state.currentPage };
    }
    
    // Swap with next block
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.MOVE_BLOCK,
      `Bloque ${blocks[index+1].type} movido hacia abajo`
    );
    
    return { currentPage: updatedPage };
  }),
  
  duplicateBlock: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blockToDuplicate = state.currentPage.blocks.find((block) => block.id === blockId);
    
    if (!blockToDuplicate) return { currentPage: state.currentPage };
    
    const duplicatedBlock: Block = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: uuidv4(),
    };
    
    const blocks = [...state.currentPage.blocks];
    const index = blocks.findIndex((block) => block.id === blockId);
    
    // Insert duplicated block after the original
    blocks.splice(index + 1, 0, duplicatedBlock);
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.ADD_BLOCK,
      `Bloque ${duplicatedBlock.type} duplicado`
    );
    
    return { currentPage: updatedPage };
  }),
  
  // Reordenar bloques durante el arrastre y soltar
  reorderBlocks: (activeId, overId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = [...state.currentPage.blocks];
    const activeIndex = blocks.findIndex((block) => block.id === activeId);
    const overIndex = blocks.findIndex((block) => block.id === overId);
    
    if (activeIndex === -1 || overIndex === -1) {
      return { currentPage: state.currentPage };
    }

    // Mover el bloque a la nueva posición
    const [movedBlock] = blocks.splice(activeIndex, 1);
    blocks.splice(overIndex, 0, movedBlock);
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.MOVE_BLOCK,
      `Bloques reordenados por arrastre`
    );
    
    return { currentPage: updatedPage };
  }),
  
  // Establecer un nuevo orden completo de bloques
  setBlocksOrder: (blocks) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = {
      ...state.currentPage,
      blocks,
    };
    
    // Registrar cambio en historial
    historyService.addEntry(
      updatedPage,
      HistoryActionType.MOVE_BLOCK,
      `Orden de bloques actualizado`
    );
    
    return { currentPage: updatedPage };
  }),
}));

// Builder Store que combina la funcionalidad de PageState con otras para la edición
export const useBuildStore = create<BuilderState>((set, get) => ({
  // Page State
  ...usePageStore.getState(),
  
  // UI State
  selectedBlockId: null,
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  selectedTab: 'content',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  viewMode: 'edit' as const,
  setViewMode: (mode) => set({ viewMode: mode }),
  previewDevice: 'desktop' as const,
  setPreviewDevice: (device) => set({ previewDevice: device }),
}));

// Sincronizar los stores cuando el estado de página cambia
usePageStore.subscribe((state) => {
  if (state.currentPage !== useBuildStore.getState().currentPage) {
    useBuildStore.setState({ currentPage: state.currentPage });
  }
});

// Media Store
interface MediaState {
  selectedMedia: any | null;
  setSelectedMedia: (media: any) => void;
  mediaLibraryOpen: boolean;
  setMediaLibraryOpen: (isOpen: boolean) => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  selectedMedia: null,
  setSelectedMedia: (media) => set({ selectedMedia: media }),
  mediaLibraryOpen: false,
  setMediaLibraryOpen: (isOpen) => set({ mediaLibraryOpen: isOpen }),
}));

// Organization Store
interface OrganizationState {
  currentOrganization: any | null;
  setCurrentOrganization: (organization: any) => void;
  organizationBranding: any | null;
  setOrganizationBranding: (branding: any) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  currentOrganization: null,
  setCurrentOrganization: (organization) => set({ currentOrganization: organization }),
  organizationBranding: null,
  setOrganizationBranding: (branding) => set({ organizationBranding: branding }),
}));

// User Store
interface UserState {
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ 
    currentUser: user,
    isAuthenticated: !!user
  }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
