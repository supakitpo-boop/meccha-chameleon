const { Room } = require('colyseus')
const { GameState, GamePhase, PlayerRole, Player, Vector3 } = require('../schemas/GameState')

export class ChameleonRoom extends Room<GameState> {
  private maxClients: number = 10
  private gameLoopInterval: NodeJS.Timer | null = null
  private gameConfig = {
    hidingDuration: 30,
    seekingDuration: 90,
    detectionRange: 25,
    camouflageThreshold: 0.7
  }

  async onCreate(options: any) {
    this.setState(new GameState())

    // Initialize room settings
    this.state.maxPlayers = options.maxPlayers || 10
    this.state.roomName = options.roomName || 'Chameleon Game'
    this.state.isPrivate = options.isPrivate || false

    console.log(`🎮 ChameleonRoom created: ${this.state.roomName}`)

    // Setup message handlers
    this.onMessage('player-update', (client, data) => {
      this.handlePlayerUpdate(client, data)
    })

    this.onMessage('ready', (client) => {
      this.handlePlayerReady(client)
    })

    this.onMessage('start-game', (client) => {
      this.handleStartGame(client)
    })

    this.onMessage('confirm-detection', (client) => {
      this.handleConfirmDetection(client)
    })

    this.onMessage('paint-texture', (client, data) => {
      this.handlePaintTexture(client, data)
    })

    // Start game loop
    this.gameLoopInterval = setInterval(() => this.gameLoop(), 100)
  }

  onJoin(client: Client, options: any) {
    if (this.state.players.size >= this.state.maxPlayers) {
      throw new Error('ห้องเต็มแล้ว')
    }

    // Create player
    const player = new Player()
    player.sessionId = client.sessionId
    player.name = options.name || `Player ${this.state.players.size + 1}`
    player.role = this.state.players.size === 0 ? PlayerRole.Seeker : PlayerRole.Hider
    player.position = new Vector3()
    player.position.x = Math.random() * 40 - 20
    player.position.z = Math.random() * 40 - 20
    player.rotation = new Vector3()

    this.state.players.set(client.sessionId, player)

    // If first player, they're host
    if (this.state.hostId === '') {
      this.state.hostId = client.sessionId
    }

    console.log(`👤 ${player.name} joined (${player.role})`)
    this.broadcast('notification', {
      type: 'join',
      message: `${player.name} เข้าห้องแล้ว`
    })
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) {
      console.log(`👤 ${player.name} left`)
      this.state.players.delete(client.sessionId)

      // ถ้า host ออก ให้ผู้เล่นคนต่อไปเป็น host
      if (this.state.hostId === client.sessionId && this.state.players.size > 0) {
        this.state.hostId = Array.from(this.state.players.keys())[0]
      }
    }

    // ถ้าไม่มีผู้เล่น ให้ dispose room
    if (this.state.players.size === 0) {
      this.disconnect()
    }
  }

  onDispose() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
    }
    console.log(`🗑️ ChameleonRoom disposed`)
  }

  // Message handlers
  private handlePlayerUpdate(client: Client, data: any) {
    const player = this.state.players.get(client.sessionId)
    if (!player) return

    // Update position & rotation
    if (data.position) {
      player.position.x = data.position.x
      player.position.y = data.position.y
      player.position.z = data.position.z
    }

    if (data.rotation) {
      player.rotation.x = data.rotation.x
      player.rotation.y = data.rotation.y
      player.rotation.z = data.rotation.z
    }
  }

  private handlePlayerReady(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) {
      player.isReady = !player.isReady
      console.log(`✓ ${player.name} ready: ${player.isReady}`)
    }
  }

  private handleStartGame(client: Client) {
    // Only host can start
    if (client.sessionId !== this.state.hostId) {
      console.warn(`❌ Non-host tried to start game`)
      return
    }

    // Assign roles: 1 Seeker + rest Hiders
    let seekerAssigned = false
    for (let player of this.state.players.values()) {
      if (!seekerAssigned) {
        player.role = PlayerRole.Seeker
        seekerAssigned = true
      } else {
        player.role = PlayerRole.Hider
      }
    }

    this.state.phase = GamePhase.HidingPhase
    this.state.timeLeft = this.gameConfig.hidingDuration
    this.state.hidersRemaining = this.state.players.size - 1

    console.log(`🎮 Game started: ${this.state.players.size} players`)
    this.broadcast('notification', { type: 'start', message: 'เกมเริ่มต้นแล้ว!' })
  }

  private handleConfirmDetection(client: Client) {
    if (this.state.phase !== GamePhase.SeekingPhase) return

    const seeker = this.state.players.get(client.sessionId)
    if (!seeker || seeker.role !== PlayerRole.Seeker) return

    // Server-side detection: check nearest hider
    let nearestHider: Player | null = null
    let minDistance = this.gameConfig.detectionRange

    for (let player of this.state.players.values()) {
      if (player.role === PlayerRole.Hider && !player.isCaught) {
        const dx = player.position.x - seeker.position.x
        const dy = player.position.y - seeker.position.y
        const dz = player.position.z - seeker.position.z
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < minDistance) {
          minDistance = distance
          nearestHider = player
        }
      }
    }

    if (nearestHider) {
      // ตรวจสอบ camouflage
      if (nearestHider.camouflageScore < (1 - this.gameConfig.camouflageThreshold)) {
        // ถูกจับ
        nearestHider.isCaught = true
        this.state.hidersRemaining--
        this.broadcast('notification', {
          type: 'caught',
          message: `${nearestHider.name} ถูกจับ!`
        })

        // ตรวจสอบว่าจับครบหรือยัง
        if (this.state.hidersRemaining === 0) {
          this.endGame()
        }
      } else {
        this.broadcast('notification', {
          type: 'failed',
          message: `${nearestHider.name} กลมกลืนดีเกินไป!`
        })
      }
    }
  }

  private handlePaintTexture(client: Client, data: any) {
    const player = this.state.players.get(client.sessionId)
    if (player && data.textureBase64) {
      player.paintTextureBase64 = data.textureBase64
      console.log(`🎨 ${player.name} sent paint texture`)
    }
  }

  // Game loop
  private gameLoop() {
    if (this.state.phase === GamePhase.Lobby) return

    // Update timer
    this.state.timeLeft -= 0.1

    if (this.state.timeLeft <= 0) {
      this.switchPhase()
    }
  }

  private switchPhase() {
    if (this.state.phase === GamePhase.HidingPhase) {
      this.state.phase = GamePhase.SeekingPhase
      this.state.timeLeft = this.gameConfig.seekingDuration
      this.broadcast('notification', {
        type: 'phase-change',
        message: '🔍 SEEKING PHASE เริ่มแล้ว!'
      })
    } else if (this.state.phase === GamePhase.SeekingPhase) {
      this.endGame()
    }
  }

  private endGame() {
    this.state.phase = GamePhase.Result
    this.state.timeLeft = 0

    // Determine winner
    const hidersStillAlive = Array.from(this.state.players.values()).filter(
      p => p.role === PlayerRole.Hider && !p.isCaught
    )

    if (hidersStillAlive.length > 0) {
      // Hider win
      this.broadcast('notification', {
        type: 'result',
        message: `🎉 HIDER WIN! ${hidersStillAlive.length} hiders survived`
      })
    } else {
      // Seeker win
      this.broadcast('notification', {
        type: 'result',
        message: `🔴 SEEKER WIN! ทุก hiders ถูกจับ`
      })
    }

    console.log(`🏆 Game ended - Phase: Result`)
  }
}
