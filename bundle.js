

// This is a bundled and transpiled file.
// All your .ts and .tsx files have been combined into this one file.

"use strict";

(function() {
    // This is a simplified module system for the bundle.
    const modules = {};
    const require = (name) => {
        if (!modules[name]) {
            throw new Error(`Module ${name} not found.`);
        }
        return modules[name];
    };

    // --- Start of file: types.ts ---
    modules['types.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.WeaponPart = exports.ItemType = exports.GameStatus = void 0;
        var WeaponPart;
        (function (WeaponPart) {
            WeaponPart["SCOPE"] = "SCOPE";
            WeaponPart["BARREL"] = "BARREL";
            WeaponPart["MAG"] = "MAG";
            WeaponPart["MUZZLE"] = "MUZZLE";
            WeaponPart["AMMO"] = "AMMO";
            WeaponPart["SPRING"] = "SPRING";
            WeaponPart["GRIP"] = "GRIP";
            WeaponPart["STOCK"] = "STOCK";
        })(WeaponPart = exports.WeaponPart || (exports.WeaponPart = {}));
        var ItemType;
        (function (ItemType) {
            ItemType["HEALTH_PACK_SMALL"] = "HEALTH_PACK_SMALL";
        })(ItemType = exports.ItemType || (exports.ItemType = {}));
        var GameStatus;
        (function (GameStatus) {
            GameStatus["MENU"] = "MENU";
            GameStatus["PLAYING"] = "PLAYING";
            GameStatus["GAME_OVER"] = "GAME_OVER";
            GameStatus["PAUSED"] = "PAUSED";
            GameStatus["LEVEL_UP"] = "LEVEL_UP";
        })(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
        return exports;
    }({}));

    // --- Start of file: config/gameConfig.ts ---
    modules['config/gameConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.SOUND_SETTINGS = {
            masterVolume: 3,
            footstepInterval: 350,
            assets: {
                shoot: 'sound/shoot.mp3',
                impact: 'sound/impact.mp3',
                footstep: 'sound/footstep.mp3',
                reload: 'sound/reload.mp3',
                playerHit: 'sound/player_hit.mp3',
                itemPickup: 'sound/pickup.mp3',
                uiSelect: 'sound/ui_select.mp3',
                quickReloadSuccess: 'sound/quick_reload_success.mp3',
                quickReloadFail: 'sound/quick_reload_fail.mp3',
            }
        };
        exports.FLOATING_TEXT = {
            life: 1,
            speed: 100,
            gravity: 300,
            randomX: 100,
            startScale: 1,
            maxScale: 2,
        };
        exports.GAME_SETTINGS = {
            particleCount: { blood: 5, zombieDeath: 8 },
            particleSpeed: 150,
            particleLifeDecay: 2.0,
            scoreToNextWave: 10,
            quickReloadInputMinProgress: 0.3,
            quickReloadShakeDuration: 0.3,
            quickReloadPostSuccessCooldown: 0.17,
        };
        exports.RENDER_SETTINGS = {
            shadowOffset: { x: 5, y: 10 },
            shadowScale: 1.3,
            visualRecoilRecoverySpeed: 500,
            maxVisualRecoil: 40,
            reloadUIScale: 1.5,
            reloadUIBaseWidth: 40,
            reloadUIBaseHeight: 6,
            reloadUIBaseYOffset: -35,
            quickReloadArrowBaseSize: 3,
            quickReloadTextBaseSize: 12,
        };
        return exports;
    }({}));

    // --- Start of file: config/playerConfig.ts ---
    modules['config/playerConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.PLAYER_STATS = {
            radius: 12,
            color: '#9c5d33',
            maxHealth: 100,
            moveSpeed: 180,
            baseRotationSpeed: 2.5,
            maxRotationSpeed: 14.0,
            rotationAcceleration: 20.0,
            reloadAbility: 1,
        };
        exports.PLAYER_HUD_SETTINGS = {
            right: '-2.6rem',
            bottom: '0.7rem',
            width: '20rem',
        };
        exports.GAME_OVER_UI_SETTINGS = {
            imageWidth: '50rem',
            imageLeft: '-17rem',
            imageBottom: '-3.8rem',
        };
        return exports;
    }({}));

    // --- Start of file: config/textConfig.ts ---
    modules['config/textConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.GAME_TEXT = {
            TITLES: {
                MAIN: "언래빗 섹터",
                SUBTITLE: "프로젝트: 발키리",
                OPERATION: "작전명: 최후의 저항",
            },
            LOADING: {
                SYSTEM_ALERT: ":: 시스템 경고 ::",
                LORE: "Z-13 바이러스 발발로 전 세계 인구가 초토화되었습니다. 통신은 두절되었고 지원은 전무합니다. 사령부는 '최후의 저항 작전'을 승인했습니다. 해당 구역을 확보하십시오. 모든 적대 세력을 제거하십시오. 생존 여부는 선택 사항입니다.",
                SYSTEM_READY: "시스템 준비 완료 // 클릭하여 시작",
                INIT_SYSTEM: "전투 시스템 초기화 중...",
                ALL_GREEN: "모든 시스템 정상",
                ASSET_LOADER: "에셋_로더_V2.1",
                ESTABLISHING: "업링크_연결_시도_중...",
                CONNECTED: "보안_연결_설정_완료",
            },
            MENU: {
                DEPLOY_BUTTON: "배치",
                LOADOUT_HEADER: "장비 선택",
                LOCKED_SLOT: "슬롯 잠김\n 개방 예정",
                ENCRYPTED_SIGNAL: "암호화된_신호_V1",
                INCOMING_TRANS: "수신 중인 통신",
                DECODING: "신호 해독 중...",
                CHAR_NAME: "작전 요원: 캐럿",
                CHAR_STATUS: "상태: 뜀뛰기 준비 완료",
                CHAR_DESC: "정예 명사수 요원. 모든 면에서 뛰어난 실력 보유.",
                SCAN_BIOMETRICS: "홍채 인식 스캔 중...",
            },
            HUD: {
                CHAR_NAME: "캐럿",
                SCORE_LABEL: "점수",
                WAVE_LABEL: "웨이브",
                HP_LABEL: "HP",
                CONTROLS: { MOVE: "WASD - 이동", FIRE: "LMB - 사격", RELOAD: "R - 재장전" },
                LINKING: "연결 중...",
                RELOADING: "재장전!",
                LEVEL: "LV.",
                QUICK_RELOAD_SUCCESS: "빠른 재장전!",
                QUICK_RELOAD_FAIL: "재장전 실패!",
            },
            GAME_OVER: {
                TITLE: "임무 중 실종됨",
                SCORE: "최종 점수",
                WAVES: "클리어한 웨이브",
                KILLS: "제거한 적대 세력",
                HQ_ANALYSIS: "사령부 분석:",
                CONNECTION_LOST: "연결 끊어짐...",
                RETRY_BUTTON: "재배치",
            },
            WEAPONS: {
                M1911: { NAME: "M1911 RB Type", TYPE: "Semi-Auto Pistol" },
                MP5: { NAME: "MP5 RB Type", TYPE: "Submachine Gun" },
                RIFLE: { NAME: "M1 Bouncer", TYPE: "Semi-Auto Rifle" },
                SHOTGUN: { NAME: "S-12 Hop-Shot", TYPE: "Pump-Action Shotgun" },
            },
            UPGRADES: {
                HEADER: "무기 개조 승인",
                SUBHEADER: "업그레이드할 부품을 선택하십시오",
                MAX_LEVEL: "MAX",
                LEVEL_PREFIX: "Lv."
            },
            SYSTEM: {
                RETRIEVING: "정보 검색 중...",
                ENCRYPTED: "암호 해독 중",
            },
            MISSION_BRIEFINGS: [
                "코드명 캐럿, 여기는 사령부. 7구역의 바이러스 수치가 임계점을 넘었다. 즉시 진입하여 감염체를 소탕하고 생존하라.",
                "알립니다. 해당 섹터의 통신이 곧 두절됩니다. 지원군은 없습니다. 가지고 있는 탄약으로 최대한 오래 버티십시오. 행운을 빕니다.",
                "긴급 작전 하달. 좀비들의 이동 경로가 도시 외곽으로 향하고 있다. 귀관이 최후의 방어선이다. 놈들이 이 선을 넘지 못하게 하라.",
                "사령부에서 전파. 생체 신호가 불안정하다. 극도의 주의를 요망함. 모든 움직이는 대상을 적으로 간주하고 사격하라.",
                "작전명: 라스트 스탠드. 후퇴는 없다. 탄창을 확인하고 전방을 주시하라. 놈들이 몰려오고 있다.",
                "여기는 델타 팀. 우리는 전멸했다... 반복한다, 우리는... (치직) ...접근하지 마... 놈들은 너무 빨라...!",
            ],
            HIGH_SCORE_REPORTS: [
                "놀라운 전투 능력이다. 사령부에서도 귀관의 기록에 주목하고 있다.",
                "훌륭하다, 캐럿. 혼자서 일개 중대 병력 이상의 전과를 올렸다.",
                "압도적인 무력 시위였다. 비록 철수는 실패했지만, 귀관의 데이터는 인류의 희망이 될 것이다.",
                "전설적인 최후였다. 교본에 실릴만한 방어전이었다.",
                "믿을 수 없군. 그 지옥에서 이렇게 오래 버티다니.",
            ],
            LOW_SCORE_REPORTS: [
                "방어선이 너무 허무하게 뚫렸다. 다음번엔 거리를 유지하며 사격하라.",
                "임무 실패. 탄약 관리와 재장전 타이밍이 생사를 가른다.",
                "실망스러운 결과다. 적들의 패턴을 파악하고 침착하게 대응하라.",
                "너무 빨리 당했다. 놈들에게 포위당하지 않도록 계속 움직여야 한다.",
                "전사 확인. 시신 수습 불가. 작전은 실패로 돌아갔다.",
            ]
        };
        return exports;
    }({}));
    
    // --- Start of file: config/weaponDb.ts ---
    modules['config/weaponDb.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const { GAME_TEXT } = require('config/textConfig.ts');
        const { WeaponPart } = require('types.ts');
        const PISTOL_CHAR_POS = { x: 45, y: 40 };
        const MP5_CHAR_POS = { x: 45, y: 40 };
        const RIFLE_CHAR_POS = { x: 45, y: 40 };
        const SHOTGUN_CHAR_POS = { x: 45, y: 40 };
        const PISTOL_UPGRADE_POS = {
            [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x: 0, y: -80 } },
            [WeaponPart.SPRING]: { x: -330, y: 80, anchor: { x: -100, y: 0 } },
            [WeaponPart.AMMO]: { x: 330, y: 80, anchor: { x: -80, y: 30 } },
            [WeaponPart.MAG]: { x: 280, y: 200, anchor: { x: -70, y: 80 } },
            [WeaponPart.MUZZLE]: { x: 330, y: -40, anchor: { x: 20, y: -10 } },
            [WeaponPart.BARREL]: { x: 280, y: -160, anchor: { x: 160, y: -80 } },
            [WeaponPart.GRIP]: { x: -330, y: -40, anchor: { x: -120, y: -70 } },
            [WeaponPart.STOCK]: { x: -280, y: 200, anchor: { x: -120, y: 60 } },
        };
        const MP5_UPGRADE_POS = {
            [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x: 50, y: -25 } },
            [WeaponPart.GRIP]: { x: -330, y: -40, anchor: { x: -20, y: 35 } },
            [WeaponPart.SPRING]: { x: -330, y: 80, anchor: { x: -60, y: -20 } },
            [WeaponPart.STOCK]: { x: -280, y: 200, anchor: { x: -80, y: 20 } },
            [WeaponPart.BARREL]: { x: 280, y: -160, anchor: { x: 140, y: -10 } },
            [WeaponPart.MUZZLE]: { x: 330, y: -40, anchor: { x: 195, y: -5 } },
            [WeaponPart.AMMO]: { x: 330, y: 80, anchor: { x: 0, y: 30 } },
            [WeaponPart.MAG]: { x: 280, y: 200, anchor: { x: -10, y: 80 } },
        };
        const RIFLE_UPGRADE_POS = {
            [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x: 0, y: -30 } },
            [WeaponPart.GRIP]: { x: -330, y: 80, anchor: { x: -50, y: 25 } },
            [WeaponPart.SPRING]: { x: -330, y: -40, anchor: { x: -80, y: 0 } },
            [WeaponPart.STOCK]: { x: -280, y: 200, anchor: { x: -200, y: 15 } },
            [WeaponPart.BARREL]: { x: 280, y: -160, anchor: { x: 220, y: -20 } },
            [WeaponPart.MUZZLE]: { x: 330, y: -40, anchor: { x: 280, y: -20 } },
            [WeaponPart.AMMO]: { x: 330, y: 80, anchor: { x: 0, y: 20 } },
            [WeaponPart.MAG]: { x: 280, y: 200, anchor: { x: -10, y: 55 } },
        };
        const SHOTGUN_UPGRADE_POS = {
            [WeaponPart.SCOPE]: { x: -280, y: -160, anchor: { x: 0, y: -30 } },
            [WeaponPart.GRIP]: { x: -330, y: 80, anchor: { x: -50, y: 25 } },
            [WeaponPart.SPRING]: { x: -330, y: -40, anchor: { x: -80, y: 0 } },
            [WeaponPart.STOCK]: { x: -280, y: 200, anchor: { x: -150, y: 15 } },
            [WeaponPart.BARREL]: { x: 280, y: -160, anchor: { x: 180, y: -10 } },
            [WeaponPart.MUZZLE]: { x: 330, y: -40, anchor: { x: 240, y: -10 } },
            [WeaponPart.AMMO]: { x: 330, y: 80, anchor: { x: 0, y: 20 } },
            [WeaponPart.MAG]: { x: 280, y: 200, anchor: { x: -10, y: 55 } },
        };
        exports.WEAPON_DATABASE = {
            Pistol: {
                display: { name: GAME_TEXT.WEAPONS.M1911.NAME, type: GAME_TEXT.WEAPONS.M1911.TYPE },
                combat: { fireRate: 400, damage: 25, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.2, criticalMultiplier: 1.5, knockback: 25, slow: { factor: 0.6, duration: 0.3 }, penetration: { count: 2, chance: 1, damageDrop: 0.2 } },
                bullet: { bulletSpeed: 1000, bulletRadius: 3, bulletColor: '#fbbf24', maxDistance: 350 },
                handling: { minSpread: 0.05, maxSpread: 0.3, recoilControl: 4, recoilResetTime: 250, maxSpreadMoving: 0.6, movementStability: 5, aimDelay: 0.1, gunRecoil: 20, recoilRecovery: 10, maxAmmo: 8, reloadTime: 1200, quickReloadMinTimePercent: 0.3, quickReloadMaxTimePercent: 0.7, quickReloadDifficultyPercent: 0.2 },
                visuals: { menuIconScale: 0.8, hudIconScale: 2, upgradeImageScale: 0.5, gunRightOffset: 5, muzzleFlashSize: 10, muzzleFlashOffset: 12, muzzleFlashColors: ['#FFFFFF', '#FEF08A', '#F97316'], laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 }, render: { slide: { length: 24, width: 6, color: '#cbd5e1', offsetX: 0, offsetY: 0 }, slide_detail: { length: 4, width: 6, color: '#475569', offsetX: 20, offsetY: 0 } }, screenShake: { intensity: 1, duration: 0.05 }, uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2 }, shellEjection: { color: '#FBBF24', size: 2.5, velocity: 120, verticalVelocity: 150, gravity: 800, bounciness: 0.6, variance: 0.3, life: 3 }, gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.4)', count: 4, speed: 30, life: 0.8, growth: 15 } },
                ui: { upgradePositions: PISTOL_UPGRADE_POS, characterPosition: PISTOL_CHAR_POS }
            },
            MP5: {
                display: { name: GAME_TEXT.WEAPONS.MP5.NAME, type: GAME_TEXT.WEAPONS.MP5.TYPE },
                combat: { fireRate: 100, damage: 5, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.1, criticalMultiplier: 1.5, knockback: 5, slow: { factor: 0.9, duration: 0.1 }, penetration: { count: 1, chance: 1, damageDrop: 0.3 } },
                bullet: { bulletSpeed: 1200, bulletRadius: 3, bulletColor: '#fde047', maxDistance: 300 },
                handling: { minSpread: 0.05, maxSpread: 0.4, recoilControl: 10, recoilResetTime: 250, maxSpreadMoving: 0.8, movementStability: 5, aimDelay: 0.2, gunRecoil: 5, recoilRecovery: 40, maxAmmo: 30, reloadTime: 1500, quickReloadMinTimePercent: 0.3, quickReloadMaxTimePercent: 0.6, quickReloadDifficultyPercent: 0.10 },
                visuals: { menuIconScale: 0.9, hudIconScale: 2, upgradeImageScale: 0.5, gunRightOffset: 6, muzzleFlashSize: 8, muzzleFlashOffset: 18, muzzleFlashColors: ['#FFFFFF', '#fef9c3', '#ca8a04'], laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 }, render: { body: { length: 26, width: 8, color: '#374151', offsetX: 0, offsetY: 0 }, barrel: { length: 10, width: 6, color: '#111827', offsetX: 26, offsetY: 0 }, magazine_port: { length: 7, width: 20, color: '#1f2937', offsetX: 15, offsetY: 11 }, stock_mount: { length: 4, width: 4, color: '#1f2937', offsetX: -4, offsetY: 0 } }, screenShake: { intensity: 0.5, duration: 0.03 }, uiCasingPhysics: { velocity: { x: 150, y: -450 }, velocityVariance: { x: 80, y: 100 }, gravity: 1200, bounciness: 0.4, rotationSpeed: 25, life: 1.5 }, shellEjection: { color: '#FBBF24', size: 2.5, velocity: 140, verticalVelocity: 180, gravity: 800, bounciness: 0.5, variance: 0.4, life: 2.5 }, gunSmoke: { enabled: true, color: 'rgba(150, 150, 150, 0.3)', count: 2, speed: 40, life: 0.5, growth: 10 } },
                ui: { upgradePositions: MP5_UPGRADE_POS, characterPosition: MP5_CHAR_POS }
            },
            Rifle: {
                display: { name: GAME_TEXT.WEAPONS.RIFLE.NAME, type: GAME_TEXT.WEAPONS.RIFLE.TYPE },
                combat: { fireRate: 800, damage: 80, damagePerLevel: 0, pelletCount: 1, criticalChance: 0.5, criticalMultiplier: 2, knockback: 80, slow: { factor: 0.5, duration: 0.5 }, penetration: { count: 4, chance: 1, damageDrop: 0.1 } },
                bullet: { bulletSpeed: 1500, bulletRadius: 6, bulletColor: '#ffedd5', maxDistance: 400 },
                handling: { minSpread: 0.01, maxSpread: 0.6, recoilControl: 2, recoilResetTime: 150, maxSpreadMoving: 1, movementStability: 1, aimDelay: 0.25, gunRecoil: 30, recoilRecovery: 5, maxAmmo: 5, reloadTime: 2500, quickReloadMinTimePercent: 0.5, quickReloadMaxTimePercent: 0.6, quickReloadDifficultyPercent: 0.06 },
                visuals: { menuIconScale: 1.0, hudIconScale: 2, upgradeImageScale: 0.5, gunRightOffset: 8, muzzleFlashSize: 15, muzzleFlashOffset: 25, muzzleFlashColors: ['#FFFFFF', '#fcd34d', '#f97316'], laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1.5 }, render: { body: { length: 30, width: 6, color: '#5d4037', offsetX: -10, offsetY: 0 }, barrel: { length: 15, width: 4, color: '#212121', offsetX: 20, offsetY: 0 } }, screenShake: { intensity: 3, duration: 0.1 }, uiCasingPhysics: { velocity: { x: 120, y: -500 }, velocityVariance: { x: 60, y: 120 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 10, life: 2.5 }, shellEjection: { color: '#FBBF24', size: 3.5, velocity: 100, verticalVelocity: 200, gravity: 800, bounciness: 0.6, variance: 0.2, life: 3.5 }, gunSmoke: { enabled: true, color: 'rgba(220, 220, 220, 0.5)', count: 6, speed: 35, life: 1.2, growth: 20 } },
                ui: { upgradePositions: RIFLE_UPGRADE_POS, characterPosition: RIFLE_CHAR_POS }
            },
            Shotgun: {
                display: { name: GAME_TEXT.WEAPONS.SHOTGUN.NAME, type: GAME_TEXT.WEAPONS.SHOTGUN.TYPE },
                combat: { fireRate: 600, damage: 6, damagePerLevel: 0, pelletCount: 5, criticalChance: 0.05, criticalMultiplier: 1.5, knockback: 20, slow: { factor: 0.7, duration: 0.2 }, penetration: { count: 1, chance: 1, damageDrop: 0.5 } },
                bullet: { bulletSpeed: 900, bulletRadius: 2, bulletColor: '#fef3c7', maxDistance: 300 },
                handling: { minSpread: 0.4, maxSpread: 0.8, recoilControl: 2, recoilResetTime: 100, maxSpreadMoving: 1.2, movementStability: 1.5, aimDelay: 0.15, gunRecoil: 40, recoilRecovery: 5, maxAmmo: 6, reloadTime: 2000, quickReloadMinTimePercent: 0.5, quickReloadMaxTimePercent: 0.8, quickReloadDifficultyPercent: 0.10 },
                visuals: { menuIconScale: 1.0, hudIconScale: 2, upgradeImageScale: 0.5, gunRightOffset: 8, muzzleFlashSize: 20, muzzleFlashOffset: 20, muzzleFlashColors: ['#FFFFFF', '#fef08a', '#fb923c'], laserSight: { enabled: true, color: 'rgba(239, 68, 68, 0.7)', dotColor: '#ff0000', width: 1 }, render: { body: { length: 40, width: 8, color: '#cc7a29', offsetX: -5, offsetY: 0 }, pump: { length: 15, width: 6, color: '#423532', offsetX: 5, offsetY: 0 }, barrel: { length: 20, width: 5, color: '#303030', offsetX: 20, offsetY: 0 }, }, screenShake: { intensity: 4, duration: 0.15 }, uiCasingPhysics: { velocity: { x: 100, y: -400 }, velocityVariance: { x: 50, y: 150 }, gravity: 1200, bounciness: 0.5, rotationSpeed: 15, life: 2 }, shellEjection: { color: '#dc2626', size: 4, velocity: 150, verticalVelocity: 150, gravity: 800, bounciness: 0.4, variance: 0.5, life: 3 }, gunSmoke: { enabled: true, color: 'rgba(200, 200, 200, 0.6)', count: 8, speed: 45, life: 1.5, growth: 25 } },
                ui: { upgradePositions: SHOTGUN_UPGRADE_POS, characterPosition: SHOTGUN_CHAR_POS }
            }
        };
        return exports;
    }({}));

    // --- Start of file: config/weaponConfig.ts ---
    modules['config/weaponConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const { WEAPON_DATABASE } = require('config/weaponDb.ts');
        const flattenWeaponData = (db) => {
            const flattened = {};
            for (const weaponKey in db) {
                const weaponData = db[weaponKey];
                const weapon = {
                    ...weaponData.display,
                    ...weaponData.combat,
                    ...weaponData.bullet,
                    ...weaponData.handling,
                    ...weaponData.visuals,
                    ...weaponData.ui,
                };
                const renderConfig = weaponData.visuals.render;
                if (renderConfig) {
                    let calculatedGunLength = 0;
                    for (const part of Object.values(renderConfig)) {
                        const partEnd = (part.offsetX || 0) + part.length;
                        if (partEnd > calculatedGunLength) {
                            calculatedGunLength = partEnd;
                        }
                    }
                    weapon.gunLength = calculatedGunLength;
                }
                flattened[weaponKey] = weapon;
            }
            return flattened;
        };
        exports.WEAPONS = flattenWeaponData(WEAPON_DATABASE);
        return exports;
    }({}));

    // --- Start of file: config/upgradeConfig.ts ---
    modules['config/upgradeConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const { WeaponPart } = require('types.ts');
        exports.UPGRADE_CONFIG = {
            [WeaponPart.SCOPE]: { NAME: "전술 조준경", DESC: "시야 범위 +6%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_1.png", maxLevel: 5, statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'zoom', value: 0.06 } },
            [WeaponPart.BARREL]: { NAME: "정밀 총열", DESC: "유효 사거리 +10%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_2.png", maxLevel: 5, statEffect: { type: 'ADD_PERCENT_BASE', stat: 'maxDistance', value: 0.1 } },
            [WeaponPart.MAG]: { NAME: "대용량 탄창", DESC: "최대 장탄수 +10%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_3.png", maxLevel: 5, statEffect: { type: 'ADD_PERCENT_BASE', stat: 'maxAmmo', value: 0.1 } },
            [WeaponPart.MUZZLE]: { NAME: "충격 제동기", DESC: "반동 제어력 강화", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_2.png", maxLevel: 5, statEffect: { type: 'ADD_BONUS', stat: 'recoilControl', value: 1 } },
            [WeaponPart.AMMO]: { NAME: "철갑탄", DESC: "관통 확률 +20%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_6.png", maxLevel: 5, statEffect: { type: 'ADD_BONUS', stat: 'penetrationChance', value: 0.20 } },
            [WeaponPart.SPRING]: { NAME: "강화 스프링", DESC: "연사 속도 +10%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_7.png", maxLevel: 5, statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'fireRate', value: 0.1 } },
            [WeaponPart.GRIP]: { NAME: "인체공학 손잡이", DESC: "조준 반응 속도 +10%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_4.png", maxLevel: 5, statEffect: { type: 'SUBTRACT_PERCENT_BASE', stat: 'aimDelay', value: 0.1 } },
            [WeaponPart.STOCK]: { NAME: "전술 개머리판", DESC: "공격력 +5%", ICON: "https://storage.cloud.google.com/kaelove_game_01/up_4.png", maxLevel: 5, statEffect: { type: 'ADD_PERCENT_BASE', stat: 'damage', value: 0.05 } }
        };
        return exports;
    }({}));

    // --- Start of file: config/zombieConfig.ts ---
    modules['config/zombieConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.ZOMBIE_STATS = {
            spawnRate: 1000,
            minSpawnRate: 200,
            spawnPadding: 50,
            types: {
                walker: { speed: 80, speedVariance: 10, baseHealth: 10, radius: 14, color: '#f97316', damage: 10, score: 10, xp: 10, dropChanceMultiplier: 1 },
                runner: { speed: 240, speedVariance: 10, baseHealth: 10, radius: 12, color: '#ef4444', damage: 20, score: 20, xp: 20, minWave: 5, chance: 0.2, dropChanceMultiplier: 1.2 },
                tank: { speed: 40, speedVariance: 10, baseHealth: 100, radius: 22, color: '#7f1d1d', damage: 30, score: 50, xp: 50, minWave: 10, chance: 0.05, dropChanceMultiplier: 2 }
            },
            healthMultiplierPerWave: 1,
        };
        return exports;
    }({}));
    
    // --- Start of file: config/itemConfig.ts ---
    modules['config/itemConfig.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const { ItemType } = require('types.ts');
        const { RENDER_SETTINGS } = require('config/gameConfig.ts');
        exports.ITEMS_CONFIG = {
            [ItemType.HEALTH_PACK_SMALL]: {
                name: "소형 회복 아이템",
                itemType: ItemType.HEALTH_PACK_SMALL,
                type: 'INSTANT_HEAL',
                value: 10,
                baseDropChance: 0.10,
                pickupRadius: 20,
                renderScale: 1.5,
                physics: { velocity: 100, verticalVelocity: 200, gravity: 800, bounciness: 0.5, life: 20.0 },
                draw: (ctx, item) => {
                    const s = exports.ITEMS_CONFIG[item.itemType].renderScale;
                    ctx.save();
                    ctx.translate(item.x, item.y - item.z);
                    ctx.rotate(item.rotation);
                    ctx.fillStyle = '#f97316';
                    ctx.beginPath();
                    ctx.moveTo(0, 10 * s);
                    ctx.lineTo(5 * s, -5 * s);
                    ctx.lineTo(-5 * s, -5 * s);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.fillRect(-3 * s, -10 * s, 2 * s, 5 * s);
                    ctx.fillRect(1 * s, -11 * s, 2 * s, 6 * s);
                    ctx.fillRect(-1 * s, -12 * s, 2 * s, 7 * s);
                    ctx.restore();
                }
            }
        };
        return exports;
    }({}));

    // --- Start of file: services/SoundService.ts ---
    modules['services/SoundService.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const { SOUND_SETTINGS } = require('config/gameConfig.ts');
        class SoundService {
            constructor() {
                this.context = null;
                this.buffers = {};
                this.initialized = false;
                this.dbName = 'UndeadSectorAudioDB';
                this.storeName = 'audioFiles';
                this.isLocalFile = window.location.protocol === 'file:';
                this.SOUND_ASSETS_CONFIG = SOUND_SETTINGS.assets;
            }
            async init() {
                if (this.initialized) {
                    if (this.context?.state === 'suspended') {
                        await this.context.resume();
                    }
                    return;
                }
                this.ensureContext();
                this.initialized = true;
                await this.loadAssets();
                await this.loadCustomSoundsFromStorage();
            }
            ensureContext() {
                if (!this.context) {
                    try {
                        const AudioContextClass = (window.AudioContext || window.webkitAudioContext);
                        if (AudioContextClass) {
                            this.context = new AudioContextClass();
                        }
                    } catch (e) {
                        console.error("AudioContext initialization failed:", e);
                    }
                }
            }
            openDB() {
                return new Promise((resolve, reject) => {
                    if (this.isLocalFile || !window.indexedDB) {
                        reject(this.isLocalFile ? "IndexedDB is not available in file:// protocol" : "IndexedDB not supported");
                        return;
                    }
                    const request = indexedDB.open(this.dbName, 1);
                    request.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(this.storeName)) {
                            db.createObjectStore(this.storeName);
                        }
                    };
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            }
            async loadCustomSoundsFromStorage() {
                this.ensureContext();
                if (!this.context) return [];
                if (this.isLocalFile) {
                    console.log("로컬 파일 환경 감지: IndexedDB 접근을 건너뜁니다.");
                    return [];
                }
                try {
                    const db = await this.openDB();
                    const loadedKeys = [];
                    return new Promise((resolve) => {
                        const tx = db.transaction(this.storeName, 'readonly');
                        const store = tx.objectStore(this.storeName);
                        const request = store.openCursor();
                        request.onsuccess = async (e) => {
                            const cursor = e.target.result;
                            if (cursor) {
                                const key = cursor.key;
                                const arrayBuffer = cursor.value;
                                try {
                                    const bufferCopy = arrayBuffer.slice(0);
                                    const audioBuffer = await this.context.decodeAudioData(bufferCopy);
                                    this.buffers[key] = audioBuffer;
                                    loadedKeys.push(key);
                                } catch (decodeErr) {
                                    console.error(`Failed to decode saved sound: ${key}`, decodeErr);
                                }
                                cursor.continue();
                            } else {
                                resolve(loadedKeys);
                            }
                        };
                        request.onerror = () => resolve([]);
                    });
                } catch (e) {
                    console.error("Failed to load sounds from DB:", e);
                    return [];
                }
            }
            async loadAssets() {
                if (!this.context) return;
                const assets = this.SOUND_ASSETS_CONFIG;
                const loadPromises = Object.entries(assets).map(async ([key, url]) => {
                    if (this.buffers[key]) return;
                    if (url && url.length > 0) {
                        if (this.isLocalFile) {
                            console.warn(`로컬 파일 환경 감지: 사운드 '${key}' (${url}) fetch를 건너뛰고 내장 합성음을 사용합니다.`);
                            return;
                        }
                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error(`Sound file not found: ${url}`);
                            }
                            const arrayBuffer = await response.arrayBuffer();
                            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                            this.buffers[key] = audioBuffer;
                        } catch (e) {
                            console.warn(`Failed to load sound '${key}' from '${url}'. Using synthesizer fallback.`, e);
                        }
                    }
                });
                await Promise.all(loadPromises);
            }
            async loadUserSound(key, file) {
                this.ensureContext();
                if (!this.context) return false;
                if (this.isLocalFile) {
                    console.warn("로컬 파일 환경에서는 사용자 사운드를 저장할 수 없습니다.");
                    return false;
                }
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const db = await this.openDB();
                    const tx = db.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    store.put(arrayBuffer, key);
                    const bufferCopy = arrayBuffer.slice(0);
                    const audioBuffer = await this.context.decodeAudioData(bufferCopy);
                    this.buffers[key] = audioBuffer;
                    return true;
                } catch (e) {
                    console.error(`Failed to load custom sound for ${key}`, e);
                    return false;
                }
            }
            play(soundName) {
                if (!this.context) return;
                if (this.context.state === 'suspended') this.context.resume();
                if (this.buffers[soundName]) {
                    this.playBuffer(this.buffers[soundName]);
                    return;
                }
                switch (soundName) {
                    case 'shoot': this.synthShoot(); break;
                    case 'impact': this.synthImpact(); break;
                    case 'footstep': this.synthFootstep(); break;
                    case 'reload': this.synthReload(); break;
                    case 'playerHit': this.synthPlayerHit(); break;
                    case 'itemPickup': this.synthItemPickup(); break;
                    case 'uiSelect': this.synthUiSelect(); break;
                    case 'quickReloadSuccess': this.synthQuickReloadSuccess(); break;
                    case 'quickReloadFail': this.synthQuickReloadFail(); break;
                }
            }
            playBuffer(buffer) {
                if (!this.context) return;
                try {
                    const source = this.context.createBufferSource();
                    source.buffer = buffer;
                    const gainNode = this.context.createGain();
                    gainNode.gain.value = SOUND_SETTINGS.masterVolume;
                    source.connect(gainNode);
                    gainNode.connect(this.context.destination);
                    source.start(0);
                } catch (e) {
                    console.error("Error playing buffer:", e);
                }
            }
            synthQuickReloadSuccess() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const vol = SOUND_SETTINGS.masterVolume;
                const osc1 = this.context.createOscillator();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(1000, t);
                osc1.frequency.exponentialRampToValueAtTime(1500, t + 0.05);
                osc1.frequency.exponentialRampToValueAtTime(800, t + 0.1);
                const gain1 = this.context.createGain();
                gain1.gain.setValueAtTime(vol * 0.4, t);
                gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc1.connect(gain1);
                gain1.connect(this.context.destination);
                osc1.start(t);
                osc1.stop(t + 0.15);
                const osc2 = this.context.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(200, t + 0.02);
                osc2.frequency.exponentialRampToValueAtTime(100, t + 0.1);
                const gain2 = this.context.createGain();
                gain2.gain.setValueAtTime(vol * 0.3, t + 0.02);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc2.connect(gain2);
                gain2.connect(this.context.destination);
                osc2.start(t + 0.02);
                osc2.stop(t + 0.15);
            }
            synthQuickReloadFail() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const vol = SOUND_SETTINGS.masterVolume;
                const osc1 = this.context.createOscillator();
                const osc2 = this.context.createOscillator();
                const gain = this.context.createGain();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(250, t);
                osc1.frequency.exponentialRampToValueAtTime(150, t + 0.2);
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(240, t);
                osc2.frequency.exponentialRampToValueAtTime(140, t + 0.2);
                gain.gain.setValueAtTime(vol * 0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.context.destination);
                osc1.start(t);
                osc2.start(t);
                osc1.stop(t + 0.2);
                osc2.stop(t + 0.2);
            }
            synthUiSelect() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
                gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.connect(gain);
                gain.connect(this.context.destination);
                osc.start(t);
                osc.stop(t + 0.1);
            }
            synthItemPickup() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.2);
                gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.6, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                osc.connect(gain);
                gain.connect(this.context.destination);
                osc.start(t);
                osc.stop(t + 0.3);
            }
            synthShoot() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const vol = SOUND_SETTINGS.masterVolume;
                const osc = this.context.createOscillator();
                const oscGain = this.context.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
                oscGain.gain.setValueAtTime(vol * 0.7, t);
                oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc.connect(oscGain);
                oscGain.connect(this.context.destination);
                osc.start(t);
                osc.stop(t + 0.2);
                const bufferSize = this.context.sampleRate * 0.2;
                const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1);
                }
                const noise = this.context.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = this.context.createGain();
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(3000, t);
                filter.frequency.exponentialRampToValueAtTime(200, t + 0.15);
                noiseGain.gain.setValueAtTime(vol * 0.8, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(this.context.destination);
                noise.start(t);
            }
            synthImpact() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const bufferSize = this.context.sampleRate * 0.1;
                const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.context.createBufferSource();
                noise.buffer = buffer;
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(300, t);
                filter.frequency.linearRampToValueAtTime(50, t + 0.1);
                const gain = this.context.createGain();
                gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.7, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.context.destination);
                noise.start(t);
            }
            synthPlayerHit() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const osc = this.context.createOscillator();
                const oscGain = this.context.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, t);
                osc.frequency.linearRampToValueAtTime(50, t + 0.15);
                oscGain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.8, t);
                oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 600;
                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.context.destination);
                osc.start(t);
                osc.stop(t + 0.2);
                const bufferSize = this.context.sampleRate * 0.1;
                const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = this.context.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = this.context.createGain();
                noiseGain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.5, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                noise.connect(noiseGain);
                noiseGain.connect(this.context.destination);
                noise.start(t);
            }
            synthFootstep() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const randomDetune = Math.random() * 100 - 50;
                const bufferSize = this.context.sampleRate * 0.1;
                const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1);
                }
                const noise = this.context.createBufferSource();
                noise.buffer = buffer;
                noise.detune.value = randomDetune;
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(150, t);
                filter.frequency.linearRampToValueAtTime(50, t + 0.1);
                const gain = this.context.createGain();
                gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.5, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.context.destination);
                noise.start(t);
            }
            synthReload() {
                if (!this.context) return;
                const t = this.context.currentTime;
                const vol = SOUND_SETTINGS.masterVolume;
                const magSlideDuration = 0.15;
                const magSlideBuffer = this.context.createBuffer(1, this.context.sampleRate * magSlideDuration, this.context.sampleRate);
                const magSlideData = magSlideBuffer.getChannelData(0);
                for (let i = 0; i < magSlideBuffer.length; i++) magSlideData[i] = Math.random() * 2 - 1;
                const magSlideSrc = this.context.createBufferSource();
                magSlideSrc.buffer = magSlideBuffer;
                const magSlideFilter = this.context.createBiquadFilter();
                magSlideFilter.type = 'bandpass';
                magSlideFilter.frequency.setValueAtTime(400, t);
                magSlideFilter.frequency.linearRampToValueAtTime(800, t + magSlideDuration);
                const magSlideGain = this.context.createGain();
                magSlideGain.gain.setValueAtTime(0, t);
                magSlideGain.gain.linearRampToValueAtTime(vol * 0.6, t + 0.05);
                magSlideGain.gain.linearRampToValueAtTime(0, t + magSlideDuration);
                magSlideSrc.connect(magSlideFilter);
                magSlideFilter.connect(magSlideGain);
                magSlideGain.connect(this.context.destination);
                magSlideSrc.start(t);
                const magLockTime = t + 0.12;
                const magThud = this.context.createOscillator();
                magThud.frequency.setValueAtTime(150, magLockTime);
                magThud.frequency.exponentialRampToValueAtTime(60, magLockTime + 0.1);
                const magThudGain = this.context.createGain();
                magThudGain.gain.setValueAtTime(vol * 0.8, magLockTime);
                magThudGain.gain.exponentialRampToValueAtTime(0.01, magLockTime + 0.1);
                magThud.connect(magThudGain);
                magThudGain.connect(this.context.destination);
                magThud.start(magLockTime);
                magThud.stop(magLockTime + 0.1);
                const magClick = this.context.createOscillator();
                magClick.type = 'square';
                magClick.frequency.setValueAtTime(1200, magLockTime);
                const magClickGain = this.context.createGain();
                magClickGain.gain.setValueAtTime(vol * 0.3, magLockTime);
                magClickGain.gain.exponentialRampToValueAtTime(0.01, magLockTime + 0.05);
                magClick.connect(magClickGain);
                magClickGain.connect(this.context.destination);
                magClick.start(magLockTime);
                magClick.stop(magLockTime + 0.05);
                const slidePullTime = t + 0.40;
                const slideDuration = 0.2;
                const slideBuffer = this.context.createBuffer(1, this.context.sampleRate * slideDuration, this.context.sampleRate);
                const slideData = slideBuffer.getChannelData(0);
                for (let i = 0; i < slideBuffer.length; i++) slideData[i] = Math.random() * 2 - 1;
                const slideSrc = this.context.createBufferSource();
                slideSrc.buffer = slideBuffer;
                const slideFilter = this.context.createBiquadFilter();
                slideFilter.type = 'bandpass';
                slideFilter.frequency.setValueAtTime(2000, slidePullTime);
                slideFilter.Q.value = 1.5;
                const slideGain = this.context.createGain();
                slideGain.gain.setValueAtTime(0, slidePullTime);
                slideGain.gain.linearRampToValueAtTime(vol * 0.7, slidePullTime + 0.05);
                slideGain.gain.linearRampToValueAtTime(0, slidePullTime + slideDuration);
                slideSrc.connect(slideFilter);
                slideFilter.connect(slideGain);
                slideGain.connect(this.context.destination);
                slideSrc.start(slidePullTime);
                const slideRelTime = slidePullTime + 0.15;
                const impactBuffer = this.context.createBuffer(1, this.context.sampleRate * 0.05, this.context.sampleRate);
                const impactData = impactBuffer.getChannelData(0);
                for (let i = 0; i < impactData.length; i++) impactData[i] = Math.random() * 2 - 1;
                const impactSrc = this.context.createBufferSource();
                impactSrc.buffer = impactBuffer;
                const impactGain = this.context.createGain();
                impactGain.gain.setValueAtTime(vol * 1.0, slideRelTime);
                impactGain.gain.exponentialRampToValueAtTime(0.01, slideRelTime + 0.05);
                impactSrc.connect(impactGain);
                impactGain.connect(this.context.destination);
                impactSrc.start(slideRelTime);
                const clank = this.context.createOscillator();
                clank.type = 'triangle';
                clank.frequency.setValueAtTime(2500, slideRelTime);
                clank.frequency.exponentialRampToValueAtTime(800, slideRelTime + 0.1);
                const clankGain = this.context.createGain();
                clankGain.gain.setValueAtTime(vol * 0.5, slideRelTime);
                clankGain.gain.exponentialRampToValueAtTime(0.01, slideRelTime + 0.15);
                clank.connect(clankGain);
                clankGain.connect(this.context.destination);
                clank.start(slideRelTime);
                clank.stop(slideRelTime + 0.15);
            }
        }
        exports.soundService = new SoundService();
        return exports;
    }({}));

    // --- Start of file: App.tsx ---
    modules['App.tsx'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const React = window.React;
        const GameCanvas = require('components/GameCanvas.tsx').default;
        const { GameStatus, WeaponPart } = require('types.ts');
        const { PLAYER_STATS, PLAYER_HUD_SETTINGS, GAME_OVER_UI_SETTINGS } = require('config/playerConfig.ts');
        const { WEAPONS } = require('config/weaponConfig.ts');
        const { PistolIcon, MP5Icon, RifleIcon, ShotgunIcon, TacticalLoader, WeaponLoader } = require('components/GameIcons.tsx');
        const { soundService } = require('services/SoundService.ts');
        const { GAME_TEXT } = require('config/textConfig.ts');
        const { UPGRADE_CONFIG } = require('config/upgradeConfig.ts');
        const ASSETS = {
            CHAR_DEFAULT: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny.png",
            CHAR_MP5: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_mp5.png",
            CHAR_RIFLE: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_rifle.png",
            CHAR_SHOTGUN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_bunny_shotgun.png",
            WEAPON_M1911: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png",
            WEAPON_MP5: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png",
            WEAPON_RIFLE: "https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png",
            WEAPON_SHOTGUN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png",
            LOADING_SCREEN: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_loding01.png",
            CHAR_SAD: "https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_sad.png"
        };
        const getRandomText = (array) => {
            if (!array || array.length === 0) {
                return "";
            }
            return array[Math.floor(Math.random() * array.length)];
        };
        const App = () => {
            const [isLoadingAssets, setIsLoadingAssets] = React.useState(true);
            const [waitingForInput, setWaitingForInput] = React.useState(true);
            const [loadingProgress, setLoadingProgress] = React.useState(0);
            const [gameStatus, setGameStatus] = React.useState(GameStatus.MENU);
            const [selectedWeaponKey, setSelectedWeaponKey] = React.useState('Pistol');
            const [upgradeLevels, setUpgradeLevels] = React.useState({
                [WeaponPart.SCOPE]: 0,
                [WeaponPart.BARREL]: 0,
                [WeaponPart.MAG]: 0,
                [WeaponPart.MUZZLE]: 0,
                [WeaponPart.AMMO]: 0,
                [WeaponPart.SPRING]: 0,
                [WeaponPart.GRIP]: 0,
                [WeaponPart.STOCK]: 0,
            });
            const [stats, setStats] = React.useState({
                health: PLAYER_STATS.maxHealth,
                ammo: WEAPONS[selectedWeaponKey].maxAmmo,
                maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo,
                score: 0,
                wave: 1,
                xp: 0,
                maxXp: 100,
                level: 1
            });
            const [missionText, setMissionText] = React.useState("Initializing secure link...");
            const [gameOverText, setGameOverText] = React.useState("");
            const [finalReport, setFinalReport] = React.useState(null);
            const [charLoaded, setCharLoaded] = React.useState(false);
            const [weaponLoaded, setWeaponLoaded] = React.useState(false);
            const [charMp5Loaded, setCharMp5Loaded] = React.useState(false);
            const [weaponMp5Loaded, setWeaponMp5Loaded] = React.useState(false);
            const [charRifleLoaded, setCharRifleLoaded] = React.useState(false);
            const [weaponRifleLoaded, setWeaponRifleLoaded] = React.useState(false);
            const [charShotgunLoaded, setCharShotgunLoaded] = React.useState(false);
            const [weaponShotgunLoaded, setWeaponShotgunLoaded] = React.useState(false);
            const [upgradeWeaponLoaded, setUpgradeWeaponLoaded] = React.useState(false);
            const [loadedUpgradeIcons, setLoadedUpgradeIcons] = React.useState({});
            const [hoveredPart, setHoveredPart] = React.useState(null);
            const [isUpgradeDevMode, setIsUpgradeDevMode] = React.useState(false);
            const [devUpgradePositions, setDevUpgradePositions] = React.useState(WEAPONS[selectedWeaponKey].upgradePositions);
            const [devCharPosition, setDevCharPosition] = React.useState(WEAPONS[selectedWeaponKey].characterPosition);
            const [devInputValues, setDevInputValues] = React.useState({});
            const [isHudDevMode, setIsHudDevMode] = React.useState(false);
            const [hudDevSettings, setHudDevSettings] = React.useState({
                right: parseFloat(PLAYER_HUD_SETTINGS.right),
                bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
                width: parseFloat(PLAYER_HUD_SETTINGS.width),
            });
            const [isGameOverDevMode, setIsGameOverDevMode] = React.useState(false);
            const [gameOverDevSettings, setGameOverDevSettings] = React.useState({
                width: parseFloat(GAME_OVER_UI_SETTINGS.imageWidth),
                left: parseFloat(GAME_OVER_UI_SETTINGS.imageLeft),
                bottom: parseFloat(GAME_OVER_UI_SETTINGS.imageBottom),
            });
            const uiCanvasRef = React.useRef(null);
            const casingsRef = React.useRef([]);
            const requestRef = React.useRef(0);
            const prevTimeRef = React.useRef(0);
            const BulletUI = ({ isLoaded }) => {
                return (React.createElement("div", { className: `relative w-2.5 h-6 rounded-sm transition-colors duration-200 ${isLoaded ? 'bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'bg-gray-800'}` },
                    React.createElement("div", { className: "absolute inset-0 rounded-sm border-t border-l border-white/30" }),
                    React.createElement("div", { className: "absolute inset-0 rounded-sm border-b border-r border-black/40" })));
            };
            const WEAPON_ASSETS = {
                Pistol: {
                    char: ASSETS.CHAR_DEFAULT,
                    weapon: ASSETS.WEAPON_M1911,
                    Icon: PistolIcon,
                    upgradeImage: ASSETS.WEAPON_M1911,
                    charLoaded: charLoaded,
                    setCharLoaded: setCharLoaded,
                    weaponLoaded: weaponLoaded,
                    setWeaponLoaded: setWeaponLoaded,
                },
                MP5: {
                    char: ASSETS.CHAR_MP5,
                    weapon: ASSETS.WEAPON_MP5,
                    Icon: MP5Icon,
                    upgradeImage: ASSETS.WEAPON_MP5,
                    charLoaded: charMp5Loaded,
                    setCharLoaded: setCharMp5Loaded,
                    weaponLoaded: weaponMp5Loaded,
                    setWeaponLoaded: setWeaponMp5Loaded,
                },
                Rifle: {
                    char: ASSETS.CHAR_RIFLE,
                    weapon: ASSETS.WEAPON_RIFLE,
                    Icon: RifleIcon,
                    upgradeImage: ASSETS.WEAPON_RIFLE,
                    charLoaded: charRifleLoaded,
                    setCharLoaded: setCharRifleLoaded,
                    weaponLoaded: weaponRifleLoaded,
                    setWeaponLoaded: setWeaponRifleLoaded,
                },
                Shotgun: {
                    char: ASSETS.CHAR_SHOTGUN,
                    weapon: ASSETS.WEAPON_SHOTGUN,
                    Icon: ShotgunIcon,
                    upgradeImage: ASSETS.WEAPON_SHOTGUN,
                    charLoaded: charShotgunLoaded,
                    setCharLoaded: setCharShotgunLoaded,
                    weaponLoaded: weaponShotgunLoaded,
                    setWeaponLoaded: setWeaponShotgunLoaded,
                }
            };
            React.useEffect(() => {
                const preloadAssets = async () => {
                    const baseAssetUrls = Object.values(ASSETS);
                    const upgradeIconUrls = Object.values(UPGRADE_CONFIG).map(part => part.ICON);
                    const imageUrls = [...new Set([...baseAssetUrls, ...upgradeIconUrls])];
                    const totalAssets = imageUrls.length + Object.keys(soundService.SOUND_ASSETS_CONFIG).length;
                    let loadedCount = 0;
                    const imagePromises = imageUrls.map(url => {
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.src = url;
                            img.onload = () => {
                                loadedCount++;
                                setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
                                resolve();
                            };
                            img.onerror = () => {
                                console.warn(`Failed to preload image: ${url}`);
                                loadedCount++;
                                setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
                                resolve();
                            };
                        });
                    });
                    await Promise.all(imagePromises);
                    try {
                        await soundService.init();
                        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length;
                        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
                    } catch (error) {
                        console.error("사운드 서비스 초기화 실패:", error);
                        loadedCount += Object.keys(soundService.SOUND_ASSETS_CONFIG).length;
                        setLoadingProgress(Math.round((loadedCount / totalAssets) * 100));
                    }
                    setIsLoadingAssets(false);
                };
                preloadAssets();
            }, []);
            React.useEffect(() => {
                if (gameStatus === GameStatus.MENU) {
                    setMissionText(getRandomText(GAME_TEXT.MISSION_BRIEFINGS));
                    setUpgradeLevels({
                        [WeaponPart.SCOPE]: 0,
                        [WeaponPart.BARREL]: 0,
                        [WeaponPart.MAG]: 0,
                        [WeaponPart.MUZZLE]: 0,
                        [WeaponPart.AMMO]: 0,
                        [WeaponPart.SPRING]: 0,
                        [WeaponPart.GRIP]: 0,
                        [WeaponPart.STOCK]: 0,
                    });
                }
            }, [gameStatus]);
            React.useEffect(() => {
                if (gameStatus === GameStatus.LEVEL_UP) {
                    setHoveredPart(null);
                    const weaponConfig = WEAPONS[selectedWeaponKey];
                    const initialPositions = weaponConfig.upgradePositions;
                    const initialCharPos = weaponConfig.characterPosition;
                    setDevUpgradePositions(initialPositions);
                    setDevCharPosition(initialCharPos);
                    const initialInputs = {};
                    for (const partKey in initialPositions) {
                        const part = partKey;
                        initialInputs[part] = {
                            ux: String(initialPositions[part].x),
                            uy: String(initialPositions[part].y),
                            ax: String(initialPositions[part].anchor.x),
                            ay: String(initialPositions[part].anchor.y),
                        };
                    }
                    initialInputs.character = {
                        x: String(initialCharPos.x),
                        y: String(initialCharPos.y),
                    };
                    setDevInputValues(initialInputs);
                }
            }, [gameStatus, selectedWeaponKey]);
            React.useEffect(() => {
                if (gameStatus === GameStatus.MENU) {
                    const weapon = WEAPONS[selectedWeaponKey];
                    setStats(prev => ({ ...prev, ammo: weapon.maxAmmo, maxAmmo: weapon.maxAmmo }));
                }
            }, [selectedWeaponKey, gameStatus]);
            React.useEffect(() => {
                if (gameStatus !== GameStatus.LEVEL_UP) {
                    setIsUpgradeDevMode(false);
                    return;
                }
                const handleKeyDown = (e) => {
                    if (e.code === 'Backquote') {
                        e.preventDefault();
                        setIsUpgradeDevMode(prev => !prev);
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [gameStatus]);
            React.useEffect(() => {
                if (gameStatus !== GameStatus.PLAYING) {
                    setIsHudDevMode(false);
                    return;
                }
                const handleKeyDown = (e) => {
                    if (e.code === 'Backquote') {
                        e.preventDefault();
                        setIsHudDevMode(prev => !prev);
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [gameStatus]);
            React.useEffect(() => {
                if (gameStatus !== GameStatus.GAME_OVER) {
                    setIsGameOverDevMode(false);
                    return;
                }
                const handleKeyDown = (e) => {
                    if (e.code === 'Backquote') {
                        e.preventDefault();
                        setIsGameOverDevMode(prev => !prev);
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => {
                    window.removeEventListener('keydown', handleKeyDown);
                };
            }, [gameStatus]);
            const handleInitClick = () => {
                if (!isLoadingAssets) {
                    setWaitingForInput(false);
                }
            };
            const handleStartGame = () => {
                setGameStatus(GameStatus.PLAYING);
            };
            const handleGameOver = (finalScore, kills, wave) => {
                setGameStatus(GameStatus.GAME_OVER);
                setFinalReport({ score: finalScore, kills, wave });
                const messagePool = finalScore >= 500 ? GAME_TEXT.HIGH_SCORE_REPORTS : GAME_TEXT.LOW_SCORE_REPORTS;
                const flavorText = getRandomText(messagePool);
                const report = `${flavorText} (최종 점수: ${finalScore}, 처치: ${kills})`;
                setGameOverText(report);
            };
            const handleUpdateStats = (newStats) => {
                setStats(newStats);
            };
            const handleShoot = React.useCallback((firedAmmoIndex) => {
                if (firedAmmoIndex < 1)
                    return;
                const config = WEAPONS[selectedWeaponKey].uiCasingPhysics;
                let rect = null;
                const el = document.getElementById(`bullet-${firedAmmoIndex}`);
                if (el) {
                    rect = el.getBoundingClientRect();
                }
                else {
                    const container = document.getElementById('ammo-container');
                    if (container) {
                        const containerRect = container.getBoundingClientRect();
                        const bulletWidth = 10;
                        const bulletHeight = 24;
                        const gap = 4;
                        const bottomRowMarginLeft = 10;
                        const isTopRow = firedAmmoIndex % 2 !== 0;
                        const colIndex = Math.floor((firedAmmoIndex - 1) / 2);
                        const offsetX = colIndex * (bulletWidth + gap) + (isTopRow ? 0 : bottomRowMarginLeft);
                        const offsetY = isTopRow ? 0 : (bulletHeight + gap);
                        rect = {
                            left: containerRect.left + offsetX,
                            top: containerRect.top + offsetY,
                            width: bulletWidth,
                            height: bulletHeight
                        };
                    }
                }
                if (rect) {
                    casingsRef.current.push({
                        id: Math.random().toString(),
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        vx: config.velocity.x + (Math.random() - 0.5) * config.velocityVariance.x,
                        vy: config.velocity.y + (Math.random() - 0.5) * config.velocityVariance.y,
                        rotation: 0,
                        vRotation: (Math.random() - 0.5) * config.rotationSpeed,
                        life: config.life,
                        maxLife: config.life,
                        color: '#fbbf24'
                    });
                }
            }, [selectedWeaponKey]);
            const handleUpgrade = (part) => {
                setUpgradeLevels(prev => ({
                    ...prev,
                    [part]: prev[part] + 1
                }));
                setGameStatus(GameStatus.PLAYING);
            };
            const handleSelectWeapon = (key) => {
                if (selectedWeaponKey === key)
                    return;
                setSelectedWeaponKey(key);
                soundService.play('uiSelect');
            };
            const handleUpgradeDevInputChange = (key, axis, value) => {
                if (!/^-?\d*$/.test(value))
                    return;
                setDevInputValues(prev => ({
                    ...prev,
                    [key]: { ...prev[key], [axis]: value }
                }));
                const parsedValue = parseInt(value, 10);
                const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
                if (key === 'character') {
                    setDevCharPosition(prev => ({ ...prev, [axis]: finalValue }));
                }
                else {
                    setDevUpgradePositions(prev => {
                        const newPos = { ...prev };
                        const partKey = key;
                        if (!newPos[partKey])
                            return prev;
                        if (axis === 'ux')
                            newPos[partKey].x = finalValue;
                        else if (axis === 'uy')
                            newPos[partKey].y = finalValue;
                        else if (axis === 'ax')
                            newPos[partKey].anchor.x = finalValue;
                        else if (axis === 'ay')
                            newPos[partKey].anchor.y = finalValue;
                        return newPos;
                    });
                }
            };
            const handleCopyUpgradeCoords = () => {
                const weaponKey = selectedWeaponKey.toUpperCase();
                let output = `// Paste this into weaponDb.ts\n\n`;
                output += `// Character Position for ${weaponKey}\n`;
                output += `const ${weaponKey}_CHAR_POS = { x: ${devCharPosition.x}, y: ${devCharPosition.y} };\n\n`;
                output += `// Part Positions for ${weaponKey}\n`;
                output += `const ${weaponKey}_UPGRADE_POS = {\n`;
                const sortedParts = Object.keys(devUpgradePositions).sort();
                for (const part of sortedParts) {
                    if (!devUpgradePositions[part])
                        continue;
                    const pos = devUpgradePositions[part];
                    const xStr = String(pos.x).padStart(5, ' ');
                    const yStr = String(pos.y).padStart(4, ' ');
                    const anchorX = pos.anchor ? String(pos.anchor.x).padStart(4, ' ') : '   0';
                    const anchorY = pos.anchor ? String(pos.anchor.y).padStart(3, ' ') : '  0';
                    output += `  [WeaponPart.${part}]: { x: ${xStr}, y: ${yStr}, anchor: { x: ${anchorX}, y: ${anchorY} } },\n`;
                }
                output += `};\n\n`;
                output += `// Then, update the WEAPON_DATABASE object:\n`;
                output += `'${selectedWeaponKey}': {\n`;
                output += `  // ... other properties\n`;
                output += `  ui: {\n`;
                output += `    characterPosition: ${weaponKey}_CHAR_POS,\n`;
                output += `    upgradePositions: ${weaponKey}_UPGRADE_POS\n`;
                output += `  }\n`;
                output += `}`;
                navigator.clipboard.writeText(output).then(() => {
                    alert('Coordinates copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy coordinates: ', err);
                });
            };
            const handleHudDevInputChange = (key, value) => {
                const parsedValue = parseFloat(value);
                if (!isNaN(parsedValue)) {
                    setHudDevSettings(prev => ({
                        ...prev,
                        [key]: parsedValue,
                    }));
                }
            };
            const handleCopyHudConfig = () => {
                const output = `// Paste this into config/playerConfig.ts

export const PLAYER_HUD_SETTINGS = {
  right: '${hudDevSettings.right}rem',
  bottom: '${hudDevSettings.bottom}rem',
  width: '${hudDevSettings.width}rem',
};
`;
                navigator.clipboard.writeText(output).then(() => {
                    alert('HUD Config copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy HUD config: ', err);
                });
            };
            const handleGameOverDevInputChange = (key, value) => {
                const parsedValue = parseFloat(value);
                if (!isNaN(parsedValue)) {
                    setGameOverDevSettings(prev => ({
                        ...prev,
                        [key]: parsedValue,
                    }));
                }
            };
            const handleCopyGameOverConfig = () => {
                const output = `// Paste this into config/playerConfig.ts

export const GAME_OVER_UI_SETTINGS = {
  imageWidth: '${gameOverDevSettings.width}rem',
  imageLeft: '${gameOverDevSettings.left}rem',
  imageBottom: '${gameOverDevSettings.bottom}rem',
};
`;
                navigator.clipboard.writeText(output).then(() => {
                    alert('Game Over UI Config copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy Game Over UI config: ', err);
                });
            };
            React.useEffect(() => {
                const animate = (time) => {
                    if (prevTimeRef.current === 0)
                        prevTimeRef.current = time;
                    const deltaTime = (time - prevTimeRef.current) / 1000;
                    prevTimeRef.current = time;
                    const canvas = uiCanvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            const config = WEAPONS[selectedWeaponKey].uiCasingPhysics;
                            casingsRef.current.forEach(c => {
                                c.vy += config.gravity * deltaTime;
                                c.x += c.vx * deltaTime;
                                c.y += c.vy * deltaTime;
                                c.rotation += c.vRotation * deltaTime;
                                c.life -= deltaTime;
                                if (c.y > canvas.height + 50)
                                    c.life = 0;
                                ctx.save();
                                ctx.translate(c.x + c.width / 2, c.y + c.height / 2);
                                ctx.rotate(c.rotation);
                                ctx.fillStyle = c.color;
                                ctx.globalAlpha = Math.max(0, c.life / 0.5);
                                ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
                                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                                ctx.lineWidth = 1;
                                ctx.strokeRect(-c.width / 2, -c.height / 2, c.width, c.height);
                                ctx.restore();
                            });
                            casingsRef.current = casingsRef.current.filter(c => c.life > 0);
                        }
                    }
                    requestRef.current = requestAnimationFrame(animate);
                };
                requestRef.current = requestAnimationFrame(animate);
                const handleResize = () => {
                    if (uiCanvasRef.current) {
                        uiCanvasRef.current.width = window.innerWidth;
                        uiCanvasRef.current.height = window.innerHeight;
                    }
                };
                window.addEventListener('resize', handleResize);
                handleResize();
                return () => {
                    if (requestRef.current)
                        cancelAnimationFrame(requestRef.current);
                    window.removeEventListener('resize', handleResize);
                };
            }, [selectedWeaponKey, waitingForInput]);
            const StatBar = ({ label, value, max, color = "bg-green-500", invert = false }) => {
                let percent = (value / max) * 100;
                if (invert)
                    percent = 100 - percent;
                percent = Math.max(5, Math.min(100, percent));
                return (React.createElement("div", { className: "flex items-center gap-2 w-full" },
                    React.createElement("span", { className: "w-8 text-gray-400 uppercase text-xs" }, label),
                    React.createElement("div", { className: "flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden" },
                        React.createElement("div", { className: `h-full rounded-full ${color}`, style: { width: `${percent}%` } }))));
            };
            const renderLoadingScreen = () => (React.createElement("div", { onClick: handleInitClick, className: `relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden text-white select-none ${!isLoadingAssets ? 'cursor-pointer' : ''}` },
                React.createElement("div", { className: "absolute inset-0 z-0" },
                    React.createElement("img", { src: ASSETS.LOADING_SCREEN, className: "w-full h-full object-cover opacity-80 filter contrast-110", alt: "Loading Background" }),
                    React.createElement("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" })),
                React.createElement("div", { className: "z-10 w-full max-w-4xl px-8 flex flex-col h-full justify-end pb-20" },
                    React.createElement("div", { className: "mb-auto mt-20" },
                        React.createElement("h1", { className: "text-5xl md:text-7xl font-title text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-800 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" }, GAME_TEXT.TITLES.MAIN),
                        React.createElement("h2", { className: "text-xl md:text-2xl text-green-700 font-bold tracking-[0.5em] mt-2 ml-1" }, GAME_TEXT.TITLES.SUBTITLE)),
                    React.createElement("div", { className: "border-l-4 border-green-600 pl-6 mb-8 bg-black/30 backdrop-blur-sm p-4 rounded-r font-body" },
                        React.createElement("p", { className: "text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed" },
                            React.createElement("span", { className: "text-green-500 font-bold mr-2 text-lg" }, GAME_TEXT.LOADING.SYSTEM_ALERT),
                            React.createElement("br", null),
                            GAME_TEXT.LOADING.LORE)),
                    !isLoadingAssets && (React.createElement("div", { className: "w-full text-center animate-pulse mb-8" },
                        React.createElement("span", { className: "text-green-500 font-black text-2xl tracking-[0.2em] bg-black/50 px-4 py-2 border border-green-500/50 rounded shadow-[0_0_20px_rgba(34,197,94,0.4)]" }, GAME_TEXT.LOADING.SYSTEM_READY))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex justify-between items-end text-green-500 text-xs font-bold tracking-widest uppercase" },
                            React.createElement("span", null, isLoadingAssets ? GAME_TEXT.LOADING.INIT_SYSTEM : GAME_TEXT.LOADING.ALL_GREEN),
                            React.createElement("span", null,
                                Math.min(100, Math.round(loadingProgress)),
                                "%")),
                        React.createElement("div", { className: "w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800" },
                            React.createElement("div", { className: "h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.8)]", style: { width: `${Math.max(5, loadingProgress)}%` } })),
                        React.createElement("div", { className: "flex justify-between text-[10px] text-gray-600 mt-1" },
                            React.createElement("span", null, GAME_TEXT.LOADING.ASSET_LOADER),
                            React.createElement("span", null, isLoadingAssets ? GAME_TEXT.LOADING.ESTABLISHING : GAME_TEXT.LOADING.CONNECTED))))));
            };
            if (waitingForInput) {
                return renderLoadingScreen();
            }
            const currentWeaponAsset = WEAPON_ASSETS[selectedWeaponKey];
            const currentUpgradePositions = isUpgradeDevMode ? devUpgradePositions : WEAPONS[selectedWeaponKey].upgradePositions;
            const upgradeCharPos = isUpgradeDevMode ? devCharPosition : WEAPONS[selectedWeaponKey].characterPosition;
            const currentHudSettings = isHudDevMode ? hudDevSettings : {
                right: parseFloat(PLAYER_HUD_SETTINGS.right),
                bottom: parseFloat(PLAYER_HUD_SETTINGS.bottom),
                width: parseFloat(PLAYER_HUD_SETTINGS.width),
            };
            const hudStyle = {
                right: `${currentHudSettings.right}rem`,
                bottom: `${currentHudSettings.bottom}rem`,
                width: `${currentHudSettings.width}rem`,
            };
            const currentGameOverUiSettings = isGameOverDevMode ? gameOverDevSettings : {
                width: parseFloat(GAME_OVER_UI_SETTINGS.imageWidth),
                left: parseFloat(GAME_OVER_UI_SETTINGS.imageLeft),
                bottom: parseFloat(GAME_OVER_UI_SETTINGS.imageBottom),
            };
            const gameOverImageStyle = {
                width: `${currentGameOverUiSettings.width}rem`,
                left: `${currentGameOverUiSettings.left}rem`,
                bottom: `${currentGameOverUiSettings.bottom}rem`,
            };
            const upgradeImageScale = WEAPONS[selectedWeaponKey].upgradeImageScale || 1.0;
            let weaponTiltStyle = { transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(0deg) rotateY(0deg)`, transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };
            if (hoveredPart) {
                const pos = currentUpgradePositions[hoveredPart];
                if (pos) {
                    const maxTilt = 25;
                    const rotX = (pos.y / 250) * maxTilt;
                    const rotY = -(pos.x / 450) * maxTilt;
                    weaponTiltStyle = {
                        ...weaponTiltStyle,
                        transform: `translate(-50%, -50%) scale(${upgradeImageScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
                    };
                }
            }
            const totalBullets = stats.maxAmmo;
            const currentAmmo = stats.ammo;
            const bulletsInFirstRow = Math.ceil(totalBullets / 2);
            const bulletsInSecondRow = Math.floor(totalBullets / 2);
            const bulletsLeftInTopRow = Math.ceil(currentAmmo / 2);
            const bulletsLeftInBottomRow = Math.floor(currentAmmo / 2);
            const hudIconScale = WEAPONS[selectedWeaponKey].hudIconScale || 1;
            return (React.createElement("div", { className: "relative w-full h-screen bg-black overflow-hidden select-none text-white" },
                React.createElement(GameCanvas, { gameStatus: gameStatus, selectedWeaponId: selectedWeaponKey, upgradeLevels: upgradeLevels, setGameStatus: setGameStatus, onUpdateStats: handleUpdateStats, onGameOver: handleGameOver, onShoot: handleShoot, isPaused: isHudDevMode || gameStatus === GameStatus.LEVEL_UP || gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.MENU }),
                React.createElement("canvas", { ref: uiCanvasRef, className: "absolute inset-0 pointer-events-none", style: { zIndex: 50 } }),
                isHudDevMode && (React.createElement("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto" },
                    React.createElement("p", { className: "font-bold text-sm uppercase" }, "HUD Dev Mode"),
                    React.createElement("div", { className: "flex gap-2 items-center" },
                        React.createElement("label", { className: "text-xs font-bold" }, "Right (rem):"),
                        React.createElement("input", { type: "number", step: "0.1", value: hudDevSettings.right, onChange: (e) => handleHudDevInputChange('right', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" }),
                        React.createElement("label", { className: "text-xs font-bold" }, "Bottom (rem):"),
                        React.createElement("input", { type: "number", step: "0.1", value: hudDevSettings.bottom, onChange: (e) => handleHudDevInputChange('bottom', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" }),
                        React.createElement("label", { className: "text-xs font-bold" }, "Width (rem):"),
                        React.createElement("input", { type: "number", step: "0.1", value: hudDevSettings.width, onChange: (e) => handleHudDevInputChange('width', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" })),
                    React.createElement("button", { onClick: handleCopyHudConfig, className: "bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700" }, "Copy Config"))),
                (gameStatus === GameStatus.PLAYING || gameStatus === GameStatus.LEVEL_UP) && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "absolute inset-0 pointer-events-none py-1 px-4 flex flex-col justify-between z-20" },
                        React.createElement("div", { className: "flex justify-between items-start pt-2" },
                            React.createElement("div", { className: "bg-black/70 backdrop-blur-md p-4 rounded-lg text-right ml-auto" },
                                React.createElement("p", { className: "text-sm text-gray-400" }, GAME_TEXT.HUD.SCORE_LABEL),
                                React.createElement("p", { className: "text-3xl font-bold text-yellow-400" }, stats.score.toLocaleString()),
                                React.createElement("p", { className: "text-sm text-yellow-600 mt-1" },
                                    GAME_TEXT.HUD.WAVE_LABEL,
                                    " ",
                                    stats.wave))),
                        React.createElement("div", { className: "flex justify-between items-end w-full" },
                            React.createElement("div", { className: "flex items-end" },
                                React.createElement("div", { className: "flex items-center gap-2 bg-black/70 backdrop-blur-md pb-2 px-4 pr-8 rounded-tr-3xl shadow-2xl min-w-[440px]" },
                                    React.createElement("div", { className: "flex flex-col items-center justify-center w-60 shrink-0" },
                                        React.createElement("div", { className: "w-full h-32 flex items-center justify-center" },
                                            React.createElement(currentWeaponAsset.Icon, { className: "w-full h-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.8)] filter brightness-110", style: { transform: `scale(${hudIconScale})` } }))),
                                    React.createElement("div", { className: "w-px h-20 bg-gray-600/50" }),
                                    React.createElement("div", { className: "flex flex-col gap-1 flex-1" },
                                        React.createElement("div", { className: "flex justify-between items-end border-b border-gray-600/50 pb-1" },
                                            React.createElement("div", { className: "flex flex-col mb-1" },
                                                React.createElement("span", { className: "text-2xl font-black text-white tracking-wider leading-none" }, WEAPONS[selectedWeaponKey].name),
                                                React.createElement("span", { className: "text-xs text-gray-400 uppercase leading-none mt-0.5" }, WEAPONS[selectedWeaponKey].type)),
                                            React.createElement("div", { className: "text-5xl font-bold text-yellow-400 leading-none pl-6 shadow-black drop-shadow-md flex items-baseline" },
                                                React.createElement("span", { className: "inline-block w-14 text-right" }, stats.ammo),
                                                React.createElement("span", { className: "text-xl text-gray-500 ml-1" },
                                                    "/",
                                                    stats.maxAmmo))),
                                        React.createElement("div", { className: "flex items-center gap-4" },
                                            React.createElement("div", { className: "flex items-baseline gap-1" },
                                                React.createElement("span", { className: "text-yellow-600 font-bold text-lg" },
                                                    GAME_TEXT.HUD.LEVEL,
                                                    "."),
                                                React.createElement("span", { className: "text-yellow-400 font-black text-4xl text-shadow-glow tracking-wider" }, stats.level.toString().padStart(2, '0'))),
                                            React.createElement("div", { className: "flex-1 relative" },
                                                React.createElement("div", { className: "w-full h-4 bg-gray-800/50 rounded-full overflow-hidden border-2 border-gray-900/80 relative shadow-inner" },
                                                    React.createElement("div", { className: "h-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all duration-300", style: { width: `${Math.min(100, (stats.xp / stats.maxXp) * 100)}%` } }),
                                                    React.createElement("div", { className: "absolute inset-0 flex items-center justify-center text-sm text-white font-bold drop-shadow-[0_1px_1px_black]" },
                                                        stats.xp,
                                                        " / ",
                                                        stats.maxXp)))),
                                        React.createElement("div", { id: "ammo-container", className: "flex flex-col gap-1 h-auto" },
                                            React.createElement("div", { className: "flex gap-1 h-6" }, Array.from({ length: bulletsInFirstRow }).map((_, i) => {
                                                const bulletId = (i * 2) + 1;
                                                return (React.createElement("div", { key: `top-${i}`, id: `bullet-${bulletId}` },
                                                    React.createElement(BulletUI, { isLoaded: i < bulletsLeftInTopRow })));
                                            })),
                                            bulletsInSecondRow > 0 && (React.createElement("div", { className: "flex gap-1 h-6 ml-2.5" }, Array.from({ length: bulletsInSecondRow }).map((_, i) => {
                                                const bulletId = (i * 2) + 2;
                                                return (React.createElement("div", { key: `bottom-${i}`, id: `bullet-${bulletId}` },
                                                    React.createElement(BulletUI, { isLoaded: i < bulletsLeftInBottomRow })));
                                            })))))),
                            React.createElement("div", { className: "text-gray-500 text-xs text-right pb-4 pr-4 opacity-50 hidden md:block" },
                                React.createElement("div", null, GAME_TEXT.HUD.CONTROLS.MOVE),
                                React.createElement("div", null, GAME_TEXT.HUD.CONTROLS.FIRE),
                                React.createElement("div", null, GAME_TEXT.HUD.CONTROLS.RELOAD)))),
                    React.createElement("div", { style: hudStyle, className: "absolute flex flex-col gap-2 z-10 opacity-90 pointer-events-none pr-2" },
                        React.createElement("img", { src: currentWeaponAsset.char, alt: GAME_TEXT.MENU.CHAR_NAME, className: "w-full h-full object-contain object-bottom" }),
                        React.createElement("div", { className: "w-full h-4 bg-gray-900/80 border-2 border-gray-600/50 rounded-full p-0.5 relative flex justify-end" },
                            React.createElement("div", { className: `h-full transition-all duration-200 rounded-full ${stats.health > 30 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} , style: { width: `${Math.max(0, (stats.health / PLAYER_STATS.maxHealth) * 100)}%` } }),
                            React.createElement("div", { className: "absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" },
                                Math.round(stats.health),
                                " / ",
                                PLAYER_STATS.maxHealth))))),
                React.createElement("div", { className: `absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 overflow-hidden transition-opacity duration-300 ${gameStatus === GameStatus.LEVEL_UP ? 'opacity-100' : 'opacity-0 pointer-events-none'}` },
                    isUpgradeDevMode && (React.createElement("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4" },
                        React.createElement("p", { className: "font-bold text-sm uppercase" }, "Upgrade Dev Mode (` key)"),
                        React.createElement("div", { className: "flex gap-2 items-center" },
                            React.createElement("label", { className: "text-xs font-bold" }, "Char X%:"),
                            React.createElement("input", { type: "text", value: devInputValues.character?.x ?? '', onChange: (e) => handleUpgradeDevInputChange('character', 'x', e.target.value), className: "w-12 bg-black/20 text-black text-xs p-0.5 rounded text-center" }),
                            React.createElement("label", { className: "text-xs font-bold" }, "Char Y%:"),
                            React.createElement("input", { type: "text", value: devInputValues.character?.y ?? '', onChange: (e) => handleUpgradeDevInputChange('character', 'y', e.target.value), className: "w-12 bg-black/20 text-black text-xs p-0.5 rounded text-center" })),
                        React.createElement("button", { onClick: handleCopyUpgradeCoords, className: "bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700" }, "Copy Coordinates"))),
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "relative w-full max-w-screen-2xl min-h-[550px] bg-black/70 backdrop-blur-md rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col" },
                            React.createElement("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" }),
                            React.createElement("div", { className: "z-40 bg-gray-900 border-b-2 border-green-500/40 px-6 py-4 flex items-center justify-between shadow-lg shrink-0" },
                                React.createElement("div", { className: "flex items-center gap-6" },
                                    React.createElement("div", null,
                                        React.createElement("h2", { className: "text-4xl font-title text-green-400 tracking-widest uppercase text-shadow-glow" }, GAME_TEXT.UPGRADES.HEADER),
                                        React.createElement("div", { className: "text-xs text-green-600/80 font-body tracking-wider mt-1" }, GAME_TEXT.UPGRADES.SUBHEADER)),
                                    React.createElement("div", { className: "w-px h-12 bg-gray-600/50 self-center" }),
                                    React.createElement("div", null,
                                        React.createElement("h3", { className: "text-3xl text-gray-300 font-bold leading-none" }, WEAPONS[selectedWeaponKey].name),
                                        React.createElement("p", { className: "text-xl font-bold mt-1 text-yellow-400" },
                                            GAME_TEXT.HUD.LEVEL,
                                            " ",
                                            stats.level)))),
                            React.createElement("div", { className: "relative flex-1 w-full h-full" },
                                !upgradeWeaponLoaded && (React.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center" },
                                    React.createElement(WeaponLoader, { className: "w-full h-full" }))),
                                React.createElement("div", { className: "absolute top-1/2 left-1/2 w-0 h-0 z-20", style: { perspective: '1500px' } },
                                    React.createElement("svg", { className: "absolute top-0 left-0 overflow-visible z-30 pointer-events-none" }, Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                                        const pos = posUntyped;
                                        const buttonWidth = 192;
                                        const buttonHeight = 90;
                                        const halfW = buttonWidth / 2;
                                        const halfH = buttonHeight / 2;
                                        const dx = pos.anchor.x - pos.x;
                                        const dy = pos.anchor.y - pos.y;
                                        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01)
                                            return null;
                                        const t_x = Math.abs(dx) > 0.01 ? halfW / Math.abs(dx) : Infinity;
                                        const t_y = Math.abs(dy) > 0.01 ? halfH / Math.abs(dy) : Infinity;
                                        const t = Math.min(t_x, t_y);
                                        const startX = pos.x + t * dx;
                                        const startY = pos.y + t * dy;
                                        return (React.createElement("g", { key: `lines-${part}` },
                                            React.createElement("line", { x1: startX, y1: startY, x2: pos.anchor.x, y2: pos.anchor.y, stroke: "rgba(34,197,94,0.4)", strokeWidth: "1" }),
                                            React.createElement("circle", { cx: pos.anchor.x, cy: pos.anchor.y, r: "3", fill: "rgba(34,197,94,0.8)" })));
                                    })),
                                    isUpgradeDevMode && Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                                        const pos = posUntyped;
                                        return (React.createElement("div", { key: `anchor-coord-${part}`, className: "absolute top-0 left-0 text-yellow-400 text-[10px] font-mono bg-black/50 px-1 rounded z-[101] pointer-events-none whitespace-nowrap", style: {
                                                transform: `translate(${pos.anchor.x}px, ${pos.anchor.y}px) translate(8px, -4px)`
                                            } },
                                            "(ax: ",
                                            pos.anchor.x,
                                            ", ay: ",
                                            pos.anchor.y,
                                            ")"));
                                    }),
                                    React.createElement("div", { className: "absolute top-0 left-0 z-10 flex items-center justify-center", style: { ...weaponTiltStyle, transformStyle: 'preserve-3d' } },
                                        React.createElement("img", { src: currentWeaponAsset.upgradeImage, alt: WEAPONS[selectedWeaponKey].name, className: `max-w-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-opacity duration-300 ${upgradeWeaponLoaded ? 'opacity-100' : 'opacity-0'}`, onLoad: () => setUpgradeWeaponLoaded(true) })),
                                    Object.entries(currentUpgradePositions).map(([part, posUntyped]) => {
                                        const pos = posUntyped;
                                        const currentLevel = upgradeLevels[part];
                                        const info = UPGRADE_CONFIG[part];
                                        const maxLevel = info.maxLevel;
                                        const isMaxed = currentLevel >= maxLevel;
                                        return (React.createElement("div", { key: part, className: "absolute z-40", style: { transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }, onMouseEnter: () => setHoveredPart(part), onMouseLeave: () => setHoveredPart(null) },
                                            isUpgradeDevMode && (React.createElement("div", { className: "absolute -top-4 -right-2 text-yellow-400 text-[10px] font-mono bg-black/50 px-1 rounded z-[101] whitespace-nowrap" },
                                                "(ux: ",
                                                pos.x,
                                                ", uy: ",
                                                pos.y,
                                                ")")),
                                            React.createElement("button", { onClick: () => !isMaxed && handleUpgrade(part), disabled: isMaxed, className: `relative w-48 p-2 bg-black/90 border-2 ${isMaxed ? 'border-yellow-500/50' : 'border-green-500/50'} hover:bg-green-900/40 hover:border-green-400 transition-all group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-md` },
                                                React.createElement("div", { className: "flex gap-3 items-center mb-2" },
                                                    React.createElement("div", { className: `w-14 h-14 shrink-0 border-2 relative ${isMaxed ? 'border-yellow-500/30 bg-yellow-900/10' : 'bg-green-900/20'} flex items-center justify-center rounded-md` },
                                                        !loadedUpgradeIcons[part] && React.createElement("div", { className: "w-8 h-8 border border-green-500/30 flex items-center justify-center" },
                                                            React.createElement("div", { className: "w-1 h-1 bg-green-500/50 rounded-full" })),
                                                        React.createElement("img", { src: info.ICON, alt: info.NAME, className: `absolute inset-0 w-full h-full object-contain p-1 transition-opacity duration-300 ${loadedUpgradeIcons[part] ? 'opacity-100' : 'opacity-0'}`, onLoad: () => setLoadedUpgradeIcons(prev => ({ ...prev, [part]: true })) })),
                                                    React.createElement("div", { className: "flex-1 flex flex-col justify-center h-14" },
                                                        React.createElement("div", { className: "flex justify-between items-baseline mb-0.5" },
                                                            React.createElement("span", { className: `font-bold text-sm ${isMaxed ? 'text-yellow-500' : 'text-green-400'}` }, info.NAME)),
                                                        React.createElement("div", { className: "text-[10px] text-green-600 font-mono mb-0.5" }, isMaxed ? GAME_TEXT.UPGRADES.MAX_LEVEL : `${GAME_TEXT.UPGRADES.LEVEL_PREFIX} ${currentLevel}/${maxLevel}`),
                                                        React.createElement("div", { className: "text-[10px] text-gray-400 font-body leading-tight truncate" }, info.DESC))),
                                                React.createElement("div", { className: "flex gap-0.5 mt-1 w-full px-0.5" }, Array.from({ length: maxLevel }).map((_, i) => (React.createElement("div", { key: i, className: `h-1.5 flex-1 rounded-sm ${i < currentLevel ? (isMaxed ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-800'}` })))),
                                                isUpgradeDevMode && (React.createElement("div", { className: "absolute top-1/2 -translate-y-1/2 left-full ml-4 z-[100] bg-black/80 p-2 rounded backdrop-blur-sm text-xs whitespace-nowrap" },
                                                    React.createElement("div", { className: "grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center" },
                                                        React.createElement("label", { className: "text-white text-right" }, "UX:"),
                                                        React.createElement("input", { type: "text", value: devInputValues[part]?.ux ?? '', onChange: (e) => handleUpgradeDevInputChange(part, 'ux', e.target.value), className: "w-12 bg-gray-700 text-white p-0.5 rounded text-center" }),
                                                        React.createElement("label", { className: "text-white text-right" }, "UY:"),
                                                        React.createElement("input", { type: "text", value: devInputValues[part]?.uy ?? '', onChange: (e) => handleUpgradeDevInputChange(part, 'uy', e.target.value), className: "w-12 bg-gray-700 text-white p-0.5 rounded text-center" }),
                                                        React.createElement("label", { className: "text-white text-right" }, "AX:"),
                                                        React.createElement("input", { type: "text", value: devInputValues[part]?.ax ?? '', onChange: (e) => handleUpgradeDevInputChange(part, 'ax', e.target.value), className: "w-12 bg-gray-700 text-white p-0.5 rounded text-center" }),
                                                        React.createElement("label", { className: "text-white text-right" }, "AY:"),
                                                        React.createElement("input", { type: "text", value: devInputValues[part]?.ay ?? '', onChange: (e) => handleUpgradeDevInputChange(part, 'ay', e.target.value), className: "w-12 bg-gray-700 text-white p-0.5 rounded text-center" })))))));
                                    })))),
                gameStatus === GameStatus.MENU && (React.createElement("div", { className: "absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm" },
                    React.createElement("div", { className: "max-w-[90vw] w-full p-8 bg-[#111827] bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:30px_30px] shadow-[0_0_50px_rgba(34,197,94,0.2)] rounded-lg flex flex-col md:flex-row gap-8 items-stretch h-[80vh]" },
                        React.createElement("div", { className: "md:w-[45%] flex flex-col h-full" },
                            React.createElement("div", { className: "relative border-2 border-green-700 bg-black h-full overflow-hidden rounded group flex-1" },
                                !currentWeaponAsset.charLoaded && React.createElement(TacticalLoader, { className: "absolute inset-0 z-20" }),
                                Object.entries(WEAPON_ASSETS).map(([key, asset]) => (React.createElement("img", { key: key, src: asset.char, alt: GAME_TEXT.MENU.CHAR_NAME, className: `absolute inset-0 w-full h-full object-cover object-[40%_50%] transition-opacity duration-300 ${selectedWeaponKey === key ? 'opacity-100 z-10' : 'opacity-0 z-0'}`, onLoad: () => asset.setCharLoaded(true) }))),
                                React.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 pt-24 z-20 pointer-events-none" },
                                    React.createElement("div", { className: "text-green-500 text-base font-bold tracking-widest mb-1" }, GAME_TEXT.MENU.CHAR_NAME),
                                    React.createElement("div", { className: "text-green-700 text-sm uppercase" }, GAME_TEXT.MENU.CHAR_STATUS),
                                    React.createElement("div", { className: "text-gray-500 text-xs mt-2 max-w-md font-body" }, GAME_TEXT.MENU.CHAR_DESC)))),
                        React.createElement("div", { className: "md:w-[55%] flex flex-col justify-between" },
                            React.createElement("div", null,
                                React.createElement("h1", { className: "text-6xl lg:text-7xl font-title text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 tracking-tighter mb-2" }, GAME_TEXT.TITLES.MAIN),
                                React.createElement("h2", { className: "text-2xl text-green-700 font-bold mb-6" }, GAME_TEXT.TITLES.OPERATION),
                                React.createElement("div", { className: "bg-black border border-green-900 mb-8 text-green-500 h-40 overflow-hidden relative flex flex-col shadow-inner" },
                                    React.createElement("div", { className: "w-full bg-green-900/30 p-1 px-3 flex justify-between items-center border-b border-green-900/50" },
                                        React.createElement("span", { className: "text-[10px] text-green-600 tracking-wider" }, GAME_TEXT.MENU.ENCRYPTED_SIGNAL),
                                        React.createElement("span", { className: "text-xs text-green-100 font-bold tracking-widest bg-green-900/50 px-2 py-0.5 rounded-sm" }, GAME_TEXT.MENU.INCOMING_TRANS)),
                                    React.createElement("div", { className: "p-4 flex-1 overflow-y-auto font-body" },
                                        React.createElement("p", { className: "typing-effect leading-relaxed text-sm lg:text-base" }, missionText)))),
                            React.createElement("div", { className: "mb-16" },
                                React.createElement("div", { className: "text-base font-bold tracking-widest mb-2 border-b border-green-900 pb-1 text-green-600" }, GAME_TEXT.MENU.LOADOUT_HEADER),
                                React.createElement("div", { className: "grid grid-cols-4 gap-4 h-56 relative overflow-hidden" },
                                    React.createElement("div", { className: "animate-scan pointer-events-none absolute inset-0 z-[15]" }),
                                    Object.entries(WEAPONS).map(([key, weapon]) => {
                                        const assetInfo = WEAPON_ASSETS[key];
                                        const isSelected = selectedWeaponKey === key;
                                        const slotClasses = isSelected
                                            ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : 'border-gray-700 bg-gray-900 opacity-60';
                                        return (React.createElement("div", { key: key, onClick: () => handleSelectWeapon(key), className: `relative h-full border-2 rounded flex flex-col cursor-pointer transition-all hover:bg-gray-800 overflow-hidden ${slotClasses}` },
                                            !assetInfo.weaponLoaded && React.createElement(WeaponLoader, { className: "absolute inset-0" }),
                                            React.createElement("div", { className: "relative z-10 flex flex-col w-full h-full p-2 bg-gray-900 gap-1 items-start" },
                                                React.createElement("div", { className: "h-5 text-sm font-bold text-gray-300 w-full text-left flex-shrink-0 leading-none whitespace-nowrap overflow-hidden text-ellipsis transform-gpu" }, weapon.name),
                                                React.createElement("div", { className: "relative w-full h-28 flex items-center justify-center overflow-hidden" },
                                                    React.createElement("img", { src: assetInfo.weapon, alt: weapon.name, className: `w-full h-full object-contain drop-shadow-lg transition-opacity duration-300 ${assetInfo.weaponLoaded ? 'opacity-100' : 'opacity-0'}`, style: { transform: `scale(${weapon.menuIconScale || 1})` }, onLoad: () => assetInfo.setWeaponLoaded(true) })),
                                                React.createElement("div", { className: "w-full space-y-1 flex-shrink-0 mt-auto" },
                                                    React.createElement(StatBar, { label: "DMG", value: weapon.damage * (weapon.pelletCount || 1), max: 80, color: "bg-red-500" }),
                                                    React.createElement(StatBar, { label: "RATE", value: weapon.fireRate, max: 900, color: "bg-yellow-500", invert: true }),
                                                    React.createElement(StatBar, { label: "MAG", value: weapon.maxAmmo, max: 30, color: "bg-blue-500" }),
                                                    React.createElement(StatBar, { label: "PEN", value: weapon.penetration.count, max: 5, color: "bg-purple-500" }))))));
                                })),
                            React.createElement("button", { onClick: handleStartGame, className: "w-full py-5 bg-green-700 hover:bg-green-600 text-white font-bold text-2xl tracking-widest uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-green-500" }, GAME_TEXT.MENU.DEPLOY_BUTTON)))),
                gameStatus === GameStatus.GAME_OVER && finalReport && (React.createElement("div", { className: "absolute inset-0 z-30 flex items-center justify-center bg-red-900/40 backdrop-blur-md" },
                    isGameOverDevMode && (React.createElement("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-yellow-500 text-black p-2 rounded shadow-lg flex items-center gap-4 font-sans pointer-events-auto" },
                        React.createElement("p", { className: "font-bold text-sm uppercase" }, "Game Over UI Dev Mode"),
                        React.createElement("div", { className: "flex gap-2 items-center" },
                            React.createElement("label", { className: "text-xs font-bold" }, "Width (rem):"),
                            React.createElement("input", { type: "number", step: "0.1", value: gameOverDevSettings.width, onChange: (e) => handleGameOverDevInputChange('width', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" }),
                            React.createElement("label", { className: "text-xs font-bold" }, "Left (rem):"),
                            React.createElement("input", { type: "number", step: "0.1", value: gameOverDevSettings.left, onChange: (e) => handleGameOverDevInputChange('left', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" }),
                            React.createElement("label", { className: "text-xs font-bold" }, "Bottom (rem):"),
                            React.createElement("input", { type: "number", step: "0.1", value: gameOverDevSettings.bottom, onChange: (e) => handleGameOverDevInputChange('bottom', e.target.value), className: "w-16 bg-black/20 text-white text-xs p-1 rounded text-center" })),
                        React.createElement("button", { onClick: handleCopyGameOverConfig, className: "bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-700" }, "Copy Config"))),
                    React.createElement("div", { className: "relative max-w-md w-full p-8 bg-gray-900 border-2 border-red-800 shadow-[0_0_50px_rgba(220,38,38,0.3)] rounded-lg text-center" },
                        React.createElement("img", { src: ASSETS.CHAR_SAD, alt: "Mission Failed", className: "absolute z-0 pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]", style: gameOverImageStyle }),
                        React.createElement("h2", { className: "text-5xl font-black text-red-500 mb-2 tracking-widest" }, GAME_TEXT.GAME_OVER.TITLE),
                        React.createElement("div", { className: "h-1 w-24 bg-red-600 mx-auto mb-6" }),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4 mb-6 text-left" },
                            React.createElement("div", { className: "bg-gray-800 p-3 rounded border border-gray-700" },
                                React.createElement("p", { className: "text-gray-500 text-xs uppercase" }, GAME_TEXT.GAME_OVER.SCORE),
                                React.createElement("p", { className: "text-2xl text-white font-bold" }, finalReport.score)),
                            React.createElement("div", { className: "bg-gray-800 p-3 rounded border border-gray-700" },
                                React.createElement("p", { className: "text-gray-500 text-xs uppercase" }, GAME_TEXT.GAME_OVER.WAVES),
                                React.createElement("p", { className: "text-2xl text-white font-bold" }, finalReport.wave)),
                            React.createElement("div", { className: "bg-gray-800 p-3 rounded border border-gray-700 col-span-2" },
                                React.createElement("p", { className: "text-gray-500 text-xs uppercase" }, GAME_TEXT.GAME_OVER.KILLS),
                                React.createElement("p", { className: "text-2xl text-white font-bold" }, finalReport.kills))),
                        React.createElement("div", { className: "bg-black p-4 border border-red-900 mb-8 text-red-400 text-sm text-left" },
                            React.createElement("p", { className: "mb-2 text-xs uppercase text-red-700" }, GAME_TEXT.GAME_OVER.HQ_ANALYSIS),
                            React.createElement("p", { className: "font-body" }, gameOverText || GAME_TEXT.GAME_OVER.CONNECTION_LOST)),
                        React.createElement("button", { onClick: () => {
                                setGameStatus(GameStatus.MENU);
                                setStats({ health: PLAYER_STATS.maxHealth, ammo: WEAPONS[selectedWeaponKey].maxAmmo, maxAmmo: WEAPONS[selectedWeaponKey].maxAmmo, score: 0, wave: 1, xp: 0, maxXp: 100, level: 1 });
                            }, className: "w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-lg uppercase transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]" }, GAME_TEXT.GAME_OVER.RETRY_BUTTON))))));
        };
        exports.default = App;
        return exports;
    }({}));
    // --- Start of file: services/geminiService.ts ---
    modules['services/geminiService.ts'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.generateAfterActionReport = exports.generateMissionBriefing = void 0;
        const textConfig_1 = require('config/textConfig.ts');
        const getRandomText = (array) => {
            if (!array || array.length === 0) {
                return "";
            }
            return array[Math.floor(Math.random() * array.length)];
        };
        const generateMissionBriefing = async () => {
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            return getRandomText(textConfig_1.GAME_TEXT.MISSION_BRIEFINGS);
        };
        exports.generateMissionBriefing = generateMissionBriefing;
        const generateAfterActionReport = async (score, kills, wave) => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const messagePool = score >= 500 ? textConfig_1.GAME_TEXT.HIGH_SCORE_REPORTS : textConfig_1.GAME_TEXT.LOW_SCORE_REPORTS;
            const flavorText = getRandomText(messagePool);
            return `${flavorText} (최종 점수: ${score}, 처치: ${kills})`;
        };
        exports.generateAfterActionReport = generateAfterActionReport;
        return exports;
    }({}));

    // --- Start of file: components/GameIcons.tsx ---
    modules['components/GameIcons.tsx'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.ShotgunIcon = exports.RifleIcon = exports.MP5Icon = exports.PistolIcon = exports.WeaponIcon = exports.ShotgunVector = exports.RifleVector = exports.MP5Vector = exports.M1911Vector = exports.WeaponLoader = exports.TacticalLoader = void 0;
        const React = window.React;
        const textConfig_1 = require('config/textConfig.ts');
        const TacticalLoader = ({ className, text = textConfig_1.GAME_TEXT.SYSTEM.RETRIEVING }) => (React.createElement("div", { className: `relative bg-gray-950 overflow-hidden border border-green-900/50 ${className}` },
            React.createElement("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" }),
            React.createElement("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-green-500 text-[10px] md:text-xs font-bold tracking-widest animate-pulse flex flex-col items-center gap-1" },
                React.createElement("div", { className: "w-2 h-2 bg-green-500 rounded-full mb-1" }),
                React.createElement("span", null, text),
                React.createElement("span", { className: "text-[8px] opacity-70" }, textConfig_1.GAME_TEXT.SYSTEM.ENCRYPTED))));
        exports.TacticalLoader = TacticalLoader;
        const WeaponLoader = ({ className }) => (React.createElement("div", { className: `relative bg-gray-900 flex items-center justify-center overflow-hidden ${className}` },
            React.createElement("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" }),
            React.createElement("div", { className: "z-10 relative flex flex-col items-center justify-center opacity-30" },
                React.createElement("div", { className: "w-8 h-8 border border-green-500/50 rounded-full flex items-center justify-center relative" },
                    React.createElement("div", { className: "w-1 h-1 bg-green-500 rounded-full" }),
                    React.createElement("div", { className: "absolute top-0 bottom-0 w-px bg-green-500/50" }),
                    React.createElement("div", { className: "absolute left-0 right-0 h-px bg-green-500/50" })),
                React.createElement("div", { className: "absolute -top-4 -left-6 w-2 h-2 border-t border-l border-green-500/50" }),
                React.createElement("div", { className: "absolute -top-4 -right-6 w-2 h-2 border-t border-r border-green-500/50" }),
                React.createElement("div", { className: "absolute -bottom-4 -left-6 w-2 h-2 border-b border-l border-green-500/50" }),
                React.createElement("div", { className: "absolute -bottom-4 -right-6 w-2 h-2 border-b border-r border-green-500/50" }))));
        exports.WeaponLoader = WeaponLoader;
        const M1911Vector = ({ className }) => (React.createElement("svg", { viewBox: "0 0 200 120", className: className, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("defs", null,
                React.createElement("linearGradient", { id: "slideGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                    React.createElement("stop", { offset: "0%", stopColor: "#c8c8c8" }),
                    React.createElement("stop", { offset: "50%", stopColor: "#8c8c8c" }),
                    React.createElement("stop", { offset: "100%", stopColor: "#4d4d4d" })),
                React.createElement("filter", { id: "glow" },
                    React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "2", result: "blur" }),
                    React.createElement("feMerge", null,
                        React.createElement("feMergeNode", { in: "blur" }),
                        React.createElement("feMergeNode", { in: "SourceGraphic" })))),
            React.createElement("rect", { x: "20", y: "30", width: "160", height: "60", rx: "5", fill: "url(#slideGradient)", filter: "url(#glow)" }),
            React.createElement("rect", { x: "15", y: "60", width: "30", height: "20", rx: "3", fill: "#333" }),
            React.createElement("path", { d: "M180 60 L185 55 L185 75 L180 70 Z", fill: "#444" }),
            React.createElement("rect", { x: "50", y: "90", width: "100", height: "15", rx: "3", fill: "#333" }),
            React.createElement("rect", { x: "160", y: "55", width: "20", height: "10", rx: "2", fill: "#444" }),
            React.createElement("circle", { cx: "170", cy: "60", r: "2", fill: "#f8d167" })));
        exports.M1911Vector = M1911Vector;
        const MP5Vector = ({ className }) => (React.createElement("svg", { viewBox: "0 0 220 120", className: className, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("defs", null,
                React.createElement("linearGradient", { id: "mp5BodyGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                    React.createElement("stop", { offset: "0%", stopColor: "#6b7280" }),
                    React.createElement("stop", { offset: "50%", stopColor: "#4b5563" }),
                    React.createElement("stop", { offset: "100%", stopColor: "#1f2937" })),
                React.createElement("filter", { id: "mp5Glow" },
                    React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "1.5", result: "blur" }),
                    React.createElement("feMerge", null,
                        React.createElement("feMergeNode", { in: "blur" }),
                        React.createElement("feMergeNode", { in: "SourceGraphic" })))),
            React.createElement("rect", { x: "20", y: "40", width: "150", height: "30", rx: "3", fill: "url(#mp5BodyGradient)", filter: "url(#mp5Glow)" }),
            React.createElement("rect", { x: "170", y: "45", width: "30", height: "20", rx: "2", fill: "#111827" }),
            React.createElement("rect", { x: "5", y: "45", width: "15", height: "20", rx: "2", fill: "#374151" }),
            React.createElement("rect", { x: "100", y: "68", width: "15", height: "30", rx: "2", fill: "#1f2937" }),
            React.createElement("rect", { x: "70", y: "30", width: "30", height: "8", rx: "1", fill: "#111827" }),
            React.createElement("path", { d: "M60 70 Q70 85 80 70 L80 60 L60 60 Z", fill: "#374151" })));
        exports.MP5Vector = MP5Vector;
        const RifleVector = ({ className }) => (React.createElement("svg", { viewBox: "0 0 250 80", className: className, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("defs", null,
                React.createElement("linearGradient", { id: "rifleGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                    React.createElement("stop", { offset: "0%", stopColor: "#a3a3a3" }),
                    React.createElement("stop", { offset: "50%", stopColor: "#737373" }),
                    React.createElement("stop", { offset: "100%", stopColor: "#404040" })),
                React.createElement("filter", { id: "rifleGlow" },
                    React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "1.5", result: "blur" }),
                    React.createElement("feMerge", null,
                        React.createElement("feMergeNode", { in: "blur" }),
                        React.createElement("feMergeNode", { in: "SourceGraphic" })))),
            React.createElement("path", { d: "M10 40 Q20 20 50 20 L70 20 L70 60 L50 60 Q20 60 10 40 Z", fill: "#5d4037" }),
            React.createElement("rect", { x: "60", y: "30", width: "100", height: "20", rx: "3", fill: "url(#rifleGradient)", filter: "url(#rifleGlow)" }),
            React.createElement("rect", { x: "160", y: "35", width: "70", height: "10", rx: "2", fill: "#212121" }),
            React.createElement("rect", { x: "100", y: "25", width: "20", height: "5", rx: "1", fill: "#333" }),
            React.createElement("rect", { x: "110", y: "50", width: "10", height: "20", rx: "2", fill: "#333" })));
        exports.RifleVector = RifleVector;
        const ShotgunVector = ({ className }) => (React.createElement("svg", { viewBox: "0 0 250 80", className: className, xmlns: "http://www.w3.org/2000/svg" },
            React.createElement("defs", null,
                React.createElement("linearGradient", { id: "shotgunGradient", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
                    React.createElement("stop", { offset: "0%", stopColor: "#cc7a29" }),
                    React.createElement("stop", { offset: "50%", stopColor: "#a35f20" }),
                    React.createElement("stop", { offset: "100%", stopColor: "#7a4718" })),
                React.createElement("filter", { id: "shotgunGlow" },
                    React.createElement("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "1.5", result: "blur" }),
                    React.createElement("feMerge", null,
                        React.createElement("feMergeNode", { in: "blur" }),
                        React.createElement("feMergeNode", { in: "SourceGraphic" })))),
            React.createElement("path", { d: "M10 40 Q20 20 50 20 L70 20 L70 60 L50 60 Q20 60 10 40 Z", fill: "#8b4513" }),
            React.createElement("rect", { x: "60", y: "30", width: "100", height: "20", rx: "3", fill: "url(#shotgunGradient)", filter: "url(#shotgunGlow)" }),
            React.createElement("rect", { x: "70", y: "33", width: "30", height: "14", rx: "2", fill: "#423532" }),
            React.createElement("rect", { x: "160", y: "35", width: "70", height: "10", rx: "2", fill: "#303030" })));
        exports.ShotgunVector = ShotgunVector;
        const WeaponIcon = ({ imagePaths, fallback, className, alt, style }) => {
            const [currentPathIndex, setCurrentPathIndex] = React.useState(0);
            const [useFallback, setUseFallback] = React.useState(false);
            const [isLoaded, setIsLoaded] = React.useState(false);
            const handleError = () => {
                if (currentPathIndex < imagePaths.length - 1) {
                    setCurrentPathIndex(prev => prev + 1);
                    setIsLoaded(false);
                }
                else {
                    setUseFallback(true);
                }
            };
            const handleLoad = () => setIsLoaded(true);
            if (useFallback) {
                return React.createElement(React.Fragment, null, fallback);
            }
            if (!imagePaths || imagePaths.length === 0) {
                setUseFallback(true);
                return React.createElement(React.Fragment, null, fallback);
            }
            return (React.createElement("div", { style: style, className: `relative flex items-center justify-center overflow-hidden ${className}` },
                React.createElement("img", { key: imagePaths[currentPathIndex], src: imagePaths[currentPathIndex], alt: alt, className: `w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`, draggable: false, onError: handleError, onLoad: handleLoad })));
        };
        exports.WeaponIcon = WeaponIcon;
        const PistolIcon = ({ className, style }) => (React.createElement(WeaponIcon, { imagePaths: ['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_m1911.png', '/m1911.png', 'm1911.png'], fallback: React.createElement(M1911Vector, { className: className }), className: className, alt: textConfig_1.GAME_TEXT.WEAPONS.M1911.NAME, style: style }));
        exports.PistolIcon = PistolIcon;
        const MP5Icon = ({ className, style }) => (React.createElement(WeaponIcon, { imagePaths: ['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_mp5.png', '/mp5.png', 'mp5.png'], fallback: React.createElement(MP5Vector, { className: className }), className: className, alt: textConfig_1.GAME_TEXT.WEAPONS.MP5.NAME, style: style }));
        exports.MP5Icon = MP5Icon;
        const RifleIcon = ({ className, style }) => (React.createElement(WeaponIcon, { imagePaths: ['https://storage.cloud.google.com/kaelove_game_01/bunny_Rifle.png', '/bunny_Rifle.png', 'bunny_Rifle.png'], fallback: React.createElement(RifleVector, { className: className }), className: className, alt: textConfig_1.GAME_TEXT.WEAPONS.RIFLE.NAME, style: style }));
        exports.RifleIcon = RifleIcon;
        const ShotgunIcon = ({ className, style }) => (React.createElement(WeaponIcon, { imagePaths: ['https://storage.cloud.google.com/kaelove_game_01/Gemini_Generated_Shotgun.png'], fallback: React.createElement(ShotgunVector, { className: className }), className: className, alt: textConfig_1.GAME_TEXT.WEAPONS.SHOTGUN.NAME, style: style }));
        exports.ShotgunIcon = ShotgunIcon;
        return exports;
    }({}));

    // --- Start of file: index.tsx ---
    modules['index.tsx'] = (function(exports) {
        Object.defineProperty(exports, "__esModule", { value: true });
        const React = window.React;
        const client_1 = require('react-dom/client/');
        const App_1 = require('App.tsx');
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error("Could not find root element to mount to");
        }
        const root = (0, client_1.createRoot)(rootElement);
        root.render(React.createElement(React.StrictMode, null,
            React.createElement(App_1.default, null)));
        return exports;
    }({}));

})();