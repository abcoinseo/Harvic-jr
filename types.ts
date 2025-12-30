
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export enum OSState {
  BOOTING = 'BOOTING',
  LOGIN = 'LOGIN',
  DESKTOP = 'DESKTOP'
}

export enum AppID {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  VIDEO_CALL = 'VIDEO_CALL',
  SETTINGS = 'SETTINGS',
  TERMINAL = 'TERMINAL'
}

export interface AudioProcessingRefs {
  nextStartTime: number;
  sources: Set<AudioBufferSourceNode>;
}
