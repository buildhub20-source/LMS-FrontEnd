import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';
import { PERMISSIONS } from '../../../constants/permissions';

const ITEMS = [
  { label: 'Dashboard', to: ROUTES.ADMIN_ANALYTICS, permission: PERMISSIONS.ANALYTICS_READ },
  { label: 'Users', to: ROUTES.USERS, permission: PERMISSIONS.USER_READ, group: 'People' },
  { label: 'Roles', to: ROUTES.ROLES, permission: PERMISSIONS.ROLE_READ, group: 'People' },
  {
    label: 'Invitations',
    to: ROUTES.INVITATIONS,
    permission: PERMISSIONS.INVITATION_READ,
    group: 'People',
  },
  {
    label: 'Enrollments',
    to: ROUTES.ENROLLMENTS,
    permission: PERMISSIONS.ENROLLMENT_READ,
    group: 'Learning',
  },
  {
    label: 'Organization',
    to: ROUTES.ORGANIZATION,
    permission: PERMISSIONS.TENANT_READ,
    group: 'Settings',
  },
  {
    label: 'Subscription',
    to: ROUTES.SUBSCRIPTION,
    permission: PERMISSIONS.SUBSCRIPTION_READ,
    group: 'Settings',
  },
];

export const AdminNavigation = () => <MainNavigation items={ITEMS} />;

export default AdminNavigation;
