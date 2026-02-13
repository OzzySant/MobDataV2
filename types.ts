export enum ProjectionType {
  IDLE = 'IDLE',
  TEXT = 'TEXT',
  LYRIC = 'LYRIC',
  IMAGE = 'IMAGE'
}

export interface ProjectionContent {
  type: ProjectionType;
  content: string; // Text content or Image URL
  reference?: string; // e.g., "João 3:16" or "Hino 12"
}

// Structure matches thiagobodruk/biblia JSONs
export interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][]; // Array of chapters, where each chapter is an array of verses
}

// Structure matches DanielLiberato/Harpa JSON
export interface Hymn {
  numero: number;
  titulo: string;
  letra: string; // Raw text with newlines
}

export interface AppState {
  currentModule: 'bible' | 'hymn' | 'media' | 'settings';
}

// Tipos para o sistema de Broadcast (Segunda Tela)
export type BroadcastActionType = 'SYNC_STATE' | 'REQUEST_SYNC';

export interface BroadcastMessage {
  type: BroadcastActionType;
  payload?: {
    projection: ProjectionContent;
    settings: {
        theme: 'dark' | 'light';
        fontSize: number;
        bgImage: string | null;
    };
    isBlackout: boolean;
  };
}