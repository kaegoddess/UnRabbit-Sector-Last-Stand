import React, { useRef, useEffect, useCallback } from 'react';
import { Player, Zombie, Bullet, Particle, Shell, FloatingText, GameStatus, WeaponPart, UpgradeState, Item, ItemType, GameStats, Grenade, ExplosionEffect } from '../types';
import { GAME_SETTINGS, SOUND_SETTINGS, FLOATING_TEXT, RENDER_SETTINGS } from '../config/gameConfig';
import { ZOMBIE_STATS } from '../config/zombieConfig';
// FIX: PLAYER_LEVELING_SETTINGS를 import하여 레벨업 관련 설정을 사용합니다.
import { PLAYER_STATS, PLAYER_UI_SETTINGS, PLAYER_EFFECTS, PLAYER_LEVELING_SETTINGS } from '../config/playerConfig';
import { WEAPONS } from '../config/weaponConfig';
import { soundService } from '../services/SoundService';
import { GAME_TEXT } from '../config/textConfig';
import { UPGRADE_CONFIG } from '../config/upgradeConfig'; // 업그레이드 중앙 설정 파일 임포트
import { ITEMS_CONFIG } from '../config/itemConfig'; // 아이템 설정 파일 임포트
import { GRENADE_STATS } from '../config/abilityConfig';

interface GameCanvasProps {
  gameStatus: GameStatus;
  selectedWeaponId: string; // 'Pistol' | 'MP5' etc
  upgradeLevels: UpgradeState; // 부품별 업그레이드 레벨
  setGameStatus: (status: GameStatus) => void;
  onUpdateStats: (stats: { 
    health: number; 
    ammo: number; 
    maxAmmo: number; 
    score: number; 
    wave: number; 
    xp: number; 
    maxXp: number; 
    level: number; 
    stamina: number; 
    maxStamina: number; 
    grenadeCooldown: number;
    maxGrenadeCooldown: number;
  }) => void;
  onGameOver: (finalScore: number, kills: number, wave: number) => void;
  onShoot: (firedAmmoIndex: number) => void; // 발사 이벤트 콜백 (UI 탄피 연출용)
  onDryFire?: () => void; // [NEW] 탄약 부족 시 사격 시도 이벤트 (UI 흔들림용)
  isPaused: boolean; // 게임 일시정지 상태 (개발자 모드 또는 레벨업)
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameStatus, selectedWeaponId, upgradeLevels, setGameStatus, onUpdateStats, onGameOver, onShoot, onDryFire, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | null>(null);
  
  // onShoot prop을 최신 상태로 유지하기 위한 Ref (Stale Closure 방지)
  const onShootRef = useRef(onShoot);
  const onDryFireRef = useRef(onDryFire);

  useEffect(() => {
    onShootRef.current = onShoot;
  }, [onShoot]);

  useEffect(() => {
    onDryFireRef.current = onDryFire;
  }, [onDryFire]);
  
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
    maxXp: PLAYER_LEVELING_SETTINGS.baseMaxXp,
    level: 1,
    stamina: PLAYER_STATS.maxStamina,
    maxStamina: PLAYER_STATS.maxStamina,
    isSprinting: false,
    staminaRechargeDelayTimer: 0,
    staminaWarningTimer: 0,
    isDodging: false,
    dodgeTimer: 0,
    dodgeDuration: PLAYER_STATS.dodgeDuration,
    dodgeInvulnerabilityTimer: 0,
    dodgeDirection: { x: 0, y: 0 },
    dodgeScale: 1,
    recoilOffset: 0,
    consecutiveShots: 0,
    currentSpread: 0,
    movementSpread: 0,
    renderedCrosshairRadius: 7,
    currentRotationSpeed: PLAYER_STATS.baseRotationSpeed, 
    baseRotationSpeed: PLAYER_STATS.baseRotationSpeed,    
    maxRotationSpeed: PLAYER_STATS.maxRotationSpeed,     
    rotationAcceleration: PLAYER_STATS.rotationAcceleration, 
    activeTargetAngle: 0, 
    aimQueue: [{ time: 0, angle: 0 }],
    quickReloadSweetSpot: 0,
    quickReloadHitWindowStart: 0,
    quickReloadHitWindowEnd: 0,
    quickReloadShakeTimer: 0,
    isQuickReloadAttempted: false,
    quickReloadCooldownTimer: 0,
    isQuickReloadFailed: false,
    grenadeCooldown: 0,
    maxGrenadeCooldown: GRENADE_STATS.baseCooldown,
    grenadeLevel: 1,
    grenadeXp: 0,
    grenadeMaxXp: GRENADE_STATS.baseMaxXp,
  });

  const zombiesRef = useRef<Zombie[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shellsRef = useRef<Shell[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const grenadesRef = useRef<Grenade[]>([]);
  const explosionEffectsRef = useRef<ExplosionEffect[]>([]);
  
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
  const lastSprintCollideTimeRef = useRef<number>(0);

  // [NEW] 좀비 사망 처리 로직을 중앙에서 관리하는 함수
  // 이 함수는 좀비가 죽었을 때 점수, 경험치, 아이템 드랍 등 모든 후속 처리를 담당합니다.
  const processZombieKill = useCallback((zombie: Zombie) => {
    const player = playerRef.current;
    
    // 1. 좀비를 삭제 대상으로 표시
    zombie.markedForDeletion = true;

    // 2. 좀비 종류에 맞는 점수와 경험치 가져오기
    let score = ZOMBIE_STATS.types.walker.score;
    let xp = ZOMBIE_STATS.types.walker.xp;
    if (zombie.type === 'runner') { score = ZOMBIE_STATS.types.runner.score; xp = ZOMBIE_STATS.types.runner.xp; }
    if (zombie.type === 'tank') { score = ZOMBIE_STATS.types.tank.score; xp = ZOMBIE_STATS.types.tank.xp; }

    // 3. 플레이어 점수 및 처치 수 업데이트
    player.score += score;
    killsRef.current++;
    
    // 4. 플레이어 경험치 획득 및 레벨업 처리
    player.xp += xp;
    if (player.xp >= player.maxXp) {
        player.level++;
        player.xp -= player.maxXp;
        player.maxXp = Math.floor(player.maxXp * PLAYER_LEVELING_SETTINGS.xpMultiplierPerLevel);
        setGameStatus(GameStatus.LEVEL_UP);
    }

    // 5. 아이템 드랍 처리
    const zombieTypeConfig = ZOMBIE_STATS.types[zombie.type];
    const dropMultiplier = zombieTypeConfig.dropChanceMultiplier || 1;
    Object.values(ITEMS_CONFIG).forEach(itemConfig => {
        if (Math.random() < itemConfig.baseDropChance * dropMultiplier) {
            const phys = itemConfig.physics;
            itemsRef.current.push({
                id: 'item-' + Math.random(),
                x: zombie.x, 
                y: zombie.y,
                z: 10,
                vz: phys.verticalVelocity + (Math.random() - 0.5) * 50,
                velocity: { x: (Math.random() - 0.5) * phys.velocity, y: (Math.random() - 0.5) * phys.velocity },
                radius: 8,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 5,
                life: phys.life,
                maxLife: phys.life,
                color: '',
                markedForDeletion: false,
                itemType: itemConfig.itemType
            });
        }
    });
    
    // 6. 웨이브 진행도 체크
    if (killsRef.current > 0 && killsRef.current % GAME_SETTINGS.scoreToNextWave === 0) {
        waveRef.current++;
    }
  }, [setGameStatus]); // setGameStatus를 의존성 배열에 추가합니다.


  // [NEW] 수류탄 투척 함수
  const throwGrenade = () => {
    const player = playerRef.current;
    if (player.grenadeCooldown > 0 || player.isReloading || player.isDodging) return;

    soundService.play('grenadeThrow');
    player.grenadeCooldown = player.maxGrenadeCooldown;

    const grenadeStats = {
        damage: GRENADE_STATS.baseDamage + (player.grenadeLevel - 1) * GRENADE_STATS.damagePerLevel,
        radius: GRENADE_STATS.baseRadius + (player.grenadeLevel - 1) * GRENADE_STATS.radiusPerLevel,
        knockback: GRENADE_STATS.baseKnockback + (player.grenadeLevel - 1) * GRENADE_STATS.knockbackPerLevel,
    };

    grenadesRef.current.push({
        id: 'grenade-' + Math.random(),
        x: player.x,
        y: player.y,
        z: 10,
        vz: GRENADE_STATS.throwVerticalVelocity,
        velocity: {
            x: Math.cos(player.rotation) * GRENADE_STATS.throwVelocity,
            y: Math.sin(player.rotation) * GRENADE_STATS.throwVelocity,
        },
        radius: 6,
        color: '#4d7c0f',
        rotation: Math.random() * Math.PI * 2,
        markedForDeletion: false,
        life: GRENADE_STATS.rollDuration,
        state: 'flying',
        stats: grenadeStats,
    });
  };

  const dodge = () => {
    const player = playerRef.current;
    if (player.isDodging || player.isReloading || player.stamina < PLAYER_STATS.dodgeStaminaCost) {
      if (!player.isDodging && !player.isReloading && player.stamina < PLAYER_STATS.dodgeStaminaCost) {
          player.staminaWarningTimer = 0.3;
          soundService.play('staminaEmpty');
      }
      return;
    }

    player.isDodging = true;
    player.stamina -= PLAYER_STATS.dodgeStaminaCost;
    player.staminaRechargeDelayTimer = PLAYER_STATS.staminaRechargeDelay;
    player.dodgeTimer = PLAYER_STATS.dodgeDuration;
    
    player.dodgeDirection = {
      x: Math.cos(player.rotation),
      y: Math.sin(player.rotation)
    };
    
    soundService.play('dodge');

    const particleCount = 20;
    const baseAngle = player.rotation + Math.PI;
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

  const calculateWeaponStats = useCallback((level: number) => {
    const baseWeapon = WEAPONS[selectedWeaponId as keyof typeof WEAPONS] || WEAPONS.Pistol;
    const effectiveStats: { [key: string]: any } = { 
      ...baseWeapon,
      zoom: 1.0
    };
    const levelDamageBonus = (level - 1) * (baseWeapon.damagePerLevel || 0);
    effectiveStats.damage += levelDamageBonus;

    for (const partKey in upgradeLevels) {
      const part = partKey as WeaponPart;
      const partLevel = upgradeLevels[part];
      if (partLevel === 0) continue;
      if (part === WeaponPart.AMMO || part === WeaponPart.MAG || part === WeaponPart.STOCK) {
        continue;
      }
      const config = UPGRADE_CONFIG[part];
      const effect = config.statEffect;
      switch (effect.type) {
        case 'ADD':
        case 'ADD_BONUS': {
          const statName = effect.stat;
          if (typeof effectiveStats[statName] === 'number') {
            effectiveStats[statName] += effect.value * partLevel;
          }
          break;
        }
        case 'SUBTRACT_PERCENT_BASE': {
          const statName = effect.stat;
          const baseValue = (baseWeapon as any)[statName] ?? effectiveStats[statName];
          if (typeof baseValue === 'number') {
            effectiveStats[statName] = baseValue * (1 - (effect.value * partLevel));
          }
          break;
        }
        case 'ADD_PERCENT_BASE': {
          const statName = effect.stat;
          const baseValue = (baseWeapon as any)[statName] ?? effectiveStats[statName];
          if (typeof baseValue === 'number') {
            effectiveStats[statName] = baseValue * (1 + (effect.value * partLevel));
          }
          break;
        }
      }
    }
    const magLevel = upgradeLevels[WeaponPart.MAG] || 0;
    if (magLevel > 0) {
      const magConfig = UPGRADE_CONFIG[WeaponPart.MAG];
      const bonusPerLevel = baseWeapon.maxAmmo * magConfig.statEffect.value;
      const bonusAmmo = bonusPerLevel < 1 ? magLevel : Math.floor(bonusPerLevel * magLevel);
      effectiveStats.maxAmmo = baseWeapon.maxAmmo + bonusAmmo;
    }
    const ammoLevel = upgradeLevels[WeaponPart.AMMO] || 0;
    const totalBonusChance = UPGRADE_CONFIG[WeaponPart.AMMO].statEffect.value * ammoLevel;
    const addedGuaranteedHits = Math.floor(totalBonusChance);
    const probabilisticChance = totalBonusChance - addedGuaranteedHits;
    effectiveStats.penetration = {
      ...baseWeapon.penetration,
      count: baseWeapon.penetration.count + addedGuaranteedHits,
      chance: probabilisticChance,
    };
    const stockLevel = upgradeLevels[WeaponPart.STOCK] || 0;
    if (stockLevel > 0) {
      const stockConfig = UPGRADE_CONFIG[WeaponPart.STOCK];
      const bonusPerLevel = baseWeapon.damage * stockConfig.statEffect.value;
      const guaranteedBonusPerLevel = Math.max(1, bonusPerLevel);
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
    if (!backgroundCanvasRef.current) {
        generateGroundTexture();
    }
    const stats = calculateWeaponStats(1);
    playerRef.current = {
      id: 'player', x: 0, y: 0, radius: PLAYER_STATS.radius, color: PLAYER_STATS.color, rotation: 0, markedForDeletion: false, health: PLAYER_STATS.maxHealth, maxHealth: PLAYER_STATS.maxHealth, speed: PLAYER_STATS.moveSpeed, ammo: stats.maxAmmo, maxAmmo: stats.maxAmmo, reloadAbility: PLAYER_STATS.reloadAbility, isReloading: false, reloadTimer: 0, totalReloadTime: 0, score: 0, xp: 0, maxXp: PLAYER_LEVELING_SETTINGS.baseMaxXp, level: 1, stamina: PLAYER_STATS.maxStamina, maxStamina: PLAYER_STATS.maxStamina, isSprinting: false, staminaRechargeDelayTimer: 0, staminaWarningTimer: 0, isDodging: false, dodgeTimer: 0, dodgeDuration: PLAYER_STATS.dodgeDuration, dodgeInvulnerabilityTimer: 0, dodgeDirection: { x: 0, y: 0 }, dodgeScale: 1, recoilOffset: 0, consecutiveShots: 0, currentSpread: 0, movementSpread: 0, renderedCrosshairRadius: 7, currentRotationSpeed: PLAYER_STATS.baseRotationSpeed, baseRotationSpeed: PLAYER_STATS.baseRotationSpeed, maxRotationSpeed: PLAYER_STATS.maxRotationSpeed, rotationAcceleration: PLAYER_STATS.rotationAcceleration, activeTargetAngle: 0, aimQueue: [], quickReloadSweetSpot: 0, quickReloadHitWindowStart: 0, quickReloadHitWindowEnd: 0, quickReloadShakeTimer: 0, isQuickReloadAttempted: false, quickReloadCooldownTimer: 0, isQuickReloadFailed: false, grenadeCooldown: 0, maxGrenadeCooldown: GRENADE_STATS.baseCooldown, grenadeLevel: 1, grenadeXp: 0, grenadeMaxXp: GRENADE_STATS.baseMaxXp,
    };
    zombiesRef.current = []; bulletsRef.current = []; particlesRef.current = []; shellsRef.current = []; floatingTextsRef.current = []; itemsRef.current = []; grenadesRef.current = []; explosionEffectsRef.current = []; waveRef.current = 1; killsRef.current = 0; previousTimeRef.current = null; lastSpawnTimeRef.current = 0; playerDamageAccumulatorRef.current = 0; lastSprintCollideTimeRef.current = 0; screenShakeRef.current = { intensity: 0, duration: 0, startX: 0, startY: 0 };
  }, [calculateWeaponStats]); 

  useEffect(() => {
    if (gameStatus === GameStatus.MENU) {
      initGame();
    }
  }, [gameStatus, initGame]);

  useEffect(() => {
      if (playerRef.current) {
          const stats = calculateWeaponStats(playerRef.current.level);
          const oldMaxAmmo = playerRef.current.maxAmmo;
          playerRef.current.maxAmmo = stats.maxAmmo;
          if (stats.maxAmmo > oldMaxAmmo) {
              playerRef.current.ammo += (stats.maxAmmo - oldMaxAmmo);
          }
      }
  }, [upgradeLevels, calculateWeaponStats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = true; 
      if (e.code === 'KeyG' && (gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.LEVEL_UP)) {
          if (playerRef.current) {
              const player = playerRef.current; 
              player.xp = player.maxXp;
              createFloatingText(player.x, player.y - 50, "CHEAT: LEVEL UP", false, '#22c55e');
              if (player.xp >= player.maxXp) {
                  player.level++;
                  player.xp -= player.maxXp;
                  player.maxXp = Math.floor(player.maxXp * PLAYER_LEVELING_SETTINGS.xpMultiplierPerLevel);
                  setGameStatus(GameStatus.LEVEL_UP);
              }
          }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = false; 
      if (e.code === 'KeyR') reload();
      if (e.code === 'Space') dodge();
      if (e.code === 'KeyQ') throwGrenade();
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    const handleMouseDown = () => { mouseDownRef.current = true; };
    const handleMouseUp = () => { mouseDownRef.current = false; };
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
    if (player.isReloading || player.ammo === player.maxAmmo || player.isDodging || player.isQuickReloadFailed) return;
    player.isReloading = true;
    if (currentWeapon.reloadType !== 'shell') {
        soundService.play('reload');
    }
    const actualReloadTimeMs = currentWeapon.reloadTime / player.reloadAbility;
    player.totalReloadTime = actualReloadTimeMs / 1000;
    player.reloadTimer = 0;
    player.isQuickReloadAttempted = false;
    player.quickReloadShakeTimer = 0;
    player.quickReloadCooldownTimer = 0;
    player.isQuickReloadFailed = false;
    const minTime = currentWeapon.quickReloadMinTimePercent;
    const maxTime = currentWeapon.quickReloadMaxTimePercent;
    const difficulty = currentWeapon.quickReloadDifficultyPercent;
    player.quickReloadSweetSpot = minTime + Math.random() * (maxTime - minTime);
    player.quickReloadHitWindowStart = Math.max(0, player.quickReloadSweetSpot - difficulty / 2);
    player.quickReloadHitWindowEnd = Math.min(1, player.quickReloadSweetSpot + difficulty / 2);
  };

  const createFloatingText = (x: number, y: number, text: string, isCritical: boolean, customColor?: string) => {
    const angle = (Math.random() - 0.5) * 1.5 - Math.PI / 2;
    const speed = FLOATING_TEXT.speed + Math.random() * 50;
    floatingTextsRef.current.push({
      id: 'text-' + Math.random(), x, y, radius: 0, color: customColor || (isCritical ? '#ef4444' : '#facc15'), rotation: 0, markedForDeletion: false, text: text, velocity: { x: Math.cos(angle) * FLOATING_TEXT.randomX, y: -Math.abs(Math.sin(angle) * speed) }, life: FLOATING_TEXT.life, maxLife: FLOATING_TEXT.life, size: isCritical ? 24 : 14, isCritical, scale: FLOATING_TEXT.startScale
    });
  };

  const shoot = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    const player = playerRef.current;
    if (player.isDodging) return;
    if (player.isQuickReloadFailed) return;
    const effectiveStats = calculateWeaponStats(player.level);
    const now = Date.now();
    if (player.quickReloadCooldownTimer > 0) return;

    if (player.isReloading) {
        const reloadProgress = player.reloadTimer / player.totalReloadTime;
        const isQuickReloadWindow = reloadProgress >= GAME_SETTINGS.quickReloadInputMinProgress;
        if (isQuickReloadWindow && !player.isQuickReloadAttempted) {
            player.isQuickReloadAttempted = true;
            if (reloadProgress >= player.quickReloadHitWindowStart && reloadProgress <= player.quickReloadHitWindowEnd) {
                soundService.play('quickReloadSuccess');
                let successText = GAME_TEXT.HUD.QUICK_RELOAD_SUCCESS;
                const bonusAmmo = 2;
                player.quickReloadShakeTimer = 0;
                player.quickReloadCooldownTimer = GAME_SETTINGS.quickReloadPostSuccessCooldown; 
                if (currentWeapon.reloadType === 'shell') {
                    successText += ` +${bonusAmmo}`;
                    player.ammo = Math.min(player.maxAmmo, player.ammo + bonusAmmo);
                    if (player.ammo >= player.maxAmmo) {
                        player.ammo = player.maxAmmo;
                        player.isReloading = false;
                    } else {
                        player.reloadTimer = 0;
                        player.isQuickReloadAttempted = false;
                        const minTime = currentWeapon.quickReloadMinTimePercent;
                        const maxTime = currentWeapon.quickReloadMaxTimePercent;
                        const difficulty = currentWeapon.quickReloadDifficultyPercent;
                        player.quickReloadSweetSpot = minTime + Math.random() * (maxTime - minTime);
                        player.quickReloadHitWindowStart = Math.max(0, player.quickReloadSweetSpot - difficulty / 2);
                        player.quickReloadHitWindowEnd = Math.min(1, player.quickReloadSweetSpot + difficulty / 2);
                    }
                } else {
                    player.ammo = player.maxAmmo; 
                    player.isReloading = false; 
                }
                createFloatingText(player.x, player.y - 60, successText, false, '#22c55e');
                return;
            } else {
                soundService.play('quickReloadFail');
                player.quickReloadShakeTimer = GAME_SETTINGS.quickReloadShakeDuration;
                createFloatingText(player.x, player.y - 60, GAME_TEXT.HUD.QUICK_RELOAD_FAIL, false, '#ef4444');
                if (currentWeapon.reloadType === 'shell') {
                    player.isQuickReloadFailed = true;
                }
                return;
            }
        }
        if (currentWeapon.reloadType === 'shell' && player.ammo > 0) {
            player.isReloading = false;
        } else {
            return; 
        }
    }
    
    if (player.ammo <= 0) {
      if (currentWeapon.reloadMethod === 'manual') {
          if (now - lastShotTimeRef.current > 200) {
              if (onDryFireRef.current) onDryFireRef.current();
              soundService.play('dryFire');
              lastShotTimeRef.current = now;
          }
      } else {
          reload();
      }
      return;
    }

    if (now - lastShotTimeRef.current < effectiveStats.fireRate) return;
    soundService.play(effectiveStats.soundFire as any);
    if (currentWeapon.screenShake) {
      screenShakeRef.current = { intensity: currentWeapon.screenShake.intensity, duration: currentWeapon.screenShake.duration, startX: 0, startY: 0 };
    }
    const firedAmmoIndex = player.ammo;
    player.ammo--;
    if (onShootRef.current) {
        onShootRef.current(firedAmmoIndex);
    }
    player.recoilOffset = Math.min( player.recoilOffset + currentWeapon.gunRecoil, RENDER_SETTINGS.maxVisualRecoil );
    lastShotTimeRef.current = now;
    const angle = player.rotation;
    const gunLength = effectiveStats.gunLength;
    const gunOffset = currentWeapon.gunRightOffset;
    const muzzleX = player.x + (gunLength * Math.cos(angle) - gunOffset * Math.sin(angle));
    const muzzleY = player.y + (gunLength * Math.sin(angle) + gunOffset * Math.cos(angle));
    player.consecutiveShots = Math.min( player.consecutiveShots + 1, effectiveStats.recoilControl );
    const pelletCount = effectiveStats.pelletCount || 1;
    for (let i = 0; i < pelletCount; i++) {
        const spread = (Math.random() - 0.5) * player.currentSpread;
        const isCritical = Math.random() < currentWeapon.criticalChance;
        bulletsRef.current.push({
            id: Math.random().toString(), x: muzzleX, y: muzzleY, radius: currentWeapon.bulletRadius, color: currentWeapon.bulletColor, rotation: angle, markedForDeletion: false, velocity: { x: Math.cos(angle + spread) * currentWeapon.bulletSpeed, y: Math.sin(angle + spread) * currentWeapon.bulletSpeed }, damage: effectiveStats.damage, isCritical: isCritical, distanceTraveled: 0, maxDistance: effectiveStats.maxDistance, knockback: currentWeapon.knockback, slow: currentWeapon.slow, hitCount: 0, ignoredEntityIds: [], penetration: effectiveStats.penetration
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
            id: 'flash-' + Math.random(), x: flashCenterX, y: flashCenterY, radius: Math.random() * 4 + currentWeapon.muzzleFlashSize, color: flashColors[Math.floor(Math.random() * flashColors.length)], rotation: 0, markedForDeletion: false, velocity: { x: Math.cos(flashAngle) * flashSpeed, y: Math.sin(flashAngle) * flashSpeed }, life: flashLife, maxLife: flashLife, alpha: 1, growth: 0
        });
    }
    if (currentWeapon.gunSmoke.enabled) {
      for (let i = 0; i < currentWeapon.gunSmoke.count; i++) {
        const smokeAngle = angle + (Math.random() - 0.5) * 1.0; 
        const smokeSpeed = Math.random() * currentWeapon.gunSmoke.speed;
        particlesRef.current.push({
          id: 'smoke-' + Math.random(), x: muzzleX, y: muzzleY, radius: Math.random() * 3 + 2, color: currentWeapon.gunSmoke.color, rotation: Math.random() * Math.PI * 2, markedForDeletion: false, velocity: { x: Math.cos(smokeAngle) * smokeSpeed, y: Math.sin(smokeAngle) * smokeSpeed }, life: currentWeapon.gunSmoke.life, maxLife: currentWeapon.gunSmoke.life, alpha: 0.5, growth: currentWeapon.gunSmoke.growth 
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
      id: 'shell-' + Math.random(), x: breechX, y: breechY, z: 10, radius: shellConfig.size, color: shellConfig.color, rotation: angle, markedForDeletion: false, velocity: { x: Math.cos(ejectAngle) * ejectSpeed, y: Math.sin(ejectAngle) * ejectSpeed }, vz: shellConfig.verticalVelocity + Math.random() * 50, life: shellConfig.life, maxLife: shellConfig.life
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
      id: Math.random().toString(), x, y, radius: stats.radius, color: stats.color, rotation: 0, markedForDeletion: false, speed, health, maxHealth: health, damage: stats.damage, type, hitTimer: 0, slowTimer: 0, slowFactor: 1.0, xp: stats.xp || 10, knockbackVelocity: { x: 0, y: 0 }, knockbackTimer: 0,
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number, config?: {speed?: number, life?: number, growth?: number}) => {
    const finalConfig = { ...PLAYER_EFFECTS.default, ...config };
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (finalConfig.speed) * (0.5 + Math.random());
      particlesRef.current.push({
        id: Math.random().toString(), x, y, radius: Math.random() * 2 + 1, color, rotation: 0, markedForDeletion: false, velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }, life: finalConfig.life, maxLife: finalConfig.life, alpha: 1, growth: finalConfig.growth,
      });
    }
  };

  const createHealingParticles = (x: number, y: number) => {
    const count = 15;
    const radius = playerRef.current.radius + 15;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spawnX = x + Math.cos(angle) * radius;
        const spawnY = y + Math.sin(angle) * radius;
        const tangentialAngle = angle + Math.PI / 2;
        const speed = 40 + Math.random() * 20;
        particlesRef.current.push({
            id: 'heal-' + Math.random(), x: spawnX, y: spawnY, radius: Math.random() * 2 + 1.5, color: '#22c55e', rotation: 0, markedForDeletion: false, velocity: { x: Math.cos(tangentialAngle) * speed, y: Math.sin(tangentialAngle) * speed }, life: 0.6 + Math.random() * 0.3, maxLife: 1.0, alpha: 1, growth: -2
        });
    }
  };

  const createSprayParticles = (x: number, y: number, color: string, count: number, baseAngle: number, spread: number) => {
      for (let i = 0; i < count; i++) {
          const angle = baseAngle + (Math.random() - 0.5) * spread;
          const speed = GAME_SETTINGS.particleSpeed * (1.5 + Math.random() * 2.0); 
          const life = 0.5 + Math.random() * 0.5;
          particlesRef.current.push({
              id: 'spray-' + Math.random(), x, y, radius: Math.random() * 3 + 1, color, rotation: angle, markedForDeletion: false, velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }, life: life, maxLife: life, alpha: 1, growth: -2
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

  const update = useCallback((deltaTime: number) => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    const player = playerRef.current;
    const now = Date.now();
    const effectiveStats = calculateWeaponStats(player.level);

    let dx = 0; let dy = 0;
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) dy -= 1;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) dy += 1;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) dx -= 1;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) dx += 1;
    let isMoving = dx !== 0 || dy !== 0;

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
        const effect = PLAYER_EFFECTS.dodgeLand;
        createParticles(player.x, player.y, effect.color, effect.count, { speed: effect.speed, life: effect.life, growth: effect.growth });
        zombiesRef.current.forEach(z => {
          const dist = Math.hypot(player.x - z.x, player.y - z.y);
          if (dist < PLAYER_STATS.dodgeLandKnockbackRadius) {
            z.health -= PLAYER_STATS.dodgeLandDamage;
            createFloatingText(z.x, z.y, Math.floor(PLAYER_STATS.dodgeLandDamage).toString(), false, '#f59e0b');
            const angle = Math.atan2(z.y - player.y, z.x - player.x);
            const knockbackDuration = PLAYER_STATS.dodgeLandKnockbackDuration;
            if (knockbackDuration > 0) {
              const knockbackSpeed = PLAYER_STATS.dodgeLandKnockback / knockbackDuration;
              z.knockbackVelocity = { x: Math.cos(angle) * knockbackSpeed, y: Math.sin(angle) * knockbackSpeed };
              z.knockbackTimer = knockbackDuration;
            }
          }
        });
      }
    }

    if (player.staminaWarningTimer > 0) { player.staminaWarningTimer -= deltaTime; }
    if (player.grenadeCooldown > 0) { player.grenadeCooldown -= deltaTime; if (player.grenadeCooldown < 0) player.grenadeCooldown = 0; }

    const isSprintingInput = (keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight']) && isMoving && !player.isReloading && !player.isDodging;
    if (isSprintingInput && player.stamina <= 0) {
        if (player.staminaWarningTimer <= 0) {
            player.staminaWarningTimer = 0.3;
            soundService.play('staminaEmpty');
        }
    }
    player.isSprinting = isSprintingInput && player.stamina > 0;
    if (player.isSprinting) {
      player.stamina = Math.max(0, player.stamina - PLAYER_STATS.sprintStaminaCost * deltaTime);
      player.staminaRechargeDelayTimer = PLAYER_STATS.staminaRechargeDelay;
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

    let currentSpeed = player.speed;
    if (player.isSprinting) { currentSpeed *= PLAYER_STATS.sprintSpeedMultiplier; }
    if (isMoving && !player.isDodging) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length; dy /= length;
      player.x += dx * currentSpeed * deltaTime;
      player.y += dy * currentSpeed * deltaTime;
    }

    if (mouseDownRef.current) { shoot(); }
    if (player.quickReloadShakeTimer > 0) { player.quickReloadShakeTimer -= deltaTime; if (player.quickReloadShakeTimer < 0) { player.quickReloadShakeTimer = 0; } }
    if (player.quickReloadCooldownTimer > 0) { player.quickReloadCooldownTimer -= deltaTime; if (player.quickReloadCooldownTimer < 0) { player.quickReloadCooldownTimer = 0; } }
    
    const isTryingToShoot = mouseDownRef.current;
    const canActuallyShoot = !player.isReloading && player.ammo > 0 && !player.isDodging;
    if ((!isTryingToShoot || !canActuallyShoot) && player.consecutiveShots > 0) {
      if (now - lastShotTimeRef.current > effectiveStats.recoilResetTime) {
        const recoveryRate = 10 * (effectiveStats.recoilRecovery / 50);
        player.consecutiveShots -= recoveryRate * deltaTime;
        if (player.consecutiveShots < 0) { player.consecutiveShots = 0; }
      }
    }
    const stability = effectiveStats.movementStability;
    const maxMoveSpread = effectiveStats.maxSpreadMoving;
    if (isMoving && !player.isDodging) {
        const increaseRate = (stability > 0) ? (maxMoveSpread / stability) : maxMoveSpread;
        player.movementSpread += increaseRate * deltaTime;
        if (player.movementSpread > maxMoveSpread) { player.movementSpread = maxMoveSpread; }
    } else {
        const decreaseRate = (stability > 0) ? (maxMoveSpread / (stability / 2)) : maxMoveSpread;
        player.movementSpread -= decreaseRate * deltaTime;
        if (player.movementSpread < 0) { player.movementSpread = 0; }
    }
    const recoilRatio = Math.min(player.consecutiveShots / effectiveStats.recoilControl, 1.0);
    const recoilSpread = currentWeapon.minSpread + (currentWeapon.maxSpread - currentWeapon.minSpread) * recoilRatio;
    player.currentSpread = recoilSpread + player.movementSpread;
    const baseRadius = 7; 
    const spreadMultiplier = 80;
    const targetRadius = baseRadius + player.currentSpread * spreadMultiplier;
    const isExpanding = targetRadius > player.renderedCrosshairRadius;
    const expandLerpSpeed = 40.0;
    const recoverLerpSpeed = 8.0;
    const lerpSpeed = isExpanding ? expandLerpSpeed : recoverLerpSpeed;
    player.renderedCrosshairRadius += (targetRadius - player.renderedCrosshairRadius) * lerpSpeed * deltaTime;
    if (player.recoilOffset > 0) { player.recoilOffset -= RENDER_SETTINGS.visualRecoilRecoverySpeed * deltaTime; if (player.recoilOffset < 0) player.recoilOffset = 0; }
    if (screenShakeRef.current.duration > 0) { screenShakeRef.current.duration -= deltaTime; }

    if (player.isReloading) {
        player.reloadTimer += deltaTime;
        if (currentWeapon.reloadType === 'shell') {
            if (player.reloadTimer >= player.totalReloadTime) {
                player.isQuickReloadFailed = false;
                player.ammo++;
                soundService.play('shellLoad');
                player.reloadTimer = 0;
                if (player.ammo >= player.maxAmmo) {
                    player.ammo = player.maxAmmo;
                    player.isReloading = false;
                } else {
                    player.isQuickReloadAttempted = false;
                    const minTime = currentWeapon.quickReloadMinTimePercent;
                    const maxTime = currentWeapon.quickReloadMaxTimePercent;
                    const difficulty = currentWeapon.quickReloadDifficultyPercent;
                    player.quickReloadSweetSpot = minTime + Math.random() * (maxTime - minTime);
                    player.quickReloadHitWindowStart = Math.max(0, player.quickReloadSweetSpot - difficulty / 2);
                    player.quickReloadHitWindowEnd = Math.min(1, player.quickReloadSweetSpot + difficulty / 2);
                }
            }
        } else {
            if (player.reloadTimer >= player.totalReloadTime) {
                player.ammo = player.maxAmmo;
                player.isReloading = false;
            }
        }
    }

    if (isMoving && !player.isDodging && now - lastFootstepTimeRef.current > SOUND_SETTINGS.footstepInterval) {
      soundService.play('footstep');
      lastFootstepTimeRef.current = now;
    }

    const zoom = effectiveStats.zoom;
    const centerX = width / 2; const centerY = height / 2;
    const verticalOffset = height * 0.1;
    const cameraWorldY = player.y + verticalOffset;
    const mouseScreenX = mouseRef.current.x; const mouseScreenY = mouseRef.current.y;
    const mouseWorldX = player.x + (mouseScreenX - centerX) / zoom;
    const mouseWorldY = cameraWorldY + (mouseScreenY - centerY) / zoom;
    let rawTargetAngle = Math.atan2(mouseWorldY - player.y, mouseWorldX - player.x);
    const dist = Math.hypot(mouseWorldX - player.x, mouseWorldY - player.y);
    const gunOffset = currentWeapon.gunRightOffset;
    if (dist > gunOffset) {
        const offsetAngle = Math.asin(gunOffset / dist);
        rawTargetAngle -= offsetAngle;
    }
    player.aimQueue.push({ time: now, angle: rawTargetAngle });
    const delayMs = effectiveStats.aimDelay * 1000;
    while (player.aimQueue.length > 0 && now - player.aimQueue[0].time >= delayMs) {
        player.activeTargetAngle = player.aimQueue[0].angle;
        player.aimQueue.shift();
    }
    if (player.aimQueue.length === 0) { player.activeTargetAngle = rawTargetAngle; }
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
        if (player.currentRotationSpeed > player.maxRotationSpeed) { player.currentRotationSpeed = player.maxRotationSpeed; }
        const rotateStep = player.currentRotationSpeed * deltaTime;
        if (Math.abs(diff) <= rotateStep) {
            player.rotation = player.activeTargetAngle;
            player.currentRotationSpeed = player.baseRotationSpeed;
        } else {
            player.rotation += Math.sign(diff) * rotateStep;
        }
    }

    bulletsRef.current.forEach(b => {
      const moveX = b.velocity.x * deltaTime; const moveY = b.velocity.y * deltaTime;
      b.x += moveX; b.y += moveY;
      b.distanceTraveled += Math.sqrt(moveX * moveX + moveY * moveY);
      if (b.distanceTraveled > b.maxDistance) { b.markedForDeletion = true; }
    });

    grenadesRef.current.forEach(g => {
        if (g.state === 'flying') {
            g.x += g.velocity.x * deltaTime; g.y += g.velocity.y * deltaTime;
            g.vz -= GRENADE_STATS.gravity * deltaTime; g.z += g.vz * deltaTime;
            g.rotation += 5 * deltaTime;
            if (g.z <= 0) {
                g.z = 0;
                g.vz = -g.vz * GRENADE_STATS.bounciness;
                g.velocity.x *= GRENADE_STATS.friction * 1.5;
                g.velocity.y *= GRENADE_STATS.friction * 1.5;
                if (Math.abs(g.vz) < 40) {
                    g.state = 'rolling';
                    g.life = GRENADE_STATS.rollDuration;
                }
            }
        } else if (g.state === 'rolling') {
            g.velocity.x *= GRENADE_STATS.friction; g.velocity.y *= GRENADE_STATS.friction;
            g.x += g.velocity.x * deltaTime; g.y += g.velocity.y * deltaTime;
            g.rotation += (g.velocity.x / 100) * deltaTime;
            g.life -= deltaTime;
            if (g.life <= 0) {
                g.markedForDeletion = true;
                soundService.play('grenadeExplode');
                screenShakeRef.current = { intensity: GRENADE_STATS.screenShakeIntensity, duration: GRENADE_STATS.screenShakeDuration, startX: 0, startY: 0 };
                
                const rings = Array.from({ length: GRENADE_STATS.shockwave.count }, (_, i) => ({
                    radius: 0,
                    maxRadius: g.stats.radius * (0.5 + i * 0.5),
                    startDelay: i * 0.05,
                    width: g.stats.radius * 0.1,
                }));
                explosionEffectsRef.current.push({
                    id: 'explosion-' + g.id, x: g.x, y: g.y, life: GRENADE_STATS.explosionDuration, maxLife: GRENADE_STATS.explosionDuration, rings: rings, color: GRENADE_STATS.shockwave.color, radius: 0, rotation: 0, markedForDeletion: false,
                });

                createParticles(g.x, g.y, '#f97316', GRENADE_STATS.explosionParticleCount, { speed: 400, life: GRENADE_STATS.explosionDuration * 1.2, growth: -100 });
                createParticles(g.x, g.y, '#fef08a', 20, { speed: 200, life: GRENADE_STATS.explosionDuration, growth: -50 });

                zombiesRef.current.forEach(z => {
                    const dist = Math.hypot(g.x - z.x, g.y - z.y);
                    if (dist < g.stats.radius + z.radius) {
                        const wasAlive = z.health > 0;
                        z.health -= g.stats.damage;
                        createFloatingText(z.x, z.y, Math.floor(g.stats.damage).toString(), false, '#f97316');

                        const angle = Math.atan2(z.y - g.y, z.x - g.x);
                        const knockbackDuration = GRENADE_STATS.knockbackDuration;
                        if (knockbackDuration > 0) {
                            const knockbackSpeed = g.stats.knockback / knockbackDuration;
                            z.knockbackVelocity.x = Math.cos(angle) * knockbackSpeed;
                            z.knockbackVelocity.y = Math.sin(angle) * knockbackSpeed;
                            z.knockbackTimer = knockbackDuration;
                        }
                        
                        // [BUG FIX] 수류탄으로 좀비가 죽었을 때, 중앙 집중식 사망 처리 함수를 호출합니다.
                        if (wasAlive && z.health <= 0) {
                            processZombieKill(z); // 좀비 사망 처리
                            
                            // 사망 파티클 생성 (폭발 중심으로부터 튕겨나가는 방향)
                            createSprayParticles(z.x, z.y, '#84cc16', 15, angle, 2.0);
                            createParticles(z.x, z.y, '#84cc16', 5);

                            // 수류탄 경험치 획득 로직
                            player.grenadeXp += GRENADE_STATS.xpPerKill;
                            if (player.grenadeXp >= player.grenadeMaxXp) {
                                player.grenadeLevel++;
                                player.grenadeXp -= player.grenadeMaxXp;
                                player.grenadeMaxXp = Math.floor(player.grenadeMaxXp * GRENADE_STATS.xpMultiplierPerLevel);
                                player.maxGrenadeCooldown = Math.max(1.0, GRENADE_STATS.baseCooldown - (player.grenadeLevel - 1) * GRENADE_STATS.cooldownReductionPerLevel);
                                createFloatingText(player.x, player.y - 70, `수류탄 레벨 업! (Lv.${player.grenadeLevel})`, false, '#67e8f9');
                            }
                        }
                    }
                });
            }
        }
    });

    explosionEffectsRef.current.forEach(effect => {
        effect.life -= deltaTime;
        if (effect.life <= 0) {
            effect.markedForDeletion = true;
            return;
        }
        const totalProgress = 1 - (effect.life / effect.maxLife);
        effect.rings.forEach(ring => {
            if (totalProgress > ring.startDelay) {
                const ringProgress = (totalProgress - ring.startDelay) / (1 - ring.startDelay);
                ring.radius = ring.maxRadius * ringProgress;
            }
        });
    });

    const shellConfig = currentWeapon.shellEjection;
    shellsRef.current.forEach(s => {
        s.x += s.velocity.x * deltaTime; s.y += s.velocity.y * deltaTime;
        s.vz -= shellConfig.gravity * deltaTime; s.z += s.vz * deltaTime;
        if (s.z <= 0) {
            s.z = 0;
            s.vz = -s.vz * shellConfig.bounciness; 
            s.velocity.x *= 0.7; s.velocity.y *= 0.7;
            if (Math.abs(s.vz) < 20) s.vz = 0;
        }
        if (s.z > 0) { s.rotation += 10 * deltaTime; }
        s.life -= deltaTime;
        if (s.life <= 0) s.markedForDeletion = true;
    });

    floatingTextsRef.current.forEach(ft => {
      ft.velocity.y += FLOATING_TEXT.gravity * deltaTime;
      ft.x += ft.velocity.x * deltaTime; ft.y += ft.velocity.y * deltaTime;
      ft.life -= deltaTime;
      if (ft.life <= 0) ft.markedForDeletion = true;
      if (ft.scale < FLOATING_TEXT.maxScale) { ft.scale += 8.0 * deltaTime; if (ft.scale > FLOATING_TEXT.maxScale) ft.scale = FLOATING_TEXT.maxScale; }
    });

    itemsRef.current.forEach(item => {
        const itemConfig = ITEMS_CONFIG[item.itemType];
        if (!itemConfig) { item.markedForDeletion = true; return; }
        const phys = itemConfig.physics;
        item.x += item.velocity.x * deltaTime; item.y += item.velocity.y * deltaTime;
        item.vz -= phys.gravity * deltaTime; item.z += item.vz * deltaTime;
        if (item.z <= 0) {
            item.z = 0;
            item.vz = -item.vz * phys.bounciness;
            item.velocity.x *= 0.8; item.velocity.y *= 0.8;
            item.rotationSpeed *= 0.8;
            if (Math.abs(item.vz) < 20) item.vz = 0;
        }
        if (item.z > 0) { item.rotation += item.rotationSpeed * deltaTime; }
        item.life -= deltaTime;
        if (item.life <= 0) item.markedForDeletion = true;
        const dist = Math.hypot(player.x - item.x, player.y - item.y);
        if (dist < player.radius + itemConfig.pickupRadius) {
            item.markedForDeletion = true;
            soundService.play('itemPickup');
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

    const spawnRate = Math.max( ZOMBIE_STATS.minSpawnRate, ZOMBIE_STATS.spawnRate - (waveRef.current * 50) );
    if (now - lastSpawnTimeRef.current > spawnRate) {
      spawnZombie(width, height);
      lastSpawnTimeRef.current = now;
    }

    let sprintCollidedThisFrame = false;
    zombiesRef.current.forEach(z => {
      if (z.hitTimer > 0) z.hitTimer -= deltaTime;
      if (z.slowTimer > 0) z.slowTimer -= deltaTime;
      if (z.knockbackTimer > 0) {
        z.x += z.knockbackVelocity.x * deltaTime;
        z.y += z.knockbackVelocity.y * deltaTime;
        z.knockbackVelocity.x *= 0.9;
        z.knockbackVelocity.y *= 0.9;
        z.knockbackTimer -= deltaTime;
        if (z.knockbackTimer <= 0) { z.knockbackVelocity = { x: 0, y: 0 }; }
      } else {
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.rotation = angle;
        let currentSpeed = z.speed;
        if (z.slowTimer > 0) currentSpeed *= z.slowFactor;
        const moveAmount = currentSpeed * deltaTime;
        z.x += Math.cos(angle) * moveAmount;
        z.y += Math.sin(angle) * moveAmount;
      }

      const distToPlayer = Math.hypot(player.x - z.x, player.y - z.y);
      const dodgeProgressTime = PLAYER_STATS.dodgeDuration - player.dodgeTimer;
      const isInvulnerable = player.isDodging && dodgeProgressTime > PLAYER_STATS.dodgeInvulnerabilityStartTime && dodgeProgressTime < (PLAYER_STATS.dodgeInvulnerabilityStartTime + PLAYER_STATS.dodgeInvulnerabilityDuration);
      if (distToPlayer < player.radius + z.radius && !isInvulnerable) {
        if(player.isSprinting) {
            const knockbackAngle = Math.atan2(z.y - player.y, z.x - player.x);
            z.x += Math.cos(knockbackAngle) * PLAYER_STATS.sprintKnockback;
            z.y += Math.sin(knockbackAngle) * PLAYER_STATS.sprintKnockback;
            sprintCollidedThisFrame = true;
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
        if (b.markedForDeletion || b.ignoredEntityIds.includes(z.id)) return;
        const distToBullet = Math.hypot(b.x - z.x, b.y - z.y);
        if (distToBullet < z.radius + b.radius) {
          const wasAlive = z.health > 0;
          const penetrationPenalty = b.damage * b.penetration.damageDrop * b.hitCount;
          let baseDamage = Math.max(0, b.damage - penetrationPenalty); 
          const finalDamage = baseDamage * (b.isCritical ? currentWeapon.criticalMultiplier : 1.0);
          z.health -= finalDamage;
          z.hitTimer = 0.1; 
          b.ignoredEntityIds.push(z.id);
          b.hitCount++;
          if (b.hitCount >= b.penetration.count) {
            if (!(b.hitCount === b.penetration.count && Math.random() < b.penetration.chance)) {
              b.markedForDeletion = true;
            }
          }
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
              id: 'flash-' + Math.random(), x: b.x, y: b.y, radius: 6, color: '#ffffff', rotation: 0, markedForDeletion: false, velocity: { x: 0, y: 0 }, life: 0.05, maxLife: 0.05, alpha: 1
          });

          // [BUG FIX] 총알로 좀비가 죽었을 때, 중앙 집중식 사망 처리 함수를 호출합니다.
          if (wasAlive && z.health <= 0) {
            processZombieKill(z);
            createSprayParticles(z.x, z.y, '#84cc16', 15, bulletAngle, 2.0);
            createParticles(z.x, z.y, '#84cc16', 5);
          }
        }
      });
    });

    if (sprintCollidedThisFrame && now - lastSprintCollideTimeRef.current > SOUND_SETTINGS.sprintCollideCooldown) {
      soundService.play('sprintCollide');
      lastSprintCollideTimeRef.current = now;
    }

    particlesRef.current.forEach(p => {
      p.x += p.velocity.x * deltaTime; p.y += p.velocity.y * deltaTime;
      if (p.growth) { p.radius += p.growth * deltaTime; }
      p.life -= GAME_SETTINGS.particleLifeDecay * deltaTime;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0 || (p.growth && p.radius <= 0)) p.markedForDeletion = true;
    });

    const cleanupRadius = Math.max(width, height) * 2;
    zombiesRef.current = zombiesRef.current.filter(z => !z.markedForDeletion && Math.hypot(player.x - z.x, player.y - z.y) < cleanupRadius);
    bulletsRef.current = bulletsRef.current.filter(b => !b.markedForDeletion);
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);
    shellsRef.current = shellsRef.current.filter(s => !s.markedForDeletion);
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => !ft.markedForDeletion);
    itemsRef.current = itemsRef.current.filter(i => !i.markedForDeletion);
    grenadesRef.current = grenadesRef.current.filter(g => !g.markedForDeletion);
    explosionEffectsRef.current = explosionEffectsRef.current.filter(e => !e.markedForDeletion);

    onUpdateStats({
      health: player.health, ammo: player.ammo, maxAmmo: player.maxAmmo, score: player.score, wave: waveRef.current, xp: player.xp, maxXp: player.maxXp, level: player.level, stamina: player.stamina, maxStamina: player.maxStamina, grenadeCooldown: player.grenadeCooldown, maxGrenadeCooldown: player.maxGrenadeCooldown,
    });
  }, [calculateWeaponStats, onGameOver, onUpdateStats, processZombieKill]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    const player = playerRef.current;
    const stats = calculateWeaponStats(player.level);
    const zoom = stats.zoom;
    let shakeX = 0; let shakeY = 0;
    if (screenShakeRef.current.duration > 0) {
        const intensity = screenShakeRef.current.intensity;
        shakeX = (Math.random() - 0.5) * intensity * 2;
        shakeY = (Math.random() - 0.5) * intensity * 2;
    }
    const verticalOffset = height * 0.1;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(shakeX, shakeY);
    ctx.translate(-player.x, -(player.y + verticalOffset));
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    const startX = Math.floor(viewL / gridSize) * gridSize;
    const startY = Math.floor(viewT / gridSize) * gridSize;
    const endX = startX + viewW + gridSize;
    const endY = startY + viewH + gridSize;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
    for (let y = startY; y <= endY; y += gridSize) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
    ctx.stroke();

    shellsRef.current.forEach(s => {
        if (s.z > 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.5, s.rotation, 0, Math.PI * 2);
            ctx.fill();
        }
        const renderY = s.y - s.z;
        ctx.save(); ctx.translate(s.x, renderY); ctx.rotate(s.rotation);
        ctx.fillStyle = s.color;
        ctx.fillRect(-s.radius, -s.radius/2, s.radius * 2, s.radius);
        ctx.restore();
    });

    grenadesRef.current.forEach(g => {
        const shadowRatio = Math.min(g.z / 100, 1.0);
        const shadowRadius = g.radius * RENDER_SETTINGS.shadowScale * (1 - shadowRatio * 0.4);
        const shadowAlpha = 0.35 * (1 - shadowRatio * 0.6);
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(g.x + RENDER_SETTINGS.shadowOffset.x, g.y + RENDER_SETTINGS.shadowOffset.y, shadowRadius, shadowRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save(); ctx.translate(g.x, g.y - g.z); ctx.rotate(g.rotation);
        ctx.fillStyle = g.color; ctx.beginPath(); ctx.arc(0, 0, g.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27272a'; ctx.fillRect(-2, -g.radius - 2, 4, 4);
        ctx.restore();
    });

    itemsRef.current.forEach(item => {
        const itemConfig = ITEMS_CONFIG[item.itemType]; if (!itemConfig) return;
        const maxShadowHeight = 150;
        const shadowRatio = Math.min(item.z / maxShadowHeight, 1.0);
        const baseRadiusX = item.radius * RENDER_SETTINGS.shadowScale;
        const baseRadiusY = baseRadiusX * 0.5;
        const shadowRadiusX = baseRadiusX * (1 - shadowRatio * 0.4);
        const shadowRadiusY = baseRadiusY * (1 - shadowRatio * 0.4);
        const shadowAlpha = 0.35 * (1 - shadowRatio * 0.6);
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(item.x + RENDER_SETTINGS.shadowOffset.x, item.y + RENDER_SETTINGS.shadowOffset.y, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        itemConfig.draw(ctx, item);
    });

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    
    explosionEffectsRef.current.forEach(effect => {
        const totalProgress = 1 - (effect.life / effect.maxLife);
        // [FIX] 폭발이 끝날 때까지 투명도를 유지하여 가시성 확보
        const overallAlpha = Math.sin((1 - totalProgress) * Math.PI);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        effect.rings.forEach(ring => {
            if (ring.radius > 0) {
                const ringProgress = ring.radius / ring.maxRadius;
                // [FIX] 개별 링의 투명도 계산 수정: 링이 퍼져나가는 동안 투명도를 높게 유지
                const ringAlpha = Math.sin(ringProgress * Math.PI) * overallAlpha;
                
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = Math.max(1, ring.width * (1 - ringProgress));
                ctx.globalAlpha = ringAlpha;

                ctx.beginPath();
                ctx.arc(effect.x, effect.y, ring.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        ctx.restore();
    });

    zombiesRef.current.forEach(z => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.beginPath();
      ctx.ellipse( z.x + RENDER_SETTINGS.shadowOffset.x, z.y + RENDER_SETTINGS.shadowOffset.y, z.radius * RENDER_SETTINGS.shadowScale, z.radius * RENDER_SETTINGS.shadowScale * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.rotation);
      ctx.fillStyle = z.color;
      if (z.slowTimer > 0) { ctx.shadowBlur = 5; ctx.shadowColor = '#3b82f6'; }
      ctx.beginPath(); ctx.arc(0, 0, z.radius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (z.hitTimer > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, z.radius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = z.color; ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(5, 5); ctx.lineTo(15, 8); ctx.moveTo(5, -5); ctx.lineTo(15, -8);
      ctx.stroke();
      ctx.fillStyle = '#fef08a'; ctx.beginPath();
      ctx.arc(4, -3, 2, 0, Math.PI * 2); ctx.arc(4, 3, 2, 0, Math.PI * 2);
      ctx.fill();
      if (z.type === 'tank') {
        ctx.fillStyle = 'red'; ctx.fillRect(-10, -z.radius - 10, 20, 4);
        ctx.fillStyle = '#00ff00'; ctx.fillRect(-10, -z.radius - 10, 20 * (z.health / z.maxHealth), 4);
      }
      ctx.restore();
    });

    bulletsRef.current.forEach(b => {
      ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      const maxTrailLength = speed * 0.1;
      const currentTrailLength = Math.min(b.distanceTraveled, maxTrailLength);
      if (currentTrailLength > 0) {
        const dirX = -(b.velocity.x / speed); const dirY = -(b.velocity.y / speed);
        const tailX = b.x + dirX * currentTrailLength; const tailY = b.y + dirY * currentTrailLength;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(b.x, b.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      }
    });
    
    if (currentWeapon.laserSight && currentWeapon.laserSight.enabled) {
        const gunLengthWithoutRecoil = stats.gunLength;
        const gunOffset = currentWeapon.gunRightOffset;
        const muzzleX = player.x + (gunLengthWithoutRecoil * Math.cos(player.rotation) - gunOffset * Math.sin(player.rotation));
        const muzzleY = player.y + (gunLengthWithoutRecoil * Math.sin(player.rotation) + gunOffset * Math.cos(player.rotation));
        const range = stats.maxDistance;
        const endX = muzzleX + Math.cos(player.rotation) * range;
        const endY = muzzleY + Math.sin(player.rotation) * range;
        let closestT = 1.0;
        zombiesRef.current.forEach(z => {
            const t = getLineCircleIntersection({x: muzzleX, y: muzzleY}, {x: endX, y: endY}, z);
            if (t !== null && t < closestT) { closestT = t; }
        });
        const laserEndX = muzzleX + (endX - muzzleX) * closestT;
        const laserEndY = muzzleY + (endY - muzzleY) * closestT;
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = currentWeapon.laserSight.color;
        ctx.lineWidth = currentWeapon.laserSight.width; ctx.shadowBlur = 4; ctx.shadowColor = currentWeapon.laserSight.color;
        ctx.beginPath(); ctx.moveTo(muzzleX, muzzleY); ctx.lineTo(laserEndX, laserEndY); ctx.stroke();
        ctx.fillStyle = currentWeapon.laserSight.dotColor || '#ff0000'; ctx.beginPath(); ctx.arc(laserEndX, laserEndY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / FLOATING_TEXT.life); ctx.translate(ft.x, ft.y); ctx.scale(ft.scale, ft.scale);
      ctx.font = `bold ${ft.size}px "Do Hyeon", sans-serif`; ctx.fillStyle = ft.color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.lineWidth = 2; ctx.strokeStyle = 'black';
      ctx.strokeText(ft.text, 0, 0); ctx.fillText(ft.text, 0, 0);
      if (ft.isCritical) {
          ctx.font = `bold ${ft.size * 0.5}px "Do Hyeon", sans-serif`;
          ctx.fillText("CRIT!", 0, -ft.size);
      }
      ctx.restore();
    });

    const p = playerRef.current;
    const shadowScale = p.dodgeScale * RENDER_SETTINGS.shadowScale;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.beginPath();
    ctx.ellipse( p.x + RENDER_SETTINGS.shadowOffset.x, p.y + RENDER_SETTINGS.shadowOffset.y, p.radius * shadowScale, p.radius * shadowScale * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save(); ctx.translate(p.x, p.y);
    if (p.isDodging) {
      const dodgeProgress = 1 - (p.dodgeTimer / PLAYER_STATS.dodgeDuration);
      const jumpHeight = 15 * Math.sin(dodgeProgress * Math.PI);
      ctx.translate(0, -jumpHeight);
    }
    ctx.rotate(p.rotation); ctx.scale(p.dodgeScale, p.dodgeScale);
    ctx.fillStyle = p.color; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, 8, 6, 0, Math.PI * 2); ctx.arc(0, -8, 6, 0, Math.PI * 2); ctx.fill();
    const gunRecoilX = -p.recoilOffset;
    const gunRightOffset = currentWeapon.gunRightOffset;
    const renderConfig = currentWeapon.render;
    if (renderConfig) {
        for (const partName in renderConfig) {
            const part = renderConfig[partName as keyof typeof renderConfig];
            const partX = gunRecoilX + (part.offsetX || 0);
            const partY = gunRightOffset + (part.offsetY || 0) - (part.width / 2); 
            ctx.fillStyle = part.color; ctx.fillRect(partX, partY, part.length, part.width);
        }
    }
    ctx.fillStyle = '#C8A484'; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.ellipse(-8, -5, 12, 3.5, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f9a8d4'; ctx.beginPath(); ctx.ellipse(-8, -5, 9, 1.5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8A484'; ctx.beginPath(); ctx.ellipse(-8, 5, 12, 3.5, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f9a8d4'; ctx.beginPath(); ctx.ellipse(-8, 5, 9, 1.5, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C8A484'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(5, -3.5, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 3.5, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    const gaugeCfg = PLAYER_UI_SETTINGS.staminaGauge;
    let shakeOffsetX = 0; let shakeOffsetY = 0;
    const isStaminaWarning = p.staminaWarningTimer > 0;
    if (isStaminaWarning) {
        const shakeIntensity = 3;
        shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
        shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;
    }
    const gaugeX = p.x + gaugeCfg.offsetX + shakeOffsetX; const gaugeY = p.y + gaugeCfg.offsetY + shakeOffsetY;
    const numSegments = Math.ceil(p.maxStamina / gaugeCfg.staminaPerSegment);
    const filledSegments = Math.floor(p.stamina / gaugeCfg.staminaPerSegment);
    const partialSegmentFill = (p.stamina % gaugeCfg.staminaPerSegment) / gaugeCfg.staminaPerSegment;
    ctx.save(); ctx.translate(gaugeX, gaugeY); ctx.lineWidth = gaugeCfg.lineWidth;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, gaugeCfg.radius, 0, Math.PI * 2); ctx.stroke();
    const gaugeColor = isStaminaWarning ? '#ef4444' : 'rgba(251, 191, 36, 1)';
    for(let i = 0; i < filledSegments; i++) {
        ctx.strokeStyle = gaugeColor;
        const startAngle = (i / numSegments) * Math.PI * 2 - Math.PI / 2;
        const endAngle = ((i + 1) / numSegments) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.arc(0, 0, gaugeCfg.radius, startAngle, endAngle); ctx.stroke();
    }
    if (partialSegmentFill > 0 && filledSegments < numSegments) {
        ctx.strokeStyle = gaugeColor;
        const startAngle = (filledSegments / numSegments) * Math.PI * 2 - Math.PI / 2;
        const endAngle = startAngle + (partialSegmentFill / numSegments) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(0, 0, gaugeCfg.radius, startAngle, endAngle); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'; ctx.lineWidth = 1;
    for(let i = 1; i <= numSegments; i++) {
        const angle = (i / numSegments) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (gaugeCfg.radius - gaugeCfg.lineWidth / 2), Math.sin(angle) * (gaugeCfg.radius - gaugeCfg.lineWidth / 2));
        ctx.lineTo(Math.cos(angle) * (gaugeCfg.radius + gaugeCfg.lineWidth / 2), Math.sin(angle) * (gaugeCfg.radius + gaugeCfg.lineWidth / 2));
        ctx.stroke();
    }
    ctx.restore();

    if (p.isReloading) {
        const scale = RENDER_SETTINGS.reloadUIScale;
        const barWidth = RENDER_SETTINGS.reloadUIBaseWidth * scale;
        const barHeight = RENDER_SETTINGS.reloadUIBaseHeight * scale;
        const yOffset = RENDER_SETTINGS.reloadUIBaseYOffset * scale;
        const arrowBaseSize = RENDER_SETTINGS.quickReloadArrowBaseSize * scale;
        const textFontSize = RENDER_SETTINGS.quickReloadTextBaseSize * scale;
        const reloadProgress = Math.min(p.reloadTimer / p.totalReloadTime, 1.0);
        let shakeOffsetX = 0; let shakeOffsetY = 0;
        if (p.quickReloadShakeTimer > 0) {
            const shakeIntensity = 2 * scale;
            shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
            shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;
        }
        ctx.fillStyle = '#1f2937'; 
        ctx.fillRect(p.x - barWidth / 2 + shakeOffsetX, p.y + yOffset + shakeOffsetY, barWidth, barHeight);
        const hitWindowStartPx = (p.x - barWidth / 2) + (barWidth * p.quickReloadHitWindowStart);
        const hitWindowEndPx = (p.x - barWidth / 2) + (barWidth * p.quickReloadHitWindowEnd);
        const hitWindowWidthPx = hitWindowEndPx - hitWindowStartPx;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(hitWindowStartPx + shakeOffsetX, p.y + yOffset + shakeOffsetY, hitWindowWidthPx, barHeight);
        ctx.fillStyle = p.isQuickReloadFailed ? '#6b7280' : '#eab308'; 
        ctx.fillRect(p.x - barWidth / 2 + (1 * scale) + shakeOffsetX, p.y + yOffset + (1 * scale) + shakeOffsetY, (barWidth - (2 * scale)) * reloadProgress, barHeight - (2 * scale));
        const arrowX = (p.x - barWidth / 2) + (barWidth * p.quickReloadSweetSpot) + shakeOffsetX;
        const arrowY = p.y + yOffset + barHeight + (2 * scale) + shakeOffsetY;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowBaseSize, arrowY + (arrowBaseSize * 1.5));
        ctx.lineTo(arrowX + arrowBaseSize, arrowY + (arrowBaseSize * 1.5));
        ctx.closePath(); ctx.fill();
        ctx.font = `bold ${textFontSize}px "Do Hyeon", sans-serif`;
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3 * scale; ctx.strokeStyle = 'black';
        ctx.strokeText(GAME_TEXT.HUD.RELOADING, p.x + shakeOffsetX, p.y + yOffset - (4 * scale) + shakeOffsetY);
        ctx.fillText(GAME_TEXT.HUD.RELOADING, p.x + shakeOffsetX, p.y + yOffset - (4 * scale) + shakeOffsetY);
    }
    ctx.restore();
    const mx = mouseRef.current.x; const my = mouseRef.current.y;
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.arc(mx, my, player.renderedCrosshairRadius, 0, Math.PI * 2); 
    ctx.stroke(); ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.stroke(); ctx.shadowBlur = 0;
  }, [calculateWeaponStats]);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === null) { previousTimeRef.current = time; }
    const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
    previousTimeRef.current = time;
    if (!isPaused) { update(deltaTime); }
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            draw(ctx);
            if (isPaused && gameStatus !== GameStatus.LEVEL_UP) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 32px "Do Hyeon", sans-serif';
                ctx.fillStyle = '#facc15';
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
  }, [gameStatus, isPaused, calculateWeaponStats, update, draw]);

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