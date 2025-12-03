

import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameStatus, WeaponPart, UpgradeState } from './types';
import { PLAYER_STATS, PLAYER_HUD_SETTINGS, GAME_OVER_UI_SETTINGS } from './config/playerConfig';
import { WEAPONS } from './config/weaponConfig';
import { PistolIcon, MP5Icon, RifleIcon, ShotgunIcon, TacticalLoader, WeaponLoader } from './components/GameIcons';
import { soundService } from './services/SoundService';
import { GAME_TEXT } from './config/textConfig';
import { UPGRADE_CONFIG } from './config/upgradeConfig'; // 업그레이드 중앙 설정 파일 임포트
import { GAME_VERSION } from './config/gameConfig'; // [NEW] 게임 버전 임포트

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

const ASSETS = {
  CHAR_DEFAULT: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny.png",
  CHAR_MP5: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_mp5.png",
  CHAR_RIFLE: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_rifle.png",
  CHAR_SHOTGUN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_shotgun.png",
  WEAPON_M1911: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png",
  WEAPON_MP5: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png",
  WEAPON_RIFLE: "https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png",
  WEAPON_SHOTGUN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png",
  LOADING_SCREEN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_loding01.png",
  CHAR_SAD: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_sad.png"
};

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
    // GameCanvas에서 계산된 업그레이드가 적용된 최대 탄약. UI 표시에 사용됩니다.
    maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo, 
    score: 0, 
    wave: 1,
    xp: 0,
    maxXp: 100,
    level: 1,
    stamina: PLAYER_STATS.maxStamina,
    maxStamina: PLAYER_STATS.maxStamina,
  });
  const [missionText, setMissionText] = useState<string>("Initializing secure link...");
  const [gameOverText, setGameOverText] = useState<string>("");
  const [finalReport, setFinalReport] = useState<{score: number, kills: number, wave: number} | null>(null);
  
  // 메뉴 화면 이미지 로딩 상태 (무기별로 분리)
  const [charLoaded, setCharLoaded] = useState(false);
  const [weaponLoaded, setWeaponLoaded] = useState(false);
  const [charMp5Loaded, setCharMp5Loaded] = useState(false);
  const [weaponMp5Loaded, setWeaponMp5Loaded] = useState(false);
  const [charRifleLoaded, setCharRifleLoaded] = useState(false);
  const [weaponRifleLoaded, setWeaponRifleLoaded] = useState(false);
  const [charShotgunLoaded, setCharShotgunLoaded] = useState(false);
  const [weaponShotgunLoaded, setWeaponShotgunLoaded] = useState(false);

  // 업그레이드 창 이미지 로딩 상태
  const [upgradeWeaponLoaded, setUpgradeWeaponLoaded] = useState(false);
  const [loadedUpgradeIcons, setLoadedUpgradeIcons] = useState<Record<string, boolean>>({});

  // 무기 업그레이드 3D 틸트 효과를 위한 상태
  const [hoveredPart, setHoveredPart] = useState<WeaponPart | null>(null);

  // --- 개발자 모드 ---
  const [isUpgradeDevMode, setIsUpgradeDevMode] = useState(false);
  const [devUpgradePositions, setDevUpgradePositions] = useState(WEAPONS[selectedWeaponKey].upgradePositions);
  const [devCharPosition, setDevCharPosition] = useState(WEAPONS[selectedWeaponKey].characterPosition);
  const [devInputValues, setDevInputValues] = useState<any>({});

  // --- HUD 개발자 모드 ---
  const [isHudDevMode, setIsHudDevMode] = useState(false);
  const [hudDevSettings, setHudDevSettings] = useState({
      right: parseFloat(PLAYER_HUD_SETTINGS.right),
      bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
      width: parseFloat(PLAYER_HUD_SETTINGS.width),
  });
  
  // --- 게임오버 UI 개발자 모드 ---
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
  
  // 탄약 UI를 실제 탄피처럼 보이게 하는 컴포넌트
  const BulletUI = ({ isLoaded }: { isLoaded: boolean }) => {
    return (
      <div className={`relative w-2.5 h-6 rounded-sm transition-colors duration-200 ${isLoaded ? 'bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-800'}`}>
        {/* 광택(Highlight) 효과 */}
        <div className="absolute inset-0 rounded-sm border-t border-l border-white/30"></div>
        {/* 그림자(Shadow) 효과 */}
        <div className="absolute inset-0 rounded-sm border-b border-r border-black/40"></div>
      </div>
    );
  };

  // 무기별 이미지와 로딩 상태를 관리하는 객체
  const WEAPON_ASSETS = {
      Pistol: {
          char: ASSETS.CHAR_DEFAULT,
          weapon: ASSETS.WEAPON_M1911,
          Icon: PistolIcon,
          upgradeImage: ASSETS.WEAPON_M1911,
          charLoaded: charLoaded,
          setCharLoaded: setCharLoaded,
          weaponLoaded: weaponLoaded,
          setWeaponLoaded: setWeaponLoaded,
      },
      MP5: {
          char: ASSETS.CHAR_MP5,
          weapon: ASSETS.WEAPON_MP5,
          Icon: MP5Icon,
          upgradeImage: ASSETS.WEAPON_MP5,
          charLoaded: charMp5Loaded,
          setCharLoaded: setCharMp5Loaded,
          weaponLoaded: weaponMp5Loaded,
          setWeaponLoaded: setWeaponMp5Loaded,
      },
      Rifle: {
          char: ASSETS.CHAR_RIFLE,
          weapon: ASSETS.WEAPON_RIFLE,
          Icon: RifleIcon,
          upgradeImage: ASSETS.WEAPON_RIFLE,
          charLoaded: charRifleLoaded,
          setCharLoaded: setCharRifleLoaded,
          weaponLoaded: weaponRifleLoaded,
          setWeaponLoaded: setWeaponRifleLoaded,
      },
      Shotgun: {
          char: ASSETS.CHAR_SHOTGUN,
          weapon: ASSETS.WEAPON_SHOTGUN,
          Icon: ShotgunIcon,
          upgradeImage: ASSETS.WEAPON_SHOTGUN,
          charLoaded: charShotgunLoaded,
          setCharLoaded: setCharShotgunLoaded,
          weaponLoaded: weaponShotgunLoaded,
          setWeaponLoaded: setWeaponShotgunLoaded,
      }
  };

  useEffect(() => {
    const preloadAssets = async () => {
      const baseAssetUrls = Object.values(ASSETS);
      // UPGRADE_CONFIG에서 아이콘 URL을 가져오도록 수정
      const upgradeIconUrls = Object.values(UPGRADE_CONFIG).map(part => part.ICON);
      const imageUrls = [...new Set([...baseAssetUrls, ...upgradeIconUrls])]; // 중복 제거

      const totalAssets = imageUrls.length + Object.keys(soundService.SOUND_ASSETS_CONFIG).length; // 사운드 에셋 개수 포함
      let loadedCount = 0;
      
      // 이미지 로딩 프로미스 배열 생성
      const imagePromises = imageUrls.map(url => {
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
      
      // 이미지 로딩 대기
      await Promise.all(imagePromises);

      // 사운드 서비스 초기화 및 로드 대기 (비동기 처리)
      try {
        await soundService.init(); // init은 이제 async 함수
        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length; // 로드된 사운드 수만큼 카운트 증가
        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
      } catch (error) {
        console.error("사운드 서비스 초기화 실패:", error);
        // 에러가 발생해도 로딩 진행률은 업데이트하여 멈추지 않도록 함
        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length; 
        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
      }

      // 최종적으로 모든 에셋 로딩 완료 후 상태 변경
      setIsLoadingAssets(false);
    };
    preloadAssets();
  }, []);

  // 이 useEffect는 메뉴 화면에 처음 진입할 때만 실행됩니다.
  // (미션 텍스트 생성, 사운드 로드, 업그레이드 초기화)
  useEffect(() => {
    if (gameStatus === GameStatus.MENU) {
      // [수정] "신호 해독 중..." 애니메이션을 위한 인위적인 지연 시간 제거
      setMissionText(getRandomText(GAME_TEXT.MISSION_BRIEFINGS));
      
      // [제거] soundService.loadCustomSoundsFromStorage(); // preloadAssets에서 처리됨
      
      // 업그레이드 초기화
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

  // 이 useEffect는 레벨업 화면이 뜰 때 실행됩니다.
  // (개발자 모드용 좌표 초기화 등)
  useEffect(() => {
    if (gameStatus === GameStatus.LEVEL_UP) {
      setHoveredPart(null);
      
      // --- Dev Mode Init ---
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
      // --- End Dev Mode Init ---
    }
  }, [gameStatus, selectedWeaponKey]);


  useEffect(() => {
    // 무기 변경 또는 게임 메뉴로 돌아올 때, `stats`의 `maxAmmo`를 해당 무기의 기본값으로 설정
    if (gameStatus === GameStatus.MENU) {
        const weapon = WEAPONS[selectedWeaponKey];
        setStats(prev => ({ ...prev, ammo: weapon.maxAmmo, maxAmmo: weapon.maxAmmo }));
    }
  }, [selectedWeaponKey, gameStatus]);
  
  // 업그레이드 화면 개발자 모드 토글 핸들러
  useEffect(() => {
    if (gameStatus !== GameStatus.LEVEL_UP) {
        setIsUpgradeDevMode(false); // 화면 벗어나면 항상 비활성화
        return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Backquote') { // ` key
            e.preventDefault();
            setIsUpgradeDevMode(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus]);

  // 인게임 HUD 개발자 모드 토글 핸들러
  useEffect(() => {
    if (gameStatus !== GameStatus.PLAYING) {
      setIsHudDevMode(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        e.preventDefault();
        setIsHudDevMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus]);

  // 게임오버 화면 개발자 모드 토글 핸들러
  useEffect(() => {
    if (gameStatus !== GameStatus.GAME_OVER) {
      setIsGameOverDevMode(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') { // ` key
        e.preventDefault();
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
      // soundService.init(); // preloadAssets에서 이미 호출됨
      setWaitingForInput(false);
    }
  };

  const handleStartGame = () => {
    // soundService.init(); // preloadAssets에서 이미 호출됨
    setGameStatus(GameStatus.PLAYING);
  };

  const handleGameOver = (finalScore: number, kills: number, wave: number) => {
    setGameStatus(GameStatus.GAME_OVER);
    setFinalReport({ score: finalScore, kills, wave });

    // [수정] 인위적인 지연 시간을 제거하고, 게임 오버 즉시 최종 보고서 내용을 설정합니다.
    const messagePool = finalScore >= 500 ? GAME_TEXT.HIGH_SCORE_REPORTS : GAME_TEXT.LOW_SCORE_REPORTS;
    const flavorText = getRandomText(messagePool);
    const report = `${flavorText} (최종 점수: ${finalScore}, 처치: ${kills})`;
    setGameOverText(report);
  };

  const handleUpdateStats = (newStats: { health: number; ammo: number; maxAmmo: number; score: number; wave: number; xp: number; maxXp: number; level: number; stamina: number; maxStamina: number; }) => {
    // GameCanvas로부터 업그레이드가 적용된 maxAmmo를 받아서 상태 업데이트
    setStats(newStats);
  };

  const handleShoot = useCallback((firedAmmoIndex: number) => {
      if (firedAmmoIndex < 1) return;

      const config = WEAPONS[selectedWeaponKey].uiCasingPhysics;
      let rect: { left: number; top: number; width: number; height: number } | null = null;
      
      const el = document.getElementById(`bullet-${firedAmmoIndex}`);
      
      if (el) {
        rect = el.getBoundingClientRect();
      } else {
        const container = document.getElementById('ammo-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            
            // Layout Logic (renderGameUI와 동일한 로직) - 직사각형 탄피 UI
            const bulletWidth = 10; // w-2.5 = 10px
            const bulletHeight = 24; // h-6 = 24px
            const gap = 4; // gap-1 = 4px
            const bottomRowMarginLeft = 10; // ml-2.5

            const isTopRow = firedAmmoIndex % 2 !== 0;
            const colIndex = Math.floor((firedAmmoIndex - 1) / 2);
            
            const offsetX = colIndex * (bulletWidth + gap) + (isTopRow ? 0 : bottomRowMarginLeft);
            const offsetY = isTopRow ? 0 : (bulletHeight + gap);

            rect = {
                left: containerRect.left + offsetX,
                top: containerRect.top + offsetY,
                width: bulletWidth,
                height: bulletHeight
            };
        }
      }

      if (rect) {
        casingsRef.current.push({
          id: Math.random().toString(),
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          vx: config.velocity.x + (Math.random() - 0.5) * config.velocityVariance.x,
          vy: config.velocity.y + (Math.random() - 0.5) * config.velocityVariance.y,
          rotation: 0,
          vRotation: (Math.random() - 0.5) * config.rotationSpeed,
          life: config.life,
          maxLife: config.life,
          color: '#fbbf24'
        });
      }
  }, [selectedWeaponKey]);

  const handleUpgrade = (part: WeaponPart) => {
    setUpgradeLevels(prev => ({
        ...prev,
        [part]: prev[part] + 1
    }));
    setGameStatus(GameStatus.PLAYING); // 게임 재개
  };

  /**
   * 메뉴에서 무기를 선택했을 때 호출되는 핸들러입니다.
   * @param key 선택된 무기의 고유 키 (예: 'Pistol', 'MP5')
   */
  const handleSelectWeapon = (key: keyof typeof WEAPONS) => {
    // 이미 선택된 무기를 다시 클릭하면 아무것도 하지 않습니다.
    if (selectedWeaponKey === key) return;

    // 선택된 무기 상태를 업데이트합니다.
    setSelectedWeaponKey(key);
    // UI 선택 사운드를 재생합니다.
    soundService.play('uiSelect');
  };
  
  // --- 업그레이드 화면 개발자 모드 함수 ---
  const handleUpgradeDevInputChange = (key: string, axis: 'ux' | 'uy' | 'ax' | 'ay' | 'x' | 'y', value: string) => {
      if (!/^-?\d*$/.test(value)) return;

      setDevInputValues(prev => ({
          ...prev,
          [key]: { ...prev[key], [axis]: value }
      }));

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
    let output = `// Paste this into weaponDb.ts\n\n`; // weaponDb.ts로 변경
    
    // Character Position
    output += `// Character Position for ${weaponKey}\n`;
    output += `const ${weaponKey}_CHAR_POS = { x: ${devCharPosition.x}, y: ${devCharPosition.y} };\n\n`;

    // Part Positions
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
    output += `  ui: {\n`; // ui 객체 안에 upgradePositions와 characterPosition이 있습니다.
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
  // ---

  // --- HUD 개발자 모드 함수 ---
  const handleHudDevInputChange = (key: 'right' | 'bottom' | 'width', value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setHudDevSettings(prev => ({
        ...prev,
        [key]: parsedValue,
      }));
    }
  };

  const handleCopyHudConfig = () => {
    const output = `// Paste this into config/playerConfig.ts

export const PLAYER_HUD_SETTINGS = {
  right: '${hudDevSettings.right}rem',
  bottom: '${hudDevSettings.bottom}rem',
  width: '${hudDevSettings.width}rem',
};
`;
    navigator.clipboard.writeText(output).then(() => {
      alert('HUD Config copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy HUD config: ', err);
    });
  };
  // ---

  // --- 게임오버 UI 개발자 모드 함수 ---
  const handleGameOverDevInputChange = (key: 'width' | 'left' | 'bottom', value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setGameOverDevSettings(prev => ({
        ...prev,
        [key]: parsedValue,
      }));
    }
  };

  const handleCopyGameOverConfig = () => {
    const output = `// Paste this into config/playerConfig.ts

export const GAME_OVER_UI_SETTINGS = {
  imageWidth: '${gameOverDevSettings.width}rem',
  imageLeft: '${gameOverDevSettings.left}rem',
  imageBottom: '${gameOverDevSettings.bottom}rem',
};
`;
    navigator.clipboard.writeText(output).then(() => {
      alert('Game Over UI Config copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy Game Over UI config: ', err);
    });
  };
  // ---

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
            // 시인성을 위해 테두리 추가
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
  }, [selectedWeaponKey, waitingForInput]); // waitingForInput 추가

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
            <img src={ASSETS.LOADING_SCREEN} className="w-full h-full object-cover opacity-80 filter contrast-110" alt="Loading Background" />
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

  // 로딩 화면이거나 사용자 입력을 기다리는 중이면 로딩 화면을 먼저 반환
  if (waitingForInput) {
    return renderLoadingScreen();
  }
    
  const currentWeaponAsset = WEAPON_ASSETS[selectedWeaponKey];

  // 업그레이드 화면 위치 데이터 (개발자 모드 여부에 따라 결정)
  const currentUpgradePositions = isUpgradeDevMode ? devUpgradePositions : WEAPONS[selectedWeaponKey].upgradePositions;
  const upgradeCharPos = isUpgradeDevMode ? devCharPosition : WEAPONS[selectedWeaponKey].characterPosition;

  // 인게임 HUD 위치 데이터 (개발자 모드 여부에 따라 결정)
  const currentHudSettings = isHudDevMode ? hudDevSettings : {
    right: parseFloat(PLAYER_HUD_SETTINGS.right),
    bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
    width: parseFloat(PLAYER_HUD_SETTINGS.width),
  };

  const hudStyle = {
    right: `${currentHudSettings.right}rem`,
    bottom: `${currentHudSettings.bottom}rem`,
    width: `${currentHudSettings.width}rem`,
  };

  // 게임오버 UI 위치 데이터 (개발자 모드 여부에 따라 결정)
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

  // 설정 파일에서 업그레이드 화면의 무기 이미지 스케일 값을 가져옵니다.
  const upgradeImageScale = WEAPONS[selectedWeaponKey].upgradeImageScale || 1.0;

  // 무기 틸트 효과 계산
  // 기본 transform 문자열에 scale(${upgradeImageScale})을 추가합니다.
  let weaponTiltStyle = { transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(0deg) rotateY(0deg)`, transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };
  if (hoveredPart) {
      const pos = currentUpgradePositions[hoveredPart];
      if (pos) {
          // 최대 기울기 각도 (도). 이 값을 높이면 마우스 호버 시 무기가 더 많이 기울어집니다. (예: 15 -> 25)
          const maxTilt = 25; 
          // 화면 중앙 기준 좌표를 이용해 회전값 계산
          // Y가 클수록(아래) X축 양(+)의 회전, X가 클수록(오른쪽) Y축 음(-)의 회전
          const rotX = (pos.y / 250) * maxTilt; // 최대 Y 오프셋 기준
          const rotY = -(pos.x / 450) * maxTilt; // 최대 X 오프셋 기준
          weaponTiltStyle = {
              ...weaponTiltStyle,
              // 호버 시 transform 문자열에도 scale(${upgradeImageScale})을 포함시켜 크기가 유지되도록 합니다.
              transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
          };
      }
  }

  // --- 탄약 UI 렌더링을 위한 계산 ---
  const totalBullets = stats.maxAmmo;
  const currentAmmo = stats.ammo;
  const bulletsInFirstRow = Math.ceil(totalBullets / 2);
  const bulletsInSecondRow = Math.floor(totalBullets / 2);
  const bulletsLeftInTopRow = Math.ceil(currentAmmo / 2);
  const bulletsLeftInBottomRow = Math.floor(currentAmmo / 2);

  // 현재 무기의 HUD 아이콘 스케일 값을 설정 파일에서 가져옵니다.
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
      isPaused={isHudDevMode || gameStatus === GameStatus.LEVEL_UP || gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.MENU}
    />

    {/* UI용 탄피 캔버스 - Z-Index를 50으로 높여서 다른 UI 위에 확실히 그려지게 함 */}
    <canvas ref={uiCanvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }} />

    {/* 인게임 HUD 개발자 모드 */}
    {isHudDevMode && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto">
        <p className="font-bold text-sm uppercase">HUD Dev Mode</p>
        <div className="flex gap-2 items-center">
          <label className="text-xs font-bold">Right (rem):</label>
          <input type="number" step="0.1" value={hudDevSettings.right} onChange={(e) => handleHudDevInputChange('right', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">Bottom (rem):</label>
          <input type="number" step="0.1" value={hudDevSettings.bottom} onChange={(e) => handleHudDevInputChange('bottom', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
          <label className="text-xs font-bold">Width (rem):</label>
          <input type="number" step="0.1" value={hudDevSettings.width} onChange={(e) => handleHudDevInputChange('width', e.target.value)} className="w-16 bg-black/20 text-white text-xs p-1 rounded text-center" />
        </div>
        <button onClick={handleCopyHudConfig} className="bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700">
          Copy Config
        </button>
      </div>
    )}

    {/* 인게임 HUD: 레벨업 시에도 DOM에서 제거되지 않도록 렌더링 조건 수정 */}
    {(gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.LEVEL_UP) && (
      <>
        <div className="absolute inset-0 pointer-events-none py-1 px-4 flex flex-col justify-between z-20">
          <div className="flex justify-between items-start pt-2">
            {/* [MODIFIED] 조작법 UI (좌측 상단) - 배경 제거 및 크기 축소 */}
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
                {/* HUD 컨테이너 min-width 증가 및 내부 아이콘 크기 조정 */}
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md pb-2 px-4 pr-8 rounded-tr-3xl shadow-2xl min-w-[440px]">
                    <div className="flex flex-col items-center justify-center w-60 shrink-0">
                      {/* 무기 아이콘 확대 (w-48 -> w-60, h-28 -> h-32) 및 내부 이미지 스케일 업 */}
                      <div className="w-full h-32 flex items-center justify-center">
                          {/* 설정 파일에서 가져온 hudIconScale 값으로 이미지 크기를 동적으로 조절합니다. */}
                          <currentWeaponAsset.Icon 
                            className="w-full h-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.8)] filter brightness-110"
                            style={{ transform: `scale(${hudIconScale})` }}
                          /> 
                      </div>
                    </div>
                    <div className="w-px h-20 bg-gray-600/50"></div>
                    {/* [수정] 무기 정보 컨테이너: justify-center 제거하여 상단 정렬 */}
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex justify-between items-end border-b border-gray-600/50 pb-1">
                          <div className="flex flex-col mb-1">
                              <span className="text-2xl font-black text-white tracking-wider leading-none">{WEAPONS[selectedWeaponKey].name}</span>
                              <span className="text-xs text-gray-400 uppercase leading-none mt-0.5">{WEAPONS[selectedWeaponKey].type}</span>
                          </div>
                          <div className="text-5xl font-bold text-yellow-400 leading-none pl-6 shadow-black drop-shadow-md flex items-baseline">
                              {/* 탄약 수가 변경되어도 레이아웃이 흔들리지 않도록 고정 너비(w-14)와 오른쪽 정렬(text-right)을 추가합니다. */}
                              <span className="inline-block w-14 text-right">{stats.ammo}</span>
                              <span className="text-xl text-gray-500 ml-1">/{stats.maxAmmo}</span>
                          </div>
                      </div>
                      
                      {/* [수정] 레벨과 경험치 바를 한 줄에 나란히 배치하고, 상단 여백(mt-1)을 제거하여 더 컴팩트하게 만듭니다. */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-yellow-600 font-bold text-lg">LV.</span>
                          <span className="text-yellow-400 font-black text-4xl text-shadow-glow tracking-wider">
                            {stats.level.toString().padStart(2, '0')}
                          </span>
                        </div>
                        {/* 경험치 바 컨테이너 */}
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

                      {/* [수정] 탄약 UI의 상단 여백(mt-1)을 제거합니다. */}
                      <div id="ammo-container" className="flex flex-col gap-1 h-auto">
                            {/* Top Row (홀수 번호 총알: 1, 3, 5...) */}
                            <div className="flex gap-1 h-6">
                                {Array.from({ length: bulletsInFirstRow }).map((_, i) => {
                                    const bulletId = (i * 2) + 1;
                                    return (
                                      <div key={`top-${i}`} id={`bullet-${bulletId}`}>
                                        <BulletUI isLoaded={i < bulletsLeftInTopRow} />
                                      </div>
                                    );
                                })}
                            </div>
                            {/* Bottom Row (짝수 번호 총알: 2, 4, 6...) */}
                            {bulletsInSecondRow > 0 && (
                              <div className="flex gap-1 h-6 ml-2.5">
                                  {Array.from({ length: bulletsInSecondRow }).map((_, i) => {
                                      const bulletId = (i * 2) + 2;
                                      return (
                                        <div key={`bottom-${i}`} id={`bullet-${bulletId}`}>
                                          <BulletUI isLoaded={i < bulletsLeftInBottomRow} />
                                        </div>
                                      );
                                  })}
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* 오른쪽 하단 캐릭터 초상화 및 체력바 */}
        <div style={hudStyle} className="absolute flex flex-col gap-2 z-10 opacity-90 pointer-events-none pr-2">
            <img
                src={currentWeaponAsset.char}
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

    {/* Level Up Blueprint UI: 조건부 렌더링에서 투명도 제어로 변경 */}
    <div className={`absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 overflow-hidden transition-opacity duration-300 ${gameStatus === GameStatus.LEVEL_UP ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Dev Mode UI */}
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

        {/* Container for positioning character and modal */}
        <div className="relative">
            {/* Main Modal Container */}
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
                    {!upgradeWeaponLoaded && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                          <WeaponLoader className="w-full h-full" />
                      </div>
                    )}
                    
                    <div className="absolute top-1/2 left-1/2 w-0 h-0 z-20" style={{ perspective: '1500px' }}>
                      
                      <svg className="absolute top-0 left-0 overflow-visible z-30 pointer-events-none">
                          {Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                              // FIX: `pos`가 `unknown` 타입으로 추론되는 문제를 해결하기 위해 명시적으로 타입을 지정합니다.
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

                      {/* 개발자 모드: 앵커 포인트 좌표 표시 (HTML로 변경) */}
                      {isUpgradeDevMode && Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                          // FIX: `pos`가 `unknown` 타입으로 추론되는 문제를 해결하기 위해 명시적으로 타입을 지정합니다.
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
                          <img 
                              src={currentWeaponAsset.upgradeImage} 
                              alt={WEAPONS[selectedWeaponKey].name}
                              className={`max-w-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-opacity duration-300 ${upgradeWeaponLoaded ? 'opacity-100' : 'opacity-0'}`}
                              onLoad={() => setUpgradeWeaponLoaded(true)}
                          />
                      </div>

                      {Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                          // FIX: `pos`가 `unknown` 타입으로 추론되는 문제를 해결하기 위해 명시적으로 타입을 지정합니다.
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
                                {/* 개발자 모드: UI 박스 좌표 표시 (z-index 추가) */}
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
                                              {!loadedUpgradeIcons[part] && <div className="w-8 h-8 border border-green-500/30 flex items-center justify-center"><div className="w-1 h-1 bg-green-500/50 rounded-full"></div></div>}
                                              <img src={info.ICON} alt={info.NAME} className={`absolute inset-0 w-full h-full object-contain p-1 transition-opacity duration-300 ${loadedUpgradeIcons[part] ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoadedUpgradeIcons(prev => ({...prev, [part]: true}))}/>
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

                                  {/* Dev Mode Input Fields (레이아웃 개선 및 z-index 추가) */}
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
                  {!currentWeaponAsset.charLoaded && <TacticalLoader className="absolute inset-0 z-20" />}
                  {Object.entries(WEAPON_ASSETS).map(([key, asset]) => (
                      <img 
                          key={key}
                          src={asset.char} 
                          alt={GAME_TEXT.MENU.CHAR_NAME} 
                          className={`absolute inset-0 w-full h-full object-cover object-[40%_50%] transition-opacity duration-300 ${selectedWeaponKey === key ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                          onLoad={() => asset.setCharLoaded(true)}
                      />
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-24 z-20 pointer-events-none">
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
                  {/* [수정] 전체 무기 선택 그리드에 `relative` 및 `overflow-hidden`을 추가합니다. */}
                  <div className="grid grid-cols-4 gap-4 h-56 relative overflow-hidden">
                      {/* [수정] 스캔 이펙트를 각 슬롯에서 제거하고, 그리드 전체를 덮도록 단일화합니다. */}
                      <div className="animate-scan pointer-events-none absolute inset-0 z-[15]"></div>
                      {Object.entries(WEAPONS).map(([key, weapon]) => {
                          const assetInfo = WEAPON_ASSETS[key as keyof typeof WEAPONS];
                          const isSelected = selectedWeaponKey === key;
                          
                          const slotClasses = isSelected
                              ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                              : 'border-gray-700 bg-gray-900 opacity-60';

                          return (
                              <div
                                  key={key}
                                  onClick={() => handleSelectWeapon(key as keyof typeof WEAPONS)}
                                  className={`relative h-full border-2 rounded flex flex-col cursor-pointer transition-all hover:bg-gray-800 overflow-hidden ${slotClasses}`}
                              >
                                  {!assetInfo.weaponLoaded && <WeaponLoader className="absolute inset-0" />}
                                  
                                  {/* [수정] 콘텐츠 컨테이너에 `items-start`를 추가하여 상단 정렬을 강제합니다. */}
                                  <div className="relative z-10 flex flex-col w-full h-full p-2 bg-gray-900 gap-1 items-start">
                                      {/* [유지] 텍스트가 흔들리지 않도록 고정 높이, 줄바꿈 방지 등의 클래스를 유지합니다. */}
                                      <div className="h-5 text-sm font-bold text-gray-300 w-full text-left flex-shrink-0 leading-none whitespace-nowrap overflow-hidden text-ellipsis transform-gpu">{weapon.name}</div>
                                      
                                      {/* [수정] 무기 아이콘 컨테이너의 높이를 `h-28`로 고정합니다. */}
                                      <div className="relative w-full h-28 flex items-center justify-center overflow-hidden">
                                          <img 
                                              src={assetInfo.weapon} 
                                              alt={weapon.name} 
                                              className={`w-full h-full object-contain drop-shadow-lg transition-opacity duration-300 ${assetInfo.weaponLoaded ? 'opacity-100' : 'opacity-0'}`}
                                              style={{ transform: `scale(${weapon.menuIconScale || 1})` }}
                                              onLoad={() => assetInfo.setWeaponLoaded(true)}
                                          />
                                      </div>
                                      
                                      <div className="w-full space-y-1 flex-shrink-0 mt-auto">
                                          <StatBar label="DMG" value={weapon.damage * (weapon.pelletCount || 1)} max={80} color="bg-red-500" />
                                          <StatBar label="RATE" value={weapon.fireRate} max={900} color="bg-yellow-500" invert />
                                          <StatBar label="MAG" value={weapon.maxAmmo} max={30} color="bg-blue-500" />
                                          <StatBar label="PEN" value={weapon.penetration.count} max={5} color="bg-purple-500" />
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      
                  </div>
              </div>
              <button onClick={handleStartGame} className="w-full py-5 bg-green-700 hover:bg-green-600 text-white font-bold text-2xl tracking-widest uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-green-500">{GAME_TEXT.MENU.DEPLOY_BUTTON}</button>
            </div>
          </div>
      </div>
    )}

    {gameStatus === GameStatus.GAME_OVER && finalReport && (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-900/40 backdrop-blur-md">
        
        {/* 게임오버 UI 개발자 모드 */}
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
          <img
              src={ASSETS.CHAR_SAD}
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
              setStats({ health: PLAYER_STATS.maxHealth, ammo: WEAPONS[selectedWeaponKey].maxAmmo, maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo, score: 0, wave: 1, xp: 0, maxXp: 100, level: 1, stamina: PLAYER_STATS.maxStamina, maxStamina: PLAYER_STATS.maxStamina });
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