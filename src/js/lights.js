/**
 * Lights - Đèn môi trường / theme màu giao diện
 */

export const lightThemes = {
  blue: { accent: '#00d4ff', accent2: '#0066ff', filter: null },
  green: { accent: '#00ff88', accent2: '#00aa55', filter: 'rgba(0,60,20,0.08)' },
  red: { accent: '#ff3355', accent2: '#cc0030', filter: 'rgba(60,0,10,0.1)' },
  purple: { accent: '#cc44ff', accent2: '#8800cc', filter: 'rgba(40,0,60,0.1)' },
  pink: { accent: '#ff69b4', accent2: '#ff1493', filter: 'rgba(60,0,30,0.08)' },
};

let currentLight = 'blue';

export function setLight(color) {
  currentLight = color;
  const theme = lightThemes[color];
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent2', theme.accent2);
  document.documentElement.style.setProperty('--glow', theme.accent + '66');

  const cf = document.getElementById('colorFilter');
  if (cf) {
    if (theme.filter) {
      cf.style.background = theme.filter;
      cf.style.opacity = '1';
    } else {
      cf.style.opacity = '0';
    }
  }

  document.querySelectorAll('.light-btn').forEach((b) => b.classList.remove('active'));
  const btn = document.querySelector('.light-btn.' + color);
  if (btn) btn.classList.add('active');
  localStorage.setItem('sc_light', color);
}

export function getCurrentLight() {
  return currentLight;
}
