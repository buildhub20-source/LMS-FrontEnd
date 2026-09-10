import { z } from 'zod';
import { ROLES } from '../../../constants/roles';

/** Matches the backend CreateInvitationRequest contract exactly. */
export const invitationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(255),
  role: z.nativeEnum(ROLES, { message: 'Select a role for the invitation' }),
});

/** Normalizes form values into the POST /invitations payload. */
export const toInvitationPayload = ({ name, email, role }) => ({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  role,
});

export default invitationSchema;
