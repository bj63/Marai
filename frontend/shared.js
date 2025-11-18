const toastContainerId = 'toast-layer';
const tokenStorageKey = 'marai.auth.tokens';
const profileStorageKey = 'marai.profile';
const chatStorageKey = 'marai.chat';
const cdnBaseUrl = 'https://cdn.marai.gg';

const retryQueue = [];

function ensureToastContainer() {
  let container = document.getElementById(toastContainerId);
  if (!container) {
    container = document.createElement('div');
    container.id = toastContainerId;
    container.className = 'toast-layer';
    container.setAttribute('role', 'log');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', actionLabel, onAction) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}`;
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  const text = document.createElement('div');
  text.textContent = message;
  text.className = 'spring-transition';
  toast.appendChild(icon);
  toast.appendChild(text);
  if (actionLabel && onAction) {
    const button = document.createElement('button');
    button.textContent = actionLabel;
    button.addEventListener('click', () => {
      onAction();
      toast.remove();
    });
    toast.appendChild(button);
  } else {
    const dismiss = document.createElement('button');
    dismiss.textContent = 'Close';
    dismiss.addEventListener('click', () => toast.remove());
    toast.appendChild(dismiss);
  }
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function resolveCdnPath(path) {
  return `${cdnBaseUrl}${path}`;
}

function setupNetworkMonitoring(onChange) {
  const notify = () => onChange(navigator.onLine);
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  notify();
}

function enqueueRetry(job) {
  retryQueue.push(job);
  return [...retryQueue];
}

function getRetryQueue() {
  return [...retryQueue];
}

function drainRetryQueue() {
  const pending = [...retryQueue];
  retryQueue.length = 0;
  return Promise.allSettled(pending.map((job) => job()))
    .then((results) => {
      const failed = results.filter((r) => r.status === 'rejected');
      failed.forEach((entry) => retryQueue.push(() => Promise.reject(entry.reason)));
      return { results, remaining: [...retryQueue] };
    })
    .catch(() => ({ results: [], remaining: [...retryQueue] }));
}

function lazyLoadMedia(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    if ('loading' in el) {
      el.loading = 'lazy';
    }
  });
}

async function apiRequest(
  endpoint,
  {
    method = 'GET',
    body,
    headers = {},
    mockFallback = true,
    timeoutMs = 6000,
    retries = 2,
    backoffMs = 500,
  } = {}
) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

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
      lastError = error;
      logApiFailure(endpoint, error, { attempt });
      if (attempt === retries) break;
      const jitter = Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt) + jitter));
      attempt += 1;
    }
  }

  if (!mockFallback) throw lastError || new Error('Request failed');
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

function persistChatHistory(userId, messages = []) {
  const cached = loadNamespacedCache(chatStorageKey, userId);
  cached.data = messages;
  localStorage.setItem(chatStorageKey, JSON.stringify(cached));
}

function loadNamespacedCache(baseKey, userId, ttlMs = 5 * 60 * 1000) {
  const cached = localStorage.getItem(baseKey);
  if (!cached) return { userId, timestamp: 0, data: null };
  try {
    const parsed = JSON.parse(cached);
    if (parsed.userId !== userId || Date.now() - parsed.timestamp > ttlMs) {
      return { userId, timestamp: 0, data: null };
    }
    return parsed;
  } catch (error) {
    console.warn('Cache parse failed', error);
    return { userId, timestamp: 0, data: null };
  }
}

function persistNamespacedCache(baseKey, userId, data) {
  const payload = { userId, data, timestamp: Date.now() };
  localStorage.setItem(baseKey, JSON.stringify(payload));
  return payload;
}

function loadProfileCache(userId) {
  return loadNamespacedCache(profileStorageKey, userId);
}

function persistProfileCache(userId, data) {
  return persistNamespacedCache(profileStorageKey, userId, data);
}

function loadChatHistory(userId) {
  return loadNamespacedCache(chatStorageKey, userId, 15 * 60 * 1000);
}

function logApiFailure(endpoint, error, meta = {}) {
  const entry = {
    endpoint,
    message: error?.message || 'Unknown error',
    at: new Date().toISOString(),
    meta,
  };
  console.warn('[api:failure]', entry);
  window.__maraiApiLog = window.__maraiApiLog || [];
  window.__maraiApiLog.push(entry);
  document.dispatchEvent(new CustomEvent('marai:api-error', { detail: entry }));
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

function virtualizeList(container, items, renderItem, { batchSize = 10, overscan = 3 } = {}) {
  if (!container) return () => {};
  let cursor = 0;
  const sentinel = document.createElement('div');
  sentinel.className = 'virtual-sentinel';

  const renderBatch = () => {
    const next = items.slice(cursor, cursor + batchSize);
    cursor += next.length;
    const fragment = document.createDocumentFragment();
    next.forEach((item) => fragment.appendChild(renderItem(item)));
    container.appendChild(fragment);
    container.appendChild(sentinel);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.find((e) => e.isIntersecting);
      if (!entry) return;
      if (cursor < items.length) {
        renderBatch();
      }
    },
    { root: null, rootMargin: `${overscan * 100}px 0px` }
  );

  container.appendChild(sentinel);
  renderBatch();
  observer.observe(sentinel);
  return () => observer.disconnect();
}
