import { useEffect, useMemo } from 'react';
import { Scene } from '../canvas/Scene';
import { HUDOverlay } from '../dom/HUDOverlay';
import { useMaraiStream } from '../../hooks/useMaraiStream';
import { useMaraiStore } from '../../store/useMaraiStore';

export const View = () => {
  const userId = process.env.NEXT_PUBLIC_MARAI_USER_ID ?? 'demo-user';
  const { sendMessage, connection } = useMaraiStream({ userId });
  const reset = useMaraiStore((state) => state.reset);

  const endpointLabel = useMemo(() => connection.endpoint ?? '', [connection.endpoint]);

  useEffect(() => () => reset(), [reset]);

  return (
    <div className="view-root">
      <div className="canvas-wrapper">
        <Scene />
      </div>
      <HUDOverlay onSendMessage={(message) => sendMessage(message, { source: 'hud-overlay' })} />
      {endpointLabel && (
        <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '0.75rem', color: '#94a3b8' }}>
          Streaming from: <span className="monospace">{endpointLabel}</span>
        </div>
      )}
    </div>
  );
};
