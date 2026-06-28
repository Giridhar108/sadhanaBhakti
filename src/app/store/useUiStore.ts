import { create } from 'zustand';

type UiState = {
  isJapaSessionActive: boolean;
  theme: 'light' | 'soft';
  startJapaSession: () => void;
  stopJapaSession: () => void;
  setTheme: (theme: UiState['theme']) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isJapaSessionActive: false,
  theme: 'soft',
  startJapaSession: () => set({ isJapaSessionActive: true }),
  stopJapaSession: () => set({ isJapaSessionActive: false }),
  setTheme: (theme) => set({ theme }),
}));
