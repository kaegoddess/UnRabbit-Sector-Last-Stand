// config/abilityConfig.ts
// 이 파일은 수류탄과 같은 플레이어의 특수 능력에 대한 모든 설정을 관리합니다.
// 능력의 밸런스를 조정하고 싶다면 이 파일만 수정하면 됩니다.

export const GRENADE_STATS = {
    // --- 레벨업 및 성장 ---
    // 기본 데미지. 이 값에 레벨당 데미지가 추가됩니다.
    baseDamage: 50,
    // 레벨당 증가하는 데미지.
    damagePerLevel: 10,
    // 기본 폭발 반경 (픽셀 단위).
    baseRadius: 100,
    // 레벨당 증가하는 폭발 반경.
    radiusPerLevel: 10,
    // 기본 재사용 대기시간 (초).
    baseCooldown: 10.0,
    // 레벨당 감소하는 쿨타임 (초).
    cooldownReductionPerLevel: 0.5,
    // 기본 넉백 힘. 수치가 클수록 적이 더 멀리 밀려납니다.
    baseKnockback: 400, 
    // 레벨당 증가하는 넉백 힘.
    knockbackPerLevel: 50,
    // 넉백 효과 지속 시간 (초).
    knockbackDuration: 0.3, 

    // --- 경험치 및 레벨 ---
    // 초기(레벨 1 -> 2)에 필요한 경험치.
    baseMaxXp: 10,
    // 레벨업 시 다음 필요 경험치 증가 배율 (1.5 = 50% 증가).
    xpMultiplierPerLevel: 1.5,
    // 수류탄 폭발로 적을 처치했을 때 얻는 경험치.
    xpPerKill: 1,

    // --- 물리 효과 ---
    // 던지는 초기 속도 (수평).
    throwVelocity: 250,
    // 던지는 초기 속도 (수직, 점프 높이).
    throwVerticalVelocity: 250,
    // 수류탄에 적용되는 중력.
    gravity: 800,
    // 바닥에 튕기는 정도 (0.0 ~ 1.0).
    bounciness: 0.4,
    // 바닥에 떨어진 후 구르다가 터지기까지 걸리는 시간 (초).
    rollDuration: 1.5,
    // 수평 속도 감쇠 (구를 때 마찰력). 1.0이면 감속 없음.
    friction: 0.5, 

    // --- 시각 효과 ---
    // 폭발 이펙트 지속 시간 (초).
    explosionDuration: 0.5,
    // [NEW] 폭발 쇼크웨이브 효과 설정
    shockwave: {
        count: 4, // 생성될 쇼크웨이브 링 개수 (예: 4로 늘리면 더 화려해짐)
        color: '#f97316', // 쇼크웨이브 색상 (주황색)
    },
    // 폭발 시 생성되는 파편 파티클 개수.
    explosionParticleCount: 30,
    // 폭발 시 화면 흔들림 강도.
    screenShakeIntensity: 8,
    // 폭발 시 화면 흔들림 지속 시간 (초).
    screenShakeDuration: 0.25,
};
