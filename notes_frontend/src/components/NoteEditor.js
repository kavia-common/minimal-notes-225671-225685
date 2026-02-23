import React, { useEffect, useMemo, useState } from "react";

/**
 * @param {{
 *  note: {id: string, title: string, content: string, createdAt: number, updatedAt: number} | null,
 *  onChange: (patch: {title?: string, content?: string}) => void,
 *  onDelete: () => void,
 *  onCreateNew: () => void,
 * }} props
 */
export default function NoteEditor({ note, onChange, onDelete, onCreateNew }) {
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");

  const titleId = useMemo(() => "note-title-input", []);
  const contentId = useMemo(() => "note-content-input", []);

  useEffect(() => {
    setLocalTitle(note?.title ?? "");
    setLocalContent(note?.content ?? "");
  }, [note?.id]); // reset local buffers when switching notes

  useEffect(() => {
    // Keep local inputs in sync if note is updated externally (rare, but safe).
    setLocalTitle(note?.title ?? "");
  }, [note?.title]);

  useEffect(() => {
    setLocalContent(note?.content ?? "");
  }, [note?.content]);

  if (!note) {
    return (
      <div className="panel" aria-label="Editor panel">
        <div className="panelHeader">
          <h2 className="panelTitle">Editor</h2>
        </div>
        <div className="emptyState">
          Select a note from the list, or create a new one.
          <div className="emptyActions">
            <button type="button" className="btn btnPrimary" onClick={onCreateNew}>
              + New note
            </button>
          </div>
        </div>
      </div>
    );
  }

  const updatedText = new Date(note.updatedAt).toLocaleString();

  return (
    <div className="panel" aria-label="Note editor">
      <div className="panelHeader panelHeaderSplit">
        <div>
          <h2 className="panelTitle">Editor</h2>
          <div className="panelMeta">Last updated: {updatedText}</div>
        </div>
        <div className="headerActions">
          <button type="button" className="btn btnGhost" onClick={onCreateNew}>
            + New
          </button>
          <button type="button" className="btn btnDanger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="form">
        <div className="field">
          <label className="label" htmlFor={titleId}>
            Title
          </label>
          <input
            id={titleId}
            className="input"
            type="text"
            value={localTitle}
            onChange={(e) => {
              const v = e.target.value;
              setLocalTitle(v);
              onChange({ title: v });
            }}
            placeholder="e.g. Shopping list"
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor={contentId}>
            Content
          </label>
          <textarea
            id={contentId}
            className="textarea"
            value={localContent}
            onChange={(e) => {
              const v = e.target.value;
              setLocalContent(v);
              onChange({ content: v });
            }}
            placeholder="Write your note..."
            rows={12}
          />
        </div>
      </div>
    </div>
  );
}
