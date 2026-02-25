/**
 * App - Boot và điều phối (speed animation, restore session)
 */

import { startSpaceCanvas, setSpaceSpeed, getSpaceSpeed } from './spaceCanvas.js';
import { startHUD, startTiltDashboard } from './hud.js';
import { startClock } from './clock.js';
import { initCockpit } from './onboarding.js';

export function boot() {
  const savedName = localStorage.getItem('sc_name');
  if (savedName) {
    const onboarding = document.getElementById('onboarding');
    if (onboarding) onboarding.style.display = 'none';
    initCockpit(savedName);
  } else {
    const nameInput = document.getElementById('nameInput');
    if (nameInput) nameInput.focus();
  }

  startSpaceCanvas();
  startHUD();
  startTiltDashboard();
  startClock();

  // Gentle warp speed fluctuation
  setInterval(() => {
    const targetSpeed = 3 + Math.random() * 9;
    const ti = setInterval(() => {
      setSpaceSpeed(getSpaceSpeed() + (targetSpeed - getSpaceSpeed()) * 0.04);
    }, 50);
    setTimeout(() => clearInterval(ti), 4000);
  }, 6000);
}
