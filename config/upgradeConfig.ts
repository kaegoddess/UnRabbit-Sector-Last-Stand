// upgradeConfig.ts
// 이 파일은 무기 부품 업그레이드에 대한 모든 정보를 중앙에서 관리합니다.
// 부품의 이름, 설명, 아이콘, 최대 레벨, 그리고 가장 중요한 게임 내 실제 성능 효과까지 여기서 모두 설정할 수 있습니다.
// 새로운 부품을 추가하거나 밸런스를 조정하고 싶다면 이 파일만 수정하면 됩니다.

import { WeaponPart } from '../types';

// 업그레이드 효과의 유형을 정의합니다.
// ADD: 기본 값에 수치를 더합니다. (예: 사거리 +100)
// SUBTRACT_PERCENT_BASE: 기본 값에서 백분율만큼 감소시킵니다. (예: 연사속도 -10%)
// ADD_PERCENT_BASE: 기본 값에서 백분율만큼 증가시킵니다. (예: 반동 회복 +5%)
// ADD_BONUS: 특정 보너스 값을 더합니다. (예: 반동 제어력 +1)
type UpgradeEffectType = 'ADD' | 'SUBTRACT_PERCENT_BASE' | 'ADD_PERCENT_BASE' | 'ADD_BONUS';

// 각 업그레이드 부품의 상세 정보를 정의하는 인터페이스입니다.
interface UpgradePartInfo {
  NAME: string; // UI에 표시될 부품 이름
  DESC: string; // UI에 표시될 부품 설명
  ICON: string; // UI에 표시될 아이콘 이미지 URL
  maxLevel: number; // 이 부품의 최대 업그레이드 레벨
  // 실제 게임 내 성능에 적용될 효과
  statEffect: {
    type: UpgradeEffectType; // 효과의 종류 (더하기, 빼기 등)
    stat: string;            // 영향을 줄 무기의 능력치 이름 (예: 'maxDistance', 'fireRate')
    value: number;           // 레벨당 적용될 수치 (예: 100, 0.1)
  };
}

// 모든 무기 부품의 설정 정보를 담고 있는 중앙 설정 객체입니다.
export const UPGRADE_CONFIG: Record<WeaponPart, UpgradePartInfo> = {
  [WeaponPart.SCOPE]: {
    NAME: "전술 조준경",
    DESC: "시야 범위 +6%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_1.png",
    maxLevel: 5,
    // 효과: 레벨당 zoom 값을 0.05씩 감소시켜 시야를 넓힙니다. (기본값 1.0)
    statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'zoom', value: 0.06 }
  },
  [WeaponPart.BARREL]: {
    NAME: "정밀 총열",
    DESC: "유효 사거리 +10%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_2.png",
    maxLevel: 5,
    // 효과: 레벨당 기본 maxDistance의 10%만큼 사거리를 증가시킵니다.
    statEffect: { type: 'ADD_PERCENT_BASE', stat: 'maxDistance', value: 0.1 }
  },
  [WeaponPart.MAG]: {
    NAME: "대용량 탄창",
    DESC: "최대 장탄수 +10%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_3.png",
    maxLevel: 5,
    // 효과: 레벨당 기본 장탄수의 10%만큼 maxAmmo를 증가시킵니다. (계산 로직은 GameCanvas에서 특별 처리)
    statEffect: { type: 'ADD_PERCENT_BASE', stat: 'maxAmmo', value: 0.1 }
  },
  [WeaponPart.MUZZLE]: {
    NAME: "충격 제동기",
    DESC: "반동 제어력 강화",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_2.png",
    maxLevel: 5,
    // 효과: 레벨당 recoilControl 값을 1씩 증가시킵니다. 최대 반동까지 걸리는 총알수가 줄어듬.
    statEffect: { type: 'ADD_BONUS', stat: 'recoilControl', value: 1 }
  },
  [WeaponPart.AMMO]: {
    NAME: "철갑탄",
    DESC: "관통 확률 +20%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_6.png",
    maxLevel: 5,
    // 효과: 레벨당 관통 확률을 20%p씩 증가시킵니다. (계산 로직은 GameCanvas에서 특별 처리)
    statEffect: { type: 'ADD_BONUS', stat: 'penetrationChance', value: 0.20 }
  },
  [WeaponPart.SPRING]: {
    NAME: "강화 스프링",
    DESC: "연사 속도 +10%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_7.png",
    maxLevel: 5,
    // 효과: 레벨당 기본 fireRate를 10%씩 감소시켜 연사 속도를 높입니다.
    statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'fireRate', value: 0.1 }
  },
  [WeaponPart.GRIP]: {
    NAME: "인체공학 손잡이",
    DESC: "조준 반응 속도 +10%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_4.png",
    maxLevel: 5,
    // 효과: 레벨당 기본 aimDelay를 10%씩 감소시켜 조준 속도를 높입니다.
    statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'aimDelay', value: 0.1 }
  },
  [WeaponPart.STOCK]: {
    NAME: "전술 개머리판",
    DESC: "공격력 +5%",
    ICON: "https://storage.cloud.google.com/kaelove_game_01/up_4.png",
    maxLevel: 5,
    // 효과: 레벨당 기본 공격력의 5%만큼 데미지가 증가합니다.
    statEffect: { type: 'ADD_PERCENT_BASE', stat: 'damage', value: 0.05 }
  }
};