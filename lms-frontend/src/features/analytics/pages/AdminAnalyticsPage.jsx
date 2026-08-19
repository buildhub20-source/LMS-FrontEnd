import { useQuery } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import StatsCard from '../components/StatsCard';
import EnrollmentChart from '../components/EnrollmentChart';
import CompletionChart from '../components/CompletionChart';
import ErrorState from '../../../components/common/ErrorState';
import analyticsService from '../services/analyticsService';
import { QUERY_KEYS } from '../../../constants/appConstants';

const gridStyle = {
  display: 'grid',
  gap: 'var(--space-4)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
};

export const AdminAnalyticsPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'admin'],
    queryFn: () => analyticsService.adminOverview(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer
      title="Organisation analytics"
      subtitle="Adoption and completion across every course."
    >
      <div style={gridStyle}>
        <StatsCard
          label="Active learners"
          value={data?.activeLearners ?? 0}
          isLoading={isLoading}
        />
        <StatsCard
          label="Courses published"
          value={data?.publishedCourses ?? 0}
          isLoading={isLoading}
        />
        <StatsCard label="Enrollments" value={data?.totalEnrollments ?? 0} isLoading={isLoading} />
        <StatsCard
          label="Completion rate"
          value={data?.completionRate ?? 0}
          isLoading={isLoading}
        />
      </div>
      <div className="u-flex u-gap-4 u-wrap u-mt-4">
        <div className="u-grow">
          <EnrollmentChart data={data?.enrollmentTrend ?? []} />
        </div>
        <div className="u-grow">
          <CompletionChart data={data?.completionByCourse ?? []} />
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminAnalyticsPage;
