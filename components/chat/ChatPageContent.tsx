'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  chatKeys,
  useChatConversations,
  useChatMessages,
  useSendChatMessage,
  useStartChatConversation,
} from '@/lib/hooks/use-chat';
import { useSocket } from '@/lib/socket/socket-context';
import type { ChatConversation, ChatMessage } from '@/lib/service/chat.service';
import { cn } from '@/lib/utils';

function formatTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ChatConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
        Chưa có hội thoại nào.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {conversations.map((conversation) => {
        const preview = conversation.messages?.[0];
        const title = conversation.venue?.name ?? 'Cơ sở';
        const subtitle = preview?.content ?? 'Bắt đầu trò chuyện';

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/60',
              activeId === conversation.id && 'bg-primary/5',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-foreground">{title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTime(conversation.lastMessageAt)}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}

function MessagePanel({ conversationId }: { conversationId: string }) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useChatMessages(conversationId);
  const sendMessage = useSendChatMessage(conversationId);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join-conversation', conversationId);

    const handleMessage = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) return;
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (current) => {
        if (current?.some((row) => row.id === message.id)) return current;
        return [...(current ?? []), message];
      });
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.emit('leave-conversation', conversationId);
      socket.off('chat:message', handleMessage);
    };
  }, [conversationId, queryClient, socket]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    await sendMessage.mutateAsync(content);
    setDraft('');
  };

  if (isLoading) {
    return <Skeleton className="h-full min-h-96 w-full rounded-lg" />;
  }

  return (
    <div className="flex h-full min-h-96 flex-col rounded-xl border border-border/70 bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hãy gửi tin nhắn đầu tiên.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-2xl bg-muted/50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{message.sender.name}</span>
                <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border/70 p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={sendMessage.isPending}
        />
        <Button type="submit" disabled={sendMessage.isPending || !draft.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get('conversation') ?? undefined;
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    initialConversationId,
  );

  const { data: conversations = [], isLoading } = useChatConversations();

  useEffect(() => {
    if (!activeConversationId && conversations[0]?.id) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find((row) => row.id === activeConversationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tin nhắn</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hội thoại với cơ sở</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/venues">Tìm cơ sở để chat</Link>
        </Button>
      </div>

      <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversationId}
            />
          )}
        </div>

        <div>
          {activeConversationId ? (
            <div className="space-y-3">
              {activeConversation?.venue ? (
                <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
                  <p className="font-medium text-foreground">{activeConversation.venue.name}</p>
                  <p className="text-sm text-muted-foreground">{activeConversation.venue.location}</p>
                </div>
              ) : null}
              <MessagePanel conversationId={activeConversationId} />
            </div>
          ) : (
            <div className="flex h-full min-h-96 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-muted-foreground">
              Chọn một hội thoại hoặc mở chat từ trang cơ sở.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VenueChatButton({ venueId }: { venueId: string }) {
  const router = useRouter();
  const startConversation = useStartChatConversation();

  const handleClick = async () => {
    const conversation = await startConversation.mutateAsync(venueId);
    router.push(`/messages?conversation=${conversation.id}`);
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={startConversation.isPending}>
      <MessageCircle className="size-4" />
      Nhắn tin cơ sở
    </Button>
  );
}
