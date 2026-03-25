export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: 'ONLINE' | 'OFFLINE';
  bio?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: {
    user: User;
  }[];
  messages: Message[];
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO';
  senderId: string;
  sender: User;
  conversationId: string;
  createdAt: string;
  isRevoked?: boolean;
  revokedAt?: string;
  // File fields
  fileUrl?: string;
  filePublicId?: string;
  fileSize?: string;
  fileDuration?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

