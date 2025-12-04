import React, { useRef, useEffect, useCallback } from 'react';
import { Player, Zombie, Bullet, Particle, Shell, FloatingText, GameStatus, WeaponPart, UpgradeState, Item, ItemType, GameStats } from '../types';
import { GAME_SETTINGS, SOUND_SETTINGS, FLOATING_TEXT, RENDER_SETTINGS } from '../config/gameConfig';
import { ZOMBIE_STATS } from '../config/zombieConfig';
import { PLAYER_STATS, PLAYER_UI_SETTINGS, PLAYER_EFFECTS } from '../config/playerConfig';
import { WEAPONS } from '../config/weaponConfig';
import { soundService } from '../services/SoundService';
import { GAME_TEXT } from '../config/textConfig';
import { UPGRADE_CONFIG } from '../config/upgradeConfig'; // 업그레이드 중앙 설정 파일 임포트
import { ITEMS_CONFIG } from '../config/itemConfig'; // 아이템 설정 파일 임포트

interface GameCanvasProps {
  gameStatus: GameStatus;
  selectedWeaponId: string; // 'Pistol' | 'MP5' etc
  upgradeLevels: UpgradeState; // 부품별 업그레이드 레벨
  setGameStatus: (status: GameStatus) => void;
  onUpdateStats: (stats: { health: number; ammo: number; maxAmmo: number; score: number; wave: number; xp: number; maxXp: number; level: number; stamina: number; maxStamina: number; }) => void;
  onGameOver: (finalScore: number, kills: number, wave: number) => void;
  onShoot: (firedAmmoIndex: number) => void; // 발사 이벤트 콜백 (UI 탄피 연출용)
  isPaused: boolean; // 게임 일시정지 상태 (개발자 모드 또는 레벨업)
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameStatus, selectedWeaponId, upgradeLevels, setGameStatus, onUpdateStats, onGameOver, onShoot, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | null>(null);
  
  // onShoot prop을 최신 상태로 유지하기 위한 Ref (Stale Closure 방지)
  const onShootRef = useRef(onShoot);
  useEffect(() => {
    onShootRef.current = onShoot;
  }, [onShoot]);
  
  const currentWeapon = WEAPONS[selectedWeaponId as keyof typeof WEAPONS] || WEAPONS.Pistol;
  
  const playerRef = useRef<Player>({
    id: 'player',
    x: 0,
    y: 0,
    radius: PLAYER_STATS.radius,
    color: PLAYER_STATS.color,
    rotation: 0,
    markedForDeletion: false,
    health: PLAYER_STATS.maxHealth,
    maxHealth: PLAYER_STATS.maxHealth,
    speed: PLAYER_STATS.moveSpeed,
    ammo: currentWeapon.maxAmmo,
    maxAmmo: currentWeapon.maxAmmo,
    reloadAbility: PLAYER_STATS.reloadAbility,
    isReloading: false,
    reloadTimer: 0,
    totalReloadTime: 0,
    score: 0,
    xp: 0,
    maxXp: 100, // Level 1 XP
    level: 1,

    // [FIX] Player 타입에 정의된 스테미나 및 닷지 관련 속성들이 누락되어 발생하는 타입 오류를 수정합니다.
    // 각 속성에 대한 초기값을 설정하여 playerRef가 Player 인터페이스를 완전히 만족하도록 합니다.
    stamina: PLAYER_STATS.maxStamina,
    maxStamina: PLAYER_STATS.maxStamina,
    isSprinting: false,
    staminaRechargeDelayTimer: 0,
    staminaWarningTimer: 0, // [NEW] 스테미나 부족 경고 타이머
    isDodging: false,
    dodgeTimer: 0,
    dodgeDuration: PLAYER_STATS.dodgeDuration,
    dodgeInvulnerabilityTimer: 0,
    dodgeDirection: { x: 0, y: 0 },
    dodgeScale: 1, // 닷지 시 캐릭터 크기 애니메이션용

    recoilOffset: 0,
    consecutiveShots: 0,
    currentSpread: 0, // 현재 탄퍼짐 (라디안 단위). 이 값이 클수록 정확도가 낮아집니다.
    movementSpread: 0, // 이동으로 인한 탄퍼짐 패널티
    renderedCrosshairRadius: 7, // 화면에 실제로 그려질 조준원 반지름 (애니메이션용)

    currentRotationSpeed: PLAYER_STATS.baseRotationSpeed, 
    baseRotationSpeed: PLAYER_STATS.baseRotationSpeed,    
    maxRotationSpeed: PLAYER_STATS.maxRotationSpeed,     
    rotationAcceleration: PLAYER_STATS.rotationAcceleration, 

    activeTargetAngle: 0, 
    aimQueue: [{ time: 0, angle: 0 }], // 초기화 시 빈 배열 대신 초기값 포함

    // [NEW] 빠른 재장전 시스템 초기화
    quickReloadSweetSpot: 0,
    quickReloadHitWindowStart: 0,
    quickReloadHitWindowEnd: 0,
    quickReloadShakeTimer: 0,
    isQuickReloadAttempted: false,
    quickReloadCooldownTimer: 0, // 빠른 재장전 성공 후 발사 방지 쿨다운 타이머
  });

  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shellsRef = useRef<Shell[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const itemsRef = useRef<Item[]>([]); // 아이템 배열 Ref
  
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const mouseDownRef = useRef<boolean>(false);
  const lastShotTimeRef = useRef<number>(0);
  const waveRef = useRef<number>(1);
  const killsRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastFootstepTimeRef = useRef<number>(0);
  const lastHitTimeRef = useRef<number>(0);
  const playerDamageAccumulatorRef = useRef<number>(0);
  // [NEW] 전력질주 충돌 사운드 재생 쿨다운을 위한 Ref
  const lastSprintCollideTimeRef = useRef<number>(0);


  // [NEW] 닷지 함수
  const dodge = () => {
    const player = playerRef.current;
    // 닷지 중이거나, 재장전 중이거나, 스테미나가 부족하면 닷지할 수 없습니다.
    if (player.isDodging || player.isReloading || player.stamina < PLAYER_STATS.dodgeStaminaCost) {
      // [NEW] 스테미나가 부족해서 닷지를 못한 것이라면 경고 효과를 발동합니다.
      if (!player.isDodging && !player.isReloading && player.stamina < PLAYER_STATS.dodgeStaminaCost) {
          player.staminaWarningTimer = 0.3; // 0.3초 동안 흔들림
          soundService.play('staminaEmpty');
      }
      return;
    }

    // 닷지 시작
    player.isDodging = true;
    player.stamina -= PLAYER_STATS.dodgeStaminaCost;
    player.staminaRechargeDelayTimer = PLAYER_STATS.staminaRechargeDelay;
    player.dodgeTimer = PLAYER_STATS.dodgeDuration;
    
    // 조준점 방향으로 닷지 방향 설정
    player.dodgeDirection = {
      x: Math.cos(player.rotation),
      y: Math.sin(player.rotation)
    };
    
    soundService.play('dodge');

    // 닷지 시작 시 바람 파티클 생성
    const particleCount = 20;
    const baseAngle = player.rotation + Math.PI; // 플레이어 뒤쪽 방향
    for (let i = 0; i < particleCount; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 1.5;
      const speed = 150 + Math.random() * 100;
      const life = 0.3 + Math.random() * 0.2;
      particlesRef.current.push({
        id: 'dodge-wind-' + Math.random(),
        x: player.x,
        y: player.y,
        radius: Math.random() * 2 + 1,
        color: 'rgba(255, 255, 255, 0.7)',
        rotation: 0,
        markedForDeletion: false,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life: life,
        maxLife: life,
        alpha: 0.7,
        growth: -3,
      });
    }
  };

  const screenShakeRef = useRef({
    intensity: 0,
    duration: 0,
    startX: 0,
    startY: 0
  });

  // --- Helper: 업그레이드 스탯 적용 계산 (리팩토링됨) ---
  const calculateWeaponStats = useCallback((level: number) => {
    const baseWeapon = WEAPONS[selectedWeaponId as keyof typeof WEAPONS] || WEAPONS.Pistol;

    // 최종 능력치를 저장할 객체. 기본 무기 스탯으로 시작합니다.
    // 타입 단언을 사용하여 유연하게 속성을 다룹니다.
    const effectiveStats: { [key: string]: any } = { 
      ...baseWeapon,
      zoom: 1.0 // 기본 줌 값 (100%)
    };

    // 1. 플레이어 레벨에 따른 기본 데미지 보너스를 먼저 계산합니다.
    const levelDamageBonus = (level - 1) * (baseWeapon.damagePerLevel || 0);
    effectiveStats.damage += levelDamageBonus;

    // 2. 모든 업그레이드 부품을 순회하며 효과를 적용합니다.
    for (const partKey in upgradeLevels) {
      const part = partKey as WeaponPart;
      const partLevel = upgradeLevels[part];
      if (partLevel === 0) continue; // 레벨 0은 효과 없음

      // FIX(수정): `AMMO`, `MAG`, `STOCK` 부품은 아래에 별도의 계산 로직이 있으므로,
      // 이 반복문에서 처리할 경우 오류가 발생하거나 계산이 중복될 수 있습니다.
      // 따라서 이 부품들을 건너뛰도록 수정합니다.
      if (part === WeaponPart.AMMO || part === WeaponPart.MAG || part === WeaponPart.STOCK) {
        continue;
      }

      const config = UPGRADE_CONFIG[part];
      const effect = config.statEffect;

      // 설정 파일에 정의된 효과 유형에 따라 계산 방식을 분기합니다.
      // [FIX START] - 타입스크립트 오류 수정
      // 일부 스탯('zoom' 등)은 기본 무기 객체에 없거나, 다른 스탯('penetration' 등)이 객체일 수 있습니다.
      // 이로 인해 숫자형이 아닌 값에 산술 연산을 시도하여 오류가 발생할 수 있습니다.
      // 모든 연산 전에 값이 숫자인지 확인하여 이 문제를 해결합니다.
      switch (effect.type) {
        case 'ADD':
        case 'ADD_BONUS': {
          const statName = effect.stat;
          // stat으로 지정된 값이 숫자 타입일 경우에만 연산을 수행하여 타입 에러를 방지합니다.
          if (typeof effectiveStats[statName] === 'number') {
            effectiveStats[statName] += effect.value * partLevel;
          }
          break;
        }

        case 'SUBTRACT_PERCENT_BASE': {
          // 기본값(baseWeapon)을 기준으로 백분율 감소를 계산합니다.
          const statName = effect.stat;
          // 기본 무기 스탯에 값이 없으면(e.g. 'zoom'), 현재 계산중인 스탯 객체에서 가져옵니다.
          const baseValue = (baseWeapon as any)[statName] ?? effectiveStats[statName];
          // 최종적으로 가져온 기본값이 숫자일 경우에만 연산을 수행합니다.
          if (typeof baseValue === 'number') {
            effectiveStats[statName] = baseValue * (1 - (effect.value * partLevel));
          }
          break;
        }
        
        case 'ADD_PERCENT_BASE': {
          // 기본값(baseWeapon)을 기준으로 백분율 증가를 계산합니다.
          const statName = effect.stat;
          // 기본 무기 스탯에 값이 없으면(e.g. 'zoom'), 현재 계산중인 스탯 객체에서 가져옵니다.
          const baseValue = (baseWeapon as any)[statName] ?? effectiveStats[statName];
          // 최종적으로 가져온 기본값이 숫자일 경우에만 연산을 수행합니다.
          if (typeof baseValue === 'number') {
            effectiveStats[statName] = baseValue * (1 + (effect.value * partLevel));
          }
          break;
        }
      }
      // [FIX END]
    }

    // 3. 특수 로직이 필요한 업그레이드를 별도로 처리합니다. (탄창, 관통, 개머리판)
    // 탄창 (Magazine)
    const magLevel = upgradeLevels[WeaponPart.MAG] || 0;
    if (magLevel > 0) {
      const magConfig = UPGRADE_CONFIG[WeaponPart.MAG];
      const bonusPerLevel = baseWeapon.maxAmmo * magConfig.statEffect.value;
      const bonusAmmo = bonusPerLevel < 1 ? magLevel : Math.floor(bonusPerLevel * magLevel);
      effectiveStats.maxAmmo = baseWeapon.maxAmmo + bonusAmmo;
    }
    
    // 탄약 (Ammo) - 관통 시스템 재설계
    const ammoLevel = upgradeLevels[WeaponPart.AMMO] || 0;
    // '철갑탄' 업그레이드로 얻은 총 보너스 확률을 계산합니다. (예: 5레벨 * 20% = 100% -> 1.0)
    const totalBonusChance = UPGRADE_CONFIG[WeaponPart.AMMO].statEffect.value * ammoLevel;

    // 보너스 확률의 정수 부분은 '확정 추가 관통 횟수'가 됩니다. (예: 1.2 -> 1회)
    const addedGuaranteedHits = Math.floor(totalBonusChance);

    // 보너스 확률의 소수 부분은 '확률적 추가 관통' 기회가 됩니다. (예: 1.2 -> 0.2, 즉 20%)
    const probabilisticChance = totalBonusChance - addedGuaranteedHits;

    effectiveStats.penetration = {
      ...baseWeapon.penetration,
      // 기본 관통 횟수에 확정 추가 관통 횟수를 더합니다.
      count: baseWeapon.penetration.count + addedGuaranteedHits,
      // 확률적 관통 기회는 보너스의 소수 부분으로 설정됩니다.
      chance: probabilisticChance,
    };
    
    // 개머리판 (Stock) - 공격력 +5% (최소 +1 보장)
    const stockLevel = upgradeLevels[WeaponPart.STOCK] || 0;
    if (stockLevel > 0) {
      const stockConfig = UPGRADE_CONFIG[WeaponPart.STOCK];
      // 기본 데미지를 기준으로 레벨당 보너스를 계산합니다.
      const bonusPerLevel = baseWeapon.damage * stockConfig.statEffect.value;
      // 보너스 수치가 1보다 작을 경우, 최소 1을 보장합니다.
      const guaranteedBonusPerLevel = Math.max(1, bonusPerLevel);
      // 최종 보너스 데미지를 계산하여 더합니다.
      const totalBonusDamage = Math.floor(guaranteedBonusPerLevel * stockLevel);
      effectiveStats.damage += totalBonusDamage;
    }


    return effectiveStats;

  }, [selectedWeaponId, upgradeLevels]);

  const generateGroundTexture = () => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#475569'; 
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, 2, 2);
    }

    for (let i = 0; i < 40; i++) {
        const cx = Math.random() * size;
        const cy = Math.random() * size;
        const r = 20 + Math.random() * 60;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(22, 101, 52, 0.4)');
        grad.addColorStop(0.7, 'rgba(21, 128, 61, 0.2)');
        grad.addColorStop(1, 'rgba(21, 128, 61, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        let x = Math.random() * size;
        let y = Math.random() * size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 100;
            y += (Math.random() - 0.5) * 100;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);

    backgroundCanvasRef.current = canvas;
  };

  const initGame = useCallback(() => {
    // [제거] soundService.init(); // App.tsx에서 중앙에서 관리하도록 변경

    if (!backgroundCanvasRef.current) {
        generateGroundTexture();
    }

    // 업그레이드 반영된 스탯 계산 (게임 시작 시 레벨 1)
    const stats = calculateWeaponStats(1);

    playerRef.current = {
      id: 'player',
      x: 0,
      y: 0,
      radius: PLAYER_STATS.radius,
      color: PLAYER_STATS.color,
      rotation: 0,
      markedForDeletion: false,
      health: PLAYER_STATS.maxHealth,
      maxHealth: PLAYER_STATS.maxHealth,
      speed: PLAYER_STATS.moveSpeed,
      ammo: stats.maxAmmo, // 업그레이드 반영
      maxAmmo: stats.maxAmmo,
      reloadAbility: PLAYER_STATS.reloadAbility,
      isReloading: false,
      reloadTimer: 0,
      totalReloadTime: 0,
      score: 0,
      xp: 0,
      maxXp: 100,
      level: 1,

      // [FIX] Player 타입에 정의된 스테미나 및 닷지 관련 속성들이 누락되어 발생하는 타입 오류를 수정합니다.
      // 게임 시작 시 모든 플레이어 상태를 초기화하기 위해 관련 속성들의 초기값을 설정합니다.
      stamina: PLAYER_STATS.maxStamina,
      maxStamina: PLAYER_STATS.maxStamina,
      isSprinting: false,
      staminaRechargeDelayTimer: 0,
      staminaWarningTimer: 0, // [NEW] 스테미나 부족 경고 타이머 초기화
      isDodging: false,
      dodgeTimer: 0,
      dodgeDuration: PLAYER_STATS.dodgeDuration,
      dodgeInvulnerabilityTimer: 0,
      dodgeDirection: { x: 0, y: 0 },
      dodgeScale: 1,

      recoilOffset: 0,
      consecutiveShots: 0,
      currentSpread: 0, // 반동 초기화
      movementSpread: 0, // 이동 반동 초기화
      renderedCrosshairRadius: 7, // 조준원 렌더링 반지름 초기화
      currentRotationSpeed: PLAYER_STATS.baseRotationSpeed,
      baseRotationSpeed: PLAYER_STATS.baseRotationSpeed,
      maxRotationSpeed: PLAYER_STATS.maxRotationSpeed,
      rotationAcceleration: PLAYER_STATS.rotationAcceleration,
      activeTargetAngle: 0,
      aimQueue: [], // 초기화 시 빈 배열로 시작

      // [NEW] 빠른 재장전 시스템 초기화
      quickReloadSweetSpot: 0,
      quickReloadHitWindowStart: 0,
      quickReloadHitWindowEnd: 0,
      quickReloadShakeTimer: 0,
      isQuickReloadAttempted: false,
      quickReloadCooldownTimer: 0, // 빠른 재장전 성공 후 발사 방지 쿨다운 타이머 초기화
    };
    zombiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    shellsRef.current = [];
    floatingTextsRef.current = [];
    itemsRef.current = []; // 아이템 배열 초기화
    waveRef.current = 1;
    killsRef.current = 0;
    previousTimeRef.current = null;
    lastSpawnTimeRef.current = 0;
    playerDamageAccumulatorRef.current = 0;
    lastSprintCollideTimeRef.current = 0; // [NEW] 충돌 사운드 타이머 초기화
    screenShakeRef.current = { intensity: 0, duration: 0, startX: 0, startY: 0 };
  }, [calculateWeaponStats]); 

  // 무기 변경 시 리셋
  useEffect(() => {
    if (gameStatus === GameStatus.MENU) {
      initGame();
    }
  }, [gameStatus, initGame]);

  // 업그레이드가 변경되면 즉시 플레이어 스탯 업데이트 (게임 중에도)
  useEffect(() => {
      if (playerRef.current) {
          const stats = calculateWeaponStats(playerRef.current.level);
          const oldMaxAmmo = playerRef.current.maxAmmo;
          playerRef.current.maxAmmo = stats.maxAmmo;
          // 탄창 업그레이드 시, 늘어난 만큼 현재 탄약도 채워줌
          if (stats.maxAmmo > oldMaxAmmo) {
              playerRef.current.ammo += (stats.maxAmmo - oldMaxAmmo);
          }
      }
  }, [upgradeLevels, calculateWeaponStats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = true; 
      
      // 치트키: G (Instant Level Up)
      if (e.code === 'KeyG' && (gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.LEVEL_UP)) {
          if (playerRef.current) {
              // FIX: 'player' 변수가 선언되기 전에 사용되는 오류 수정
              // `playerRef.current`를 먼저 `player` 상수에 할당하여 참조 오류를 방지합니다.
              const player = playerRef.current; 

              player.xp = player.maxXp;
              createFloatingText(player.x, player.y - 50, "CHEAT: LEVEL UP", false, '#22c55e');
              
              // 즉시 레벨업 처리 로직 추가
              if (player.xp >= player.maxXp) {
                  player.level++;
                  player.xp -= player.maxXp;
                  player.maxXp = Math.floor(player.maxXp * 1.2);
                  setGameStatus(GameStatus.LEVEL_UP);
              }
          }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = false; 
      if (e.code === 'KeyR') reload();
      // [NEW] 닷지 입력
      if (e.code === 'Space') dodge();
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // 줌 레벨을 고려한 마우스 좌표 보정은 복잡하므로,
        // UI상에서는 줌을 적용하지만 마우스 입력은 화면 좌표 그대로 받고 로직에서 처리
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    };
    const handleMouseDown = () => {
       // [제거] soundService.init(); // App.tsx에서 중앙에서 관리하도록 변경
       mouseDownRef.current = true;
    };
    const handleMouseUp = () => {
       mouseDownRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gameStatus, setGameStatus]); 

  const reload = () => {
    const player = playerRef.current;
    if (player.isReloading || player.ammo === player.maxAmmo || player.isDodging) return;
    
    player.isReloading = true;
    soundService.play('reload');
    
    const actualReloadTimeMs = currentWeapon.reloadTime / player.reloadAbility;
    player.totalReloadTime = actualReloadTimeMs / 1000; // 초 단위
    player.reloadTimer = 0;
    player.isQuickReloadAttempted = false; // 새로운 재장전 시작 시 초기화
    player.quickReloadShakeTimer = 0; // 흔들림 타이머 초기화
    player.quickReloadCooldownTimer = 0; // 빠른 재장전 쿨다운 타이머 초기화

    // [NEW] 빠른 재장전 타이밍 및 성공 범위 계산
    const minTime = currentWeapon.quickReloadMinTimePercent;
    const maxTime = currentWeapon.quickReloadMaxTimePercent;
    const difficulty = currentWeapon.quickReloadDifficultyPercent;

    // 랜덤하게 스윗스팟 결정 (최소 ~ 최대 범위 내)
    player.quickReloadSweetSpot = minTime + Math.random() * (maxTime - minTime);
    
    // 성공 범위 계산 (스윗스팟 중앙으로)
    player.quickReloadHitWindowStart = Math.max(0, player.quickReloadSweetSpot - difficulty / 2);
    player.quickReloadHitWindowEnd = Math.min(1, player.quickReloadSweetSpot + difficulty / 2);

    // [FIX] 재장전 시 반동을 즉시 초기화하는 대신,
    // update()의 자연스러운 회복 로직에 맡겨 조준원이 부드럽게 줄어들도록 합니다.
    // playerRef.current.consecutiveShots = 0;
  };

  const createFloatingText = (x: number, y: number, text: string, isCritical: boolean, customColor?: string) => {
    const angle = (Math.random() - 0.5) * 1.5 - Math.PI / 2;
    const speed = FLOATING_TEXT.speed + Math.random() * 50;

    floatingTextsRef.current.push({
      id: 'text-' + Math.random(),
      x,
      y,
      radius: 0,
      color: customColor || (isCritical ? '#ef4444' : '#facc15'),
      rotation: 0,
      markedForDeletion: false,
      text: text,
      velocity: {
        x: Math.cos(angle) * FLOATING_TEXT.randomX,
        y: -Math.abs(Math.sin(angle) * speed)
      },
      life: FLOATING_TEXT.life,
      maxLife: FLOATING_TEXT.life,
      size: isCritical ? 24 : 14,
      isCritical,
      scale: FLOATING_TEXT.startScale
    });
  };

  const shoot = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    
    const player = playerRef.current;
    if (player.isDodging) return; // [NEW] 닷지 중에는 발사 불가
    
    const effectiveStats = calculateWeaponStats(player.level);
    const now = Date.now();

    // [NEW] 빠른 재장전 성공 후 쿨다운 중에는 발사되지 않도록 합니다.
    if (player.quickReloadCooldownTimer > 0) return;

    // [NEW] 빠른 재장전 입력 감지 로직
    if (player.isReloading) {
        // 최소 진행도 이전에는 빠른 재장전 시도를 체크하지 않음
        const reloadProgress = player.reloadTimer / player.totalReloadTime;
        if (reloadProgress < GAME_SETTINGS.quickReloadInputMinProgress) return; 

        // 한 번의 재장전 주기 동안 빠른 재장전 시도는 한 번만
        if (player.isQuickReloadAttempted) return; 
        
        player.isQuickReloadAttempted = true; // 시도 플래그 설정

        // 현재 재장전 진행도가 성공 범위 내에 있는지 확인
        if (reloadProgress >= player.quickReloadHitWindowStart && reloadProgress <= player.quickReloadHitWindowEnd) {
            // 빠른 재장전 성공!
            player.ammo = player.maxAmmo; // 즉시 탄약 채움
            player.isReloading = false; // 재장전 상태 종료
            soundService.play('quickReloadSuccess');
            createFloatingText(player.x, player.y - 60, GAME_TEXT.HUD.QUICK_RELOAD_SUCCESS, false, '#22c55e'); // 초록색 텍스트
            player.quickReloadShakeTimer = 0; // 혹시 모를 흔들림 초기화
            player.quickReloadCooldownTimer = GAME_SETTINGS.quickReloadPostSuccessCooldown; // 성공 시 쿨다운 시작
        } else {
            // 빠른 재장전 실패!
            soundService.play('quickReloadFail');
            player.quickReloadShakeTimer = GAME_SETTINGS.quickReloadShakeDuration; // 흔들림 타이머 시작
            createFloatingText(player.x, player.y - 60, GAME_TEXT.HUD.QUICK_RELOAD_FAIL, false, '#ef4444'); // 빨간색 텍스트
            // 실패해도 일반 재장전은 계속 진행됩니다.
        }
        return; // 빠른 재장전 시도는 발사 시도를 대체하므로 여기서 리턴
    }
    
    if (player.ammo <= 0) {
      reload();
      return;
    }

    if (now - lastShotTimeRef.current < effectiveStats.fireRate) return;

    soundService.play('shoot');

    if (currentWeapon.screenShake) {
      screenShakeRef.current = {
        intensity: currentWeapon.screenShake.intensity,
        duration: currentWeapon.screenShake.duration,
        startX: 0,
        startY: 0
      };
    }

    // 발사된 총알 번호 (현재 탄약 수) - 예를 들어 8발 남았을 때 쏘면 8번 총알이 발사됨
    const firedAmmoIndex = player.ammo;
    player.ammo--;
    
    // 즉시 App 컴포넌트에 이벤트 전달 (탄피 연출용)
    // Ref를 사용하여 항상 최신 핸들러를 호출 (Stale Closure 방지)
    if (onShootRef.current) {
        onShootRef.current(firedAmmoIndex);
    }

    // [시각적 반동 시스템 개선]
    // 1. 기존의 값을 덮어쓰는 대신, 현재 반동에 `gunRecoil` 값을 더하여 누적시킵니다.
    // 2. `Math.min`을 사용하여 누적된 반동이 `gameConfig.ts`에 설정된 최대치(`maxVisualRecoil`)를
    //    넘지 않도록 제한합니다. 이로써 라이플 등이 화면 밖으로 밀려나는 버그가 해결됩니다.
    player.recoilOffset = Math.min(
      player.recoilOffset + currentWeapon.gunRecoil,
      RENDER_SETTINGS.maxVisualRecoil
    );
    
    lastShotTimeRef.current = now;

    const angle = player.rotation;
    const gunLength = effectiveStats.gunLength;
    const gunOffset = currentWeapon.gunRightOffset;
    
    const muzzleX = player.x + (gunLength * Math.cos(angle) - gunOffset * Math.sin(angle));
    const muzzleY = player.y + (gunLength * Math.sin(angle) + gunOffset * Math.cos(angle));

    // [BUG FIX] 연속 사격 횟수가 무기의 '반동 제어력' 수치를 초과하여 무한정 누적되는 버그를 수정합니다.
    // 이제 연속 사격 횟수는 현재 무기의 반동 제어력(recoilControl) 값을 상한선으로 가집니다.
    // 이로 인해, 아무리 연사를 하더라도 재장전 시 항상 정상적으로 반동이 회복됩니다.
    player.consecutiveShots = Math.min(
      player.consecutiveShots + 1,
      effectiveStats.recoilControl
    );
    
    const pelletCount = effectiveStats.pelletCount || 1;

    for (let i = 0; i < pelletCount; i++) {
        // [산탄 시스템] 각 펠릿(총알)마다 개별적으로 탄퍼짐을 계산합니다.
        const spread = (Math.random() - 0.5) * player.currentSpread;
        const isCritical = Math.random() < currentWeapon.criticalChance;

        bulletsRef.current.push({
            id: Math.random().toString(),
            x: muzzleX,
            y: muzzleY,
            radius: currentWeapon.bulletRadius,
            color: currentWeapon.bulletColor,
            rotation: angle,
            markedForDeletion: false,
            velocity: {
                x: Math.cos(angle + spread) * currentWeapon.bulletSpeed,
                y: Math.sin(angle + spread) * currentWeapon.bulletSpeed
            },
            damage: effectiveStats.damage,
            isCritical: isCritical,
            distanceTraveled: 0,
            maxDistance: effectiveStats.maxDistance,
            knockback: currentWeapon.knockback,
            slow: currentWeapon.slow,
            hitCount: 0,
            ignoredEntityIds: [],
            penetration: effectiveStats.penetration
        });
    }


    const flashOffset = currentWeapon.muzzleFlashOffset;
    const flashCenterX = muzzleX + (Math.cos(angle) * flashOffset);
    const flashCenterY = muzzleY + (Math.sin(angle) * flashOffset);
    const flashColors = currentWeapon.muzzleFlashColors;
    
    for (let i = 0; i < 5; i++) {
        const flashAngle = angle + (Math.random() - 0.5) * 0.8; 
        const flashSpeed = Math.random() * 100 + 50; 
        const flashLife = 0.08 + Math.random() * 0.05;

        particlesRef.current.push({
            id: 'flash-' + Math.random(),
            x: flashCenterX,
            y: flashCenterY,
            radius: Math.random() * 4 + currentWeapon.muzzleFlashSize, 
            color: flashColors[Math.floor(Math.random() * flashColors.length)],
            rotation: 0,
            markedForDeletion: false,
            velocity: {
                x: Math.cos(flashAngle) * flashSpeed,
                y: Math.sin(flashAngle) * flashSpeed
            },
            life: flashLife,
            maxLife: flashLife,
            alpha: 1,
            growth: 0
        });
    }

    if (currentWeapon.gunSmoke.enabled) {
      for (let i = 0; i < currentWeapon.gunSmoke.count; i++) {
        const smokeAngle = angle + (Math.random() - 0.5) * 1.0; 
        const smokeSpeed = Math.random() * currentWeapon.gunSmoke.speed;
        
        particlesRef.current.push({
          id: 'smoke-' + Math.random(),
          x: muzzleX,
          y: muzzleY,
          radius: Math.random() * 3 + 2,
          color: currentWeapon.gunSmoke.color,
          rotation: Math.random() * Math.PI * 2,
          markedForDeletion: false,
          velocity: {
            x: Math.cos(smokeAngle) * smokeSpeed,
            y: Math.sin(smokeAngle) * smokeSpeed
          },
          life: currentWeapon.gunSmoke.life,
          maxLife: currentWeapon.gunSmoke.life,
          alpha: 0.5, 
          growth: currentWeapon.gunSmoke.growth 
        });
      }
    }

    const shellConfig = currentWeapon.shellEjection;
    const breechOffset = gunLength - 10;
    const breechX = player.x + (breechOffset * Math.cos(angle) - gunOffset * Math.sin(angle));
    const breechY = player.y + (breechOffset * Math.sin(angle) + gunOffset * Math.cos(angle));

    const ejectAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * shellConfig.variance;
    const ejectSpeed = shellConfig.velocity + (Math.random() - 0.5) * 20;

    shellsRef.current.push({
      id: 'shell-' + Math.random(),
      x: breechX,
      y: breechY,
      z: 10, 
      radius: shellConfig.size, 
      color: shellConfig.color,
      rotation: angle, 
      markedForDeletion: false,
      velocity: {
        x: Math.cos(ejectAngle) * ejectSpeed,
        y: Math.sin(ejectAngle) * ejectSpeed
      },
      vz: shellConfig.verticalVelocity + Math.random() * 50,
      life: shellConfig.life,
      maxLife: shellConfig.life
    });
  };

  const spawnZombie = (width: number, height: number) => {
    const spawnRadius = Math.sqrt(width * width + height * height) / 2 + ZOMBIE_STATS.spawnPadding;
    const angle = Math.random() * Math.PI * 2;
    
    const x = playerRef.current.x + Math.cos(angle) * spawnRadius;
    const y = playerRef.current.y + Math.sin(angle) * spawnRadius;

    const rand = Math.random();
    let type: Zombie['type'] = 'walker';
    let stats = ZOMBIE_STATS.types.walker;

    if (waveRef.current >= ZOMBIE_STATS.types.tank.minWave && rand > (1 - ZOMBIE_STATS.types.tank.chance)) {
      type = 'tank';
      stats = ZOMBIE_STATS.types.tank;
    } 
    else if (waveRef.current >= ZOMBIE_STATS.types.runner.minWave && rand > (1 - ZOMBIE_STATS.types.runner.chance)) {
      type = 'runner';
      stats = ZOMBIE_STATS.types.runner;
    }

    const health = stats.baseHealth + (waveRef.current * ZOMBIE_STATS.healthMultiplierPerWave);
    const speed = stats.speed + (Math.random() * stats.speedVariance);

    zombiesRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      radius: stats.radius,
      color: stats.color,
      rotation: 0,
      markedForDeletion: false,
      speed,
      health,
      maxHealth: health,
      damage: stats.damage,
      type,
      hitTimer: 0,
      slowTimer: 0,
      slowFactor: 1.0,
      xp: stats.xp || 10, // 경험치
      // [NEW] 넉백 상태 초기화
      knockbackVelocity: { x: 0, y: 0 },
      knockbackTimer: 0,
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number, config?: {speed?: number, life?: number, growth?: number}) => {
    const finalConfig = { ...PLAYER_EFFECTS.default, ...config };
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (finalConfig.speed) * (0.5 + Math.random());
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        radius: Math.random() * 2 + 1,
        color,
        rotation: 0,
        markedForDeletion: false,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: finalConfig.life,
        maxLife: finalConfig.life,
        alpha: 1,
        growth: finalConfig.growth,
      });
    }
  };


  // 회복 아이템 획득 시 시각 효과
  const createHealingParticles = (x: number, y: number) => {
    const count = 15;
    // 플레이어 주변에 원형으로 파티클 생성
    const radius = playerRef.current.radius + 15;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spawnX = x + Math.cos(angle) * radius;
        const spawnY = y + Math.sin(angle) * radius;

        // 접선 방향으로 속도를 주어 회전하는 것처럼 보이게 함
        const tangentialAngle = angle + Math.PI / 2;
        const speed = 40 + Math.random() * 20;

        particlesRef.current.push({
            id: 'heal-' + Math.random(),
            x: spawnX, 
            y: spawnY,
            radius: Math.random() * 2 + 1.5,
            color: '#22c55e', // Tailwind green-500
            rotation: 0,
            markedForDeletion: false,
            velocity: {
                x: Math.cos(tangentialAngle) * speed,
                y: Math.sin(tangentialAngle) * speed
            },
            life: 0.6 + Math.random() * 0.3, // 짧은 수명
            maxLife: 1.0,
            alpha: 1,
            growth: -2 // 작아지면서 사라짐
        });
    }
  };

  const createSprayParticles = (x: number, y: number, color: string, count: number, baseAngle: number, spread: number) => {
      for (let i = 0; i < count; i++) {
          const angle = baseAngle + (Math.random() - 0.5) * spread;
          const speed = GAME_SETTINGS.particleSpeed * (1.5 + Math.random() * 2.0); 
          const life = 0.5 + Math.random() * 0.5;

          particlesRef.current.push({
              id: 'spray-' + Math.random(),
              x,
              y,
              radius: Math.random() * 3 + 1, 
              color,
              rotation: angle,
              markedForDeletion: false,
              velocity: {
                  x: Math.cos(angle) * speed,
                  y: Math.sin(angle) * speed
              },
              life: life,
              maxLife: life,
              alpha: 1,
              growth: -2
          });
      }
    }

  const getLineCircleIntersection = (p1: {x:number, y:number}, p2: {x:number, y:number}, circle: { x: number, y: number, radius: number }): number | null => {
    const d = { x: p2.x - p1.x, y: p2.y - p1.y };
    const f = { x: p1.x - circle.x, y: p1.y - circle.y };
    const a = d.x * d.x + d.y * d.y;
    const b = 2 * (f.x * d.x + f.y * d.y);
    const c = f.x * f.x + f.y * f.y - circle.radius * circle.radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null; 
    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t >= 0 && t <= 1) return t;
    return null;
  };

  const update = (deltaTime: number) => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const player = playerRef.current;
    const now = Date.now();
    const effectiveStats = calculateWeaponStats(player.level);

    let dx = 0;
    let dy = 0;
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) dy -= 1;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) dy += 1;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) dx -= 1;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) dx += 1;

    let isMoving = dx !== 0 || dy !== 0;

    // --- [NEW] 닷지 로직 ---
    if (player.isDodging) {
      player.dodgeTimer -= deltaTime;
      
      const dodgeProgress = 1 - (player.dodgeTimer / PLAYER_STATS.dodgeDuration);
      player.dodgeScale = 1 + 0.3 * Math.sin(dodgeProgress * Math.PI);

      const currentDodgeSpeed = player.speed * PLAYER_STATS.dodgeSpeedMultiplier;
      player.x += player.dodgeDirection.x * currentDodgeSpeed * deltaTime;
      player.y += player.dodgeDirection.y * currentDodgeSpeed * deltaTime;
      
      if (player.dodgeTimer <= 0) {
        player.isDodging = false;
        player.dodgeScale = 1;
        soundService.play('dodgeLand');
        
        // 착지 이펙트
        const effect = PLAYER_EFFECTS.dodgeLand;
        createParticles(player.x, player.y, effect.color, effect.count, { speed: effect.speed, life: effect.life, growth: effect.growth });

        // 주변 넉백 및 데미지
        zombiesRef.current.forEach(z => {
          const dist = Math.hypot(player.x - z.x, player.y - z.y);
          if (dist < PLAYER_STATS.dodgeLandKnockbackRadius) {
            z.health -= PLAYER_STATS.dodgeLandDamage;
            createFloatingText(z.x, z.y, Math.floor(PLAYER_STATS.dodgeLandDamage).toString(), false, '#f59e0b');
            
            // [MODIFIED] 부드러운 넉백 로직으로 변경
            // 즉시 위치를 바꾸는 대신, 넉백 속도와 타이머를 설정합니다.
            const angle = Math.atan2(z.y - player.y, z.x - player.x);
            const knockbackDuration = PLAYER_STATS.dodgeLandKnockbackDuration;
            if (knockbackDuration > 0) {
              const knockbackSpeed = PLAYER_STATS.dodgeLandKnockback / knockbackDuration;
              z.knockbackVelocity = {
                x: Math.cos(angle) * knockbackSpeed,
                y: Math.sin(angle) * knockbackSpeed,
              };
              z.knockbackTimer = knockbackDuration;
            }
          }
        });
      }
    }

    // --- [NEW] 스테미나 경고 타이머 업데이트 ---
    if (player.staminaWarningTimer > 0) {
      player.staminaWarningTimer -= deltaTime;
    }

    // --- [NEW] 전력질주 로직 ---
    const isSprintingInput = (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight']) && isMoving && !player.isReloading && !player.isDodging;
    
    // [NEW] 스테미나가 부족한 상태에서 전력질주를 시도했는지 확인합니다.
    if (isSprintingInput && player.stamina <= 0) {
        // 이미 경고 타이머가 돌고있지 않을 때만 효과를 발동시켜 소리가 반복 재생되는 것을 막습니다.
        if (player.staminaWarningTimer <= 0) {
            player.staminaWarningTimer = 0.3;
            soundService.play('staminaEmpty');
        }
    }

    player.isSprinting = isSprintingInput && player.stamina > 0;

    if (player.isSprinting) {
      player.stamina = Math.max(0, player.stamina - PLAYER_STATS.sprintStaminaCost * deltaTime);
      player.staminaRechargeDelayTimer = PLAYER_STATS.staminaRechargeDelay;
      
      // 먼지 이펙트
      const effect = PLAYER_EFFECTS.sprintDust;
      if (Math.random() < effect.chance) {
        createParticles(player.x, player.y, effect.color, effect.count, { speed: effect.speed, life: effect.life, growth: effect.growth });
      }

    } else if (player.stamina < player.maxStamina) {
      if (player.staminaRechargeDelayTimer > 0) {
        player.staminaRechargeDelayTimer -= deltaTime;
      } else {
        player.stamina = Math.min(player.maxStamina, player.stamina + PLAYER_STATS.staminaRechargeRate * deltaTime);
      }
    }

    // --- 일반 이동 로직 ---
    let currentSpeed = player.speed;
    if (player.isSprinting) {
      currentSpeed *= PLAYER_STATS.sprintSpeedMultiplier;
    }
    
    if (isMoving && !player.isDodging) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
      player.x += dx * currentSpeed * deltaTime;
      player.y += dy * currentSpeed * deltaTime;
    }

    if (mouseDownRef.current) {
        shoot();
    }
    
    // [NEW] 빠른 재장전 실패 시 흔들림 타이머 업데이트
    if (player.quickReloadShakeTimer > 0) {
        player.quickReloadShakeTimer -= deltaTime;
        if (player.quickReloadShakeTimer < 0) {
            player.quickReloadShakeTimer = 0;
        }
    }

    // [NEW] 빠른 재장전 쿨다운 타이머 업데이트
    if (player.quickReloadCooldownTimer > 0) {
        player.quickReloadCooldownTimer -= deltaTime;
        if (player.quickReloadCooldownTimer < 0) {
            player.quickReloadCooldownTimer = 0;
        }
    }


    // --- 반동 및 명중률 시스템 업데이트 ---

    // 1. 사격으로 인한 반동 회복 (부드럽게)
    const isTryingToShoot = mouseDownRef.current;
    const canActuallyShoot = !player.isReloading && player.ammo > 0 && !player.isDodging;

    if ((!isTryingToShoot || !canActuallyShoot) && player.consecutiveShots > 0) {
      if (now - lastShotTimeRef.current > effectiveStats.recoilResetTime) {
        const recoveryRate = 10 * (effectiveStats.recoilRecovery / 50);
        player.consecutiveShots -= recoveryRate * deltaTime;
        if (player.consecutiveShots < 0) {
          player.consecutiveShots = 0;
        }
      }
    }
    
    // 2. 이동으로 인한 탄퍼짐 패널티 계산 (재설계된 로직)
    const stability = effectiveStats.movementStability; // 예: 5 (초)
    const maxMoveSpread = effectiveStats.maxSpreadMoving; // 예: 0.8

    if (isMoving && !player.isDodging) {
        // `stability` 초 만에 0에서 `maxMoveSpread`까지 탄퍼짐이 증가합니다.
        // 초당 증가량 = 최대 탄퍼짐 / 안정성(시간)
        const increaseRate = (stability > 0) ? (maxMoveSpread / stability) : maxMoveSpread;
        player.movementSpread += increaseRate * deltaTime;
        if (player.movementSpread > maxMoveSpread) {
            player.movementSpread = maxMoveSpread;
        }
    } else {
        // 정지 시 회복. 회복은 증가보다 2배 빠르게 설정합니다.
        const decreaseRate = (stability > 0) ? (maxMoveSpread / (stability / 2)) : maxMoveSpread;
        player.movementSpread -= decreaseRate * deltaTime;
        if (player.movementSpread < 0) {
            player.movementSpread = 0;
        }
    }
    
    // 3. 최종 탄퍼짐(currentSpread) 계산
    // 사격 반동(recoilSpread)과 이동 패널티(movementSpread)를 합산합니다.
    const recoilRatio = Math.min(player.consecutiveShots / effectiveStats.recoilControl, 1.0);
    const recoilSpread = currentWeapon.minSpread + (currentWeapon.maxSpread - currentWeapon.minSpread) * recoilRatio;
    
    player.currentSpread = recoilSpread + player.movementSpread;

    // 4. 조준원 크기 애니메이션 (부드럽게)
    // 실제 반동 수치(currentSpread)를 기반으로 화면에 표시될 목표 반지름을 계산합니다.
    const baseRadius = 7; 
    const spreadMultiplier = 80;
    const targetRadius = baseRadius + player.currentSpread * spreadMultiplier;

    // 현재 렌더링된 반지름과 목표 반지름의 차이를 기반으로 보간 속도를 결정합니다.
    const isExpanding = targetRadius > player.renderedCrosshairRadius;
    const expandLerpSpeed = 40.0; // 확 커지는 속도
    const recoverLerpSpeed = 8.0; // 부드럽게 줄어드는 속도
    const lerpSpeed = isExpanding ? expandLerpSpeed : recoverLerpSpeed;
    
    // Lerp(선형 보간)를 사용하여 현재 렌더링된 반지름을 목표치로 부드럽게 변경합니다.
    player.renderedCrosshairRadius += (targetRadius - player.renderedCrosshairRadius) * lerpSpeed * deltaTime;

    
    // [시각적 반동 시스템 개선]
    // 1. `recoilRecovery` 스탯 대신, `gameConfig.ts`에 설정된 일관된 회복 속도를 사용합니다.
    //    이로써 시각적 반동은 실제 명중률 회복 속도와 분리되어 항상 snappy하게 느껴집니다.
    if (player.recoilOffset > 0) {
        player.recoilOffset -= RENDER_SETTINGS.visualRecoilRecoverySpeed * deltaTime;
        if (player.recoilOffset < 0) player.recoilOffset = 0;
    }

    if (screenShakeRef.current.duration > 0) {
      screenShakeRef.current.duration -= deltaTime;
    }

    if (player.isReloading) {
        player.reloadTimer += deltaTime;
        if (player.reloadTimer >= player.totalReloadTime) {
            player.ammo = player.maxAmmo;
            player.isReloading = false;
        }
    }


    if (isMoving && !player.isDodging && now - lastFootstepTimeRef.current > SOUND_SETTINGS.footstepInterval) {
      soundService.play('footstep');
      lastFootstepTimeRef.current = now;
    }

    // --- 조준 각도 계산 (월드 좌표 기반으로 수정하여 줌 버그 해결) ---
    const zoom = effectiveStats.zoom;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 1. 마우스의 화면 좌표를 게임 월드 좌표로 변환합니다.
    // 카메라의 월드 중심은 (player.x, player.y + verticalOffset) 입니다.
    // 이 지점이 화면의 (centerX, centerY)에 오도록 캔버스가 변환되므로,
    // 이 변환을 역으로 계산하여 월드 좌표를 구합니다.
    const verticalOffset = height * 0.1;
    const cameraWorldY = player.y + verticalOffset;
    
    const mouseScreenX = mouseRef.current.x;
    const mouseScreenY = mouseRef.current.y;

    const mouseWorldX = player.x + (mouseScreenX - centerX) / zoom;
    const mouseWorldY = cameraWorldY + (mouseScreenY - centerY) / zoom;
    
    // 2. 플레이어의 월드 위치에서 마우스의 월드 위치를 향하는 각도를 계산합니다.
    let rawTargetAngle = Math.atan2(mouseWorldY - player.y, mouseWorldX - player.x);
    
    // 3. 총구 위치 보정을 위한 거리 계산도 월드 좌표 기준으로 수행합니다.
    const dist = Math.hypot(mouseWorldX - player.x, mouseWorldY - player.y);
    const gunOffset = currentWeapon.gunRightOffset;
    if (dist > gunOffset) {
        const offsetAngle = Math.asin(gunOffset / dist);
        rawTargetAngle -= offsetAngle;
    }

    player.aimQueue.push({ time: now, angle: rawTargetAngle });

    // aimDelay도 업그레이드 적용
    const delayMs = effectiveStats.aimDelay * 1000;
    
    while (player.aimQueue.length > 0 && now - player.aimQueue[0].time >= delayMs) {
        player.activeTargetAngle = player.aimQueue[0].angle;
        player.aimQueue.shift();
    }
    
    if (player.aimQueue.length === 0) {
        player.activeTargetAngle = rawTargetAngle;
    }

    const currentAngle = player.rotation;
    let diff = player.activeTargetAngle - currentAngle;
    while (diff <= -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    
    const angleEpsilon = 0.05;

    if (Math.abs(diff) < angleEpsilon) {
        player.rotation = player.activeTargetAngle;
        player.currentRotationSpeed = player.baseRotationSpeed;
    } else {
        player.currentRotationSpeed += player.rotationAcceleration * deltaTime;
        if (player.currentRotationSpeed > player.maxRotationSpeed) {
            player.currentRotationSpeed = player.maxRotationSpeed;
        }
        const rotateStep = player.currentRotationSpeed * deltaTime;
        if (Math.abs(diff) <= rotateStep) {
            player.rotation = player.activeTargetAngle;
            player.currentRotationSpeed = player.baseRotationSpeed;
        } else {
            player.rotation += Math.sign(diff) * rotateStep;
        }
    }

    bulletsRef.current.forEach(b => {
      const moveX = b.velocity.x * deltaTime;
      const moveY = b.velocity.y * deltaTime;
      b.x += moveX;
      b.y += moveY;
      b.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
      if (b.distanceTraveled > b.maxDistance) {
        b.markedForDeletion = true;
      }
    });

    const shellConfig = currentWeapon.shellEjection;
    shellsRef.current.forEach(s => {
        s.x += s.velocity.x * deltaTime;
        s.y += s.velocity.y * deltaTime;
        s.vz -= shellConfig.gravity * deltaTime;
        s.z += s.vz * deltaTime;

        if (s.z <= 0) {
            s.z = 0;
            s.vz = -s.vz * shellConfig.bounciness; 
            s.velocity.x *= 0.7;
            s.velocity.y *= 0.7;
            if (Math.abs(s.vz) < 20) s.vz = 0;
        }

        if (s.z > 0) {
            s.rotation += 10 * deltaTime;
        }
        s.life -= deltaTime;
        if (s.life <= 0) s.markedForDeletion = true;
    });

    floatingTextsRef.current.forEach(ft => {
      ft.velocity.y += FLOATING_TEXT.gravity * deltaTime;
      ft.x += ft.velocity.x * deltaTime;
      ft.y += ft.velocity.y * deltaTime;
      ft.life -= deltaTime;
      if (ft.life <= 0) ft.markedForDeletion = true;
      if (ft.scale < FLOATING_TEXT.maxScale) {
          ft.scale += 8.0 * deltaTime; 
          if (ft.scale > FLOATING_TEXT.maxScale) ft.scale = FLOATING_TEXT.maxScale;
      }
    });

    // 아이템 물리 및 로직 업데이트
    itemsRef.current.forEach(item => {
        const itemConfig = ITEMS_CONFIG[item.itemType];
        if (!itemConfig) {
            item.markedForDeletion = true;
            return;
        }
        const phys = itemConfig.physics;
        item.x += item.velocity.x * deltaTime;
        item.y += item.velocity.y * deltaTime;
        item.vz -= phys.gravity * deltaTime;
        item.z += item.vz * deltaTime;

        if (item.z <= 0) {
            item.z = 0;
            item.vz = -item.vz * phys.bounciness;
            item.velocity.x *= 0.8;
            item.velocity.y *= 0.8;
            item.rotationSpeed *= 0.8;
            if (Math.abs(item.vz) < 20) item.vz = 0;
        }

        if (item.z > 0) {
            item.rotation += item.rotationSpeed * deltaTime;
        }
        item.life -= deltaTime;
        if (item.life <= 0) item.markedForDeletion = true;

        // 플레이어와 충돌(획득) 검사
        const dist = Math.hypot(player.x - item.x, player.y - item.y);
        if (dist < player.radius + itemConfig.pickupRadius) {
            item.markedForDeletion = true;
            soundService.play('itemPickup');
            
            // 아이템 효과 적용
            if (itemConfig.type === 'INSTANT_HEAL') {
                const prevHealth = player.health;
                player.health = Math.min(player.maxHealth, player.health + itemConfig.value);
                const healedAmount = Math.round(player.health - prevHealth);

                if (healedAmount > 0) {
                    createFloatingText(player.x, player.y - 40, `+${healedAmount}`, false, '#22c55e');
                    createHealingParticles(player.x, player.y);
                }
            }
        }
    });

    const spawnRate = Math.max(
      ZOMBIE_STATS.minSpawnRate, 
      ZOMBIE_STATS.spawnRate - (waveRef.current * 50)
    );

    if (now - lastSpawnTimeRef.current > spawnRate) {
      spawnZombie(width, height);
      lastSpawnTimeRef.current = now;
    }

    // [NEW] 이번 프레임에 전력질주 충돌이 있었는지 추적하는 플래그
    let sprintCollidedThisFrame = false;

    zombiesRef.current.forEach(z => {
      if (z.hitTimer > 0) z.hitTimer -= deltaTime;
      if (z.slowTimer > 0) z.slowTimer -= deltaTime;

      // [NEW] 부드러운 넉백 로직
      if (z.knockbackTimer > 0) {
        // 넉백 상태일 경우, 넉백 속도를 적용하고 일반 이동은 건너뜁니다.
        z.x += z.knockbackVelocity.x * deltaTime;
        z.y += z.knockbackVelocity.y * deltaTime;

        // 마찰력 적용 (속도가 점차 줄어듦)
        z.knockbackVelocity.x *= 0.9;
        z.knockbackVelocity.y *= 0.9;

        z.knockbackTimer -= deltaTime;
        if (z.knockbackTimer <= 0) {
            z.knockbackVelocity = { x: 0, y: 0 };
        }
      } else {
        // 일반 이동 로직
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.rotation = angle;
        
        let currentSpeed = z.speed;
        if (z.slowTimer > 0) currentSpeed *= z.slowFactor;

        const moveAmount = currentSpeed * deltaTime;
        z.x += Math.cos(angle) * moveAmount;
        z.y += Math.sin(angle) * moveAmount;
      }


      const distToPlayer = Math.hypot(player.x - z.x, player.y - z.y);
      
      // [NEW] 닷지 무적 판정
      const dodgeProgressTime = PLAYER_STATS.dodgeDuration - player.dodgeTimer;
      const isInvulnerable = player.isDodging && 
                             dodgeProgressTime > PLAYER_STATS.dodgeInvulnerabilityStartTime && 
                             dodgeProgressTime < (PLAYER_STATS.dodgeInvulnerabilityStartTime + PLAYER_STATS.dodgeInvulnerabilityDuration);

      if (distToPlayer < player.radius + z.radius && !isInvulnerable) {
        // [NEW] 전력질주 넉백
        if(player.isSprinting) {
            const knockbackAngle = Math.atan2(z.y - player.y, z.x - player.x);
            z.x += Math.cos(knockbackAngle) * PLAYER_STATS.sprintKnockback;
            z.y += Math.sin(knockbackAngle) * PLAYER_STATS.sprintKnockback;
            sprintCollidedThisFrame = true; // [NEW] 충돌 플래그 설정
        } else {
            player.health -= 0.5;
            playerDamageAccumulatorRef.current += 0.5;
            if (playerDamageAccumulatorRef.current >= 5) {
                createFloatingText(player.x, player.y - 30, `-${Math.floor(playerDamageAccumulatorRef.current)}`, false, '#ef4444');
                playerDamageAccumulatorRef.current = 0;
            }

            if (now - lastHitTimeRef.current > 500) {
                soundService.play('playerHit');
                lastHitTimeRef.current = now;
            }

            z.x -= Math.cos(z.rotation) * 10;
            z.y -= Math.sin(z.rotation) * 10;
            createParticles(player.x, player.y, '#ef4444', 5);
            
            if (player.health <= 0) {
              onGameOver(player.score, killsRef.current, waveRef.current);
            }
        }
      }

      bulletsRef.current.forEach(b => {
        if (b.markedForDeletion) return;
        if (b.ignoredEntityIds.includes(z.id)) return;

        const distToBullet = Math.hypot(b.x - z.x, b.y - z.y);
        
        if (distToBullet < z.radius + b.radius) {
          const penetrationPenalty = b.damage * b.penetration.damageDrop * b.hitCount;
          let baseDamage = Math.max(0, b.damage - penetrationPenalty); 
          const finalDamage = baseDamage * (b.isCritical ? currentWeapon.criticalMultiplier : 1.0);
          z.health -= finalDamage;
          z.hitTimer = 0.1; 
          b.ignoredEntityIds.push(z.id);
          
          b.hitCount++;
          
          // [관통 시스템 재설계]
          // 총알이 확정적으로 관통할 수 있는 횟수(count)를 모두 소모했는지 확인합니다.
          if (b.hitCount >= b.penetration.count) {
            // 확정 관통을 모두 소모한 '첫 번째' 충돌에서만 확률적 관통(chance)을 시도합니다.
            // b.hitCount가 b.penetration.count와 정확히 같을 때가 그 시점입니다.
            if (b.hitCount === b.penetration.count && Math.random() < b.penetration.chance) {
              // 확률 관통 성공: 총알은 소멸하지 않고 계속 진행합니다.
              // 이 총알은 더 이상 확률 관통 기회가 없으며, 다음 충돌 시에는 무조건 소멸됩니다.
            } else {
              // 확률 관통에 실패했거나, 이미 확률 관통을 한 번 성공한 총알이면 소멸시킵니다.
              b.markedForDeletion = true;
            }
          }
          // b.hitCount < b.penetration.count인 경우, 아직 확정 관통 횟수가 남았으므로 총알은 자동으로 계속 날아갑니다.
          
          createFloatingText(z.x, z.y, Math.floor(finalDamage).toString(), b.isCritical);
          soundService.play('impact');

          if (b.knockback > 0) {
             const bVelocityMag = Math.hypot(b.velocity.x, b.velocity.y);
             if (bVelocityMag > 0) {
                const knockbackX = (b.velocity.x / bVelocityMag) * b.knockback;
                const knockbackY = (b.velocity.y / bVelocityMag) * b.knockback;
                z.x += knockbackX;
                z.y += knockbackY;
             }
          }

          if (b.slow && b.slow.duration > 0) {
             z.slowTimer = b.slow.duration;
             z.slowFactor = b.slow.factor;
          }

          const bulletAngle = Math.atan2(b.velocity.y, b.velocity.x);
          createSprayParticles(z.x, z.y, '#84cc16', 8, bulletAngle, 1.0);

          particlesRef.current.push({
              id: 'flash-' + Math.random(),
              x: b.x,
              y: b.y,
              radius: 6,
              color: '#ffffff',
              rotation: 0,
              markedForDeletion: false,
              velocity: { x: 0, y: 0 },
              life: 0.05,
              maxLife: 0.05,
              alpha: 1
          });

          if (z.health <= 0) {
            z.markedForDeletion = true;
            let score = ZOMBIE_STATS.types.walker.score;
            let xp = ZOMBIE_STATS.types.walker.xp;

            if (z.type === 'runner') { score = ZOMBIE_STATS.types.runner.score; xp = ZOMBIE_STATS.types.runner.xp; }
            if (z.type === 'tank') { score = ZOMBIE_STATS.types.tank.score; xp = ZOMBIE_STATS.types.tank.xp; }

            player.score += score;
            killsRef.current++;
            
            // --- XP 획득 및 레벨업 ---
            player.xp += xp;
            if (player.xp >= player.maxXp) {
                player.level++;
                player.xp -= player.maxXp;
                player.maxXp = Math.floor(player.maxXp * 1.2); // 필요 경험치 20% 증가
                setGameStatus(GameStatus.LEVEL_UP);
            }

            // --- 아이템 드랍 로직 ---
            const zombieTypeConfig = ZOMBIE_STATS.types[z.type];
            // 좀비 종류에 따른 드랍률 보정 (예: 탱크는 드랍률 2배)
            const dropMultiplier = zombieTypeConfig.dropChanceMultiplier || 1;
            
            // 설정된 모든 아이템을 순회하며 드랍 여부를 개별적으로 계산
            Object.values(ITEMS_CONFIG).forEach(itemConfig => {
                if (Math.random() < itemConfig.baseDropChance * dropMultiplier) {
                    const phys = itemConfig.physics;
                    itemsRef.current.push({
                        id: 'item-' + Math.random(),
                        x: z.x, 
                        y: z.y,
                        z: 10,
                        vz: phys.verticalVelocity + (Math.random() - 0.5) * 50,
                        velocity: {
                            x: (Math.random() - 0.5) * phys.velocity,
                            y: (Math.random() - 0.5) * phys.velocity
                        },
                        radius: 8, // 충돌 판정용 반지름
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 5,
                        life: phys.life,
                        maxLife: phys.life,
                        color: '', // 사용 안 함, draw 함수가 색상 처리
                        markedForDeletion: false,
                        itemType: itemConfig.itemType
                    });
                }
            });

            createSprayParticles(z.x, z.y, '#84cc16', 15, bulletAngle, 2.0);
            createParticles(z.x, z.y, '#84cc16', 5);
            
            if (killsRef.current > 0 && killsRef.current % GAME_SETTINGS.scoreToNextWave === 0) {
              waveRef.current++;
            }
          }
        }
      });
    });

    // [NEW] 전력질주 충돌 사운드 재생 (쿨다운 적용)
    if (sprintCollidedThisFrame && now - lastSprintCollideTimeRef.current > SOUND_SETTINGS.sprintCollideCooldown) {
      soundService.play('sprintCollide');
      lastSprintCollideTimeRef.current = now;
    }

    particlesRef.current.forEach(p => {
      p.x += p.velocity.x * deltaTime;
      p.y += p.velocity.y * deltaTime;
      if (p.growth) {
          p.radius += p.growth * deltaTime;
      }
      p.life -= GAME_SETTINGS.particleLifeDecay * deltaTime;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0 || (p.growth && p.radius <= 0)) p.markedForDeletion = true;
    });

    const cleanupRadius = Math.max(width, height) * 2;
    zombiesRef.current = zombiesRef.current.filter(z => {
      const dist = Math.hypot(player.x - z.x, player.y - z.y);
      return !z.markedForDeletion && dist < cleanupRadius;
    });
    
    bulletsRef.current = bulletsRef.current.filter(b => !b.markedForDeletion);
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);
    shellsRef.current = shellsRef.current.filter(s => !s.markedForDeletion);
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => !ft.markedForDeletion);
    itemsRef.current = itemsRef.current.filter(i => !i.markedForDeletion); // 아이템 정리

    onUpdateStats({
      health: player.health,
      ammo: player.ammo,
      maxAmmo: player.maxAmmo,
      score: player.score,
      wave: waveRef.current,
      xp: player.xp,
      maxXp: player.maxXp,
      level: player.level,
      stamina: player.stamina,
      maxStamina: player.maxStamina,
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    const player = playerRef.current;
    
    // 줌 적용 (업그레이드 스탯)
    const stats = calculateWeaponStats(player.level);
    const zoom = stats.zoom;

    // 화면 흔들림
    let shakeX = 0;
    let shakeY = 0;
    if (screenShakeRef.current.duration > 0) {
        const intensity = screenShakeRef.current.intensity;
        shakeX = (Math.random() - 0.5) * intensity * 2;
        shakeY = (Math.random() - 0.5) * intensity * 2;
    }

    // 카메라 위치 계산 (플레이어를 화면 특정 위치에 고정)
    // 줌을 적용하기 위해 캔버스 전체 스케일링을 사용하므로, 카메라 좌표 계산 시 주의
    const verticalOffset = height * 0.1;
    // 플레이어가 화면 중심(에서 약간 위)에 있도록 월드 좌표 이동
    // 줌의 기준점은 화면 중심이 되어야 함
    
    ctx.save();
    
    // 1. 화면 중심으로 이동
    ctx.translate(width / 2, height / 2);
    // 2. 줌 적용
    ctx.scale(zoom, zoom);
    // 3. 흔들림 적용
    ctx.translate(shakeX, shakeY);
    // 4. 플레이어 위치로 역이동 (카메라 이동)
    // 플레이어는 화면 중심에서 verticalOffset만큼 위쪽에 그려져야 함 (월드 좌표 아님, 화면상 위치)
    // 즉 월드상에서 (player.x, player.y)가 화면의 (0, -verticalOffset)에 오도록
    ctx.translate(-player.x, -(player.y + verticalOffset));

    // --- 배경 그리기 (Tiled) ---
    // 보이는 영역 계산 (줌 고려)
    // 현재 뷰포트 영역: player.x - width/2/zoom ...
    const viewL = player.x - (width / 2) / zoom;
    const viewT = player.y + verticalOffset - (height / 2) / zoom;
    const viewW = width / zoom;
    const viewH = height / zoom;

    if (backgroundCanvasRef.current) {
        const bgSize = 512;
        const startCol = Math.floor(viewL / bgSize);
        const startRow = Math.floor(viewT / bgSize);
        const endCol = Math.floor((viewL + viewW) / bgSize) + 1;
        const endRow = Math.floor((viewT + viewH) / bgSize) + 1;

        for (let c = startCol; c < endCol; c++) {
            for (let r = startRow; r < endRow; r++) {
                ctx.drawImage(backgroundCanvasRef.current, c * bgSize, r * bgSize);
            }
        }
    } else {
        ctx.fillStyle = '#334155';
        ctx.fillRect(viewL, viewT, viewW, viewH);
    }

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const startX = Math.floor(viewL / gridSize) * gridSize;
    const startY = Math.floor(viewT / gridSize) * gridSize;
    const endX = startX + viewW + gridSize;
    const endY = startY + viewH + gridSize;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) { 
        ctx.moveTo(x, startY); ctx.lineTo(x, endY); 
    }
    for (let y = startY; y <= endY; y += gridSize) { 
        ctx.moveTo(startX, y); ctx.lineTo(endX, y); 
    }
    ctx.stroke();

    shellsRef.current.forEach(s => {
        if (s.z > 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.5, s.rotation, 0, Math.PI * 2);
            ctx.fill();
        }
        const renderY = s.y - s.z;
        ctx.save();
        ctx.translate(s.x, renderY);
        ctx.rotate(s.rotation);
        ctx.fillStyle = s.color;
        ctx.fillRect(-s.radius, -s.radius/2, s.radius * 2, s.radius);
        ctx.restore();
    });

    // 아이템 그리기
    itemsRef.current.forEach(item => {
        const itemConfig = ITEMS_CONFIG[item.itemType];
        if (!itemConfig) return;

        // 동적 그림자 그리기 (입체감 부여)
        // 아이템의 높이(z)에 따라 그림자의 크기와 투명도가 변합니다.
        const maxShadowHeight = 150; // 그림자 효과가 최대로 적용될 높이
        const shadowRatio = Math.min(item.z / maxShadowHeight, 1.0); // 0.0 (바닥) ~ 1.0 (최대 높이)

        // 설정 파일에서 그림자 크기 배율을 가져옵니다.
        const baseRadiusX = item.radius * RENDER_SETTINGS.shadowScale;
        const baseRadiusY = baseRadiusX * 0.5; // 타원 비율 유지
        
        // 높이가 높을수록 그림자는 작아지고 옅어집니다.
        const shadowRadiusX = baseRadiusX * (1 - shadowRatio * 0.4); // 최대 40% 작아짐
        const shadowRadiusY = baseRadiusY * (1 - shadowRatio * 0.4);
        const shadowAlpha = 0.35 * (1 - shadowRatio * 0.6); // 최대 60% 옅어짐

        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.beginPath();
        // 그림자는 아이템 회전과 상관없이 바닥에 고정된 타원형입니다.
        // 설정 파일에서 가져온 오프셋을 적용합니다.
        ctx.ellipse(
            item.x + RENDER_SETTINGS.shadowOffset.x,
            item.y + RENDER_SETTINGS.shadowOffset.y,
            shadowRadiusX, 
            shadowRadiusY, 
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // 아이템 본체 그리기
        itemConfig.draw(ctx, item);
    });

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    zombiesRef.current.forEach(z => {
      // 그림자 그리기 (입체감 부여)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      // 설정 파일에서 오프셋과 크기 배율을 가져와 적용합니다.
      ctx.ellipse(
          z.x + RENDER_SETTINGS.shadowOffset.x, 
          z.y + RENDER_SETTINGS.shadowOffset.y, 
          z.radius * RENDER_SETTINGS.shadowScale, 
          z.radius * RENDER_SETTINGS.shadowScale * 0.5, // 타원 비율 유지
          0, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.save();
      ctx.translate(z.x, z.y);
      ctx.rotate(z.rotation);
      
      ctx.fillStyle = z.color;
      if (z.slowTimer > 0) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#3b82f6'; 
      }

      ctx.beginPath();
      ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (z.hitTimer > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(5, 5); ctx.lineTo(15, 8);
      ctx.moveTo(5, -5); ctx.lineTo(15, -8);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(4, -3, 2, 0, Math.PI * 2);
      ctx.arc(4, 3, 2, 0, Math.PI * 2);
      ctx.fill();
      
      if (z.type === 'tank') {
        ctx.fillStyle = 'red';
        ctx.fillRect(-10, -z.radius - 10, 20, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-10, -z.radius - 10, 20 * (z.health / z.maxHealth), 4);
      }

      ctx.restore();
    });

    bulletsRef.current.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      const maxTrailLength = speed * 0.1;
      const currentTrailLength = Math.min(b.distanceTraveled, maxTrailLength);

      if (currentTrailLength > 0) {
        const dirX = -(b.velocity.x / speed);
        const dirY = -(b.velocity.y / speed);
        const tailX = b.x + dirX * currentTrailLength;
        const tailY = b.y + dirY * currentTrailLength;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // 변경된 색상
        ctx.lineWidth = 2; // 선 두께
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    });
    
    if (currentWeapon.laserSight && currentWeapon.laserSight.enabled) {
        // [FIX] 레이저 사이트의 시작점이 총기 반동(recoilOffset)에 영향을 받지 않도록 수정합니다.
        // 이제 총몸이 뒤로 밀려도 레이저는 항상 총구의 원래 위치에서 발사됩니다.
        const gunLengthWithoutRecoil = stats.gunLength;
        const gunOffset = currentWeapon.gunRightOffset;
        
        const muzzleX = player.x + (gunLengthWithoutRecoil * Math.cos(player.rotation) - gunOffset * Math.sin(player.rotation));
        const muzzleY = player.y + (gunLengthWithoutRecoil * Math.sin(player.rotation) + gunOffset * Math.cos(player.rotation));
        
        // 업그레이드된 사거리 사용
        const range = stats.maxDistance;
        const endX = muzzleX + Math.cos(player.rotation) * range;
        const endY = muzzleY + Math.sin(player.rotation) * range;

        // 가장 가까운 충돌 지점을 찾기 위한 변수 (0~1 사이의 값, 1은 최대 사거리)
        let closestT = 1.0;

        // 모든 좀비와 충돌 검사
        zombiesRef.current.forEach(z => {
            const t = getLineCircleIntersection({x: muzzleX, y: muzzleY}, {x: endX, y: endY}, z);
            if (t !== null && t < closestT) {
                closestT = t;
            }
        });

        // 최종 레이저 끝점 계산 (최대 사거리 또는 가장 가까운 충돌 지점)
        const laserEndX = muzzleX + (endX - muzzleX) * closestT;
        const laserEndY = muzzleY + (endY - muzzleY) * closestT;

        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // 빛 효과를 위해 블렌딩 모드 변경
        ctx.strokeStyle = currentWeapon.laserSight.color;
        ctx.lineWidth = currentWeapon.laserSight.width;
        ctx.shadowBlur = 4;
        ctx.shadowColor = currentWeapon.laserSight.color;
        
        // 레이저 선 그리기
        ctx.beginPath();
        ctx.moveTo(muzzleX, muzzleY);
        ctx.lineTo(laserEndX, laserEndY);
        ctx.stroke();

        // 레이저 끝에 항상 점을 표시 (충돌 여부와 상관없이)
        ctx.fillStyle = currentWeapon.laserSight.dotColor || '#ff0000';
        ctx.beginPath();
        ctx.arc(laserEndX, laserEndY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / FLOATING_TEXT.life);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.font = `bold ${ft.size}px "Do Hyeon", sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillText(ft.text, 0, 0);
      if (ft.isCritical) {
          ctx.font = `bold ${ft.size * 0.5}px "Do Hyeon", sans-serif`;
          ctx.fillText("CRIT!", 0, -ft.size);
      }
      ctx.restore();
    });

    const p = playerRef.current;

    // 플레이어 그림자 그리기 (입체감 부여)
    const shadowScale = p.dodgeScale * RENDER_SETTINGS.shadowScale;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
        p.x + RENDER_SETTINGS.shadowOffset.x,
        p.y + RENDER_SETTINGS.shadowOffset.y,
        p.radius * shadowScale,
        p.radius * shadowScale * 0.5,
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    ctx.save();
    ctx.translate(p.x, p.y);
    // [NEW] 닷지 시 점프 효과를 위해 y축 오프셋 추가
    if (p.isDodging) {
      const dodgeProgress = 1 - (p.dodgeTimer / PLAYER_STATS.dodgeDuration);
      const jumpHeight = 15 * Math.sin(dodgeProgress * Math.PI);
      ctx.translate(0, -jumpHeight);
    }
    ctx.rotate(p.rotation);
    ctx.scale(p.dodgeScale, p.dodgeScale); // [NEW] 닷지 스케일 적용


    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1e293b'; 
    ctx.beginPath();
    ctx.arc(0, 8, 6, 0, Math.PI * 2);
    ctx.arc(0, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    const gunRecoilX = -p.recoilOffset;
    const gunRightOffset = currentWeapon.gunRightOffset; // [NEW] 총기 오프셋 값을 가져옵니다.

    // 데이터 기반 총기 렌더링 시스템
    const renderConfig = currentWeapon.render;
    if (renderConfig) {
        for (const partName in renderConfig) {
            const part = renderConfig[partName as keyof typeof renderConfig];
            
            const partX = gunRecoilX + (part.offsetX || 0);
            // [MODIFIED] 총기의 좌우 위치 오프셋을 적용하고, 파츠의 고유 오프셋을 더한 후,
            // 파츠 너비의 절반을 빼서 수직으로 중앙 정렬합니다.
            const partY = gunRightOffset + (part.offsetY || 0) - (part.width / 2); 
            
            ctx.fillStyle = part.color;
            ctx.fillRect(partX, partY, part.length, part.width);
        }
    }

    ctx.fillStyle = '#C8A484'; 
    ctx.strokeStyle = '#e5e7eb'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-8, -5, 12, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f9a8d4'; 
    ctx.beginPath();
    ctx.ellipse(-8, -5, 9, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C8A484'; 
    ctx.beginPath();
    ctx.ellipse(-8, 5, 12, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f9a8d4';
    ctx.beginPath();
    ctx.ellipse(-8, 5, 9, 1.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C8A484'; 
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000'; 
    ctx.beginPath();
    ctx.arc(5, -3.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 3.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    
    // --- [NEW] 스테미나 UI 그리기 ---
    const gaugeCfg = PLAYER_UI_SETTINGS.staminaGauge;

    // [NEW] 스테미나 부족 경고 시 흔들림 효과 추가
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    const isStaminaWarning = p.staminaWarningTimer > 0;
    if (isStaminaWarning) {
        const shakeIntensity = 3; // 흔들림의 강도. 이 값을 높이면 더 많이 흔들립니다.
        shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
        shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;
    }
    
    const gaugeX = p.x + gaugeCfg.offsetX + shakeOffsetX;
    const gaugeY = p.y + gaugeCfg.offsetY + shakeOffsetY;

    const numSegments = Math.ceil(p.maxStamina / gaugeCfg.staminaPerSegment);
    const filledSegments = Math.floor(p.stamina / gaugeCfg.staminaPerSegment);
    const partialSegmentFill = (p.stamina % gaugeCfg.staminaPerSegment) / gaugeCfg.staminaPerSegment;
    
    ctx.save();
    ctx.translate(gaugeX, gaugeY);
    ctx.lineWidth = gaugeCfg.lineWidth;

    // 배경 (빈 칸)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, gaugeCfg.radius, 0, Math.PI * 2);
    ctx.stroke();

    // 채워진 칸
    // [NEW] 스테미나 부족 경고 시 색상을 빨간색으로 변경합니다.
    const gaugeColor = isStaminaWarning ? '#ef4444' : 'rgba(251, 191, 36, 1)'; // Tailwind red-500 또는 amber-400

    for(let i = 0; i < filledSegments; i++) {
        ctx.strokeStyle = gaugeColor;
        const startAngle = (i / numSegments) * Math.PI * 2 - Math.PI / 2;
        const endAngle = ((i + 1) / numSegments) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(0, 0, gaugeCfg.radius, startAngle, endAngle);
        ctx.stroke();
    }
    
    // 부분적으로 채워진 칸
    if (partialSegmentFill > 0 && filledSegments < numSegments) {
        ctx.strokeStyle = gaugeColor;
        const startAngle = (filledSegments / numSegments) * Math.PI * 2 - Math.PI / 2;
        const endAngle = startAngle + (partialSegmentFill / numSegments) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, gaugeCfg.radius, startAngle, endAngle);
        ctx.stroke();
    }
    
    // 칸 구분선
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    for(let i = 1; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (gaugeCfg.radius - gaugeCfg.lineWidth / 2), Math.sin(angle) * (gaugeCfg.radius - gaugeCfg.lineWidth / 2));
        ctx.lineTo(Math.cos(angle) * (gaugeCfg.radius + gaugeCfg.lineWidth / 2), Math.sin(angle) * (gaugeCfg.radius + gaugeCfg.lineWidth / 2));
        ctx.stroke();
    }
    ctx.restore();


    if (p.isReloading) {
        // [NEW] 설정 파일에서 스케일 값들을 가져와 적용합니다.
        const scale = RENDER_SETTINGS.reloadUIScale;
        const barWidth = RENDER_SETTINGS.reloadUIBaseWidth * scale;
        const barHeight = RENDER_SETTINGS.reloadUIBaseHeight * scale;
        const yOffset = RENDER_SETTINGS.reloadUIBaseYOffset * scale;
        const arrowBaseSize = RENDER_SETTINGS.quickReloadArrowBaseSize * scale;
        const textFontSize = RENDER_SETTINGS.quickReloadTextBaseSize * scale;

        const reloadProgress = Math.min(p.reloadTimer / p.totalReloadTime, 1.0);

        // [NEW] 빠른 재장전 실패 시 흔들림 효과
        let shakeOffsetX = 0;
        let shakeOffsetY = 0;
        if (p.quickReloadShakeTimer > 0) {
            // 흔들림 강도 및 빈도 조절
            const shakeIntensity = 2 * scale; // 스케일에 따라 흔들림 강도도 조절
            shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
            shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;
        }

        // 재장전 바 배경
        ctx.fillStyle = '#1f2937'; 
        ctx.fillRect(p.x - barWidth / 2 + shakeOffsetX, p.y + yOffset + shakeOffsetY, barWidth, barHeight);
        
        // [MODIFIED] 빠른 재장전 성공 범위 (초록색)는 재장전 중이면 항상 표시합니다.
        const hitWindowStartPx = (p.x - barWidth / 2) + (barWidth * p.quickReloadHitWindowStart);
        const hitWindowEndPx = (p.x - barWidth / 2) + (barWidth * p.quickReloadHitWindowEnd);
        const hitWindowWidthPx = hitWindowEndPx - hitWindowStartPx;

        ctx.fillStyle = '#22c55e'; // Tailwind green-500
        ctx.fillRect(hitWindowStartPx + shakeOffsetX, p.y + yOffset + shakeOffsetY, hitWindowWidthPx, barHeight);
        

        // 재장전 진행 바 (노란색)
        ctx.fillStyle = '#eab308'; 
        ctx.fillRect(p.x - barWidth / 2 + (1 * scale) + shakeOffsetX, p.y + yOffset + (1 * scale) + shakeOffsetY, (barWidth - (2 * scale)) * reloadProgress, barHeight - (2 * scale));

        // [MODIFIED] 빠른 재장전 스윗스팟 화살표 (빨간색)는 재장전 중이면 항상 표시합니다.
        const arrowX = (p.x - barWidth / 2) + (barWidth * p.quickReloadSweetSpot) + shakeOffsetX;
        const arrowY = p.y + yOffset + barHeight + (2 * scale) + shakeOffsetY; // 바 아래, 스케일된 여백 적용

        ctx.fillStyle = '#ef4444'; // Tailwind red-500
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowBaseSize, arrowY + (arrowBaseSize * 1.5)); // 화살표 크기 스케일 적용
        ctx.lineTo(arrowX + arrowBaseSize, arrowY + (arrowBaseSize * 1.5));
        ctx.closePath();
        ctx.fill();

        // 재장전 텍스트
        ctx.font = `bold ${textFontSize}px "Do Hyeon", sans-serif`; // 폰트 크기 스케일 적용
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3 * scale; // 폰트 테두리 두께 스케일 적용
        ctx.strokeStyle = 'black';
        ctx.strokeText(GAME_TEXT.HUD.RELOADING, p.x + shakeOffsetX, p.y + yOffset - (4 * scale) + shakeOffsetY);
        ctx.fillText(GAME_TEXT.HUD.RELOADING, p.x + shakeOffsetX, p.y + yOffset - (4 * scale) + shakeOffsetY);
    }
    
    ctx.restore(); // Camera

    // 조준점 (화면 좌표)
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    ctx.fillStyle = '#ef4444'; 
    ctx.beginPath();
    ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 조준점 외곽 원 (애니메이션 적용된 값 사용)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // update()에서 부드럽게 보간된 renderedCrosshairRadius 값을 사용하여 원을 그립니다.
    ctx.arc(mx, my, player.renderedCrosshairRadius, 0, Math.PI * 2); 
    ctx.stroke();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
    }
    const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
    previousTimeRef.current = time;
    
    // isPaused가 true이면 update를 호출하지 않음 (일시 정지)
    if (!isPaused) {
      update(deltaTime);
    }

    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            draw(ctx);
            
            // 개발자 모드로 일시정지되었을 때 오버레이 표시
            if (isPaused && gameStatus !== GameStatus.LEVEL_UP) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = 'bold 32px "Do Hyeon", sans-serif';
                ctx.fillStyle = '#facc15'; // Tailwind yellow-400
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.strokeText('일시 정지 (개발자 모드)', canvas.width / 2, canvas.height / 2);
                
                ctx.fillText('일시 정지 (개발자 모드)', canvas.width / 2, canvas.height / 2);
                ctx.restore();
            }
        }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [gameStatus, isPaused, calculateWeaponStats]); // 종속성에서 update, draw 제거

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    if (gameStatus === GameStatus.MENU && waveRef.current === 1) {
        initGame();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [initGame, gameStatus]);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && playerRef.current.health <= 0) {
        initGame();
    }
  }, [gameStatus, initGame]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full cursor-none" />;
};

export default GameCanvas;