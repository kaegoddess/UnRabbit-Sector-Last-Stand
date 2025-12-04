// 좀비(몬스터) 밸런스 및 설정
// 거리 단위: 픽셀(px), 시간 단위: 밀리초(ms)

export const ZOMBIE_STATS = {
  spawnRate: 1000, // 기본 스폰 간격 (ms)
  minSpawnRate: 200, // 최소 스폰 간격 (ms) (웨이브가 진행될수록 이 값까지 빨라짐)
  spawnPadding: 50, // 화면 밖 스폰 거리 (화면 경계에서 얼마나 떨어져서 스폰될지)
  
  // 좀비 종류별 스탯
  // 새로운 좀비를 추가하려면 여기에 객체를 추가하고 types.ts의 Zombie 타입을 업데이트하면 됩니다.
  types: {
    walker: {
      speed: 80, // 초당 이동 거리 (px)
      speedVariance: 10, // 속도 랜덤 변화폭 (100 ± 20)
      baseHealth: 10,
      radius: 14,
      color: '#f97316', // Orange
      damage: 10,
      score: 10,
      xp: 1, // 경험치
      dropChanceMultiplier: 1, // 아이템 드랍 확률 배율 (기본)
    },
    runner: {
      speed: 240, 
      speedVariance: 10,
      baseHealth: 10,
      radius: 12,
      color: '#ef4444', // Red
      damage: 20,
      score: 20,
      xp: 2,
      minWave: 5, // 5웨이브부터 등장
      chance: 0.2, // 스폰 확률 (20%)
      dropChanceMultiplier: 1.2, // 아이템 드랍 확률 1.2배
    },
    tank: {
      speed: 40,
      speedVariance: 10,
      baseHealth: 100,
      radius: 22,
      color: '#7f1d1d', // Dark Red
      damage: 30,
      score: 50,
      xp: 10,
      minWave: 10, // 10웨이브부터 등장
      chance: 0.05, // 스폰 확률 (5%)
      dropChanceMultiplier: 2.0, // 아이템 드랍 확률 2배
    }
  },
  
  healthMultiplierPerWave: 1, // 웨이브당 좀비 추가 체력
};