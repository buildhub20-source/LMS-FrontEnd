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
import useAuth from '../features/auth/hooks/useAuth';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const RoleBasedLayout = () => {
  const { user } = useAuth();
  const userRoles = user?.roles?.map((r) => (typeof r === 'string' ? r : r.name)) ?? [];
  if (userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN)) {
    return <AdminLayout />;
  }
  if (userRoles.includes(ROLES.INSTRUCTOR)) {
    return <InstructorLayout />;
  }
  return <StudentLayout />;
};

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
const StudentListPage = lazy(() => import('../features/students/pages/StudentListPage'));
const StudentCategoryPage = lazy(() => import('../features/students/pages/StudentCategoryPage'));
const EditStudentPage = lazy(() => import('../features/students/pages/EditStudentPage'));
const StudentDetailsPage = lazy(() => import('../features/students/pages/StudentDetailsPage'));
const InstructorListPage = lazy(() => import('../features/instructors/pages/InstructorListPage'));
const AddInstructorPage = lazy(() => import('../features/instructors/pages/AddInstructorPage'));
const EditInstructorPage = lazy(() => import('../features/instructors/pages/EditInstructorPage'));
const InstructorDetailsPage = lazy(
  () => import('../features/instructors/pages/InstructorDetailsPage'),
);
const BatchListPage = lazy(() => import('../features/batches/pages/BatchListPage'));
const AddStudentPage = lazy(() => import('../features/students/pages/AddStudentPage'));
const AdminAnalyticsPage = lazy(() => import('../features/analytics/pages/AdminAnalyticsPage'));
const AdminCourseListPage = lazy(() => import('../features/courses/pages/AdminCourseListPage'));
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
const StudentAssessmentTakingPage = lazy(() => import('../features/assessments/pages/StudentAssessmentTakingPage'));
const CreateAssessmentPage = lazy(
  () => import('../features/assessments/pages/CreateAssessmentPage'),
);
const AssessmentResultPage = lazy(
  () => import('../features/assessments/pages/AssessmentResultPage'),
);
const AdminAssessmentListPage = lazy(
  () => import('../features/assessments/pages/AdminAssessmentListPage'),
);
const AdminCreateAssessmentPage = lazy(
  () => import('../features/assessments/pages/AdminCreateAssessmentPage'),
);
const AdminAssessmentDetailsPage = lazy(
  () => import('../features/assessments/pages/AdminAssessmentDetailsPage'),
);
const AdminEditAssessmentPage = lazy(
  () => import('../features/assessments/pages/AdminEditAssessmentPage'),
);
const GradingWorkflowPage = lazy(
  () => import('../features/assessments/pages/GradingWorkflowPage'),
);
const RubricManagerPage = lazy(
  () => import('../features/assessments/pages/RubricManagerPage'),
);
const CertificateListPage = lazy(
  () => import('../features/certificates/pages/CertificateListPage'),
);
const AuditLogsPage = lazy(() => import('../features/audit/pages/AuditLogsPage'));
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
              { path: ROUTES.BATCHES, element: suspend(<BatchListPage />) },
              { path: ROUTES.STUDENTS, element: suspend(<StudentListPage />) },
              { path: ROUTES.STUDENT_CREATE, element: suspend(<AddStudentPage />) },
              { path: ROUTES.STUDENT_CATEGORIES, element: suspend(<StudentCategoryPage />) },
              { path: ROUTES.STUDENT_EDIT(), element: suspend(<EditStudentPage />) },
              { path: ROUTES.STUDENT_DETAILS(), element: suspend(<StudentDetailsPage />) },
              { path: ROUTES.INSTRUCTORS, element: suspend(<InstructorListPage />) },
              { path: ROUTES.INSTRUCTOR_CREATE, element: suspend(<AddInstructorPage />) },
              { path: ROUTES.INSTRUCTOR_EDIT(), element: suspend(<EditInstructorPage />) },
              { path: ROUTES.INSTRUCTOR_DETAILS(), element: suspend(<InstructorDetailsPage />) },
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
              { path: ROUTES.AUDIT_LOGS, element: suspend(<AuditLogsPage />) },
              { path: ROUTES.ADMIN_COURSES, element: suspend(<AdminCourseListPage />) },
              { path: ROUTES.ADMIN_COURSE_DETAILS(), element: suspend(<CourseDetailsPage />) },
              { path: ROUTES.ADMIN_COURSE_EDIT(), element: suspend(<EditCoursePage />) },
              {
                element: <PermissionGuard required={[PERMISSIONS.ASSESSMENT_VIEW]} />,
                children: [
                  { path: ROUTES.ADMIN_ASSESSMENTS, element: suspend(<AdminAssessmentListPage />) },
                  {
                    path: ROUTES.ADMIN_ASSESSMENT_CREATE,
                    element: suspend(<AdminCreateAssessmentPage />),
                  },
                  {
                    path: ROUTES.ADMIN_ASSESSMENT_DETAILS(),
                    element: suspend(<AdminAssessmentDetailsPage />),
                  },
                  {
                    path: ROUTES.ADMIN_ASSESSMENT_EDIT(),
                    element: suspend(<AdminEditAssessmentPage />),
                  },
                  {
                    path: ROUTES.ADMIN_GRADING,
                    element: suspend(<GradingWorkflowPage />),
                  },
                  {
                    path: ROUTES.ADMIN_RUBRICS,
                    element: suspend(<RubricManagerPage />),
                  },
                ],
              },
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
              {
                path: ROUTES.INSTRUCTOR_ASSESSMENT_DETAILS(),
                element: suspend(<AdminAssessmentDetailsPage />),
              },
              {
                path: ROUTES.INSTRUCTOR_ASSESSMENT_EDIT(),
                element: suspend(<AdminEditAssessmentPage />),
              },
              {
                path: ROUTES.INSTRUCTOR_GRADING,
                element: suspend(<GradingWorkflowPage />),
              },
              {
                path: ROUTES.INSTRUCTOR_RUBRICS,
                element: suspend(<RubricManagerPage />),
              },
            ],
          },
        ],
      },

      // Standalone Full-Window Lockdown Exam & Proctoring Environment
      {
        path: ROUTES.ASSESSMENT_ATTEMPT(),
        element: suspend(<StudentAssessmentTakingPage />),
      },

      {
        path: '/learn',
        element: <RoleBasedLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.MY_COURSES} replace /> },
          { path: ROUTES.MY_COURSES, element: suspend(<MyCoursesPage />) },
          { path: ROUTES.MY_ENROLLMENTS, element: suspend(<MyEnrollmentsPage />) },
          { path: ROUTES.STUDENT_PROGRESS, element: suspend(<StudentProgressPage />) },
          { path: ROUTES.STUDENT_ASSESSMENTS, element: suspend(<AssessmentListPage />) },
          { path: ROUTES.CERTIFICATES, element: suspend(<CertificateListPage />) },
          { path: ROUTES.CERTIFICATE_DETAILS(), element: suspend(<CertificateDetailsPage />) },
          { path: ROUTES.ASSESSMENT_RESULT(), element: suspend(<AssessmentResultPage />) },
          { path: ROUTES.LEARNING(), element: suspend(<LearningPage />) },
          { path: ROUTES.LESSON(), element: suspend(<LessonPage />) },
          { path: ROUTES.COURSE_PLAYER(), element: suspend(<CoursePlayerPage />) },
        ],
      },

      {
        element: <RoleBasedLayout />,
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
