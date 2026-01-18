import {
  collectTags,
  createNote,
  filterNotes,
  getExcerpt,
  getNoteTitle,
  normalizeTagsInput,
} from '../utils/noteUtils';
import { Note } from '../types';

describe('noteUtils', () => {
  it('creates a new note with defaults', () => {
    const note = createNote();

    expect(note.id).toBeTruthy();
    expect(note.content).toContain('New note');
    expect(note.tags).toEqual([]);
    expect(note.createdAt).toEqual(note.updatedAt);
  });

  it('normalizes tag input', () => {
    const tags = normalizeTagsInput('work, personal,  work, , ideas ');
    expect(tags).toEqual(['work', 'personal', 'ideas']);
  });

  it('filters notes by query and tag', () => {
    const notes: Note[] = [
      {
        id: '1',
        title: 'Project plan',
        content: 'Outline the milestones',
        tags: ['work'],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: '2',
        title: 'Grocery list',
        content: 'Milk and bread',
        tags: ['personal'],
        createdAt: 2,
        updatedAt: 2,
      },
    ];

    expect(filterNotes(notes, 'plan', null)).toHaveLength(1);
    expect(filterNotes(notes, '', 'personal')).toHaveLength(1);
    expect(filterNotes(notes, 'bread', 'personal')).toHaveLength(1);
    expect(filterNotes(notes, 'bread', 'work')).toHaveLength(0);
  });

  it('collects and sorts tags', () => {
    const notes: Note[] = [
      {
        id: '1',
        title: 'One',
        content: '',
        tags: ['zeta', 'alpha'],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: '2',
        title: 'Two',
        content: '',
        tags: ['beta'],
        createdAt: 2,
        updatedAt: 2,
      },
    ];

    expect(collectTags(notes)).toEqual(['alpha', 'beta', 'zeta']);
  });

  it('builds a fallback title and excerpt', () => {
    const note: Note = {
      id: '1',
      title: '   ',
      content: '',
      tags: [],
      createdAt: 1,
      updatedAt: 1,
    };

    expect(getNoteTitle(note)).toBe('Untitled note');
    expect(getExcerpt(note)).toBe('No content yet.');
  });

  it('truncates long excerpts', () => {
    const note: Note = {
      id: '1',
      title: 'Sample',
      content: 'A'.repeat(200),
      tags: [],
      createdAt: 1,
      updatedAt: 1,
    };

    expect(getExcerpt(note, 50)).toHaveLength(53);
  });
});
