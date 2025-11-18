const panels = document.querySelectorAll('.panel');
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    panels.forEach((p) => p.classList.remove('active'));
    navButtons.forEach((b) => b.classList.remove('active'));
    document.getElementById(btn.dataset.target).classList.add('active');
    btn.classList.add('active');
  })
);

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
  simulateApi('/api/auth/login').then(() => {
    authStatus.textContent = 'Session created + profile bootstrapped';
  });
});

registerBtn.addEventListener('click', () => {
  authStatus.textContent = 'Registering new session…';
  simulateApi('/api/auth/register').then(() => {
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
  simulateStreamingProgress(avatarProgress, [18, 45, 70, 100]).then(() => {
    avatarStatus.textContent = `Generated in ${avatarStyle.value} style`; 
    avatarPreview.textContent = '✨ Avatar ready — live preview';
  });
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
  simulateApi('/api/marai/persona', payload).then(() => {
    personaStatus.textContent = 'Persona + MarAI config persisted';
  });
});

persistThemeBtn.addEventListener('click', () => {
  personaStatus.textContent = 'Persisting theme + defaults…';
  simulateApi('/api/profile').then(() => {
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

function simulateApi(endpoint, payload = {}) {
  return new Promise((resolve) => {
    console.log('Mock API', endpoint, payload);
    setTimeout(resolve, 600);
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
  simulateApi(`${action}/${id}`).then(() => {
    btn.textContent = btn.textContent.replace('…optimistic', 'Done');
    post.reactions += 1;
    renderFeed();
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
const exploreItems = [
  { name: 'EveAI', category: 'trending', action: 'Chat' },
  { name: 'MoAI', category: 'most evolved', action: 'Follow' },
  { name: 'LunaAI', category: 'viral dialog', action: 'View' },
  { name: 'Brand Pulse', category: 'brand spot', action: 'Generate' },
];

function renderExplore() {
  exploreList.innerHTML = '';
  exploreItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'explore-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">${item.category}</p>
          <h3>${item.name}</h3>
        </div>
        <button class="ghost">${item.action}</button>
      </div>
      <p class="lede">Discovery action routed to server</p>
    `;
    exploreList.appendChild(card);
  });
}

renderExplore();

// Dreams
const dreamList = document.getElementById('dream-list');
const dreams = [
  { id: 'd1', mood: 'calm', caption: 'Moonlit rails humming softly.' },
  { id: 'd2', mood: 'bright', caption: 'Petal storms over neon rivers.' },
  { id: 'd3', mood: 'moody', caption: 'Glass towers breathing fog.' },
];

function renderDreams() {
  dreamList.innerHTML = '';
  dreams.forEach((dream) => {
    const card = document.createElement('div');
    card.className = 'dream-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <p class="eyebrow">${dream.mood}</p>
          <h3>${dream.caption}</h3>
        </div>
        <div class="actions">
          <button class="ghost regen" data-id="${dream.id}">Regenerate</button>
          <button class="ghost share" data-id="${dream.id}">Share</button>
        </div>
      </div>
      <p class="lede">Diary entry routed to /api/dreams/${dream.id}</p>
    `;
    dreamList.appendChild(card);
  });
}

dreamList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  btn.textContent = 'Working…';
  const endpoint = btn.classList.contains('regen')
    ? `/api/dreams/${id}/regenerate`
    : `/api/dreams/${id}/share`;
  simulateApi(endpoint).then(() => {
    btn.textContent = 'Done';
  });
});

renderDreams();

// Admin
const adminMetrics = document.getElementById('admin-metrics');
const birthForm = document.getElementById('birth-form');
const adminStatus = document.getElementById('admin-status');

aSyncMetrics();

function aSyncMetrics() {
  const metrics = [
    ['Active MarAI', '1.2k'],
    ['Dreams today', '3.4k'],
    ['Avg bond strength', '78%'],
  ];
  adminMetrics.innerHTML = '';
  metrics.forEach(([label, value]) => {
    const row = document.createElement('li');
    row.className = 'stat-item';
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    adminMetrics.appendChild(row);
  });
}

birthForm.addEventListener('submit', (e) => {
  e.preventDefault();
  adminStatus.textContent = 'Saving with audit…';
  simulateApi('/api/admin/birth-rate', { target: Number(document.getElementById('birth-rate').value) }).then(() => {
    adminStatus.textContent = 'Stored with audit trail';
  });
});

document.getElementById('audit-log').addEventListener('click', () => {
  adminStatus.textContent = 'Audit log downloaded';
});
