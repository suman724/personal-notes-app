import { useCallback, useEffect, useState } from 'react';
import { defaultNotesRepository, NotesRepository } from '../persistence/notesRepository';
import { Note } from '../types';
import { createNote, sortNotes } from '../utils/noteUtils';

export function useNotes(repository: NotesRepository = defaultNotesRepository) {
  const [notes, setNotes] = useState<Note[]>(() => sortNotes(repository.loadNotes()));

  useEffect(() => {
    repository.saveNotes(notes);
  }, [notes, repository]);

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

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
}
