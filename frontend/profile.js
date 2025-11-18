const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');
const cacheIndicator = document.getElementById('cache-indicator');
const chatCta = document.getElementById('chat-cta');

const username = new URLSearchParams(window.location.search).get('username') || 'nova';
const cacheKey = `marai.profile.cache.${username}`;
const cacheTtlMs = 5 * 60 * 1000;

let profileState = null;

init();

function init() {
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((btn) => btn.classList.remove('bg-white/10', 'text-white'));
      panels.forEach((panel) => panel.classList.add('hidden'));
      tab.classList.add('bg-white/10', 'text-white');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.remove('hidden');
    })
  );
  tabs[0]?.click();

  loadProfileFromCache();
  fetchAndRenderProfile();

  chatCta.addEventListener('click', handleChatCta);
}

function loadProfileFromCache() {
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return;
  try {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < cacheTtlMs) {
      cacheIndicator.textContent = `Cached ${(Date.now() - parsed.timestamp) / 1000}s ago`;
      profileState = parsed.data;
      renderProfile(parsed.data, true);
    }
  } catch (error) {
    console.error('Failed to parse cache', error);
  }
}

async function fetchAndRenderProfile() {
  try {
    const data = await fetchProfileData();
    profileState = data;
    renderProfile(data, false);
    cacheIndicator.textContent = 'Fresh';
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Unable to load profile', 'error');
  }
}

async function fetchProfileData() {
  const profile = await apiRequest(`/api/profile/${username}`);
  const maraiId = profile.maraiId || 'marai-1';
  const [posts, dreams, evolution, marai] = await Promise.all([
    apiRequest(`/api/profile/${username}/posts`),
    apiRequest('/dreams'),
    apiRequest('/evolution'),
    apiRequest(`/api/marai/${maraiId}`),
  ]);
  return { profile, posts, dreams, evolution, marai };
}

function renderProfile(data, fromCache) {
  if (!data) return;
  const { profile, posts, dreams, evolution, marai } = data;
  applyTheme(profile.theme);
  document.getElementById('profile-title').textContent = `${profile.name}'s profile`;
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-username').textContent = `@${username}`;
  document.getElementById('profile-bio').textContent = profile.bio;
  document.getElementById('profile-role').textContent = profile.role;
  document.getElementById('profile-avatar').style.backgroundImage = `url(${profile.avatar})`;
  renderFlags(profile.privacy);

  renderBondMeter(marai?.bondScore ?? 0);
  renderEmotionBars(marai?.emotions ?? []);
  renderList(posts, document.getElementById('posts-list'), 'No posts yet');
  renderList(dreams, document.getElementById('dreams-list'), 'No dreams yet');
  renderEvolution(evolution);
  renderMarai(marai);

  const cachedText = fromCache ? cacheIndicator.textContent : 'Fresh';
  cacheIndicator.textContent = cachedText;
  cacheIndicator.className = fromCache ? 'text-xs text-amber-300' : 'text-xs text-emerald-300';

  updateChatCta(profile, marai);
}

function renderFlags(flags = {}) {
  const container = document.getElementById('profile-flags');
  container.innerHTML = '';
  const entries = [
    flags.privateProfile ? 'Private' : 'Discoverable',
    flags.allowChat === false ? 'Chat disabled' : 'Chat ready',
    flags.recordingOptOut ? 'No logging' : 'Logging ok',
  ];
  entries.forEach((text) => {
    const badge = document.createElement('span');
    badge.className = 'rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-white/70';
    badge.textContent = text;
    container.appendChild(badge);
  });
}

function renderBondMeter(score) {
  const container = document.getElementById('bond-meter');
  container.innerHTML = '';
  const clamped = Math.max(0, Math.min(score, 100));
  document.getElementById('bond-score-label').textContent = `${clamped}%`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 160 90');
  svg.setAttribute('class', 'w-full max-w-md');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.id = 'bondGradient';
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="#ee2bcd" />
    <stop offset="100%" stop-color="#38bdf8" />
  `;
  defs.appendChild(gradient);
  svg.appendChild(defs);

  const backgroundArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  backgroundArc.setAttribute('d', describeArc(80, 80, 72, 180, 0));
  backgroundArc.setAttribute('stroke', 'rgba(255,255,255,0.15)');
  backgroundArc.setAttribute('stroke-width', '12');
  backgroundArc.setAttribute('fill', 'none');
  svg.appendChild(backgroundArc);

  const activeArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  activeArc.setAttribute('d', describeArc(80, 80, 72, 180, (clamped / 100) * 180));
  activeArc.setAttribute('stroke', 'url(#bondGradient)');
  activeArc.setAttribute('stroke-width', '12');
  activeArc.setAttribute('fill', 'none');
  activeArc.setAttribute('stroke-linecap', 'round');
  svg.appendChild(activeArc);

  const pointerAngle = 180 - (clamped / 100) * 180;
  const pointerX = 80 + 64 * Math.cos((pointerAngle * Math.PI) / 180);
  const pointerY = 80 - 64 * Math.sin((pointerAngle * Math.PI) / 180);
  const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  pointer.setAttribute('cx', pointerX);
  pointer.setAttribute('cy', pointerY);
  pointer.setAttribute('r', 7);
  pointer.setAttribute('fill', '#fff');
  pointer.setAttribute('stroke', '#0f172a');
  pointer.setAttribute('stroke-width', '2');
  svg.appendChild(pointer);

  container.appendChild(svg);
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function renderEmotionBars(emotions) {
  const container = document.getElementById('emotion-bars');
  container.innerHTML = '';
  if (!emotions.length) {
    container.textContent = 'No emotional state available.';
    return;
  }
  const dominant = emotions.reduce((best, current) => (current.value > best.value ? current : best), emotions[0]);
  document.getElementById('dominant-emotion').textContent = `${dominant.label} · ${dominant.value}%`;

  emotions.forEach((emotion) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-1';

    const label = document.createElement('div');
    label.className = 'flex items-center justify-between text-xs text-white/70';
    label.textContent = emotion.label;

    const bar = document.createElement('div');
    bar.className = 'h-3 rounded-full bg-white/10';

    const fill = document.createElement('div');
    fill.className = 'h-full rounded-full';
    fill.style.width = `${emotion.value}%`;
    fill.style.background = emotion.color || 'linear-gradient(90deg,#ee2bcd,#38bdf8)';

    bar.appendChild(fill);
    wrapper.appendChild(label);
    wrapper.appendChild(bar);
    container.appendChild(wrapper);
  });
}

function renderList(items, target, emptyText) {
  target.innerHTML = '';
  if (!items?.length) {
    target.innerHTML = `<p class="text-sm text-white/60">${emptyText}</p>`;
    return;
  }
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'rounded-xl border border-white/10 bg-white/5 p-3';
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-white/60">${item.type || 'Entry'}</p>
          <h4 class="font-display text-lg font-semibold text-white">${item.title || item.caption}</h4>
        </div>
        <span class="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">${item.timestamp || 'Just now'}</span>
      </div>
      <p class="mt-2 text-sm text-white/80">${item.text || item.summary || ''}</p>
    `;
    target.appendChild(card);
  });
}

function renderEvolution(evolution) {
  const target = document.getElementById('evolution-metrics');
  target.innerHTML = '';
  if (!evolution?.metrics?.length) {
    target.innerHTML = '<p class="text-sm text-white/60">No evolution metrics yet.</p>';
    return;
  }
  evolution.metrics.forEach((metric) => {
    const card = document.createElement('div');
    card.className = 'rounded-xl border border-white/10 bg-white/5 p-4';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.16em] text-white/60">${metric.label}</p>
          <h4 class="font-display text-2xl font-semibold text-white">${metric.value}</h4>
        </div>
        <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">${metric.badge}</span>
      </div>
      <p class="mt-2 text-sm text-white/70">${metric.description}</p>
    `;
    target.appendChild(card);
  });
  if (evolution.badges?.length) {
    const badgeRow = document.createElement('div');
    badgeRow.className = 'col-span-full flex flex-wrap gap-2';
    evolution.badges.forEach((badge) => {
      const pill = document.createElement('span');
      pill.className = 'rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/80';
      pill.textContent = badge;
      badgeRow.appendChild(pill);
    });
    target.appendChild(badgeRow);
  }
}

function renderMarai(marai) {
  const target = document.getElementById('marai-card');
  target.innerHTML = '';
  if (!marai) return;
  const privacy = marai.privacy || {};
  const about = document.createElement('div');
  about.className = 'rounded-xl border border-white/10 bg-white/5 p-4';
  about.innerHTML = `
    <p class="text-xs uppercase tracking-[0.2em] text-white/60">MarAI Persona</p>
    <h4 class="font-display text-xl font-semibold text-white">${marai.name}</h4>
    <p class="mt-2 text-sm text-white/70">${marai.description}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      ${marai.traits
        .map((trait) => `<span class="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">${trait}</span>`)
        .join('')}
    </div>
  `;

  const stats = document.createElement('div');
  stats.className = 'rounded-xl border border-white/10 bg-white/5 p-4';
  stats.innerHTML = `
    <p class="text-xs uppercase tracking-[0.2em] text-white/60">Safety & Privacy</p>
    <ul class="mt-2 space-y-2 text-sm text-white/80">
      <li class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base">visibility_off</span>
        <span>${privacy.allowChat === false ? 'Chat disabled by privacy settings' : 'Chat allowed with consent flags honored'}</span>
      </li>
      <li class="flex items-center gap-2">
        <span class="material-symbols-outlined text-base">shield_person</span>
        <span>${privacy.recordingOptOut ? 'Sessions unlogged by request' : 'Sessions may be logged for quality'}</span>
      </li>
    </ul>
  `;

  target.appendChild(about);
  target.appendChild(stats);
}

function applyTheme(theme = {}) {
  const root = document.documentElement;
  if (theme.mode === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
  if (theme.accent) root.style.setProperty('--theme-accent', theme.accent);
  if (theme.surface) root.style.setProperty('--theme-surface', theme.surface);
  if (theme.card) root.style.setProperty('--theme-card', theme.card);
  document.body.style.backgroundColor = theme.surface || '#10121b';
}

function updateChatCta(profile, marai) {
  const blocked = profile.privacy?.allowChat === false || marai?.privacy?.allowChat === false;
  chatCta.disabled = blocked;
  chatCta.title = blocked ? 'Chat disabled for this profile' : 'Start a new session';
}

async function handleChatCta() {
  if (!profileState) return;
  const maraiId = profileState.marai?.id || 'marai-1';
  if (profileState.profile.privacy?.allowChat === false || profileState.marai?.privacy?.allowChat === false) {
    showToast('Chat disabled by privacy preferences', 'error');
    return;
  }
  const done = optimisticState(chatCta, 'Starting…', 'Start chat with MarAI');
  try {
    const res = await apiRequest(`/api/marai/${maraiId}/chat-session`, { method: 'POST', body: { username } });
    showToast(`Session ${res.sessionId || 'created'} for @${username}`, 'success');
  } catch (error) {
    showToast(error.message || 'Unable to start chat', 'error');
  } finally {
    done();
  }
}
