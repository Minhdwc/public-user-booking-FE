'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  chatService,
  type ChatConversation,
  type ChatMessage,
} from '@/lib/service/chat.service';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

export function useChatConversations(enabled = true) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: () => chatService.listConversations(),
    enabled,
  });
}

export function useChatMessages(conversationId?: string) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useStartChatConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => chatService.startConversation(venueId),
    onSuccess: (conversation: ChatConversation) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
      return conversation;
    },
  });
}

export function useSendChatMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => chatService.sendMessage(conversationId, content),
    onSuccess: (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (current) => [
        ...(current ?? []),
        message,
      ]);
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
}
