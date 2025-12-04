// config/assetConfig.ts
// 이 파일은 게임 내 모든 이미지 에셋의 경로를 중앙에서 관리합니다.
// 각 에셋은 [로컬 경로, 클라우드 예비 경로] 형태의 배열로 정의됩니다.
// 이를 통해 오프라인 환경에서도 게임이 정상적으로 작동하도록 보장합니다.

// 로컬 이미지들은 모두 'img/' 폴더 안에 있는 것으로 가정합니다.
const IMG_PATH = 'img/';

export const ASSETS = {
  // 캐릭터 초상화
  CHAR_DEFAULT: [`${IMG_PATH}Gemini_Generated_bunny.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny.png"],
  CHAR_MP5: [`${IMG_PATH}Gemini_Generated_bunny_mp5.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_mp5.png"],
  CHAR_RIFLE: [`${IMG_PATH}Gemini_Generated_bunny_rifle.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_rifle.png"],
  CHAR_SHOTGUN: [`${IMG_PATH}Gemini_Generated_bunny_shotgun.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_shotgun.png"],
  CHAR_SAD: [`${IMG_PATH}Gemini_Generated_sad.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_sad.png"],

  // 무기 이미지 (메뉴, 업그레이드 화면 등)
  WEAPON_M1911: [`${IMG_PATH}Gemini_Generated_m1911.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png"],
  WEAPON_MP5: [`${IMG_PATH}Gemini_Generated_mp5.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png"],
  WEAPON_RIFLE: [`${IMG_PATH}bunny_Rifle.png`, "https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png"],
  WEAPON_SHOTGUN: [`${IMG_PATH}Gemini_Generated_Shotgun.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png"],

  // UI 및 배경
  LOADING_SCREEN: [`${IMG_PATH}Gemini_Generated_loding01.png`, "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_loding01.png"],

  // 업그레이드 아이콘
  UPGRADE_ICON_SCOPE: [`${IMG_PATH}up_1.png`, "https://storage.cloud.google.com/kaelove_game_01/up_1.png"],
  UPGRADE_ICON_BARREL: [`${IMG_PATH}up_2.png`, "https://storage.cloud.google.com/kaelove_game_01/up_2.png"],
  UPGRADE_ICON_MAG: [`${IMG_PATH}up_3.png`, "https://storage.cloud.google.com/kaelove_game_01/up_3.png"],
  UPGRADE_ICON_MUZZLE: [`${IMG_PATH}up_2.png`, "https://storage.cloud.google.com/kaelove_game_01/up_2.png"], // BARREL과 동일 아이콘 사용
  UPGRADE_ICON_AMMO: [`${IMG_PATH}up_6.png`, "https://storage.cloud.google.com/kaelove_game_01/up_6.png"],
  UPGRADE_ICON_SPRING: [`${IMG_PATH}up_7.png`, "https://storage.cloud.google.com/kaelove_game_01/up_7.png"],
  UPGRADE_ICON_GRIP: [`${IMG_PATH}up_4.png`, "https://storage.cloud.google.com/kaelove_game_01/up_4.png"],
  UPGRADE_ICON_STOCK: [`${IMG_PATH}up_4.png`, "https://storage.cloud.google.com/kaelove_game_01/up_4.png"], // GRIP과 동일 아이콘 사용
};
