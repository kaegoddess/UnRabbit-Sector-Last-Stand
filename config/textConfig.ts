// 게임 내 모든 텍스트를 관리하는 파일입니다.
// 이곳의 내용을 수정하면 게임 전체에 반영됩니다.

export const GAME_TEXT = {
  // 1. 게임 제목 및 부제
  TITLES: {
    MAIN: "언래빗 섹터",
    SUBTITLE: "프로젝트: 발키리",
    OPERATION: "작전명: 최후의 저항",
  },

  // 2. 로딩 화면 텍스트
  LOADING: {
    SYSTEM_ALERT: ":: 시스템 경고 ::",
    // 로딩 화면의 세계관 설명
    LORE: "Z-13 바이러스 발발로 전 세계 인구가 초토화되었습니다. 통신은 두절되었고 지원은 전무합니다. 사령부는 '최후의 저항 작전'을 승인했습니다. 해당 구역을 확보하십시오. 모든 적대 세력을 제거하십시오. 생존 여부는 선택 사항입니다.",
    SYSTEM_READY: "시스템 준비 완료 // 클릭하여 시작",
    INIT_SYSTEM: "전투 시스템 초기화 중...",
    ALL_GREEN: "모든 시스템 정상",
    ASSET_LOADER_PREFIX: "에셋_로더_V 0.58", // [수정] 버전 번호가 없는 접두사로 변경
    ESTABLISHING: "업링크_연결_시도_중...",
    CONNECTED: "보안_연결_설정_완료",
  },

  // 3. 메인 메뉴 텍스트
  MENU: {
    DEPLOY_BUTTON: "배치",
    LOADOUT_HEADER: "장비 선택",
    LOCKED_SLOT: "슬롯 잠김\n 개방 예정",
    // 우측 패널의 통신 헤더
    ENCRYPTED_SIGNAL: "암호화된_신호_V1",
    INCOMING_TRANS: "수신 중인 통신",
    DECODING: "신호 해독 중...",

    // 캐릭터 설명 (좌측 패널)
    CHAR_NAME: "작전 요원: 캐럿",
    CHAR_STATUS: "상태: 뜀뛰기 준비 완료",
    CHAR_DESC: "정예 명사수 요원. 모든 면에서 뛰어난 실력 보유.",

    // 로딩 스캔 텍스트
    SCAN_BIOMETRICS: "홍채 인식 스캔 중...",
  },

  // 4. 인게임 UI (HUD)
  HUD: {
    CHAR_NAME: "캐럿",
    SCORE_LABEL: "점수",
    WAVE_LABEL: "웨이브",
    HP_LABEL: "HP",
    // [NEW] 조작법 UI 제목
    CONTROLS_LABEL: "조작법",
    // [REFACTORED] 조작법을 배열 형태로 변경하여 쉽게 수정 및 추가할 수 있도록 함
    CONTROLS: [
      { action: "이동", keys: "W / A / S / D" },
      { action: "사격", keys: "마우스 좌클릭" },
      { action: "재장전", keys: "R" },
      { action: "전력질주", keys: "Shift (누르기)" },
      { action: "닷지", keys: "Space" },
      { action: "수류탄", keys: "Q" },
    ],
    // 캐릭터 이미지 로딩 중일 때
    LINKING: "연결 중...",
    // 재장전 바 텍스트
    RELOADING: "재장전!",
    LEVEL: "LV.",
    // [NEW] 빠른 재장전 텍스트
    QUICK_RELOAD_SUCCESS: "빠른 재장전!",
    QUICK_RELOAD_FAIL: "재장전 실패!",
  },

  // 5. 게임 오버 화면
  GAME_OVER: {
    TITLE: "임무 중 실종됨",
    SCORE: "최종 점수",
    WAVES: "클리어한 웨이브",
    KILLS: "제거한 적대 세력",
    HQ_ANALYSIS: "사령부 분석:",
    CONNECTION_LOST: "연결 끊어짐...",
    RETRY_BUTTON: "재배치",
  },

  // 6. 무기 정보 (이름 및 타입)
  WEAPONS: {
    M1911: {
      NAME: "M1911 RB Type",
      TYPE: "Semi-Auto Pistol",
    },
    MP5: {
      NAME: "MP5 RB Type",
      TYPE: "Submachine Gun",
    },
    RIFLE: {
      NAME: "M1 Bouncer",
      TYPE: "Semi-Auto Rifle",
    },
    SHOTGUN: {
      NAME: "S-12 Hop-Shot",
      TYPE: "Pump-Action Shotgun",
    }
  },
  
  // 7. 무기 업그레이드 화면
  UPGRADES: {
    HEADER: "무기 개조 승인",
    SUBHEADER: "업그레이드할 부품을 선택하십시오",
    MAX_LEVEL: "MAX",
    LEVEL_PREFIX: "Lv."
  },

  // 8. 로딩 UI 기본 텍스트
  SYSTEM: {
    RETRIEVING: "정보 검색 중...",
    ENCRYPTED: "암호 해독 중",
  },

  // 9. 미션 브리핑 텍스트 목록 (랜덤 출력)
  MISSION_BRIEFINGS: [
    "코드명 캐럿, 여기는 사령부. 7구역의 바이러스 수치가 임계점을 넘었다. 즉시 진입하여 감염체를 소탕하고 생존하라.",
    "알립니다. 해당 섹터의 통신이 곧 두절됩니다. 지원군은 없습니다. 가지고 있는 탄약으로 최대한 오래 버티십시오. 행운을 빕니다.",
    "긴급 작전 하달. 좀비들의 이동 경로가 도시 외곽으로 향하고 있다. 귀관이 최후의 방어선이다. 놈들이 이 선을 넘지 못하게 하라.",
    "사령부에서 전파. 생체 신호가 불안정하다. 극도의 주의를 요망함. 모든 움직이는 대상을 적으로 간주하고 사격하라.",
    "작전명: 라스트 스탠드. 후퇴는 없다. 탄창을 확인하고 전방을 주시하라. 놈들이 몰려오고 있다.",
    "여기는 델타 팀. 우리는 전멸했다... 반복한다, 우리는... (치직) ...접근하지 마... 놈들은 너무 빨라...!",
  ],

  // 10. 사후 보고서 - 칭찬 (500점 이상)
  HIGH_SCORE_REPORTS: [
    "놀라운 전투 능력이다. 사령부에서도 귀관의 기록에 주목하고 있다.",
    "훌륭하다, 캐럿. 혼자서 일개 중대 병력 이상의 전과를 올렸다.",
    "압도적인 무력 시위였다. 비록 철수는 실패했지만, 귀관의 데이터는 인류의 희망이 될 것이다.",
    "전설적인 최후였다. 교본에 실릴만한 방어전이었다.",
    "믿을 수 없군. 그 지옥에서 이렇게 오래 버티다니.",
  ],

  // 11. 사후 보고서 - 비판/격려 (500점 미만)
  LOW_SCORE_REPORTS: [
    "방어선이 너무 허무하게 뚫렸다. 다음번엔 거리를 유지하며 사격하라.",
    "임무 실패. 탄약 관리와 재장전 타이밍이 생사를 가른다.",
    "실망스러운 결과다. 적들의 패턴을 파악하고 침착하게 대응하라.",
    "너무 빨리 당했다. 놈들에게 포위당하지 않도록 계속 움직여야 한다.",
    "전사 확인. 시신 수습 불가. 작전은 실패로 돌아갔다.",
  ]
};
