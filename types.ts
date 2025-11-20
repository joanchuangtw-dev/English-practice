export interface Scenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  systemInstruction: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface AudioVisualizerProps {
  isListening: boolean;
  volume: number;
}