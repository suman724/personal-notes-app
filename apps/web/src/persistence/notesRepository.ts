import { Note } from '../types';

export interface NotesRepository {
  loadNotes(): Promise<Note[]>;
  saveNotes(notes: Note[]): Promise<void>;
}

export class LocalStorageNotesRepository implements NotesRepository {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  async loadNotes(): Promise<Note[]> {
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

  async saveNotes(notes: Note[]): Promise<void> {
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

export class ElectronNotesRepository implements NotesRepository {
  async loadNotes(): Promise<Note[]> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return [];
    }

    return window.electronAPI.loadNotes();
  }

  async saveNotes(notes: Note[]): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return;
    }

    await window.electronAPI.saveNotes(notes);
  }
}
