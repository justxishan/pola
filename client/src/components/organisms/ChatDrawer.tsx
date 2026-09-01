import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ChatService } from '@/services/chat.service';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import {
  X,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  User,
  Truck,
  Sprout,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  orderNumber?: string;
  counterpartName?: string;
  counterpartRole?: 'customer' | 'farmer' | 'driver' | 'admin' | string;
  counterpartPhone?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  counterpartName,
  counterpartRole = 'Stakeholder',
  counterpartPhone,
}) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
  const [isBuyerInitiated, setIsBuyerInitiated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFarmer = user?.role?.startsWith('farmer') || user?.role === 'collector';
  const isFarmerBlocked = isFarmer && !isBuyerInitiated;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !orderId) return;

    if (token) {
      ChatService.connectSocket(token);
    }

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const res: any = await ChatService.getOrderConversation(orderId);
        if (res.success && res.data) {
          setMessages(res.data.messages || []);
          setIsBuyerInitiated(!!res.data.conversation?.buyerInitiated);
          ChatService.markAsReadSocket(orderId);
        }
      } catch (err: any) {
        console.error('Failed to load chat conversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();

    // Join real-time room
    ChatService.joinConversation(orderId);

    // Listen for incoming messages
    ChatService.onMessageReceived(({ orderId: msgOrderId, message }) => {
      if (msgOrderId === orderId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setIsBuyerInitiated(true);
        ChatService.markAsReadSocket(orderId);
      }
    });

    // Listen for typing events
    ChatService.onTypingStatus(({ orderId: typingOrderId, isTyping, userId: typingUserId }) => {
      if (typingOrderId === orderId && typingUserId !== user?._id) {
        setIsCounterpartTyping(isTyping);
      }
    });

    return () => {
      ChatService.leaveConversation(orderId);
      ChatService.removeListeners();
    };
  }, [isOpen, orderId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCounterpartTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!orderId) return;

    ChatService.sendTyping(orderId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      ChatService.sendTyping(orderId, false);
    }, 1500);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !orderId || isSending || isFarmerBlocked) return;

    const textToSend = inputText.trim();
    setInputText('');
    ChatService.sendTyping(orderId, false);

    try {
      setIsSending(true);
      await ChatService.sendMessageSocket(orderId, textToSend, (res: any) => {
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        if (res?.success && res?.data?.message) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === res.data.message._id)) return prev;
            return [...prev, res.data.message];
          });
          setIsBuyerInitiated(true);
        }
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const getRoleIcon = (role?: string) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('farmer') || r.includes('collector')) return <Sprout className="w-3.5 h-3.5 text-lime-600" />;
    if (r.includes('driver') || r.includes('delivery')) return <Truck className="w-3.5 h-3.5 text-yellow-600" />;
    if (r.includes('admin')) return <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />;
    return <User className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {counterpartName || 'Order Coordination'}
                  </h3>
                  <Badge variant="outline" size="sm" className="shrink-0 flex items-center gap-1">
                    {getRoleIcon(counterpartRole)}
                    <span className="capitalize">{counterpartRole}</span>
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Order {orderNumber || (orderId ? `#${orderId.substring(orderId.length - 6).toUpperCase()}` : '')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {counterpartPhone && (
                <a
                  href={`tel:${counterpartPhone}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title={`Call ${counterpartPhone}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Direct Live Coordination
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Coordinate delivery timing, gate access, crop packing, or produce queries in real-time.
                </p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                const senderName = isMine ? 'You' : msg.senderId?.fullName || 'Stakeholder';
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[10px] text-slate-400 px-1">
                      {!isMine && `${senderName} • `}{timeStr}
                    </span>
                    <div
                      className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                        isMine
                          ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs font-normal border border-slate-200/50 dark:border-slate-700/50'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {isCounterpartTyping && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{counterpartName || 'Counterpart'} is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Farmer Gating Banner if buyer hasn't messaged yet */}
          {isFarmerBlocked && (
            <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 border-t border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2 px-4">
              <span className="shrink-0">ℹ️</span>
              <span>The buyer must send the first message on this order before farmers can reply.</span>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isFarmerBlocked ? 'Waiting for buyer to start conversation...' : 'Type your message...'}
              value={inputText}
              onChange={handleInputChange}
              disabled={isFarmerBlocked}
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
        </div>
      </div>
    </div>
  );
};
