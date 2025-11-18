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
  if (endpoint.includes('/api/profile')) {
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
