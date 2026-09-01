import React, { useState, useEffect } from 'react';
import { Check, X, Award, FileText, Send } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Alert from '../../../components/feedback/Alert';
import gradingService from '../services/gradingService';
import rubricService from '../services/rubricService';

export const GradingWorkflowPage = () => {
  const [pending, setPending] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // Grading form state
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [manualScore, setManualScore] = useState('');
  const [status, setStatus] = useState('ACCEPTED');
  const [rubricScores, setRubricScores] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, rubricsRes] = await Promise.all([
        gradingService.getPendingSubmissions(),
        rubricService.list(),
      ]);
      setPending(pendingRes?.data?.data?.content || []);
      setRubrics(rubricsRes?.data?.data?.content || []);
      if (pendingRes?.data?.data?.content?.length > 0) {
        setSelectedSub(pendingRes.data.data.content[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load grading queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRubric = (rubricId) => {
    setSelectedRubricId(rubricId);
    const rubric = rubrics.find((r) => r.id === rubricId);
    if (rubric && rubric.criteria) {
      const initialScores = {};
      rubric.criteria.forEach((c) => {
        initialScores[c.id] = { score: c.maxPoints, feedback: '' };
      });
      setRubricScores(initialScores);
    } else {
      setRubricScores({});
    }
  };

  const handleRubricScoreChange = (criterionId, field, val) => {
    setRubricScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: val,
      },
    }));
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const rubricScoresPayload = Object.keys(rubricScores).map((critId) => ({
        criterionId: critId,
        score: parseInt(rubricScores[critId].score) || 0,
        feedback: rubricScores[critId].feedback,
      }));

      await gradingService.gradeAttemptSubmission(selectedSub.attemptId, {
        submissionId: selectedSub.id,
        manualScore: manualScore ? parseInt(manualScore) : null,
        status,
        rubricScores: rubricScoresPayload,
      });

      setSuccessMsg('Submission graded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);

      // Refresh list
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Award size={24} color="var(--primary-color, #4f46e5)" /> Instructor Grading Workflow
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '0.9rem' }}>
          Evaluate student coding submissions, assign rubric criteria scores, and record feedback.
        </p>
      </div>

      {error && <div style={{ marginBottom: 16 }}><Alert tone="error">{error}</Alert></div>}
      {successMsg && <div style={{ marginBottom: 16 }}><Alert tone="success">{successMsg}</Alert></div>}

      {loading ? (
        <p>Loading grading queue...</p>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <Check size={40} color="#10b981" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>All Caught Up!</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>There are no pending student submissions requiring manual grading.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          {/* Submission List */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8 }}>
              Pending Queue ({pending.length})
            </h3>
            {pending.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  cursor: 'pointer',
                  marginBottom: 8,
                  background: selectedSub?.id === sub.id ? '#eef2ff' : '#f9fafb',
                  borderLeft: selectedSub?.id === sub.id ? '4px solid #4f46e5' : '4px solid transparent',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Question: {sub.questionId.slice(0, 8)}...</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                  Language: {sub.language} | Submitted: {new Date(sub.submittedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Submission Details & Grading Form */}
          {selectedSub && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Submission Code</h2>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Attempt ID: {selectedSub.attemptId}</span>
                </div>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedSub.language}
                </span>
              </div>

              {/* Code display */}
              <pre
                style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  padding: 16,
                  borderRadius: 6,
                  overflowX: 'auto',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  maxHeight: 300,
                }}
              >
                {selectedSub.sourceCode || '// No code submitted'}
              </pre>

              {/* Grading Form */}
              <form onSubmit={handleSubmitGrade} style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Evaluate Submission</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>Attach Rubric</label>
                    <select
                      value={selectedRubricId}
                      onChange={(e) => handleSelectRubric(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
                    >
                      <option value="">No Rubric (Direct Score)</option>
                      {rubrics.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>Submission Decision</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
                    >
                      <option value="ACCEPTED">ACCEPTED (Full Marks)</option>
                      <option value="WRONG_ANSWER">WRONG_ANSWER</option>
                      <option value="PARTIAL_SUCCESS">PARTIAL_SUCCESS</option>
                      <option value="MANUALLY_GRADED">MANUALLY_GRADED</option>
                    </select>
                  </div>
                </div>

                {/* Rubric Evaluation Form */}
                {selectedRubricId && rubrics.find((r) => r.id === selectedRubricId)?.criteria && (
                  <div style={{ background: '#f9fafb', padding: 16, borderRadius: 6, marginBottom: 16 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Rubric Evaluation</h4>
                    {rubrics.find((r) => r.id === selectedRubricId).criteria.map((c) => (
                      <div key={c.id} style={{ marginBottom: 12, background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.criterionName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Max: {c.maxPoints} pts (Weight: x{c.weight})</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center' }}>
                          <Input
                            type="number"
                            min={0}
                            max={c.maxPoints}
                            value={rubricScores[c.id]?.score ?? c.maxPoints}
                            onChange={(e) => handleRubricScoreChange(c.id, 'score', e.target.value)}
                          />
                          <Input
                            placeholder="Feedback comment for this criterion..."
                            value={rubricScores[c.id]?.feedback ?? ''}
                            onChange={(e) => handleRubricScoreChange(c.id, 'feedback', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <Input
                    label="Manual Score Override (Optional)"
                    type="number"
                    value={manualScore}
                    onChange={(e) => setManualScore(e.target.value)}
                    placeholder="Auto-calculated from rubric if left empty"
                  />
                </div>

                <Button type="submit" isLoading={submitting}>
                  <Send size={16} style={{ marginRight: 6 }} /> Submit Grade Evaluation
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradingWorkflowPage;
