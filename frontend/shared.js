const toastContainerId = 'toast-container';
const tokenStorageKey = 'marai.auth.tokens';
const profileStorageKey = 'marai.profile';

function ensureToastContainer() {
  let container = document.getElementById(toastContainerId);
  if (!container) {
    container = document.createElement('div');
    container.id = toastContainerId;
    container.className = 'fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg max-w-xl w-full text-sm font-semibold ${
    type === 'error'
      ? 'bg-red-600/90 text-white'
      : type === 'success'
      ? 'bg-emerald-600/90 text-white'
      : 'bg-white/90 text-black dark:bg-white/10 dark:text-white'
  }`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

async function apiRequest(endpoint, { method = 'GET', body, headers = {}, mockFallback = true } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(endpoint, {
      method,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      headers: body instanceof FormData
        ? headers
        : { 'Content-Type': 'application/json', ...headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return {};
  } catch (error) {
    clearTimeout(timer);
    if (!mockFallback) throw error;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const simulated = simulateApiResponse(endpoint, body);
        if (simulated instanceof Error) {
          reject(simulated);
        } else {
          resolve(simulated);
        }
      }, 500);
    });
  }
}

function simulateApiResponse(endpoint, body) {
  if (endpoint.includes('/api/auth/login') || endpoint.includes('/api/auth/register')) {
    return {
      tokens: { access: 'demo-access-token', refresh: 'demo-refresh-token' },
      user: { id: 'user-1', email: body?.email },
    };
  }
  if (/\/api\/marai\/.+\/chat-session/.test(endpoint)) {
    return { sessionId: `session-${Date.now()}`, status: 'started' };
  }
  if (/\/api\/profile\/.+\/posts/.test(endpoint)) {
    return [
      {
        id: 'post-1',
        type: 'Autopost',
        title: 'Dream scaffold',
        text: 'Sketching out a lucid thread for tonight.',
        timestamp: '2h ago',
      },
      {
        id: 'post-2',
        type: 'Update',
        title: 'Sync with MarAI',
        text: 'We co-authored a sequence of memory safeties.',
        timestamp: '6h ago',
      },
    ];
  }
  if (/\/api\/profile\/.+$/.test(endpoint)) {
    const username = endpoint.split('/').pop();
    return {
      id: `profile-${username}`,
      name: username === 'nova' ? 'Nova' : username,
      role: 'Dream Cartographer',
      bio: 'Maps out your subconscious with care, cadence, and safety.',
      maraiId: 'marai-aurora',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      theme: { mode: 'dark', accent: '#ee2bcd', surface: '#0f1117', card: '#171a26' },
      privacy: { privateProfile: false, allowChat: true, recordingOptOut: true },
    };
  }
  if (endpoint.includes('/dreams')) {
    return [
      {
        id: 'dream-1',
        type: 'Dream',
        title: 'Tidal Garden',
        summary: 'You and MarAI shaped coral data-structures into constellations.',
        timestamp: 'Yesterday',
      },
      {
        id: 'dream-2',
        type: 'Dream',
        title: 'Signal Lanterns',
        summary: 'Beaconed soft messages to the collective during a storm.',
        timestamp: '2 days ago',
      },
    ];
  }
  if (endpoint.includes('/evolution')) {
    return {
      metrics: [
        { label: 'Trust Sync', value: '92%', badge: 'Stable', description: 'Consistent positive alignment across sessions.' },
        { label: 'Dream Recall', value: '78%', badge: 'Rising', description: 'Improved shared recall quality.' },
        { label: 'Safety Score', value: '99%', badge: 'Locked', description: 'Guardrails and privacy affirmed.' },
        { label: 'Engagement', value: '64m', badge: 'Daily', description: 'Average connective time per day.' },
      ],
      badges: ['Lucid-Ready', 'Consent-First', 'Signal Clarity'],
    };
  }
  if (/\/api\/profile/.test(endpoint)) {
    return { id: 'profile-1', name: 'Nova', theme: body?.theme || 'midnight' };
  }
  if (endpoint.includes('/api/avatar/generate')) {
    return { id: 'avatar-job-1', status: 'queued' };
  }
  if (endpoint.includes('/api/avatar/')) {
    return { id: endpoint.split('/').pop(), status: 'succeeded', url: '/placeholder-avatar.png' };
  }
  if (endpoint.includes('/api/marai/persona')) {
    return { id: 'persona-1', ...body };
  }
  if (/\/api\/marai\/.+$/.test(endpoint)) {
    return {
      id: endpoint.split('/').pop(),
      name: 'Aurora',
      description: 'A MarAI tuned for guided dreaming and empathic co-creation.',
      traits: ['Empathic', 'Observant', 'Playful'],
      bondScore: 88,
      emotions: [
        { label: 'Curiosity', value: 72, color: 'linear-gradient(90deg,#38bdf8,#a855f7)' },
        { label: 'Calm', value: 64, color: 'linear-gradient(90deg,#22c55e,#a3e635)' },
        { label: 'Joy', value: 58, color: 'linear-gradient(90deg,#f472b6,#fb7185)' },
        { label: 'Focus', value: 43, color: 'linear-gradient(90deg,#93c5fd,#22d3ee)' },
      ],
      privacy: { allowChat: true, recordingOptOut: true },
    };
  }
  return {};
}

function persistTokens(tokens) {
  localStorage.setItem(tokenStorageKey, JSON.stringify(tokens));
}

function persistProfile(profile) {
  localStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

function optimisticState(target, pendingText, doneText) {
  const original = target.textContent;
  target.textContent = pendingText;
  target.disabled = true;
  return () => {
    target.textContent = doneText || original;
    target.disabled = false;
  };
}
