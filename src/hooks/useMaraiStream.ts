import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMaraiStore, type ConnectionStatus, type MaraiMessage } from '../store/useMaraiStore';

export interface StreamEvent {
  type: 'user-transcript' | 'ai-response' | 'ai-audio';
  payload?: {
    text?: string;
    audio?: string;
    metadata?: Record<string, unknown>;
    emotion_label?: string;
    emotion_intensity?: number;
    tags?: string[];
  };
}

export interface UseMaraiStreamOptions {
  userId?: string;
  apiBase?: string;
}

const defaultApiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

const toWsUrl = (apiBase: string, userId: string) => {
  const safeBase = apiBase.replace(/^http/, 'ws').replace(/\/$/, '');
  return `${safeBase}/ws/${userId}`;
};

export const useMaraiStream = ({ userId, apiBase = defaultApiBase }: UseMaraiStreamOptions) => {
  const { setConnectionStatus, pushMessage, setAiResponse, setAiAudio, setTags, setStressLevel } = useMaraiStore();
  const socketRef = useRef<WebSocket | null>(null);

  const status: ConnectionStatus = useMaraiStore((state) => state.connectionStatus);

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      const payload = event.payload ?? {};
      if (payload.emotion_intensity !== undefined) {
        setStressLevel(payload.emotion_intensity);
      }
      if (payload.tags) {
        setTags(payload.tags);
      }

      if (event.type === 'user-transcript' && payload.text) {
        const message: MaraiMessage = {
          role: 'user',
          content: payload.text,
          timestamp: new Date().toISOString(),
          metadata: payload.metadata,
        };
        pushMessage(message);
      }

      if (event.type === 'ai-response' && payload.text) {
        setAiResponse(payload.text, payload.metadata);
      }

      if (event.type === 'ai-audio' && payload.audio) {
        setAiAudio(payload.audio);
      }
    },
    [pushMessage, setAiAudio, setAiResponse, setStressLevel, setTags],
  );

  useEffect(() => {
    if (!userId) return undefined;
    const endpoint = toWsUrl(apiBase, userId);
    setConnectionStatus('connecting');

    const socket = new WebSocket(endpoint);
    socketRef.current = socket;

    socket.onopen = () => setConnectionStatus('connected');
    socket.onclose = () => setConnectionStatus('disconnected');
    socket.onerror = () => setConnectionStatus('disconnected');
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as StreamEvent;
        if (parsed?.type) {
          handleEvent(parsed);
        }
      } catch (err) {
        console.warn('Marai stream parse error', err);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [apiBase, handleEvent, setConnectionStatus, userId]);

  const sendMessage = useCallback(
    (message: string, metadata?: Record<string, unknown>) => {
      const payload = {
        message,
        metadata,
      };
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      }
    },
    [],
  );

  const connectionMeta = useMemo(
    () => ({
      status,
      endpoint: userId ? toWsUrl(apiBase, userId) : undefined,
    }),
    [apiBase, status, userId],
  );

  return { sendMessage, connection: connectionMeta };
};
