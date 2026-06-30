export interface PlayerCustomization {
  name: string
  color: string
}

export interface CustomizationCallbacks {
  onConfirm: (customization: PlayerCustomization) => void
  onCancel: () => void
}

export class PlayerCustomizationUI {
  private container: HTMLElement
  private callbacks: CustomizationCallbacks
  private customization: PlayerCustomization = {
    name: 'Player',
    color: '#ff6b6b'
  }

  constructor(callbacks: CustomizationCallbacks) {
    this.callbacks = callbacks
    this.container = this.createUI()
  }

  show() {
    this.container.style.display = 'flex'
  }

  hide() {
    this.container.style.display = 'none'
  }

  private createUI(): HTMLElement {
    const modal = document.createElement('div')
    modal.id = 'customization-modal'
    modal.innerHTML = `
      <div class="customization-card">
        <h2>🎮 Customize Your Player</h2>

        <div class="customization-form">
          <div class="form-group">
            <label for="player-name">Player Name:</label>
            <input
              type="text"
              id="player-name"
              placeholder="Enter your name"
              value="Player"
              maxlength="20"
            >
            <small id="name-hint" style="color: #888;">20 characters max</small>
          </div>

          <div class="form-group">
            <label for="player-color">Player Color:</label>
            <div class="color-picker-group">
              <input type="color" id="player-color" value="#ff6b6b">
              <div id="color-preview" class="color-preview" style="background: #ff6b6b;"></div>
            </div>
          </div>

          <div class="preset-colors">
            <h4>Quick Colors:</h4>
            <div class="color-buttons">
              <button class="color-btn" data-color="#ff6b6b" title="Red" style="background: #ff6b6b;"></button>
              <button class="color-btn" data-color="#4ecdc4" title="Cyan" style="background: #4ecdc4;"></button>
              <button class="color-btn" data-color="#ffe66d" title="Yellow" style="background: #ffe66d;"></button>
              <button class="color-btn" data-color="#95e1d3" title="Green" style="background: #95e1d3;"></button>
              <button class="color-btn" data-color="#c7ceea" title="Purple" style="background: #c7ceea;"></button>
              <button class="color-btn" data-color="#ffb6c1" title="Pink" style="background: #ffb6c1;"></button>
            </div>
          </div>

          <div class="preview-section">
            <h4>Preview:</h4>
            <div class="player-preview">
              <div id="preview-player" class="preview-capsule"></div>
              <p id="preview-name">Player</p>
            </div>
          </div>
        </div>

        <div class="customization-buttons">
          <button id="confirm-btn" class="btn-primary">✅ Confirm</button>
          <button id="cancel-btn" class="btn-secondary">❌ Cancel</button>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #customization-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2500;
      }

      .customization-card {
        background: rgba(20, 20, 30, 0.95);
        border: 3px solid #0f0;
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 450px;
        color: #fff;
        font-family: Arial, sans-serif;
      }

      .customization-card h2 {
        color: #0f0;
        margin-top: 0;
        text-align: center;
      }

      .customization-form {
        margin: 20px 0;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        color: #0f0;
        font-weight: bold;
        margin-bottom: 8px;
      }

      input[type="text"],
      input[type="color"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #555;
        background: #222;
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }

      input[type="text"]:focus,
      input[type="color"]:focus {
        outline: none;
        border-color: #0f0;
      }

      .color-picker-group {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      input[type="color"] {
        width: 60px;
        height: 40px;
        padding: 2px;
        cursor: pointer;
      }

      .color-preview {
        width: 60px;
        height: 40px;
        border-radius: 4px;
        border: 2px solid #555;
      }

      .preset-colors {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }

      .preset-colors h4 {
        margin-top: 0;
        color: #0f0;
        font-size: 12px;
      }

      .color-buttons {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
      }

      .color-btn {
        width: 40px;
        height: 40px;
        border: 2px solid #555;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .color-btn:hover {
        border-color: #0f0;
        transform: scale(1.1);
      }

      .preview-section {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        margin-bottom: 20px;
      }

      .preview-section h4 {
        margin-top: 0;
        color: #0f0;
        font-size: 12px;
      }

      .player-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .preview-capsule {
        width: 40px;
        height: 60px;
        background: #ff6b6b;
        border-radius: 20px;
        box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
      }

      #preview-name {
        color: #0f0;
        margin: 0;
        font-weight: bold;
      }

      .customization-buttons {
        display: flex;
        gap: 10px;
      }

      .btn-primary, .btn-secondary {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #0f0;
        color: #000;
      }

      .btn-primary:hover {
        opacity: 0.8;
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: rgba(0, 255, 0, 0.1);
        color: #0f0;
        border: 2px solid #0f0;
      }

      .btn-secondary:hover {
        background: rgba(0, 255, 0, 0.2);
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(modal)

    // Setup listeners
    this.setupListeners(modal)

    return modal
  }

  private setupListeners(modal: HTMLElement) {
    const nameInput = modal.querySelector('#player-name') as HTMLInputElement
    const colorInput = modal.querySelector('#player-color') as HTMLInputElement
    const colorPreview = modal.querySelector('#color-preview') as HTMLElement
    const previewCapsule = modal.querySelector('.preview-capsule') as HTMLElement
    const previewName = modal.querySelector('#preview-name') as HTMLElement
    const confirmBtn = modal.querySelector('#confirm-btn') as HTMLButtonElement
    const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement
    const colorBtns = modal.querySelectorAll('.color-btn')

    // Update on name change
    nameInput?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.customization.name = value || 'Player'
      if (previewName) previewName.textContent = this.customization.name
    })

    // Update on color change
    colorInput?.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value
      this.customization.color = color
      if (colorPreview) colorPreview.style.background = color
      if (previewCapsule) previewCapsule.style.background = color
    })

    // Preset colors
    colorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = (e.target as HTMLElement).getAttribute('data-color')
        if (color) {
          this.customization.color = color
          if (colorInput) colorInput.value = color
          if (colorPreview) colorPreview.style.background = color
          if (previewCapsule) previewCapsule.style.background = color
        }
      })
    })

    // Confirm button
    confirmBtn?.addEventListener('click', () => {
      this.callbacks.onConfirm(this.customization)
    })

    // Cancel button
    cancelBtn?.addEventListener('click', () => {
      this.callbacks.onCancel()
    })
  }
}
