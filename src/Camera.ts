import * as THREE from 'three'
import { Player } from './Player'

export enum CameraMode {
  FirstPerson = 'first-person',
  ThirdPerson = 'third-person'
}

export class CameraController {
  private camera: THREE.PerspectiveCamera
  private player: Player
  private mode: CameraMode = CameraMode.FirstPerson
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ')
  private pointerLocked: boolean = false
  private lookSpeed: number = 0.002
  private domElement: HTMLCanvasElement

  // Third-person settings
  private thirdPersonDistance: number = 5
  private thirdPersonHeight: number = 2

  constructor(domElement: HTMLCanvasElement, player: Player) {
    this.domElement = domElement
    this.player = player

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    this.setupPointerLock()
    this.setupMouseControl()
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  toggleCameraMode(): void {
    this.mode = this.mode === CameraMode.FirstPerson
      ? CameraMode.ThirdPerson
      : CameraMode.FirstPerson

    console.log(`📷 Camera mode: ${this.mode}`)
  }

  update(): void {
    const playerPos = this.player.getPosition()

    if (this.mode === CameraMode.FirstPerson) {
      // First-person: camera อยู่ที่หัวผู้เล่น
      this.camera.position.copy(playerPos)
      this.camera.position.y += this.player.getHeight() / 2
    } else {
      // Third-person: camera ลอยหลังผู้เล่น
      const cameraOffset = new THREE.Vector3(0, this.thirdPersonHeight, this.thirdPersonDistance)
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.order === 'YXZ' ? this.euler.y : 0)

      this.camera.position.lerp(
        playerPos.clone().add(cameraOffset),
        0.1
      )
      this.camera.lookAt(playerPos.clone().add(new THREE.Vector3(0, 1, 0)))
    }
  }

  private setupPointerLock(): void {
    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock =
        (this.domElement as any).requestPointerLock ||
        (this.domElement as any).mozRequestPointerLock
      this.domElement.requestPointerLock()
    })

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.domElement
    })
  }

  private setupMouseControl(): void {
    document.addEventListener('mousemove', (event) => {
      if (!this.pointerLocked) return

      this.euler.setFromQuaternion(this.camera.quaternion)

      this.euler.y -= event.movementX * this.lookSpeed
      this.euler.x -= event.movementY * this.lookSpeed

      // Clamp pitch
      this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))

      this.camera.quaternion.setFromEuler(this.euler)
    })
  }
}
