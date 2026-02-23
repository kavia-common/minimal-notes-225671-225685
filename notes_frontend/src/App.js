import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import NoteEditor from "./components/NoteEditor";
import NoteList from "./components/NoteList";
import { loadAppState, makeNewNote, saveAppState } from "./utils/storage";

// PUBLIC_INTERFACE
function App() {
  /** Retro-themed notes app with local-only persistence. */
  const [theme, setTheme] = useState("light");

  const [notes, setNotes] = useState(() => loadAppState().notes);
  const [selectedId, setSelectedId] = useState(() => (notes[0]?.id ? notes[0].id : null));
  const [query, setQuery] = useState("");

  // Apply theme without direct DOM manipulation (React-friendly attribute update)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Persist notes with a tiny debounce to avoid excessive writes.
  useEffect(() => {
    const t = window.setTimeout(() => {
      saveAppState({ notes });
    }, 150);
    return () => window.clearTimeout(t);
  }, [notes]);

  // Keep selection valid as notes change.
  useEffect(() => {
    if (selectedId && notes.some((n) => n.id === selectedId)) return;
    setSelectedId(notes[0]?.id ?? null);
  }, [notes, selectedId]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

    if (!q) return sorted;

    return sorted.filter((n) => {
      const hay = `${n.title}\n${n.content}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, query]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light/dark retro themes. */
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const createNote = () => {
    /** Create and select a new note. */
    const note = makeNewNote();
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
  };

  // PUBLIC_INTERFACE
  const deleteSelected = () => {
    /** Delete currently selected note. */
    if (!selectedNote) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
  };

  // PUBLIC_INTERFACE
  const updateSelected = (patch) => {
    /** Update selected note's title/content (controlled inputs). */
    if (!selectedNote) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNote.id) return n;
        const next = {
          ...n,
          ...patch,
          updatedAt: Date.now(),
        };
        return next;
      })
    );
  };

  return (
    <div className="App">
      <div className="appShell">
        <header className="topBar" role="banner">
          <div className="brand">
            <div className="brandMark" aria-hidden="true">
              RN
            </div>
            <div className="brandText">
              <div className="appTitle" aria-label="App title">
                Retro Notes
              </div>
              <div className="appSubtitle">Local, fast, and delightfully minimal.</div>
            </div>
          </div>

          <div className="topActions">
            <button type="button" className="btn btnPrimary" onClick={createNote} aria-label="Create new note">
              + New
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </header>

        <main className="mainGrid" role="main">
          <section className="sideCol" aria-label="Sidebar">
            <div className="panel">
              <div className="panelHeader panelHeaderSplit">
                <h2 className="panelTitle">Search</h2>
                <div className="panelMeta" aria-label="Filtered count">
                  {filteredNotes.length}/{notes.length}
                </div>
              </div>

              <div className="searchRow">
                <label className="srOnly" htmlFor="notes-search">
                  Search notes
                </label>
                <input
                  id="notes-search"
                  className="input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title or content..."
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn btnSmall btnGhost"
                  onClick={() => setQuery("")}
                  disabled={!query}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              </div>
            </div>

            <NoteList notes={filteredNotes} selectedId={selectedId} onSelect={setSelectedId} />
          </section>

          <section className="mainCol" aria-label="Main content">
            <NoteEditor note={selectedNote} onChange={updateSelected} onDelete={deleteSelected} onCreateNew={createNote} />
          </section>
        </main>

        <footer className="footer" aria-label="Footer">
          <span className="footerText">Stored locally in your browser (localStorage).</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
