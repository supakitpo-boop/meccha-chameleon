const { Schema, type, ArraySchema, MapSchema } = require('colyseus')

export enum GamePhase {
  Lobby = 'lobby',
  HidingPhase = 'hiding',
  SeekingPhase = 'seeking',
  Result = 'result'
}

export enum PlayerRole {
  Hider = 'hider',
  Seeker = 'seeker'
}

// Vector3 for sync
export class Vector3 extends Schema {
  @type('number') x: number = 0
  @type('number') y: number = 0
  @type('number') z: number = 0
}

// Player state
export class Player extends Schema {
  @type('string') sessionId: string = ''
  @type('string') name: string = ''
  @type('string') role: string = PlayerRole.Hider
  @type(Vector3) position: Vector3 = new Vector3()
  @type(Vector3) rotation: Vector3 = new Vector3()
  @type('boolean') isReady: boolean = false
  @type('boolean') isCaught: boolean = false
  @type('number') camouflageScore: number = 0
  @type('string') paintTextureBase64: string = '' // สำหรับส่ง texture ครั้งเดียวที่จบ HIDING_PHASE
}

// Match state
export class GameState extends Schema {
  @type('string') phase: string = GamePhase.Lobby
  @type('number') timeLeft: number = 0
  @type('number') hidersRemaining: number = 0
  @type('number') maxPlayers: number = 10
  @type('string') roomName: string = ''
  @type('boolean') isPrivate: boolean = false
  @type('string') hostId: string = ''
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>()
}
