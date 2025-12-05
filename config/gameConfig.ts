
// 게임 밸런스 및 설정을 위한 데이터베이스 (시스템, 사운드 등)
// 좀비 설정은 zombieConfig.ts, 무기 설정은 weaponConfig.ts, 플레이어 설정은 playerConfig.ts 참조

// 게임 버전
export const GAME_VERSION = "0.55";

// 거리 단위: 픽셀(px)
// 시간 단위: 밀리초(ms) 또는 초(s)

// 사운드 설정
export const SOUND_SETTINGS = {
  masterVolume: 3,
  footstepInterval: 350, // 발소리 간격 (ms) - 걷는 리듬에 맞춰 조정
  
  // [NEW] 전력질주 충돌음 재생 최소 간격 (ms)
  // 이 시간 내에는 충돌음이 한 번만 재생되어 사운드 왜곡을 방지합니다.
  // 예: 200ms로 설정하면, 0.2초 안에 여러 마리와 부딪쳐도 소리는 한 번만 납니다.
  sprintCollideCooldown: 200,

  // 프로젝트 빌드 시 포함할 사운드 파일 경로를 지정합니다.
  // 이 파일들은 프로젝트의 public/sound 폴더 안에 있어야 합니다.
  // 파일이 없으면 자동으로 내장 신디사이저(합성음)가 작동합니다.
  assets: {
    shoot: 'sound/shoot.mp3', 
    impact: 'sound/impact.mp3', 
    footstep: 'sound/footstep.mp3',
    reload: 'sound/reload.mp3', 
    playerHit: 'sound/player_hit.mp3',
    itemPickup: 'sound/pickup.mp3', // 아이템 획득 사운드 파일 경로
    uiSelect: 'sound/ui_select.mp3', // UI 선택 효과음. 파일이 없으므로 합성음이 재생됩니다.
    // 빠른 재장전 사운드
    quickReloadSuccess: 'sound/quick_reload_success.mp3', 
    quickReloadFail: 'sound/quick_reload_fail.mp3',
    // [NEW] 닷지 및 전력질주 사운드
    dodge: 'sound/dodge.mp3',
    dodgeLand: 'sound/dodge_land.mp3',
    sprintCollide: 'sound/sprint_collide.mp3',
    staminaEmpty: 'sound/stamina_empty.mp3', // 스테미나 부족 경고음
  }
};

// 데미지 플로팅 텍스트 설정
export const FLOATING_TEXT = {
  life: 1, // 지속 시간 (초) - 매우 짧음
  speed: 100, // 튀어오르는 초기 속도
  gravity: 300, // 중력
  randomX: 100, // 좌우 랜덤 퍼짐 정도
  startScale: 1, // 애니메이션 시작 크기 배율 (0.5 = 50% 크기에서 시작)
  maxScale: 2,   // 애니메이션 최대 크기 배율 (1.5 = 150%까지 커짐)
};

export const GAME_SETTINGS = {
  particleCount: {
    blood: 5,
    zombieDeath: 8,
  },
  particleSpeed: 150, // 파티클 확산 속도 (px/s)
  particleLifeDecay: 2.0, // 초당 투명도 감소량 (2.0이면 0.5초 지속)
  scoreToNextWave: 10, 

  // 빠른 재장전 시스템 설정
  quickReloadInputMinProgress: 0.3, // 재장전 진행도 30% 전까지는 빠른 재장전 입력 무시
  quickReloadShakeDuration: 0.3, // 빠른 재장전 실패 시 재장전 바 흔들림 지속 시간 (초)
  quickReloadPostSuccessCooldown: 0.17, // 빠른 재장전 성공 후 총알 발사 방지 쿨다운 (초)
};

// 렌더링 관련 시각 효과 설정
// 이 설정을 통해 게임 내 객체의 그림자 위치와 크기를 일괄적으로 조정할 수 있습니다.
export const RENDER_SETTINGS = {
  // 그림자 위치 오프셋 (x, y). 
  // 양수 값은 객체 중심에서 오른쪽, 아래쪽으로 그림자를 이동시켜 입체감을 줍니다.
  // 예를 들어, { x: 5, y: 5 }로 설정하면 그림자가 객체보다 오른쪽으로 5px, 아래로 5px 이동하여
  // 마치 빛이 왼쪽 위에서 비추는 듯한 효과를 줍니다.
  shadowOffset: { x: 5, y: 10 },

  // 그림자 크기 배율. 
  // 1.0이 객체와 동일한 크기이며, 1.5로 설정하면 150% 크기로 그림자를 더 크게 만들어
  // 그림자가 더 잘 보이게 합니다. 0.8로 설정하면 더 작아집니다.
  shadowScale: 1.3,
  
  // 시각적 반동 회복 속도 (px/s).
  // 이 수치가 높을수록 총몸이 원래 위치로 더 빨리 복귀합니다.
  // 명중률 회복('recoilRecovery')과 분리되어 시각적 느낌만 제어합니다.
  visualRecoilRecoverySpeed: 500,

  // 최대 시각적 반동 거리 (px).
  // 아무리 연사해도 총몸이 이 값 이상으로 밀려나지 않습니다.
  // 라이플 등이 화면 밖으로 밀려나는 버그를 방지합니다.
  maxVisualRecoil: 40,

  // 재장전 UI 스케일 설정
  reloadUIScale: 1.5, // 재장전 UI 전체 크기 배율 (1.0 = 100%)
  reloadUIBaseWidth: 40, // 재장전 바의 기본 너비 (px)
  reloadUIBaseHeight: 6, // 재장전 바의 기본 높이 (px)
  reloadUIBaseYOffset: -35, // 플레이어 중심으로부터 Y축 오프셋 (px)
  quickReloadArrowBaseSize: 3, // 빠른 재장전 화살표의 기본 한쪽 길이 (px)
  quickReloadTextBaseSize: 12, // 재장전 텍스트의 기본 폰트 크기 (px)
};