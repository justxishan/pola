import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { Spinner } from '@/components/atoms/Spinner';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { ChatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems, getDeliveryNavItems } from '@/lib/navItems';
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Check,
  CheckCheck,
  Trash2,
  Copy,
  CornerUpLeft,
  X,
  Phone,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sprout,
  User,
  ShoppingBag,
  Sparkles,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { items: cartItems, openCart } = useCartStore();
  const { t } = useTranslation();

  const isFarmer = user?.role?.startsWith('farmer') || user?.role === 'collector';
  const isDelivery = user?.role?.startsWith('delivery');
  const isCustomer = !isFarmer && !isDelivery && !user?.role?.startsWith('admin');

  const navItems = isFarmer
    ? getFarmerNavItems(t)
    : isDelivery
    ? getDeliveryNavItems(t)
    : [];

  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeOrderInfo, setActiveOrderInfo] = useState<any | null>(null);

  // Input & message interaction state
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial connect & load conversations
  useEffect(() => {
    if (token) {
      ChatService.connectSocket(token);
    }
    fetchConversations();
  }, [token]);

  // 2. Check for URL searchParam `orderId`
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId && urlOrderId !== selectedOrderId) {
      handleSelectOrder(urlOrderId);
    }
  }, [searchParams]);

  const fetchConversations = async () => {
    try {
      setIsLoadingList(true);
      const res: any = await ChatService.getMyConversations();
      if (res.success && res.data) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // 3. Handle selecting a conversation
  const handleSelectOrder = async (orderId: string) => {
    if (selectedOrderId === orderId && activeConversation) return;

    // Leave previous room if any
    if (selectedOrderId) {
      ChatService.leaveConversation(selectedOrderId);
    }

    setSelectedOrderId(orderId);
    setSearchParams({ orderId });
    setReplyingToMessage(null);
    setInputText('');

    try {
      setIsLoadingMessages(true);
      const res: any = await ChatService.getOrderConversation(orderId);
      if (res.success && res.data) {
        setActiveConversation(res.data.conversation);
        setMessages(res.data.messages || []);
        setActiveOrderInfo(res.data.order);

        // Join real-time socket room
        ChatService.joinConversation(orderId);
        ChatService.markAsReadSocket(orderId);

        // Clear local unread badge count for this order
        setConversations((prev) =>
          prev.map((c) => {
            const cOrderId = c.orderId?._id || c.orderId;
            if (cOrderId === orderId && c.unreadCounts && user?._id) {
              const updatedCounts = { ...c.unreadCounts, [user._id]: 0 };
              return { ...c, unreadCounts: updatedCounts };
            }
            return c;
          })
        );
      }
    } catch (err: any) {
      toast.error('Failed to load conversation messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 4. Socket Listeners for Real-time messaging
  useEffect(() => {
    // New message handler
    ChatService.onMessageReceived(({ orderId, message }) => {
      if (orderId === selectedOrderId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        ChatService.markAsReadSocket(orderId);
      }

      // Update conversations list preview
      setConversations((prev) =>
        prev.map((c) => {
          const cOrderId = c.orderId?._id || c.orderId;
          if (cOrderId === orderId) {
            const isCurrentActive = orderId === selectedOrderId;
            const currentUnread = c.unreadCounts?.[user?._id || ''] || 0;
            return {
              ...c,
              lastMessagePreview: message.text,
              lastMessageAt: message.createdAt || new Date(),
              unreadCounts: {
                ...c.unreadCounts,
                [user?._id || '']: isCurrentActive ? 0 : currentUnread + 1,
              },
            };
          }
          return c;
        })
      );
    });

    // Message deleted handler
    ChatService.onMessageDeleted(({ orderId, messageId }) => {
      if (orderId === selectedOrderId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: 'This message was deleted' }
              : m
          )
        );
      }
    });

    // Typing status handler
    ChatService.onTypingStatus(({ orderId, userId, isTyping }) => {
      if (orderId === selectedOrderId && userId !== user?._id) {
        setIsCounterpartTyping(isTyping);
      }
    });

    // Conversation read handler
    ChatService.onConversationRead(({ orderId, userId }) => {
      if (orderId === selectedOrderId && userId !== user?._id) {
        setMessages((prev) =>
          prev.map((m) => {
            const readByList = m.readBy || [];
            if (!readByList.some((id: any) => (id._id || id) === userId)) {
              return { ...m, readBy: [...readByList, userId] };
            }
            return m;
          })
        );
      }
    });

    return () => {
      ChatService.removeListeners();
    };
  }, [selectedOrderId, user?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCounterpartTyping]);

  // Typing event emission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!selectedOrderId) return;

    ChatService.sendTyping(selectedOrderId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      ChatService.sendTyping(selectedOrderId, false);
    }, 1500);
  };

  // Farmer policy check
  const isFarmerBlocked =
    isFarmer &&
    activeConversation &&
    !activeConversation.buyerInitiated;

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedOrderId || isSending || isFarmerBlocked) return;

    const textToSend = inputText.trim();
    const replyId = replyingToMessage?._id;

    setInputText('');
    setReplyingToMessage(null);
    ChatService.sendTyping(selectedOrderId, false);

    try {
      setIsSending(true);
      await ChatService.sendMessageSocket(selectedOrderId, textToSend, replyId, (res: any) => {
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        if (res?.success && res?.data?.message) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === res.data.message._id)) return prev;
            return [...prev, res.data.message];
          });
          if (activeConversation) {
            setActiveConversation({ ...activeConversation, buyerInitiated: true });
          }
        }
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedOrderId) return;
    try {
      await ChatService.deleteMessageSocket(selectedOrderId, messageId, (res: any) => {
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: 'This message was deleted' }
              : m
          )
        );
        toast.success('Message deleted');
      });
    } catch (err: any) {
      toast.error('Failed to delete message');
    }
  };

  // Copy message text
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    const orderNum = (c.orderId?.orderNumber || '').toLowerCase();
    const lastMsg = (c.lastMessagePreview || '').toLowerCase();
    const participantName = (c.participants || [])
      .map((p: any) => (p.userId?.fullName || '').toLowerCase())
      .join(' ');
    return orderNum.includes(term) || lastMsg.includes(term) || participantName.includes(term);
  });

  // Determine counterpart info for the active conversation
  const getCounterpartInfo = () => {
    if (!activeConversation) return null;
    const counterparts = (activeConversation.participants || []).filter(
      (p: any) => (p.userId?._id || p.userId) !== user?._id
    );
    const primary = counterparts[0]?.userId;
    return {
      name: primary?.fullName || 'Order Stakeholder',
      role: counterparts[0]?.role || 'customer',
      avatarUrl: primary?.avatarUrl,
      phone: primary?.phone,
    };
  };

  const counterpart = getCounterpartInfo();

  const getRoleBadge = (role?: string) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('farmer') || r.includes('collector')) {
      return (
        <Badge variant="outline" size="sm" className="flex items-center gap-1 border-lime-300 text-lime-600 dark:text-lime-400">
          <Sprout className="w-3 h-3" />
          <span>Farmer</span>
        </Badge>
      );
    }
    if (r.includes('driver') || r.includes('delivery')) {
      return (
        <Badge variant="outline" size="sm" className="flex items-center gap-1 border-yellow-300 text-yellow-600 dark:text-yellow-400">
          <Truck className="w-3 h-3" />
          <span>Courier</span>
        </Badge>
      );
    }
    if (r.includes('admin')) {
      return (
        <Badge variant="outline" size="sm" className="flex items-center gap-1 border-teal-300 text-teal-600 dark:text-teal-400">
          <ShieldCheck className="w-3 h-3" />
          <span>Admin</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" size="sm" className="flex items-center gap-1 border-emerald-300 text-emerald-600 dark:text-emerald-400">
        <User className="w-3 h-3" />
        <span>Customer</span>
      </Badge>
    );
  };

  // ── Inner chat UI (layout-agnostic) ─────────────────────────────────
  const chatUI = (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* Main Two-Pane Chat Container */}
      <div className="h-[calc(100vh-140px)] min-h-[580px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* ── LEFT PANE: Conversation List (35% on desktop) ────────────── */}
          <div
            className={`w-full md:w-[35%] lg:w-[30%] border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${
              selectedOrderId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* List Header & Search */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Messages & Chats
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                    {conversations.length}
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order #, person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Conversations Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoadingList ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <Spinner size="md" />
                  <span className="text-xs">Loading conversations...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No conversations found
                  </p>
                  <p className="text-[11px]">
                    Messages sent on orders will appear here automatically.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const orderId = conv.orderId?._id || conv.orderId;
                  const orderNum = conv.orderId?.orderNumber || 'Order #' + orderId?.slice(-6);
                  const isSelected = selectedOrderId === orderId;

                  // Determine counterpart for this conversation in list
                  const otherParticipants = (conv.participants || []).filter(
                    (p: any) => (p.userId?._id || p.userId) !== user?._id
                  );
                  const otherUser = otherParticipants[0]?.userId;
                  const otherName = otherUser?.fullName || otherUser?.name || 'Customer';
                  const otherRole = otherParticipants[0]?.role || 'customer';

                  const unreadCount = conv.unreadCounts?.[user?._id || ''] || 0;
                  const timeFormatted = conv.lastMessageAt
                    ? new Date(conv.lastMessageAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';

                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectOrder(orderId)}
                      className={`p-3.5 sm:p-4 transition-all cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800/90 border-l-4 border-l-emerald-600 shadow-xs'
                          : 'hover:bg-white/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Avatar
                        src={otherUser?.avatarUrl}
                        name={otherName}
                        size="md"
                        className="shrink-0 mt-0.5"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {otherName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {timeFormatted}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                            {orderNum}
                          </span>
                          {getRoleBadge(otherRole)}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-snug">
                          {conv.lastMessagePreview || 'Order conversation started'}
                        </p>
                      </div>

                      {/* Unread count badge */}
                      {unreadCount > 0 && (
                        <div className="shrink-0 self-center">
                          <span className="min-w-[18px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black font-mono flex items-center justify-center">
                            {unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── RIGHT PANE: Active Chat Thread (65% on desktop) ─────────── */}
          <div
            className={`w-full md:w-[65%] lg:w-[70%] flex-col justify-between bg-white dark:bg-slate-900 ${
              selectedOrderId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {!selectedOrderId ? (
              /* Empty Placeholder when no conversation is selected */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Choose a thread on the left to coordinate order dispatch, harvest deliveries, or customer requests in real-time.
                </p>
              </div>
            ) : (
              /* Active Conversation Stream */
              <>
                {/* Thread Top Bar */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="md:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <Avatar
                      src={counterpart?.avatarUrl}
                      name={counterpart?.name}
                      size="sm"
                      isOnline
                      className="shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {counterpart?.name}
                        </h3>
                        {getRoleBadge(counterpart?.role)}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Order #{activeOrderInfo?.orderNumber || selectedOrderId.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Phone call shortcut */}
                    {counterpart?.phone && (
                      <a
                        href={`tel:${counterpart.phone}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title={`Call ${counterpart.phone}`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {/* View Order Detail Link */}
                    <button
                      onClick={() => {
                        if (isFarmer) navigate('/farmer/orders');
                        else if (isDelivery) navigate('/delivery/active-trip');
                        else navigate(`/orders/${selectedOrderId}/track`);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="View Order Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                  {isLoadingMessages ? (
                    <div className="py-24 flex justify-center">
                      <Spinner size="lg" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <Sparkles className="w-7 h-7 text-emerald-500" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Conversation Started
                      </p>
                      <p className="text-[11px] max-w-xs">
                        Coordinate delivery, gate access, or quality checks directly in real-time.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isMine =
                        msg.senderId?._id === user?._id || msg.senderId === user?._id;
                      const senderName = isMine
                        ? 'You'
                        : msg.senderId?.fullName || counterpart?.name || 'Counterpart';
                      const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      // Read receipts: if counterpart is in msg.readBy
                      const counterpartId = counterpart ? (activeConversation?.participants || []).find((p: any) => (p.userId?._id || p.userId) !== user?._id)?.userId?._id : null;
                      const isReadByCounterpart = (msg.readBy || []).some(
                        (id: any) => (id._id || id) === counterpartId
                      );

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col group ${
                            isMine ? 'items-end' : 'items-start'
                          } space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                            {!isMine && <span className="font-semibold">{senderName}</span>}
                            <span>{timeStr}</span>
                          </div>

                          {/* Message Bubble + Action Trigger Container */}
                          <div className={`relative max-w-[85%] sm:max-w-[75%] flex items-center gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* The Bubble */}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                                isMine
                                  ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs font-normal border border-slate-200/70 dark:border-slate-700/60'
                              } ${msg.isDeleted ? 'italic opacity-60' : ''}`}
                            >
                              {/* Quoted reply banner if present */}
                              {msg.replyToMessageId && !msg.isDeleted && (
                                <div
                                  className={`mb-2 p-2 rounded-xl text-[11px] border-l-2 flex flex-col ${
                                    isMine
                                      ? 'bg-emerald-700/60 border-emerald-300 text-emerald-100'
                                      : 'bg-slate-100 dark:bg-slate-700/60 border-emerald-500 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  <span className="font-bold text-[10px]">
                                    {msg.replyToMessageId.senderId?.fullName || 'Stakeholder'}
                                  </span>
                                  <span className="line-clamp-1 opacity-90">
                                    {msg.replyToMessageId.text}
                                  </span>
                                </div>
                              )}

                              {/* Message text */}
                              <p>{msg.text}</p>

                              {/* Read Receipts for my sent messages */}
                              {isMine && !msg.isDeleted && (
                                <div className="flex justify-end mt-1">
                                  {isReadByCounterpart ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-200 inline" title="Read" />
                                  ) : (
                                    <Check className="w-3 h-3 text-emerald-200 inline" title="Sent" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Hover Actions Menu */}
                            {!msg.isDeleted && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 shrink-0">
                                <button
                                  onClick={() => setReplyingToMessage(msg)}
                                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                  title="Reply"
                                >
                                  <CornerUpLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleCopyMessage(msg.text)}
                                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                  title="Copy text"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {isMine && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg._id)}
                                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 hover:text-red-600 cursor-pointer"
                                    title="Delete message"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing Indicator */}
                  {isCounterpartTyping && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{counterpart?.name || 'Counterpart'} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Farmer Policy Gating Banner */}
                {isFarmerBlocked && (
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 border-t border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 px-4">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>The customer must send the first message on this order before you can reply.</span>
                  </div>
                )}

                {/* Quoted Replying Preview Bar */}
                {replyingToMessage && (
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CornerUpLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Replying to {replyingToMessage.senderId?.fullName || 'User'}:
                        </span>
                        <span className="ml-1.5 text-slate-500 truncate inline-block max-w-sm">
                          "{replyingToMessage.text}"
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Thread Input Footer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={
                      isFarmerBlocked
                        ? 'Waiting for buyer to start conversation...'
                        : replyingToMessage
                        ? 'Type your reply...'
                        : 'Type your message...'
                    }
                    value={inputText}
                    onChange={handleInputChange}
                    disabled={isFarmerBlocked}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending || isFarmerBlocked}
                    className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
                    title={isFarmerBlocked ? 'Waiting for buyer to initiate' : 'Send Message'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Conditional layout shell ─────────────────────────────────────────
  if (isCustomer) {
    return (
      <MarketplaceLayout
        searchQuery=""
        onSearchChange={() => {}}
        cartItemCount={cartItems.length}
        onOpenCart={openCart}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        user={user}
      >
        {chatUI}
      </MarketplaceLayout>
    );
  }

  return (
    <DashboardLayout
      portalTitle={isFarmer ? (t.farmerOpsCenter || 'Farmer Portal') : 'Pola Portal'}
      portalRole={user?.role || 'User'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath={isFarmer ? '/farmer/messages' : '/messages'}
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => {
        logout();
        navigate('/');
      }}
    >
      {chatUI}
    </DashboardLayout>
  );
};
