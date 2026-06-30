import { GameResult } from './GameManager'

export class GameUI {
  private hud: HTMLElement
  private messageBox: HTMLElement
  private resultPanel: HTMLElement

  constructor() {
    this.hud = this.createHUD()
    this.messageBox = this.createMessageBox()
    this.resultPanel = this.createResultPanel()
    this.showLobbyMessage()
  }

  showMessage(text: string, duration: number = 3000): void {
    this.messageBox.textContent = text
    this.messageBox.style.display = 'block'

    setTimeout(() => {
      this.messageBox.style.display = 'none'
    }, duration)
  }

  updatePhaseInfo(phase: string, time: number): void {
    const phaseEl = this.hud.querySelector('#phase-info')
    const timerEl = this.hud.querySelector('#timer')

    if (phaseEl) phaseEl.textContent = phase
    if (timerEl) timerEl.textContent = time.toString().padStart(2, '0') + 's'
  }

  updateCaughtCount(count: number): void {
    const caughtEl = this.hud.querySelector('#caught-count')
    if (caughtEl) caughtEl.textContent = count.toString()
  }

  showResult(result: GameResult, hiderWon: boolean): void {
    const titleEl = this.resultPanel.querySelector('#result-title') as HTMLElement
    const detailsEl = this.resultPanel.querySelector('#result-details') as HTMLElement

    if (hiderWon) {
      titleEl.textContent = '🎉 HIDER WIN!'
      titleEl.style.color = '#0f0'
      detailsEl.innerHTML = `
        <p>⏱️ เหลือเวลา: <strong>${result.timeRemaining}s</strong></p>
        <p>👁️ Seekers caught: <strong>0</strong></p>
        ${
          result.camouflageScores.length > 0
            ? `<p>🎨 Camouflage: <strong>${Math.round(result.camouflageScores[0] * 100)}%</strong></p>`
            : ''
        }
        <p style="margin-top: 20px; color: #888; font-size: 12px;">Press ENTER to play again</p>
      `
    } else {
      titleEl.textContent = '🔴 SEEKER WIN!'
      titleEl.style.color = '#ff6666'
      detailsEl.innerHTML = `
        <p>Hiders caught: <strong>${result.hidersCaught} / ${result.totalHiders}</strong></p>
        ${
          result.camouflageScores.length > 0
            ? `<p>🎨 Your camouflage: <strong>${Math.round(result.camouflageScores[0] * 100)}%</strong></p>
               <p style="color: #ff8; font-size: 12px;">💡 Try to paint more, blend better!</p>`
            : ''
        }
        <p style="margin-top: 20px; color: #888; font-size: 12px;">Press ENTER to play again</p>
      `
    }

    this.resultPanel.style.display = 'block'
  }

  hideResult(): void {
    this.resultPanel.style.display = 'none'
  }

  private showLobbyMessage(): void {
    this.messageBox.textContent = '🎮 Press ENTER to start game'
    this.messageBox.style.display = 'block'
  }

  private createHUD(): HTMLElement {
    const hud = document.createElement('div')
    hud.id = 'game-hud'
    hud.innerHTML = `
      <div class="hud-section">
        <div class="hud-item">
          <span id="phase-info">LOBBY</span>
        </div>
        <div class="hud-item">
          <span>⏱️</span>
          <span id="timer">--</span>
        </div>
      </div>
      <div class="hud-section">
        <div class="hud-item">
          <span>🔴 Caught:</span>
          <span id="caught-count">0</span>
        </div>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #game-hud {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(20, 20, 30, 0.8);
        border: 2px solid #0f0;
        border-radius: 8px;
        padding: 20px 30px;
        color: #0f0;
        font-family: Arial, sans-serif;
        font-size: 18px;
        z-index: 500;
        display: none;
        pointer-events: none;
      }

      .hud-section {
        display: flex;
        gap: 30px;
        margin: 15px 0;
        justify-content: center;
      }

      .hud-item {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      #timer {
        font-size: 24px;
        font-weight: bold;
        color: #ff6666;
        min-width: 50px;
      }

      #phase-info {
        font-weight: bold;
        min-width: 150px;
      }

      #caught-count {
        color: #ff6666;
        font-weight: bold;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(hud)

    return hud
  }

  private createMessageBox(): HTMLElement {
    const msg = document.createElement('div')
    msg.id = 'game-message'
    msg.textContent = 'Press ENTER to start'

    const style = document.createElement('style')
    style.textContent = `
      #game-message {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #0f0;
        border-radius: 8px;
        padding: 15px 30px;
        color: #0f0;
        font-family: Arial, sans-serif;
        font-size: 16px;
        z-index: 600;
        text-align: center;
        max-width: 400px;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(msg)

    return msg
  }

  private createResultPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.id = 'result-panel'
    panel.innerHTML = `
      <div class="result-card">
        <h2 id="result-title">RESULT</h2>
        <div id="result-details"></div>
      </div>
    `

    const style = document.createElement('style')
    style.textContent = `
      #result-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 700;
        display: none;
      }

      .result-card {
        background: rgba(20, 20, 30, 0.95);
        border: 3px solid #0f0;
        border-radius: 12px;
        padding: 40px;
        text-align: center;
        min-width: 350px;
        color: #fff;
        font-family: Arial, sans-serif;
      }

      #result-title {
        font-size: 32px;
        margin-bottom: 20px;
      }

      #result-details {
        font-size: 16px;
        line-height: 1.8;
      }

      #result-details p {
        margin: 10px 0;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(panel)

    return panel
  }
}
