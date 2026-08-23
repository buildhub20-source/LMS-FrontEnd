import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { PERMISSIONS } from '../constants/permissions';
import AuthLayout from '../layouts/AuthLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import AdminLayout from '../layouts/AdminLayout';
import InstructorLayout from '../layouts/InstructorLayout';
import StudentLayout from '../layouts/StudentLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import GuestRoute from '../guards/GuestRoute';
import RoleGuard from '../guards/RoleGuard';
import PermissionGuard from '../guards/PermissionGuard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

// Auth screens load eagerly - they are the entry point for every unauthenticated visit.
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import AcceptInvitationPage from '../features/auth/pages/AcceptInvitationPage';
import SetPasswordPage from '../features/auth/pages/SetPasswordPage';
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage';

// Everything else is code-split per route.
const UserListPage = lazy(() => import('../features/users/pages/UserListPage'));
const UserDetailsPage = lazy(() => import('../features/users/pages/UserDetailsPage'));
const CreateUserPage = lazy(() => import('../features/users/pages/CreateUserPage'));
const EditUserPage = lazy(() => import('../features/users/pages/EditUserPage'));
const RoleListPage = lazy(() => import('../features/roles/pages/RoleListPage'));
const RoleDetailsPage = lazy(() => import('../features/roles/pages/RoleDetailsPage'));
const PermissionsPage = lazy(() => import('../features/roles/pages/PermissionsPage'));
const InvitationListPage = lazy(() => import('../features/invitations/pages/InvitationListPage'));
const AdminAnalyticsPage = lazy(() => import('../features/analytics/pages/AdminAnalyticsPage'));
const InstructorAnalyticsPage = lazy(
  () => import('../features/analytics/pages/InstructorAnalyticsPage'),
);
const StudentProgressPage = lazy(() => import('../features/analytics/pages/StudentProgressPage'));
const OrganizationPage = lazy(() => import('../features/tenants/pages/OrganizationPage'));
const OrganizationSettingsPage = lazy(
  () => import('../features/tenants/pages/OrganizationSettingsPage'),
);
const SubscriptionPage = lazy(() => import('../features/subscriptions/pages/SubscriptionPage'));
const PlansPage = lazy(() => import('../features/subscriptions/pages/PlansPage'));
const BillingPage = lazy(() => import('../features/subscriptions/pages/BillingPage'));
const CourseListPage = lazy(() => import('../features/courses/pages/CourseListPage'));
const CourseDetailsPage = lazy(() => import('../features/courses/pages/CourseDetailsPage'));
const CreateCoursePage = lazy(() => import('../features/courses/pages/CreateCoursePage'));
const EditCoursePage = lazy(() => import('../features/courses/pages/EditCoursePage'));
const MyCoursesPage = lazy(() => import('../features/courses/pages/MyCoursesPage'));
const EnrollmentListPage = lazy(() => import('../features/enrollment/pages/EnrollmentListPage'));
const MyEnrollmentsPage = lazy(() => import('../features/enrollment/pages/MyEnrollmentsPage'));
const EnrollmentDetailsPage = lazy(
  () => import('../features/enrollment/pages/EnrollmentDetailsPage'),
);
const LearningPage = lazy(() => import('../features/learning/pages/LearningPage'));
const LessonPage = lazy(() => import('../features/learning/pages/LessonPage'));
const CoursePlayerPage = lazy(() => import('../features/learning/pages/CoursePlayerPage'));
const AssessmentListPage = lazy(() => import('../features/assessments/pages/AssessmentListPage'));
const AssessmentPage = lazy(() => import('../features/assessments/pages/AssessmentPage'));
const CreateAssessmentPage = lazy(
  () => import('../features/assessments/pages/CreateAssessmentPage'),
);
const AssessmentResultPage = lazy(
  () => import('../features/assessments/pages/AssessmentResultPage'),
);
const CertificateListPage = lazy(
  () => import('../features/certificates/pages/CertificateListPage'),
);
const CertificateDetailsPage = lazy(
  () => import('../features/certificates/pages/CertificateDetailsPage'),
);
const NotificationPage = lazy(() => import('../features/notifications/pages/NotificationPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const SecurityPage = lazy(() => import('../features/profile/pages/SecurityPage'));

const suspend = (element) => <Suspense fallback={<Spinner fullPage />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
          { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
          { path: ROUTES.ACCEPT_INVITATION, element: <AcceptInvitationPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to={ROUTES.ADMIN_ANALYTICS} replace /> },
              { path: ROUTES.ADMIN_ANALYTICS, element: suspend(<AdminAnalyticsPage />) },
              {
                element: <PermissionGuard required={[PERMISSIONS.USER_READ]} />,
                children: [
                  { path: ROUTES.USERS, element: suspend(<UserListPage />) },
                  { path: ROUTES.USER_CREATE, element: suspend(<CreateUserPage />) },
                  { path: ROUTES.USER_DETAILS(), element: suspend(<UserDetailsPage />) },
                  { path: ROUTES.USER_EDIT(), element: suspend(<EditUserPage />) },
                ],
              },
              { path: ROUTES.ROLES, element: suspend(<RoleListPage />) },
              { path: ROUTES.ROLE_DETAILS(), element: suspend(<RoleDetailsPage />) },
              { path: ROUTES.PERMISSIONS, element: suspend(<PermissionsPage />) },
              { path: ROUTES.INVITATIONS, element: suspend(<InvitationListPage />) },
              { path: ROUTES.ENROLLMENTS, element: suspend(<EnrollmentListPage />) },
              { path: ROUTES.ENROLLMENT_DETAILS(), element: suspend(<EnrollmentDetailsPage />) },
              { path: ROUTES.ORGANIZATION, element: suspend(<OrganizationPage />) },
              {
                path: ROUTES.ORGANIZATION_SETTINGS,
                element: suspend(<OrganizationSettingsPage />),
              },
              { path: ROUTES.SUBSCRIPTION, element: suspend(<SubscriptionPage />) },
              { path: ROUTES.PLANS, element: suspend(<PlansPage />) },
              { path: ROUTES.BILLING, element: suspend(<BillingPage />) },
            ],
          },
        ],
      },

      {
        path: '/instructor',
        element: <RoleGuard allowedRoles={[ROLES.INSTRUCTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]} />,
        children: [
          {
            element: <InstructorLayout />,
            children: [
              { index: true, element: <Navigate to={ROUTES.COURSES} replace /> },
              { path: ROUTES.INSTRUCTOR_ANALYTICS, element: suspend(<InstructorAnalyticsPage />) },
              { path: ROUTES.COURSES, element: suspend(<CourseListPage />) },
              { path: ROUTES.COURSE_CREATE, element: suspend(<CreateCoursePage />) },
              { path: ROUTES.COURSE_DETAILS(), element: suspend(<CourseDetailsPage />) },
              { path: ROUTES.COURSE_EDIT(), element: suspend(<EditCoursePage />) },
              { path: ROUTES.ASSESSMENTS, element: suspend(<AssessmentListPage />) },
              { path: ROUTES.ASSESSMENT_CREATE, element: suspend(<CreateAssessmentPage />) },
            ],
          },
        ],
      },

      {
        path: '/learn',
        element: <StudentLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.MY_COURSES} replace /> },
          { path: ROUTES.MY_COURSES, element: suspend(<MyCoursesPage />) },
          { path: ROUTES.MY_ENROLLMENTS, element: suspend(<MyEnrollmentsPage />) },
          { path: ROUTES.STUDENT_PROGRESS, element: suspend(<StudentProgressPage />) },
          { path: ROUTES.CERTIFICATES, element: suspend(<CertificateListPage />) },
          { path: ROUTES.CERTIFICATE_DETAILS(), element: suspend(<CertificateDetailsPage />) },
          { path: ROUTES.ASSESSMENT_ATTEMPT(), element: suspend(<AssessmentPage />) },
          { path: ROUTES.ASSESSMENT_RESULT(), element: suspend(<AssessmentResultPage />) },
          { path: ROUTES.LEARNING(), element: suspend(<LearningPage />) },
          { path: ROUTES.LESSON(), element: suspend(<LessonPage />) },
          { path: ROUTES.COURSE_PLAYER(), element: suspend(<CoursePlayerPage />) },
        ],
      },

      {
        element: <StudentLayout />,
        children: [
          { path: ROUTES.NOTIFICATIONS, element: suspend(<NotificationPage />) },
          { path: ROUTES.PROFILE, element: suspend(<ProfilePage />) },
          { path: ROUTES.SECURITY, element: suspend(<SecurityPage />) },
        ],
      },

      // First-time password change for invited users (mustChangePassword flow)
      // Accessible while authenticated — ProtectedRoute redirects here when mustChangePassword=true
      {
        path: ROUTES.SET_PASSWORD,
        element: <SetPasswordPage />,
      },
    ],
  },

  {
    element: <ErrorLayout />,
    children: [
      { path: ROUTES.ROOT, element: <Navigate to={ROUTES.LOGIN} replace /> },
      { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
      {
        path: '*',
        element: (
          <EmptyState title="404 - Page not found" description="That page does not exist." />
        ),
      },
    ],
  },
]);

export default router;
