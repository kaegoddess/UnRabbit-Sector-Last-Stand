// 플레이어 관련 설정

export const PLAYER_STATS = {
  radius: 12,
  color: '#9c5d33', // 더 어두운 검은색(Stone 900) 계열 방탄조끼
  maxHealth: 100,
  moveSpeed: 180, // 초당 180픽셀 이동
  
  // 회전 가속 설정
  baseRotationSpeed: 2.5, // 시작 회전 속도 (rad/s) - 초기엔 정밀 조준을 위해 느리게
  maxRotationSpeed: 14.0, // 최대 회전 속도 (rad/s) - 확 돌릴 때 빠르게
  rotationAcceleration: 20.0, // 가속도 (rad/s^2) - 얼마나 빨리 최대 속도에 도달하는지
  
  reloadAbility: 1, // 재장전 능력 (기본 1). 2일 경우 재장전 시간이 절반으로 단축됨.

  // [NEW] 스테미나 시스템 설정
  maxStamina: 60, // 최대 스테미나
  sprintStaminaCost: 15, // 초당 전력질주 스테미나 소모량
  staminaRechargeRate: 20, // 초당 스테미나 회복량
  staminaRechargeDelay: 0.8, // 스테미나 사용 후 회복 시작까지의 지연 시간 (초)

  // [NEW] 전력질주(Sprint) 시스템 설정
  sprintSpeedMultiplier: 1.5, // 전력질주 시 이동 속도 배율 (1.5 = 150%)
  sprintKnockback: 15, // 전력질주 중 충돌 시 적을 밀어내는 힘

  // [NEW] 닷지(Dodge) 시스템 설정
  dodgeStaminaCost: 20, // 닷지 1회당 스테미나 소모량 (게이지 한 칸)
  dodgeSpeedMultiplier: 2.5, // 닷지 시 이동 속도 배율 (순간적으로 200% 빨라짐)
  dodgeDuration: 0.4, // 닷지 총 지속 시간 (초)
  dodgeInvulnerabilityStartTime: 0.05, // 닷지 시작 후 무적 상태가 되기까지 걸리는 시간 (초)
  dodgeInvulnerabilityDuration: 0.25, // 무적 지속 시간 (초)
  dodgeLandKnockback: 500, // 닷지 착지 시 주변 적을 밀어내는 총 거리
  dodgeLandKnockbackRadius: 100, // 닷지 착지 시 넉백 효과의 반경 (px)
  dodgeLandKnockbackDuration: 0.3, // [NEW] 닷지 착지 시 넉백이 지속되는 시간 (초)
  dodgeLandDamage: 1, // 닷지 착지 시 넉백된 적에게 주는 데미지
};

// [FIX] GameCanvas.tsx에서 참조하지만 정의되지 않은 PLAYER_EFFECTS 객체를 추가합니다.
// 이 객체는 전력질주, 닷지 착지 등 플레이어의 특정 행동에 따른 파티클 시각 효과를 중앙에서 관리합니다.
export const PLAYER_EFFECTS = {
  // createParticles 함수 호출 시 특정 설정값이 없을 때 사용되는 기본 파티클 효과입니다.
  default: {
    // 파티클의 기본 이동 속도입니다. 수치가 클수록 파티클이 더 빠르게 퍼져나갑니다. (단위: px/s)
    speed: 100,
    // 파티클이 화면에 표시되는 시간입니다. 1.0은 1초를 의미합니다.
    life: 1,
    // 파티클의 크기 변화율입니다. 양수면 점점 커지고, 음수면 점점 작아지며 사라집니다. 0이면 크기가 변하지 않습니다.
    growth: 10,
  },
  // 플레이어가 전력질주할 때 발밑에서 발생하는 먼지 효과입니다.
  sprintDust: {
    // 매 프레임마다 먼지 효과가 발생할 확률입니다. 0.0 ~ 1.0 사이 값이며, 1.0이면 매 프레임마다 생성됩니다. (예: 0.3은 30% 확률)
    chance: 0.3,
    // 먼지 파티클의 색상입니다. 'rgba(255, 255, 255, 0.2)'는 반투명한 흰색을 의미합니다.
    color: 'rgba(255, 255, 255, 0.2)',
    // 효과가 한 번 발생할 때 생성되는 파티클의 개수입니다.
    count: 1,
    // 먼지 파티클의 이동 속도입니다.
    speed: 5,
    // 먼지 파티클의 지속 시간입니다.
    life: 0.8,
    // 먼지 파티클의 크기 변화율입니다.
    growth: 15,
  },
  // 플레이어가 닷지를 마친 후 착지할 때 발생하는 시각 효과입니다.
  dodgeLand: {
    // 착지 효과 파티클의 색상입니다.
    color: 'rgba(255, 255, 255, 0.7)',
    // 착지 시 한 번에 생성되는 파티클의 개수입니다.
    count: 15,
    // 착지 효과 파티클의 확산 속도입니다.
    speed: 100,
    // 착지 효과 파티클의 지속 시간입니다.
    life: 1,
    // 착지 효과 파티클의 크기 변화율입니다.
    growth: 5,
  },
};

// [NEW] 플레이어 주변에 표시되는 UI 요소들의 위치와 스타일을 설정합니다.
export const PLAYER_UI_SETTINGS = {
  staminaGauge: {
    // 플레이어 중심으로부터의 상대적 위치 (offsetX: 가로, offsetY: 세로)
    // 예: { offsetX: 30, offsetY: 0 } 이면 플레이어 바로 오른쪽에 게이지가 표시됩니다.
    offsetX: 40,
    offsetY: 0,
    // 게이지의 전체 반지름
    radius: 8,
    // 게이지 선의 두께
    lineWidth: 6,
    // 스테미나 한 칸 당 필요한 수치 (예: 20이면 100 스테미나일 때 5칸)
    staminaPerSegment: 20, 
  }
};


// 인게임 HUD 우측 하단에 표시되는 캐릭터 초상화의 기본 위치와 크기입니다.
// `rem` 단위로 지정되며, 1rem은 약 16px에 해당합니다.
// 이 값들은 인게임에서 ` (백틱) 키를 눌러 활성화하는 개발자 모드를 통해 실시간으로 조정하고,
// 생성된 코드를 여기에 붙여넣어 쉽게 업데이트할 수 있습니다.
export const PLAYER_HUD_SETTINGS = {
  // 화면 오른쪽 가장자리에서의 거리
  right: '-0.8rem',
  // 화면 아래쪽 가장자리에서의 거리
  bottom: '0.9rem',
  // 초상화 컨테이너의 전체 너비
  width: '20rem',
};

// 게임 오버 화면에 표시되는 '임무 실패' 캐릭터 이미지의 위치와 크기입니다.
// 이 값들은 게임 오버 화면에서 ` (백틱) 키를 눌러 활성화하는 개발자 모드를 통해 실시간으로 조정하고,
// 생성된 코드를 여기에 붙여넣어 쉽게 업데이트할 수 있습니다.
export const GAME_OVER_UI_SETTINGS = {
  // 이미지의 너비입니다. 'rem` 단위를 사용합니다. (예: '15rem')
  imageWidth: '50rem',
  // 게임 오버 창의 왼쪽 가장자리로부터의 가로 위치입니다. 음수 값을 사용하면 창 밖으로 나가게 할 수 있습니다. (예: '-10rem')
  imageLeft: '-17rem',
  // 게임 오버 창의 아래쪽 가장자리로부터의 세로 위치입니다. (예: '0rem')
  imageBottom: '-3.8rem',
};
