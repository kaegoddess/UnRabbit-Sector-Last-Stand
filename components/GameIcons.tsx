import React, { useState } from 'react';
import { GAME_TEXT } from '../config/textConfig';

// Define props for WeaponIcon
interface WeaponIconProps {
  imagePaths: string[];
  fallback: React.ReactElement;
  className?: string;
  alt: string;
  style?: React.CSSProperties;
}

// Define props for wrapper icons like PistolIcon
interface WeaponIconWrapperProps {
  className?: string;
  style?: React.CSSProperties;
}

// 로딩 중일 때 보여줄 전술적 스캔 UI (캐릭터용, 텍스트 포함)
export const TacticalLoader: React.FC<{ className?: string, text?: string }> = ({ className, text = GAME_TEXT.SYSTEM.RETRIEVING }) => (
  // 이 컨테이너는 위치와 크기만 담당하며, 내부 콘텐츠는 각자 위치를 잡습니다.
  <div className={`relative bg-gray-950 overflow-hidden border border-green-900/50 ${className}`}>
     {/* Grid Background */}
     <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

     {/* Full Vertical Scan Animation - 이 라인은 App.tsx로 이동하여 항상 표시되도록 수정되었습니다. */}

     {/* Text */}
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-green-500 text-[10px] md:text-xs font-bold tracking-widest animate-pulse flex flex-col items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
        <span>{text}</span>
        <span className="text-[8px] opacity-70">{GAME_TEXT.SYSTEM.ENCRYPTED}</span>
     </div>
  </div>
);

// 로딩 중일 때 보여줄 그래픽 게이지 UI (무기용, 텍스트 없음)
export const WeaponLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative bg-gray-900 flex items-center justify-center overflow-hidden ${className}`}>
     {/* Fine Grid Background */}
     <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

     {/* Full Vertical Scan Animation - 이 라인은 App.tsx로 이동하여 항상 표시되도록 수정되었습니다. */}

     {/* Central Reticle / HUD Element */}
     <div className="z-10 relative flex flex-col items-center justify-center opacity-30">
        <div className="w-8 h-8 border border-green-500/50 rounded-full flex items-center justify-center relative">
             <div className="w-1 h-1 bg-green-500 rounded-full"></div>
             {/* Crosshairs */}
             <div className="absolute top-0 bottom-0 w-px bg-green-500/50"></div>
             <div className="absolute left-0 right-0 h-px bg-green-500/50"></div>
        </div>
        {/* Corner Brackets */}
        <div className="absolute -top-4 -left-6 w-2 h-2 border-t border-l border-green-500/50"></div>
        <div className="absolute -top-4 -right-6 w-2 h-2 border-t border-r border-green-500/50"></div>
        <div className="absolute -bottom-4 -left-6 w-2 h-2 border-b border-l border-green-500/50"></div>
        <div className="absolute -bottom-4 -right-6 w-2 h-2 border-b border-r border-green-500/50"></div>
     </div>
  </div>
);

// PNG 로드 실패 시 보여줄 벡터(SVG) 아이콘 - M1911
// `export` 키워드를 추가하여 이 컴포넌트가 다른 파일에서 import 될 수 있도록 합니다.
export const M1911Vector: React.FC<WeaponIconWrapperProps> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* SVG linearGradient의 x2, y2 속성 값 형식을 수정합니다. */}
      <linearGradient id="slideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c8c8c8" />
        <stop offset="50%" stopColor="#8c8c8c" />
        <stop offset="100%" stopColor="#4d4d4d" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect x="20" y="30" width="160" height="60" rx="5" fill="url(#slideGradient)" filter="url(#glow)"/>
    <rect x="15" y="60" width="30" height="20" rx="3" fill="#333"/>
    <path d="M180 60 L185 55 L185 75 L180 70 Z" fill="#444"/>
    <rect x="50" y="90" width="100" height="15" rx="3" fill="#333"/>
    <rect x="160" y="55" width="20" height="10" rx="2" fill="#444"/>
    <circle cx="170" cy="60" r="2" fill="#f8d167"/>
  </svg>
);

// MP5 벡터 아이콘 컴포넌트를 `export`합니다.
export const MP5Vector: React.FC<WeaponIconWrapperProps> = ({ className }) => (
  <svg viewBox="0 0 220 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mp5BodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="50%" stopColor="#4b5563" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <filter id="mp5Glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Body */}
    <rect x="20" y="40" width="150" height="30" rx="3" fill="url(#mp5BodyGradient)" filter="url(#mp5Glow)"/>
    {/* Barrel */}
    <rect x="170" y="45" width="30" height="20" rx="2" fill="#111827"/>
    {/* Stock */}
    <rect x="5" y="45" width="15" height="20" rx="2" fill="#374151"/>
    {/* Magazine */}
    <rect x="100" y="68" width="15" height="30" rx="2" fill="#1f2937"/>
    {/* Sight */}
    <rect x="70" y="30" width="30" height="8" rx="1" fill="#111827"/>
    {/* Handle */}
    <path d="M60 70 Q70 85 80 70 L80 60 L60 60 Z" fill="#374151"/>
  </svg>
);

// Rifle 벡터 아이콘 컴포넌트를 `export`합니다.
export const RifleVector: React.FC<WeaponIconWrapperProps> = ({ className }) => (
  <svg viewBox="0 0 250 80" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rifleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a3a3a3" />
        <stop offset="50%" stopColor="#737373" />
        <stop offset="100%" stopColor="#404040" />
      </linearGradient>
      <filter id="rifleGlow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Stock */}
    <path d="M10 40 Q20 20 50 20 L70 20 L70 60 L50 60 Q20 60 10 40 Z" fill="#5d4037"/>
    {/* Body */}
    <rect x="60" y="30" width="100" height="20" rx="3" fill="url(#rifleGradient)" filter="url(#rifleGlow)"/>
    {/* Barrel */}
    <rect x="160" y="35" width="70" height="10" rx="2" fill="#212121"/>
    {/* Sight */}
    <rect x="100" y="25" width="20" height="5" rx="1" fill="#333"/>
    {/* Magazine */}
    <rect x="110" y="50" width="10" height="20" rx="2" fill="#333"/>
  </svg>
);

// Shotgun 벡터 아이콘 컴포넌트를 `export`합니다.
export const ShotgunVector: React.FC<WeaponIconWrapperProps> = ({ className }) => (
  <svg viewBox="0 0 250 80" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shotgunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cc7a29" />
        <stop offset="50%" stopColor="#a35f20" />
        <stop offset="100%" stopColor="#7a4718" />
      </linearGradient>
      <filter id="shotgunGlow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Stock */}
    <path d="M10 40 Q20 20 50 20 L70 20 L70 60 L50 60 Q20 60 10 40 Z" fill="#8b4513"/>
    {/* Body */}
    <rect x="60" y="30" width="100" height="20" rx="3" fill="url(#shotgunGradient)" filter="url(#shotgunGlow)"/>
    {/* Pump */}
    <rect x="70" y="33" width="30" height="14" rx="2" fill="#423532"/>
    {/* Barrel */}
    <rect x="160" y="35" width="70" height="10" rx="2" fill="#303030"/>
  </svg>
);


// 이미지 경로가 없을 경우를 대비하여 폴백 처리하는 헬퍼 컴포넌트입니다.
// 이 컴포넌트 자체도 외부에 노출되어야 하므로 `export` 합니다.
export const WeaponIcon: React.FC<WeaponIconProps> = ({ imagePaths, fallback, className, alt, style }) => {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (currentPathIndex < imagePaths.length - 1) {
      // 다음 경로 시도
      setCurrentPathIndex(prev => prev + 1);
      setIsLoaded(false); // 이미지 로딩 상태 초기화
    } else {
      // 모든 경로 실패, 폴백 사용
      setUseFallback(true);
    }
  };

  const handleLoad = () => setIsLoaded(true);

  if (useFallback) {
    return <>{fallback}</>;
  }

  // 이미지 경로가 비어있는 경우 즉시 폴백 사용
  if (!imagePaths || imagePaths.length === 0) {
      // 이 부분은 React 렌더링 사이클 외부에서 상태를 업데이트하므로,
      // `useEffect`로 래핑하거나 초기 렌더링 시점에만 검사하는 것이 더 안전합니다.
      // 현재는 렌더링 도중 상태 업데이트가 발생할 수 있어 주의가 필요하지만,
      // 대부분의 경우 `imagePaths`가 props로 바로 전달되어 초기화되므로 큰 문제는 없습니다.
      setUseFallback(true);
      return <>{fallback}</>;
  }

  return (
    <div style={style} className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <img
        key={imagePaths[currentPathIndex]} // key를 변경하여 React가 새로운 img 요소를 마운트하도록 함
        src={imagePaths[currentPathIndex]}
        alt={alt}
        className={`w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

// PistolIcon 컴포넌트를 `export`합니다.
export const PistolIcon: React.FC<WeaponIconWrapperProps> = ({ className, style }) => (
    <WeaponIcon 
      imagePaths={['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png', '/m1911.png', 'm1911.png']} 
      fallback={<M1911Vector className={className} />} 
      className={className} 
      alt={GAME_TEXT.WEAPONS.M1911.NAME} 
      style={style} 
    />
);

// MP5Icon 컴포넌트를 `export`합니다.
export const MP5Icon: React.FC<WeaponIconWrapperProps> = ({ className, style }) => (
    <WeaponIcon 
      imagePaths={['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png', '/mp5.png', 'mp5.png']} 
      fallback={<MP5Vector className={className} />} 
      className={className} 
      alt={GAME_TEXT.WEAPONS.MP5.NAME} 
      style={style} 
    />
);

// RifleIcon 컴포넌트를 `export`합니다.
export const RifleIcon: React.FC<WeaponIconWrapperProps> = ({ className, style }) => (
    <WeaponIcon 
      imagePaths={['https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png', '/bunny_Rifle.png', 'bunny_Rifle.png']} 
      fallback={<RifleVector className={className} />} 
      className={className} 
      alt={GAME_TEXT.WEAPONS.RIFLE.NAME} 
      style={style} 
    />
);

// ShotgunIcon 컴포넌트를 `export`합니다.
export const ShotgunIcon: React.FC<WeaponIconWrapperProps> = ({ className, style }) => (
    <WeaponIcon 
      imagePaths={['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png']} 
      fallback={<ShotgunVector className={className} />} 
      className={className} 
      alt={GAME_TEXT.WEAPONS.SHOTGUN.NAME} 
      style={style} 
    />
);