import React from "react";

/**
 * @param {{
 *  notes: Array<{id: string, title: string, content: string, updatedAt: number}>,
 *  selectedId: string | null,
 *  onSelect: (id: string) => void,
 * }} props
 */
export default function NoteList({ notes, selectedId, onSelect }) {
  return (
    <div className="panel" aria-label="Notes list">
      <div className="panelHeader">
        <h2 className="panelTitle">Notes</h2>
        <div className="panelMeta" aria-label="Notes count">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </div>
      </div>

      <div className="noteList" role="list">
        {notes.length === 0 ? (
          <div className="emptyState" role="note" aria-label="No notes">
            No notes yet. Create your first note.
          </div>
        ) : (
          notes.map((n) => {
            const isSelected = n.id === selectedId;
            const title = (n.title || "").trim() || "Untitled note";
            const excerpt = (n.content || "").trim().slice(0, 80);
            return (
              <button
                key={n.id}
                type="button"
                className={`noteRow ${isSelected ? "noteRowSelected" : ""}`}
                onClick={() => onSelect(n.id)}
                role="listitem"
                aria-current={isSelected ? "true" : "false"}
              >
                <div className="noteRowTitle">{title}</div>
                <div className="noteRowExcerpt">{excerpt || "No content"}</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
