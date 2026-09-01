import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';

const LOCAL_STORAGE_PREFIX = 'lms_assessment_draft_';

/**
 * Manages the full lifecycle of a student assessment attempt with persistent state:
 *
 * - Calls startAttempt on mount (resumes existing IN_PROGRESS attempt if any)
 * - Fetches attempt details to restore any previously saved code from DB
 * - Backs up all edits immediately to localStorage for offline / crash recovery
 * - Debounces background autosave to backend DB (2s)
 * - Restores exact code, language, and progress when resuming after interruptions
 * - Tracks remaining seconds derived from server-authoritative expiresAt
 */
export function useAssessmentAttempt(assessmentId, options = {}) {
  const { onTimeExpired } = options;
  const onTimeExpiredRef = useRef(onTimeExpired);
  onTimeExpiredRef.current = onTimeExpired;
  const navigate = useNavigate();

  // ── Attempt state ────────────────────────────────────────────────────────
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Per-question code: { [questionId]: { language, sourceCode } }
  const [drafts, setDrafts] = useState({});

  // ── Autosave state: { [questionId]: 'saving' | 'saved' | 'error' }
  const [saveStatus, setSaveStatus] = useState({});

  // ── Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Timer (remaining seconds, derived from server expiresAt)
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  // Debounce timers per question
  const debounceTimers = useRef({});

  // ── Update a question's code draft (Instant LocalStorage + Debounced DB Autosave)
  const updateDraft = useCallback((questionId, patch) => {
    setDrafts((prev) => {
      const updated = {
        ...prev[questionId],
        ...patch,
      };
      const next = { ...prev, [questionId]: updated };

      // Instant local persistence backup
      if (attempt?.id) {
        try {
          const storageKey = `${LOCAL_STORAGE_PREFIX}${attempt.id}_${questionId}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
      }

      return next;
    });

    // Debounce autosave to backend database (2 seconds)
    clearTimeout(debounceTimers.current[questionId]);
    debounceTimers.current[questionId] = setTimeout(async () => {
      if (!attempt?.id) return;

      setSaveStatus((s) => ({ ...s, [questionId]: 'saving' }));
      try {
        setDrafts((current) => {
          const draft = { ...current[questionId], ...patch };
          assessmentService
            .saveSubmissionDraft(
              attempt.id,
              questionId,
              draft.language || 'python',
              draft.sourceCode || '',
            )
            .then(() => {
              setSaveStatus((s) => ({ ...s, [questionId]: 'saved' }));
            })
            .catch(() => {
              setSaveStatus((s) => ({ ...s, [questionId]: 'error' }));
            });
          return current;
        });
      } catch {
        setSaveStatus((s) => ({ ...s, [questionId]: 'error' }));
      }
    }, 1500);
  }, [attempt?.id]);

  // ── Submit attempt ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (isAutoSubmit = false, onBeforeSubmit = null, shouldNavigate = true) => {
    if (!attempt?.id || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (onBeforeSubmit) {
        try {
          await onBeforeSubmit();
        } catch (e) {
          console.warn('onBeforeSubmit upload error:', e);
        }
      }

      await assessmentService.submitAttempt(attempt.id);

      // Clean up localStorage drafts on successful completion
      (attempt.questions ?? []).forEach((q) => {
        try {
          localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${attempt.id}_${q.id}`);
        } catch {}
      });

      if (shouldNavigate) {
        navigate(ROUTES.ASSESSMENT_RESULT(attempt.id));
      }
    } catch (err) {
      if (!isAutoSubmit) {
        setSubmitError(err?.message || err?.response?.data?.message || 'Submission failed. Please try again.');
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [attempt, navigate, submitting]);

  // ── Fetch / start / resume attempt on mount ──────────────────────────────
  useEffect(() => {
    if (!assessmentId) return;

    let cancelled = false;
    const startOrResume = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Start or retrieve existing in-progress attempt from server
        const res = await assessmentService.startAttempt(assessmentId);
        const attemptData = res?.data?.data ?? res?.data ?? res;

        if (!cancelled && attemptData) {
          const normalizedAttempt = {
            ...attemptData,
            id: attemptData.attemptId || attemptData.id,
            attemptId: attemptData.attemptId || attemptData.id,
          };
          setAttempt(normalizedAttempt);
          setRemainingSeconds(normalizedAttempt.remainingSeconds ?? 0);

          const questions = normalizedAttempt.questions ?? [];
          const initialDrafts = {};

          // 2. Fetch existing submissions from DB for this attempt
          let savedSubmissions = [];
          if (normalizedAttempt.id) {
            try {
              const detailRes = await assessmentService.getResult(normalizedAttempt.id);
              const detailData = detailRes?.data?.data ?? detailRes?.data ?? detailRes;
              savedSubmissions = detailData?.submissions ?? [];
            } catch {
              // Non-fatal if detail query fails, fallback to local storage
            }
          }

          // Build a lookup map of DB submissions: questionId -> { language, sourceCode }
          const submissionMap = {};
          savedSubmissions.forEach((sub) => {
            if (sub.questionId) {
              submissionMap[sub.questionId] = {
                language: sub.language || 'python',
                sourceCode: sub.sourceCode || '',
              };
            }
          });

          // 3. Initialize drafts for each question combining DB submissions + localStorage backup
          questions.forEach((q) => {
            const storageKey = `${LOCAL_STORAGE_PREFIX}${normalizedAttempt.id}_${q.id}`;
            let localBackup = null;
            try {
              const cached = localStorage.getItem(storageKey);
              if (cached) localBackup = JSON.parse(cached);
            } catch {
              // ignore json parse error
            }

            const dbDraft = submissionMap[q.id];

            // Priority: Local backup (if newer) -> DB saved submission -> Default template
            if (localBackup && localBackup.sourceCode?.trim()) {
              initialDrafts[q.id] = localBackup;
            } else if (dbDraft && dbDraft.sourceCode?.trim()) {
              initialDrafts[q.id] = dbDraft;
            } else {
              initialDrafts[q.id] = {
                language: 'java',
                sourceCode: '',
              };
            }
          });

          setDrafts(initialDrafts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || err?.response?.data?.message || 'Failed to start or resume assessment.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    startOrResume();
    return () => { cancelled = true; };
  }, [assessmentId]);

  // ── Server-authoritative countdown timer ─────────────────────────────────
  useEffect(() => {
    if (!attempt?.expiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        // Time's up — auto-submit
        if (onTimeExpiredRef.current) {
          onTimeExpiredRef.current();
        } else {
          handleSubmit(true);
        }
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt?.expiresAt, handleSubmit]);

  // ── Derive answered count ─────────────────────────────────────────────────
  const answeredCount = Object.values(drafts).filter((d) => d.sourceCode?.trim()).length;
  const totalQuestions = attempt?.questions?.length ?? 0;

  return {
    attempt,
    loading,
    error,
    drafts,
    saveStatus,
    submitting,
    submitError,
    remainingSeconds,
    answeredCount,
    totalQuestions,
    updateDraft,
    handleSubmit,
  };
}

export default useAssessmentAttempt;
