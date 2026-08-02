import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}));
