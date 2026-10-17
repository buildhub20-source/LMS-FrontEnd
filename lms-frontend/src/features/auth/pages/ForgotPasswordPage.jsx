import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { ROUTES } from '../../../constants/routes';

export const ForgotPasswordPage = () => (
  <>
    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4"
      style={{ background: 'var(--accent)' }}>
      <Mail className="h-5 w-5" style={{ color: 'var(--primary)' }} />
    </div>
    <h3 className="text-lg font-bold text-center mb-1" style={{ color: 'var(--foreground)' }}>
      Reset your password
    </h3>
    <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
      Enter your email and we'll send you a reset link
    </p>
    <ForgotPasswordForm />
    <p className="mt-5 text-center">
      <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: 'var(--primary)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </p>
  </>
);

export default ForgotPasswordPage;
