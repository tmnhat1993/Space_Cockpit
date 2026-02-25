/**
 * Onboarding - Màn hình khởi động, nhập tên phi hành gia
 */

import { setLight } from './lights.js';
import { renderYT, playYT, ytTracks, currentYT } from './youtube.js';
import { renderTodos } from './todo.js';

export function startCockpit() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput?.value.trim();
  if (!name) {
    if (nameInput) nameInput.style.borderColor = '#ff3355';
    return;
  }
  localStorage.setItem('sc_name', name);
  const onboarding = document.getElementById('onboarding');
  if (onboarding) {
    onboarding.style.opacity = '0';
    onboarding.style.transition = 'opacity 1s';
    setTimeout(() => {
      onboarding.style.display = 'none';
    }, 1000);
  }
  initCockpit(name);
}

export function initCockpit(name) {
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.textContent = `⟡ CHÀO MỪNG, PHI HÀNH GIA ${name.toUpperCase()} ⟡`;
  }

  const savedLight = localStorage.getItem('sc_light') || 'blue';
  setLight(savedLight);

  renderYT();
  renderTodos();

  if (ytTracks.length > 0 && !currentYT) {
    playYT(ytTracks[0].id);
  }
}
