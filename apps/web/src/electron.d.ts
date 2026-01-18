import type { Note } from './types';

export {};

declare global {
  interface Window {
    electronAPI?: {
      getNotesFolder: () => Promise<string | null>;
      selectNotesFolder: () => Promise<string | null>;
      loadNotes: () => Promise<Note[]>;
      saveNotes: (notes: Note[]) => Promise<void>;
    };
  }
}
