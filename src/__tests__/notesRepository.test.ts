import { LocalStorageNotesRepository } from '../persistence/notesRepository';
import { Note } from '../types';

describe('LocalStorageNotesRepository', () => {
  const storageKey = 'test-notes-storage';

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists and restores notes', () => {
    const repository = new LocalStorageNotesRepository(storageKey);
    const notes: Note[] = [
      {
        id: '1',
        title: 'Saved note',
        content: 'Hello',
        tags: ['saved'],
        createdAt: 1,
        updatedAt: 2,
      },
    ];

    repository.saveNotes(notes);

    const loaded = repository.loadNotes();
    expect(loaded).toEqual(notes);
  });

  it('returns an empty array for invalid data', () => {
    window.localStorage.setItem(storageKey, '{bad json');

    const repository = new LocalStorageNotesRepository(storageKey);
    expect(repository.loadNotes()).toEqual([]);
  });
});
