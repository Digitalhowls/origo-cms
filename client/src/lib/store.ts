import { create } from 'zustand';
import { PageData, Block, BlockType } from '@shared/types';
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
}

export const usePageStore = create<PageState>((set) => ({
  currentPage: null,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  updatePageTitle: (title) => set((state) => ({
    currentPage: state.currentPage 
      ? { ...state.currentPage, title } 
      : null
  })),
  
  updatePageSlug: (slug) => set((state) => ({
    currentPage: state.currentPage 
      ? { ...state.currentPage, slug } 
      : null
  })),
  
  updatePageStatus: (status) => set((state) => ({
    currentPage: state.currentPage 
      ? { ...state.currentPage, status } 
      : null
  })),
  
  addBlock: (block) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks: [...(state.currentPage.blocks || []), block],
      }
    };
  }),
  
  updateBlock: (updatedBlock) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks: state.currentPage.blocks.map((block) => 
          block.id === updatedBlock.id ? updatedBlock : block
        ),
      }
    };
  }),
  
  removeBlock: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks: state.currentPage.blocks.filter((block) => block.id !== blockId),
      }
    };
  }),
  
  moveBlockUp: (blockId) => set((state) => {
    if (!state.currentPage) return { currentPage: null };
    
    const blocks = [...state.currentPage.blocks];
    const index = blocks.findIndex((block) => block.id === blockId);
    
    if (index <= 0) return { currentPage: state.currentPage };
    
    // Swap with previous block
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks,
      }
    };
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
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks,
      }
    };
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
    
    return {
      currentPage: {
        ...state.currentPage,
        blocks,
      }
    };
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
