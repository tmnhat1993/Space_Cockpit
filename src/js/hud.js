/**
 * HUD - Cập nhật tốc độ, độ cao, tọa độ giả lập + center thông số + sa bàn nghiêng
 */

let centerPitch = -2;
let centerRoll = 1;
let angleXZ = 3;
let angleXY = -4;

export function updateHUD() {
  const vel = (0.8 + Math.random() * 0.05).toFixed(3) + 'c';
  const alt = (280000 + Math.floor(Math.random() * 10000)).toLocaleString() + ' km';
  const x = (-4271 + (Math.random() - 0.5) * 5).toFixed(1);
  const y = '+' + (8834 + (Math.random() - 0.5) * 5).toFixed(1);
  const z = '+' + (1203 + (Math.random() - 0.5) * 3).toFixed(1);

  const velEl = document.getElementById('hudVel');
  const altEl = document.getElementById('hudAlt');
  const xEl = document.getElementById('hudX');
  const yEl = document.getElementById('hudY');
  const zEl = document.getElementById('hudZ');
  if (velEl) velEl.textContent = vel;
  if (altEl) altEl.textContent = alt;
  if (xEl) xEl.textContent = x;
  if (yEl) yEl.textContent = y;
  if (zEl) zEl.textContent = z;

  // Center HUD: meter trực quan + giá trị số
  const velNum = parseFloat(vel);
  const altNum = parseInt(alt.replace(/\s/g, ''), 10);
  centerPitch = -3 + Math.random() * 4;
  centerRoll = -2 + Math.random() * 4;

  const cVel = document.getElementById('centerVel');
  const cAlt = document.getElementById('centerAlt');
  const cPitch = document.getElementById('centerPitch');
  const cRoll = document.getElementById('centerRoll');
  const meterVelFill = document.getElementById('meterVelFill');
  const meterAltFill = document.getElementById('meterAltFill');
  const meterPitchFill = document.getElementById('meterPitchFill');
  const meterRollFill = document.getElementById('meterRollFill');

  if (cVel) cVel.textContent = vel;
  if (cAlt) cAlt.textContent = alt;
  if (cPitch) cPitch.textContent = centerPitch.toFixed(1) + '°';
  if (cRoll) cRoll.textContent = (centerRoll >= 0 ? '+' : '') + centerRoll.toFixed(1) + '°';

  // VEL 0.75–0.9c → 0–100%
  if (meterVelFill) meterVelFill.style.setProperty('--fill', String(Math.round(Math.max(0, Math.min(100, (velNum - 0.75) / 0.15 * 100)))));
  // ALT 250k–300k km → 0–100%
  if (meterAltFill) meterAltFill.style.setProperty('--fill', String(Math.round(Math.max(0, Math.min(100, (altNum - 250000) / 50000 * 100)))));
  // PITCH/ROLL -15°..+15° → 0..100 (50 = 0°)
  const pitchFill = Math.max(0, Math.min(100, 50 + (centerPitch / 15) * 50));
  const rollFill = Math.max(0, Math.min(100, 50 + (centerRoll / 15) * 50));
  if (meterPitchFill) meterPitchFill.style.setProperty('--fill', String(pitchFill));
  if (meterRollFill) meterRollFill.style.setProperty('--fill', String(rollFill));
}

export function startHUD() {
  setInterval(updateHUD, 3000);
  updateHUD();
}

// Tham chiếu cache để tránh query DOM mỗi frame
let tiltInnerEl = null;
let tiltPlaneXZEl = null;
let tiltPlaneXYEl = null;
let tiltAnimationId = null;

function updateTiltDashboard() {
  if (!tiltInnerEl) tiltInnerEl = document.getElementById('tiltInner');
  if (!tiltPlaneXZEl) tiltPlaneXZEl = document.getElementById('tiltPlaneXZ');
  if (!tiltPlaneXYEl) tiltPlaneXYEl = document.getElementById('tiltPlaneXY');
  if (!tiltInnerEl) return;

  // Đĩa chính
  centerPitch += (Math.random() - 0.5) * 1.2;
  centerRoll += (Math.random() - 0.5) * 1.2;
  centerPitch = Math.max(-12, Math.min(12, centerPitch));
  centerRoll = Math.max(-12, Math.min(12, centerRoll));
  tiltInnerEl.style.transform = `rotateX(${centerPitch}deg) rotateY(${centerRoll}deg)`;

  // Mặt phẳng XZ (thanh ngang) – biên độ nhỏ, chuyển động rõ nhờ transition
  angleXZ += (Math.random() - 0.5) * 1;
  angleXZ = Math.max(-12, Math.min(12, angleXZ));
  if (tiltPlaneXZEl) tiltPlaneXZEl.style.transform = `rotate(${angleXZ}deg)`;

  // Mặt phẳng XY (thanh dọc) – biên độ nhỏ, chuyển động rõ nhờ transition
  angleXY += (Math.random() - 0.5) * 1;
  angleXY = Math.max(-12, Math.min(12, angleXY));
  if (tiltPlaneXYEl) tiltPlaneXYEl.style.transform = `rotate(${angleXY}deg)`;

  tiltAnimationId = requestAnimationFrame(updateTiltDashboard);
}

export function startTiltDashboard() {
  if (tiltAnimationId) cancelAnimationFrame(tiltAnimationId);
  tiltInnerEl = null;
  tiltPlaneXZEl = null;
  tiltPlaneXYEl = null;
  function tryStart() {
    tiltInnerEl = document.getElementById('tiltInner');
    tiltPlaneXZEl = document.getElementById('tiltPlaneXZ');
    tiltPlaneXYEl = document.getElementById('tiltPlaneXY');
    if (!tiltInnerEl) {
      requestAnimationFrame(tryStart);
      return;
    }
    if (tiltPlaneXZEl) tiltPlaneXZEl.style.transform = `rotate(${angleXZ}deg)`;
    if (tiltPlaneXYEl) tiltPlaneXYEl.style.transform = `rotate(${angleXY}deg)`;
    tiltAnimationId = requestAnimationFrame(updateTiltDashboard);
  }
  tryStart();
}
