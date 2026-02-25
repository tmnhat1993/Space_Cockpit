/**
 * Space Cockpit - Entry point
 * ES6 modules + SCSS
 */

import './scss/main.scss';
import { boot } from './js/app.js';
import { setLight } from './js/lights.js';
import { addYT, playYT, removeYT, nextYT, togglePauseYT, removeCurrentYT, toggleYTDrawer } from './js/youtube.js';
import { addTodo, toggleTodo, deleteTodo, toggleTodoDrawer } from './js/todo.js';
import { startCockpit } from './js/onboarding.js';

// Expose cho onclick trong HTML (giữ cấu trúc cũ)
window.setLight = setLight;
window.addYT = addYT;
window.playYT = playYT;
window.removeYT = removeYT;
window.nextYT = nextYT;
window.togglePauseYT = togglePauseYT;
window.removeCurrentYT = removeCurrentYT;
window.toggleYTDrawer = toggleYTDrawer;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.toggleTodoDrawer = toggleTodoDrawer;
window.startCockpit = startCockpit;
window.toggleFullscreen = toggleFullscreen;

window.addEventListener('load', boot);

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().then(() => updateFullscreenButton(false)).catch(() => {});
    return;
  }
  document.documentElement.requestFullscreen?.().then(() => updateFullscreenButton(true)).catch(() => {});
}

function updateFullscreenButton(isFullscreen) {
  const btn = document.getElementById('btnFullscreen');
  if (!btn) return;
  const icon = btn.querySelector('.btn-fullscreen__icon');
  const label = btn.querySelector('.btn-fullscreen__label');
  if (isFullscreen) {
    btn.classList.add('is-fullscreen');
    btn.title = 'Thoát toàn màn hình (hoặc bấm lại nút này)';
    btn.setAttribute('aria-label', 'Thoát toàn màn hình');
    if (icon) icon.textContent = '⤡';
    if (label) label.textContent = 'Thoát';
  } else {
    btn.classList.remove('is-fullscreen');
    btn.title = 'Toàn màn hình';
    btn.setAttribute('aria-label', 'Bật toàn màn hình');
    if (icon) icon.textContent = '⤢';
  }
}

document.addEventListener('fullscreenchange', () => {
  updateFullscreenButton(!!document.fullscreenElement);
});
