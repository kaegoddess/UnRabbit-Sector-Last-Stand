

// config/assetConfig.ts
// 이 파일은 게임 내 모든 이미지 에셋의 경로를 중앙에서 관리합니다.
// 각 에셋은 [클라우드 예비 경로, 로컬 경로] 형태의 배열로 정의됩니다.
// 이를 통해 온라인 환경에서 Google Cloud 로딩을 최우선으로 처리하고, 오프라인 환경에서는 로컬 파일을 사용합니다.

// 로컬 이미지들은 모두 'img/' 폴더 안에 있는 것으로 가정합니다.
const IMG_PATH = 'img/';

export const ASSETS = {
  // 캐릭터 초상화
  CHAR_DEFAULT: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny.png", `${IMG_PATH}Gemini_Generated_bunny.png`],
  CHAR_MP5: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_mp5.png", `${IMG_PATH}Gemini_Generated_bunny_mp5.png`],
  CHAR_RIFLE: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_rifle.png", `${IMG_PATH}Gemini_Generated_bunny_rifle.png`],
  CHAR_SHOTGUN: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_shotgun.png", `${IMG_PATH}Gemini_Generated_bunny_shotgun.png`],
  CHAR_SAD: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_sad.png", `${IMG_PATH}Gemini_Generated_sad.png`],

  // 무기 이미지 (메뉴, 업그레이드 화면 등)
  WEAPON_M1911: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png", `${IMG_PATH}Gemini_Generated_m1911.png`],
  WEAPON_MP5: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png", `${IMG_PATH}Gemini_Generated_mp5.png`],
  WEAPON_RIFLE: ["https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png", `${IMG_PATH}bunny_Rifle.png`],
  WEAPON_SHOTGUN: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png", `${IMG_PATH}Gemini_Generated_Shotgun.png`],

  // UI 및 배경
  LOADING_SCREEN: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_loding01.png", `${IMG_PATH}Gemini_Generated_loding01.png`],
  // [NEW] 수류탄 아이콘 추가
  ICON_GRENADE: ["https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_icon_grenade.png", `${IMG_PATH}icon_grenade.png`],

  // 업그레이드 아이콘
  UPGRADE_ICON_SCOPE: ["https://storage.cloud.google.com/kaelove_game_01/up_1.png", `${IMG_PATH}up_1.png`],
  UPGRADE_ICON_BARREL: ["https://storage.cloud.google.com/kaelove_game_01/up_2.png", `${IMG_PATH}up_2.png`],
  UPGRADE_ICON_MAG: ["https://storage.cloud.google.com/kaelove_game_01/up_3.png", `${IMG_PATH}up_3.png`],
  UPGRADE_ICON_MUZZLE: ["https://storage.cloud.google.com/kaelove_game_01/up_2.png", `${IMG_PATH}up_2.png`], // BARREL과 동일 아이콘 사용
  UPGRADE_ICON_AMMO: ["https://storage.cloud.google.com/kaelove_game_01/up_6.png", `${IMG_PATH}up_6.png`],
  UPGRADE_ICON_SPRING: ["https://storage.cloud.google.com/kaelove_game_01/up_7.png", `${IMG_PATH}up_7.png`],
  UPGRADE_ICON_GRIP: ["https://storage.cloud.google.com/kaelove_game_01/up_4.png", `${IMG_PATH}up_4.png`],
  UPGRADE_ICON_STOCK: ["https://storage.cloud.google.com/kaelove_game_01/up_4.png", `${IMG_PATH}up_4.png`], // GRIP과 동일 아이콘 사용
};
