// weaponDb.ts
// 이 파일은 모든 무기의 상세 능력치를 관리하는 중앙 데이터베이스입니다.
// 무기 스탯을 수정하거나 새로운 무기를 추가하고 싶다면, 이 파일만 수정하면 됩니다.
// weaponConfig.ts 파일이 여기의 데이터를 가져가서 게임 엔진이 사용하는 형태로 자동 변환합니다.

import { GAME_TEXT } from './textConfig'; // config 폴더 내에서 상대 경로 변경됨
import { WeaponPart } from '../types'; // types.ts가 루트에 있으므로 상대 경로 변경됨
import { ASSETS } from './assetConfig'; // [추가] 에셋 경로를 사용하기 위해 임포트합니다.

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
    display: { name: GAME_TEXT.WEAPONS.M1911.NAME, type: GAME_TEXT.WEAPONS.M1911.TYPE },
    combat: { fireRate: 400, damage: 25, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.2, criticalMultiplier: 1.5, knockback: 25, slow: { factor: 0.6, duration: 0.3 }, penetration: { count: 2, chance: 1.0, damageDrop: 0.2 } },
    bullet: { bulletSpeed: 1000, bulletRadius: 3, bulletColor: '#fbbf24', maxDistance: 350 },
    handling: { minSpread: 0.05, maxSpread: 0.3, recoilControl: 4, recoilResetTime: 250, maxSpreadMoving: 0.6, movementStability: 5, aimDelay: 0.10, gunRecoil: 20, recoilRecovery: 10, maxAmmo: 8, reloadTime: 1200, reloadType: 'magazine', reloadMethod: 'auto', quickReloadMinTimePercent: 0.45, quickReloadMaxTimePercent: 0.8, quickReloadDifficultyPercent: 0.2 },
    visuals: {
      soundFire: 'shoot_pistol', // [추가] 권총 발사음 키
      upgradeImage: ASSETS.WEAPON_M1911, // [추가] 업그레이드 화면용 이미지
      menuIconScale: 1.5, hudIconScale: 2, upgradeImageScale: 0.5,
      ammoUi: { layout: 'single', bulletWidth: 10, bulletHeight: 24, gap: 4 },
      gunRightOffset: 5, muzzleFlashSize: 10, muzzleFlashOffset: 12, muzzleFlashColors: ['#FFFFFF', '#FEF08A', '#F97316'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 },
      render: { slide: { length: 24, width: 6, color: '#cbd5e1', offsetX: 0, offsetY: 0 }, slide_detail: { length: 4, width: 6, color: '#475569', offsetX: 20, offsetY: 0 } },
      screenShake: { intensity: 1, duration: 0.05 },
      uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2.0 },
      shellEjection: { color: '#FBBF24', size: 2.5, velocity: 120, verticalVelocity: 150, gravity: 800, bounciness: 0.6, variance: 0.3, life: 3.0 },
      gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.4)', count: 4, speed: 30, life: 0.8, growth: 15 },
    },
    ui: { upgradePositions: PISTOL_UPGRADE_POS, characterPosition: PISTOL_CHAR_POS }
  },
  MP5: {
    display: { name: GAME_TEXT.WEAPONS.MP5.NAME, type: GAME_TEXT.WEAPONS.MP5.TYPE },
    combat: { fireRate: 100, damage: 5, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.10, criticalMultiplier: 1.5, knockback: 5, slow: { factor: 0.9, duration: 0.1 }, penetration: { count: 1, chance: 1.0, damageDrop: 0.3 } },
    bullet: { bulletSpeed: 1200, bulletRadius: 3, bulletColor: '#fde047', maxDistance: 300 },
    handling: { minSpread: 0.05, maxSpread: 0.4, recoilControl: 10, recoilResetTime: 250, maxSpreadMoving: 0.8, movementStability: 5, aimDelay: 0.2, gunRecoil: 5, recoilRecovery: 40, maxAmmo: 30, reloadTime: 1500, reloadType: 'magazine', reloadMethod: 'auto', quickReloadMinTimePercent: 0.4, quickReloadMaxTimePercent: 0.7, quickReloadDifficultyPercent: 0.10 },
    visuals: {
      soundFire: 'shoot_mp5', // [추가] MP5 발사음 키
      upgradeImage: ASSETS.WEAPON_MP5, // [추가] 업그레이드 화면용 이미지
      menuIconScale: 1.4, hudIconScale: 2, upgradeImageScale: 0.5,
      ammoUi: { layout: 'double', bulletWidth: 8, bulletHeight: 20, gap: 3 },
      gunRightOffset: 6, muzzleFlashSize: 8, muzzleFlashOffset: 18, muzzleFlashColors: ['#FFFFFF', '#fef9c3', '#ca8a04'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 },
      render: { body: { length: 26, width: 8, color: '#374151', offsetX: 0, offsetY: 0 }, barrel: { length: 10, width: 6, color: '#111827', offsetX: 26, offsetY: 0 }, magazine_port: { length: 7, width: 20, color: '#1f2937', offsetX: 15, offsetY: 11 }, stock_mount: { length: 4, width: 4, color: '#1f2937', offsetX: -4, offsetY: 0 } },
      screenShake: { intensity: 0.5, duration: 0.03 },
      uiCasingPhysics: { velocity: { x: 150, y: -450 }, velocityVariance: { x: 80, y: 100 }, gravity: 1200, bounciness: 0.4, rotationSpeed: 25, life: 1.5 },
      shellEjection: { color: '#FBBF24', size: 2.5, velocity: 140, verticalVelocity: 180, gravity: 800, bounciness: 0.5, variance: 0.4, life: 2.5 },
      gunSmoke: { enabled: true, color: 'rgba(150, 150, 150, 0.3)', count: 2, speed: 40, life: 0.5, growth: 10 },
    },
    ui: { upgradePositions: MP5_UPGRADE_POS, characterPosition: MP5_CHAR_POS }
  },
  Rifle: {
    display: { name: GAME_TEXT.WEAPONS.RIFLE.NAME, type: GAME_TEXT.WEAPONS.RIFLE.TYPE },
    combat: { fireRate: 800, damage: 80, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.5, criticalMultiplier: 2.0, knockback: 80, slow: { factor: 0.5, duration: 0.5 }, penetration: { count: 4, chance: 1.0, damageDrop: 0.1 } },
    bullet: { bulletSpeed: 1500, bulletRadius: 6, bulletColor: '#ffedd5', maxDistance: 400 },
    handling: { minSpread: 0.01, maxSpread: 0.6, recoilControl: 2, recoilResetTime: 150, maxSpreadMoving: 1, movementStability: 1, aimDelay: 0.25, gunRecoil: 35, recoilRecovery: 5, maxAmmo: 5, reloadTime: 2500, reloadType: 'magazine', reloadMethod: 'auto', quickReloadMinTimePercent: 0.5, quickReloadMaxTimePercent: 0.7, quickReloadDifficultyPercent: 0.1 },
    visuals: {
      soundFire: 'shoot_rifle', // [추가] 라이플 발사음 키
      upgradeImage: ASSETS.WEAPON_RIFLE, // [추가] 업그레이드 화면용 이미지
      menuIconScale: 1.4, hudIconScale: 2, upgradeImageScale: 0.5,
      ammoUi: { layout: 'single', bulletWidth: 12, bulletHeight: 32, gap: 6 },
      gunRightOffset: 8, muzzleFlashSize: 15, muzzleFlashOffset: 25, muzzleFlashColors: ['#FFFFFF', '#fcd34d', '#f97316'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1.5 },
      render: { body: { length: 30, width: 6, color: '#5d4037', offsetX: -10, offsetY: 0 }, barrel: { length: 15, width: 4, color: '#212121', offsetX: 20, offsetY: 0 } },
      screenShake: { intensity: 3, duration: 0.1 },
      uiCasingPhysics: { velocity: { x: 120, y: -500 }, velocityVariance: { x: 60, y: 120 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 10, life: 2.5 },
      shellEjection: { color: '#FBBF24', size: 3.5, velocity: 100, verticalVelocity: 200, gravity: 800, bounciness: 0.6, variance: 0.2, life: 3.5 },
      gunSmoke: { enabled: true, color: 'rgba(220, 220, 220, 0.5)', count: 6, speed: 35, life: 1.2, growth: 20 },
    },
    ui: { upgradePositions: RIFLE_UPGRADE_POS, characterPosition: RIFLE_CHAR_POS }
  },
  Shotgun: {
    display: { name: GAME_TEXT.WEAPONS.SHOTGUN.NAME, type: GAME_TEXT.WEAPONS.SHOTGUN.TYPE },
    combat: { fireRate: 600, damage: 6, damagePerLevel: 0, pelletCount: 5, criticalChance: 0.05, criticalMultiplier: 1.5, knockback: 20, slow: { factor: 0.7, duration: 0.2 }, penetration: { count: 1, chance: 1.0, damageDrop: 0.5 } },
    bullet: { bulletSpeed: 900, bulletRadius: 2, bulletColor: '#fef3c7', maxDistance: 300 },
    handling: { minSpread: 0.4, maxSpread: 0.8, recoilControl: 2, recoilResetTime: 100, maxSpreadMoving: 1.2, movementStability: 1.5, aimDelay: 0.15, gunRecoil: 25, recoilRecovery: 5, maxAmmo: 6, reloadTime: 500, reloadType: 'shell', reloadMethod: 'manual', quickReloadMinTimePercent: 0.5, quickReloadMaxTimePercent: 0.8, quickReloadDifficultyPercent: 0.30 },
    visuals: {
      soundFire: 'shoot_shotgun', // [추가] 샷건 발사음 키
      upgradeImage: ASSETS.WEAPON_SHOTGUN, // [추가] 업그레이드 화면용 이미지
      menuIconScale: 1.4, hudIconScale: 2, upgradeImageScale: 0.5,
      ammoUi: { layout: 'single', bulletWidth: 14, bulletHeight: 26, gap: 5 },
      gunRightOffset: 8, muzzleFlashSize: 20, muzzleFlashOffset: 20, muzzleFlashColors: ['#FFFFFF', '#fef08a', '#fb923c'],
      laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 },
      render: { body: { length: 40, width: 8, color: '#cc7a29', offsetX: -5, offsetY: 0 }, pump: { length: 15, width: 6, color: '#423532', offsetX: 5, offsetY: 0 }, barrel: { length: 20, width: 5, color: '#303030', offsetX: 20, offsetY: 0 }, },
      screenShake: { intensity: 4, duration: 0.15 },
      uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2.0 },
      shellEjection: { color: '#dc2626', size: 4, velocity: 150, verticalVelocity: 150, gravity: 800, bounciness: 0.4, variance: 0.5, life: 3.0 },
      gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.6)', count: 8, speed: 45, life: 1.5, growth: 25 },
    },
    ui: { upgradePositions: SHOTGUN_UPGRADE_POS, characterPosition: SHOTGUN_CHAR_POS }
  }
};