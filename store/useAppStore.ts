// FIX: Add types for the global `zustand` object to satisfy TypeScript and avoid using `any`.
// The style guide prohibits `any`, so we define a minimal type for the `create` function.
type ZustandSet<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean,
) => void;
type ZustandGet<T> = () => T;
type ZustandStateCreator<T> = (set: ZustandSet<T>, get: ZustandGet<T>) => T;

// This is a simplified version of the Zustand hook type.
type ZustandHook<T> = {
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  // subscribe, destroy, etc. are omitted for brevity.
};

declare global {
  interface Window {
    zustand: {
      create: <T>(creator: ZustandStateCreator<T>) => ZustandHook<T>;
    };
  }
}

import type { FileNode } from '../types';
import { zipService } from '../services/zipService';

// Make create available from the global window object where we attached it
const { create } = window.zustand;

interface AppState {
  fileTree: FileNode[];
  fileContents: Map<string, string>;
  selectedFile: { path: string; content: string } | null;
  isLoading: boolean;
  error: string | null;
  lightboxSvg: string | null;
  isSidebarOpen: boolean;
  searchQuery: string;
}

interface AppActions {
  uploadFile: (file: File) => Promise<void>;
  selectFile: (path: string) => void;
  reset: () => void;
  openLightbox: (svg: string) => void;
  closeLightbox: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const initialState: AppState = {
  fileTree: [],
  fileContents: new Map(),
  selectedFile: null,
  isLoading: false,
  error: null,
  lightboxSvg: null,
  isSidebarOpen: false,
  searchQuery: '',
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  uploadFile: async (file: File) => {
    set({
      isLoading: true,
      error: null,
      selectedFile: null,
      fileTree: [],
      fileContents: new Map(),
      searchQuery: '',
    });
    try {
      const { fileTree, fileContents } = await zipService.processZipFile(file);
      set({ fileTree, fileContents, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error: message, isLoading: false });
    }
  },

  selectFile: (path: string) => {
    const fileContents = get().fileContents;
    if (fileContents.has(path)) {
      const content = fileContents.get(path) || '';
      set({ selectedFile: { path, content }, isSidebarOpen: false });
    }
  },

  reset: () => {
    set(initialState);
  },
  
  openLightbox: (svg: string) => {
    set({ lightboxSvg: svg });
  },

  closeLightbox: () => {
    set({ lightboxSvg: null });
  },
  
  setSidebarOpen: (isOpen: boolean) => {
    set({ isSidebarOpen: isOpen });
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
}));
