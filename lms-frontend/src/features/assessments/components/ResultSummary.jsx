import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import { formatPercent } from '../../../utils/formatUtils';

export const ResultSummary = ({ result }) => {
  if (!result) return null;
  const passed = result.score >= result.passingScore;

  return (
    <Card title="Your result">
      <p className="u-flex u-items-center u-gap-2">
        <Badge tone={passed ? 'success' : 'danger'}>{passed ? 'Passed' : 'Not passed'}</Badge>
        <span>
          {formatPercent(result.score)} (pass mark {formatPercent(result.passingScore)})
        </span>
      </p>
      <p className="u-text-sm u-text-muted u-mt-2">
        {result.correctCount} of {result.questionCount} answers correct
      </p>
    </Card>
  );
};

export default ResultSummary;
