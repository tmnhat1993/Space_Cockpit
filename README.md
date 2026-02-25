# Space Cockpit

Chill app mô phỏng quá trình bay trong không gian: canvas sao/hành tinh/tiểu hành tinh, panel YouTube, quản lý task, đèn môi trường (theme).

## Môi trường dev

- **ES6**: modules trong `src/js/`
- **SCSS**: styles trong `src/scss/`
- **Ảnh/assets**: `src/assets/images/`
- **Build**: Vite (dev + production), **PixiJS** cho layer không gian (canvas)

### Lệnh

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # output: dist/
npm run preview # xem bản build
```

### Deploy (base path / prefix assets)

Khi deploy vào thư mục con (vd: GitHub Pages `https://user.github.io/repo/dist/`), cần cấu hình **base path** để JS/CSS/assets load đúng.

- **Cấu hình:** chỉnh `VITE_BASE_PATH` trong **`.env.production`** (hoặc copy từ `.env.example`).
- **Ví dụ hiện tại:** deploy tại `https://tmnhat1993.github.io/Space_Cockpit/dist/` → trong `.env.production` đặt:
  ```bash
  VITE_BASE_PATH=/Space_Cockpit/dist/
  ```
- Sau đó chạy `npm run build`; file trong `dist/` sẽ dùng đường dẫn dạng `/Space_Cockpit/dist/assets/...`. Deploy nguyên nội dung thư mục `dist/` lên đúng path tương ứng trên server.

## Cấu trúc thư mục

```
Space_Cockpit/
├── index.html              # Entry HTML (markup only)
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             # Entry JS: import SCSS + các module, gán window.* cho onclick
│   ├── scss/
│   │   ├── main.scss       # Import tất cả partial
│   │   ├── _variables.scss  # CSS custom properties
│   │   ├── _base.scss      # Reset, body
│   │   ├── _space.scss     # #spaceCanvas
│   │   ├── _cockpit.scss    # Cockpit glass, HUD, corners, greeting, colorFilter, ytFloat
│   │   ├── _console.scss   # Console 3 panel: clock, lights, YouTube, TODO
│   │   └── _onboarding.scss
│   ├── js/
│   │   ├── app.js          # boot(), gọi startSpaceCanvas, startHUD, startClock, initCockpit, speed animation
│   │   ├── spaceCanvas.js  # PixiJS: stars, planets, asteroids, nebulae, layers, setSpaceSpeed/getSpaceSpeed
│   │   ├── hud.js          # updateHUD, startHUD
│   │   ├── clock.js        # updateClock, startClock
│   │   ├── lights.js       # setLight, lightThemes
│   │   ├── youtube.js      # ytTracks, addYT, playYT, removeYT, renderYT
│   │   ├── todo.js         # todos, addTodo, toggleTodo, deleteTodo, renderTodos
│   │   └── onboarding.js   # startCockpit, initCockpit
│   └── assets/
│       └── images/         # Đặt ảnh tại đây (import trong JS/SCSS hoặc public)
├── public/                 # Static files (copy nguyên vào dist)
└── dist/                   # Output sau npm run build
```

## Ghi chú

- HTML vẫn dùng `onclick="setLight('blue')"`, `onclick="addYT()"`, …; các hàm này được gán từ module lên `window` trong `main.js`.
- Dùng ảnh: đặt file trong `src/assets/images/` rồi `import url from '../assets/images/xxx.png'` trong JS (từ `src/js/`), hoặc đặt trong `public/` và dùng đường dẫn `/xxx.png`. Ảnh trong `src/assets/images/` được Vite bundle vào `dist/assets/` khi build.
- **Nền canvas vũ trụ**: đặt `universe-bg.jpg` trong `src/assets/images/`. Ứng dụng import và dùng làm nền chính cho canvas (scale cover + animation nghiêng nhẹ); khi `npm run build`, ảnh được copy vào `dist/assets/` cùng với JS/CSS.
