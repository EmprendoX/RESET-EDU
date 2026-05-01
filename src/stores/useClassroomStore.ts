import { create } from 'zustand';
import type { MentorMode } from '@/types/ai';
import type {
  ClassroomUIState,
  MobileTab,
  RightPanelTab,
  SelectedTextPayload,
} from '@/types/classroom';

interface ClassroomActions {
  setActiveMobileTab: (tab: MobileTab) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setSelectedText: (payload: SelectedTextPayload | null) => void;
  clearSelectedText: () => void;
  setAiMode: (mode: MentorMode) => void;
  openAiPanel: () => void;
  closeAiPanel: () => void;
  setPendingAIPrompt: (prompt: string | null) => void;
}

type Store = ClassroomUIState & ClassroomActions;

export const useClassroomStore = create<Store>((set) => ({
  activeMobileTab: 'content',
  selectedText: null,
  aiMode: 'qna',
  isAiPanelOpen: false,
  rightPanelTab: 'notes',
  pendingAIPrompt: null,

  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  setRightPanelTab: (tab) =>
    set({
      rightPanelTab: tab,
      activeMobileTab: tab === 'notes' ? 'notes' : 'mentor',
    }),
  setSelectedText: (payload) => set({ selectedText: payload }),
  clearSelectedText: () => set({ selectedText: null }),
  setAiMode: (mode) => set({ aiMode: mode }),
  openAiPanel: () =>
    set({
      isAiPanelOpen: true,
      rightPanelTab: 'mentor',
      activeMobileTab: 'mentor',
    }),
  closeAiPanel: () => set({ isAiPanelOpen: false }),
  setPendingAIPrompt: (prompt) => set({ pendingAIPrompt: prompt }),
}));
