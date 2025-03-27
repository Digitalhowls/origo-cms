import { create } from 'zustand';
import { PageData, Block, BlockType, HistoryActionType } from '@shared/types';
import { historyService } from './history-service';
import { v4 as uuidv4 } from 'uuid';

interface PageState {
  currentPage: PageData | null;
  setCurrentPage: (page: PageData) => void;
  updatePageTitle: (title: string) => void;
  updatePageSlug: (slug: string) => void;
  updatePageStatus: (status: 'draft' | 'published' | 'archived') => void;
  addBlock: (block: Block) => void;
  updateBlock: (block: Block) => void;
  removeBlock: (blockId: string) => void;
  moveBlockUp: (blockId: string) => void;
  moveBlockDown: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  setBlocksOrder: (blocks: Block[]) => void;
}

export const usePageStore = create<PageState>((set) => ({
  currentPage: null,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
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
  
  addBlock: (block) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const updatedPage = {
      ...state.currentPage,
      blocks: [...(state.currentPage.blocks || []), block],
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
