import * as Colyseus from 'colyseus.js'
import * as THREE from 'three'

export interface RemotePlayer {
  sessionId: string
  name: string
  role: string
  position: THREE.Vector3
  rotation: THREE.Vector3
  isCaught: boolean
  camouflageScore: number
  mesh?: THREE.Group
}

export class NetworkManager {
  private client: Colyseus.Client | null = null
  private room: Colyseus.Room | null = null
  private serverUrl: string
  private remotePlayersMap: Map<string, RemotePlayer> = new Map()
  private localSessionId: string = ''
  private gameStateCallbacks: ((state: any) => void)[] = []

  constructor(serverUrl: string = 'ws://localhost:3001') {
    this.serverUrl = serverUrl
  }

  async connect(roomId: string, playerName: string): Promise<boolean> {
    try {
      this.client = new Colyseus.Client(this.serverUrl)

      // ถ้า roomId = 'new' = สร้างห้องใหม่
      if (roomId === 'new') {
        this.room = await this.client.create('chameleon', {
          roomName: `${playerName}'s Game`,
          maxPlayers: 10,
          isPrivate: false
        })
      } else {
        // เข้าห้องที่มีอยู่
        this.room = await this.client.joinById(roomId, {
          name: playerName
        })
      }

      this.localSessionId = this.room.sessionId
      console.log(`✅ Connected to room: ${this.room.roomId}`)

      // Setup state listeners
      this.setupStateListeners()

      return true
    } catch (error) {
      console.error('❌ Connection failed:', error)
      return false
    }
  }

  disconnect() {
    if (this.room) {
      this.room.leave()
      this.room = null
    }
    this.remotePlayersMap.clear()
  }

  // Get game state
  getGameState(): any {
    return this.room?.state || null
  }

  getRemotePlayer(sessionId: string): RemotePlayer | undefined {
    return this.remotePlayersMap.get(sessionId)
  }

  getAllRemotePlayers(): RemotePlayer[] {
    return Array.from(this.remotePlayersMap.values())
  }

  getLocalSessionId(): string {
    return this.localSessionId
  }

  // Send player updates
  sendPlayerUpdate(position: THREE.Vector3, rotation: THREE.Vector3) {
    if (!this.room) return

    this.room.send('player-update', {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z }
    })
  }

  // Player ready
  sendReady() {
    if (!this.room) return
    this.room.send('ready', {})
  }

  // Start game (host only)
  sendStartGame() {
    if (!this.room) return
    this.room.send('start-game', {})
  }

  // Confirm detection (seeker only)
  sendConfirmDetection() {
    if (!this.room) return
    this.room.send('confirm-detection', {})
  }

  // Send paint texture
  sendPaintTexture(textureBase64: string) {
    if (!this.room) return
    this.room.send('paint-texture', { textureBase64 })
  }

  // Listen for game state changes
  onGameStateChange(callback: (state: any) => void) {
    this.gameStateCallbacks.push(callback)
  }

  private setupStateListeners() {
    if (!this.room) return

    // Listen for player changes
    this.room.state.players.onAdd((player: any, sessionId: string) => {
      const remotePlayer: RemotePlayer = {
        sessionId: sessionId,
        name: player.name,
        role: player.role,
        position: new THREE.Vector3(player.position.x, player.position.y, player.position.z),
        rotation: new THREE.Vector3(player.rotation.x, player.rotation.y, player.rotation.z),
        isCaught: player.isCaught,
        camouflageScore: player.camouflageScore
      }

      this.remotePlayersMap.set(sessionId, remotePlayer)
      console.log(`👤 ${player.name} joined (${player.role})`)

      // Trigger update
      this.broadcastStateChange()
    })

    this.room.state.players.onChange((player: any, sessionId: string) => {
      const remotePlayer = this.remotePlayersMap.get(sessionId)
      if (!remotePlayer) return

      if (player.position) {
        remotePlayer.position.x = player.position.x
        remotePlayer.position.y = player.position.y
        remotePlayer.position.z = player.position.z
      }

      if (player.rotation) {
        remotePlayer.rotation.x = player.rotation.x
        remotePlayer.rotation.y = player.rotation.y
        remotePlayer.rotation.z = player.rotation.z
      }

      remotePlayer.isCaught = player.isCaught
      remotePlayer.camouflageScore = player.camouflageScore

      // Trigger update
      this.broadcastStateChange()
    })

    this.room.state.players.onRemove((player: any, sessionId: string) => {
      this.remotePlayersMap.delete(sessionId)
      console.log(`👤 Player ${sessionId} left`)
      this.broadcastStateChange()
    })

    // Listen for messages
    this.room.onMessage('notification', (data: any) => {
      console.log(`📢 ${data.message}`)
      this.onNotification(data)
    })

    // Listen for state changes (phase, timeLeft, etc)
    this.room.state.onChange(() => {
      this.broadcastStateChange()
    })
  }

  private broadcastStateChange() {
    this.gameStateCallbacks.forEach(callback => {
      callback(this.room!.state)
    })
  }

  private onNotification(data: any) {
    // Broadcast notification to listeners
    window.dispatchEvent(new CustomEvent('game-notification', { detail: data }))
  }
}
