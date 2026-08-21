import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  MailPlus,
  ClipboardList,
  Building2,
  CreditCard,
  KeyRound,
} from 'lucide-react';
import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';
import { PERMISSIONS } from '../../../constants/permissions';

const ITEMS = [
  {
    label: 'Dashboard',
    to: ROUTES.ADMIN_ANALYTICS,
    permission: PERMISSIONS.ANALYTICS_READ,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Users',
    to: ROUTES.USERS,
    permission: PERMISSIONS.USER_READ,
    group: 'People',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Roles',
    to: ROUTES.ROLES,
    permission: PERMISSIONS.ROLE_READ,
    group: 'People',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    label: 'Permissions',
    to: ROUTES.PERMISSIONS,
    permission: PERMISSIONS.ROLE_READ,
    group: 'People',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    label: 'Invitations',
    to: ROUTES.INVITATIONS,
    permission: PERMISSIONS.INVITATION_READ,
    group: 'People',
    icon: <MailPlus className="h-5 w-5" />,
  },
  {
    label: 'Enrollments',
    to: ROUTES.ENROLLMENTS,
    permission: PERMISSIONS.ENROLLMENT_READ,
    group: 'Learning',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Organization',
    to: ROUTES.ORGANIZATION,
    permission: PERMISSIONS.TENANT_READ,
    group: 'Settings',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: 'Subscription',
    to: ROUTES.SUBSCRIPTION,
    permission: PERMISSIONS.SUBSCRIPTION_READ,
    group: 'Settings',
    icon: <CreditCard className="h-5 w-5" />,
  },
];

export const AdminNavigation = () => <MainNavigation items={ITEMS} />;

export default AdminNavigation;
