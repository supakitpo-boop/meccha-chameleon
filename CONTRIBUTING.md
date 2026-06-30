# Contributing to Meccha Chameleon 🦎

Thanks for your interest in contributing! Here's how you can help:

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/meccha-chameleon.git
   cd meccha-chameleon
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Run dev environment
# Terminal 1
cd server && npm run dev

# Terminal 2
npm run dev
```

## Code Style

- **TypeScript**: Use strict mode, define types explicitly
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Comments**: Thai or English, focus on WHY not WHAT
- **Formatting**: Use consistent indentation (2 spaces)

### Example
```typescript
// Good ✅
class PlayerManager {
  private playerCount: number = 0
  
  addPlayer(player: Player): void {
    // Track active players for load balancing
    this.playerCount++
  }
}

// Avoid ❌
class pm {
  pc: number = 0
  ap(p: any) {
    this.pc++
  }
}
```

## Feature Development

### Before You Start
- Check [Issues](https://github.com/your-repo/issues) for existing work
- Create an issue or discussion for your idea
- Wait for feedback before starting large features

### Branch Naming
- `feature/feature-name` — New features
- `fix/bug-name` — Bug fixes
- `docs/doc-name` — Documentation
- `refactor/system-name` — Refactoring

### Commit Messages
```
[feature/fix/docs/refactor] Brief description

More detailed explanation if needed.
- Bullet points for changes
- One change per commit when possible
```

## Testing

1. **Offline mode**: `npm run dev` → "Play Offline"
2. **Multiplayer**:
   ```bash
   # Terminal 1: Server
   cd server && npm run dev
   
   # Terminal 2: Client 1
   npm run dev
   
   # Terminal 3: Client 2 (different browser/tab)
   npm run dev
   ```

3. **Test checklist**:
   - [ ] Feature works in offline mode
   - [ ] Feature works in multiplayer
   - [ ] No console errors
   - [ ] UI responsive
   - [ ] Sounds work (if applicable)

## Areas We Need Help With

### High Priority 🔴
- [ ] Mobile touch controls
- [ ] Text chat system
- [ ] Performance optimization
- [ ] Bug fixes

### Medium Priority 🟡
- [ ] Better animations
- [ ] Particle effects
- [ ] Settings persistence
- [ ] Accessibility features

### Low Priority 🟢
- [ ] Documentation improvements
- [ ] Code refactoring
- [ ] Unit tests
- [ ] UI polish

## Pull Request Process

1. **Write clear PR description**:
   ```markdown
   ## What does this do?
   [Explain the feature/fix]
   
   ## How to test?
   [Step-by-step testing instructions]
   
   ## Screenshots/Videos (if applicable)
   [Attach media]
   
   ## Checklist
   - [ ] Code compiles without errors
   - [ ] Tested in offline mode
   - [ ] Tested in multiplayer
   - [ ] Updated README if needed
   ```

2. **Keep it focused**: One feature per PR
3. **Rebase before merge**: `git rebase main`
4. **Wait for review**: We'll provide feedback

## Server Architecture (Phase 4+)

### Adding New Room Messages
```typescript
// In ChameleonRoom.ts
this.onMessage('my-action', (client, data) => {
  // Validate data
  if (!data.payload) return
  
  // Process server-side
  const player = this.state.players.get(client.sessionId)
  
  // Broadcast or reply
  this.broadcast('notification', { message: 'Action done' })
})
```

### Adding New Sounds
```typescript
// In SoundManager.ts
private getSoundFrequency(soundName: string): number {
  const frequencies: { [key: string]: number } = {
    'new-sound': 800,
    // ... more sounds
  }
  return frequencies[soundName] || 440
}

// Usage
soundManager.playSFX('new-sound', volume)
```

## Project Structure
```
meccha-chameleon/
├── src/               # Client source
├── server/           # Server source
├── index.html        # Entry HTML
├── package.json      # Dependencies
├── CHANGELOG.md      # Version history
├── CONTRIBUTING.md   # This file
└── README.md         # Main documentation
```

## Performance Tips

- Avoid blocking operations in game loop
- Use requestAnimationFrame for animations
- Batch Three.js updates when possible
- Profile with Chrome DevTools (Performance tab)
- Test with multiple players (network latency)

## Reporting Bugs

1. **Check existing issues** first
2. **Provide detailed info**:
   ```
   Browser: Chrome 130
   OS: Windows 11
   Mode: Multiplayer / Offline
   
   Steps to reproduce:
   1. Create room
   2. Join with 2 players
   3. Start game
   4. [Describe issue]
   
   Expected: [What should happen]
   Actual: [What actually happened]
   
   Screenshots: [Attach if visual]
   ```

## Questions?

- Open a **Discussion** on GitHub
- Ask in **Issues** section
- Check existing docs first

---

## License

By contributing, you agree your code will be licensed under the same license as the project.

**Happy coding! 🎮✨**
