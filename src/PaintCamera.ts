import * as THREE from 'three'
import { Player } from './Player'

export class PaintCamera {
  private camera: THREE.PerspectiveCamera
  private player: Player
  private autoRotateSpeed: number = 0.005
  private orbitRadius: number = 6
  private orbitHeight: number = 1.5
  private currentAngle: number = 0

  constructor(player: Player) {
    this.player = player

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    this.updateCameraPosition()
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  update(deltaTime: number): void {
    // Auto-rotate กล้องรอบตัวละคร
    this.currentAngle += this.autoRotateSpeed

    this.updateCameraPosition()
  }

  private updateCameraPosition(): void {
    const playerPos = this.player.getPosition()

    // Orbit position (วงกลมรอบตัวละคร)
    const orbitX = Math.cos(this.currentAngle) * this.orbitRadius
    const orbitZ = Math.sin(this.currentAngle) * this.orbitRadius

    this.camera.position.set(
      playerPos.x + orbitX,
      playerPos.y + this.orbitHeight,
      playerPos.z + orbitZ
    )

    // ให้กล้องมองไปที่ตัวละคร
    this.camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
