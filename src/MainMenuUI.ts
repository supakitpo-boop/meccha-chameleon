export interface MainMenuCallbacks {
  onOnline: () => void
  onOffline: () => void
  onSettings: () => void
  onQuit: () => void
}

export class MainMenuUI {
  private container: HTMLElement
  private callbacks: MainMenuCallbacks

  constructor(callbacks: MainMenuCallbacks) {
    this.callbacks = callbacks
    this.container = this.createMainMenu()
  }

  show() {
    this.container.style.display = 'flex'
  }

  hide() {
    this.container.style.display = 'none'
  }

  private createMainMenu(): HTMLElement {
    const menu = document.createElement('div')
    menu.id = 'main-menu'
    menu.innerHTML = `
      <div class="menu-container">
        <div class="menu-header">
          <h1 class="game-title">🦎 Meccha Chameleon</h1>
          <p class="game-subtitle">Hide & Seek in 3D</p>
        </div>

        <div class="menu-content">
          <div class="menu-buttons">
            <button id="online-btn" class="menu-btn btn-primary">
              🌐 Online Multiplayer
            </button>
            <button id="offline-btn" class="menu-btn btn-secondary">
              🎮 Play Offline (AI)
            </button>
            <button id="settings-btn" class="menu-btn btn-secondary">
              ⚙️ Settings
            </button>
            <button id="quit-btn" class="menu-btn btn-secondary">
              ❌ Exit
            </button>
          </div>

          <div class="menu-info">
            <div class="info-card">
              <h3>🎮 How to Play</h3>
              <ul>
                <li><strong>WASD</strong> — Move</li>
                <li><strong>SPACE</strong> — Jump</li>
                <li><strong>TAB</strong> — Paint Mode</li>
                <li><strong>V</strong> — Toggle Camera</li>
                <li><strong>Mouse</strong> — Look Around</li>
              </ul>
            </div>

            <div class="info-card">
              <h3>🎨 Goal</h3>
              <ul>
                <li><strong>Hiders:</strong> Paint & hide for 90s</li>
                <li><strong>Seekers:</strong> Find all hiders</li>
                <li>Best camouflage wins!</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="menu-footer">
          <p>Version 1.0.0 | Made with ❤️ using Three.js + Colyseus</p>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #main-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        font-family: Arial, sans-serif;
        color: #fff;
      }

      .menu-container {
        width: 90%;
        max-width: 900px;
        background: rgba(20, 20, 30, 0.95);
        border: 3px solid #0f0;
        border-radius: 20px;
        padding: 40px;
        box-shadow: 0 0 50px rgba(0, 255, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .menu-header {
        text-align: center;
      }

      .game-title {
        font-size: 48px;
        color: #0f0;
        margin: 0;
        text-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }

      .game-subtitle {
        font-size: 18px;
        color: #888;
        margin: 10px 0 0 0;
      }

      .menu-content {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 30px;
      }

      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .menu-btn {
        padding: 15px 20px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
      }

      .btn-primary {
        background: #0f0;
        color: #000;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
      }

      .btn-secondary {
        background: rgba(0, 255, 0, 0.1);
        color: #0f0;
        border: 2px solid #0f0;
      }

      .btn-secondary:hover {
        background: rgba(0, 255, 0, 0.2);
        transform: translateY(-2px);
      }

      .menu-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      .info-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #444;
        border-radius: 8px;
        padding: 15px;
      }

      .info-card h3 {
        margin-top: 0;
        color: #0f0;
        font-size: 14px;
      }

      .info-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .info-card li {
        font-size: 12px;
        margin: 8px 0;
        color: #ddd;
      }

      .menu-footer {
        text-align: center;
        border-top: 1px solid #444;
        padding-top: 15px;
        font-size: 12px;
        color: #888;
      }

      @media (max-width: 768px) {
        .menu-content {
          grid-template-columns: 1fr;
        }

        .menu-info {
          grid-template-columns: 1fr;
        }

        .game-title {
          font-size: 36px;
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(menu)

    // Setup listeners
    menu.querySelector('#online-btn')?.addEventListener('click', () => {
      this.callbacks.onOnline()
    })

    menu.querySelector('#offline-btn')?.addEventListener('click', () => {
      this.callbacks.onOffline()
    })

    menu.querySelector('#settings-btn')?.addEventListener('click', () => {
      this.callbacks.onSettings()
    })

    menu.querySelector('#quit-btn')?.addEventListener('click', () => {
      this.callbacks.onQuit()
    })

    return menu
  }
}
