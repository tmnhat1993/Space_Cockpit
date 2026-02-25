/**
 * YouTube - Thêm / phát / xóa video trong Hệ thống Âm thanh
 */

export let ytTracks = JSON.parse(localStorage.getItem('sc_yt') || '[]');
export let currentYT = null;
export let isPaused = false;

export function extractVideoId(input) {
  input = input.trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function getVideoTitle(id) {
  return `Track-${id.slice(0, 6)}`;
}

function saveYT() {
  localStorage.setItem('sc_yt', JSON.stringify(ytTracks));
}

export function renderYT() {
  const list = document.getElementById('ytList');
  if (!list) return;
  list.innerHTML = '';
  ytTracks.forEach((t) => {
    const div = document.createElement('div');
    div.className = 'yt-item' + (currentYT === t.id ? ' playing' : '');
    div.innerHTML = `<span class="yt-name" data-yt-play="${t.id}" style="cursor:pointer">▶ ${escapeHtml(t.title)}</span>
      <span class="yt-del" data-yt-remove="${t.id}">✕</span>`;
    list.appendChild(div);
  });
  // Event delegation
  list.querySelectorAll('[data-yt-play]').forEach((el) => {
    el.addEventListener('click', () => playYT(el.dataset.ytPlay));
  });
  list.querySelectorAll('[data-yt-remove]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      removeYT(el.dataset.ytRemove);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export async function addYT() {
  const input = document.getElementById('ytInput');
  const val = input?.value.trim();
  if (!val) return;
  const id = extractVideoId(val);
  if (!id) {
    alert('Link YouTube không hợp lệ!');
    return;
  }
  if (ytTracks.find((t) => t.id === id)) {
    alert('Đã có trong danh sách!');
    return;
  }
  const title = await getVideoTitle(id);
  ytTracks.push({ id, title });
  saveYT();
  renderYT();
  input.value = '';
  if (ytTracks.length === 1) playYT(id);
}

function buildEmbedUrl(id, autoplay = true) {
  const params = new URLSearchParams({ loop: '1', playlist: id });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function playYT(id) {
  currentYT = id;
  isPaused = false;
  closeYTDrawer();
  const area = document.getElementById('ytPlayerArea');
  if (!area) return;
  area.outerHTML = `<div id="ytPlayerArea" class="yt-player-wrap"><iframe src="${buildEmbedUrl(id, true)}" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
  renderYT();
  updatePauseButtonLabel();
}

let ytDrawerOpen = false;

export function toggleYTDrawer() {
  ytDrawerOpen = !ytDrawerOpen;
  const drawer = document.getElementById('ytDrawer');
  const overlay = document.getElementById('ytDrawerOverlay');
  if (drawer) drawer.classList.toggle('is-open', ytDrawerOpen);
  if (overlay) {
    overlay.classList.toggle('is-visible', ytDrawerOpen);
    overlay.setAttribute('aria-hidden', !ytDrawerOpen);
  }
}

export function closeYTDrawer() {
  if (!ytDrawerOpen) return;
  ytDrawerOpen = false;
  const drawer = document.getElementById('ytDrawer');
  const overlay = document.getElementById('ytDrawerOverlay');
  if (drawer) drawer.classList.remove('is-open');
  if (overlay) {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

export function nextYT() {
  if (!ytTracks.length) return;
  const idx = ytTracks.findIndex((t) => t.id === currentYT);
  const nextIdx = idx < 0 ? 0 : (idx + 1) % ytTracks.length;
  playYT(ytTracks[nextIdx].id);
}

export function togglePauseYT() {
  if (!currentYT) return;
  isPaused = !isPaused;
  const area = document.getElementById('ytPlayerArea');
  if (!area) return;
  const wrap = area.closest('.yt-player-wrap');
  if (wrap) {
    const iframe = wrap.querySelector('iframe');
    if (iframe) iframe.src = buildEmbedUrl(currentYT, !isPaused);
  }
  updatePauseButtonLabel();
}

function updatePauseButtonLabel() {
  const btn = document.getElementById('ytBtnPause');
  if (btn) btn.textContent = isPaused ? '▶' : '⏸';
}

export function removeCurrentYT() {
  if (!currentYT) return;
  removeYT(currentYT);
}

export function removeYT(id) {
  ytTracks = ytTracks.filter((t) => t.id !== id);
  if (currentYT === id) {
    currentYT = null;
    isPaused = false;
    const area = document.getElementById('ytPlayerArea');
    if (area) {
      area.outerHTML = `<div id="ytPlayerArea" class="no-video">— KHÔNG CÓ TÍN HIỆU —</div>`;
    }
    updatePauseButtonLabel();
  }
  saveYT();
  renderYT();
}
