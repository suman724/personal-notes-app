import { Note } from '../types';

export interface NotesRepository {
  loadNotes(): Note[];
  saveNotes(notes: Note[]): void;
}

export class LocalStorageNotesRepository implements NotesRepository {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  loadNotes(): Note[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((note) => note && typeof note.id === 'string') as Note[];
    } catch {
      return [];
    }
  }

  saveNotes(notes: Note[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(notes));
    } catch {
      return;
    }
  }
}

export const defaultNotesRepository = new LocalStorageNotesRepository('personal-notes-v1');
