import { useState } from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { ROLES, ROLE_LABELS } from '../../../constants/roles';
import { invitationSchema, toInvitationPayload } from '../validation/invitationSchemas';

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export const InviteUserForm = ({ onSubmit, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = invitationSchema.safeParse({ name, email, role });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the invitation details');
      return;
    }
    setError(null);
    onSubmit?.(toInvitationPayload(parsed.data));
    setName('');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="u-flex u-gap-3 u-wrap u-items-center">
      <Input
        label="Name"
        value={name}
        error={error}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label="Email"
        type="email"
        value={email}
        error={error}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Select
        label="Role"
        options={ROLE_OPTIONS}
        placeholder=""
        value={role}
        onChange={(event) => setRole(event.target.value)}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Send invitation
      </Button>
    </form>
  );
};

export default InviteUserForm;
