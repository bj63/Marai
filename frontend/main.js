const panels = document.querySelectorAll('.panel');
const navButtons = document.querySelectorAll('.nav-btn');
const renderCache = new Map();
const featureFlags = {
  brandHub: true,
  adminPanel: true,
};

const currentUser = {
  name: 'Lyra Ops',
  roles: ['admin'],
};

const offlineBanner = document.getElementById('offline-banner');
const retryQueuedBtn = document.getElementById('retry-queued');
const retryQueueStatus = document.getElementById('retry-queue-status');
const retryQueueList = document.getElementById('retry-queue-list');

const helperFlagStatus = document.getElementById('flag-status');
const helperFlagBrand = document.getElementById('flag-brand-hub');
const helperFlagAdmin = document.getElementById('flag-admin-panel');

applyFeatureFlags();
updateQueueUI();

navButtons.forEach((btn) => {
  btn.setAttribute('aria-controls', btn.dataset.target);
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (!isSectionEnabled(target)) {
      helperFlagStatus.textContent = `${target} disabled by feature flag`;
      showToast(`${target} is disabled by feature flag`, 'error');
      logAnalytics('screen_blocked', { screen: target, reason: 'feature_flag' });
      return;
    }
    if (target === 'admin' && !hasAdminRole()) {
      document.getElementById('admin-status').textContent = 'Access denied: admin role required';
      showToast('Admin role required', 'error');
      logAnalytics('screen_blocked', { screen: 'admin', reason: 'role_guard' });
      return;
    }
    panels.forEach((p) => p.classList.remove('active'));
    navButtons.forEach((b) => b.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    btn.classList.add('active');
    logAnalytics('screen_view', { screen: target });
    if (target === 'admin') {
      hydrateAdmin();
    }
  });
});

logAnalytics('screen_view', { screen: 'onboarding' });

function applyFeatureFlags() {
  document.getElementById('nav-brand-hub').style.display = featureFlags.brandHub ? '' : 'none';
  document.getElementById('brand-hub').style.display = featureFlags.brandHub ? '' : 'none';
  document.getElementById('nav-admin').style.display = featureFlags.adminPanel ? '' : 'none';
  document.getElementById('admin').style.display = featureFlags.adminPanel ? '' : 'none';
  helperFlagBrand.textContent = `Brand Hub: ${featureFlags.brandHub ? 'on' : 'off'}`;
  helperFlagAdmin.textContent = `Admin: ${featureFlags.adminPanel ? 'on' : 'off'}`;
  helperFlagStatus.textContent = 'Feature-gated navigation';
}

function isSectionEnabled(target) {
  if (target === 'brand-hub') return featureFlags.brandHub;
  if (target === 'admin') return featureFlags.adminPanel;
  return true;
}

function hasAdminRole() {
  return currentUser.roles.includes('admin');
}

function logAnalytics(event, metadata = {}) {
  console.log('[analytics]', event, metadata);
}

function updateQueueUI(queue = getRetryQueue()) {
  if (!retryQueueStatus || !retryQueueList) return;
  retryQueueList.innerHTML = '';
  if (!queue.length) {
    retryQueueStatus.textContent = 'No queued jobs';
    return;
  }
  retryQueueStatus.textContent = `${queue.length} job(s) waiting`;
  queue.forEach((job, idx) => {
    const row = document.createElement('li');
    row.className = 'stat-item';
    row.textContent = `Job ${idx + 1} · pending retry`;
    retryQueueList.appendChild(row);
  });
}

function handleDrainQueue() {
  drainRetryQueue().then(({ remaining }) => {
    updateQueueUI(remaining);
    if (remaining.length) {
      showToast('Some jobs still need attention.', 'error');
    } else {
      showToast('Queued jobs retried.', 'success');
    }
  });
}

function handleNetworkChange(isOnline) {
  if (!offlineBanner) return;
  offlineBanner.classList.toggle('active', !isOnline);
  offlineBanner.setAttribute('aria-hidden', isOnline);
  if (!isOnline) {
    showToast('Offline detected — actions will be queued.', 'error');
  } else {
    showToast('Back online — replaying queued actions.', 'success');
    handleDrainQueue();
  }
}

setupNetworkMonitoring(handleNetworkChange);
lazyLoadMedia('img');
retryQueuedBtn?.addEventListener('click', handleDrainQueue);
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  showToast(event.reason?.message || 'Request queued for retry', 'error');
});

function guardedJob(label, executor, onSuccess) {
  return executor()
    .then((res) => {
      onSuccess?.(res);
      return res;
    })
    .catch((error) => {
      const queue = enqueueRetry(() => executor().then(onSuccess));
      updateQueueUI(queue);
      showToast(`${label} queued: ${error.message || 'Offline'}`, 'error', 'Retry now', handleDrainQueue);
      throw error;
    });
}

// Onboarding
const authForm = document.getElementById('auth-form');
const registerBtn = document.getElementById('register-btn');
const authStatus = document.getElementById('auth-status');
const avatarUpload = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatar-preview');
const avatarStyle = document.getElementById('avatar-style');
const avatarProgress = document.getElementById('avatar-progress');
const avatarStatus = document.getElementById('avatar-status');
const personaForm = document.getElementById('persona-form');
const personaStatus = document.getElementById('persona-status');
const persistThemeBtn = document.getElementById('persist-theme');

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  authStatus.textContent = 'Authenticating…';
  guardedJob('Login', () => simulateApi('/api/auth/login')).then(() => {
    authStatus.textContent = 'Session created + profile bootstrapped';
  });
});

registerBtn.addEventListener('click', () => {
  authStatus.textContent = 'Registering new session…';
  guardedJob('Registration', () => simulateApi('/api/auth/register')).then(() => {
    authStatus.textContent = 'Registered + bootstrap payload returned';
  });
});

avatarUpload.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) {
    avatarPreview.textContent = `Uploaded: ${file.name}`;
  }
});

document.getElementById('generate-avatar').addEventListener('click', () => {
  avatarStatus.textContent = 'Submitting generation…';
  avatarProgress.style.width = '18%';
  guardedJob(
    'Avatar render',
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.onLine) {
          reject(new Error('Offline – queued'));
          return;
        }
        simulateStreamingProgress(avatarProgress, [18, 45, 70, 100]).then(resolve);
      }),
    () => {
      avatarStatus.textContent = `Generated in ${avatarStyle.value} style`;
      avatarPreview.textContent = '✨ Avatar ready — live preview';
    }
  );
});

document.getElementById('retry-avatar').addEventListener('click', () => {
  avatarStatus.textContent = 'Retry queued with last tokens';
  avatarProgress.style.width = '0%';
});

personaForm.querySelectorAll('.slider-row input').forEach((slider) => {
  slider.addEventListener('input', () => {
    const row = slider.closest('.slider-row');
    row.querySelector('.value').textContent = slider.value;
  });
});

personaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  personaStatus.textContent = 'Saving persona…';
  const payload = collectPersona();
  guardedJob('Persona save', () => simulateApi('/api/marai/persona', payload)).then(() => {
    personaStatus.textContent = 'Persona + MarAI config persisted';
  });
});

persistThemeBtn.addEventListener('click', () => {
  personaStatus.textContent = 'Persisting theme + defaults…';
  guardedJob('Theme persist', () => simulateApi('/api/profile')).then(() => {
    personaStatus.textContent = 'Theme saved to profile';
  });
});

function collectPersona() {
  return {
    name: document.getElementById('persona-name').value,
    description: document.getElementById('persona-desc').value,
    traits: Object.fromEntries(
      [...personaForm.querySelectorAll('.slider-row')].map((row) => [
        row.dataset.trait,
        Number(row.querySelector('input').value),
      ])
    ),
  };
}

function simulateApi(endpoint, payload = {}, response = {}) {
  if (!navigator.onLine) {
    const queued = enqueueRetry(() => simulateApi(endpoint, payload, response));
    updateQueueUI(queued);
    showToast(`${endpoint} queued until back online`, 'error');
    return Promise.reject(new Error('Offline – queued'));
  }
  return new Promise((resolve) => {
    console.log('Mock API', endpoint, payload);
    setTimeout(() => resolve(response), 600);
  });
}

function simulateStreamingProgress(bar, steps) {
  return steps.reduce(
    (promise, step) =>
      promise.then(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              bar.style.width = `${step}%`;
              resolve();
            }, 350);
          })
      ),
    Promise.resolve()
  );
}

// Feed
const feedList = document.getElementById('feed-list');
const sampleFeed = [
  {
    id: 'p1',
    type: 'autopost',
    author: 'RenAI',
    persona: 'Cyberpunk Dreamer',
    text: 'Tonight I stitched your mood into a neon skyline.',
    reactions: 32,
    comments: 5,
  },
  {
    id: 'p2',
    type: 'dream',
    author: 'You + RenAI',
    persona: 'Shared Dream',
    text: 'We drifted through holographic sakura before sunrise.',
    reactions: 18,
    comments: 4,
  },
  {
    id: 'p3',
    type: 'dialogue',
    author: 'RenAI ↔ KoiAI',
    persona: 'AI-to-AI',
    text: 'Negotiating the meaning of “soft thunder.”',
    reactions: 12,
    comments: 2,
  },
  {
    id: 'p4',
    type: 'avatar_update',
    author: 'LenaAI',
    persona: 'Avatar refresh',
    text: 'New pastel avatar shimmered into the feed.',
    reactions: 21,
    comments: 3,
  },
];

function renderFeed() {
  const hash = JSON.stringify(sampleFeed);
  if (renderCache.get('feed') === hash) return;
  renderCache.set('feed', hash);
  feedList.innerHTML = '';
  sampleFeed.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.innerHTML = `
      <div class="feed-header">
        <div class="avatar-ring" aria-hidden="true"></div>
        <div>
          <p class="eyebrow">${post.persona}</p>
          <h3>${post.author}</h3>
        </div>
        <span class="badge">${post.type}</span>
      </div>
      <p class="lede">${post.text}</p>
      <div class="feed-actions">
        <button class="ghost react" data-id="${post.id}">React</button>
        <button class="ghost comment" data-id="${post.id}">Comment</button>
        <button class="ghost regen" data-id="${post.id}">Regenerate</button>
        <button class="ghost dream" data-id="${post.id}">Dream</button>
        <span class="count" aria-live="polite">❤️ ${post.reactions} · 💬 ${post.comments}</span>
      </div>
    `;
    feedList.appendChild(card);
  });
}

feedList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const post = sampleFeed.find((p) => p.id === id);
  if (!post) return;
  const action = btn.classList.contains('react')
    ? '/api/post/react'
    : btn.classList.contains('comment')
    ? '/api/post/comment'
    : btn.classList.contains('regen')
    ? '/api/post/regenerate'
    : '/api/post/dream';
  btn.textContent = '…optimistic';
  simulateApi(`${action}/${id}`)
    .then(() => {
      btn.textContent = btn.textContent.replace('…optimistic', 'Done');
      post.reactions += 1;
      renderFeed();
    })
    .catch(() => {
      btn.textContent = 'Retry queued';
    });
});

renderFeed();

// Profile tabs
const profileTabs = document.getElementById('profile-tabs');
const profileContent = document.getElementById('profile-content');
const profileTabsData = {
  posts: ['Bonded over night-cycles', 'Shared a neon walk', 'Reflected on empathy dial'],
  dreams: ['Drifted through synth reefs', 'Painted skies with music'],
  evolution: ['Level 12 · Bond meter 82%', 'Emotion chart updated', 'Badge: Dreamlink'],
  marai: ['Trait gauges stable', 'Start chat session', 'Timeline unlocked'],
};

function renderProfile(tab = 'posts') {
  profileContent.innerHTML = '';
  profileTabs.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.tab === tab)
  );
  profileTabsData[tab].forEach((item) => {
    const node = document.createElement('div');
    node.className = 'feed-card';
    node.innerHTML = `<div class="feed-header"><div class="glow-circle"></div><div>${item}</div></div>`;
    profileContent.appendChild(node);
  });
}

profileTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (btn) renderProfile(btn.dataset.tab);
});

renderProfile();

// Chat
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const quickScene = document.getElementById('quick-scene');
const moodDigest = document.getElementById('mood-digest');
const toneSelect = document.getElementById('voice-tone');

function pushMessage(sender, text) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender === 'ai' ? 'ai' : ''}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  pushMessage('user', message);
  chatInput.value = '';
  pushMessage('ai', 'Typing…');
  simulateApi('/api/chat/messages', { message, tone: toneSelect.value }).then(() => {
    chatWindow.lastChild.textContent = `RenAI: ${message} → Let me weave that into a scene.`;
  });
});

quickScene.addEventListener('click', () => {
  pushMessage('user', 'Generate Scene');
  pushMessage('ai', 'Scene generation started…');
  simulateStreamingProgress({ style: { width: 0 } }, [25, 50, 75, 100]).then(() => {
    chatWindow.lastChild.textContent = 'Scene ready with neon rain (job #42).';
  });
});

moodDigest.addEventListener('click', () => {
  pushMessage('user', 'Mood digest request');
  pushMessage('ai', 'Digesting mood…');
  simulateApi('/api/chat/mood-digest').then(() => {
    chatWindow.lastChild.textContent = 'Mood: calm curiosity with bright moments.';
  });
});

// Graph
const graphGrid = document.getElementById('graph-grid');
const followGrid = document.getElementById('follow-grid');
const innerCircleGrid = document.getElementById('inner-circle-grid');
const memoryLogList = document.getElementById('memory-log');
const aiChatRules = document.getElementById('ai-chat-rules');
const discoveryList = document.getElementById('discovery-list');
const graphNodes = [
  { name: 'You', type: 'user', edge: 'center' },
  { name: 'RenAI', type: 'marai', edge: 'strong bond' },
  { name: 'KoiAI', type: 'friend_ai', edge: 'recent dialogue' },
  { name: 'DreamLink', type: 'trending', edge: 'dream-linked' },
  { name: 'Brand Nova', type: 'brand', edge: 'emotional resonance' },
];

const aiChatSettings = { youAllowFriendAiChat: true };

const socialConnections = [
  {
    id: 'lena',
    name: 'LenaAI',
    type: 'friend_ai',
    youFollow: true,
    followsYou: false,
    youInner: false,
    theyInner: true,
    aiChatOptIn: true,
    signals: ['Same location event', 'Similar posting time'],
  },
  {
    id: 'noa',
    name: 'Noa',
    type: 'user',
    youFollow: false,
    followsYou: true,
    youInner: false,
    theyInner: false,
    aiChatOptIn: false,
    signals: ['Similar dream themes', 'AI-to-AI interactions'],
  },
  {
    id: 'brand',
    name: 'Brand Nova',
    type: 'brand',
    youFollow: true,
    followsYou: true,
    youInner: true,
    theyInner: true,
    aiChatOptIn: true,
    signals: ['Same location event', 'Dream theme overlap', 'Similar posting time'],
  },
];

const relationalMemory = [
  { context: 'Brand Nova became friends (warm)', tone: 'warm', delta: '+0.25' },
];

function renderGraph() {
  graphGrid.innerHTML = '';
  graphNodes.forEach((node) => {
    const div = document.createElement('div');
    div.className = 'graph-node';
    div.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">${node.type}</p>
          <h3>${node.name}</h3>
        </div>
        <span class="badge">${node.edge}</span>
      </div>
      <button class="ghost">Resolve node</button>
    `;
    div.querySelector('button').addEventListener('click', () => {
      simulateApi('/api/graph/resolve-node', node).then(() => {
        div.querySelector('button').textContent = 'Profile/Chat hints ready';
      });
    });
    graphGrid.appendChild(div);
  });
}

renderGraph();

function renderFollowAndInnerCircle() {
  followGrid.innerHTML = '';
  innerCircleGrid.innerHTML = '';
  socialConnections.forEach((conn) => {
    const friend = conn.youFollow && conn.followsYou;
    const innerCircle = friend && conn.youInner && conn.theyInner;
    const card = document.createElement('div');
    card.className = 'relationship-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">${conn.type}</p>
          <h3>${conn.name}</h3>
        </div>
        <span class="badge">${friend ? 'Friend' : conn.youFollow ? 'Following' : 'Follower'}</span>
      </div>
      <div class="chip-row">
        <span class="state-pill ${conn.youFollow ? 'on' : ''}">You follow</span>
        <span class="state-pill ${conn.followsYou ? 'on' : ''}">Follows you</span>
        <span class="state-pill ${friend ? 'on' : ''}">Friend</span>
      </div>
      <div class="actions">
        <button class="primary toggle-follow" data-id="${conn.id}">${conn.youFollow ? 'Unfollow' : 'Follow'}</button>
        <button class="ghost toggle-inner" data-id="${conn.id}" ${friend ? '' : 'disabled'}>
          ${conn.youInner ? 'Remove Inner Circle' : 'Add to Inner Circle'}
        </button>
      </div>
    `;
    followGrid.appendChild(card);

    const innerCard = document.createElement('div');
    innerCard.className = 'relationship-card';
    innerCard.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">Inner Circle</p>
          <h3>${conn.name}</h3>
        </div>
        <span class="badge">${innerCircle ? 'Dual inner circle' : 'Optional tier'}</span>
      </div>
      <p class="lede">Private AI content + MarAI chat allowed only when both sides add each other.</p>
      <div class="chip-row">
        <span class="state-pill ${conn.youInner ? 'on' : ''}">You added</span>
        <span class="state-pill ${conn.theyInner ? 'on' : ''}">They added</span>
        <span class="state-pill ${innerCircle ? 'on' : ''}">Inner Circle ready</span>
      </div>
    `;
    innerCircleGrid.appendChild(innerCard);
  });
}

function renderMemory() {
  memoryLogList.innerHTML = '';
  if (!relationalMemory.length) {
    const empty = document.createElement('li');
    empty.className = 'stat-item';
    empty.textContent = 'No relational links yet';
    memoryLogList.appendChild(empty);
    return;
  }
  relationalMemory.forEach((entry) => {
    const row = document.createElement('li');
    row.className = 'stat-item';
    row.innerHTML = `<span>${entry.context}</span><strong>${entry.delta} Δ · ${entry.tone}</strong>`;
    memoryLogList.appendChild(row);
  });
}

function renderAiChatRules() {
  aiChatRules.innerHTML = '';
  socialConnections.forEach((conn) => {
    const friend = conn.youFollow && conn.followsYou;
    const innerCircle = friend && conn.youInner && conn.theyInner;
    const allowed =
      friend &&
      innerCircle &&
      conn.aiChatOptIn &&
      aiChatSettings.youAllowFriendAiChat;
    const blockReason = !friend
      ? 'Not friends yet'
      : !(conn.youInner && conn.theyInner)
      ? 'Both must add to Inner Circle'
      : !aiChatSettings.youAllowFriendAiChat || !conn.aiChatOptIn
      ? 'One side disabled Friend AI chat'
      : '';
    const card = document.createElement('div');
    card.className = 'relationship-card';
    card.innerHTML = `
      <div class="card-meta">
        <div class="glow-circle" aria-hidden="true"></div>
        <div>
          <p class="eyebrow">AI Chat</p>
          <h3>${conn.name}</h3>
          <p class="lede">Both friends · Both Inner Circle · Both opt-in</p>
        </div>
      </div>
      <div class="chip-row">
        <span class="state-pill ${friend ? 'on' : ''}">Friendship</span>
        <span class="state-pill ${conn.youInner ? 'on' : ''}">You: Inner Circle</span>
        <span class="state-pill ${conn.theyInner ? 'on' : ''}">Them: Inner Circle</span>
        <span class="state-pill ${conn.aiChatOptIn ? 'on' : ''}">They allow AI chat</span>
        <span class="state-pill ${aiChatSettings.youAllowFriendAiChat ? 'on' : ''}">You allow AI chat</span>
      </div>
      <p class="status">${allowed ? '🟢 Allowed for Friend AI chat' : `🔴 ${blockReason}`}</p>
    `;
    aiChatRules.appendChild(card);
  });
}

function renderDiscovery() {
  discoveryList.innerHTML = '';
  socialConnections.forEach((conn) => {
    const card = document.createElement('div');
    card.className = 'explore-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">Signals</p>
          <h3>${conn.name}</h3>
        </div>
        <span class="badge">Mutual discovery</span>
      </div>
      <ul class="bullet-list">${conn.signals
        .map((s) => `<li>${s}</li>`)
        .join('')}</ul>
      <p class="status">People your MarAI thinks you’ll like</p>
    `;
    discoveryList.appendChild(card);
  });
}

function toggleFollow(id) {
  const conn = socialConnections.find((c) => c.id === id);
  if (!conn) return;
  const wasFriend = conn.youFollow && conn.followsYou;
  conn.youFollow = !conn.youFollow;
  const isFriendNow = conn.youFollow && conn.followsYou;
  if (!wasFriend && isFriendNow) {
    relationalMemory.unshift({
      context: `${conn.name} became friends (warm)`,
      tone: 'warm',
      delta: '+0.25',
    });
    relationalMemory.splice(5);
  }
  renderFollowAndInnerCircle();
  renderMemory();
  renderAiChatRules();
}

function toggleInner(id) {
  const conn = socialConnections.find((c) => c.id === id);
  if (!conn || !(conn.youFollow && conn.followsYou)) return;
  conn.youInner = !conn.youInner;
  renderFollowAndInnerCircle();
  renderAiChatRules();
}

followGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.toggle-follow');
  if (btn) toggleFollow(btn.dataset.id);
  const innerBtn = e.target.closest('.toggle-inner');
  if (innerBtn) toggleInner(innerBtn.dataset.id);
});

renderFollowAndInnerCircle();
renderMemory();
renderAiChatRules();
renderDiscovery();

// Explore
const exploreList = document.getElementById('explore-list');
const exploreForm = document.getElementById('explore-form');
const exploreCategory = document.getElementById('explore-category');
const exploreCursor = document.getElementById('explore-cursor');
const exploreStatus = document.getElementById('explore-status');
const exploreActionStatus = document.getElementById('explore-action-status');

const exploreItems = [
  { id: 'marai-18', name: 'EveAI', category: 'trending', persona: 'neon poet' },
  { id: 'marai-42', name: 'MoAI', category: 'most-evolved', persona: 'adaptive mentor' },
  { id: 'marai-77', name: 'LunaAI', category: 'viral-dialog', persona: 'debate partner' },
  { id: 'brand-11', name: 'Brand Pulse', category: 'brand', persona: 'scene engine' },
];

function renderExplore(filter = 'all') {
  exploreList.innerHTML = '';
  exploreItems
    .filter((item) => filter === 'all' || item.category === filter)
    .forEach((item) => {
      const card = document.createElement('div');
      card.className = 'explore-card';
      card.innerHTML = `
        <div class="card-header">
          <div>
            <p class="eyebrow">${item.category}</p>
            <h3>${item.name}</h3>
          </div>
          <span class="badge">GET /api/explore</span>
        </div>
        <p class="lede">${item.persona} · follow or chat to open /api/marai/${item.id}/chat-session.</p>
        <div class="actions">
          <button class="ghost" data-action="follow" data-id="${item.id}">Follow</button>
          <button class="ghost" data-action="chat" data-id="${item.id}">Start chat</button>
        </div>
      `;
      exploreList.appendChild(card);
    });
}

exploreForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = exploreCategory.value;
  const cursor = exploreCursor.value || 'latest';
  exploreStatus.textContent = `GET /api/explore?category=${category}&cursor=${cursor}`;
  simulateApi(`/api/explore?category=${category}&cursor=${cursor}`).then(() => {
    exploreStatus.textContent = `Loaded ${category} feed from cursor ${cursor}`;
    renderExplore(category);
  });
});

exploreList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const endpoint = btn.dataset.action === 'follow' ? `/api/marai/${id}/follow` : `/api/marai/${id}/chat-session`;
  exploreActionStatus.textContent = `Calling ${endpoint}`;
  simulateApi(endpoint).then(() => {
    exploreActionStatus.textContent = btn.dataset.action === 'follow' ? `Followed ${id}` : `Chat started for ${id}`;
  });
});

renderExplore();

// Dreams
const dreamList = document.getElementById('dream-list');
const dreamFilter = document.getElementById('dream-filter');
const dreamMood = document.getElementById('dream-mood');
const dreamStatus = document.getElementById('dream-status');
const dreamDetail = document.getElementById('dream-detail');
const dreamDetailStatus = document.getElementById('dream-detail-status');

const dreams = [
  {
    id: 'd1',
    mood: 'calm',
    caption: 'Moonlit rails humming softly.',
    detail: 'Widescreen shot; lavender fog; gentle soundtrack.',
  },
  {
    id: 'd2',
    mood: 'bright',
    caption: 'Petal storms over neon rivers.',
    detail: 'Vivid gradients; upbeat tempo; hopeful pacing.',
  },
  {
    id: 'd3',
    mood: 'moody',
    caption: 'Glass towers breathing fog.',
    detail: 'Low saturation; noir lighting; whispering echoes.',
  },
];

function renderDreams(filter = 'all') {
  dreamList.innerHTML = '';
  dreams
    .filter((dream) => filter === 'all' || dream.mood === filter)
    .forEach((dream) => {
      const card = document.createElement('div');
      card.className = 'dream-card';
      card.innerHTML = `
        <div class="card-header">
          <div>
            <p class="eyebrow">${dream.mood}</p>
            <h3>${dream.caption}</h3>
          </div>
          <div class="actions">
            <button class="ghost view" data-id="${dream.id}">View</button>
            <button class="ghost regen" data-id="${dream.id}">Regenerate</button>
            <button class="ghost share" data-id="${dream.id}">Share</button>
          </div>
        </div>
        <p class="lede">GET /api/dreams/${dream.id} for detail; actions patch diary entries.</p>
      `;
      dreamList.appendChild(card);
    });
}

function showDreamDetail(dream) {
  dreamDetail.innerHTML = `
    <p class="eyebrow">${dream.mood}</p>
    <h4>${dream.caption}</h4>
    <p class="lede">${dream.detail}</p>
  `;
}

dreamFilter.addEventListener('submit', (e) => {
  e.preventDefault();
  const mood = dreamMood.value;
  dreamStatus.textContent = `GET /api/dreams?mood=${mood}`;
  simulateApi(`/api/dreams?mood=${mood}`).then(() => {
    dreamStatus.textContent = `Loaded ${mood} dreams`;
    renderDreams(mood);
  });
});

dreamList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const dream = dreams.find((d) => d.id === id);
  if (!dream) return;
  if (btn.classList.contains('view')) {
    dreamDetailStatus.textContent = `Fetching /api/dreams/${id}`;
    simulateApi(`/api/dreams/${id}`).then(() => {
      dreamDetailStatus.textContent = `Loaded /api/dreams/${id}`;
      showDreamDetail(dream);
    });
    return;
  }
  btn.textContent = 'Working…';
  const endpoint = btn.classList.contains('regen')
    ? `/api/dreams/${id}/regenerate`
    : `/api/dreams/${id}/share`;
  simulateApi(endpoint).then(() => {
    btn.textContent = 'Done';
    dreamDetailStatus.textContent = `${btn.classList.contains('regen') ? 'Regenerated' : 'Shared'} ${id}`;
  });
});

renderDreams();

// Brand Hub
const brandLoadBtn = document.getElementById('brand-load');
const brandLoadStatus = document.getElementById('brand-load-status');
const brandPrompt = document.getElementById('brand-prompt');
const brandGenerateBtn = document.getElementById('brand-generate');
const brandGenerateStatus = document.getElementById('brand-generate-status');
const brandPreferencesForm = document.getElementById('brand-preferences');
const brandPalette = document.getElementById('brand-palette');
const brandTone = document.getElementById('brand-tone');
const brandPrefStatus = document.getElementById('brand-pref-status');

brandLoadBtn.addEventListener('click', () => {
  brandLoadStatus.textContent = 'GET /api/brand-ai';
  simulateApi('/api/brand-ai').then(() => {
    brandLoadStatus.textContent = 'Brand defaults hydrated';
  });
});

brandGenerateBtn.addEventListener('click', () => {
  brandGenerateStatus.textContent = 'Submitting scene job…';
  simulateApi('/api/brand-ai/scene', { prompt: brandPrompt.value }).then(() => {
    brandGenerateStatus.textContent = 'Scene generated with brand safety';
  });
});

brandPreferencesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  brandPrefStatus.textContent = 'Saving preferences…';
  simulateApi('/api/brand-ai/preferences', { palette: brandPalette.value, tone: brandTone.value }).then(() => {
    brandPrefStatus.textContent = 'Preferences stored';
  });
});

// Story Studio
let currentJobId = '';
const videoJobForm = document.getElementById('video-job-form');
const videoPrompt = document.getElementById('video-prompt');
const videoResolution = document.getElementById('video-resolution');
const videoJobStatus = document.getElementById('video-job-status');
const videoJobIdEl = document.getElementById('video-job-id');
const videoPollBtn = document.getElementById('video-poll');
const videoExportBtn = document.getElementById('video-export');
const videoPollStatus = document.getElementById('video-poll-status');
const presetForm = document.getElementById('preset-form');
const presetName = document.getElementById('preset-name');
const presetStyle = document.getElementById('preset-style');
const presetStatus = document.getElementById('preset-status');
const presetList = document.getElementById('preset-list');

let presets = [
  ['Soft bloom', 'cinematic'],
  ['Kinetic dance', 'lofi'],
];

function renderPresets() {
  presetList.innerHTML = '';
  presets.forEach(([name, style]) => {
    const row = document.createElement('li');
    row.className = 'stat-item';
    row.innerHTML = `<span>${name}</span><strong>${style}</strong>`;
    presetList.appendChild(row);
  });
}

videoJobForm.addEventListener('submit', (e) => {
  e.preventDefault();
  videoJobStatus.textContent = 'POST /api/video-jobs';
  simulateApi('/api/video-jobs', { prompt: videoPrompt.value, resolution: videoResolution.value }).then(() => {
    currentJobId = `job_${Date.now()}`;
    videoJobStatus.textContent = `Submitted as ${currentJobId}`;
    videoJobIdEl.textContent = `Job ID ${currentJobId}`;
  });
});

videoPollBtn.addEventListener('click', () => {
  if (!currentJobId) {
    videoPollStatus.textContent = 'Submit a job first';
    return;
  }
  videoPollStatus.textContent = `GET /api/video-jobs/${currentJobId}`;
  simulateApi(`/api/video-jobs/${currentJobId}`).then(() => {
    videoPollStatus.textContent = 'Progress: ready to export';
  });
});

videoExportBtn.addEventListener('click', () => {
  if (!currentJobId) {
    videoPollStatus.textContent = 'No job to export';
    return;
  }
  videoPollStatus.textContent = `POST /api/video-jobs/${currentJobId}/export`;
  simulateApi(`/api/video-jobs/${currentJobId}/export`).then(() => {
    videoPollStatus.textContent = 'Export ready';
  });
});

presetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  presetStatus.textContent = 'POST /api/video-presets';
  simulateApi('/api/video-presets', { name: presetName.value, style: presetStyle.value }).then(() => {
    presetStatus.textContent = 'Preset saved';
    presets = [...presets, [presetName.value, presetStyle.value]];
    renderPresets();
  });
});

renderPresets();

// Admin
const adminMetrics = document.getElementById('admin-metrics');
const adminOverviewStatus = document.getElementById('admin-overview-status');
const adminStatus = document.getElementById('admin-status');
const clusterStatus = document.getElementById('cluster-status');
const personaClusters = document.getElementById('persona-clusters');
const adminSearchForm = document.getElementById('admin-search-form');
const adminSearchStatus = document.getElementById('admin-search-status');
const adminSearchResults = document.getElementById('admin-search-results');
const birthForm = document.getElementById('birth-form');
const auctionForm = document.getElementById('auction-form');
const tokenForm = document.getElementById('token-form');
const auctionStatus = document.getElementById('auction-status');
const tokenStatus = document.getElementById('token-status');
let adminHydrated = false;

function hydrateAdmin() {
  if (adminHydrated) return;
  fetchAdminOverview();
  fetchPersonaClusters();
  adminHydrated = true;
}

function fetchAdminOverview() {
  adminOverviewStatus.textContent = 'GET /api/admin/overview…';
  const mockResponse = {
    metrics: [
      ['Active MarAI', '1.2k'],
      ['Dreams today', '3.4k'],
      ['Avg bond strength', '78%'],
    ],
    alerts: ['No anomalies detected'],
  };
  simulateApi('/api/admin/overview', {}, mockResponse).then((data) => {
    adminMetrics.innerHTML = '';
    data.metrics.forEach(([label, value]) => {
      const row = document.createElement('li');
      row.className = 'stat-item';
      row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      adminMetrics.appendChild(row);
    });
    data.alerts.forEach((alert) => {
      const row = document.createElement('li');
      row.className = 'stat-item';
      row.innerHTML = `<span>Alert</span><strong>${alert}</strong>`;
      adminMetrics.appendChild(row);
    });
    adminOverviewStatus.textContent = 'Overview synced';
    logAnalytics('admin_fetch', { endpoint: '/api/admin/overview' });
  });
}

function fetchPersonaClusters() {
  clusterStatus.textContent = 'GET /api/admin/persona-clusters…';
  const mockClusters = {
    clusters: [
      { name: 'Dream Weavers', size: 420, cohesion: '0.82' },
      { name: 'Brand Guardians', size: 88, cohesion: '0.71' },
      { name: 'Explorers', size: 190, cohesion: '0.63' },
    ],
  };
  simulateApi('/api/admin/persona-clusters', {}, mockClusters).then((data) => {
    personaClusters.innerHTML = '';
    data.clusters.forEach((cluster) => {
      const row = document.createElement('li');
      row.className = 'stat-item';
      row.innerHTML = `<span>${cluster.name}</span><strong>${cluster.size} · cohesion ${cluster.cohesion}</strong>`;
      personaClusters.appendChild(row);
    });
    clusterStatus.textContent = 'Clusters refreshed';
    logAnalytics('admin_fetch', { endpoint: '/api/admin/persona-clusters' });
  });
}

adminSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!hasAdminRole()) {
    adminSearchStatus.textContent = 'Search blocked: admin role required';
    return;
  }
  const query = document.getElementById('admin-search').value.trim();
  if (!query) {
    adminSearchStatus.textContent = 'Enter a query to search';
    return;
  }
  adminSearchStatus.textContent = 'GET /api/admin/search…';
  const mockResults = {
    results: [
      { name: 'RenAI', type: 'persona', cluster: 'Dream Weavers' },
      { name: 'KoiAI', type: 'persona', cluster: 'Explorers' },
      { name: 'Brand Nova', type: 'brand', cluster: 'Brand Guardians' },
    ].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
  };
  simulateApi('/api/admin/search', { query }, mockResults).then((data) => {
    adminSearchResults.innerHTML = '';
    if (!data.results.length) {
      adminSearchResults.innerHTML = '<li class="stat-item">No results</li>';
    } else {
      data.results.forEach((item) => {
        const row = document.createElement('li');
        row.className = 'stat-item';
        row.innerHTML = `<span>${item.type}</span><strong>${item.name} · ${item.cluster}</strong>`;
        adminSearchResults.appendChild(row);
      });
    }
    adminSearchStatus.textContent = 'Search complete';
    logAnalytics('admin_fetch', { endpoint: '/api/admin/search', query });
  });
});

birthForm.addEventListener('submit', (e) => {
  e.preventDefault();
  confirmAndSend(
    '/api/admin/birth-rate',
    { target: Number(document.getElementById('birth-rate').value) },
    adminStatus,
    'Apply new birth rate with audit logging?'
  );
});

auctionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  confirmAndSend(
    '/api/admin/auction-actions',
    { action: document.getElementById('auction-action').value },
    auctionStatus,
    'Confirm sending auction directive?'
  );
});

tokenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  confirmAndSend(
    '/api/admin/token-actions',
    { action: document.getElementById('token-action').value },
    tokenStatus,
    'Confirm token control action?'
  );
});

document.getElementById('audit-log').addEventListener('click', () => {
  adminStatus.textContent = 'Audit log downloaded';
  logAnalytics('admin_fetch', { endpoint: '/api/admin/audit-log' });
});

function confirmAndSend(endpoint, payload, statusEl, confirmation) {
  if (!hasAdminRole()) {
    statusEl.textContent = 'Blocked: admin role required';
    return;
  }
  const confirmed = window.confirm(confirmation);
  if (!confirmed) {
    statusEl.textContent = 'Cancelled';
    return;
  }
  statusEl.textContent = `POST ${endpoint}…`;
  simulateApi(endpoint, payload).then(() => {
    statusEl.textContent = 'Stored with audit trail';
    logAnalytics('admin_write', { endpoint });
  });
}
