

export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  rotation: number;
  markedForDeletion: boolean;
}

// 무기 부품 종류
export enum WeaponPart {
  SCOPE = 'SCOPE',     // 조준경 (시야)
  BARREL = 'BARREL',   // 총열 (사거리)
  MAG = 'MAG',         // 탄창 (장탄수)
  MUZZLE = 'MUZZLE',   // 제동기 (반동 제어)
  AMMO = 'AMMO',       // 총알 (관통)
  SPRING = 'SPRING',   // 스프링 (연사력)
  GRIP = 'GRIP',       // 손잡이 (조준 속도)
  STOCK = 'STOCK',     // 개머리판 (안정성)
}

// 아이템 종류
export enum ItemType {
  HEALTH_PACK_SMALL = 'HEALTH_PACK_SMALL',
}

// 업그레이드 상태 (부품별 레벨)
export type UpgradeState = {
  [key in WeaponPart]: number;
};

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  ammo: number;
  maxAmmo: number; 
  reloadAbility: number; 
  isReloading: boolean;
  reloadTimer: number; 
  totalReloadTime: number; 
  score: number;
  
  // RPG 요소
  xp: number;
  maxXp: number;
  level: number;

  // [NEW] 스테미나 시스템
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  staminaRechargeDelayTimer: number;

  // [NEW] 닷지 시스템
  isDodging: boolean;
  dodgeTimer: number;
  dodgeDuration: number;
  dodgeInvulnerabilityTimer: number;
  dodgeDirection: Vector;
  dodgeScale: number; // 닷지 시 캐릭터 크기 애니메이션용
  
  recoilOffset: number; 
  consecutiveShots: number; 
  currentSpread: number; // 현재 탄퍼짐 (라디안 단위). 이 값이 클수록 정확도가 낮아집니다.
  movementSpread: number; // 이동으로 인한 탄퍼짐 패널티
  renderedCrosshairRadius: number; // 화면에 실제로 그려질 조준원 반지름 (애니메이션용)

  currentRotationSpeed: number; 
  baseRotationSpeed: number;    
  maxRotationSpeed: number;     
  rotationAcceleration: number; 

  activeTargetAngle: number; 
  aimQueue: { time: number; angle: number }[]; 

  // 빠른 재장전 시스템 관련 상태
  quickReloadSweetSpot: number; // 재장전 게이지 0.0 ~ 1.0 사이의 빠른 재장전 성공 '지점' (화살표 위치)
  quickReloadHitWindowStart: number; // 초록색 성공 범위 시작 (0.0 ~ 1.0)
  quickReloadHitWindowEnd: number; // 초록색 성공 범위 끝 (0.0 ~ 1.0)
  quickReloadShakeTimer: number; // 빠른 재장전 실패 시 흔들림 효과 타이머
  isQuickReloadAttempted: boolean; // 현재 재장전 주기 동안 빠른 재장전을 시도했는지 여부 (한 번만 적용)
  quickReloadCooldownTimer: number; // 빠른 재장전 성공 후 발사 방지 쿨다운 타이머
}

export interface Zombie extends Entity {
  speed: number;
  health: number;
  maxHealth: number;
  damage: number;
  type: 'walker' | 'runner' | 'tank';
  hitTimer: number; 
  slowTimer: number; 
  slowFactor: number; 
  xp: number; // 처치 시 획득 경험치

  // [NEW] 부드러운 넉백 효과를 위한 상태 변수
  // 넉백 시 적용될 속도 벡터입니다. {x, y} 형태로 저장됩니다.
  knockbackVelocity: Vector; 
  // 넉백 효과가 지속될 남은 시간 (초) 입니다.
  knockbackTimer: number;
}

export interface Bullet extends Entity {
  velocity: Vector;
  damage: number;
  isCritical: boolean; 
  distanceTraveled: number;
  maxDistance: number;
  knockback: number;
  slow: {
    factor: number;
    duration: number;
  };
  hitCount: number; 
  ignoredEntityIds: string[]; 
  penetration: {
    count: number; 
    chance: number; 
    damageDrop: number; 
  };
}

export interface Particle extends Entity {
  velocity: Vector;
  life: number;
  maxLife: number;
  alpha: number;
  growth?: number; 
}

export interface Shell extends Entity {
  z: number;      
  vz: number;     
  velocity: Vector; 
  life: number;
  maxLife: number;
}

export interface FloatingText extends Entity {
  text: string;
  velocity: Vector;
  life: number;
  maxLife: number;
  size: number; 
  isCritical: boolean;
  scale: number; 
}

export interface Item extends Entity {
  itemType: ItemType;
  z: number;
  vz: number;
  velocity: Vector;
  life: number;
  maxLife: number;
  rotationSpeed: number;
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED',
  LEVEL_UP = 'LEVEL_UP' // 레벨업 시 일시 정지 및 UI 표시
}

export interface GameStats {
  score: number;
  wave: number;
  kills: number;
  timeSurvived: number;
  level: number;
  xp: number;
  maxXp: number;
  stamina: number;
  maxStamina: number;
}