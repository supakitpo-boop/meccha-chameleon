import * as THREE from 'three'
import { Player } from './Player'

export class AISeeker {
  private body: THREE.Group
  private capsule: THREE.Mesh
  private scene: THREE.Scene
  private velocity: THREE.Vector3 = new THREE.Vector3()
  private isGrounded: boolean = false

  // Movement
  private moveSpeed: number = 10
  private jumpForce: number = 12
  private gravity: number = 30
  private raycaster: THREE.Raycaster
  private groundCheckDistance: number = 0.1

  // Behavior
  private targetPlayer: Player
  private behaviorTimer: number = 0
  private behaviorDuration: number = 3 // วินาทีต่อพฤติกรรม
  private moveDirection: THREE.Vector3 = new THREE.Vector3()
  private isChasing: boolean = false
  private chaseDistance: number = 30 // เริ่มตามเมื่อใกล้ 30 หน่วย

  // Dimensions
  private playerRadius: number = 0.5
  private playerHeight: number = 2

  constructor(scene: THREE.Scene, targetPlayer: Player, startPosition: THREE.Vector3) {
    this.scene = scene
    this.targetPlayer = targetPlayer
    this.raycaster = new THREE.Raycaster()

    // Create seeker body
    this.body = new THREE.Group()
    this.body.position.copy(startPosition)

    // Create capsule mesh (สีแดง สำหรับ AI seeker)
    const capsuleGeometry = new THREE.CapsuleGeometry(
      this.playerRadius,
      this.playerHeight,
      4,
      8
    )
    const capsuleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,  // สีแดง
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0x330000
    })
    this.capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
    this.capsule.castShadow = true
    this.capsule.receiveShadow = true
    this.body.add(this.capsule)

    this.scene.add(this.body)
  }

  update(deltaTime: number): void {
    this.checkGround()
    this.updateBehavior(deltaTime)
    this.handleMovement(deltaTime)
    this.applyGravity(deltaTime)
    this.clampPosition()
  }

  getPosition(): THREE.Vector3 {
    return this.body.position.clone()
  }

  getBody(): THREE.Group {
    return this.body
  }

  isChasing_(): boolean {
    return this.isChasing
  }

  // ตรวจสอบว่า hider อยู่ในระยะที่มอง
  canSeeHider(detectionRange: number): boolean {
    const seekerPos = this.body.position
    const hiderPos = this.targetPlayer.getPosition()
    const distance = seekerPos.distanceTo(hiderPos)

    if (distance > detectionRange) return false

    // Raycast ตรวจสอบว่ามีกำแพงระหว่างกลาง
    const direction = hiderPos.clone().sub(seekerPos).normalize()
    this.raycaster.set(seekerPos, direction)

    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    for (let obj of intersects) {
      if (obj.object === this.capsule) continue
      if (obj.distance < distance) {
        // มีสิ่งกั้นระหว่าง
        return false
      }
    }

    return true
  }

  // ส่วนตัวใช้งาน
  private checkGround(): void {
    const origin = this.body.position.clone()
    const direction = new THREE.Vector3(0, -1, 0)

    this.raycaster.set(origin, direction)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    this.isGrounded = false
    for (let obj of intersects) {
      if (obj.object === this.capsule) continue
      if (obj.distance < this.groundCheckDistance + 0.05) {
        this.isGrounded = true
        break
      }
    }
  }

  private updateBehavior(deltaTime: number): void {
    this.behaviorTimer -= deltaTime

    const hiderPos = this.targetPlayer.getPosition()
    const seekerPos = this.body.position
    const distanceToHider = seekerPos.distanceTo(hiderPos)

    // ตรวจสอบว่าเล็งเจอหรือไม่
    if (this.canSeeHider(this.chaseDistance)) {
      this.isChasing = true
    } else if (distanceToHider > this.chaseDistance + 10) {
      this.isChasing = false
    }

    // สิ้นสุดพฤติกรรมปัจจุบัน
    if (this.behaviorTimer <= 0) {
      this.decideBehavior()
      this.behaviorTimer = this.behaviorDuration
    }
  }

  private decideBehavior(): void {
    if (this.isChasing) {
      // ตามหา Hider
      const hiderPos = this.targetPlayer.getPosition()
      const seekerPos = this.body.position
      this.moveDirection = hiderPos.clone().sub(seekerPos).normalize()
    } else {
      // เดินสุ่ม (random walk)
      const randomAngle = Math.random() * Math.PI * 2
      this.moveDirection = new THREE.Vector3(
        Math.cos(randomAngle),
        0,
        Math.sin(randomAngle)
      )
    }

    // บางครั้งกระโดด
    if (Math.random() < 0.2 && this.isGrounded) {
      this.velocity.y = this.jumpForce
    }
  }

  private handleMovement(deltaTime: number): void {
    if (this.moveDirection.length() > 0) {
      this.velocity.x = this.moveDirection.x * this.moveSpeed
      this.velocity.z = this.moveDirection.z * this.moveSpeed
    } else {
      this.velocity.x *= 0.85
      this.velocity.z *= 0.85
    }

    this.body.position.addScaledVector(this.velocity, deltaTime)
  }

  private applyGravity(deltaTime: number): void {
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0
    }

    this.body.position.y += this.velocity.y * deltaTime
  }

  private clampPosition(): void {
    const maxX = 48
    const maxZ = 48

    if (this.body.position.x > maxX) this.body.position.x = maxX
    if (this.body.position.x < -maxX) this.body.position.x = -maxX
    if (this.body.position.z > maxZ) this.body.position.z = maxZ
    if (this.body.position.z < -maxZ) this.body.position.z = -maxZ

    if (this.body.position.y < -10) {
      this.body.position.y = 1.2
      this.velocity.y = 0
    }
  }
}
