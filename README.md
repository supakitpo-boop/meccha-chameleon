# 🎮 Meccha Chameleon - Phase 1 + 2 + 3 + 4

เกม Hide & Seek 3D multiplayer ที่ให้คุณควบคุมตัวละคร Hider สีขาว วาดลวดลายและสีลงตัวเพื่อปกปิดตัวเองจาก Seekers 🌐

## 📋 ขั้นตอนการติดตั้งและรัน

### 1. ติดตั้ง Node.js
ดาวน์โหลดและติดตั้ง Node.js จาก https://nodejs.org/ (แนะนำ LTS version)

### 2. รัน Online Multiplayer (Phase 4)

**Terminal 1 - Server:**
```bash
cd server
npm install
npm run dev
# Server รันที่ ws://localhost:3001
```

**Terminal 2 - Client:**
```bash
npm install
npm run dev
# Client รันที่ http://localhost:3000
```

เบราว์เซอร์จะเปิดโดยอัตโนมัติ → เลือก "Join Room" หรือ "Create Room" → Play!

### 3. รัน Offline Mode (Phase 3)
```bash
npm run dev
# Click "Exit Game" ในไหม่ lobby
```

### 4. Build สำหรับ Production
**Client:**
```bash
npm run build
# Output ใน dist/
```

**Server:**
```bash
cd server
npm run build
npm start
```

---

## 🎮 วิธีเล่น (Phase 1 + 2 + 3)

### Lobby
- **ENTER** — เริ่มเกม

### ควบคุมการเดิน
- **W / ↑** — เดินไปข้างหน้า
- **S / ↓** — เดินถอยหลัง
- **A / ←** — เดินไปทางซ้าย
- **D / →** — เดินไปทางขวา
- **Space** — กระโดด (Hiding phase) / ยืนยันจับ (Seeking phase)
- **Click** — ล็อกเมาส์ (Pointer Lock)
- **V** — สลับกล้อง First-person ↔ Third-person (ไม่ได้ใน paint mode)
- **Mouse** — หมุนกล้อง (ต้อง lock pointer ก่อน)

### 🌐 Multiplayer Lobby (Phase 4)

#### Join Room
- ใส่ชื่อผู้เล่น
- 🔄 Refresh เพื่อดูห้องที่มี
- Click ห้องเพื่อเข้า

#### Create Room
- ใส่ชื่อผู้เล่น
- ตั้งชื่อห้อง
- เลือก Max Players (2-10)
- ทำเครื่องหมาย "Private" ถ้าต้องการ (เฉพาะผู้เชิญ)
- Click Create

#### Waiting Room
- 👤 ดูรายชื่อผู้เล่นที่เข้าแล้ว
- ✓ Click Ready (ถ้าพร้อม)
- 🎮 Host (ผู้สร้าง) กด Start ได้เมื่อผู้เล่นพร้อม

---

### 🎮 Game Loop (Phase 3 + 4)

#### Hiding Phase (30 วินาที)
- Hider ซ่อนตัวและระบายเพื่อปกปิด
- สามารถเดินหาตำแหน่งที่ดีและเพนต์ได้
- AI Seeker รอที่จุดเริ่มต้น

#### Seeking Phase (90 วินาที)
- Seeker เริ่มตามหา Hider
- Seeker เดินสุ่มหรือตามหา (หากเล็งโดนเนื่องจากกลมกลืนต่ำ)
- Hider กดปุ่ม **Space** เมื่อ Seeker เล็งตัว = ยืนยันตำหน่ง
  - ถ้า Hider ระบายดี (กลมกลืนสูง) = Seeker ต้องยืนยันเอง ยาก
  - ถ้า Hider ระบายน้อย (กลมกลืนต่ำ) = Seeker auto-catch ง่าย

#### Result
- **Hider Win** 🎉 หากเหลือเวลา = มีเวลา
- **Seeker Win** 🔴 หากจับ Hider ได้

### 🎨 Paint Mode (Phase 2)
- **TAB** — เข้า/ออก Paint Mode
  - กล้องจะหมุนรอบตัวละครโดยอัตโนมัติ
  - เวลาหยุด (ไม่สามารถเดินได้)
- **Color Picker** — เลือกสี
- **💧 Eyedropper** — ดูดสีจากฉาก (obstacles)
- **Brush Size** — ปรับขนาดแปรง (5-100px)
- **Paint Canvas** — วาดบนแคนวาส (Click & Drag)
- **หมึก Budget** — มีหมึกจำกัด บริโภค เมื่อวาด
- **🧹 Clear** — ล้างผืนคลื่น
- **✅ Done** — บันทึก texture และออก paint mode

### ผู้เล่นในขั้นนี้
- ตัวละครสีขาวล้วน (capsule shape)
- ห้องกว้าง 100×100 หน่วย
- Obstacles หลายชิ้นสำหรับซ่อนตัว
- Gravity, collision กับพื้น, jump

---

## 📁 โครงสร้างโปรเจกต์

```
meccha-chameleon/
├── client (/)              # Vite + Three.js client
│   ├── src/
│   │   ├── main.ts              # Entry point
│   │   ├── Game.ts              # Main game controller (Phase 1-4)
│   │   ├── Player.ts            # Hider logic & movement
│   │   ├── Camera.ts            # Camera system (FPS/TPS)
│   │   ├── Scene.ts             # Scene setup, obstacles, lights
│   │   ├── input.ts             # Keyboard input manager
│   │   ├── PaintSystem.ts       # 🎨 Paint mode + canvas texture (Phase 2)
│   │   ├── PaintCamera.ts       # 🎨 Auto-orbit camera (Phase 2)
│   │   ├── GameState.ts         # 🎮 Enums + config (Phase 3)
│   │   ├── GameManager.ts       # 🎮 Game loop + state (Phase 3)
│   │   ├── AISeeker.ts          # 🤖 AI Seeker (Phase 3)
│   │   ├── DetectionSystem.ts   # 👁️ Detection (Phase 3)
│   │   ├── GameUI.ts            # 🎮 HUD + result (Phase 3)
│   │   ├── NetworkManager.ts    # 🌐 Colyseus client (Phase 4)
│   │   ├── LobbyUI.ts           # 🌐 Lobby screen (Phase 4)
│   │   └── RemotePlayerManager.ts # 🌐 Render remote players (Phase 4)
│   ├── index.html               # HTML entry
│   ├── vite.config.ts           # Vite config
│   ├── tsconfig.json            # TypeScript config
│   ├── package.json             # Dependencies
│   └── README.md               # Client README
│
├── server/                  # Colyseus server (Phase 4)
│   ├── src/
│   │   ├── index.ts             # Server entry + routes
│   │   ├── rooms/
│   │   │   └── ChameleonRoom.ts # Main game room + logic
│   │   └── schemas/
│   │       └── GameState.ts     # Colyseus schema
│   ├── build/               # Compiled output
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md           # Server README
│
└── README.md              # Main README (this file)
```

---

## 🔧 ระบบหลัก (Phase 1 + 2 + 3)

### Game Loop
- `Game.ts` จัดการ loop หลัก
- `GameManager.ts` จัดการ state machine (Lobby → Hiding → Seeking → Result)
- Flow: player update → gameManager update → camera update → render
- Switching cameras dynamically ตามสถานะ paint mode / game phase

### Player Movement (Phase 1)
- WASD input → velocity calculation → collision detection → position update
- Gravity system: ตัวละครตกลงเรื่อยๆ จนกว่าจะ grounded
- Jump: เมื่อ grounded สามารถกระโดดขึ้นได้

### Camera System (Phase 1)
- **First-person**: กล้องติด head ของตัวละคร
- **Third-person**: กล้องลอยหลังตัวละคร มองมายังตัวละคร
- Pointer Lock: ควบคุมเมาส์ขณะเล่น

### 🎨 Paint System (Phase 2)
- **Paint Canvas Texture**: ใช้ `CanvasTexture` จาก Three.js map ลงตัวละคร
- **Paint Tools**: Color picker, Brush size, Eyedropper, Clear
- **Ink Budget**: 100 หน่วย ลดลงตามการวาด
- **Auto-orbit Camera**: เมื่อ paint mode เปิด
- **Real-time Texture Update**: texture อัปเดตทันที

### 🎮 Game Manager (Phase 3)
- **State Machine**: Lobby → Hiding (30s) → Seeking (90s) → Result
- **Hiding Phase**: Hider ซ่อนและระบายเอง, Seeker รอ
- **Seeking Phase**: Seeker ตามหา, Hider ตรวจสอบกลมกลืน
- **Win Condition**: 
  - Hider Win: หมดเวลา (90s ไม่ถูกจับ)
  - Seeker Win: จับ Hider ได้ (กลมกลืนต่ำ หรือยืนยันได้)

### 🤖 AI Seeker (Phase 3)
- **Random Walk**: เดินสุ่มเมื่อไม่เจอ Hider
- **Chase Behavior**: ตามหาเมื่อเล็งโดน Hider (ระยะ 30 หน่วย)
- **Detection Range**: 25 หน่วย เล็ง Hider
- **Auto-catch**: ถ้า Hider กลมกลืนต่ำ (< 30%) = auto-catch
- **Raycast**: ตรวจสอบว่ามีกำแพงระหว่าง Seeker-Hider หรือไม่

### 👁️ Detection System (Phase 3)
- **Camouflage Score**: เปรียบเทียบสี Hider vs Background (0-1)
- **Color Similarity**: ใช้ Euclidean distance ใน RGB space
- **Raycast Detection**: ตรวจสอบระยะ + obstacle blocking
- **Auto-detection**: ถ้า Seeker เล็งโดน + กลมกลืนต่ำ = catch

### Scene
- พื้น + กำแพง 4 ด้าน
- Obstacles 7 ชิ้นสำหรับซ่อน (สีต่างกัน)
- Lighting: ambient + directional (sun) with shadows

---

## 🚀 Progress & Future Phases

### ✅ Phase 1: Single-player Mechanics (COMPLETED)
- ✅ Movement (WASD + Jump)
- ✅ Camera (First-person / Third-person)
- ✅ Collision detection (Raycast-based)
- ✅ Scene with obstacles

### ✅ Phase 2: Paint System (COMPLETED)
- ✅ Canvas texture real-time
- ✅ Paint tools (color picker, brush, eyedropper, clear)
- ✅ Ink budget system
- ✅ Auto-orbit paint camera

### ✅ Phase 3: Gameplay Loop (COMPLETED)
- ✅ State machine (Lobby → Hiding → Seeking → Result)
- ✅ AI Seeker (random walk + chase behavior)
- ✅ Detection system with camouflage scoring
- ✅ Win/lose conditions
- ✅ Game HUD + result screen
- ✅ Offline mode ตัดสินใจผลเกมเองได้

### ✅ Phase 4: Multiplayer (COMPLETED)
- ✅ Colyseus server (WebSocket-based)
- ✅ ChameleonRoom + GameState schema
- ✅ Room create/join system
- ✅ Network sync (positions, rotations, states)
- ✅ Client-side NetworkManager
- ✅ LobbyUI (room browser)
- ✅ RemotePlayerManager (render other players)
- ✅ Multiplayer gameplay (1 Seeker + N Hiders)
- ✅ **2-10 players** tested & working

### ✅ Phase 5: Polish & Customization (COMPLETED)
- ✅ 🎨 Main menu screen with instructions
- ✅ 🔊 Sound manager (procedural audio effects)
- ✅ 👤 Player customization (name + color)
- ✅ 🎮 Better UI/UX flow
- ✅ 🎯 Click sounds + audio feedback

### 🔄 Phase 6: Advanced Features (Optional)
- 🎤 Text chat + voice (WebRTC)
- 📊 Leaderboard + stats persistence
- 🎨 Pose system (crouch, wall-lean)
- 📱 Mobile touch controls
- 🕵️ Anti-cheat detection
- 🚀 Production deployment (Render + Vercel)

---

## ⚠️ Known Limitations & Notes

### Architecture
- **Collision**: Raycast พื้นฐาน (ไม่ full physics engine)
- **Paint Texture**: Canvas 2D + Three.js CanvasTexture
- **Detection**: RGB similarity + Raycast obstruction
- **AI**: Random walk + simple heuristic (ไม่ pathfinding)
- **Network**: Colyseus with 100ms tick (configurable)

### Current Limitations (Phase 4)
- ⚠️ Paint texture ส่งเป็น base64 (large, consider WebP)
- ⚠️ AI Seeker ไม่ sync ใน multiplayer mode (Players only, no AI)
- ⚠️ ไม่มี persistence database (rooms reset on disconnect)
- ⚠️ ไม่มี authentication (ใครก็เล่นได้)
- ❌ Password-protected private rooms (Phase 5)

### How to Test Phase 4 & 5 (Multiplayer + Polish)

**Setup:**
```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
npm install && npm run dev
```

**Play:**
1. เปิด browser → ได้เห็น **Main Menu** (Phase 5)
2. Click **Online Multiplayer** → **Customize Player** (name + color)
3. Click **Confirm** → **Lobby Screen**
4. Browser 1: **Create Room**
5. Browser 2: **Join Room**
6. Both: Click **Ready** → Host clicks **Start**
7. **Hiding Phase (30s):** Hider paints (TAB), Seeker waits
8. **Seeking Phase (90s):** Seeker searches, Hider hides
9. **Detection:** Color similarity (camouflage score)
10. **Result:** Winner announced with sound effect 🔊

**Phase 5 Features Tested:**
- ✅ Main Menu screen with game info
- ✅ Player customization (name, color preview)
- ✅ Sound effects (click, success, fail)
- ✅ Smooth UI flow (Menu → Customize → Lobby → Game)

**Play Offline (Phase 3 + 5):**
- Click **Play Offline (AI)** from menu
- No server needed
- Play vs AI Seeker locally

### Debug Commands (Browser Console)
```javascript
// Check network status
console.log(window._game?.networkManager?.getGameState())

// View all remote players
console.log(window._game?.networkManager?.getAllRemotePlayers())

// Test sounds
window._game?.soundManager?.playSFX('success')
window._game?.soundManager?.playSFX('fail')
```

---

## 🚀 Deployment Guide (Phase 5)

### Deploy Server (Colyseus)

#### Option 1: Render (Recommended)
```bash
# Create account at render.com
# Connect GitHub repo
# Create Web Service
# Build: npm install && npm run build
# Start: npm start
# Add env: PORT=3001
```

#### Option 2: Railway
```bash
# Install: npm install -g @railway/cli
# Login: railway login
# Deploy: railway up
```

#### Option 3: Docker (Any Cloud)
```bash
cd server
docker build -t meccha-server .
docker run -p 3001:3001 meccha-server
```

### Deploy Client (Vite)

#### Option 1: Vercel
```bash
npm install -g vercel
vercel --prod
# Update server URL in code
```

#### Option 2: Netlify
```bash
npm run build
# Drag dist/ to netlify.com
```

#### Option 3: GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

### Environment Variables
**Client** (.env):
```
VITE_SERVER_URL=wss://your-server.com:3001
```

**Server** (.env):
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-client.com
```

---

## 📞 Support & Contributing

Issues? Suggestions?
- Create issue on GitHub
- Fork & submit PR
- Discord: [link-coming-soon]

---

**Made with ❤️ using Three.js + Colyseus + Vite + TypeScript**
