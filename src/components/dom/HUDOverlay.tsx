import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Brain, Mic, Waveform } from 'lucide-react';
import { useMaraiStore } from '../../store/useMaraiStore';
import { StatusRing } from './StatusRing';

interface HUDOverlayProps {
  onSendMessage?: (message: string) => void;
}

export const HUDOverlay = ({ onSendMessage }: HUDOverlayProps) => {
  const [draft, setDraft] = useState('Hello, Marai. How are you feeling?');
  const connectionStatus = useMaraiStore((state) => state.connectionStatus);
  const stressLevel = useMaraiStore((state) => state.stressLevel);
  const lastTranscript = useMaraiStore((state) => state.lastTranscript);
  const aiResponse = useMaraiStore((state) => state.aiResponse);
  const aiAudio = useMaraiStore((state) => state.aiAudio);
  const tags = useMaraiStore((state) => state.tags);
  const messages = useMaraiStore((state) => state.messages);

  const stressMessage = useMemo(() => {
    if (stressLevel > 0.75) return 'Acute load detected — rerouting more power to the core.';
    if (stressLevel > 0.45) return 'Elevated oscillations observed, smoothing waveform.';
    return 'Core resonance stable.';
  }, [stressLevel]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onSendMessage?.(draft.trim());
    setDraft('');
  };

  return (
    <div className="hud-overlay">
      <div className="card-grid">
        <StatusRing status={connectionStatus} label="Adaptive Memory Socket" />

        <div className="panel" style={{ padding: '1rem 1.25rem' }}>
          <div className="panel-headline">
            <Brain size={16} /> Core Resonance
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800 }}>{Math.round(stressLevel * 100)}%</div>
            <motion.div
              style={{ width: 68, height: 68, borderRadius: '50%', border: '2px solid rgba(148, 163, 184, 0.2)' }}
              animate={{
                boxShadow: `0 0 32px ${stressLevel > 0.6 ? '#f43f5e66' : '#22d3ee55'}`,
                scale: [1, 1.06, 1],
              }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
          </div>
          <div style={{ marginTop: '0.5rem', color: '#cbd5e1' }}>{stressMessage}</div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
            {!tags.length && <span className="badge">Awaiting signals</span>}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: '1.25rem' }}>
        <div className="panel-headline" style={{ marginBottom: '0.75rem' }}>
          <Waveform size={16} /> Conversation Loop
        </div>
        <div className="log">
          {messages.map((entry) => (
            <div className="log-entry" key={entry.timestamp + entry.content}>
              <div className="monospace" style={{ color: entry.role === 'user' ? '#22d3ee' : '#c084fc', fontWeight: 600 }}>
                {entry.role.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>{entry.content}</div>
              <div className="timestamp">{new Date(entry.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          {!messages.length && <div className="alert">No transcripts received yet.</div>}
        </div>

        <form className="control-bar" onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Send a prompt to the adaptive memory websocket"
            aria-label="Chat message"
          />
          <button type="submit">Send</button>
        </form>
      </div>

      <div className="card-grid">
        <div className="panel" style={{ padding: '1rem 1.25rem' }}>
          <div className="panel-headline">
            <Mic size={16} /> User Transcript
          </div>
          <div style={{ marginTop: '0.5rem', minHeight: 44 }}>{lastTranscript ?? 'Waiting for transcript...'}</div>
        </div>

        <div className="panel" style={{ padding: '1rem 1.25rem' }}>
          <div className="panel-headline">
            <Waveform size={16} /> AI Response
          </div>
          <div style={{ marginTop: '0.5rem', minHeight: 44 }}>{aiResponse ?? 'No response yet.'}</div>
          {aiAudio && <div className={clsx('badge')} style={{ marginTop: '0.75rem' }}>Audio packet ready</div>}
        </div>
      </div>
    </div>
  );
};
