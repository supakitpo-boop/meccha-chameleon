import * as THREE from 'three'
import { Player } from './Player'
import { GameScene } from './Scene'
import { InputManager } from './input'
import { CameraController } from './Camera'
import { PaintSystem } from './PaintSystem'
import { PaintCamera } from './PaintCamera'
import { GameManager } from './GameManager'
import { NetworkManager } from './NetworkManager'
import { LobbyUI } from './LobbyUI'
import { RemotePlayerManager } from './RemotePlayerManager'
import { MainMenuUI } from './MainMenuUI'
import { SoundManager } from './SoundManager'
import { PlayerCustomizationUI, PlayerCustomization } from './PlayerCustomizationUI'

export class Game {
  private renderer: THREE.WebGLRenderer
  private scene: GameScene
  private player: Player
  private cameraController: CameraController
  private paintCamera: PaintCamera
  private paintSystem: PaintSystem
  private gameManager: GameManager | null = null
  private networkManager: NetworkManager | null = null
  private remotePlayerManager: RemotePlayerManager | null = null
  private inputManager: InputManager
  private clock: THREE.Clock
  private currentCamera: THREE.Camera
  private lobbyUI: LobbyUI | null = null
  private mainMenuUI: MainMenuUI | null = null
  private customizationUI: PlayerCustomizationUI | null = null
  private soundManager: SoundManager
  private isOnline: boolean = false
  private playerCustomization: PlayerCustomization = {
    name: 'Player',
    color: '#ffffff'
  }

  constructor() {
    // Initialize sound manager (Phase 5)
    this.soundManager = new SoundManager()

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    document.body.appendChild(this.renderer.domElement)

    // Initialize scene
    this.scene = new GameScene()

    // Initialize player
    this.player = new Player(this.scene.getThreeScene())

    // Initialize cameras
    this.cameraController = new CameraController(
      this.renderer.domElement,
      this.player
    )
    this.paintCamera = new PaintCamera(this.player)

    // Initialize paint system
    this.paintSystem = new PaintSystem(this.player, this.scene.getThreeScene())

    // Initialize input
    this.inputManager = new InputManager(this.renderer.domElement)

    // Set initial camera
    this.currentCamera = this.cameraController.getCamera()

    // Clock for delta time
    this.clock = new THREE.Clock()

    // Initialize main menu (Phase 5)
    this.mainMenuUI = new MainMenuUI({
      onOnline: () => this.showCustomizationBeforeOnline(),
      onOffline: () => this.showCustomizationBeforeOffline(),
      onSettings: () => this.showSettings(),
      onQuit: () => this.quit()
    })
    this.mainMenuUI.show()

    // Initialize customization UI (Phase 5)
    this.customizationUI = new PlayerCustomizationUI({
      onConfirm: (customization) => this.onCustomizationConfirm(customization),
      onCancel: () => this.mainMenuUI?.show()
    })

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())

    // Listen for controls
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'v' && !this.paintSystem.isPaintModeActive()) {
        this.cameraController.toggleCameraMode()
        this.soundManager.playClick()
      }
      // Confirm detection (Space)
      if (e.key === ' ' && this.gameManager && this.gameManager.isGameActive()) {
        this.gameManager.confirmDetection()
        this.soundManager.playSFX('success')
      }
    })
  }

  private showCustomizationBeforeOnline() {
    this.mainMenuUI?.hide()
    this.customizationUI?.show()
    this.soundManager.playClick()
    ;(window as any)._gameOnlineAfterCustomize = true
  }

  private showCustomizationBeforeOffline() {
    this.mainMenuUI?.hide()
    this.customizationUI?.show()
    this.soundManager.playClick()
    ;(window as any)._gameOnlineAfterCustomize = false
  }

  private onCustomizationConfirm(customization: PlayerCustomization) {
    this.playerCustomization = customization
    this.customizationUI?.hide()
    this.soundManager.playClick()

    const isOnline = (window as any)._gameOnlineAfterCustomize

    if (isOnline) {
      this.showLobby()
    } else {
      this.showOfflineMode()
    }
  }

  private showSettings() {
    this.mainMenuUI?.hide()
    this.soundManager.playClick()
    alert('Settings coming soon!')
    this.mainMenuUI?.show()
  }

  private quit() {
    this.soundManager.playClick()
    if (confirm('Exit game?')) {
      window.location.href = 'about:blank'
    }
  }

  private showLobby() {
    // Initialize lobby UI (Phase 4)
    this.lobbyUI = new LobbyUI({
      onJoinRoom: (roomId, playerName) => this.joinRoom(roomId, playerName),
      onCreateRoom: (roomName, playerName) => this.createRoom(roomName, playerName),
      onQuitLobby: () => {
        this.lobbyUI?.hide()
        this.mainMenuUI?.show()
      }
    })
    this.lobbyUI.show()
  }

  private showOfflineMode() {
    this.isOnline = false
    if (this.lobbyUI) this.lobbyUI.hide()
    this.soundManager.playClick()
    // Initialize game manager (Phase 3 - offline mode)
    if (!this.gameManager) {
      this.gameManager = new GameManager(this.player, this.scene.getThreeScene())
    }
  }

  private async joinRoom(roomId: string, playerName: string) {
    this.isOnline = true
    this.networkManager = new NetworkManager('ws://localhost:3001')

    // Use customization name if available
    const finalName = this.playerCustomization.name || playerName

    const success = await this.networkManager.connect(roomId, finalName)
    if (!success) {
      alert('Failed to connect to server')
      this.soundManager.playFail()
      return
    }

    if (this.lobbyUI) this.lobbyUI.hide()

    // Initialize remote player manager
    this.remotePlayerManager = new RemotePlayerManager(this.scene.getThreeScene())

    // Listen for state changes
    this.networkManager.onGameStateChange((state) => {
      this.onGameStateChange(state)
    })

    this.soundManager.playSuccess()
    console.log(`✅ Joined room: ${roomId}`)
  }

  private async createRoom(roomName: string, playerName: string) {
    this.isOnline = true
    this.networkManager = new NetworkManager('ws://localhost:3001')

    // Use customization name if available
    const finalName = this.playerCustomization.name || playerName

    const success = await this.networkManager.connect('new', finalName)
    if (!success) {
      alert('Failed to create room')
      this.soundManager.playFail()
      return
    }

    if (this.lobbyUI) this.lobbyUI.hide()

    // Initialize remote player manager
    this.remotePlayerManager = new RemotePlayerManager(this.scene.getThreeScene())

    // Listen for state changes
    this.networkManager.onGameStateChange((state) => {
      this.onGameStateChange(state)
    })

    this.soundManager.playSuccess()
    console.log(`✅ Created room: ${roomName}`)
  }

  private onGameStateChange(state: any) {
    // Update remote players
    if (this.remotePlayerManager && this.networkManager) {
      const remotePlayersData = state.players
      if (remotePlayersData) {
        remotePlayersData.forEach((playerData: any, sessionId: string) => {
          if (sessionId !== this.networkManager!.getLocalSessionId()) {
            const remotePlayer = {
              sessionId: sessionId,
              name: playerData.name,
              role: playerData.role,
              position: new THREE.Vector3(playerData.position.x, playerData.position.y, playerData.position.z),
              rotation: new THREE.Vector3(playerData.rotation.x, playerData.rotation.y, playerData.rotation.z),
              isCaught: playerData.isCaught,
              camouflageScore: playerData.camouflageScore
            }
            this.remotePlayerManager?.updateRemotePlayer(remotePlayer)
          }
        })
      }
    }
  }

  start(): void {
    this.animate()
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)

    const deltaTime = this.clock.getDelta()

    // Update game manager (Phase 3 - offline mode)
    if (this.gameManager && !this.isOnline) {
      this.gameManager.update(deltaTime)
    }

    // Update player based on input
    if (!this.paintSystem.isPaintModeActive()) {
      const input = this.inputManager.getInput()
      this.player.update(input, deltaTime)
      this.cameraController.update()
      this.currentCamera = this.cameraController.getCamera()
    }

    // Paint mode - use paint camera
    if (this.paintSystem.isPaintModeActive()) {
      this.paintCamera.update(deltaTime)
      this.currentCamera = this.paintCamera.getCamera()
    }

    // Send player updates to server (Phase 4)
    if (this.isOnline && this.networkManager) {
      const camera = this.cameraController.getCamera()
      const rotation = new THREE.Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z)
      this.networkManager.sendPlayerUpdate(
        this.player.getPosition(),
        rotation
      )
    }

    // Render
    this.renderer.render(this.scene.getThreeScene(), this.currentCamera)
  }

  private onWindowResize = (): void => {
    const width = window.innerWidth
    const height = window.innerHeight

    this.renderer.setSize(width, height)
    this.cameraController.getCamera().aspect = width / height
    this.cameraController.getCamera().updateProjectionMatrix()
    this.paintCamera.onWindowResize()
  }
}
