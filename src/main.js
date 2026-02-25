/**
 * Space Cockpit - Entry point
 * ES6 modules + SCSS
 */

import './scss/main.scss';
import { boot } from './js/app.js';
import { setLight } from './js/lights.js';
import { addYT, playYT, removeYT, nextYT, togglePauseYT, removeCurrentYT } from './js/youtube.js';
import { addTodo, toggleTodo, deleteTodo } from './js/todo.js';
import { startCockpit } from './js/onboarding.js';

// Expose cho onclick trong HTML (giữ cấu trúc cũ)
window.setLight = setLight;
window.addYT = addYT;
window.playYT = playYT;
window.removeYT = removeYT;
window.nextYT = nextYT;
window.togglePauseYT = togglePauseYT;
window.removeCurrentYT = removeCurrentYT;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.startCockpit = startCockpit;

window.addEventListener('load', boot);
