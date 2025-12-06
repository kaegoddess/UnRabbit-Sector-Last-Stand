import { SOUND_SETTINGS } from '../config/gameConfig';

// [수정] 사운드 에셋 설정의 타입을 새로운 구조({ src: string, volume: number })에 맞게 정의합니다.
type SoundAssetConfig = { [key: string]: { src: string, volume: number } };

class SoundService {
  private context: AudioContext | null = null;
  private buffers: { [key: string]: AudioBuffer } = {};
  private initialized: boolean = false;
  private dbName = 'UndeadSectorAudioDB';
  private storeName = 'audioFiles';
  // [수정] 로컬 파일 환경('file://')에서는 fetch()나 IndexedDB 같은 기능이 제한되므로, 이를 확인하는 플래그입니다.
  private isLocalFile: boolean = window.location.protocol === 'file:';
  // [수정] SOUND_SETTINGS.assets를 SoundService 내부에서 사용하기 위해 별도 프로퍼티로 저장하고, 타입을 명시합니다.
  public SOUND_ASSETS_CONFIG: SoundAssetConfig = SOUND_SETTINGS.assets;

  constructor() {
    // 생성자에서는 아무것도 하지 않음
  }

  // 사용자 상호작용(클릭 등) 후 호출되어야 함
  public async init() {
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

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
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

  public async loadCustomSoundsFromStorage(): Promise<string[]> {
    this.ensureContext();
    if (!this.context) return [];
    
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

  private async loadAssets() {
    if (!this.context) return;

    const assets = this.SOUND_ASSETS_CONFIG;
    
    // [수정] `Object.entries`는 이제 `[key, { src, volume }]` 형태의 배열을 반환합니다.
    const loadPromises = Object.entries(assets).map(async ([key, config]) => {
      if (this.buffers[key]) return;

      if (config && config.src && config.src.length > 0) {
        if (this.isLocalFile) {
          console.warn(`로컬 파일 환경 감지: 사운드 '${key}' (${config.src}) fetch를 건너뛰고 내장 합성음을 사용합니다.`);
          return;
        }

        try {
          const response = await fetch(config.src);
          if (!response.ok) {
              throw new Error(`Sound file not found: ${config.src}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers[key] = audioBuffer;
        } catch (e) {
          console.warn(`Failed to load sound '${key}' from '${config.src}'. Using synthesizer fallback.`, e);
        }
      }
    });

    await Promise.all(loadPromises);
  }

  public async loadUserSound(key: string, file: File): Promise<boolean> {
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

  public play(soundName: keyof SoundAssetConfig) {
    if (!this.context) return;
    if (this.context.state === 'suspended') this.context.resume();

    // [수정] 설정에서 해당 사운드의 개별 볼륨 값을 가져옵니다. 없으면 기본값 1.0을 사용합니다.
    const soundConfig = this.SOUND_ASSETS_CONFIG[soundName];
    const volume = soundConfig ? soundConfig.volume : 1.0;

    // 1. 파일이 로드되어 있으면 파일 재생 (개별 볼륨 적용)
    if (this.buffers[soundName]) {
      this.playBuffer(this.buffers[soundName], volume);
      return;
    }

    // 2. 파일이 없으면 합성음 재생 (개별 볼륨 적용)
    // [수정] 모든 synth... 함수에 볼륨 값을 전달합니다.
    switch (soundName) {
      case 'shoot_pistol': this.synthShootPistol(volume); break;
      case 'shoot_mp5': this.synthShootMP5(volume); break;
      case 'shoot_rifle': this.synthShootRifle(volume); break;
      case 'shoot_shotgun': this.synthShootShotgun(volume); break;
      case 'impact': this.synthImpact(volume); break;
      case 'footstep': this.synthFootstep(volume); break;
      case 'reload': this.synthReload(volume); break;
      case 'playerHit': this.synthPlayerHit(volume); break;
      case 'itemPickup': this.synthItemPickup(volume); break;
      case 'uiSelect': this.synthUiSelect(volume); break;
      case 'quickReloadSuccess': this.synthQuickReloadSuccess(volume); break;
      case 'quickReloadFail': this.synthQuickReloadFail(volume); break;
      case 'dodge': this.synthDodge(volume); break;
      case 'dodgeLand': this.synthDodgeLand(volume); break;
      case 'sprintCollide': this.synthSprintCollide(volume); break;
      case 'staminaEmpty': this.synthStaminaEmpty(volume); break;
      case 'shellLoad': this.synthShellLoad(volume); break;
      case 'dryFire': this.synthDryFire(volume); break;
    }
  }

  // [수정] playBuffer 메서드가 개별 볼륨 값을 인자로 받도록 변경합니다.
  private playBuffer(buffer: AudioBuffer, volume: number) {
    if (!this.context) return;
    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = this.context.createGain();
      // [수정] 최종 볼륨 = 마스터 볼륨 * 개별 볼륨
      gainNode.gain.value = SOUND_SETTINGS.masterVolume * volume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      source.start(0);
    } catch (e) {
      console.error("Error playing buffer:", e);
    }
  }

  // --- 신디사이저 (합성음) 로직 ---
  // [수정] 모든 synth... 메서드가 볼륨 값을 인자로 받도록 수정합니다.

  private synthDryFire(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume * 0.8; // 내부 볼륨 조절 유지

    const osc = this.context.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  private synthShellLoad(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

    const osc = this.context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.05);

    const bufferSize = this.context.sampleRate * 0.05;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    noise.connect(noiseGain);
    noiseGain.connect(this.context.destination);
    noise.start(t);
  }

  private synthStaminaEmpty(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume * 0.4;

    const osc = this.context.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  private synthDodge(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume * 0.5;
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

  private synthDodgeLand(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume * 0.7;

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

  private synthSprintCollide(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume * 0.6;
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

  private synthQuickReloadSuccess(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

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

  private synthQuickReloadFail(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

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

  private synthUiSelect(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);

    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  private synthItemPickup(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.2);

    gain.gain.setValueAtTime(SOUND_SETTINGS.masterVolume * volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  private synthShootPistol(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;
    
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
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
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

  private synthShootMP5(volume: number) {
      if (!this.context) return;
      const t = this.context.currentTime;
      const vol = SOUND_SETTINGS.masterVolume * volume * 0.7;

      const osc = this.context.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
      const oscGain = this.context.createGain();
      oscGain.gain.setValueAtTime(vol * 0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(oscGain);
      oscGain.connect(this.context.destination);
      osc.start(t);
      osc.stop(t + 0.1);
      
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.context.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.context.createGain();
      noiseGain.gain.setValueAtTime(vol * 0.6, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      const filter = this.context.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, t);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.context.destination);
      noise.start(t);
  }

  private synthShootRifle(volume: number) {
      if (!this.context) return;
      const t = this.context.currentTime;
      const vol = SOUND_SETTINGS.masterVolume * volume * 1.2;

      const osc = this.context.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
      const oscGain = this.context.createGain();
      oscGain.gain.setValueAtTime(vol, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.connect(oscGain);
      oscGain.connect(this.context.destination);
      osc.start(t);
      osc.stop(t + 0.3);

      const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.3, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.context.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.context.createGain();
      noiseGain.gain.setValueAtTime(vol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5000, t);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.context.destination);
      noise.start(t);
  }

  private synthShootShotgun(volume: number) {
      if (!this.context) return;
      const t = this.context.currentTime;
      const vol = SOUND_SETTINGS.masterVolume * volume * 1.5;

      const osc = this.context.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
      const oscGain = this.context.createGain();
      oscGain.gain.setValueAtTime(vol * 0.8, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      osc.connect(oscGain);
      oscGain.connect(this.context.destination);
      osc.start(t);
      osc.stop(t + 0.4);
      
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.4, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.context.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.context.createGain();
      noiseGain.gain.setValueAtTime(vol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, t);
      filter.Q.value = 0.5;
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.context.destination);
      noise.start(t);
  }

  private synthImpact(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

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
    gain.gain.setValueAtTime(vol * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    noise.start(t);
  }

  private synthPlayerHit(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

    const osc = this.context.createOscillator();
    const oscGain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.15);
    
    oscGain.gain.setValueAtTime(vol * 0.8, t);
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
    
    noiseGain.gain.setValueAtTime(vol * 0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(noiseGain);
    noiseGain.connect(this.context.destination);
    noise.start(t);
  }

  private synthFootstep(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

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
    gain.gain.setValueAtTime(vol * 0.5, t); 
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    noise.start(t);
  }

  private synthReload(volume: number) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const vol = SOUND_SETTINGS.masterVolume * volume;

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