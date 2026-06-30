import * as THREE from 'three'
import { RemotePlayer } from './NetworkManager'

export class RemotePlayerManager {
  private scene: THREE.Scene
  private playerMeshes: Map<string, THREE.Group> = new Map()

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  // Create or update remote player mesh
  updateRemotePlayer(remotePlayer: RemotePlayer) {
    let mesh = this.playerMeshes.get(remotePlayer.sessionId)

    if (!mesh) {
      // Create new player mesh
      mesh = this.createPlayerMesh(remotePlayer)
      this.playerMeshes.set(remotePlayer.sessionId, mesh)
      this.scene.add(mesh)
    }

    // Update position & rotation
    mesh.position.copy(remotePlayer.position)
    mesh.rotation.order = 'YXZ'
    mesh.rotation.x = remotePlayer.rotation.x
    mesh.rotation.y = remotePlayer.rotation.y
    mesh.rotation.z = remotePlayer.rotation.z

    // Update visual if caught
    const capsule = mesh.children[0] as THREE.Mesh
    if (capsule && capsule.material) {
      if (remotePlayer.isCaught) {
        (capsule.material as THREE.MeshStandardMaterial).emissive.setHex(0x660000)
      } else {
        (capsule.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000)
      }
    }

    // Update label
    const label = mesh.children[1] as any
    if (label && label.userData?.isLabel) {
      label.position.y = 2
    }
  }

  removeRemotePlayer(sessionId: string) {
    const mesh = this.playerMeshes.get(sessionId)
    if (mesh) {
      this.scene.remove(mesh)
      this.playerMeshes.delete(sessionId)
    }
  }

  private createPlayerMesh(player: RemotePlayer): THREE.Group {
    const group = new THREE.Group()
    group.position.copy(player.position)

    // Determine color based on role
    const color = player.role === 'seeker' ? 0xff0000 : 0xffffff

    // Create capsule
    const capsuleGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8)
    const capsuleMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x000000
    })
    const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial)
    capsule.castShadow = true
    capsule.receiveShadow = true
    group.add(capsule)

    // Create label (name + role)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, 128, 30)
    ctx.font = '14px Arial'
    ctx.fillText(player.role, 128, 50)

    const texture = new THREE.CanvasTexture(canvas)
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    const labelGeometry = new THREE.PlaneGeometry(3, 0.75)
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial)
    labelMesh.position.y = 2
    labelMesh.userData.isLabel = true

    group.add(labelMesh)

    return group
  }

  getRemotePlayerMesh(sessionId: string): THREE.Group | undefined {
    return this.playerMeshes.get(sessionId)
  }

  dispose() {
    this.playerMeshes.forEach(mesh => {
      this.scene.remove(mesh)
    })
    this.playerMeshes.clear()
  }
}
