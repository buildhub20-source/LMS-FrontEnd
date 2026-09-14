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
  useEffect(() => { onTimeExpiredRef.current = onTimeExpired; }, [onTimeExpired]);
  const navigate = useNavigate();

  // ── Attempt state ────────────────────────────────────────────────────────
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestAttemptId, setLatestAttemptId] = useState(null);

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
  const draftsRef = useRef({});
  const pendingSaves = useRef({});
  const expiryHandled = useRef(false);
  const saveDraft = useCallback((questionId, draft) => {
    if (!attempt?.id) return Promise.reject(new Error('Assessment attempt is unavailable'));
    const previous = pendingSaves.current[questionId] ?? Promise.resolve();
    const request = previous.catch(() => {}).then(() => assessmentService.saveSubmissionDraft(
      attempt.id, questionId, draft.language || 'java', draft.sourceCode || '',
    ));
    pendingSaves.current[questionId] = request;
    return request;
  }, [attempt?.id]);

  const updateDraft = useCallback((questionId, patch) => {
    const updated = { ...draftsRef.current[questionId], ...patch };
    draftsRef.current = { ...draftsRef.current, [questionId]: updated };
    setDrafts(draftsRef.current);
    if (attempt?.id) {
      try { localStorage.setItem(LOCAL_STORAGE_PREFIX + attempt.id + '_' + questionId, JSON.stringify(updated)); }
      catch { /* Autosave still works when local storage is unavailable. */ }
    }
    clearTimeout(debounceTimers.current[questionId]);
    debounceTimers.current[questionId] = setTimeout(() => {
      setSaveStatus(current => ({ ...current, [questionId]: 'saving' }));
      saveDraft(questionId, draftsRef.current[questionId]).then(
        () => setSaveStatus(current => ({ ...current, [questionId]: 'saved' })),
        () => setSaveStatus(current => ({ ...current, [questionId]: 'error' })),
      );
    }, 1500);
  }, [attempt?.id, saveDraft]);

  const flushDrafts = useCallback(async () => {
    Object.values(debounceTimers.current).forEach(clearTimeout);
    await Promise.all(Object.entries(draftsRef.current).map(([id, draft]) => saveDraft(id, draft)));
  }, [saveDraft]);

  useEffect(() => () => {
    Object.values(debounceTimers.current).forEach(clearTimeout);
  }, []);

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

      await flushDrafts();
      await assessmentService.submitAttempt(attempt.id);

      // Clean up localStorage drafts on successful completion
      (attempt.questions ?? []).forEach((q) => {
        try {
          localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${attempt.id}_${q.id}`);
        } catch { /* Best-effort browser cleanup; failure must not block the workflow. */ }
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
  }, [attempt, navigate, submitting, flushDrafts]);

  // ── Refresh trigger for manual retries ──────────────────────────────────
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const retry = useCallback(() => {
    setRefreshTrigger((c) => c + 1);
  }, []);

  // ── Fetch / start / resume attempt on mount ──────────────────────────────
  useEffect(() => {
    if (!assessmentId) return;

    let cancelled = false;
    const abortController = new AbortController();

    const startOrResume = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Start or retrieve existing in-progress attempt from server
        //    Pass AbortController signal so duplicate requests (e.g. React StrictMode
        //    double-invoke) are cancelled before reaching the backend.
        const res = await assessmentService.startAttempt(assessmentId, { signal: abortController.signal });
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

          if (cancelled) return;
          draftsRef.current = initialDrafts;
          expiryHandled.current = false;
          setDrafts(initialDrafts);
        }
      } catch (err) {
        // Ignore AbortController cancellations — these are intentional cleanup, not real errors
        if (abortController.signal.aborted) return;
        if (!cancelled) {
          // Prefer server-side message from normalizeError, then Axios response, then fallback
          const msg = err?.response?.data?.message || err?.message || 'Failed to start or resume assessment.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    startOrResume();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [assessmentId, refreshTrigger]);

  // ── Fetch latest attempt history when startAttempt fails (e.g. limit reached) ──
  useEffect(() => {
    if (!error || !assessmentId || attempt) return;
    let alive = true;
    (async () => {
      try {
        const histRes = await assessmentService.getAttemptHistory(assessmentId);
            const histContent = histRes?.content ?? (Array.isArray(histRes) ? histRes : []);
            if (Array.isArray(histContent) && histContent.length > 0) {
          // Prefer most-recent terminal attempt
          const terminal = histContent.find(
            (a) => a.status === 'EXPIRED' || a.status === 'SUBMITTED' || a.status === 'EVALUATED'
          ) || histContent[0];
                if (terminal?.attemptId && alive) {
            setLatestAttemptId(terminal.attemptId);
          }
        }
      } catch (err) {
        console.error('[useAssessmentAttempt] History fetch error:', err);
      }
    })();
    return () => { alive = false; };
  }, [error, assessmentId, attempt]);

  // ── Server-authoritative countdown timer ─────────────────────────────────
  useEffect(() => {
    if (!attempt?.expiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0 && !expiryHandled.current) {
        expiryHandled.current = true;
        // Time's up — auto-submit
        if (onTimeExpiredRef.current) {
          onTimeExpiredRef.current();
        } else {
          handleSubmit(true).catch(() => { /* submitError is exposed for retry. */ });
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
    latestAttemptId,
    drafts,
    saveStatus,
    submitting,
    submitError,
    remainingSeconds,
    answeredCount,
    totalQuestions,
    updateDraft,
    flushDrafts,
    handleSubmit,
    retry,
  };
}

export default useAssessmentAttempt;
