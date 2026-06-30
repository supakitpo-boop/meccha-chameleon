import * as THREE from 'three'
import { Player } from './Player'
import { AISeeker } from './AISeeker'

export interface DetectionResult {
  detected: boolean
  camouflageScore: number  // 0-1, 1 = perfect camouflage
  distance: number
}

export class DetectionSystem {
  private raycaster: THREE.Raycaster
  private scene: THREE.Scene
  private canvas: HTMLCanvasElement

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.raycaster = new THREE.Raycaster()

    // Canvas ชั่วคราวสำหรับ color comparison
    this.canvas = document.createElement('canvas')
    this.canvas.width = 1
    this.canvas.height = 1
  }

  // ตรวจจับว่า Seeker เล็งโดน Hider หรือไม่
  detectHider(seeker: AISeeker, hider: Player, detectionRange: number): DetectionResult {
    const seekerPos = seeker.getPosition()
    const hiderPos = hider.getPosition()
    const distance = seekerPos.distanceTo(hiderPos)

    if (distance > detectionRange) {
      return {
        detected: false,
        camouflageScore: 1,
        distance: distance
      }
    }

    // Raycast เพื่อเล็งตรวจจับ
    const direction = hiderPos.clone().sub(seekerPos).normalize()
    this.raycaster.set(seekerPos, direction)

    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    // หา hider ในรายการ intersects
    for (let obj of intersects) {
      if (obj.object.name === 'hider-body' || obj.distance <= distance + 1) {
        // ได้เล็งโดน hider - ตอนนี้ต้องตรวจสอบสี (camouflage)
        const camouflageScore = this.calculateCamouflageScore(seeker, hider)
        return {
          detected: true,
          camouflageScore: camouflageScore,
          distance: distance
        }
      }
    }

    return {
      detected: false,
      camouflageScore: 1,
      distance: distance
    }
  }

  // คำนวณความกลมกลืน (0 = ไม่กลมกลืน, 1 = กลมกลืนสมบูรณ์)
  calculateCamouflageScore(seeker: AISeeker, hider: Player): number {
    try {
      // ดึงสี average ของตัว hider (painted texture)
      const hiderColor = this.getAverageColor(hider.getCapsule())

      // Raycast ตรวจสอบสี background (ขอบหลัง hider)
      const seekerPos = seeker.getPosition()
      const hiderPos = hider.getPosition()
      const direction = hiderPos.clone().sub(seekerPos).normalize()

      // Raycast ไปข้างหลัง hider เพื่อเก็บ background color
      this.raycaster.set(hiderPos, direction)
      const intersects = this.raycaster.intersectObjects(this.scene.children, true)

      let backgroundColor = new THREE.Color(0x8b7355) // สีพื้นฟ้อท default

      for (let obj of intersects) {
        // ข้ามตัว hider เอง
        if (obj.object === hider.getCapsule()) continue

        if (obj.object.name === 'obstacle' || obj.object.name === 'wall') {
          const material = (obj.object as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (material.color) {
            backgroundColor = material.color.clone()
            break
          }
        }
      }

      // คำนวณความแตกต่าง RGB
      const similarity = this.colorSimilarity(hiderColor, backgroundColor)
      return similarity
    } catch {
      return 0 // ถ้าผิดพลาด ถือว่ากลมกลืนไม่ได้
    }
  }

  private getAverageColor(mesh: THREE.Mesh): THREE.Color {
    const material = mesh.material as THREE.MeshStandardMaterial

    // ถ้ามี texture map (painted)
    if (material.map instanceof THREE.CanvasTexture) {
      const canvas = material.map.image as HTMLCanvasElement
      const ctx = canvas.getContext('2d')!

      // สุ่มตัวอย่าง 10 จุดจากตัวละคร
      let r = 0, g = 0, b = 0, count = 0

      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const imageData = ctx.getImageData(x, y, 1, 1)
        const data = imageData.data

        r += data[0]
        g += data[1]
        b += data[2]
        count++
      }

      return new THREE.Color(
        r / count / 255,
        g / count / 255,
        b / count / 255
      )
    }

    // ถ้าไม่มี texture ให้ใช้สี default
    return material.color.clone()
  }

  private colorSimilarity(color1: THREE.Color, color2: THREE.Color): number {
    // เปรียบเทียบสี RGB โดยใช้ Euclidean distance
    const r = color1.r - color2.r
    const g = color1.g - color2.g
    const b = color1.b - color2.b

    // Distance 0 = same color (1.0 similarity)
    // Distance sqrt(3) = opposite corners (0.0 similarity)
    const distance = Math.sqrt(r * r + g * g + b * b)
    const maxDistance = Math.sqrt(3) // max possible distance ในพื้น RGB unit cube

    // คำนวณความเหมือน (0-1)
    const similarity = Math.max(0, 1 - distance / maxDistance)
    return similarity
  }
}
