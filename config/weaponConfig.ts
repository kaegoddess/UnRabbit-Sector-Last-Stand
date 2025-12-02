// weaponConfig.ts
// 이 파일은 이제 weaponDb.ts의 데이터를 게임의 다른 부분(GameCanvas 등)이
// 사용하기 쉬운 평평한(flat) 객체 구조로 변환해주는 역할을 합니다.
// 실제 무기 능력치를 수정하려면 weaponDb.ts 파일을 수정하세요.

import { WEAPON_DATABASE } from './weaponDb'; // config 폴더 내에서 상대 경로 유지
import { GAME_TEXT } from './textConfig'; // config 폴더 내에서 상대 경로 변경됨
import { WeaponPart } from '../types'; // types.ts가 루트에 있으므로 상대 경로 변경됨

// weaponDb.ts의 계층적 데이터를 평평한 구조로 변환하는 헬퍼 함수
const flattenWeaponData = (db: typeof WEAPON_DATABASE) => {
  const flattened: { [key: string]: any } = {};

  for (const weaponKey in db) {
    const weaponData = db[weaponKey as keyof typeof db];
    
    // 1. 각 카테고리의 모든 속성을 하나의 객체로 합칩니다.
    const weapon = {
      ...weaponData.display,
      ...weaponData.combat,
      ...weaponData.bullet,
      ...weaponData.handling,
      ...weaponData.visuals,
      ...weaponData.ui,
    };

    // 2. [NEW] 'gunLength'를 자동으로 계산합니다.
    // render 객체에 정의된 모든 파츠를 순회하며,
    // 플레이어 중심(0)에서 가장 멀리 뻗어나가는 지점을 찾아 총구 위치로 설정합니다.
    const renderConfig = weaponData.visuals.render;
    if (renderConfig) {
      let calculatedGunLength = 0;
      // [수정] 기존 for...in 루프는 타입스크립트가 다양한 무기(`Pistol`, `MP5` 등)의 `render` 설정 구조가
      // 서로 다르기 때문에 `part` 변수의 정확한 타입을 추론하기 어려워 오류가 발생했습니다.
      // `Object.values`를 사용하면 각 무기의 모든 렌더링 파츠(`slide`, `barrel` 등)의 설정값 객체들을
      // 직접 배열로 가져와 순회하므로, 타입스크립트가 `part`가 `length`와 `offsetX` 속성을
      // 가지고 있다는 것을 명확하게 알 수 있어 오류가 해결됩니다.
      for (const part of Object.values(renderConfig)) {
        // 파츠의 끝 지점 = 파츠의 시작 위치(offsetX) + 파츠의 길이(length)
        const partEnd = (part.offsetX || 0) + part.length;
        // 현재까지 계산된 최대 길이보다 이 파츠의 끝 지점이 더 길면, 최대 길이를 업데이트합니다.
        if (partEnd > calculatedGunLength) {
          calculatedGunLength = partEnd;
        }
      }
      // [수정] `weapon` 객체는 여러 부분(`display`, `combat` 등)을 합쳐 동적으로 만들어졌기 때문에,
      // 타입스크립트는 이 객체에 `gunLength`라는 속성이 처음부터 존재하지 않는다고 판단하여 오류를 발생시킵니다.
      // `(weapon as any)`와 같이 타입 단언을 사용하여, "개발자가 이 객체의 구조를 더 잘 알고 있으니
      // 일단 `gunLength`라는 속성을 추가하도록 허용해달라"고 타입스크립트에 알려주어 오류를 해결합니다.
      (weapon as any).gunLength = calculatedGunLength;
    }

    flattened[weaponKey] = weapon;
  }
  return flattened;
};

// 변환된 데이터를 WEAPONS 상수로 내보내어, 다른 파일들이 기존과 동일하게 사용할 수 있도록 합니다.
// 이 덕분에 GameCanvas.tsx나 App.tsx를 수정할 필요가 없습니다.
// FIX: WEAPONS의 타입을 명시적으로 지정하여 `keyof`가 `string | number` 대신 실제 무기 키를 반환하도록 합니다.
// 이렇게 하면 `selectedWeaponKey`의 타입이 정확해져서 관련 타입 오류를 해결할 수 있습니다.
export const WEAPONS = flattenWeaponData(WEAPON_DATABASE) as Record<keyof typeof WEAPON_DATABASE, any>;