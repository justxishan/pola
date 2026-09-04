import { api } from './api';

export interface BankAccountPayload {
  bankName: string;
  bankCode?: string;
  branchName: string;
  branchCode?: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault?: boolean;
}

export interface BankAccountItem {
  _id: string;
  bankName: string;
  bankCode?: string;
  branchName: string;
  branchCode?: string;
  accountNumber: string;
  accountNumberMasked: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt?: string;
}

export const BankAccountService = {
  getMyBankAccounts: async () => {
    return api.get('/bank-accounts');
  },

  addBankAccount: async (data: BankAccountPayload) => {
    return api.post('/bank-accounts', data);
  },

  updateBankAccount: async (id: string, data: Partial<BankAccountPayload>) => {
    return api.patch(`/bank-accounts/${id}`, data);
  },

  deleteBankAccount: async (id: string) => {
    return api.delete(`/bank-accounts/${id}`);
  },

  setDefaultBankAccount: async (id: string) => {
    return api.patch(`/bank-accounts/${id}/set-default`);
  },
};
