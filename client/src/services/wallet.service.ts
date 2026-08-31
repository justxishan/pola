import { api } from './api';

export const WalletService = {
  getMyWallet: async () => {
    return api.get('/wallet/me');
  },

  getLedgerEntries: async (page: number = 1, limit: number = 20) => {
    return api.get(`/wallet/ledger?page=${page}&limit=${limit}`);
  },

  requestBankWithdrawal: async (amountLkr: number, bankDetails: any) => {
    return api.post('/wallet/withdraw', { amountLkr, bankDetails });
  },

  topUpViaPayPal: async (amountUSD: number) => {
    return api.post('/wallet/topup/paypal', { amountUSD });
  },
};
