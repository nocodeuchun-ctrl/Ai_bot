
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
