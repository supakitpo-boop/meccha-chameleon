# 🎮 Meccha Chameleon - Server (Colyseus)

Multiplayer game server ใช้ Colyseus สำหรับ real-time synchronization

## 📋 ขั้นตอนการติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
cd server
npm install
```

### 2. รัน Dev Server
```bash
npm run dev
```

Server จะรันที่ `ws://localhost:3001`
Monitor dashboard: `http://localhost:3001/colyseus`

### 3. Build สำหรับ Production
```bash
npm run build
npm start
```

---

## 🏗️ Architecture

### GameState Schema
```typescript
GameState {
  phase: 'lobby' | 'hiding' | 'seeking' | 'result'
  timeLeft: number
  hidersRemaining: number
  maxPlayers: number
  roomName: string
  isPrivate: boolean
  hostId: string
  players: Map<sessionId, Player>
}

Player {
  sessionId: string
  name: string
  role: 'hider' | 'seeker'
  position: { x, y, z }
  rotation: { x, y, z }
  isReady: boolean
  isCaught: boolean
  camouflageScore: number
  paintTextureBase64: string
}
```

### ChameleonRoom Logic

**Phases:**
1. **Lobby** — Waiting for players to join & ready
2. **Hiding** (30s) — Hiders paint & hide, Seeker waits
3. **Seeking** (90s) — Seeker searches, tries to detect Hiders
4. **Result** — Display winner

**Detection System:**
- Server-side raycast + color comparison
- Camouflage score: similarity between Hider color and background
- Auto-catch if score < 30%
- Manual confirmation if 30-70%
- Safe if score > 70%

### Message Protocol

| Client → Server | Data | Purpose |
|---|---|---|
| `player-update` | position, rotation | Sync player position |
| `ready` | — | Toggle ready state |
| `start-game` | — | Start game (host only) |
| `confirm-detection` | — | Seeker confirms detection |
| `paint-texture` | textureBase64 | Send paint texture |

| Server → Client | Data | Purpose |
|---|---|---|
| `notification` | message | Broadcast to all |
| `state-change` | GameState | Sync game state |

---

## 🌐 Deployment

### 1. Render (Recommended)
```bash
# Create new Web Service on Render
# Connect GitHub repo
# Set start command: npm run build && npm start
# Set env var: PORT=3001
```

### 2. Railway
```bash
# Install Railway CLI
railway link
railway up
```

### 3. Heroku (Legacy)
```bash
heroku create meccha-chameleon-server
git push heroku main
```

### 4. Docker
```bash
docker build -t meccha-server .
docker run -p 3001:3001 meccha-server
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 📝 Environment Variables

```env
PORT=3001              # Server port
NODE_ENV=production    # development | production
CORS_ORIGIN=*          # CORS origin for client
```

---

## 🔍 Monitoring

### Colyseus Monitor Dashboard
```
http://localhost:3001/colyseus
```

Real-time view of:
- Active rooms
- Connected clients
- Room state
- Message logs

### API Endpoints

**Get Rooms:**
```
GET http://localhost:3001/api/rooms
```

**Create Room:**
```
POST http://localhost:3001/api/rooms
Content-Type: application/json

{
  "roomName": "My Game",
  "maxPlayers": 6,
  "isPrivate": false
}
```

**Health Check:**
```
GET http://localhost:3001/health
```

---

## 🚨 Known Issues & Limitations

- ❌ Password protection for private rooms (Phase 5)
- ❌ Persistent database (Phase 5)
- ⚠️ AI Seeker ไม่ sync กับ online mode (Phase 5)
- ⚠️ Paint texture อัพโหลดเป็น base64 เต่า (可考虑 WebP compression)

---

## 🔧 Development

### File Structure
```
server/
├── src/
│   ├── index.ts           # Server entry + routes
│   ├── rooms/
│   │   └── ChameleonRoom.ts  # Main game room
│   └── schemas/
│       └── GameState.ts    # Colyseus schema
├── build/               # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Add New Features
1. Extend `GameState` schema in `schemas/GameState.ts`
2. Add handlers in `ChameleonRoom.ts`
3. Send messages via `this.broadcast()` or `client.send()`

Example:
```typescript
this.onMessage('new-feature', (client, data) => {
  // Handle message
  this.broadcast('notification', { message: 'Updated!' })
})
```

---

**Made with ❤️ using Colyseus + TypeScript**
