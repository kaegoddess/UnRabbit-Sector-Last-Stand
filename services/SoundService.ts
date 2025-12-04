import { SOUND_SETTINGS } from '../config/gameConfig';

class SoundService {
  private context: AudioContext | null = null;
  private buffers: { [key: string]: AudioBuffer } = {};
  private initialized: boolean = false;
  private dbName = 'UndeadSectorAudioDB';
  private storeName = 'audioFiles';
  // [추가] 현재 페이지가 'file://' 프로토콜로 실행 중인지 확인하는 플래그입니다.
  // 로컬 파일 환경에서는 브라우저 보안 정책으로 인해 fetch()나 IndexedDB 같은 기능이 제한됩니다.
  private isLocalFile: boolean = window.location.protocol === 'file:';
  // SOUND_SETTINGS.assets를 SoundService 내부에서 사용하기 위해 별도 프로퍼티로 저장합니다.
  public SOUND_ASSETS_CONFIG = SOUND_SETTINGS.assets as { [key: string]: string };

  constructor() {
    // 생성자에서는 아무것도 하지 않음
  }

  // 사용자 상호작용(클릭 등) 후 호출되어야 함
  // [수정] init() 메서드를 async로 변경하여 내부 비동기 호출을 기다릴 수 있도록 합니다.
  public async init() {
    if (this.initialized) {
      if (this.context?.state === 'suspended') {
        await this.context.resume();
      }
      return;
    }

    this.ensureContext();
    this.initialized = true;
    // [수정] loadAssets()를 await하여 모든 사운드 로딩이 완료될 때까지 기다립니다.
    await this.loadAssets();
    // IndexedDB에 저장된 커스텀 사운드도 로드 (async)
    await this.loadCustomSoundsFromStorage();
  }

  private ensureContext() {
    if (!this.context) {
      try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
          this.context = new AudioContextClass();
        }
      } catch (e) {
        console.error("AudioContext initialization failed:", e);
      }
    }
  }

  // IndexedDB 헬퍼: DB 열기
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // [수정] 로컬 파일 환경이거나 IndexedDB를 지원하지 않는 경우, 즉시 거부(reject)하여 오류를 방지합니다.
      if (this.isLocalFile || !window.indexedDB) {
        reject(this.isLocalFile ? "IndexedDB is not available in file:// protocol" : "IndexedDB not supported");
        return;
      }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 저장소에서 커스텀 사운드 불러오기 (앱 시작 시 호출)
  public async loadCustomSoundsFromStorage(): Promise<string[]> {
    this.ensureContext();
    if (!this.context) return [];
    
    // [추가] 로컬 파일 환경에서는 IndexedDB 접근을 시도하지 않습니다.
    if (this.isLocalFile) {
        console.log("로컬 파일 환경 감지: IndexedDB 접근을 건너뜁니다.");
        return [];
    }

    try {
      const db = await this.openDB();
      const loadedKeys: string[] = [];

      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.openCursor();

        request.onsuccess = async (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            const key = cursor.key as string;
            const arrayBuffer = cursor.value as ArrayBuffer;

            try {
              // ArrayBuffer 복사본을 만들어 디코딩 (decodeAudioData가 버퍼를 분리할 수 있음)
              const bufferCopy = arrayBuffer.slice(0);
              const audioBuffer = await this.context!.decodeAudioData(bufferCopy);
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

  // 설정 파일에 경로가 있다면 로드
  private async loadAssets() {
    // [수정] 로컬 파일 환경('file://')에서는 fetch() API를 사용할 수 없으므로,
    // 파일 로딩 시도를 건너뛰고 바로 함수를 종료합니다.
    // 이렇게 하면 게임이 멈추지 않고, 사운드 파일이 없는 경우에 대비한
    // 내장 신디사이저(합성음)가 자동으로 사용됩니다.
    if (!this.context) return; // 컨텍스트가 없으면 로드할 수 없음

    // SOUND_SETTINGS.assets 대신 내부 프로퍼티 사용
    const assets = this.SOUND_ASSETS_CONFIG; 
    
    // 파일 로딩은 병렬로 처리하여 속도 최적화
    const loadPromises = Object.entries(assets).map(async ([key, url]) => {
      // 1. 이미 IndexedDB(사용자 업로드)로 로드된 경우 건너뜀 (우선순위: 사용자 > 내장 파일 > 합성음)
      if (this.buffers[key]) return;

      if (url && url.length > 0) {
        // [수정] 로컬 파일 환경일 경우 fetch 시도를 건너뛰고 합성음 폴백을 사용합니다.
        if (this.isLocalFile) {
          console.warn(`로컬 파일 환경 감지: 사운드 '${key}' (${url}) fetch를 건너뛰고 내장 합성음을 사용합니다.`);
          return; // 이 사운드에 대해서는 로딩을 중단하고 다음 사운드로 넘어갑니다.
        }

        try {
          const response = await fetch(url);
          // 파일이 없거나(404) 에러가 나면 에러를 던져서 catch 블록으로 이동 -> 합성음 사용
          if (!response.ok) {
              throw new Error(`Sound file not found: ${url}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          // 데이터가 오디오가 아닌 경우(예: HTML 에러 페이지) 디코딩 실패 -> catch 블록으로 이동
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers[key] = audioBuffer;
        } catch (e) {
          // 파일 로드 실패 시 경고 로그 출력 후 합성음 사용
          console.warn(`Failed to load sound '${key}' from '${url}'. Using synthesizer fallback.`, e);
        }
      }
    });

    await Promise.all(loadPromises);
  }

  // 사용자가 업로드한 파일을 직접 로드하고 DB에 저장
  public async loadUserSound(key: string, file: File): Promise<boolean> {
    this.ensureContext();
    if (!this.context) return false;

    // [추가] 로컬 파일 환경에서는 IndexedDB 저장을 시도하지 않습니다.
    if (this.isLocalFile) {
        console.warn("로컬 파일 환경에서는 사용자 사운드를 저장할 수 없습니다.");
        return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 1. IndexedDB에 저장 (원본 ArrayBuffer)
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.put(arrayBuffer, key);

      // 2. 오디오 디코딩 및 메모리 로드 (ArrayBuffer 복사본 사용)
      const bufferCopy = arrayBuffer.slice(0);
      const audioBuffer = await this.context.decodeAudioData(bufferCopy);
      this.buffers[key] = audioBuffer;
      
      return true;
    } catch (e) {
      console.error(`Failed to load custom sound for ${key}`, e);
      return false;
    }
  }

  public play(soundName: 'shoot' | 'impact' | 'footstep' | 'reload' | 'playerHit' | 'itemPickup' | 'uiSelect' | 'quickReloadSuccess' | 'quickReloadFail' | 'dodge' | 'dodgeLand' | 'sprintCollide' | 'staminaEmpty') {
    // 컨텍스트가 없으면(초기화 안됨) 실행하지 않음
    if (!this.context) return;
    if (this.context.state === 'suspended') this.context.resume();

    // 1. 파일이 로드되어 있으면 파일 재생 (업로드 파일 or 내장 파일)
    if (this.buffers[soundName]) {
      this.playBuffer(this.buffers[soundName]);
      return;
    }

    // 2. 파일이 없으면 합성음 재생 (신디사이저)
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
      case 'dodge': this.synthDodge(); break;
      case 'dodgeLand': this.synthDodgeLand(); break;
      case 'sprintCollide': this.synthSprintCollide(); break;
      case 'staminaEmpty': this.synthStaminaEmpty(); break;
    }
  }

  private playBuffer(buffer: AudioBuffer) {
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

  // --- 신디사이저 (합성음) 로직 ---

  // [NEW] 스테미나 부족 시 재생되는 짧은 경고음
  private synthStaminaEmpty() {
    if (!this.context) return;
    const t = this.context.currentTime;
    // 볼륨을 낮춰서 플레이어에게 거슬리지 않도록 합니다.
    const vol = SOUND_SETTINGS.masterVolume * 0.4;

    const osc = this.context.createOscillator();
    osc.type = 'square'; // '삑' 하는 느낌의 디지털 사운드
    osc.frequency.setValueAtTime(80, t); // 낮은 주파수에서 시작
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1); // 더 낮은 주파수로 떨어지며 '뚝' 끊어지는 느낌을 줍니다.

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // 0.1초만에 소리가 사라지도록 하여 짧게 만듭니다.

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.1); // 0.1초 후에 소리를 강제로 정지시킵니다.
  }

  private synthDodge() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * 0.5;
    const bufferSize = this.context.sampleRate * 0.3;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 5;
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.2);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    noise.start(t);
  }

  private synthDodgeLand() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * 0.7;

    const osc = this.context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private synthSprintCollide() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * 0.6;
    const osc = this.context.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }


  // [NEW] 빠른 재장전 성공 시 재생되는 합성음
  private synthQuickReloadSuccess() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    // 짧고 높은 피치의 '띵' 소리
    const osc1 = this.context.createOscillator();
    osc1.type = 'triangle'; // 부드러운 시작
    osc1.frequency.setValueAtTime(1000, t);
    osc1.frequency.exponentialRampToValueAtTime(1500, t + 0.05); // 빠르게 상승
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.1); // 살짝 떨어짐

    const gain1 = this.context.createGain();
    gain1.gain.setValueAtTime(vol * 0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15); // 빠르게 소멸

    osc1.connect(gain1);
    gain1.connect(this.context.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // 짧고 낮은 피치의 '퍽' 소리 (확인음)
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

  // [NEW] 빠른 재장전 실패 시 재생되는 합성음
  private synthQuickReloadFail() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    // 낮고 불협화음적인 '삑-뿌우' 소리
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(250, t);
    osc1.frequency.exponentialRampToValueAtTime(150, t + 0.2);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(240, t); // 약간 불협화음
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

  /**
   * UI 요소를 선택했을 때 재생될 짧고 날카로운 디지털 사운드를 생성합니다.
   * '삐삑' 하는 느낌의 사운드로, 메뉴 선택과 같은 상호작용에 적합합니다.
   */
  private synthUiSelect() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    // 'square' 파형은 '삐' 소리와 같은 날카롭고 디지털적인 사운드를 만듭니다.
    osc.type = 'square';
    // 높은 주파수(1200Hz)에서 시작하여 짧은 시간 동안 약간 떨어지면서 '삑'하는 느낌을 줍니다.
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);

    // 볼륨을 짧은 시간 동안 빠르게 줄여서 '클릭'처럼 소리가 바로 끊어지게 합니다.
    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.1); // 0.1초 후에 소리를 정지시켜 매우 짧게 만듭니다.
  }

  // 아이템 획득 시 "뽀요용" 사운드
  private synthItemPickup() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine'; // 부드러운 '뽀' 소리를 위해 sine 웨이브 사용
    
    // 880Hz(A5)에서 시작하여 0.05초 만에 1400Hz까지 빠르게 올라갔다가,
    // 0.2초에 걸쳐 600Hz까지 떨어지며 "뽀요용" 효과를 만듭니다.
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.2);

    // 볼륨은 부드럽게 줄어들어 소리가 자연스럽게 사라지도록 합니다.
    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 부드럽고 묵직한 "탕!" 격발음 (M1911 스타일)
  private synthShoot() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;
    
    // 1. Body (Tonal Punch) - Triangle Wave
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

    // 2. Blast (Explosion) - Low-passed Noise
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

  // "퍽" 하는 둔탁한 피격음 (좀비)
  private synthImpact() {
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

  // 플레이어 피격음 ("윽" + 타격)
  private synthPlayerHit() {
    if (!this.context) return;
    const t = this.context.currentTime;

    // 1. 고통스러운 신음/충격음 (Sawtooth)
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

    // 2. 찢어지는/부딪히는 노이즈
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

  // 짧고 낮은 발소리
  private synthFootstep() {
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

  // 재장전 사운드 (철컥... 찰칵)
  private synthReload() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    // --- Sequence 1: Magazine Insert ---
    const magSlideDuration = 0.15;
    const magSlideBuffer = this.context.createBuffer(1, this.context.sampleRate * magSlideDuration, this.context.sampleRate);
    const magSlideData = magSlideBuffer.getChannelData(0);
    for(let i=0; i<magSlideBuffer.length; i++) magSlideData[i] = Math.random() * 2 - 1;
    
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

    // --- Sequence 2: Slide Rack ---
    const slidePullTime = t + 0.40;
    const slideDuration = 0.2;
    const slideBuffer = this.context.createBuffer(1, this.context.sampleRate * slideDuration, this.context.sampleRate);
    const slideData = slideBuffer.getChannelData(0);
    for(let i=0; i<slideBuffer.length; i++) slideData[i] = Math.random() * 2 - 1;
    
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
    for(let i=0; i<impactData.length; i++) impactData[i] = Math.random() * 2 - 1;
    
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

export const soundService = new SoundService();