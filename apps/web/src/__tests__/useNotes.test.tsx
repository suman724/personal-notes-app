import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import { Note } from '../types';
import { NotesRepository } from '../persistence/notesRepository';

class MemoryRepository implements NotesRepository {
  private store: Note[];
  saved: Note[] = [];

  constructor(initial: Note[] = []) {
    this.store = initial;
  }

  async loadNotes(): Promise<Note[]> {
    return this.store;
  }

  async saveNotes(notes: Note[]): Promise<void> {
    this.saved = notes;
    this.store = notes;
  }
}

describe('useNotes', () => {
  it('adds, updates, and deletes notes', async () => {
    const repository = new MemoryRepository();
    const { result } = renderHook(() => useNotes(repository));

    await waitFor(() => expect(result.current.hydrated).toBe(true));

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

  it('hydrates notes from the repository and sorts them by update time', async () => {
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

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(result.current.notes[0].id).toBe('2');
    expect(result.current.notes[1].id).toBe('1');
  });
});
