import apiClient from '@/lib/api/client';

export type ChatUser = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
};

export type ChatVenue = {
  id: string;
  name: string;
  location: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatUser;
};

export type ChatConversation = {
  id: string;
  userId: string;
  venueId: string;
  lastMessageAt: string;
  createdAt: string;
  user?: ChatUser;
  venue?: ChatVenue;
  messages?: ChatMessage[];
};

export const chatService = {
  listConversations: () => apiClient.get('/chat/conversations') as Promise<ChatConversation[]>,

  startConversation: (venueId: string) =>
    apiClient.post('/chat/conversations', { venueId }) as Promise<ChatConversation>,

  getMessages: (conversationId: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`) as Promise<ChatMessage[]>,

  sendMessage: (conversationId: string, content: string) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, {
      content,
    }) as Promise<ChatMessage>,
};
