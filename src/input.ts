export interface InputState {
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  jump: boolean
}

export class InputManager {
  private input: InputState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false
  }

  constructor(domElement: HTMLCanvasElement) {
    this.setupKeyboardControl()
  }

  getInput(): InputState {
    return this.input
  }

  private setupKeyboardControl(): void {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()

      if (key === 'w' || key === 'arrowup') this.input.moveForward = true
      if (key === 's' || key === 'arrowdown') this.input.moveBackward = true
      if (key === 'a' || key === 'arrowleft') this.input.moveLeft = true
      if (key === 'd' || key === 'arrowright') this.input.moveRight = true
      if (key === ' ') {
        this.input.jump = true
        event.preventDefault()
      }
    })

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase()

      if (key === 'w' || key === 'arrowup') this.input.moveForward = false
      if (key === 's' || key === 'arrowdown') this.input.moveBackward = false
      if (key === 'a' || key === 'arrowleft') this.input.moveLeft = false
      if (key === 'd' || key === 'arrowright') this.input.moveRight = false
      if (key === ' ') this.input.jump = false
    })
  }
}
