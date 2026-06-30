import * as THREE from 'three'
import { Player } from './Player'

export interface PaintState {
  isPainting: boolean
  selectedColor: string
  brushSize: number
  inkBudget: number
  maxInkBudget: number
}

export class PaintSystem {
  private player: Player
  private paintCanvas: HTMLCanvasElement
  private paintCtx: CanvasRenderingContext2D
  private paintTexture: THREE.CanvasTexture
  private state: PaintState
  private paintUI: HTMLElement
  private isMouseOver2DCanvas: boolean = false
  private raycaster: THREE.Raycaster
  private scene: THREE.Scene

  // Paint settings
  private canvasSize: number = 512
  private maxInkBudget: number = 100
  private inkCostPerPixel: number = 0.1

  constructor(player: Player, scene: THREE.Scene) {
    this.player = player
    this.scene = scene
    this.raycaster = new THREE.Raycaster()

    // สร้าง canvas สำหรับ texture
    this.paintCanvas = document.createElement('canvas')
    this.paintCanvas.width = this.canvasSize
    this.paintCanvas.height = this.canvasSize

    this.paintCtx = this.paintCanvas.getContext('2d')!
    this.fillCanvasWithWhite()

    // สร้าง texture จาก canvas
    this.paintTexture = new THREE.CanvasTexture(this.paintCanvas)
    this.paintTexture.magFilter = THREE.LinearFilter
    this.paintTexture.minFilter = THREE.LinearFilter

    // ประยุกต์ texture ให้ player
    this.applyTextureToPlayer()

    // Initialize paint state
    this.state = {
      isPainting: false,
      selectedColor: '#000000',
      brushSize: 20,
      inkBudget: this.maxInkBudget,
      maxInkBudget: this.maxInkBudget
    }

    // Create paint UI
    this.paintUI = this.createPaintUI()
    this.setupPaintUIListeners()
    this.hidePaintUI()

    // Setup keyboard toggle
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'tab') {
        e.preventDefault()
        this.togglePaintMode()
      }
    })

    // Setup canvas interaction
    this.paintUI.querySelector('#paint-canvas')?.addEventListener('mouseenter', () => {
      this.isMouseOver2DCanvas = true
    })
    this.paintUI.querySelector('#paint-canvas')?.addEventListener('mouseleave', () => {
      this.isMouseOver2DCanvas = false
    })
  }

  getPaintState(): PaintState {
    return this.state
  }

  isPaintModeActive(): boolean {
    return this.state.isPainting
  }

  togglePaintMode(): void {
    this.state.isPainting = !this.state.isPainting

    if (this.state.isPainting) {
      console.log('🎨 Paint mode ON')
      this.showPaintUI()
      this.updatePaintUIDisplay()
    } else {
      console.log('🎨 Paint mode OFF')
      this.hidePaintUI()
    }
  }

  // วาดบน canvas texture (2D paint drawing)
  paintOnCanvasTexture(x: number, y: number): void {
    if (!this.state.isPainting || this.state.inkBudget <= 0) return

    const normalizedX = x / this.canvasSize
    const normalizedY = y / this.canvasSize

    // ใช้ brush size สำหรับวาดวงกลม
    const ctx = this.paintCtx
    ctx.fillStyle = this.state.selectedColor
    ctx.globalAlpha = 0.9

    // วาดวงกลมหลายจุดเพื่อลด ink
    const brushRadius = this.state.brushSize / 2
    const pixelsToFill = Math.PI * brushRadius * brushRadius

    ctx.beginPath()
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2)
    ctx.fill()

    // ลด ink budget
    this.state.inkBudget -= pixelsToFill * this.inkCostPerPixel
    this.state.inkBudget = Math.max(0, this.state.inkBudget)

    // Update texture
    this.paintTexture.needsUpdate = true
    this.updatePaintUIDisplay()
  }

  // ดูดสีจากฉากด้วย eyedropper
  eyedropperColor(camera: THREE.Camera): void {
    // Ray cast ไปหา obstacle ที่เล็ง
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(0, 0) // จุดศูนย์กลางหน้าจอ

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(this.scene.children, true)

    for (let obj of intersects) {
      if (obj.object.name === 'obstacle') {
        const material = (obj.object as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (material.color) {
          // แปลง color เป็น hex string
          const color = material.color.getHexString()
          this.state.selectedColor = '#' + color
          console.log(`💧 Picked color: #${color}`)
          this.updatePaintUIDisplay()
          return
        }
      }
    }
  }

  // Reload/Clear canvas
  clearCanvas(): void {
    this.fillCanvasWithWhite()
    this.paintTexture.needsUpdate = true
    this.state.inkBudget = this.state.maxInkBudget
    console.log('🧹 Canvas cleared')
    this.updatePaintUIDisplay()
  }

  // ส่วนตัวใช้งาน
  private fillCanvasWithWhite(): void {
    this.paintCtx.fillStyle = '#ffffff'
    this.paintCtx.fillRect(0, 0, this.canvasSize, this.canvasSize)
  }

  private applyTextureToPlayer(): void {
    const capsule = this.player.getCapsule()
    const material = capsule.material as THREE.MeshStandardMaterial
    material.map = this.paintTexture
    material.color.set(0xffffff)
    material.needsUpdate = true
  }

  private createPaintUI(): HTMLElement {
    const container = document.createElement('div')
    container.id = 'paint-mode'
    container.innerHTML = `
      <div class="paint-panel">
        <h3>🎨 Paint Mode (Tab to exit)</h3>

        <div class="paint-section">
          <label>สี:</label>
          <input type="color" id="color-picker" value="#000000">
          <button id="eyedropper-btn">💧 ดูดสี</button>
        </div>

        <div class="paint-section">
          <label>ขนาดแปรง: <span id="brush-size-display">20</span>px</label>
          <input type="range" id="brush-size" min="5" max="100" value="20">
        </div>

        <div class="paint-section">
          <canvas id="paint-canvas" width="300" height="300"></canvas>
          <p class="hint">ดับเบิ้ลคลิกเพื่อวาด | Click & Drag to paint</p>
        </div>

        <div class="paint-section">
          <p>หมึก: <span id="ink-budget">100</span> / <span id="max-ink">100</span></p>
          <div class="ink-bar">
            <div id="ink-fill" class="ink-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="paint-controls">
          <button id="clear-btn">🧹 Clear</button>
          <button id="done-btn">✅ Done</button>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #paint-mode {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        display: none;
      }

      .paint-panel {
        background: rgba(20, 20, 30, 0.95);
        border: 2px solid #0f0;
        border-radius: 8px;
        padding: 20px;
        min-width: 400px;
        color: #fff;
        font-family: Arial, sans-serif;
      }

      .paint-panel h3 {
        margin-bottom: 15px;
        color: #0f0;
        text-align: center;
      }

      .paint-section {
        margin: 15px 0;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 5px;
      }

      .paint-section label {
        display: block;
        margin-bottom: 8px;
        color: #0f0;
      }

      #color-picker {
        width: 60px;
        height: 40px;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        margin-right: 10px;
      }

      #eyedropper-btn {
        padding: 8px 15px;
        background: #0f0;
        color: #000;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }

      #eyedropper-btn:hover {
        background: #0f0;
        opacity: 0.8;
      }

      #brush-size {
        width: 100%;
        margin-top: 8px;
      }

      #paint-canvas {
        width: 100%;
        max-width: 300px;
        height: 300px;
        background: white;
        border: 2px solid #333;
        border-radius: 4px;
        cursor: crosshair;
        display: block;
        margin: 10px auto;
      }

      .hint {
        font-size: 12px;
        color: #888;
        text-align: center;
        margin: 5px 0;
      }

      #ink-budget {
        color: #0f0;
      }

      .ink-bar {
        width: 100%;
        height: 20px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 8px;
      }

      .ink-fill {
        height: 100%;
        background: linear-gradient(90deg, #0f0, #ff0);
        transition: width 0.2s;
      }

      .paint-controls {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }

      .paint-controls button {
        flex: 1;
        padding: 10px;
        background: #0f0;
        color: #000;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
      }

      .paint-controls button:hover {
        background: #0f0;
        opacity: 0.8;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(container)

    return container
  }

  private setupPaintUIListeners(): void {
    const colorPicker = this.paintUI.querySelector('#color-picker') as HTMLInputElement
    const brushSize = this.paintUI.querySelector('#brush-size') as HTMLInputElement
    const eyedropperBtn = this.paintUI.querySelector('#eyedropper-btn') as HTMLButtonElement
    const clearBtn = this.paintUI.querySelector('#clear-btn') as HTMLButtonElement
    const doneBtn = this.paintUI.querySelector('#done-btn') as HTMLButtonElement
    const paintCanvas = this.paintUI.querySelector('#paint-canvas') as HTMLCanvasElement

    colorPicker.addEventListener('change', (e) => {
      this.state.selectedColor = (e.target as HTMLInputElement).value
    })

    brushSize.addEventListener('input', (e) => {
      this.state.brushSize = parseInt((e.target as HTMLInputElement).value)
      this.updatePaintUIDisplay()
    })

    eyedropperBtn.addEventListener('click', () => {
      // Implemented in Game.ts - need camera reference
      console.log('💧 Eyedropper - implement with camera')
    })

    clearBtn.addEventListener('click', () => {
      this.clearCanvas()
    })

    doneBtn.addEventListener('click', () => {
      this.togglePaintMode()
    })

    // Canvas drawing
    let isDrawing = false

    paintCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true
      this.handleCanvasMouseEvent(e, paintCanvas)
    })

    paintCanvas.addEventListener('mousemove', (e) => {
      if (isDrawing) {
        this.handleCanvasMouseEvent(e, paintCanvas)
      }
    })

    paintCanvas.addEventListener('mouseup', () => {
      isDrawing = false
    })

    paintCanvas.addEventListener('mouseleave', () => {
      isDrawing = false
    })
  }

  private handleCanvasMouseEvent(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.paintOnCanvasTexture(x, y)
  }

  private showPaintUI(): void {
    const ui = this.paintUI.querySelector('#paint-mode') as HTMLElement
    if (ui) ui.style.display = 'block'
  }

  private hidePaintUI(): void {
    const ui = this.paintUI.querySelector('#paint-mode') as HTMLElement
    if (ui) ui.style.display = 'none'
  }

  private updatePaintUIDisplay(): void {
    const brushDisplay = this.paintUI.querySelector('#brush-size-display')
    const inkDisplay = this.paintUI.querySelector('#ink-budget')
    const inkFill = this.paintUI.querySelector('#ink-fill') as HTMLElement

    if (brushDisplay) {
      brushDisplay.textContent = this.state.brushSize.toString()
    }

    if (inkDisplay) {
      inkDisplay.textContent = Math.ceil(this.state.inkBudget).toString()
    }

    if (inkFill) {
      const percentage = (this.state.inkBudget / this.state.maxInkBudget) * 100
      inkFill.style.width = percentage + '%'
    }

    // Color picker sync
    const colorPicker = this.paintUI.querySelector('#color-picker') as HTMLInputElement
    if (colorPicker && colorPicker.value !== this.state.selectedColor) {
      colorPicker.value = this.state.selectedColor
    }
  }
}
