// สถานะของรอบเกม
export enum GamePhase {
  Lobby = 'lobby',           // รอเริ่มเกม
  HidingPhase = 'hiding',    // Hider ซ่อน + เพนต์ (30 วินาที)
  SeekingPhase = 'seeking',  // Seeker ตามหา (90 วินาที)
  Result = 'result'          // แสดงผล ชนะ/แพ้
}

export interface GameConfig {
  hidingDuration: number     // 30 วินาที
  seekingDuration: number    // 90 วินาที
  seekerCount: number        // จำนวน AI seekers (Phase 3: 1 ตัว)
  detectionRange: number     // ระยะที่ seeker เล็งเจอ
  camouflageThreshold: number // % similarity กับ background
}

export const DefaultGameConfig: GameConfig = {
  hidingDuration: 30,
  seekingDuration: 90,
  seekerCount: 1,
  detectionRange: 25,
  camouflageThreshold: 0.7  // 70% similarity ถือว่าต้องยืนยันเอง
}
