import { create } from 'zustand';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type ChatRole = 'user' | 'ai';

export interface MaraiMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface MaraiState {
  connectionStatus: ConnectionStatus;
  stressLevel: number;
  lastTranscript?: string;
  aiResponse?: string;
  aiAudio?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  messages: MaraiMessage[];
  setConnectionStatus: (status: ConnectionStatus) => void;
  setStressLevel: (level: number) => void;
  pushMessage: (message: MaraiMessage) => void;
  setAiResponse: (response?: string, metadata?: Record<string, unknown>) => void;
  setAiAudio: (audio?: string) => void;
  setTags: (tags: string[]) => void;
  reset: () => void;
}

export const useMaraiStore = create<MaraiState>((set) => ({
  connectionStatus: 'disconnected',
  stressLevel: 0.25,
  lastTranscript: undefined,
  aiResponse: undefined,
  aiAudio: undefined,
  tags: [],
  metadata: {},
  messages: [],
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setStressLevel: (level) => set({ stressLevel: Math.max(0, Math.min(level, 1)) }),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages.slice(-49), message],
      lastTranscript: message.role === 'user' ? message.content : state.lastTranscript,
    })),
  setAiResponse: (response, metadata) =>
    set((state) => ({
      aiResponse: response,
      metadata: metadata ?? state.metadata,
      messages: response
        ? [...state.messages.slice(-49), { role: 'ai', content: response, timestamp: new Date().toISOString() }]
        : state.messages,
    })),
  setAiAudio: (audio) => set({ aiAudio: audio }),
  setTags: (tags) => set({ tags }),
  reset: () =>
    set({
      connectionStatus: 'disconnected',
      stressLevel: 0.25,
      lastTranscript: undefined,
      aiResponse: undefined,
      aiAudio: undefined,
      tags: [],
      metadata: {},
      messages: [],
    }),
}));
