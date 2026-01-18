import { Note } from '../types';

const DEFAULT_CONTENT = '# New note\n\nStart writing...';

const FALLBACK_ID = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createNote(): Note {
  const now = Date.now();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : FALLBACK_ID();

  return {
    id,
    title: '',
    content: DEFAULT_CONTENT,
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function normalizeTagsInput(value: string): string[] {
  const tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(tags));
}

export function tagsToString(tags: string[]): string {
  return tags.join(', ');
}

export function getNoteTitle(note: Note): string {
  const trimmed = note.title.trim();
  return trimmed.length > 0 ? trimmed : 'Untitled note';
}

export function getExcerpt(note: Note, length = 80): string {
  const text = note.content.replace(/\s+/g, ' ').trim();
  if (!text) {
    return 'No content yet.';
  }
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

export function filterNotes(notes: Note[], query: string, tag: string | null): Note[] {
  const normalizedQuery = query.trim().toLowerCase();

  return notes.filter((note) => {
    if (tag && !note.tags.includes(tag)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function collectTags(notes: Note[]): string[] {
  const tags = new Set<string>();
  notes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
