
// weaponDb.ts
// 이 파일은 모든 무기의 상세 능력치를 관리하는 중앙 데이터베이스입니다.
// 무기 스탯을 수정하거나 새로운 무기를 추가하고 싶다면, 이 파일만 수정하면 됩니다.
// weaponConfig.ts 파일이 여기의 데이터를 가져가서 게임 엔진이 사용하는 형태로 자동 변환합니다.

import { GAME_TEXT } from './textConfig'; // config 폴더 내에서 상대 경로 변경됨
import { WeaponPart } from '../types'; // types.ts가 루트에 있으므로 상대 경로 변경됨

// --- 업그레이드 화면 UI 위치 데이터 ---
// [개발자 모드]
// 게임 내 업그레이드 화면에서 ` (백틱) 키를 눌러 개발자 모드를 활성화할 수 있습니다.
// UI 위치를 조정한 후, "좌표 복사" 버튼을 눌러 아래 객체에 붙여넣으세요.

// [캐릭터 위치]
const PISTOL_CHAR_POS = { x: 45, y: 40 };
const MP5_CHAR_POS = { x: 45, y: 40 };
const RIFLE_CHAR_POS = { x: 45, y: 40 };
const SHOTGUN_CHAR_POS = { x: 45, y: 40 }; // 샷건 초기 위치

// [무기 부품 위치 및 연결선 포인트]
const PISTOL_UPGRADE_POS = {
  [WeaponPart.SCOPE]: { x:  -280, y: -160, anchor: { x:    0, y: -80 } },
  [WeaponPart.SPRING]: { x:  -330, y:   80, anchor: { x: -100, y:   0 } },
  [WeaponPart.AMMO]: { x:   330, y:   80, anchor: { x:  -80, y:  30 } },
  [WeaponPart.MAG]: { x:   280, y:  200, anchor: { x:  -70, y:  80 } },
  [WeaponPart.MUZZLE]: { x:   330, y:  -40, anchor: { x:   20, y: -10 } },
  [WeaponPart.BARREL]: { x:   280, y: -160, anchor: { x:  160, y: -80 } },
  [WeaponPart.GRIP]: { x:  -330, y:  -40, anchor: { x: -120, y: -70 } },
  [WeaponPart.STOCK]: { x:  -280, y:  200, anchor: { x: -120, y:  60 } },
};

const MP5_UPGRADE_POS = {
  [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x: 50, y: -25 } },
  [WeaponPart.GRIP]: { x: -330, y:  -40, anchor: { x: -20, y: 35 } },
  [WeaponPart.SPRING]: { x: -330, y:   80, anchor: { x: -60, y: -20 } },
  [WeaponPart.STOCK]:  { x: -280, y: 200, anchor: { x: -80, y: 20 } },
  [WeaponPart.BARREL]: { x:  280, y: -160, anchor: { x: 140, y: -10 } },
  [WeaponPart.MUZZLE]: { x:  330, y:  -40, anchor: { x: 195, y: -5 } },
  [WeaponPart.AMMO]: { x:   330, y:   80, anchor: { x: 0, y: 30 } },
  [WeaponPart.MAG]: { x:   280, y:  200, anchor: { x: -10, y: 80 } },
};

const RIFLE_UPGRADE_POS = {
    [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x:   0, y: -30 } },
    [WeaponPart.GRIP]:  { x: -330, y:   80, anchor: { x: -50, y:  25 } },
    [WeaponPart.SPRING]:{ x: -330, y:  -40, anchor: { x: -80, y:   0 } },
    [WeaponPart.STOCK]: { x: -280, y:  200, anchor: { x: -200, y:  15 } },
    [WeaponPart.BARREL]:{ x:  280, y: -160, anchor: { x: 220, y: -20 } },
    [WeaponPart.MUZZLE]:{ x:  330, y:  -40, anchor: { x: 280, y: -20 } },
    [WeaponPart.AMMO]:  { x:  330, y:   80, anchor: { x:   0, y:  20 } },
    [WeaponPart.MAG]:   { x:  280, y:  200, anchor: { x:  -10, y:  55 } },
};

const SHOTGUN_UPGRADE_POS = {
    [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x:   0, y: -30 } },
    [WeaponPart.GRIP]:  { x: -330, y:   80, anchor: { x: -50, y:  25 } },
    [WeaponPart.SPRING]:{ x: -330, y:  -40, anchor: { x: -80, y:   0 } },
    [WeaponPart.STOCK]: { x: -280, y:  200, anchor: { x: -150, y:  15 } },
    [WeaponPart.BARREL]:{ x:  280, y: -160, anchor: { x: 180, y: -10 } },
    [WeaponPart.MUZZLE]:{ x:  330, y:  -40, anchor: { x: 240, y: -10 } },
    [WeaponPart.AMMO]:  { x:  330, y:   80, anchor: { x:   0, y:  20 } },
    [WeaponPart.MAG]:   { x:  280, y:  200, anchor: { x:  -10, y:  55 } },
};
// --- --- --- ---

// 모든 무기의 상세 능력치를 카테고리별로 정리한 객체입니다.
export const WEAPON_DATABASE = {
  Pistol: {
    // 1. 표시 정보 (UI에 보이는 이름, 타입 등)
    display: {
      name: GAME_TEXT.WEAPONS.M1911.NAME, // 무기 이름
      type: GAME_TEXT.WEAPONS.M1911.TYPE, // 무기 종류 (예: 반자동 권총)
    },
    // 2. 전투 능력 (데미지, 연사력, 관통 등 직접적인 전투 성능)
    combat: {
      fireRate: 400, // 연사 간격 (ms). 낮을수록 연사 속도가 빠릅니다. (예: 100ms = 초당 10발)
      damage: 25, // 기본 공격력
      damagePerLevel: 0, // 플레이어 레벨 당 추가되는 공격력
      pelletCount: 1, // 산탄 수. 1이면 일반 총알입니다.
      criticalChance: 0.2, // 치명타 확률 (0.0 ~ 1.0)
      criticalMultiplier: 1.5, // 치명타 시 데미지 배율 (1.5 = 150% 데미지)
      knockback: 25, // 적을 밀어내는 힘 (px)
      slow: { factor: 0.6, duration: 0.3 }, // 적중 시 둔화 효과 {감속 배율(0.6 = 40% 속도 감소), 지속 시간(초)}
      penetration: { count: 2, chance: 1.0, damageDrop: 0.2 }, // 관통 {기본 관통 횟수, 추가 관통 확률, 관통 시 데미지 감소율}
    },
    // 3. 탄환 속성 (총알의 속도, 크기, 사거리 등)
    bullet: {
      bulletSpeed: 1000, // 총알 속도 (px/s)
      bulletRadius: 3, // 총알 크기 (px)
      bulletColor: '#fbbf24', // 총알 색상
      maxDistance: 350, // 최대 사거리 (px)
    },
    // 4. 조작감 (반동, 명중률, 재장전 등 플레이어가 느끼는 손맛)
    handling: {
      minSpread: 0.05, // 최소 탄퍼짐 (라디안). 초탄 명중률. 낮을수록 정확합니다.
      maxSpread: 0.3, // 최대 탄퍼짐 (라디안). 연사 시 조준원이 최대로 벌어지는 크기.
      recoilControl: 4, // 반동 제어력. 몇 발을 쏴야 maxSpread에 도달하는지 결정. 낮을수록 반동 제어가 어렵습니다.
      recoilResetTime: 250, // 반동 초기화 시간 (ms). 사격 중지 후 이 시간이 지나야 반동이 회복되기 시작합니다.
      maxSpreadMoving: 0.6, // 이동 시 최대 탄퍼짐 (라디안). 이동 중에 조준원이 이 값까지 추가로 벌어질 수 있습니다.
      movementStability: 5, // 이동 안정성 (초). 이 시간(초)에 걸쳐 이동 시 최대 탄퍼짐까지 도달합니다. 높을수록 안정적입니다.
      aimDelay: 0.10, // 조준 지연 시간 (초). 마우스 이동 후 실제 조준점이 따라붙기까지 걸리는 시간. 낮을수록 반응이 빠릅니다.
      gunRecoil: 20, // 시각적 반동 (px). 사격 시 총몸이 뒤로 밀리는 거리.
      recoilRecovery: 10, // 명중률 회복 속도. 높을수록 실제 명중률이 빠르게 회복됩니다.
      maxAmmo: 8, // 최대 장탄수
      reloadTime: 1200, // 재장전 시간 (ms)
      reloadType: 'magazine', // [NEW] 재장전 타입: 'magazine' (전체) or 'shell' (1발씩)
      reloadMethod: 'auto', // [NEW] 'auto' (탄약 0일 때 자동 재장전) or 'manual' (직접 R 눌러야 함)
      // [NEW] 빠른 재장전 시스템 설정
      quickReloadMinTimePercent: 0.45, // 빠른 재장전 화살표 표시 최소 진행도 (30%)
      quickReloadMaxTimePercent: 0.8, // 빠른 재장전 화살표 표시 최대 진행도 (70%)
      quickReloadDifficultyPercent: 0.2, // 빠른 재장전 성공 범위 크기 (15%)
    },
    // 5. 시각 효과 (총구 화염, 탄피, 레이저 등 눈에 보이는 모든 효과)
    visuals: {
      menuIconScale: 1.5, // [NEW] 메인 메뉴 아이콘 크기 배율. 1.0이 기본.
      hudIconScale: 2, // 인게임 HUD 아이콘 크기 배율. 1 = 100%, 1.5 = 150%.
      upgradeImageScale: 0.5, // 업그레이드 화면 이미지 크기 배율.
      // [NEW] 탄약 UI 설정
      ammoUi: {
        layout: 'single', // 'single' (1열) or 'double' (2열 지그재그)
        bulletWidth: 10, // px
        bulletHeight: 24, // px
        gap: 4, // px
      },
      gunRightOffset: 5, // 총기의 좌우 위치 오프셋 (px). 플레이어 중심에서 오른쪽으로 얼마나 떨어져서 그려지는지 결정합니다.
      muzzleFlashSize: 10, // 총구 화염 크기 (px)
      muzzleFlashOffset: 12, // 총구 화염 위치 오프셋 (px)
      muzzleFlashColors: ['#FFFFFF', '#FEF08A', '#F97316'], // 총구 화염 색상 목록 (랜덤)
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 }, // 레이저 사이트 {활성화 여부, 선 색상, 점 색상, 두께}
      render: {
        slide: { length: 24, width: 6, color: '#cbd5e1', offsetX: 0, offsetY: 0 },
        slide_detail: { length: 4, width: 6, color: '#475569', offsetX: 20, offsetY: 0 }
      },
      screenShake: { intensity: 1, duration: 0.05 }, // 화면 흔들림 {강도, 지속 시간(초)}
      uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2.0 }, // UI 탄피 물리 효과
      shellEjection: { color: '#FBBF24', size: 2.5, velocity: 120, verticalVelocity: 150, gravity: 800, bounciness: 0.6, variance: 0.3, life: 3.0 }, // 인게임 탄피 물리 효과
      gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.4)', count: 4, speed: 30, life: 0.8, growth: 15 }, // 총구 연기 효과
    },
    // 6. UI 위치 (업그레이드 화면 전용)
    ui: {
      upgradePositions: PISTOL_UPGRADE_POS,
      characterPosition: PISTOL_CHAR_POS,
    }
  },
  MP5: {
    display: {
      name: GAME_TEXT.WEAPONS.MP5.NAME,
      type: GAME_TEXT.WEAPONS.MP5.TYPE,
    },
    combat: {
      fireRate: 100,
      damage: 5,
      damagePerLevel: 0,
      pelletCount: 1,
      criticalChance: 0.10,
      criticalMultiplier: 1.5,
      knockback: 5,
      slow: { factor: 0.9, duration: 0.1 },
      penetration: { count: 1, chance: 1.0, damageDrop: 0.3 },
    },
    bullet: {
      bulletSpeed: 1200,
      bulletRadius: 3,
      bulletColor: '#fde047',
      maxDistance: 300,
    },
    handling: {
      minSpread: 0.05,
      maxSpread: 0.4,
      recoilControl: 10,
      recoilResetTime: 250,
      maxSpreadMoving: 0.8,
      movementStability: 5,
      aimDelay: 0.2,
      gunRecoil: 5,
      recoilRecovery: 40,
      maxAmmo: 30,
      reloadTime: 1500,
      reloadType: 'magazine', // 일반 탄창
      reloadMethod: 'auto', // 자동 재장전
      // [NEW] 빠른 재장전 시스템 설정
      quickReloadMinTimePercent: 0.4, // 40%
      quickReloadMaxTimePercent: 0.7, // 80%
      quickReloadDifficultyPercent: 0.10, // 10%
    },
    visuals: {
      menuIconScale: 1.4, // [NEW] 메인 메뉴 아이콘 크기 배율.
      hudIconScale: 2, // 인게임 HUD 아이콘 크기 배율. 1 = 100%, 1.5 = 150%.
      upgradeImageScale: 0.5, // 업그레이드 화면 이미지 크기 배율.
      // [NEW] 탄약 UI 설정 (MP5는 2열 탄창)
      ammoUi: {
        layout: 'double', 
        bulletWidth: 8, // 조금 작게
        bulletHeight: 20, 
        gap: 3, 
      },
      gunRightOffset: 6,
      muzzleFlashSize: 8,
      muzzleFlashOffset: 18,
      muzzleFlashColors: ['#FFFFFF', '#fef9c3', '#ca8a04'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 },
      render: {
        body: { length: 26, width: 8, color: '#374151', offsetX: 0, offsetY: 0 },
        barrel: { length: 10, width: 6, color: '#111827', offsetX: 26, offsetY: 0 },
        magazine_port: { length: 7, width: 20, color: '#1f2937', offsetX: 15, offsetY: 11 },
        stock_mount: { length: 4, width: 4, color: '#1f2937', offsetX: -4, offsetY: 0 }
      },
      screenShake: { intensity: 0.5, duration: 0.03 },
      uiCasingPhysics: { velocity: { x: 150, y: -450 }, velocityVariance: { x: 80, y: 100 }, gravity: 1200, bounciness: 0.4, rotationSpeed: 25, life: 1.5 },
      shellEjection: { color: '#FBBF24', size: 2.5, velocity: 140, verticalVelocity: 180, gravity: 800, bounciness: 0.5, variance: 0.4, life: 2.5 },
      gunSmoke: { enabled: true, color: 'rgba(150, 150, 150, 0.3)', count: 2, speed: 40, life: 0.5, growth: 10 },
    },
    ui: {
      upgradePositions: MP5_UPGRADE_POS,
      characterPosition: MP5_CHAR_POS,
    }
  },
  Rifle: {
    display: {
      name: GAME_TEXT.WEAPONS.RIFLE.NAME,
      type: GAME_TEXT.WEAPONS.RIFLE.TYPE,
    },
    combat: {
      fireRate: 800,
      damage: 80,
      damagePerLevel: 0,
      pelletCount: 1,
      criticalChance: 0.5,
      criticalMultiplier: 2.0,
      knockback: 80,
      slow: { factor: 0.5, duration: 0.5 },
      penetration: { count: 4, chance: 1.0, damageDrop: 0.1 },
    },
    bullet: {
      bulletSpeed: 1500,
      bulletRadius: 6,
      bulletColor: '#ffedd5',
      maxDistance: 400,
    },
    handling: {
      minSpread: 0.01,
      maxSpread: 0.6,
      recoilControl: 2,
      recoilResetTime: 150,
      maxSpreadMoving: 1,
      movementStability: 1,
      aimDelay: 0.25,
      gunRecoil: 35,
      recoilRecovery: 5,
      maxAmmo: 5,
      reloadTime: 2500,
      reloadType: 'magazine',
      reloadMethod: 'auto', // 자동 재장전
      // [NEW] 빠른 재장전 시스템 설정
      quickReloadMinTimePercent: 0.5, // 50%
      quickReloadMaxTimePercent: 0.7, // 60%
      quickReloadDifficultyPercent: 0.1, // 6%
    },
    visuals: {
      menuIconScale: 1.4, // [NEW] 메인 메뉴 아이콘 크기 배율.
      hudIconScale: 2, // 인게임 HUD 아이콘 크기 배율. 1 = 100%, 1.5 = 150%.
      upgradeImageScale: 0.5, // 업그레이드 화면 이미지 크기 배율.
      // [NEW] 탄약 UI 설정 (Rifle은 큰 탄환)
      ammoUi: {
        layout: 'single', 
        bulletWidth: 12, // 크게
        bulletHeight: 32, // 길게
        gap: 6, 
      },
      gunRightOffset: 8,
      muzzleFlashSize: 15,
      muzzleFlashOffset: 25,
      muzzleFlashColors: ['#FFFFFF', '#fcd34d', '#f97316'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1.5 },
      render: {
        body: { length: 30, width: 6, color: '#5d4037', offsetX: -10, offsetY: 0 },
        barrel: { length: 15, width: 4, color: '#212121', offsetX: 20, offsetY: 0 }
      },
      screenShake: { intensity: 3, duration: 0.1 },
      uiCasingPhysics: { velocity: { x: 120, y: -500 }, velocityVariance: { x: 60, y: 120 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 10, life: 2.5 },
      shellEjection: { color: '#FBBF24', size: 3.5, velocity: 100, verticalVelocity: 200, gravity: 800, bounciness: 0.6, variance: 0.2, life: 3.5 },
      gunSmoke: { enabled: true, color: 'rgba(220, 220, 220, 0.5)', count: 6, speed: 35, life: 1.2, growth: 20 },
    },
    ui: {
      upgradePositions: RIFLE_UPGRADE_POS,
      characterPosition: RIFLE_CHAR_POS,
    }
  },
  Shotgun: {
    display: {
      name: GAME_TEXT.WEAPONS.SHOTGUN.NAME,
      type: GAME_TEXT.WEAPONS.SHOTGUN.TYPE,
    },
    combat: {
      fireRate: 600, // 펌프 액션이므로 연사 느림
      damage: 6, // 펠릿 하나당 데미지
      damagePerLevel: 0,
      pelletCount: 5, // 한 번에 5발 발사
      criticalChance: 0.05,
      criticalMultiplier: 1.5,
      knockback: 20, // 넉백
      slow: { factor: 0.7, duration: 0.2 },
      penetration: { count: 1, chance: 1.0, damageDrop: 0.5 }, // 관통력 낮음
    },
    bullet: {
      bulletSpeed: 900, // 탄속 느림
      bulletRadius: 2,
      bulletColor: '#fef3c7',
      maxDistance: 300, // 사거리 매우 짧음
    },
    handling: {
      minSpread: 0.4, // 기본 명중률 낮음
      maxSpread: 0.8, // 최대 탄퍼짐 매우 큼
      recoilControl: 2,
      recoilResetTime: 100,
      maxSpreadMoving: 1.2,
      movementStability: 1.5,
      aimDelay: 0.15,
      gunRecoil: 25, // 시각적 반동 강함
      recoilRecovery: 5,
      maxAmmo: 6,
      reloadTime: 500, // [MODIFIED] 탄피형 장전이므로 '발당' 장전 시간으로 수정. 더 빠르게.
      reloadType: 'shell', // [NEW] 탄피형(한발씩) 장전
      reloadMethod: 'manual', // [NEW] 수동 재장전 (탄약 0일 때 R 눌러야 함)
      // [NEW] 빠른 재장전 시스템 설정
      quickReloadMinTimePercent: 0.5, // 20%
      quickReloadMaxTimePercent: 0.8, // 60%
      quickReloadDifficultyPercent: 0.30, // 20%
    },
    visuals: {
      menuIconScale: 1.4, // [NEW] 메인 메뉴 아이콘 크기 배율.
      hudIconScale: 2, // 인게임 HUD 아이콘 크기 배율. 1 = 100%, 1.5 = 150%.
      upgradeImageScale: 0.5, // 업그레이드 화면 이미지 크기 배율.
      // [NEW] 탄약 UI 설정 (Shotgun은 굵고 짧은 쉘)
      ammoUi: {
        layout: 'single', 
        bulletWidth: 14, 
        bulletHeight: 26, 
        gap: 5, 
      },
      gunRightOffset: 8,
      muzzleFlashSize: 20,
      muzzleFlashOffset: 20,
      muzzleFlashColors: ['#FFFFFF', '#fef08a', '#fb923c'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 }, // 샷건은 레이저 없음 -> 없으면 안되지!
      render: {
        body: { length: 40, width: 8, color: '#cc7a29', offsetX: -5, offsetY: 0 },
        pump: { length: 15, width: 6, color: '#423532', offsetX: 5, offsetY: 0 },
        barrel: { length: 20, width: 5, color: '#303030', offsetX: 20, offsetY: 0 },
      },
      screenShake: { intensity: 4, duration: 0.15 },
      uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2.0 },
      shellEjection: { color: '#dc2626', size: 4, velocity: 150, verticalVelocity: 150, gravity: 800, bounciness: 0.4, variance: 0.5, life: 3.0 }, // 샷건 쉘은 빨간색
      gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.6)', count: 8, speed: 45, life: 1.5, growth: 25 },
    },
    ui: {
      upgradePositions: SHOTGUN_UPGRADE_POS,
      characterPosition: SHOTGUN_CHAR_POS,
    }
  }
};
