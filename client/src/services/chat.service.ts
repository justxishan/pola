import { io, Socket } from 'socket.io-client';
import { api } from './api';

class ChatServiceClass {
  private socket: Socket | null = null;
  private currentOrderId: string | null = null;

  /**
   * REST: Get all conversations for current user
   */
  async getMyConversations() {
    return api.get('/chat/conversations');
  }

  /**
   * REST: Get conversation & message history for an order
   */
  async getOrderConversation(orderId: string) {
    return api.get(`/chat/conversations/order/${orderId}`);
  }

  /**
   * REST: Send message via HTTP fallback
   */
  async sendMessageRest(orderId: string, text: string, replyToMessageId?: string) {
    return api.post(`/chat/conversations/order/${orderId}/messages`, { text, replyToMessageId });
  }

  /**
   * REST: Soft-delete message
   */
  async deleteMessageRest(orderId: string, messageId: string) {
    return api.delete(`/chat/conversations/order/${orderId}/messages/${messageId}`);
  }

  /**
   * REST: Mark conversation messages as read
   */
  async markAsReadRest(orderId: string) {
    return api.patch(`/chat/conversations/order/${orderId}/read`);
  }

  /**
   * Initialize or return Socket.IO connection
   */
  connectSocket(token: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '')
      : 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    return this.socket;
  }

  /**
   * Join an order conversation room
   */
  joinConversation(orderId: string, onJoined?: (data: any) => void) {
    if (!this.socket) return;
    this.currentOrderId = orderId;
    this.socket.emit('conversation:join', { orderId }, (res: any) => {
      if (res?.success && onJoined) {
        onJoined(res.data);
      }
    });
  }

  /**
   * Leave current order conversation room
   */
  leaveConversation(orderId: string) {
    if (!this.socket) return;
    this.socket.emit('conversation:leave', { orderId });
    if (this.currentOrderId === orderId) {
      this.currentOrderId = null;
    }
  }

  /**
   * Emit real-time message through socket
   */
  sendMessageSocket(orderId: string, text: string, replyToMessageId?: string, callback?: (res: any) => void) {
    // If 3rd argument is function (legacy compatibility)
    let replyId = replyToMessageId;
    let cb = callback;
    if (typeof replyToMessageId === 'function') {
      cb = replyToMessageId;
      replyId = undefined;
    }

    if (!this.socket || !this.socket.connected) {
      // Fallback to REST
      return this.sendMessageRest(orderId, text, replyId).then((res) => {
        if (cb) cb({ success: true, data: res.data });
      });
    }

    this.socket.emit('message:send', { orderId, text, replyToMessageId: replyId }, (res: any) => {
      if (cb) cb(res);
    });
  }

  /**
   * Soft-delete message via socket or REST
   */
  deleteMessageSocket(orderId: string, messageId: string, callback?: (res: any) => void) {
    if (!this.socket || !this.socket.connected) {
      return this.deleteMessageRest(orderId, messageId).then((res) => {
        if (callback) callback({ success: true, data: res.data });
      });
    }

    this.socket.emit('message:delete', { orderId, messageId }, (res: any) => {
      if (callback) callback(res);
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(orderId: string, isTyping: boolean) {
    if (!this.socket) return;
    this.socket.emit(isTyping ? 'typing:start' : 'typing:stop', { orderId });
  }

  /**
   * Mark messages as read via socket
   */
  markAsReadSocket(orderId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message:read', { orderId });
    } else {
      this.markAsReadRest(orderId);
    }
  }

  /**
   * Subscribe to incoming new messages
   */
  onMessageReceived(handler: (data: { orderId: string; message: any }) => void) {
    if (!this.socket) return;
    this.socket.on('message:new', handler);
  }

  /**
   * Subscribe to read receipts
   */
  onConversationRead(handler: (data: { orderId: string; userId: string }) => void) {
    if (!this.socket) return;
    this.socket.on('conversation:read', handler);
  }

  /**
   * Subscribe to typing status
   */
  onTypingStatus(handler: (data: { orderId: string; userId: string; isTyping: boolean }) => void) {
    if (!this.socket) return;
    this.socket.on('typing:status', handler);
  }

  /**
   * Subscribe to real-time notification alerts
   */
  onNotificationReceived(handler: (data: { notification: any }) => void) {
    if (!this.socket) return;
    this.socket.on('notification:new', handler);
  }

  /**
   * Subscribe to message deletions
   */
  onMessageDeleted(handler: (data: { orderId: string; messageId: string }) => void) {
    if (!this.socket) return;
    this.socket.on('message:deleted', handler);
  }

  /**
   * Return socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Clean up listeners
   */
  removeListeners() {
    if (!this.socket) return;
    this.socket.off('message:new');
    this.socket.off('conversation:read');
    this.socket.off('typing:status');
    this.socket.off('message:deleted');
  }

  /**
   * Disconnect socket on logout
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentOrderId = null;
    }
  }
}

export const ChatService = new ChatServiceClass();
