import { api } from './api';

export const WalletService = {
  getMyWallet: async () => {
    return api.get('/wallet/me');
  },

  getLedgerEntries: async (page: number = 1, limit: number = 20, type?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.append('type', type);
    return api.get(`/wallet/ledger?${params.toString()}`);
  },

  /** Alias for getLedgerEntries */
  getLedger: async (page: number = 1, limit: number = 20, type?: string) => {
    return WalletService.getLedgerEntries(page, limit, type);
  },

  /** Request a bank withdrawal (calls /wallet/withdraw) */
  requestBankWithdrawal: async (amountLkr: number) => {
    return api.post('/wallet/withdraw', { amountLkr });
  },

  /** Alias for requestBankWithdrawal */
  requestWithdrawal: async (amountLkr: number) => {
    return WalletService.requestBankWithdrawal(amountLkr);
  },

  /** Initiate PayPal top-up — returns approveUrl */
  initiatePayPalTopUp: async (amountLkr: number) => {
    return api.post('/wallet/topup', { amountLkr });
  },

  /** Capture and confirm PayPal top-up after user approves */
  confirmPayPalTopUp: async (paypalOrderId: string, amountLkr: number) => {
    return api.post('/wallet/topup/confirm', { paypalOrderId, amountLkr });
  },
};
