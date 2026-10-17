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

export const StudentProgressPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'progress'],
    queryFn: () => analyticsService.studentProgress(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer title="My progress" subtitle="Your learning activity at a glance.">
      <div style={gridStyle}>
        <StatsCard
          label="Courses in progress"
          value={data?.inProgressCount ?? 0}
          isLoading={isLoading}
        />
        <StatsCard label="Completed" value={data?.completedCount ?? 0} isLoading={isLoading} />
        <StatsCard label="Certificates" value={data?.certificateCount ?? 0} isLoading={isLoading} />
        <StatsCard label="Hours learned" value={data?.hoursLearned ?? 0} isLoading={isLoading} />
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

export default StudentProgressPage;
