/**
 * Versioned localStorage wrapper for notes data.
 * - Safe JSON parsing with fallback
 * - Lightweight migration path
 * - Avoids runtime crashes if storage is unavailable (private mode / quota)
 */

const STORAGE_KEY = "retro_notes_app__state";
const STORAGE_VERSION = 1;

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} AppStateV1
 * @property {1} version
 * @property {Note[]} notes
 */

/**
 * @returns {AppStateV1}
 */
function getDefaultState() {
  return { version: STORAGE_VERSION, notes: [] };
}

/**
 * @param {any} raw
 * @returns {AppStateV1}
 */
function migrateToLatest(raw) {
  // Future migrations can be added here.
  // For now, we accept v1 shape or attempt to coerce an array to v1 notes.
  if (raw && typeof raw === "object") {
    if (raw.version === 1 && Array.isArray(raw.notes)) {
      return { version: 1, notes: sanitizeNotes(raw.notes) };
    }
  }

  // Back-compat: if someone previously stored just an array of notes.
  if (Array.isArray(raw)) {
    return { version: 1, notes: sanitizeNotes(raw) };
  }

  return getDefaultState();
}

/**
 * @param {any[]} notes
 * @returns {Note[]}
 */
function sanitizeNotes(notes) {
  return notes
    .filter((n) => n && typeof n === "object")
    .map((n) => {
      const createdAt = typeof n.createdAt === "number" ? n.createdAt : Date.now();
      const updatedAt = typeof n.updatedAt === "number" ? n.updatedAt : createdAt;
      return {
        id: typeof n.id === "string" ? n.id : createId(),
        title: typeof n.title === "string" ? n.title : "",
        content: typeof n.content === "string" ? n.content : "",
        createdAt,
        updatedAt,
      };
    });
}

/**
 * @returns {string}
 */
function createId() {
  // No external deps: use crypto.randomUUID if available.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `note_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// PUBLIC_INTERFACE
export function makeNewNote() {
  /** Create a new, empty note model with a unique ID and timestamps. */
  const now = Date.now();
  return {
    id: createId(),
    title: "",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

// PUBLIC_INTERFACE
export function loadAppState() {
  /** Load app state from localStorage with safe parse and migration. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return migrateToLatest(parsed);
  } catch {
    return getDefaultState();
  }
}

// PUBLIC_INTERFACE
export function saveAppState(state) {
  /** Persist app state to localStorage (best-effort, never throws). */
  try {
    const toStore = {
      version: STORAGE_VERSION,
      notes: Array.isArray(state?.notes) ? state.notes : [],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Best-effort only.
  }
}
