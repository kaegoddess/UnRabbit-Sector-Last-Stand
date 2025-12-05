

import React, { useState, useEffect } from 'react';
import { GAME_TEXT } from '../config/textConfig';
import { ASSETS } from '../config/assetConfig';
import FallbackImage from './FallbackImage'; // FallbackImage 컴포넌트 임포트

// Define props for wrapper icons like PistolIcon
interface WeaponIconWrapperProps {
  className?: string;
  alt: string; // alt 속성을 필수로 추가
  style?: React.CSSProperties;
}

// 로딩 중일 때 보여줄 전술적 스캔 UI (캐릭터용, 텍스트 포함)
export const TacticalLoader: React.FC<{ className?: string, text?: string }> = ({ className, text = GAME_TEXT.SYSTEM.RETRIEVING }) => (
  // 이 컨테이너는 위치와 크기만 담당하며, 내부 콘텐츠는 각자 위치를 잡습니다.
  <div className={`relative bg-gray-950 overflow-hidden border border-green-900/50 ${className}`}>
     {/* Grid Background */}
     <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

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
export const M1911Vector: React.FC<WeaponIconWrapperProps> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
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


// [NEW] SVG 폴백을 처리하기 위한 새로운 WeaponIcon 래퍼 컴포넌트
interface WeaponIconProps {
  imagePaths: string[];
  // FIX: `React.cloneElement`가 `fallback` 요소의 prop 타입을 올바르게 추론할 수 있도록,
  // `React.ReactElement`에 제네릭 타입 `WeaponIconWrapperProps`를 명시합니다.
  // 이로써 `cloneElement`에 `className`과 `style`을 전달할 때 발생하는 타입 오류를 해결합니다.
  fallback: React.ReactElement<WeaponIconWrapperProps>; // SVG 컴포넌트
  className?: string;
  alt: string;
  style?: React.CSSProperties;
  onLoad?: () => void; // onLoad 프롭 추가
}

const WeaponIcon: React.FC<WeaponIconProps> = ({ imagePaths, fallback, className, alt, style, onLoad }) => {
  const [imageFailed, setImageFailed] = useState(false);

  // imagePaths가 변경되면 실패 상태를 초기화합니다.
  useEffect(() => {
    setImageFailed(false);
  }, [imagePaths]);

  // FallbackImage의 모든 소스 로드에 실패하면 호출됩니다.
  const handleError = () => {
    setImageFailed(true);
  };

  // 이미지 로드 실패 시, SVG 폴백을 렌더링합니다.
  if (imageFailed) {
    // React.cloneElement를 사용하여 fallback 컴포넌트에 props를 전달합니다.
    return React.cloneElement(fallback, { className, style });
  }

  // 성공 시, FallbackImage를 렌더링합니다.
  return (
    <FallbackImage
      srcs={imagePaths}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
      onError={handleError}
      onLoad={onLoad} // 부모로부터 받은 onLoad를 전달
    />
  );
};

// PistolIcon 컴포넌트를 `export`합니다.
export const PistolIcon: React.FC<WeaponIconWrapperProps> = ({ className, style, alt, ...rest }) => (
    <WeaponIcon 
      imagePaths={ASSETS.WEAPON_M1911}
      fallback={<M1911Vector className={className} alt={alt} {...rest}/>}
      className={className} 
      alt={alt} 
      style={style}
      {...rest}
    />
);

// MP5Icon 컴포넌트를 `export`합니다.
export const MP5Icon: React.FC<WeaponIconWrapperProps> = ({ className, style, alt, ...rest }) => (
    <WeaponIcon 
      imagePaths={ASSETS.WEAPON_MP5}
      fallback={<MP5Vector className={className} alt={alt} {...rest}/>}
      className={className} 
      alt={alt} 
      style={style}
      {...rest}
    />
);

// RifleIcon 컴포넌트를 `export`합니다.
export const RifleIcon: React.FC<WeaponIconWrapperProps> = ({ className, style, alt, ...rest }) => (
    <WeaponIcon 
      imagePaths={ASSETS.WEAPON_RIFLE}
      fallback={<RifleVector className={className} alt={alt} {...rest}/>}
      className={className} 
      alt={alt} 
      style={style}
      {...rest}
    />
);

// ShotgunIcon 컴포넌트를 `export`합니다.
export const ShotgunIcon: React.FC<WeaponIconWrapperProps> = ({ className, style, alt, ...rest }) => (
    <WeaponIcon 
      imagePaths={ASSETS.WEAPON_SHOTGUN}
      fallback={<ShotgunVector className={className} alt={alt} {...rest}/>}
      className={className} 
      alt={alt} 
      style={style}
      {...rest}
    />
);