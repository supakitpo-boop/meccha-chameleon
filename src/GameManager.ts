import * as THREE from 'three'
import { Player } from './Player'
import { AISeeker } from './AISeeker'
import { DetectionSystem } from './DetectionSystem'
import { GamePhase, GameConfig, DefaultGameConfig } from './GameState'
import { GameUI } from './GameUI'

export interface GameResult {
  phase: GamePhase
  hidersCaught: number
  totalHiders: number
  timeRemaining: number
  camouflageScores: number[]
}

export class GameManager {
  private phase: GamePhase = GamePhase.Lobby
  private config: GameConfig = DefaultGameConfig
  private player: Player
  private seekers: AISeeker[] = []
  private detectionSystem: DetectionSystem
  private scene: THREE.Scene
  private ui: GameUI

  // Timers
  private phaseTimer: number = 0
  private gameResult: GameResult | null = null
  private hidersCaught: number = 0
  private camouflageScores: number[] = []

  constructor(player: Player, scene: THREE.Scene) {
    this.player = player
    this.scene = scene
    this.detectionSystem = new DetectionSystem(scene)

    // Rename player capsule สำหรับ detection
    this.player.getBody().name = 'hider-body'

    // Create UI
    this.ui = new GameUI()

    // Listen for game start
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.phase === GamePhase.Lobby) {
        this.startGame()
      }
      if (e.key === 'Enter' && this.phase === GamePhase.Result) {
        this.reset()
      }
    })
  }

  getPhase(): GamePhase {
    return this.phase
  }

  isGameActive(): boolean {
    return this.phase !== GamePhase.Lobby && this.phase !== GamePhase.Result
  }

  update(deltaTime: number): void {
    if (!this.isGameActive()) return

    this.phaseTimer -= deltaTime

    // Update seekers
    this.seekers.forEach(seeker => seeker.update(deltaTime))

    // ตรวจจับ hiders
    this.checkDetection()

    // Update phase
    this.updatePhase()

    // Update UI
    this.updateUI()
  }

  // เรียกเมื่อ seeker ยืนยันว่าเจอ hider
  confirmDetection(): void {
    if (this.phase !== GamePhase.SeekingPhase) return

    // ตรวจสอบว่ากำลังเล็งอยู่ในฉาก + ใกล้พอ
    const seeker = this.seekers[0]
    if (!seeker) return

    const detectionResult = this.detectionSystem.detectHider(
      seeker,
      this.player,
      this.config.detectionRange
    )

    if (!detectionResult.detected) {
      this.ui.showMessage('❌ ไม่ได้เล็งโดน!')
      return
    }

    // ต้องยืนยันด้วยตนเองเมื่อกลมกลืนดี (camouflage high)
    if (detectionResult.camouflageScore > this.config.camouflageThreshold) {
      const percent = Math.round(detectionResult.camouflageScore * 100)
      this.ui.showMessage(`🎨 กลมกลืน ${percent}%! ต้องระบายให้สมบูรณ์กว่านี้`)
      return
    }

    // ถ้ากลมกลืนต่ำ = ถูกจับ
    this.captureHider(detectionResult.camouflageScore)
  }

  // ส่วนตัวใช้งาน
  private startGame(): void {
    this.phase = GamePhase.HidingPhase
    this.phaseTimer = this.config.hidingDuration
    this.hidersCaught = 0
    this.camouflageScores = []
    this.gameResult = null

    // สร้าง AI Seeker (Phase 3: 1 ตัว)
    const seekerPos = new THREE.Vector3(0, 1.2, -40)
    const seeker = new AISeeker(this.scene, this.player, seekerPos)
    this.seekers = [seeker]

    this.ui.showMessage('🎨 HIDING PHASE: ซ่อนตัวและระบายเอง! (30 วินาที)')
    console.log('🎮 Game started - HIDING PHASE')
  }

  private updatePhase(): void {
    if (this.phaseTimer <= 0) {
      switch (this.phase) {
        case GamePhase.HidingPhase:
          this.phase = GamePhase.SeekingPhase
          this.phaseTimer = this.config.seekingDuration
          this.ui.showMessage('👁️ SEEKING PHASE: Seeker เริ่มตามหา! (90 วินาที)')
          console.log('🎮 SEEKING PHASE started')
          break

        case GamePhase.SeekingPhase:
          // หมดเวลา = Hider ชนะ
          this.endGame(true)
          break
      }
    }
  }

  private checkDetection(): void {
    // Auto-detect ถ้า AI seeker เล็งโดนจริง ๆ (ทีละเอียด)
    if (this.phase !== GamePhase.SeekingPhase) return

    for (let seeker of this.seekers) {
      const result = this.detectionSystem.detectHider(seeker, this.player, 15)

      if (result.detected && result.camouflageScore < 0.3) {
        // ถ้ากลมกลืนต่ำและ AI เล็งโดน = auto-catch
        this.captureHider(result.camouflageScore)
      }
    }
  }

  private captureHider(camouflageScore: number): void {
    this.hidersCaught++
    this.camouflageScores.push(camouflageScore)

    const percent = Math.round(camouflageScore * 100)
    this.ui.showMessage(`🔴 ถูกจับ! กลมกลืน ${percent}%`)

    // ทันทีชนะให้ Seeker (Phase 3: 1 player)
    this.endGame(false)
  }

  private endGame(hiderWon: boolean): void {
    this.phase = GamePhase.Result

    this.gameResult = {
      phase: GamePhase.Result,
      hidersCaught: this.hidersCaught,
      totalHiders: 1,
      timeRemaining: Math.max(0, this.phaseTimer),
      camouflageScores: this.camouflageScores
    }

    if (hiderWon) {
      this.ui.showMessage('🎉 HIDER WIN! เหลือเวลา ' + Math.round(this.phaseTimer) + 's')
      console.log('🏆 Hider won!')
    } else {
      this.ui.showMessage('🔴 SEEKER WIN! Hider ถูกจับ')
      console.log('🔴 Seeker won!')
    }

    this.ui.showResult(this.gameResult, hiderWon)
  }

  private reset(): void {
    this.phase = GamePhase.Lobby
    this.phaseTimer = 0
    this.hidersCaught = 0
    this.camouflageScores = []
    this.gameResult = null

    // Remove seekers
    this.seekers.forEach(seeker => {
      this.scene.remove(seeker.getBody())
    })
    this.seekers = []

    this.ui.showMessage('Press ENTER to start game')
    console.log('🔄 Game reset')
  }

  private updateUI(): void {
    const currentPhase = this.phase
    const timeRemaining = Math.max(0, Math.round(this.phaseTimer))

    if (currentPhase === GamePhase.HidingPhase) {
      this.ui.updatePhaseInfo('🎨 HIDING', timeRemaining)
    } else if (currentPhase === GamePhase.SeekingPhase) {
      this.ui.updatePhaseInfo('👁️ SEEKING', timeRemaining)
      this.ui.updateCaughtCount(this.hidersCaught)
    }
  }
}
