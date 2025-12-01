import React, { useState } from 'react';
import { GAME_TEXT } from '../textConfig';

// 로딩 중일 때 보여줄 전술적 스캔 UI (캐릭터용, 텍스트 포함)
export const TacticalLoader: React.FC<{ className?: string, text?: string }> = ({ className, text = GAME_TEXT.SYSTEM.RETRIEVING }) => (
  <div className={`relative bg-gray-950 flex flex-col items-center justify-center overflow-hidden border border-green-900/50 ${className}`}>
     {/* Grid Background */}
     <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

     {/* Scanline Animation */}
     <div className="animate-scanline z-0"></div>

     {/* Text */}
     <div className="z-10 text-green-500 text-[10px] md:text-xs font-bold tracking-widest animate-pulse flex flex-col items-center gap-1">
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

     {/* Gauge Fill Animation */}
     <div className="animate-gauge-fill z-0"></div>

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
const M1911Vector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="slideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="gripGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    
    {/* Grip */}
    <path d="M55 45 L50 100 L85 105 L95 45 Z" fill="url(#gripGradient)" stroke="#451a03" strokeWidth="2"/>
    <line x1="60" y1="50" x2="57" y2="95" stroke="#451a03" strokeWidth="1" opacity="0.3"/>
    <line x1="70" y1="50" x2="67" y2="95" stroke="#451a03" strokeWidth="1" opacity="0.3"/>
    
    {/* Trigger Guard */}
    <path d="M75 65 Q75 85 95 85 L95 65" fill="none" stroke="#334155" strokeWidth="3"/>
    
    {/* Trigger */}
    <path d="M80 67 L80 77 Q85 77 85 67" fill="#cbd5e1" stroke="#334155" strokeWidth="1"/>

    {/* Frame */}
    <rect x="30" y="50" width="100" height="15" fill="#334155" stroke="#1e293b" strokeWidth="2"/> 
    
    {/* Slide */}
    <path d="M20 20 L160 20 L160 50 L20 50 Z" fill="url(#slideGradient)" stroke="#1e293b" strokeWidth="2"/>
    
    {/* Slide Serrations */}
    <line x1="30" y1="25" x2="30" y2="45" stroke="#1e293b" strokeWidth="2" opacity="0.5"/>
    <line x1="36" y1="25" x2="36" y2="45" stroke="#1e293b" strokeWidth="2" opacity="0.5"/>
    <line x1="42" y1="25" x2="42" y2="45" stroke="#1e293b" strokeWidth="2" opacity="0.5"/>

    {/* Hammer */}
    <path d="M20 25 L10 22 L10 35 L20 35" fill="#1e293b"/>

    {/* Sights */}
    <path d="M155 20 L155 16 L160 20" fill="#1e293b"/> 
    <path d="M25 20 L25 14 L30 20" fill="#1e293b"/> 
  </svg>
);

// PNG 로드 실패 시 보여줄 벡터(SVG) 아이콘 - MP5
const MP5Vector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 220 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mp5Body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#374151" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="mp5Mag" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#111827" />
        <stop offset="50%" stopColor="#374151" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
    </defs>
    
    {/* Magazine (Curved) */}
    <path d="M90 70 Q 80 110 100 120 L 115 115 Q 95 105 110 70 Z" fill="url(#mp5Mag)" stroke="#000" strokeWidth="1"/>

    {/* Stock (Collapsible) */}
    <rect x="5" y="45" width="40" height="10" fill="#1f2937" />
    <path d="M5 45 L5 65 L15 65 L15 55" fill="none" stroke="#1f2937" strokeWidth="4" />

    {/* Grip */}
    <path d="M55 70 L50 100 L75 105 L85 70 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="2"/>

    {/* Main Body */}
    <rect x="45" y="35" width="100" height="35" rx="2" fill="url(#mp5Body)" stroke="#000" strokeWidth="1"/>
    
    {/* Barrel Handguard */}
    <rect x="145" y="40" width="50" height="25" fill="#111827" stroke="#374151" strokeWidth="2"/>
    <line x1="150" y1="40" x2="150" y2="65" stroke="#374151" strokeWidth="2" opacity="0.5"/>
    <line x1="160" y1="40" x2="160" y2="65" stroke="#374151" strokeWidth="2" opacity="0.5"/>
    <line x1="170" y1="40" x2="170" y2="65" stroke="#374151" strokeWidth="2" opacity="0.5"/>
    <line x1="180" y1="40" x2="180" y2="65" stroke="#374151" strokeWidth="2" opacity="0.5"/>

    {/* Muzzle */}
    <rect x="195" y="48" width="10" height="8" fill="#000" />

    {/* Sights */}
    <circle cx="150" cy="35" r="5" fill="none" stroke="#000" strokeWidth="2" />
    <path d="M50 35 L50 25 L60 35" fill="none" stroke="#000" strokeWidth="2" />
    
    {/* Trigger Guard */}
    <path d="M70 70 Q70 85 85 85" fill="none" stroke="#374151" strokeWidth="2"/>
  </svg>
);

// PNG 로드 실패 시 보여줄 벡터(SVG) 아이콘 - Rifle
const RifleVector: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 250 80" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="rifleBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8d6e63" />
                <stop offset="100%" stopColor="#5d4037" />
            </linearGradient>
            <linearGradient id="rifleMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#424242" />
                <stop offset="100%" stopColor="#212121" />
            </linearGradient>
        </defs>
        {/* Stock */}
        <path d="M0 40 L50 35 L80 60 L60 65 Z" fill="url(#rifleBody)" stroke="#3e2723" strokeWidth="1"/>
        {/* Grip and Trigger */}
        <path d="M80 35 L90 55 L100 55 L110 35 Z" fill="#3e2723"/>
        <path d="M100 45 Q100 55 110 55" fill="none" stroke="#212121" strokeWidth="2"/>
        {/* Body and Barrel */}
        <rect x="70" y="30" width="150" height="10" fill="url(#rifleMetal)" stroke="#000" strokeWidth="1"/>
        <rect x="70" y="20" width="180" height="10" fill="url(#rifleBody)" stroke="#3e2723" strokeWidth="1"/>
        {/* Scope */}
        <rect x="100" y="10" width="50" height="10" rx="2" fill="#212121"/>
        <rect x="95" y="14" width="5" height="2" fill="#424242"/>
        <rect x="150" y="14" width="5" height="2" fill="#424242"/>
    </svg>
);

// PNG 로드 실패 시 보여줄 벡터(SVG) 아이콘 - Shotgun
const ShotgunVector: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 250 80" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="shotgunWood" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <linearGradient id="shotgunMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#737373" />
                <stop offset="100%" stopColor="#404040" />
            </linearGradient>
        </defs>
        {/* Stock */}
        <path d="M0 45 L60 40 L80 65 L50 70 Z" fill="url(#shotgunWood)" stroke="#422006" strokeWidth="1"/>
        {/* Grip */}
        <path d="M80 40 L85 60 L95 60 L100 40 Z" fill="#422006"/>
        {/* Receiver */}
        <rect x="90" y="35" width="40" height="15" fill="url(#shotgunMetal)" stroke="#171717" strokeWidth="1"/>
        {/* Barrel */}
        <rect x="130" y="38" width="110" height="8" fill="url(#shotgunMetal)" stroke="#171717" strokeWidth="1"/>
        {/* Pump */}
        <rect x="150" y="48" width="50" height="10" rx="2" fill="url(#shotgunWood)" stroke="#422006" strokeWidth="1"/>
    </svg>
);

// 아이콘 컴포넌트들이 공통으로 사용할 props 인터페이스
interface IconProps {
  className?: string;
  style?: React.CSSProperties; // 동적 스타일링을 위해 style prop 추가
}

// M1911 권총 이미지를 표시합니다.
export const PistolIcon: React.FC<IconProps> = ({ className, style }) => {
  const imagePaths = [
    'https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png', 
    '/m1911.png',        
    'm1911.png',         
  ];
  return <WeaponIcon imagePaths={imagePaths} fallback={<M1911Vector className={className} />} className={className} alt={GAME_TEXT.WEAPONS.M1911.NAME} style={style} />;
};

// MP5 이미지를 표시합니다.
export const MP5Icon: React.FC<IconProps> = ({ className, style }) => {
  const imagePaths = [
    'https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png', 
    '/mp5.png',        
    'mp5.png',         
  ];
  return <WeaponIcon imagePaths={imagePaths} fallback={<MP5Vector className={className} />} className={className} alt={GAME_TEXT.WEAPONS.MP5.NAME} style={style} />;
};

// Rifle 이미지를 표시합니다.
export const RifleIcon: React.FC<IconProps> = ({ className, style }) => {
  const imagePaths = [
    'https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png', 
    '/bunny_Rifle.png',        
    'bunny_Rifle.png',         
  ];
  return <WeaponIcon imagePaths={imagePaths} fallback={<RifleVector className={className} />} className={className} alt={GAME_TEXT.WEAPONS.RIFLE.NAME} style={style} />;
};

// Shotgun 이미지를 표시합니다.
export const ShotgunIcon: React.FC<IconProps> = ({ className, style }) => {
  const imagePaths = [
    'https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png',
  ];
  return <WeaponIcon imagePaths={imagePaths} fallback={<ShotgunVector className={className} />} className={className} alt={GAME_TEXT.WEAPONS.SHOTGUN.NAME} style={style} />;
};


// 공통 무기 아이콘 컴포넌트
const WeaponIcon: React.FC<{ imagePaths: string[], fallback: React.ReactNode, className?: string, alt: string, style?: React.CSSProperties }> = ({ imagePaths, fallback, className, alt, style }) => {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (currentPathIndex < imagePaths.length - 1) {
      setCurrentPathIndex(prev => prev + 1);
    } else {
      setUseFallback(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (useFallback) {
    return <>{fallback}</>;
  }

  return (
    <div style={style} className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* 로딩 애니메이션 제거됨: 이미지가 로드되면 투명도 전환으로 자연스럽게 표시됩니다. */}
      
      <img 
        key={imagePaths[currentPathIndex]}
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