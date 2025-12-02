import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ConnectionStatus } from '../../store/useMaraiStore';

interface StatusRingProps {
  status: ConnectionStatus;
  label: string;
}

export const StatusRing = ({ status, label }: StatusRingProps) => {
  const tone = {
    connected: { color: '#22d3ee', text: 'Live' },
    connecting: { color: '#f59e0b', text: 'Syncing' },
    disconnected: { color: '#f43f5e', text: 'Offline' },
  }[status];

  return (
    <div className="panel" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', width: 54, height: 54 }} aria-label={`${label}: ${tone.text}`}>
          <motion.span
            className={clsx('badge')}
            style={{ position: 'absolute', inset: 6, borderRadius: '999px', filter: 'blur(18px)', opacity: 0.45 }}
            animate={{
              scale: status === 'connected' ? [0.92, 1.08, 0.92] : 1,
              opacity: status === 'connected' ? [0.35, 0.5, 0.35] : 0.25,
              rotate: [0, 360],
            }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '999px',
              border: `2px solid ${tone.color}`,
              boxShadow: `0 0 30px ${tone.color}55`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              inset: 8,
              borderRadius: '999px',
              background: `${tone.color}33`,
              border: `1px solid ${tone.color}aa`,
            }}
            animate={{ scale: status === 'connected' ? [0.95, 1.05, 0.95] : 1 }}
            transition={{ repeat: Infinity, duration: 2.4 }}
          />
        </div>
        <div>
          <div className="panel-headline">{label}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{tone.text}</div>
        </div>
      </div>
    </div>
  );
};
