'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  MessageSquareMore,
  Search,
  Send,
  Stethoscope,
  User as UserIcon,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, PageIntro, SectionCard } from '@/components/ui/workspace';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiService } from '@/services/api.service';
import { getStoredAccessToken, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

type ChatUser = {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role?: string;
  type?: 'PROVIDER' | 'SEEKER';
};

type Conversation = {
  id: string;
  otherParticipant?: ChatUser;
  participants?: ChatUser[];
  unreadCount: number;
  latestMessage: {
    content?: string | null;
    sentAt: string;
    senderId: string;
    receiverId: string;
  };
};

type ChatMessage = {
  id: number;
  conversationId: string;
  content?: string | null;
  sentAt: string;
  senderId: string;
  receiverId: string;
  sender?: ChatUser;
  receiver?: ChatUser;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '');
const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_URL || API_ORIGIN).replace(/\/$/, '');

function resolveMediaUrl(url?: string | null) {
  if (!url) return '';
  const normalized = url.trim();
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }
  const origin =
    normalized.startsWith('/uploads') || normalized.startsWith('/images') ? MEDIA_ORIGIN : API_ORIGIN;
  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}

function getInitials(name?: string) {
  return (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatTime(value?: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function Avatar({ user }: { user?: ChatUser }) {
  const avatar = resolveMediaUrl(user?.avatar);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : getInitials(user?.name)}
    </div>
  );
}

export default function ChatPage() {
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const tokenReady = Boolean(accessToken || getStoredAccessToken());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useQuery<Conversation[]>({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const response = await apiService.get('/chat/conversations');
      return response.data?.data || [];
    },
    enabled: tokenReady,
    refetchInterval: 10000,
  });

  const usersQuery = useQuery<ChatUser[]>({
    queryKey: ['chat-users', search],
    queryFn: async () => {
      const response = await apiService.get('/users/search', {
        params: { q: search, limit: 12 },
      });
      const data = response.data?.data || response.data || [];
      return data
        .filter((item: any) => item.id !== user?.id)
        .map((item: any) => ({
          id: item.id,
          name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || 'Unknown user',
          email: item.email,
          avatar: item.avatar,
          role: item.role,
          type: item.type,
        }));
    },
    enabled: tokenReady && search.trim().length > 1,
  });

  const messagesQuery = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', activeConversationId],
    queryFn: async () => {
      const response = await apiService.get(`/chat/conversations/${activeConversationId}/messages`);
      return response.data?.data || [];
    },
    enabled: tokenReady && Boolean(activeConversationId),
    refetchInterval: activeConversationId ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const receiverId =
        activeUser?.id ||
        conversationsQuery.data?.find((conversation) => conversation.id === activeConversationId)?.otherParticipant?.id;

      const response = await apiService.post('/chat/messages', {
        receiverId,
        conversationId: activeConversationId,
        content: draft,
      });
      return response.data;
    },
    onSuccess: (message: any) => {
      setDraft('');
      setActiveConversationId(message.conversationId);
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', message.conversationId] });
    },
  });

  const conversations = conversationsQuery.data || [];
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const activePeer = activeUser || activeConversation?.otherParticipant;
  const messages = messagesQuery.data || [];

  const visibleUsers = useMemo(() => {
    const existingIds = new Set(conversations.map((conversation) => conversation.otherParticipant?.id).filter(Boolean));
    return (usersQuery.data || []).filter((item) => !existingIds.has(item.id));
  }, [conversations, usersQuery.data]);

  useEffect(() => {
    if (!activeConversationId && conversations[0]) {
      setActiveConversationId(conversations[0].id);
      setActiveUser(null);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, activeConversationId]);

  const canSend = draft.trim().length > 0 && Boolean(activePeer?.id) && !sendMutation.isPending;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <PageIntro
            eyebrow="Conversations"
            title="Chat & support"
            description="Talk with doctors and patients from the admin dashboard using the same message records the app uses."
            meta={
              <Badge variant="muted">
                <MessageSquareMore className="h-3.5 w-3.5" />
                Connected
              </Badge>
            }
          />

          <SectionCard title="Support chat" description="Select an existing conversation or search for a doctor or patient to start one.">
            <div className="grid min-h-[620px] gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] lg:grid-cols-[340px_1fr]">
              <aside className="border-b border-[var(--border)] lg:border-b-0 lg:border-r">
                <div className="border-b border-[var(--border)] p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search doctors or patients..."
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="h-[560px] overflow-y-auto">
                  {search.trim().length > 1 ? (
                    <div className="p-2">
                      {usersQuery.isLoading ? (
                        <div className="space-y-2 p-2">
                          <Skeleton className="h-14 w-full" />
                          <Skeleton className="h-14 w-full" />
                        </div>
                      ) : visibleUsers.length ? (
                        visibleUsers.map((item) => (
                          <button
                            key={item.id}
                            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left hover:bg-[var(--surface-muted)]"
                            onClick={() => {
                              setActiveUser(item);
                              setActiveConversationId(null);
                              setSearch('');
                            }}
                          >
                            <Avatar user={item} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                              <p className="truncate text-xs text-[var(--text-muted)]">{item.email}</p>
                            </div>
                            {item.type === 'PROVIDER' ? <Stethoscope className="h-4 w-4 text-sky-500" /> : <UserIcon className="h-4 w-4 text-emerald-500" />}
                          </button>
                        ))
                      ) : (
                        <div className="p-5 text-sm text-[var(--text-muted)]">No matching users found.</div>
                      )}
                    </div>
                  ) : conversationsQuery.isLoading ? (
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : conversations.length ? (
                    <div className="p-2">
                      {conversations.map((conversation) => {
                        const peer = conversation.otherParticipant;
                        const active = conversation.id === activeConversationId;
                        return (
                          <button
                            key={conversation.id}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition-colors',
                              active ? 'bg-[var(--surface-muted)]' : 'hover:bg-[var(--surface-muted)]',
                            )}
                            onClick={() => {
                              setActiveConversationId(conversation.id);
                              setActiveUser(null);
                            }}
                          >
                            <Avatar user={peer} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{peer?.name || 'Conversation'}</p>
                                <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{formatTime(conversation.latestMessage.sentAt)}</span>
                              </div>
                              <p className="truncate text-xs text-[var(--text-muted)]">
                                {conversation.latestMessage.content || 'Attachment'}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 ? (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState title="No conversations yet" description="Search for a doctor or patient to start the first chat." icon={MessageSquareMore} />
                  )}
                </div>
              </aside>

              <main className="flex min-h-[620px] flex-col">
                {activePeer ? (
                  <>
                    <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                      <Avatar user={activePeer} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-primary)]">{activePeer.name}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">
                          {activePeer.type === 'PROVIDER' ? 'Doctor' : 'Patient'} {activePeer.email ? `- ${activePeer.email}` : ''}
                        </p>
                      </div>
                    </header>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--surface-subtle)] p-5">
                      {activeConversationId && messagesQuery.isLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-2/3" />
                          <Skeleton className="ml-auto h-12 w-1/2" />
                          <Skeleton className="h-12 w-3/5" />
                        </div>
                      ) : messages.length ? (
                        messages.map((message) => {
                          const mine = message.senderId === user?.id;
                          return (
                            <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                              <div
                                className={cn(
                                  'max-w-[78%] rounded-[var(--radius-lg)] px-4 py-2 shadow-[var(--shadow-xs)]',
                                  mine
                                    ? 'bg-sky-600 text-white'
                                    : 'border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                                )}
                              >
                                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                <p className={cn('mt-1 text-[10px]', mine ? 'text-sky-100' : 'text-[var(--text-muted)]')}>
                                  {formatTime(message.sentAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center text-sm text-[var(--text-muted)]">
                            <MessageSquareMore className="mx-auto mb-3 h-8 w-8" />
                            Start the conversation with {activePeer.name}.
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form
                      className="border-t border-[var(--border)] p-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (canSend) sendMutation.mutate();
                      }}
                    >
                      {sendMutation.isError ? (
                        <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-400/10 dark:text-rose-200">
                          <AlertCircle className="h-4 w-4" />
                          Failed to send message.
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          placeholder="Write a message..."
                          rows={2}
                          className="min-h-11 flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20"
                        />
                        <Button type="submit" size="icon" loading={sendMutation.isPending} disabled={!canSend} aria-label="Send message">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-6">
                    <EmptyState title="Choose a conversation" description="Pick an existing thread or search for a doctor or patient to start chatting." icon={MessageSquareMore} />
                  </div>
                )}
              </main>
            </div>
          </SectionCard>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
