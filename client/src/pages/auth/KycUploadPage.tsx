import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { Button } from '@/components/atoms/Button';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { SRI_LANKAN_BANKS } from '@pola/shared';
import { ShieldCheck, ArrowRight, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export const KycUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [nicNumber, setNicNumber] = useState('');
  const [bankName, setBankName] = useState(SRI_LANKAN_BANKS[0].name);
  const [branchName, setBranchName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const [nicFrontFiles, setNicFrontFiles] = useState<File[]>([]);
  const [nicBackFiles, setNicBackFiles] = useState<File[]>([]);
  const [selfieFiles, setSelfieFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nicNumber.trim()) {
      toast.error('Please enter your National Identity Card (NIC) number');
      return;
    }

    if (nicFrontFiles.length === 0) {
      toast.error('Please upload your NIC Front photo');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('nicNumber', nicNumber.trim());
      formData.append('bankName', bankName);
      formData.append('branchName', branchName);
      formData.append('accountNumber', accountNumber);
      formData.append('accountHolderName', accountHolderName);

      if (nicFrontFiles[0]) formData.append('nicFront', nicFrontFiles[0]);
      if (nicBackFiles[0]) formData.append('nicBack', nicBackFiles[0]);
      if (selfieFiles[0]) formData.append('selfie', selfieFiles[0]);

      const res: any = await AuthService.uploadKyc(formData);
      if (res.success) {
        updateUser({ kycStatus: 'pending' });
        toast.success('KYC verification submitted! Under review by Pola Admin.');

        if (user?.role?.startsWith('farmer')) {
          navigate('/farmer/dashboard');
        } else if (user?.role?.startsWith('delivery')) {
          navigate('/delivery/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit KYC verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Identity & Bank Setup"
      subtitle="Verify your credentials to activate your payout wallet"
      footerContent={
        <button
          onClick={() => {
            const role = user?.role || '';
            if (role.startsWith('farmer')) navigate('/farmer/dashboard');
            else if (role.startsWith('delivery')) navigate('/delivery/dashboard');
            else if (role.startsWith('admin')) navigate('/admin/dashboard');
            else navigate('/');
          }}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          I will add this later
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Sri Lankan NIC Number"
          placeholder="e.g. 199423402123 or 942340212V"
          value={nicNumber}
          onChange={(e) => setNicNumber(e.target.value)}
          required
        />

        <div className="space-y-4 pt-2">
          <FileDropzone
            label="1. NIC Front Image"
            files={nicFrontFiles}
            onFilesChange={setNicFrontFiles}
            maxFiles={1}
          />

          <FileDropzone
            label="2. NIC Back Image"
            files={nicBackFiles}
            onFilesChange={setNicBackFiles}
            maxFiles={1}
          />

          <FileDropzone
            label="3. Face Selfie with NIC"
            files={selfieFiles}
            onFilesChange={setSelfieFiles}
            maxFiles={1}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>LankaPay Bank Settlement Details</span>
          </div>

          <Select
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          >
            {SRI_LANKAN_BANKS.map((b) => (
              <option key={b.code} value={b.name}>
                {b.name} ({b.code})
              </option>
            ))}
          </Select>

          <Input
            label="Branch Name"
            placeholder="e.g. Dambulla Branch"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />

          <Input
            label="Account Number"
            placeholder="e.g. 1029384756"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          <Input
            label="Account Holder Name"
            placeholder="e.g. D. I. Perera"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-4"
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          Submit for Verification
        </Button>
      </form>
    </AuthLayout>
  );
};
