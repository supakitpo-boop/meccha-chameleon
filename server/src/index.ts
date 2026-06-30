import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { Server } from 'colyseus'
import { ChameleonRoom } from './rooms/ChameleonRoom'

const app = express()
const port = process.env.PORT || 3001

// CORS & middleware
app.use(cors())
app.use(express.json())

// Colyseus server
const gameServer = new Server({
  ws: new WebSocketServer({ noServer: true }),
})

// Register room
gameServer.define('chameleon', ChameleonRoom)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: gameServer.roomsToDispose.length })
})

// API: List available rooms
app.get('/api/rooms', (req, res) => {
  const rooms = gameServer.rooms.map(room => ({
    roomId: room.roomId,
    name: (room as any).state?.roomName || 'Unknown',
    players: (room as any).state?.players?.size || 0,
    maxPlayers: (room as any).state?.maxPlayers || 10,
    isPrivate: (room as any).state?.isPrivate || false,
    phase: (room as any).state?.phase || 'unknown'
  }))
  res.json({ rooms })
})

// API: Create room
app.post('/api/rooms', (req, res) => {
  const { roomName, maxPlayers, isPrivate } = req.body
  res.json({
    success: true,
    message: 'Room will be created when first player joins',
    options: { roomName, maxPlayers, isPrivate }
  })
})

// Upgrade HTTP to WebSocket
const server = app.listen(port, () => {
  console.log(`🚀 Colyseus server running on ws://localhost:${port}`)
  console.log(`📊 Monitor available at http://localhost:${port}/colyseus`)
})

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  gameServer.ws.handleUpgrade(request, socket, head, (ws) => {
    gameServer.ws.emit('connection', ws, request)
  })
})
