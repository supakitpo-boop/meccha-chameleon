export interface LobbyCallbacks {
  onJoinRoom: (roomId: string, playerName: string) => void
  onCreateRoom: (roomName: string, playerName: string) => void
  onQuitLobby: () => void
}

export class LobbyUI {
  private container: HTMLElement
  private callbacks: LobbyCallbacks

  constructor(callbacks: LobbyCallbacks) {
    this.callbacks = callbacks
    this.container = this.createLobby()
  }

  show() {
    this.container.style.display = 'flex'
    this.loadRoomList()
  }

  hide() {
    this.container.style.display = 'none'
  }

  private createLobby(): HTMLElement {
    const lobby = document.createElement('div')
    lobby.id = 'lobby-screen'
    lobby.innerHTML = `
      <div class="lobby-panel">
        <h1>🎮 Meccha Chameleon - Online</h1>

        <div class="lobby-tabs">
          <button class="tab-btn active" data-tab="join">📋 Join Room</button>
          <button class="tab-btn" data-tab="create">➕ Create Room</button>
        </div>

        <div id="join-tab" class="tab-content active">
          <div class="player-name-input">
            <label>Player Name:</label>
            <input type="text" id="player-name-join" placeholder="Enter your name" value="Player">
          </div>

          <div class="room-list">
            <h3>Available Rooms</h3>
            <div id="rooms-container">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <button id="refresh-rooms-btn" class="btn-primary">🔄 Refresh</button>
        </div>

        <div id="create-tab" class="tab-content">
          <div class="form-group">
            <label>Player Name:</label>
            <input type="text" id="player-name-create" placeholder="Enter your name" value="Player">
          </div>

          <div class="form-group">
            <label>Room Name:</label>
            <input type="text" id="room-name" placeholder="Enter room name" value="My Game">
          </div>

          <div class="form-group">
            <label>Max Players:</label>
            <input type="number" id="max-players" min="2" max="10" value="6">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="private-room">
              Private Room (password protected)
            </label>
          </div>

          <button id="create-room-btn" class="btn-primary">Create Room</button>
        </div>

        <button id="quit-btn" class="btn-secondary">Exit Game</button>
      </div>
    `

    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #lobby-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }

      .lobby-panel {
        background: rgba(20, 20, 30, 0.95);
        border: 3px solid #0f0;
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 600px;
        color: #fff;
        font-family: Arial, sans-serif;
      }

      .lobby-panel h1 {
        text-align: center;
        color: #0f0;
        margin-bottom: 20px;
      }

      .lobby-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 2px solid #333;
      }

      .tab-btn {
        padding: 10px 20px;
        background: transparent;
        color: #888;
        border: none;
        cursor: pointer;
        font-weight: bold;
        border-bottom: 3px solid transparent;
        transition: all 0.3s;
      }

      .tab-btn.active {
        color: #0f0;
        border-bottom-color: #0f0;
      }

      .tab-content {
        display: none;
        margin-bottom: 20px;
      }

      .tab-content.active {
        display: block;
      }

      .player-name-input, .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        color: #0f0;
      }

      input[type="text"],
      input[type="number"],
      input[type="checkbox"] {
        padding: 8px;
        border: 1px solid #555;
        background: #222;
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
      }

      input[type="text"],
      input[type="number"] {
        width: 100%;
        box-sizing: border-box;
      }

      .room-list {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #555;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        max-height: 300px;
        overflow-y: auto;
      }

      .room-item {
        background: rgba(20, 20, 30, 0.8);
        border: 1px solid #444;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .room-item:hover {
        background: rgba(15, 15, 20, 1);
        border-color: #0f0;
      }

      .room-name {
        font-weight: bold;
        color: #0f0;
      }

      .room-info {
        font-size: 12px;
        color: #888;
        margin-top: 5px;
      }

      .loading {
        text-align: center;
        color: #888;
      }

      .btn-primary, .btn-secondary {
        padding: 12px 20px;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
        margin-bottom: 10px;
      }

      .btn-primary {
        background: #0f0;
        color: #000;
      }

      .btn-primary:hover {
        background: #0f0;
        opacity: 0.8;
      }

      .btn-secondary {
        background: #555;
        color: #fff;
      }

      .btn-secondary:hover {
        background: #666;
      }

      .room-btn {
        width: 100%;
        background: #0f0;
        color: #000;
        border: none;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 10px;
      }

      .room-btn:hover {
        opacity: 0.8;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(lobby)

    // Setup event listeners
    this.setupListeners()

    return lobby
  }

  private setupListeners() {
    // Tab switching
    const tabButtons = this.container.querySelectorAll('.tab-btn')
    const tabContents = this.container.querySelectorAll('.tab-content')

    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const tabName = target.getAttribute('data-tab')

        // Remove active class
        tabButtons.forEach(b => b.classList.remove('active'))
        tabContents.forEach(c => c.classList.remove('active'))

        // Add active class
        target.classList.add('active')
        const activeTab = this.container.querySelector(`#${tabName}-tab`) as HTMLElement
        if (activeTab) activeTab.classList.add('active')
      })
    })

    // Refresh rooms
    this.container.querySelector('#refresh-rooms-btn')?.addEventListener('click', () => {
      this.loadRoomList()
    })

    // Create room
    this.container.querySelector('#create-room-btn')?.addEventListener('click', () => {
      const playerName = (this.container.querySelector('#player-name-create') as HTMLInputElement).value
      const roomName = (this.container.querySelector('#room-name') as HTMLInputElement).value

      if (playerName && roomName) {
        this.callbacks.onCreateRoom(roomName, playerName)
      } else {
        alert('Please fill in all fields')
      }
    })

    // Quit
    this.container.querySelector('#quit-btn')?.addEventListener('click', () => {
      this.callbacks.onQuitLobby()
    })
  }

  private async loadRoomList() {
    const container = this.container.querySelector('#rooms-container')!

    try {
      const response = await fetch('http://localhost:3001/api/rooms')
      const data = await response.json()
      const rooms = data.rooms

      if (rooms.length === 0) {
        container.innerHTML = '<p class="loading">No rooms available. Create one!</p>'
        return
      }

      container.innerHTML = rooms.map((room: any) => `
        <div class="room-item">
          <div class="room-name">${room.name}</div>
          <div class="room-info">
            Players: ${room.players}/${room.maxPlayers} | Phase: ${room.phase}
          </div>
          <button class="room-btn" onclick="window._joinRoom('${room.roomId}')">Join</button>
        </div>
      `).join('')

      // Make joinRoom callable globally
      ;(window as any)._joinRoom = (roomId: string) => {
        const playerName = (this.container.querySelector('#player-name-join') as HTMLInputElement).value
        this.callbacks.onJoinRoom(roomId, playerName)
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
      container.innerHTML = '<p class="loading">Failed to load rooms</p>'
    }
  }
}
