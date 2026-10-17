import { Sparkles, CheckCircle2, XCircle, EyeOff, AlertTriangle } from 'lucide-react';

const box = {
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  background: 'var(--bg-secondary, #f9fafb)',
};

const muted = { color: 'var(--text-muted, #6b7280)', fontSize: '0.8rem' };

/** Shows an AI grading suggestion. It is advice only; nothing is saved from here. */
export const AiSuggestionPanel = ({ suggestion }) => {
  if (!suggestion) return null;

  if (suggestion.status === 'FAILED') {
    return (
      <div style={box} role="status">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
          <AlertTriangle size={16} color="#d97706" aria-hidden="true" />
          The last AI grading attempt did not finish
        </div>
        <p style={{ ...muted, margin: '6px 0 0' }}>{suggestion.errorMessage}</p>
      </div>
    );
  }

  const result = suggestion.result ?? {};
  const tests = result.testResults ?? [];
  const rubric = result.rubric ?? [];
  const suggestions = result.suggestions ?? [];

  return (
    <section style={box} aria-label="AI grading suggestion">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '0.95rem',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Sparkles size={16} color="var(--primary-color, #4f46e5)" aria-hidden="true" />
          AI suggestion: {suggestion.score} / {suggestion.maxScore}
        </h4>
        <span style={muted}>
          {suggestion.testsPassed} of {suggestion.testsTotal} tests passed
        </span>
      </div>
      <p style={{ ...muted, margin: '4px 0 12px' }}>
        Review and adjust before saving. Students see only the grade you save.
      </p>

      {result.ranCode === false && (
        <p style={{ fontSize: '0.85rem', color: '#b45309', margin: '0 0 12px' }}>
          The code was not run, so test results are the AI&apos;s estimate.
        </p>
      )}

      {tests.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
          {tests.map((t, i) => (
            <li
              key={t.testCaseId}
              style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0' }}
            >
              {t.passed ? (
                <CheckCircle2 size={16} color="#16a34a" aria-label="Passed" />
              ) : (
                <XCircle size={16} color="#dc2626" aria-label="Failed" />
              )}
              <div style={{ fontSize: '0.85rem', minWidth: 0 }}>
                <span style={{ fontWeight: 600 }}>Test {i + 1}</span>
                {t.hidden && (
                  <span style={{ ...muted, marginLeft: 6 }}>
                    <EyeOff size={12} aria-hidden="true" /> hidden from students
                  </span>
                )}
                {!t.passed && (t.error || t.actualOutput) && (
                  <pre
                    style={{
                      margin: '4px 0 0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.8rem',
                    }}
                  >
                    {t.error || `Output: ${t.actualOutput}`}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {rubric.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {rubric.map((r) => (
            <p key={r.criterionId} style={{ fontSize: '0.85rem', margin: '0 0 6px' }}>
              <strong>
                {r.criterionName} ({r.score}/{r.maxPoints}):
              </strong>{' '}
              {r.comment}
            </p>
          ))}
        </div>
      )}

      {result.feedback && (
        <p style={{ fontSize: '0.875rem', margin: '0 0 8px', lineHeight: 1.5 }}>
          {result.feedback}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem' }}>
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AiSuggestionPanel;
