import { useCallback, useEffect, useState } from 'react';
import { defaultNotesRepository, NotesRepository } from '../persistence/notesRepository';
import { Note } from '../types';
import { createNote, sortNotes } from '../utils/noteUtils';

export function useNotes(repository: NotesRepository = defaultNotesRepository) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setHydrated(false);
      const loaded = await repository.loadNotes();
      if (!isActive) {
        return;
      }
      setNotes(sortNotes(loaded));
      setHydrated(true);
    };

    load();

    return () => {
      isActive = false;
    };
  }, [repository]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void repository.saveNotes(notes);
  }, [notes, repository, hydrated]);

  const addNote = useCallback(() => {
    const note = createNote();
    setNotes((prev) => sortNotes([note, ...prev]));
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      sortNotes(
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                ...patch,
                updatedAt: Date.now(),
              }
            : note,
        ),
      ),
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const reload = useCallback(async () => {
    const loaded = await repository.loadNotes();
    setNotes(sortNotes(loaded));
  }, [repository]);

  return {
    notes,
    hydrated,
    addNote,
    updateNote,
    deleteNote,
    reload,
  };
}
