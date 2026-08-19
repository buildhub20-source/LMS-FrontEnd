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

export const InstructorAnalyticsPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'instructor'],
    queryFn: () => analyticsService.instructorOverview(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer title="Teaching analytics" subtitle="How your courses are performing.">
      <div style={gridStyle}>
        <StatsCard label="My courses" value={data?.courseCount ?? 0} isLoading={isLoading} />
        <StatsCard label="Learners" value={data?.learnerCount ?? 0} isLoading={isLoading} />
        <StatsCard
          label="Avg. completion"
          value={data?.averageCompletion ?? 0}
          isLoading={isLoading}
        />
        <StatsCard label="Avg. score" value={data?.averageScore ?? 0} isLoading={isLoading} />
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

export default InstructorAnalyticsPage;
