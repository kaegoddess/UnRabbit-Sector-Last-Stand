

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameStatus, WeaponPart, UpgradeState } from './types';
import { PLAYER_STATS, PLAYER_HUD_SETTINGS, GAME_OVER_UI_SETTINGS, PLAYER_LEVELING_SETTINGS, GRENADE_UI_SETTINGS } from './config/playerConfig';
import { WEAPONS } from './config/weaponConfig';
import { PistolIcon, MP5Icon, RifleIcon, ShotgunIcon, TacticalLoader, WeaponLoader, GrenadeIcon } from './components/GameIcons';
import { soundService } from './services/SoundService';
import { GAME_TEXT } from './config/textConfig';
import { UPGRADE_CONFIG } from './config/upgradeConfig';
import { GAME_VERSION } from './config/gameConfig';
import { ASSETS } from './config/assetConfig'; // 중앙 에셋 설정 파일 임포트
import FallbackImage from './components/FallbackImage';
import { GRENADE_STATS } from './config/abilityConfig';


interface UICasing {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number; 
  vy: number; 
  rotation: number;
  vRotation: number; 
  life: number;
  maxLife: number;
  color: string;
}

// FIX: 'pos' 객체의 타입을 명확히 하기 위해 인터페이스를 추가합니다.
// 이 인터페이스는 업그레이드 위치 정보의 구조를 정의합니다.
interface UpgradePositionInfo {
  x: number;
  y: number;
  anchor: {
    x: number;
    y: number;
  };
}

const getRandomText = (array: string[]): string => {
  if (!array || array.length === 0) {
    return "";
  }
  return array[Math.floor(Math.random() * array.length)];
};

const App: React.FC = () => {
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [waitingForInput, setWaitingForInput] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MENU);
  const [selectedWeaponKey, setSelectedWeaponKey] = useState<keyof typeof WEAPONS>('Pistol');
  
  // 업그레이드 상태 (레벨)
  const [upgradeLevels, setUpgradeLevels] = useState<UpgradeState>({
    [WeaponPart.SCOPE]: 0,
    [WeaponPart.BARREL]: 0,
    [WeaponPart.MAG]: 0,
    [WeaponPart.MUZZLE]: 0,
    [WeaponPart.AMMO]: 0,
    [WeaponPart.SPRING]: 0,
    [WeaponPart.GRIP]: 0,
    [WeaponPart.STOCK]: 0,
  });

  const [stats, setStats] = useState({ 
    health: PLAYER_STATS.maxHealth, 
    ammo: WEAPONS[selectedWeaponKey].maxAmmo,
    maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo, 
    score: 0, 
    wave: 1,
    xp: 0,
    maxXp: PLAYER_LEVELING_SETTINGS.baseMaxXp,
    level: 1,
    stamina: PLAYER_STATS.maxStamina,
    maxStamina: PLAYER_STATS.maxStamina,
    grenadeCooldown: 0,
    maxGrenadeCooldown: GRENADE_STATS.baseCooldown,
  });
  const [missionText, setMissionText] = useState<string>("Initializing secure link...");
  const [gameOverText, setGameOverText] = useState<string>("");
  const [finalReport, setFinalReport] = useState<{score: number, kills: number, wave: number} | null>(null);
  
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});

  const [hoveredPart, setHoveredPart] = useState<WeaponPart | null>(null);

  const [isAmmoWarning, setIsAmmoWarning] = useState(false);

  // --- 개발자 모드 ---
  // [NEW] 게임 플레이 중 활성화되는 개발자 모드 상태 (순환: none -> hud -> grenade)
  const [playingDevMode, setPlayingDevMode] = useState<'none' | 'hud' | 'grenade'>('none');
  
  // 업그레이드 화면 개발자 모드
  const [isUpgradeDevMode, setIsUpgradeDevMode] = useState(false);
  const [devUpgradePositions, setDevUpgradePositions] = useState(WEAPONS[selectedWeaponKey].upgradePositions);
  const [devCharPosition, setDevCharPosition] = useState(WEAPONS[selectedWeaponKey].characterPosition);
  const [devInputValues, setDevInputValues] = useState<any>({});

  // HUD 위치 조정용 개발자 모드 상태
  const [hudDevSettings, setHudDevSettings] = useState({
      right: parseFloat(PLAYER_HUD_SETTINGS.right),
      bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
      width: parseFloat(PLAYER_HUD_SETTINGS.width),
  });
  
  // [NEW] 수류탄 UI 위치 조정용 개발자 모드 상태
  const [grenadeUiDevSettings, setGrenadeUiDevSettings] = useState({
      right: parseFloat(GRENADE_UI_SETTINGS.right),
      bottom: parseFloat(GRENADE_UI_SETTINGS.bottom),
      size: parseFloat(GRENADE_UI_SETTINGS.size),
  });

  // 게임오버 UI 개발자 모드
  const [isGameOverDevMode, setIsGameOverDevMode] = useState(false);
  const [gameOverDevSettings, setGameOverDevSettings] = useState({
      width: parseFloat(GAME_OVER_UI_SETTINGS.imageWidth),
      left: parseFloat(GAME_OVER_UI_SETTINGS.imageLeft),
      bottom: parseFloat(GAME_OVER_UI_SETTINGS.imageBottom),
  });
  // ---

  const uiCanvasRef = useRef<HTMLCanvasElement>(null);
  const casingsRef = useRef<UICasing[]>([]);
  const requestRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  
  const handleImageLoad = (key: string) => {
    setImageLoadStatus(prev => ({ ...prev, [key]: true }));
  };

  const BulletUI = ({ isLoaded, width = 10, height = 24 }: { isLoaded: boolean, width?: number, height?: number }) => {
    const bgColor = isAmmoWarning 
        ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]' 
        : (isLoaded ? 'bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-800');

    return (
      <div 
        className={`relative rounded-sm transition-colors duration-200 ${bgColor}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="absolute inset-0 rounded-sm border-t border-l border-white/30"></div>
        <div className="absolute inset-0 rounded-sm border-b border-r border-black/40"></div>
      </div>
    );
  };

  useEffect(() => {
    const preloadAssets = async () => {
      const allAssetUrlsToPreload = Object.values(ASSETS).flatMap(paths => paths.length > 0 ? [paths[0]] : []);
      const upgradeIconUrls = Object.values(UPGRADE_CONFIG).flatMap(config => config.ICON.length > 0 ? [config.ICON[0]] : []);
      const imageUrlsToLoad = [...new Set([...allAssetUrlsToPreload, ...upgradeIconUrls])];
      const totalAssets = imageUrlsToLoad.length + Object.keys(soundService.SOUND_ASSETS_CONFIG).length;
      let loadedCount = 0;
      
      const imagePromises = imageUrlsToLoad.map(url => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to preload image: ${url}`);
            loadedCount++; 
            setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
            resolve();
          };
        });
      });
      
      await Promise.all(imagePromises);

      try {
        await soundService.init();
        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length;
        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
      } catch (error) {
        console.error("사운드 서비스 초기화 실패:", error);
        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length; 
        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
      }

      setIsLoadingAssets(false);
    };
    preloadAssets();
  }, []);

  useEffect(() => {
    if (gameStatus === GameStatus.MENU) {
      setMissionText(getRandomText(GAME_TEXT.MISSION_BRIEFINGS));
      
      setUpgradeLevels({
        [WeaponPart.SCOPE]: 0,
        [WeaponPart.BARREL]: 0,
        [WeaponPart.MAG]: 0,
        [WeaponPart.MUZZLE]: 0,
        [WeaponPart.AMMO]: 0,
        [WeaponPart.SPRING]: 0,
        [WeaponPart.GRIP]: 0,
        [WeaponPart.STOCK]: 0,
      });
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === GameStatus.LEVEL_UP) {
      setHoveredPart(null);
      
      const weaponConfig = WEAPONS[selectedWeaponKey];
      const initialPositions = weaponConfig.upgradePositions;
      const initialCharPos = weaponConfig.characterPosition;

      setDevUpgradePositions(initialPositions);
      setDevCharPosition(initialCharPos);

      const initialInputs: any = {};
      for (const partKey in initialPositions) {
          const part = partKey as WeaponPart;
          initialInputs[part] = {
              ux: String(initialPositions[part].x),
              uy: String(initialPositions[part].y),
              ax: String(initialPositions[part].anchor.x),
              ay: String(initialPositions[part].anchor.y),
          };
      }
      initialInputs.character = {
          x: String(initialCharPos.x),
          y: String(initialCharPos.y),
      };
      setDevInputValues(initialInputs);
    }
  }, [gameStatus, selectedWeaponKey]);


  useEffect(() => {
    if (gameStatus === GameStatus.MENU) {
        const weapon = WEAPONS[selectedWeaponKey];
        setStats(prev => ({ ...prev, ammo: weapon.maxAmmo, maxAmmo: weapon.maxAmmo }));
    }
  }, [selectedWeaponKey, gameStatus]);
  
  useEffect(() => {
    if (gameStatus !== GameStatus.LEVEL_UP) {
        setIsUpgradeDevMode(false);
        return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Backquote') {
            e.preventDefault();
            setIsUpgradeDevMode(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus]);

  // [REFACTORED] 인게임 HUD 및 수류탄 UI 개발자 모드 순환 토글 핸들러
  useEffect(() => {
    if (gameStatus !== GameStatus.PLAYING) {
      setPlayingDevMode('none'); // 게임 플레이 상태가 아니면 항상 비활성화
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        e.preventDefault();
        setPlayingDevMode(prev => {
          if (prev === 'none') return 'hud';
          if (prev === 'hud') return 'grenade';
          return 'none'; // 'grenade' -> 'none'
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus]);

  // [BUG FIX] 게임오버 화면 개발자 모드 토글 핸들러 버그 수정
  useEffect(() => {
    if (gameStatus !== GameStatus.GAME_OVER) {
      setIsGameOverDevMode(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        e.preventDefault();
        // setIsUpgradeDevMode가 아닌 setIsGameOverDevMode를 토글하도록 수정
        setIsGameOverDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus]);

  const handleInitClick = () => {
    if (!isLoadingAssets) {
      setWaitingForInput(false);
    }
  };

  const handleStartGame = () => {
    setGameStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (finalScore: number, kills: number, wave: number) => {
    setGameStatus(GameStatus.GAME_OVER);
    setFinalReport({ score: finalScore, kills, wave });

    const messagePool = finalScore >= 500 ? GAME_TEXT.HIGH_SCORE_REPORTS : GAME_TEXT.LOW_SCORE_REPORTS;
    const flavorText = getRandomText(messagePool);
    const report = `${flavorText} (최종 점수: ${finalScore}, 처치: ${kills})`;
    setGameOverText(report);
  };

  const handleUpdateStats = (newStats: { 
    health: number; ammo: number; maxAmmo: number; score: number; wave: number; xp: number; maxXp: number; level: number; stamina: number; maxStamina: number; grenadeCooldown: number; maxGrenadeCooldown: number;
  }) => {
    setStats(newStats);
  };

  const handleShoot = useCallback((firedAmmoIndex: number) => {
      if (firedAmmoIndex < 1) return;
      const config = WEAPONS[selectedWeaponKey].uiCasingPhysics;
      const ammoConfig = WEAPONS[selectedWeaponKey].ammoUi; 
      let rect: { left: number; top: number; width: number; height: number } | null = null;
      
      const el = document.getElementById(`bullet-${firedAmmoIndex}`);
      
      if (el) {
        rect = el.getBoundingClientRect();
      } else {
        const container = document.getElementById('ammo-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const bW = ammoConfig.bulletWidth;
            const bH = ammoConfig.bulletHeight;
            const gap = ammoConfig.gap;
            let offsetX = 0;
            let offsetY = 0;

            if (ammoConfig.layout === 'double') {
                const isTopRow = firedAmmoIndex % 2 !== 0;
                const colIndex = Math.floor((firedAmmoIndex - 1) / 2);
                offsetX = colIndex * (bW + gap) + (isTopRow ? 0 : 10);
                offsetY = isTopRow ? 0 : (bH + gap);
            } else {
                const index = firedAmmoIndex - 1;
                offsetX = index * (bW + gap);
                offsetY = 0;
            }

            rect = {
                left: containerRect.left + offsetX,
                top: containerRect.top + offsetY,
                width: bW,
                height: bH
            };
        }
      }

      if (rect) {
        casingsRef.current.push({
          id: Math.random().toString(), x: rect.left, y: rect.top, width: rect.width, height: rect.height, vx: config.velocity.x + (Math.random() - 0.5) * config.velocityVariance.x, vy: config.velocity.y + (Math.random() - 0.5) * config.velocityVariance.y, rotation: 0, vRotation: (Math.random() - 0.5) * config.rotationSpeed, life: config.life, maxLife: config.life, color: '#fbbf24'
        });
      }
  }, [selectedWeaponKey]);

  const handleDryFire = useCallback(() => {
      setIsAmmoWarning(true);
      setTimeout(() => {
          setIsAmmoWarning(false);
      }, 200);
  }, []);

  const handleUpgrade = (part: WeaponPart) => {
    setUpgradeLevels(prev => ({ ...prev, [part]: prev[part] + 1 }));
    setGameStatus(GameStatus.PLAYING);
  };

  const handleSelectWeapon = (key: keyof typeof WEAPONS) => {
    if (selectedWeaponKey === key) return;
    setSelectedWeaponKey(key);
    soundService.play('uiSelect');
  };
  
  // --- 개발자 모드 함수 ---
  const handleUpgradeDevInputChange = (key: string, axis: 'ux' | 'uy' | 'ax' | 'ay' | 'x' | 'y', value: string) => {
      if (!/^-?\d*$/.test(value)) return;
      setDevInputValues(prev => ({ ...prev, [key]: { ...prev[key], [axis]: value } }));
      const parsedValue = parseInt(value, 10);
      const finalValue = isNaN(parsedValue) ? 0 : parsedValue;

      if (key === 'character') {
          setDevCharPosition(prev => ({ ...prev, [axis]: finalValue }));
      } else {
          setDevUpgradePositions(prev => {
              const newPos = { ...prev };
              const partKey = key as WeaponPart;
              if (!newPos[partKey]) return prev;
              if (axis === 'ux') newPos[partKey].x = finalValue;
              else if (axis === 'uy') newPos[partKey].y = finalValue;
              else if (axis === 'ax') newPos[partKey].anchor.x = finalValue;
              else if (axis === 'ay') newPos[partKey].anchor.y = finalValue;
              return newPos;
          });
      }
  };

  const handleCopyUpgradeCoords = () => {
    const weaponKey = selectedWeaponKey.toUpperCase();
    let output = `// Paste this into weaponDb.ts\n\n`;
    output += `// Character Position for ${weaponKey}\n`;
    output += `const ${weaponKey}_CHAR_POS = { x: ${devCharPosition.x}, y: ${devCharPosition.y} };\n\n`;
    output += `// Part Positions for ${weaponKey}\n`;
    output += `const ${weaponKey}_UPGRADE_POS = {\n`;
  
    const sortedParts = Object.keys(devUpgradePositions).sort();
    
    for (const part of sortedParts) {
        if (!devUpgradePositions[part as WeaponPart]) continue;
        const pos = devUpgradePositions[part as WeaponPart];
        const xStr = String(pos.x).padStart(5, ' ');
        const yStr = String(pos.y).padStart(4, ' ');
        const anchorX = pos.anchor ? String(pos.anchor.x).padStart(4, ' ') : '   0';
        const anchorY = pos.anchor ? String(pos.anchor.y).padStart(3, ' ') : '  0';
        output += `  [WeaponPart.${part}]: { x: ${xStr}, y: ${yStr}, anchor: { x: ${anchorX}, y: ${anchorY} } },\n`;
    }
    output += `};\n\n`;
    output += `// Then, update the WEAPON_DATABASE object:\n`;
    output += `'${selectedWeaponKey}': {\n`;
    output += `  // ... other properties\n`;
    output += `  ui: {\n`;
    output += `    characterPosition: ${weaponKey}_CHAR_POS,\n`;
    output += `    upgradePositions: ${weaponKey}_UPGRADE_POS\n`;
    output += `  }\n`;
    output += `}`;

    navigator.clipboard.writeText(output).then(() => {
        alert('Coordinates copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy coordinates: ', err);
    });
  };

  const handleHudDevInputChange = (key: 'right' | 'bottom' | 'width', value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setHudDevSettings(prev => ({ ...prev, [key]: parsedValue }));
    }
  };

  const handleCopyHudConfig = () => {
    const output = `// Paste this into config/playerConfig.ts\n\nexport const PLAYER_HUD_SETTINGS = {\n  right: '${hudDevSettings.right}rem',\n  bottom: '${hudDevSettings.bottom}rem',\n  width: '${hudDevSettings.width}rem',\n};\n`;
    navigator.clipboard.writeText(output).then(() => { alert('HUD Config copied to clipboard!'); }).catch(err => { console.error('Failed to copy HUD config: ', err); });
  };
  
  // [NEW] 수류탄 UI 개발자 모드 입력 핸들러
  const handleGrenadeUiDevInputChange = (key: 'right' | 'bottom' | 'size', value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setGrenadeUiDevSettings(prev => ({ ...prev, [key]: parsedValue }));
    }
  };

  // [NEW] 수류탄 UI 개발자 모드 설정 복사 핸들러
  const handleCopyGrenadeUiConfig = () => {
    const output = `// Paste this into config/playerConfig.ts\n\nexport const GRENADE_UI_SETTINGS = {\n  right: '${grenadeUiDevSettings.right}rem',\n  bottom: '${grenadeUiDevSettings.bottom}rem',\n  size: '${grenadeUiDevSettings.size}rem',\n};\n`;
    navigator.clipboard.writeText(output).then(() => { alert('Grenade UI Config copied to clipboard!'); }).catch(err => { console.error('Failed to copy Grenade UI config: ', err); });
  };
  
  const handleGameOverDevInputChange = (key: 'width' | 'left' | 'bottom', value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setGameOverDevSettings(prev => ({ ...prev, [key]: parsedValue }));
    }
  };

  const handleCopyGameOverConfig = () => {
    const output = `// Paste this into config/playerConfig.ts\n\nexport const GAME_OVER_UI_SETTINGS = {\n  imageWidth: '${gameOverDevSettings.width}rem',\n  imageLeft: '${gameOverDevSettings.left}rem',\n  imageBottom: '${gameOverDevSettings.bottom}rem',\n};\n`;
    navigator.clipboard.writeText(output).then(() => { alert('Game Over UI Config copied to clipboard!'); }).catch(err => { console.error('Failed to copy Game Over UI config: ', err); });
  };
  // --- ---

  useEffect(() => {
    const animate = (time: number) => {
      if (prevTimeRef.current === 0) prevTimeRef.current = time;
      const deltaTime = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;

      const canvas = uiCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const config = WEAPONS[selectedWeaponKey].uiCasingPhysics;
          casingsRef.current.forEach(c => {
            c.vy += config.gravity * deltaTime;
            c.x += c.vx * deltaTime;
            c.y += c.vy * deltaTime;
            c.rotation += c.vRotation * deltaTime;
            c.life -= deltaTime;
            if (c.y > canvas.height + 50) c.life = 0;
            ctx.save();
            ctx.translate(c.x + c.width / 2, c.y + c.height / 2);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            ctx.globalAlpha = Math.max(0, c.life / 0.5); 
            ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-c.width / 2, -c.height / 2, c.width, c.height);
            ctx.restore();
          });
          casingsRef.current = casingsRef.current.filter(c => c.life > 0);
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    const handleResize = () => {
        if (uiCanvasRef.current) {
            uiCanvasRef.current.width = window.innerWidth;
            uiCanvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        window.removeEventListener('resize', handleResize);
    };
  }, [selectedWeaponKey, waitingForInput]);

  const StatBar = ({ label, value, max, color = "bg-green-500", invert = false }: { label: string, value: number, max: number, color?: string, invert?: boolean }) => {
      let percent = (value / max) * 100;
      if (invert) percent = 100 - percent;
      percent = Math.max(5, Math.min(100, percent));
      return (
          <div className="flex items-center gap-2 w-full">
              <span className="w-8 text-gray-400 uppercase text-xs">{label}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
              </div>
          </div>
      );
  };

  const renderLoadingScreen = () => (
      <div 
        onClick={handleInitClick}
        className={`relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden text-white select-none ${!isLoadingAssets ? 'cursor-pointer' : ''}`}
      >
         <div className="absolute inset-0 z-0">
            <FallbackImage srcs={ASSETS.LOADING_SCREEN} className="w-full h-full object-cover opacity-80 filter contrast-110" alt="Loading Background" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
         </div>
         <div className="z-10 w-full max-w-4xl px-8 flex flex-col h-full justify-end pb-20">
            <div className="mb-auto mt-20">
                <h1 className="text-5xl md:text-7xl font-title text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-800 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{GAME_TEXT.TITLES.MAIN}</h1>
                <h2 className="text-xl md:text-2xl text-green-700 font-bold tracking-[0.5em] mt-2 ml-1">{GAME_TEXT.TITLES.SUBTITLE}</h2>
            </div>
            <div className="border-l-4 border-green-600 pl-6 mb-8 bg-black/30 backdrop-blur-sm p-4 rounded-r font-body">
               <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
                  <span className="text-green-500 font-bold mr-2 text-lg">{GAME_TEXT.LOADING.SYSTEM_ALERT}</span><br/>
                  {GAME_TEXT.LOADING.LORE}
               </p>
            </div>
            {!isLoadingAssets && (
                <div className="w-full text-center animate-pulse mb-8">
                    <span className="text-green-500 font-black text-2xl tracking-widest bg-black/50 px-4 py-2 border border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]">{GAME_TEXT.LOADING.SYSTEM_READY}</span>
                </div>
            )}
            <div className="space-y-2">
                <div className="flex justify-between items-end text-green-500 text-xs font-bold tracking-widest uppercase">
                    <span>{isLoadingAssets ? GAME_TEXT.LOADING.INIT_SYSTEM : GAME_TEXT.LOADING.ALL_GREEN}</span>
                    <span>{Math.min(100, Math.round(loadingProgress))}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                   <div className="h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ width: `${Math.max(5, loadingProgress)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>{GAME_TEXT.LOADING.ASSET_LOADER_PREFIX}{GAME_VERSION}</span>
                    <span>{isLoadingAssets ? GAME_TEXT.LOADING.ESTABLISHING : GAME_TEXT.LOADING.CONNECTED}</span>
                </div>
            </div>
         </div>
      </div>
  );

  if (waitingForInput) {
    return renderLoadingScreen();
  }
    
  const currentUpgradePositions = isUpgradeDevMode ? devUpgradePositions : WEAPONS[selectedWeaponKey].upgradePositions;
  
  // [REFACTORED] 개발자 모드 상태에 따라 UI 설정을 동적으로 결정합니다.
  const currentHudSettings = playingDevMode === 'hud' ? hudDevSettings : {
    right: parseFloat(PLAYER_HUD_SETTINGS.right),
    bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
    width: parseFloat(PLAYER_HUD_SETTINGS.width),
  };
  const hudStyle = {
    right: `${currentHudSettings.right}rem`,
    bottom: `${currentHudSettings.bottom}rem`,
    width: `${currentHudSettings.width}rem`,
  };

  const currentGrenadeUiSettings = playingDevMode === 'grenade' ? grenadeUiDevSettings : {
    right: parseFloat(GRENADE_UI_SETTINGS.right),
    bottom: parseFloat(GRENADE_UI_SETTINGS.bottom),
    size: parseFloat(GRENADE_UI_SETTINGS.size),
  };
  const grenadeUiStyle = {
    right: `${currentGrenadeUiSettings.right}rem`,
    bottom: `${currentGrenadeUiSettings.bottom}rem`,
    width: `${currentGrenadeUiSettings.size}rem`,
    height: `${currentGrenadeUiSettings.size}rem`,
  };

  const currentGameOverUiSettings = isGameOverDevMode ? gameOverDevSettings : {
    width: parseFloat(GAME_OVER_UI_SETTINGS.imageWidth),
    left: parseFloat(GAME_OVER_UI_SETTINGS.imageLeft),
    bottom: parseFloat(GAME_OVER_UI_SETTINGS.imageBottom),
  };
  const gameOverImageStyle = {
    width: `${currentGameOverUiSettings.width}rem`,
    left: `${currentGameOverUiSettings.left}rem`,
    bottom: `${currentGameOverUiSettings.bottom}rem`,
  };

  const upgradeImageScale = WEAPONS[selectedWeaponKey].upgradeImageScale || 1.0;

  let weaponTiltStyle = { transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(0deg) rotateY(0deg)`, transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };
  if (hoveredPart) {
      const pos = currentUpgradePositions[hoveredPart];
      if (pos) {
          const maxTilt = 25; 
          const rotX = (pos.y / 250) * maxTilt;
          const rotY = -(pos.x / 450) * maxTilt;
          weaponTiltStyle = {
              ...weaponTiltStyle,
              transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
          };
      }
  }

  const currentAmmoUiConfig = WEAPONS[selectedWeaponKey].ammoUi;
  const ammoUiLayout = currentAmmoUiConfig?.layout || 'single';
  const bulletW = currentAmmoUiConfig?.bulletWidth || 10;
  const bulletH = currentAmmoUiConfig?.bulletHeight || 24;
  const gap = currentAmmoUiConfig?.gap || 4;
  const totalBullets = stats.maxAmmo;
  const currentAmmo = stats.ammo;
  const hudIconScale = WEAPONS[selectedWeaponKey].hudIconScale || 1;

  return (
  <div className="relative w-full h-screen bg-black overflow-hidden select-none text-white">
    <GameCanvas 
      gameStatus={gameStatus} 
      selectedWeaponId={selectedWeaponKey}
      upgradeLevels={upgradeLevels}
      setGameStatus={setGameStatus} 
      onUpdateStats={handleUpdateStats}
      onGameOver={handleGameOver}
      onShoot={handleShoot}
      onDryFire={handleDryFire}
      isPaused={playingDevMode !== 'none' || isUpgradeDevMode || isGameOverDevMode || gameStatus === GameStatus.LEVEL_UP || gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.MENU}
    />

    <canvas ref={uiCanvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }} />

    {/* [REFACTORED] HUD 개발자 모드 UI (위치 변경) */}
    {playingDevMode === 'hud' && (
      <div className="absolute bottom-4 left-4 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto">
        <p className="font-bold text-sm uppercase">HUD Dev (`)</p>
        <div className="flex gap-2 items-center">
          <label className="text-xs font-bold">R:</label>
          <input type="number" step="0.1" value={hudDevSettings.right} onChange={(e) => handleHudDevInputChange('right', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">B:</label>
          <input type="number" step="0.1" value={hudDevSettings.bottom} onChange={(e) => handleHudDevInputChange('bottom', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">W:</label>
          <input type="number" step="0.1" value={hudDevSettings.width} onChange={(e) => handleHudDevInputChange('width', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
        </div>
        <button onClick={handleCopyHudConfig} className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700">Copy</button>
      </div>
    )}

    {/* [NEW] 수류탄 UI 개발자 모드 */}
    {playingDevMode === 'grenade' && (
      <div className="absolute bottom-4 right-4 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto">
        <p className="font-bold text-sm uppercase">Grenade UI Dev (`)</p>
        <div className="flex gap-2 items-center">
          <label className="text-xs font-bold">R:</label>
          <input type="number" step="0.1" value={grenadeUiDevSettings.right} onChange={(e) => handleGrenadeUiDevInputChange('right', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">B:</label>
          <input type="number" step="0.1" value={grenadeUiDevSettings.bottom} onChange={(e) => handleGrenadeUiDevInputChange('bottom', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">Size:</label>
          <input type="number" step="0.1" value={grenadeUiDevSettings.size} onChange={(e) => handleGrenadeUiDevInputChange('size', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
        </div>
        <button onClick={handleCopyGrenadeUiConfig} className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700">Copy</button>
      </div>
    )}

    {(gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.LEVEL_UP) && (
      <>
        <div className="absolute inset-0 pointer-events-none py-1 px-4 flex flex-col justify-between z-20">
          <div className="flex justify-between items-start pt-2">
            <div className="p-2 text-left">
                <p 
                  className="text-xs text-green-500 uppercase font-bold tracking-widest mb-1"
                  style={{textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}
                >
                  {GAME_TEXT.HUD.CONTROLS_LABEL}
                </p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                    {GAME_TEXT.HUD.CONTROLS.map((control, index) => (
                        <React.Fragment key={index}>
                            <span 
                              className="text-gray-200 font-bold"
                              style={{textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}
                            >
                              {control.action}
                            </span>
                            <span 
                              className="text-yellow-400 font-mono"
                              style={{textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}
                            >
                              {control.keys}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            
            <div className="bg-black/70 backdrop-blur-md p-4 rounded-lg text-right ml-auto">
              <p className="text-sm text-gray-400">{GAME_TEXT.HUD.SCORE_LABEL}</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.score.toLocaleString()}</p>
              <p className="text-sm text-yellow-600 mt-1">{GAME_TEXT.HUD.WAVE_LABEL} {stats.wave}</p>
            </div>
          </div>

          <div className="flex justify-between items-end w-full">
            <div className="flex items-end">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md pb-2 px-4 pr-8 rounded-tr-3xl shadow-2xl min-w-[440px]">
                    <div className="flex flex-col items-center justify-center w-60 shrink-0">
                      <div className="w-full h-32 flex items-center justify-center">
                          {React.createElement(
                            { Pistol: PistolIcon, MP5: MP5Icon, Rifle: RifleIcon, Shotgun: ShotgunIcon }[selectedWeaponKey],
                            {
                              className: "w-full h-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.8)] filter brightness-110",
                              style: { transform: `scale(${hudIconScale})` },
                              alt: WEAPONS[selectedWeaponKey].name,
                            }
                          )}
                      </div>
                    </div>
                    <div className="w-px h-20 bg-gray-600/50"></div>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex justify-between items-end border-b border-gray-600/50 pb-1">
                          <div className="flex flex-col mb-1">
                              <span className="text-2xl font-black text-white tracking-wider leading-none">{WEAPONS[selectedWeaponKey].name}</span>
                              <span className="text-xs text-gray-400 uppercase leading-none mt-0.5">{WEAPONS[selectedWeaponKey].type}</span>
                          </div>
                          <div className="text-5xl font-bold text-yellow-400 leading-none pl-6 shadow-black drop-shadow-md flex items-baseline">
                              <span className="inline-block w-14 text-right">{stats.ammo}</span>
                              <span className="text-xl text-gray-500 ml-1">/{stats.maxAmmo}</span>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-yellow-600 font-bold text-lg">LV.</span>
                          <span className="text-yellow-400 font-black text-4xl text-shadow-glow tracking-wider">
                            {stats.level.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 relative">
                            <div className="w-full h-4 bg-gray-800/50 rounded-full overflow-hidden border-2 border-gray-900/80 relative shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all duration-300" 
                                style={{ width: `${Math.min(100, (stats.xp / stats.maxXp) * 100)}%` }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold drop-shadow-[0_1px_1px_black]">
                                {stats.xp} / {stats.maxXp}
                              </div>
                            </div>
                        </div>
                      </div>

                      <div 
                        id="ammo-container" 
                        className={`flex flex-col gap-1 h-auto mt-1 ${isAmmoWarning ? 'animate-shake-x' : ''}`} 
                        style={{ gap: `${gap}px` }}
                      >
                            {ammoUiLayout === 'single' ? (
                                <div className="flex" style={{ gap: `${gap}px` }}>
                                    {Array.from({ length: totalBullets }).map((_, i) => {
                                        const bulletId = i + 1;
                                        return (
                                            <div key={`bullet-${i}`} id={`bullet-${bulletId}`}>
                                                <BulletUI isLoaded={i < currentAmmo} width={bulletW} height={bulletH} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    {(() => {
                                        const bulletsInFirstRow = Math.ceil(totalBullets / 2);
                                        const bulletsInSecondRow = Math.floor(totalBullets / 2);
                                        const bulletsLeftInTopRow = Math.ceil(currentAmmo / 2);
                                        const bulletsLeftInBottomRow = Math.floor(currentAmmo / 2);

                                        return (
                                            <>
                                                <div className="flex" style={{ gap: `${gap}px` }}>
                                                    {Array.from({ length: bulletsInFirstRow }).map((_, i) => {
                                                        const bulletId = (i * 2) + 1;
                                                        return (
                                                          <div key={`top-${i}`} id={`bullet-${bulletId}`}>
                                                            <BulletUI isLoaded={i < bulletsLeftInTopRow} width={bulletW} height={bulletH} />
                                                          </div>
                                                        );
                                                    })}
                                                </div>
                                                {bulletsInSecondRow > 0 && (
                                                  <div className="flex ml-2.5" style={{ gap: `${gap}px` }}>
                                                      {Array.from({ length: bulletsInSecondRow }).map((_, i) => {
                                                          const bulletId = (i * 2) + 2;
                                                          return (
                                                            <div key={`bottom-${i}`} id={`bullet-${bulletId}`}>
                                                              <BulletUI isLoaded={i < bulletsLeftInBottomRow} width={bulletW} height={bulletH} />
                                                            </div>
                                                          );
                                                      })}
                                                  </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* [REFACTORED] 수류탄 UI 스타일을 동적으로 적용 */}
        <div 
            style={grenadeUiStyle}
            className="absolute z-10 flex items-center justify-center pointer-events-none"
        >
            <GrenadeIcon alt="수류탄" className="w-full h-full object-contain filter drop-shadow-lg" />
            
            {stats.grenadeCooldown > 0 ? (
                <>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                        <circle className="text-black/50" strokeWidth="4" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                        <circle
                            className="text-yellow-400"
                            strokeWidth="4"
                            strokeDasharray={`${(stats.grenadeCooldown / stats.maxGrenadeCooldown) * 100}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="18"
                            cy="18"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                    </svg>
                    <span className="absolute text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        {Math.ceil(stats.grenadeCooldown)}
                    </span>
                </>
            ) : (
                <span className="absolute text-3xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    Q
                </span>
            )}
        </div>
        
        <div style={hudStyle} className="absolute flex flex-col gap-2 z-10 opacity-90 pointer-events-none pr-2">
            <FallbackImage
                srcs={ASSETS[('CHAR_' + (selectedWeaponKey === 'Pistol' ? 'DEFAULT' : selectedWeaponKey.toUpperCase())) as keyof typeof ASSETS]}
                alt={GAME_TEXT.MENU.CHAR_NAME}
                className="w-full h-full object-contain object-bottom"
            />
            <div className="w-full h-6 bg-gray-900/80 border-2 border-gray-600/50 rounded-full p-1 relative flex justify-end">
              <div 
                className={`h-full transition-all duration-200 rounded-full ${stats.health > 30 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} 
                style={{ width: `${Math.max(0, (stats.health / PLAYER_STATS.maxHealth) * 100)}%` }}>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                {Math.round(stats.health)} / {PLAYER_STATS.maxHealth}
              </div>
            </div>
        </div>
      </>
    )}

    <div className={`absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 overflow-hidden transition-opacity duration-300 ${gameStatus === GameStatus.LEVEL_UP ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {isUpgradeDevMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4">
              <p className="font-bold text-sm uppercase">Upgrade Dev Mode (` key)</p>
              <div className="flex gap-2 items-center">
                  <label className="text-xs font-bold">Char X%:</label>
                  <input type="text" value={devInputValues.character?.x ?? ''} onChange={(e) => handleUpgradeDevInputChange('character', 'x', e.target.value)} className="w-12 bg-black/20 text-black text-xs p-0.5 rounded text-center" />
                  <label className="text-xs font-bold">Char Y%:</label>
                  <input type="text" value={devInputValues.character?.y ?? ''} onChange={(e) => handleUpgradeDevInputChange('character', 'y', e.target.value)} className="w-12 bg-black/20 text-black text-xs p-0.5 rounded text-center" />
              </div>
              <button onClick={handleCopyUpgradeCoords} className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700">
                  Copy Coordinates
              </button>
          </div>
        )}

        <div className="relative">
            <div className="relative w-full max-w-screen-2xl min-h-[550px] bg-black/70 backdrop-blur-md rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                
                <div className="z-40 bg-gray-900 border-b-2 border-green-500/40 px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
                  <div className="flex items-center gap-6">
                      <div>
                          <h2 className="text-4xl font-title text-green-400 tracking-widest uppercase text-shadow-glow">
                              {GAME_TEXT.UPGRADES.HEADER}
                          </h2>
                          <div className="text-xs text-green-600/80 font-body tracking-wider mt-1">{GAME_TEXT.UPGRADES.SUBHEADER}</div>
                      </div>
                      <div className="w-px h-12 bg-gray-600/50 self-center"></div>
                      <div>
                          <h3 className="text-3xl text-gray-300 font-bold leading-none">
                              {WEAPONS[selectedWeaponKey].name}
                          </h3>
                          <p className="text-xl font-bold mt-1 text-yellow-400">
                              {GAME_TEXT.HUD.LEVEL} {stats.level}
                          </p>
                      </div>
                  </div>
                </div>

                <div className="relative flex-1 w-full h-full">
                    <div className="absolute top-1/2 left-1/2 w-0 h-0 z-20" style={{ perspective: '1500px' }}>
                      
                      <svg className="absolute top-0 left-0 overflow-visible z-30 pointer-events-none">
                          {Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                              const pos = posUntyped as UpgradePositionInfo;
                              const buttonWidth = 192; 
                              const buttonHeight = 90;
                              const halfW = buttonWidth / 2;
                              const halfH = buttonHeight / 2;
                              const dx = pos.anchor.x - pos.x;
                              const dy = pos.anchor.y - pos.y;
                              if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return null;
                              const t_x = Math.abs(dx) > 0.01 ? halfW / Math.abs(dx) : Infinity;
                              const t_y = Math.abs(dy) > 0.01 ? halfH / Math.abs(dy) : Infinity;
                              const t = Math.min(t_x, t_y);
                              const startX = pos.x + t * dx;
                              const startY = pos.y + t * dy;
                              
                              return (
                                  <g key={`lines-${part}`}>
                                      <line
                                          x1={startX}
                                          y1={startY}
                                          x2={pos.anchor.x}
                                          y2={pos.anchor.y}
                                          stroke="rgba(34,197,94,0.4)"
                                          strokeWidth="1"
                                      />
                                      <circle 
                                          cx={pos.anchor.x} 
                                          cy={pos.anchor.y} 
                                          r="3" 
                                          fill="rgba(34,197,94,0.8)" 
                                      />
                                  </g>
                              );
                          })}
                      </svg>

                      {isUpgradeDevMode && Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                          const pos = posUntyped as UpgradePositionInfo;
                          return (
                          <div
                              key={`anchor-coord-${part}`}
                              className="absolute top-0 left-0 text-yellow-400 text-[10px] font-mono bg-black/50 px-1 rounded z-[101] pointer-events-none whitespace-nowrap"
                              style={{
                                  transform: `translate(${pos.anchor.x}px, ${pos.anchor.y}px) translate(8px, -4px)`
                              }}
                          >
                              (ax: {pos.anchor.x}, ay: {pos.anchor.y})
                          </div>
                      )})}

                      <div
                          className="absolute top-0 left-0 z-10 flex items-center justify-center"
                          style={{ ...weaponTiltStyle, transformStyle: 'preserve-3d' }}
                      >
                           { !imageLoadStatus['upgrade-' + selectedWeaponKey] && <WeaponLoader className="absolute inset-0 z-0" /> }
                           <FallbackImage 
                              srcs={WEAPONS[selectedWeaponKey].upgradeImage || []} 
                              alt={WEAPONS[selectedWeaponKey].name}
                              className="max-w-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10"
                              onLoad={() => handleImageLoad('upgrade-' + selectedWeaponKey)}
                           />
                      </div>

                      {Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                          const pos = posUntyped as UpgradePositionInfo;
                          const currentLevel = upgradeLevels[part as WeaponPart];
                          const info = UPGRADE_CONFIG[part as WeaponPart];
                          const maxLevel = info.maxLevel;
                          const isMaxed = currentLevel >= maxLevel;
                          
                          return (
                              <div 
                                  key={part} 
                                  className="absolute z-40"
                                  style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
                                  onMouseEnter={() => setHoveredPart(part as WeaponPart)}
                                  onMouseLeave={() => setHoveredPart(null)}
                              >
                                {isUpgradeDevMode && (
                                    <div className="absolute -top-4 -right-2 text-yellow-400 text-[10px] font-mono bg-black/50 px-1 rounded z-[101] whitespace-nowrap">
                                        (ux: {pos.x}, uy: {pos.y})
                                    </div>
                                )}
                                  <button
                                      onClick={() => !isMaxed && handleUpgrade(part as WeaponPart)}
                                      disabled={isMaxed}
                                      className={`relative w-48 p-2 bg-black/90 border-2 ${isMaxed ? 'border-yellow-500/50' : 'border-green-500/50'} hover:bg-green-900/40 hover:border-green-400 transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-md`}
                                  >
                                      <div className="flex gap-3 items-center mb-2">
                                          <div className={`w-14 h-14 shrink-0 border-2 relative ${isMaxed ? 'border-yellow-500/30 bg-yellow-900/10' : 'border-green-900/20'} flex items-center justify-center rounded-md`}>
                                              <FallbackImage srcs={info.ICON} alt={info.NAME} className="absolute inset-0 w-full h-full object-contain p-1" />
                                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-1 h-1 bg-green-500/50 rounded-full animate-pulse"></div>
                                              </div>
                                          </div>
                                          <div className="flex-1 flex flex-col justify-center h-14">
                                              <div className="flex justify-between items-baseline mb-0.5"><span className={`font-bold text-sm ${isMaxed ? 'text-yellow-500' : 'text-green-400'}`}>{info.NAME}</span></div>
                                              <div className="text-[10px] text-green-600 font-mono mb-0.5">{isMaxed ? GAME_TEXT.UPGRADES.MAX_LEVEL : `${GAME_TEXT.UPGRADES.LEVEL_PREFIX} ${currentLevel}/${maxLevel}`}</div>
                                              <div className="text-[10px] text-gray-400 font-body leading-tight truncate">{info.DESC}</div>
                                          </div>
                                      </div>
                                      <div className="flex gap-0.5 mt-1 w-full px-0.5">
                                          {Array.from({ length: maxLevel }).map((_, i) => (<div key={i} className={`h-1.5 flex-1 rounded-sm ${i < currentLevel ? (isMaxed ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-800'}`}></div>))}
                                      </div>
                                  </button>

                                  {isUpgradeDevMode && (
                                      <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 z-[100] bg-black/80 p-2 rounded backdrop-blur-sm text-xs whitespace-nowrap">
                                          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
                                              <label className="text-white text-right">UX:</label>
                                              <input 
                                                  type="text"
                                                  value={devInputValues[part]?.ux ?? ''}
                                                  onChange={(e) => handleUpgradeDevInputChange(part as WeaponPart, 'ux', e.target.value)}
                                                  className="w-12 bg-gray-700 text-white p-0.5 rounded text-center"
                                              />
                                              <label className="text-white text-right">UY:</label>
                                              <input
                                                  type="text"
                                                  value={devInputValues[part]?.uy ?? ''}
                                                  onChange={(e) => handleUpgradeDevInputChange(part as WeaponPart, 'uy', e.target.value)}
                                                  className="w-12 bg-gray-700 text-white p-0.5 rounded text-center"
                                              />
                                              <label className="text-white text-right">AX:</label>
                                              <input 
                                                  type="text"
                                                  value={devInputValues[part]?.ax ?? ''}
                                                  onChange={(e) => handleUpgradeDevInputChange(part as WeaponPart, 'ax', e.target.value)}
                                                  className="w-12 bg-gray-700 text-white p-0.5 rounded text-center"
                                              />
                                              <label className="text-white text-right">AY:</label>
                                              <input
                                                  type="text"
                                                  value={devInputValues[part]?.ay ?? ''}
                                                  onChange={(e) => handleUpgradeDevInputChange(part as WeaponPart, 'ay', e.target.value)}
                                                  className="w-12 bg-gray-700 text-white p-0.5 rounded text-center"
                                              />
                                          </div>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                    </div>
                </div>
            </div>
        </div>
    </div>

    {gameStatus === GameStatus.MENU && (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-[90vw] w-full p-8 bg-[#111827] bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:30px_30px] shadow-[0_0_50px_rgba(34,197,94,0.2)] rounded-lg flex flex-col md:flex-row gap-8 items-stretch h-[80vh]">
            <div className="md:w-[45%] flex flex-col h-full">
              <div className="relative border-2 border-green-700 bg-black h-full overflow-hidden rounded group flex-1">
                  { !imageLoadStatus['char-' + selectedWeaponKey] && <TacticalLoader className="absolute inset-0 z-10" /> }
                  
                  { !imageLoadStatus['char-' + selectedWeaponKey] && 
                    <div key={selectedWeaponKey} className="animate-scan pointer-events-none absolute inset-0 z-[25]"></div>
                  }

                  {Object.keys(WEAPONS).map((key) => {
                    const weaponKey = key as keyof typeof WEAPONS;
                    const charAssetKey = (key === 'Pistol' ? 'CHAR_DEFAULT' : `CHAR_${key.toUpperCase()}`) as keyof typeof ASSETS;
                    const charAssetPaths = ASSETS[charAssetKey] || [];
                    const imageKey = 'char-' + key;
                    const isSelectedAndLoaded = selectedWeaponKey === key && imageLoadStatus[imageKey];

                    return (
                        <FallbackImage 
                            key={imageKey}
                            srcs={charAssetPaths}
                            alt={GAME_TEXT.MENU.CHAR_NAME}
                            onLoad={() => handleImageLoad(imageKey)}
                            className={`absolute inset-0 w-full h-full object-cover object-[40%_50%] transition-opacity duration-300 ${isSelectedAndLoaded ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none'}`}
                        />
                    );
                  })}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-24 z-30 pointer-events-none">
                      <div className="text-green-500 text-base font-bold tracking-widest mb-1">{GAME_TEXT.MENU.CHAR_NAME}</div>
                      <div className="text-green-700 text-sm uppercase">{GAME_TEXT.MENU.CHAR_STATUS}</div>
                      <div className="text-gray-500 text-xs mt-2 max-w-md font-body">{GAME_TEXT.MENU.CHAR_DESC}</div>
                  </div>
              </div>
            </div>

            <div className="md:w-[55%] flex flex-col justify-between">
              <div>
                  <h1 className="text-6xl lg:text-7xl font-title text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 tracking-tighter mb-2">{GAME_TEXT.TITLES.MAIN}</h1>
                  <h2 className="text-2xl text-green-700 font-bold mb-6">{GAME_TEXT.TITLES.OPERATION}</h2>
                  <div className="bg-black border border-green-900 mb-8 text-green-500 h-40 overflow-hidden relative flex flex-col shadow-inner">
                      <div className="w-full bg-green-900/30 p-1 px-3 flex justify-between items-center border-b border-green-900/50">
                          <span className="text-[10px] text-green-600 tracking-wider">{GAME_TEXT.MENU.ENCRYPTED_SIGNAL}</span>
                          <span className="text-xs text-green-100 font-bold tracking-widest bg-green-900/50 px-2 py-0.5 rounded-sm">{GAME_TEXT.MENU.INCOMING_TRANS}</span>
                      </div>
                      <div className="p-4 flex-1 overflow-y-auto font-body">
                        <p className="typing-effect leading-relaxed text-sm lg:text-base">{missionText}</p>
                      </div>
                  </div>
              </div>
              
              <div className="mb-16">
                  <div className="text-base font-bold tracking-widest mb-2 border-b border-green-900 pb-1 text-green-600">{GAME_TEXT.MENU.LOADOUT_HEADER}</div>
                  <div className="grid grid-cols-4 gap-4 h-56 relative overflow-hidden">
                      <div className="animate-scan pointer-events-none absolute inset-0 z-[15]"></div>
                      {Object.entries(WEAPONS).map(([key, weapon]) => {
                          let WeaponIconComponent;
                          switch (key) {
                            case 'Pistol': WeaponIconComponent = PistolIcon; break;
                            case 'MP5': WeaponIconComponent = MP5Icon; break;
                            case 'Rifle': WeaponIconComponent = RifleIcon; break;
                            case 'Shotgun': WeaponIconComponent = ShotgunIcon; break;
                            default: return null;
                          }

                          const isSelected = selectedWeaponKey === key;
                          const imageKey = 'weapon-' + key;
                          
                          const slotClasses = isSelected
                              ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                              : 'border-gray-700 bg-gray-900 opacity-60';

                          return (
                              <div
                                  key={key}
                                  onClick={() => handleSelectWeapon(key as keyof typeof WEAPONS)}
                                  className={`relative h-full border-2 rounded flex flex-col cursor-pointer transition-all hover:bg-gray-800 overflow-hidden ${slotClasses}`}
                              >
                                  { !imageLoadStatus[imageKey] && <WeaponLoader className="absolute inset-0 z-10" /> }
                                  <div className="relative z-10 flex flex-col w-full h-full p-2 bg-gray-900 gap-1 items-start">
                                      <div className="h-5 text-sm font-bold text-gray-300 w-full text-left flex-shrink-0 leading-none whitespace-nowrap overflow-hidden text-ellipsis transform-gpu">{weapon.name}</div>
                                      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden">
                                          <WeaponIconComponent 
                                            className={`w-full h-full object-contain drop-shadow-lg transition-opacity duration-300 ${imageLoadStatus[imageKey] ? 'opacity-100' : 'opacity-0'}`}
                                            style={{ transform: `scale(${weapon.menuIconScale || 1})` }} 
                                            alt={weapon.name}
                                            onLoad={() => handleImageLoad(imageKey)}
                                          />
                                      </div>
                                      <div className="w-full space-y-1 flex-shrink-0 mt-auto">
                                          <StatBar label="DMG" value={weapon.damage * (weapon.pelletCount || 1)} max={80} color="bg-red-500" />
                                          <StatBar label="RATE" value={weapon.fireRate} max={900} color="bg-yellow-500" invert={true} />
                                          <StatBar label="MAG" value={weapon.maxAmmo} max={30} color="bg-blue-500" />
                                          <StatBar label="PEN" value={weapon.penetration.count} max={5} color="bg-purple-500" />
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
              
              <button onClick={handleStartGame} className="w-full py-5 bg-green-700 hover:bg-green-600 text-white font-bold text-2xl tracking-widest uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-green-500">
                  {GAME_TEXT.MENU.DEPLOY_BUTTON}
              </button>
            </div>
          </div>
      </div>
    )}

    {gameStatus === GameStatus.GAME_OVER && finalReport && (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-900/40 backdrop-blur-md">
        
        {isGameOverDevMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto">
            <p className="font-bold text-sm uppercase">Game Over UI Dev Mode</p>
            <div className="flex gap-2 items-center">
              <label className="text-xs font-bold">Width (rem):</label>
              <input type="number" step="0.1" value={gameOverDevSettings.width} onChange={(e) => handleGameOverDevInputChange('width', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
              <label className="text-xs font-bold">Left (rem):</label>
              <input type="number" step="0.1" value={gameOverDevSettings.left} onChange={(e) => handleGameOverDevInputChange('left', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
              <label className="text-xs font-bold">Bottom (rem):</label>
              <input type="number" step="0.1" value={gameOverDevSettings.bottom} onChange={(e) => handleGameOverDevInputChange('bottom', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
            </div>
            <button onClick={handleCopyGameOverConfig} className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700">
              Copy Config
            </button>
          </div>
        )}

        <div className="relative max-w-md w-full p-8 bg-gray-900 border-2 border-red-800 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-lg text-center">
            <FallbackImage
                srcs={ASSETS.CHAR_SAD}
                alt="Mission Failed"
                className="absolute z-0 pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                style={gameOverImageStyle}
            />
            <h2 className="text-5xl font-black text-red-500 mb-2 tracking-widest">{GAME_TEXT.GAME_OVER.TITLE}</h2>
            <div className="h-1 w-24 bg-red-600 mx-auto mb-6"></div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <p className="text-gray-500 text-xs uppercase">{GAME_TEXT.GAME_OVER.SCORE}</p>
                    <p className="text-2xl text-white font-bold">{finalReport.score}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <p className="text-gray-500 text-xs uppercase">{GAME_TEXT.GAME_OVER.WAVES}</p>
                    <p className="text-2xl text-white font-bold">{finalReport.wave}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700 col-span-2">
                    <p className="text-gray-500 text-xs uppercase">{GAME_TEXT.GAME_OVER.KILLS}</p>
                    <p className="text-2xl text-white font-bold">{finalReport.kills}</p>
                </div>
            </div>
            
            <div className="bg-black p-4 border border-red-900 mb-8 text-red-400 text-sm text-left">
                <p className="mb-2 text-xs uppercase text-red-700">{GAME_TEXT.GAME_OVER.HQ_ANALYSIS}</p>
                <p className="font-body">{gameOverText || GAME_TEXT.GAME_OVER.CONNECTION_LOST}</p>
            </div>
            
            <button 
                onClick={() => {
                  setGameStatus(GameStatus.MENU);
                  setStats({ 
                    health: PLAYER_STATS.maxHealth, ammo: WEAPONS[selectedWeaponKey].maxAmmo, maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo, score: 0, wave: 1, xp: 0, maxXp: PLAYER_LEVELING_SETTINGS.baseMaxXp, level: 1, stamina: PLAYER_STATS.maxStamina, maxStamina: PLAYER_STATS.maxStamina, grenadeCooldown: 0, maxGrenadeCooldown: GRENADE_STATS.baseCooldown,
                  });
                }}
                className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-lg uppercase transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            >
                {GAME_TEXT.GAME_OVER.RETRY_BUTTON}
            </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default App;