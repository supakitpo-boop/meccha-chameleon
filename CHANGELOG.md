# Changelog - Meccha Chameleon

## [1.0.0] - 2026-06-30

### Phase 1: Single-player Mechanics ✅
- Movement system (WASD + Space jump)
- Two camera modes (First-person & Third-person)
- Raycast-based collision detection
- Scene with 7 colored obstacles
- Gravity and grounded state system

### Phase 2: Paint System ✅
- Canvas-based texture painting
- Real-time texture mapping to player model
- Paint tools: color picker, brush size, eyedropper, clear
- Ink budget system (100 units per game)
- Auto-orbit camera during paint mode
- Texture updates synchronized with scene

### Phase 3: Gameplay Loop ✅
- State machine: Lobby → Hiding (30s) → Seeking (90s) → Result
- AI Seeker with random walk + chase behavior
- Detection system with RGB color similarity scoring
- Camouflage score calculation (0-1 scale)
- Auto-catch if similarity < 30%
- Game HUD with timer and caught count
- Win/lose conditions and result screen
- Offline mode for single-player testing

### Phase 4: Multiplayer Server ✅
- Colyseus WebSocket server integration
- ChameleonRoom with authoritative game logic
- GameState schema for real-time sync
- Room creation (public/private, 2-10 players)
- Player role assignment (1 Seeker, N Hiders)
- Server-side detection & validation
- NetworkManager for client-side sync
- LobbyUI for room browser & management
- RemotePlayerManager for rendering other players
- Paint texture base64 transmission
- Notification system (joins, catches, phase changes)

### Phase 5: Polish & Customization ✅
- **Main Menu Screen**
  - Game title with gradient background
  - Online/Offline mode selection
  - Settings button
  - Game instructions (controls + goal)
  - Professional styling with glow effects

- **Sound Manager**
  - Procedural audio effect generation
  - Click, success, fail, alert, jump sounds
  - Master volume control
  - Volume sliders for SFX & music

- **Player Customization UI**
  - Player name input (max 20 chars)
  - Color picker (HTML5 input + preset colors)
  - Live preview of player appearance
  - Confirmation dialog flow
  - Integration with lobby/game

- **UI/UX Improvements**
  - Smooth transitions between menu → customize → lobby → game
  - Sound feedback on clicks & actions
  - Enhanced visual feedback
  - Better responsiveness

### Technical Improvements
- TypeScript strict mode throughout
- Modular architecture (separate files per feature)
- Proper separation of concerns
- Event-driven communication
- Schema-based state management (Colyseus)

### Known Limitations
- Paint texture sent as base64 (large payload)
- AI Seeker not in multiplayer mode
- No persistent database
- No authentication system
- Raycast-based collision (not full physics)

## Future Plans (Phase 6+)

### Deployment & Scaling
- [ ] Deploy server to Render/Railway
- [ ] Deploy client to Vercel/Netlify
- [ ] Production environment setup
- [ ] SSL/TLS configuration

### Advanced Features
- [ ] Text chat system
- [ ] Voice communication (WebRTC)
- [ ] Pose system (crouch, wall-lean positions)
- [ ] Mobile touch controls
- [ ] Anti-cheat detection
- [ ] Player statistics & leaderboard
- [ ] Skill-based matchmaking
- [ ] Spectator mode
- [ ] Replay system

### Quality of Life
- [ ] Better animations
- [ ] Particle effects
- [ ] Music tracks
- [ ] More sound effects
- [ ] Tutorial system
- [ ] Settings persistence
- [ ] Accessibility features

### Performance Optimization
- [ ] WebP texture compression
- [ ] Mesh instancing for obstacles
- [ ] Frustum culling
- [ ] Object pooling
- [ ] Memory profiling

---

## Installation & Running

### Requirements
- Node.js 18+ (LTS recommended)
- 2 terminals (one for server, one for client)

### Quick Start
```bash
# Terminal 1: Start server
cd server
npm install
npm run dev

# Terminal 2: Start client
npm install
npm run dev

# Open http://localhost:3000 in browser
```

### Offline Mode (No Server)
```bash
npm run dev
# Click "Play Offline (AI)"
```

---

## Credits

**Made with ❤️ using:**
- Three.js (3D graphics)
- Colyseus (multiplayer server)
- Vite (build tool)
- TypeScript (type safety)

---

## License

Open source - feel free to fork, modify, and share!
