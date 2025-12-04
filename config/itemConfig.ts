// itemConfig.ts
// 이 파일은 게임 내 모든 드랍 아이템의 정보를 중앙에서 관리합니다.
// 새로운 아이템을 추가하거나 밸런스를 조정하고 싶다면 이 파일만 수정하면 됩니다.

import { Item, ItemType } from '../types';

// 각 아이템의 상세 정보를 정의하는 인터페이스입니다.
interface ItemInfo {
  name: string; // 아이템 이름
  itemType: ItemType; // 아이템의 고유 타입
  type: 'INSTANT_HEAL'; // 아이템 효과의 종류 (향후 확장 가능: 'WEAPON_BUFF', 'SCORE_BONUS' 등)
  value: number; // 효과의 수치 (예: 회복량 10)
  baseDropChance: number; // 기본 드랍 확률 (0.0 ~ 1.0)
  pickupRadius: number; // 플레이어가 아이템을 획득할 수 있는 거리 (px)
  renderScale: number; // 아이템 렌더링 크기 배율 (1.0이 기본)
  
  // 아이템이 드랍될 때의 물리 효과 설정 (탄피처럼 튕기는 효과)
  physics: {
    velocity: number; // 초기 수평 속도 범위
    verticalVelocity: number; // 초기 수직(점프) 속도
    gravity: number; // 중력
    bounciness: number; // 탄성 (0~1)
    life: number; // 아이템이 바닥에 남아있는 시간 (초)
  };

  // 캔버스에 아이템을 그리는 함수
  draw: (ctx: CanvasRenderingContext2D, item: Item) => void;
}

// 모든 아이템의 설정 정보를 담고 있는 중앙 설정 객체입니다.
export const ITEMS_CONFIG: { [key in ItemType]: ItemInfo } = {
  [ItemType.HEALTH_PACK_SMALL]: {
    name: "소형 회복 아이템",
    itemType: ItemType.HEALTH_PACK_SMALL,
    type: 'INSTANT_HEAL',
    value: 10,
    baseDropChance: 0.10, // 기본 드랍 확률 10%
    pickupRadius: 20,
    renderScale: 1.5, // 아이템 크기 배율. 1.0이 기본.
    
    physics: {
      velocity: 100,
      verticalVelocity: 200,
      gravity: 800,
      bounciness: 0.5,
      life: 20.0, // 20초간 바닥에 남아있음
    },

    // 당근 모양 아이콘을 그립니다.
    draw: (ctx: CanvasRenderingContext2D, item: Item) => {
        // 아이템 설정에서 크기 배율을 가져옵니다.
        const s = ITEMS_CONFIG[item.itemType].renderScale;

        ctx.save();
        // 아이템의 현재 위치로 이동 (z값은 높이를 의미)
        ctx.translate(item.x, item.y - item.z);
        // 아이템 회전 적용
        ctx.rotate(item.rotation);
        
        // 당근 몸통 (주황색 삼각형)
        ctx.fillStyle = '#f97316'; // Tailwind orange-500
        ctx.beginPath();
        // 크기 배율(s)을 모든 좌표에 적용합니다.
        ctx.moveTo(0, 10 * s);      // 뾰족한 끝 (아래)
        ctx.lineTo(5 * s, -5 * s);  // 오른쪽 위
        ctx.lineTo(-5 * s, -5 * s); // 왼쪽 위
        ctx.closePath();
        ctx.fill();

        // 당근 잎사귀 (몸통 상단에 붙도록 좌표 수정)
        ctx.fillStyle = '#22c55e'; // Tailwind green-500
        ctx.beginPath();
        // 잎사귀 1: 몸통 상단(y = -5*s)에 붙도록 시작 y 좌표를 조정합니다.
        ctx.fillRect(-3 * s, -10 * s, 2 * s, 5 * s);
        // 잎사귀 2
        ctx.fillRect(1 * s, -11 * s, 2 * s, 6 * s);
        // 잎사귀 3
        ctx.fillRect(-1 * s, -12 * s, 2 * s, 7 * s);
        
        ctx.restore();
    }
  }
};
