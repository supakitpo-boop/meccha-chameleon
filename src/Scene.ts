import * as THREE from 'three'

export class GameScene {
  private scene: THREE.Scene

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb) // Light blue sky
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 500)

    this.setupLighting()
    this.setupGround()
    this.setupObstacles()
    this.setupWalls()
  }

  getThreeScene(): THREE.Scene {
    return this.scene
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.far = 200
    directionalLight.shadow.camera.left = -100
    directionalLight.shadow.camera.right = 100
    directionalLight.shadow.camera.top = 100
    directionalLight.shadow.camera.bottom = -100
    this.scene.add(directionalLight)
  }

  private setupGround(): void {
    // พื้น
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8,
      metalness: 0.1
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Invisible plane สำหรับ collision
    const collisionGeometry = new THREE.PlaneGeometry(100, 100)
    const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false })
    const collision = new THREE.Mesh(collisionGeometry, collisionMaterial)
    collision.rotation.x = -Math.PI / 2
    collision.position.y = 0
    collision.name = 'ground-collision'
    this.scene.add(collision)
  }

  private setupObstacles(): void {
    // สร้าง obstacles เป็นกล่องต่างขนาดกันให้ซ่อน
    const obstacles = [
      { pos: [-20, 1, -30], size: [4, 2, 4], color: 0xff6b6b }, // แดง
      { pos: [15, 1.5, -25], size: [3, 3, 3], color: 0x4ecdc4 }, // ฟ้า
      { pos: [0, 2, 20], size: [5, 4, 3], color: 0xffe66d },     // เหลือง
      { pos: [-30, 1, 10], size: [3, 2, 4], color: 0x95e1d3 },   // เขียวอ่อน
      { pos: [25, 1, 15], size: [4, 3, 4], color: 0xc7ceea },    // ม่วงอ่อน
      { pos: [-10, 0.5, -15], size: [2, 1, 3], color: 0xffb6c1 }, // ชมพู
      { pos: [30, 1, -10], size: [3, 2.5, 3], color: 0xffd700 },  // ทองคำ
    ]

    obstacles.forEach((obs) => {
      const geometry = new THREE.BoxGeometry(obs.size[0], obs.size[1], obs.size[2])
      const material = new THREE.MeshStandardMaterial({
        color: obs.color,
        roughness: 0.7,
        metalness: 0.2
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(obs.pos[0], obs.pos[1], obs.pos[2])
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.name = 'obstacle'
      this.scene.add(mesh)
    })
  }

  private setupWalls(): void {
    // กำแพง 4 ด้าน
    const wallThickness = 0.2
    const wallHeight = 10
    const roomSize = 100

    const wallPositions = [
      // North wall
      { pos: [0, wallHeight / 2, -roomSize / 2], size: [roomSize, wallHeight, wallThickness] },
      // South wall
      { pos: [0, wallHeight / 2, roomSize / 2], size: [roomSize, wallHeight, wallThickness] },
      // East wall
      { pos: [roomSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, roomSize] },
      // West wall
      { pos: [-roomSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, roomSize] },
    ]

    wallPositions.forEach((wall) => {
      const geometry = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2])
      const material = new THREE.MeshStandardMaterial({
        color: 0x696969,
        roughness: 0.9
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2])
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.name = 'wall'
      this.scene.add(mesh)
    })
  }
}
