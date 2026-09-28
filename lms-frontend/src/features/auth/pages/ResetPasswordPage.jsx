import { LockKeyhole } from 'lucide-react';
import ResetPasswordForm from '../components/ResetPasswordForm';

export const ResetPasswordPage = () => (
  <>
    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4"
      style={{ background: 'var(--accent)' }}>
      <LockKeyhole className="h-5 w-5" style={{ color: 'var(--primary)' }} />
    </div>
    <h3 className="text-lg font-bold text-center mb-1" style={{ color: 'var(--foreground)' }}>
      Choose a new password
    </h3>
    <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
      Create a strong password to secure your account
    </p>
    <ResetPasswordForm />
  </>
);

export default ResetPasswordPage;
