import type { MentorMode } from './ai';
import type { SelectionMeta } from './notes';

export type MobileTab = 'content' | 'syllabus' | 'notes' | 'mentor';
export type RightPanelTab = 'notes' | 'mentor';

export interface SelectedTextPayload {
  text: string;
  rect: { top: number; left: number; width: number; height: number };
  sourceType: 'pdf' | 'text' | 'video';
  sourceMeta: SelectionMeta;
}

export interface ClassroomUIState {
  activeMobileTab: MobileTab;
  selectedText: SelectedTextPayload | null;
  aiMode: MentorMode;
  isAiPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  pendingAIPrompt: string | null;
}
