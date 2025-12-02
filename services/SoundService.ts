import { SOUND_SETTINGS } from '../gameConfig';

class SoundService {
  private context: AudioContext | null = null;
  private buffers: { [key: string]: AudioBuffer } = {};
  private initialized: boolean = false;
  private dbName = 'UndeadSectorAudioDB';
  private storeName = 'audioFiles';
  // 현재 페이지가 'file://' 프로토콜로 실행 중인지 확인하는 플래그입니다.
  // 로컬 파일 환경에서는 브라우저 보안 정책으로 인해 fetch()나 IndexedDB 같은 기능이 제한됩니다.
  private isLocalFile: boolean = window.location.protocol === 'file:';

  constructor() {
    // 생성자에서는 아무것도 하지 않음
  }

  // 사용자 상호작용(클릭 등) 후 호출되어야 함
  // [수정] init() 함수를 async로 변경하여 내부 비동기 작업을 기다릴 수 있도록 합니다.
  public async init() {
    if (this.initialized) {
      if (this.context?.state === 'suspended') {
        this.context.resume();
      }
      return;
    }

    this.ensureContext();
    if (!this.context) {
        console.error("AudioContext가 초기화되지 않았습니다. 사운드 서비스를 시작할 수 없습니다.");
        return;
    }

    this.initialized = true;
    // [수정] loadAssets()가 비동기 함수이므로 await를 사용하여 완료될 때까지 기다립니다.
    await this.loadAssets();
    console.log("SoundService 초기화 완료 및 에셋 로딩 시도 완료.");
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
  // [수정] App.tsx에서 이 함수를 await할 수 있도록 반환형을 Promise<string[]>로 명시합니다.
  public async loadCustomSoundsFromStorage(): Promise<string[]> {
    this.ensureContext();
    if (!this.context) return [];
    
    // [추가] 로컬 파일 환경이거나 IndexedDB를 지원하지 않는 경우, IndexedDB 로직을 건너뜁니다.
    if (this.isLocalFile) {
      console.warn("IndexedDB access skipped in file:// protocol.");
      return [];
    }

    try {
      const db = await this.openDB();
      const loadedKeys: string[] = []; // 로드된 키를 추적하는 배열

      // IndexedDB 트랜잭션 및 커서 로직
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.openCursor();

        request.onsuccess = async (e) => {
          const cursor = (e.target as IDBRequest).result;
          if (cursor) {
            const key = cursor.key as string;
            const arrayBuffer = cursor.value as ArrayBuffer;
            try {
              // ArrayBuffer를 복사하여 사용 (decodeAudioData는 버퍼를 소비할 수 있음)
              const bufferCopy = arrayBuffer.slice(0);
              const audioBuffer = await this.context!.decodeAudioData(bufferCopy);
              this.buffers[key] = audioBuffer;
              loadedKeys.push(key);
            } catch (decodeErr) {
              console.error(`Failed to decode saved sound: ${key}`, decodeErr);
            }
            cursor.continue();
          } else {
            // 모든 항목을 순회 완료
            resolve(loadedKeys);
          }
        };
        request.onerror = () => {
          console.error("Failed to open cursor for IndexedDB.");
          resolve([]); // 오류 발생 시 빈 배열 반환
        };
      });
    } catch (e) {
      console.error("Failed to load sounds from DB:", e);
      return [];
    }
  }

  // 사운드 에셋 로딩
  private async loadAssets() {
    if (!this.context) return;

    const assets = SOUND_SETTINGS.assets;
    const loadPromises = Object.entries(assets).map(async ([key, url]) => {
      // 이미 버퍼에 있는 사운드는 다시 로드하지 않음
      if (this.buffers[key]) return;

      // [추가] 로컬 파일 환경에서는 fetch()를 건너뛰고 합성음으로 대체하도록 합니다.
      if (this.isLocalFile) {
        console.warn(`Asset '${key}' skipped fetch in file:// protocol. Using synthesizer fallback.`);
        return; // 파일 로드 시도 없이 즉시 반환
      }

      if (url && url.length > 0) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            // HTTP 오류 (404, 500 등) 발생 시
            throw new Error(`Sound file not found or network error: ${url}, Status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
          this.buffers[key] = audioBuffer;
        } catch (e) {
          console.warn(`Failed to load sound '${key}' from '${url}'. Using synthesizer fallback.`, e);
          // 여기에 특정 사운드에 대한 폴백 처리 로직을 추가할 수 있습니다.
          // 예: this.buffers[key] = this.createEmptyBuffer(); 또는 특정 합성음을 버퍼로 생성하여 할당
        }
      }
    });

    // 모든 로딩 작업이 완료될 때까지 기다립니다.
    await Promise.all(loadPromises);
  }

  // 사용자 정의 사운드 로드 및 IndexedDB에 저장
  public async loadUserSound(key: string, file: File): Promise<boolean> {
    this.ensureContext();
    if (!this.context) return false;

    // [추가] 로컬 파일 환경에서는 IndexedDB 접근을 건너뜁니다.
    if (this.isLocalFile) {
      console.warn("User sound loading skipped (IndexedDB unavailable in file:// protocol).");
      return false;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.put(arrayBuffer, key); // IndexedDB에 저장

      // 저장된 데이터를 오디오 버퍼로 디코딩
      const bufferCopy = arrayBuffer.slice(0); // 원본 ArrayBuffer 손상 방지
      const audioBuffer = await this.context.decodeAudioData(bufferCopy);
      this.buffers[key] = audioBuffer;
      return true;
    } catch (e) {
      console.error(`Failed to load custom sound for ${key}`, e);
      return false;
    }
  }

  // 사운드 재생
  public play(soundName: string) {
    if (!this.context) return;

    // 오디오 컨텍스트가 정지(suspended) 상태이면 재개합니다.
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    // 로드된 버퍼가 있으면 재생합니다.
    if (this.buffers[soundName]) {
      this.playBuffer(this.buffers[soundName]);
      return;
    }

    // 로드된 버퍼가 없으면 합성음으로 대체합니다.
    switch (soundName) {
      case 'shoot': this.synthShoot(); break;
      case 'impact': this.synthImpact(); break;
      case 'footstep': this.synthFootstep(); break;
      case 'reload': this.synthReload(); break;
      case 'playerHit': this.synthPlayerHit(); break;
      case 'itemPickup': this.synthItemPickup(); break;
      case 'uiSelect': this.synthUiSelect(); break; // [추가] UI 선택 합성음
      default:
        console.warn(`Sound '${soundName}' not found and no synthesizer fallback.`);
        break;
    }
  }

  // AudioBuffer를 재생하는 헬퍼 함수
  private playBuffer(buffer: AudioBuffer) {
    if (!this.context) return;
    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      const gainNode = this.context.createGain();
      gainNode.gain.value = SOUND_SETTINGS.masterVolume; // 마스터 볼륨 적용
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      source.start(0);
    } catch (e) {
      console.error("Error playing buffer:", e);
    }
  }

  // --- 합성음(Synthesizer Fallbacks) ---
  // 아이템 획득 합성음
  private synthItemPickup() {
    if (!this.context) return;
    const t = this.context.currentTime; // 현재 오디오 시간
    const osc = this.context.createOscillator(); // 오실레이터 생성 (소리의 파형)
    const gain = this.context.createGain(); // 게인 노드 생성 (볼륨 조절)

    osc.type = 'sine'; // 사인파형 (부드러운 소리)
    osc.frequency.setValueAtTime(880, t); // 시작 주파수 (Hz)
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05); // 짧게 상승
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.2); // 하강하며 끝남

    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.6, t); // 시작 볼륨
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25); // 빠르게 감소하여 소멸

    osc.connect(gain); // 오실레이터를 게인에 연결
    gain.connect(this.context.destination); // 게인을 최종 출력에 연결

    osc.start(t); // 현재 시간부터 재생 시작
    osc.stop(t + 0.3); // 0.3초 후 재생 중지
  }

  // 총격 합성음
  private synthShoot() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    // 기본 총성 파형
    const osc = this.context.createOscillator();
    const oscGain = this.context.createGain();
    osc.type = 'triangle'; // 삼각파 (날카로운 소리)
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    oscGain.gain.setValueAtTime(vol * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(oscGain);
    oscGain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    // 노이즈 (총성 추가)
    const bufferSize = this.context.sampleRate * 0.2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1); // 랜덤 노이즈 데이터
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass'; // 저역 통과 필터 (고주파수 제거)
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.15);
    noiseGain.gain.setValueAtTime(vol * 0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.context.destination);
    noise.start(t);
  }

  // 피격 합성음
  private synthImpact() {
    if (!this.context) return;
    const t = this.context.currentTime;

    const bufferSize = this.context.sampleRate * 0.1;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // 랜덤 노이즈
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

  // 플레이어 피격 합성음
  private synthPlayerHit() {
    if (!this.context) return;
    const t = this.context.currentTime;

    const osc = this.context.createOscillator();
    const oscGain = this.context.createGain();
    osc.type = 'sawtooth'; // 톱니파 (거친 소리)
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.15); // 주파수 하강 (데미지 느낌)

    oscGain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600; // 낮은 주파수로 필터링하여 둔탁한 느낌

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

  // 발소리 합성음
  private synthFootstep() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const randomDetune = Math.random() * 100 - 50; // 약간의 무작위 피치 변화

    const bufferSize = this.context.sampleRate * 0.1;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    noise.detune.value = randomDetune; // 피치 변화 적용

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, t);
    filter.frequency.linearRampToValueAtTime(50, t + 0.1); // 주파수 하강 (발소리 느낌)

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    noise.start(t);
  }

  // 재장전 합성음
  private synthReload() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    // 탄창 슬라이드 소리 (노이즈 기반)
    const magSlideDuration = 0.15;
    const magSlideBuffer = this.context.createBuffer(1, this.context.sampleRate * magSlideDuration, this.context.sampleRate);
    const magSlideData = magSlideBuffer.getChannelData(0);
    for (let i = 0; i < magSlideBuffer.length; i++) magSlideData[i] = Math.random() * 2 - 1;
    const magSlideSrc = this.context.createBufferSource();
    magSlideSrc.buffer = magSlideBuffer;

    const magSlideFilter = this.context.createBiquadFilter();
    magSlideFilter.type = 'bandpass'; // 특정 주파수 대역 통과
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

    // 탄창이 결합되는 소리 (둔탁한 저음)
    const magLockTime = t + 0.12; // 슬라이드 소리 중간에 발생
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

    // 탄창 결합 클릭음 (짧고 날카로운 고음)
    const magClick = this.context.createOscillator();
    magClick.type = 'square'; // 사각파 (더 날카로운 소리)
    magClick.frequency.setValueAtTime(1200, magLockTime);
    const magClickGain = this.context.createGain();
    magClickGain.gain.setValueAtTime(vol * 0.3, magLockTime);
    magClickGain.gain.exponentialRampToValueAtTime(0.01, magLockTime + 0.05);
    magClick.connect(magClickGain);
    magClickGain.connect(this.context.destination);
    magClick.start(magLockTime);
    magClick.stop(magLockTime + 0.05);

    // 장전 손잡이 당기는 소리
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
    slideFilter.Q.value = 1.5; // Q값으로 대역폭 조절 (날카로움)

    const slideGain = this.context.createGain();
    slideGain.gain.setValueAtTime(0, slidePullTime);
    slideGain.gain.linearRampToValueAtTime(vol * 0.7, slidePullTime + 0.05);
    slideGain.gain.linearRampToValueAtTime(0, slidePullTime + slideDuration);

    slideSrc.connect(slideFilter);
    slideFilter.connect(slideGain);
    slideGain.connect(this.context.destination);
    slideSrc.start(slidePullTime);

    // 슬라이드 복귀 충격음
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

    // 슬라이드 복귀 금속음
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

  // UI 선택 합성음
  private synthUiSelect() {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square'; // 사각파 (명확하고 짧은 소리)
    osc.frequency.setValueAtTime(440, t); // 시작 주파수
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.05); // 짧게 상승

    gain.gain.setValueAtTime(vol * 0.3, t); // 시작 볼륨
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // 빠르게 감소

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start(t);
    osc.stop(t + 0.15); // 짧은 지속 시간
  }
}

export const soundService = new SoundService();