import { api } from './api';

interface CreateTicketPayload {
  subject: string;
  category: string;
  priority?: string;
  messageText: string;
  relatedOrderId?: string;
}

interface TicketResponse {
  success: boolean;
  message: string;
  data: {
    ticket: {
      _id: string;
      ticketNumber: string;
      status: string;
    };
  };
}

export const TicketService = {
  createTicket: async (payload: CreateTicketPayload): Promise<TicketResponse> => {
    const response = await api.post<TicketResponse>('/tickets', payload);
    return response.data;
  },
};
