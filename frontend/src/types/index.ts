export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
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
  senderId: string;
  sender: User;
  conversationId: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
