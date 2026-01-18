import { renderHook, act } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../types';
import { NotesRepository } from '../persistence/notesRepository';

class MemoryRepository implements NotesRepository {
  private store: Note[];
  saved: Note[] = [];

  constructor(initial: Note[] = []) {
    this.store = initial;
  }

  loadNotes(): Note[] {
    return this.store;
  }

  saveNotes(notes: Note[]): void {
    this.saved = notes;
    this.store = notes;
  }
}

describe('useNotes', () => {
  it('adds, updates, and deletes notes', () => {
    const repository = new MemoryRepository();
    const { result } = renderHook(() => useNotes(repository));

    let created: Note | null = null;

    act(() => {
      created = result.current.addNote();
    });

    expect(created).not.toBeNull();
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].id).toBe(created!.id);

    act(() => {
      result.current.updateNote(created!.id, { title: 'Hello', tags: ['work'] });
    });

    expect(result.current.notes[0].title).toBe('Hello');
    expect(result.current.notes[0].tags).toEqual(['work']);

    act(() => {
      result.current.deleteNote(created!.id);
    });

    expect(result.current.notes).toHaveLength(0);
  });

  it('hydrates notes from the repository and sorts them by update time', () => {
    const repository = new MemoryRepository([
      {
        id: '1',
        title: 'Older',
        content: '',
        tags: [],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: '2',
        title: 'Newer',
        content: '',
        tags: [],
        createdAt: 2,
        updatedAt: 2,
      },
    ]);

    const { result } = renderHook(() => useNotes(repository));

    expect(result.current.notes[0].id).toBe('2');
    expect(result.current.notes[1].id).toBe('1');
  });
});
