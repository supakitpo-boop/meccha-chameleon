export class SoundManager {
  private audioContext: AudioContext | null = null
  private masterVolume: number = 0.7
  private sfxVolume: number = 0.5
  private musicVolume: number = 0.3
  private soundCache: Map<string, AudioBuffer> = new Map()

  constructor() {
    // Initialize Web Audio API
    try {
      const audioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
      this.audioContext = new audioContextClass()
    } catch (e) {
      console.warn('⚠️ Web Audio API not supported')
    }
  }

  // Play sound effect
  playSFX(soundName: string, volume: number = 1) {
    if (!this.audioContext) return

    // Map sound names to generated sounds
    const frequency = this.getSoundFrequency(soundName)
    this.playTone(frequency, 0.1, volume * this.sfxVolume)
  }

  // Play UI click sound
  playClick() {
    this.playSFX('click', 0.3)
  }

  // Play success sound (catching/hiding successful)
  playSuccess() {
    this.playSFX('success', 0.5)
  }

  // Play fail sound (caught)
  playFail() {
    this.playSFX('fail', 0.5)
  }

  // Play alert sound (warning)
  playAlert() {
    this.playSFX('alert', 0.4)
  }

  // Generate procedural sound
  private getSoundFrequency(soundName: string): number {
    const frequencies: { [key: string]: number } = {
      'click': 800,
      'success': 523,  // C5
      'fail': 262,     // C4
      'alert': 1046,   // C6
      'jump': 440,     // A4
      'caught': 196,   // G3
      'hide': 659      // E5
    }
    return frequencies[soundName] || 440
  }

  private playTone(frequency: number, duration: number, volume: number) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Set volumes
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
  }

  getMasterVolume(): number {
    return this.masterVolume
  }

  isMuted(): boolean {
    return this.masterVolume === 0
  }

  toggleMute() {
    this.masterVolume = this.masterVolume === 0 ? 0.7 : 0
  }
}
