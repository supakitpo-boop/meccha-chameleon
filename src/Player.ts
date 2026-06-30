import * as THREE from 'three'
import { InputState } from './input'

export class Player {
  private body: THREE.Group
  private capsule: THREE.Mesh
  private scene: THREE.Scene
  private velocity: THREE.Vector3 = new THREE.Vector3()
  private isGrounded: boolean = false
  private moveSpeed: number = 15
  private jumpForce: number = 15
  private gravity: number = 30
  private raycaster: THREE.Raycaster
  private groundCheckDistance: number = 0.1

  // Player dimensions
  private playerRadius: number = 0.5
  private playerHeight: number = 2

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.raycaster = new THREE.Raycaster()

    // Create player body (Group for easier management)
    this.body = new THREE.Group()
    this.body.position.set(0, 1.2, 0)
    this.body.name = 'hider-body'

    // Create capsule mesh (white player character)
    const capsuleGeometry = new THREE.CapsuleGeometry(
      this.playerRadius,
      this.playerHeight,
      4,
      8
    )
    const capsuleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1
    })
    this.capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
    this.capsule.castShadow = true
    this.capsule.receiveShadow = true
    this.body.add(this.capsule)

    this.scene.add(this.body)
  }

  update(input: InputState, deltaTime: number): void {
    this.checkGround()
    this.handleMovement(input, deltaTime)
    this.handleJump(input, deltaTime)
    this.applyGravity(deltaTime)
    this.clampPosition()
  }

  getPosition(): THREE.Vector3 {
    return this.body.position.clone()
  }

  getBody(): THREE.Group {
    return this.body
  }

  getCapsule(): THREE.Mesh {
    return this.capsule
  }

  getRadius(): number {
    return this.playerRadius
  }

  getHeight(): number {
    return this.playerHeight
  }

  private checkGround(): void {
    // Raycast ลงด้านล่างเพื่อตรวจสอบพื้น
    const origin = this.body.position.clone()
    const direction = new THREE.Vector3(0, -1, 0)

    this.raycaster.set(origin, direction)
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    this.isGrounded = false
    for (let obj of intersects) {
      // Skip the player's own mesh
      if (obj.object === this.capsule) continue

      if (obj.distance < this.groundCheckDistance + 0.05) {
        this.isGrounded = true
        break
      }
    }
  }

  private handleMovement(input: InputState, deltaTime: number): void {
    const moveDirection = new THREE.Vector3()

    // Calculate movement direction based on camera forward/right
    const forward = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3(1, 0, 0)

    if (input.moveForward) moveDirection.add(forward)
    if (input.moveBackward) moveDirection.add(forward.multiplyScalar(-1))
    if (input.moveLeft) moveDirection.add(right.multiplyScalar(-1))
    if (input.moveRight) moveDirection.add(right)

    if (moveDirection.length() > 0) {
      moveDirection.normalize()

      // Apply horizontal movement
      this.velocity.x = moveDirection.x * this.moveSpeed
      this.velocity.z = moveDirection.z * this.moveSpeed
    } else {
      // Decelerate
      this.velocity.x *= 0.85
      this.velocity.z *= 0.85
    }

    // Update position
    this.body.position.addScaledVector(this.velocity, deltaTime)
  }

  private handleJump(input: InputState, deltaTime: number): void {
    if (input.jump && this.isGrounded) {
      this.velocity.y = this.jumpForce
      this.isGrounded = false
    }
  }

  private applyGravity(deltaTime: number): void {
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime
    } else if (this.velocity.y < 0) {
      this.velocity.y = 0
    }

    // Apply vertical velocity
    this.body.position.y += this.velocity.y * deltaTime
  }

  private clampPosition(): void {
    // ป้องกันให้ผู้เล่นออกนอกแผนที่
    const maxX = 48
    const maxZ = 48

    if (this.body.position.x > maxX)
      this.body.position.x = maxX
    if (this.body.position.x < -maxX)
      this.body.position.x = -maxX
    if (this.body.position.z > maxZ)
      this.body.position.z = maxZ
    if (this.body.position.z < -maxZ)
      this.body.position.z = -maxZ

    // ป้องกันให้ไม่ตกลงแผนที่
    if (this.body.position.y < -10) {
      this.body.position.y = 1.2
      this.velocity.y = 0
    }
  }
}
