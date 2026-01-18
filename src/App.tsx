import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotes } from './hooks/useNotes';
import {
  collectTags,
  filterNotes,
  formatDate,
  getExcerpt,
  getNoteTitle,
  normalizeTagsInput,
  tagsToString,
} from './utils/noteUtils';

const emptyStateCopy =
  'Capture your first thought, link it with tags, and see the Markdown preview instantly.';

function App() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (notes.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !notes.some((note) => note.id === selectedId)) {
      setSelectedId(notes[0].id);
    }
  }, [notes, selectedId]);

  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;
  const selectedTagsSignature = selectedNote ? selectedNote.tags.join(',') : '';

  useEffect(() => {
    setTagsInput(selectedNote ? tagsToString(selectedNote.tags) : '');
  }, [selectedNote?.id, selectedTagsSignature]);

  const tags = useMemo(() => collectTags(notes), [notes]);

  useEffect(() => {
    if (activeTag && !tags.includes(activeTag)) {
      setActiveTag(null);
    }
  }, [activeTag, tags]);

  const filteredNotes = useMemo(
    () => filterNotes(notes, searchQuery, activeTag),
    [notes, searchQuery, activeTag],
  );

  const handleCreateNote = () => {
    const note = addNote();
    setSelectedId(note.id);
    setSearchQuery('');
    setActiveTag(null);
  };

  const handleDeleteNote = () => {
    if (!selectedNote) {
      return;
    }

    const confirmDelete = window.confirm('Delete this note?');
    if (confirmDelete) {
      deleteNote(selectedNote.id);
    }
  };

  const commitTags = () => {
    if (!selectedNote) {
      return;
    }

    updateNote(selectedNote.id, { tags: normalizeTagsInput(tagsInput) });
  };

  const previewContent = selectedNote?.content?.trim()
    ? selectedNote.content
    : 'Start writing to see the preview.';

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-up">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Personal Notes</p>
            <h1 className="text-3xl font-semibold text-ink">Markdown Vault</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">{emptyStateCopy}</p>
          </div>
          <button
            type="button"
            onClick={handleCreateNote}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
          >
            New note
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-panel-border bg-panel p-5 shadow-soft animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</h2>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-ink">
                {notes.length} total
              </span>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Search
              </label>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Title, tag, or keyword"
                className="mt-2 w-full rounded-2xl border border-panel-border bg-white px-4 py-2 text-sm text-ink shadow-sm focus:border-ink focus:outline-none"
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    activeTag === null
                      ? 'border-ink bg-ink text-white'
                      : 'border-panel-border bg-white text-ink hover:border-ink'
                  }`}
                >
                  All
                </button>
                {tags.length === 0 ? (
                  <span className="text-xs text-slate-500">No tags yet</span>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        activeTag === tag
                          ? 'border-ink bg-ink text-white'
                          : 'border-panel-border bg-white text-ink hover:border-ink'
                      }`}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-panel-border px-4 py-6 text-sm text-slate-500">
                  No notes match this filter.
                </div>
              ) : (
                filteredNotes.map((note, index) => {
                  const isActive = note.id === selectedId;
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedId(note.id)}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition animate-fade-up ${
                        isActive
                          ? 'border-ink bg-ink text-white'
                          : 'border-panel-border bg-white text-ink hover:border-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{getNoteTitle(note)}</h3>
                        <span
                          className={`text-xs ${
                            isActive ? 'text-white/70' : 'text-slate-500'
                          }`}
                        >
                          {formatDate(note.updatedAt)}
                        </span>
                      </div>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-600'}`}>
                        {getExcerpt(note)}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isActive
                                  ? 'bg-white/15 text-white'
                                  : 'bg-accent-soft text-ink'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isActive
                                  ? 'bg-white/15 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <main className="rounded-3xl border border-panel-border bg-panel p-6 shadow-soft animate-fade-in">
            {selectedNote ? (
              <div className="flex h-full flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedNote.title}
                      onChange={(event) =>
                        updateNote(selectedNote.id, { title: event.target.value })
                      }
                      placeholder="Untitled note"
                      className="w-full border-b border-panel-border bg-transparent pb-2 text-2xl font-semibold text-ink focus:border-ink focus:outline-none"
                    />
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      Updated {formatDate(selectedNote.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    className="rounded-full border border-panel-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-ink hover:text-ink"
                  >
                    Delete
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)}
                    onBlur={commitTags}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitTags();
                      }
                    }}
                    placeholder="e.g. ideas, work, personal"
                    className="mt-2 w-full rounded-2xl border border-panel-border bg-white px-4 py-2 text-sm text-ink shadow-sm focus:border-ink focus:outline-none"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Editor
                      </h3>
                      <span className="text-xs text-slate-500">Markdown</span>
                    </div>
                    <textarea
                      value={selectedNote.content}
                      onChange={(event) =>
                        updateNote(selectedNote.id, { content: event.target.value })
                      }
                      placeholder="Write in Markdown..."
                      className="min-h-[360px] w-full rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-ink focus:outline-none"
                    />
                  </section>

                  <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Preview
                      </h3>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                    <div className="min-h-[360px] w-full rounded-2xl border border-panel-border bg-white px-4 py-3 shadow-sm">
                      <div className="prose prose-slate max-w-none font-serif">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {previewContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                  Empty vault
                </div>
                <h2 className="text-2xl font-semibold text-ink">Create your first note</h2>
                <p className="max-w-md text-sm text-slate-600">{emptyStateCopy}</p>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  New note
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
