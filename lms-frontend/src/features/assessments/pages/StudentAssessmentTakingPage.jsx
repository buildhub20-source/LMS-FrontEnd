import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Send, Maximize2, Minimize2,
  AlertTriangle, Shield, Video, Sparkles, Terminal, Code2,
  ArrowLeft, CheckCircle2
} from 'lucide-react';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import Button from '../../../components/common/Button';
import { CodingQuestionPanel } from '../components/CodingQuestionPanel';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { SubmitConfirmModal } from '../components/SubmitConfirmModal';
import { ProcessingScreen } from '../components/ProcessingScreen';
import { ExamLockdownOverlay } from '../components/ExamLockdownOverlay';
import { ProctoringWidget } from '../components/ProctoringWidget';
import { useAssessmentAttempt } from '../hooks/useAssessmentAttempt';
import { useAssessmentProctoring } from '../hooks/useAssessmentProctoring';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';

/** Formats remaining seconds as HH:MM:SS */
const formatTime = (secs) => {
  if (secs == null) return '--:--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Premium Secure Full-Screen Coding Exam Interface with Live Proctoring & Anti-Cheat
 */
export const StudentAssessmentTakingPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  // Lifecycle stage: 'LOBBY' | 'COUNTDOWN' | 'STARTED'
  const [examStage, setExamStage] = useState('LOBBY');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showProcessingScreen, setShowProcessingScreen] = useState(false);
  const [submissionStage, setSubmissionStage] = useState('idle'); // 'idle' | 'saving' | 'uploading' | 'submitting' | 'completed' | 'error'
  const [submissionErrorMsg, setSubmissionErrorMsg] = useState(null);
  const stopRecordingRef = useRef(null);
  // Synchronous guard — set true BEFORE exitFullscreen fires so no false proctoring strike
  const isSubmittingRef = useRef(false);
  const handleFinalSubmitRef = useRef(null);

  const handleAutoSubmitOnExpiry = useCallback(() => {
    handleFinalSubmitRef.current?.(true, true);
  }, []);

  const {
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
  } = useAssessmentAttempt(assessmentId, {
    onTimeExpired: handleAutoSubmitOnExpiry,
  });

  const questions = attempt?.questions ?? [];
  const currentQuestion = questions[currentIdx];
  const isCritical = (remainingSeconds ?? 999) <= 300; // 5 mins warning

  // Finalize exam, flush active draft, and upload recording with real-time synchronized stages
  const handleFinalSubmit = useCallback(async (isAuto = false, shouldNavigate = true) => {
    // Mark as submitting FIRST — suppresses proctoring events synchronously
    isSubmittingRef.current = true;
    setShowSubmitModal(false);
    setShowProcessingScreen(true);
    setSubmissionErrorMsg(null);

    // 1. Exit fullscreen immediately so the processing screen displays cleanly
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }

    try {
      // Resolve valid attempt ID
      let targetAttemptId = attempt?.id || attempt?.attemptId;
      if (!targetAttemptId && assessmentId) {
        try {
          const startRes = await assessmentService.startAttempt(assessmentId);
          const startData = startRes?.data?.data ?? startRes?.data ?? startRes;
          targetAttemptId = startData?.attemptId || startData?.id;
        } catch (startErr) {
          console.warn('Could not retrieve attempt ID on submit:', startErr);
        }
      }

      // Stage 1: Flush currently active question's draft to DB
      setSubmissionStage('saving');
      if (currentQuestion && drafts[currentQuestion.id] && targetAttemptId) {
        try {
          const d = drafts[currentQuestion.id];
          await assessmentService.saveSubmissionDraft(
            targetAttemptId,
            currentQuestion.id,
            d.language || 'java',
            d.sourceCode || '',
          );
        } catch (e) {
          console.warn('Draft flush error on submit (non-fatal):', e);
        }
      }

      // Stage 2: Stop and upload screen recording telemetry (safeguarded timeout)
      setSubmissionStage('uploading');
      try {
        const videoBlob = stopRecordingRef.current ? await stopRecordingRef.current() : null;
        if (videoBlob && targetAttemptId) {
          await Promise.race([
            assessmentService.uploadAttemptRecording(targetAttemptId, videoBlob),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), 2500)),
          ]);
        }
      } catch (err) {
        console.warn('Screen recording upload note on submit (non-fatal):', err);
      }

      // Stage 3: Submit attempt to backend DB & finalize
      setSubmissionStage('submitting');
      if (targetAttemptId) {
        try {
          await assessmentService.submitAttempt(targetAttemptId);
        } catch (submitErr) {
          const errMsg = (submitErr?.response?.data?.message || submitErr?.message || '').toLowerCase();
          if (
            errMsg.includes('already submitted') ||
            errMsg.includes('already completed') ||
            errMsg.includes('expired')
          ) {
            console.info('Attempt already marked as finalized on server.');
          } else {
            throw submitErr;
          }
        }
      }

      // Clean up localStorage drafts on successful submission
      if (targetAttemptId) {
        (attempt?.questions ?? []).forEach((q) => {
          try {
            localStorage.removeItem(`lms_assessment_draft_${targetAttemptId}_${q.id}`);
          } catch {}
        });
      }

      // Stage 4: Completed
      setSubmissionStage('completed');

      if (shouldNavigate) {
        setTimeout(() => {
          setShowProcessingScreen(false);
          navigate(ROUTES.ASSESSMENT_RESULT(targetAttemptId || assessmentId));
        }, 400);
      }
    } catch (err) {
      console.error('Final submit failed:', err);
      setSubmissionStage('error');
      setSubmissionErrorMsg(
        err?.response?.data?.message || err?.message || 'Submission failed. Please check your network connection and retry.'
      );
    }
  }, [attempt?.id, attempt?.questions, assessmentId, currentQuestion, drafts, navigate]);

  handleFinalSubmitRef.current = handleFinalSubmit;

  // Proctoring & Lockdown hook
  const {
    isFullscreen,
    tabSwitchCount,
    maxStrikes,
    lastViolation,
    showViolationModal,
    setShowViolationModal,
    isTerminated,
    isRulesAgreed,
    setIsRulesAgreed,
    screenStream,
    isScreenRecording,
    enterFullscreen,
    startScreenRecording,
    stopAndGetRecordingBlob,
  } = useAssessmentProctoring({
    enabled: examStage === 'STARTED',
    onSecurityViolationSubmit: () => handleFinalSubmit(true),
    suppressRef: isSubmittingRef,
  });

  stopRecordingRef.current = stopAndGetRecordingBlob;

  // Step 1: Request screen recording stream inside lobby
  const handleRequestScreen = async () => {
    try {
      await startScreenRecording();
    } catch (err) {
      console.warn('Screen recording error:', err);
    }
  };

  // Step 2: Launch assessment (Enter fullscreen -> 3s launch countdown)
  const handleLaunchAssessment = async () => {
    try {
      await enterFullscreen();
    } catch {}
    setIsRulesAgreed(true);
    setExamStage('COUNTDOWN');
  };

  // Step 3: Countdown finishes (3s) -> enter coding workspace
  const handleCountdownComplete = useCallback(() => {
    setIsRulesAgreed(true);
    setExamStage('STARTED');
  }, [setIsRulesAgreed]);

  // Prevent accidental navigation
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Assessment is in progress. Changes may be lost if you leave.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Keyboard navigation shortcuts (Ctrl+Left / Ctrl+Right)
  useEffect(() => {
    if (examStage !== 'STARTED') return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIdx((i) => Math.min(i + 1, (attempt?.questions?.length ?? 1) - 1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [attempt?.questions?.length, examStage]);

  // Fallback for STARTED stage if data is still loading
  if (examStage === 'STARTED' && loading && !attempt) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#070a13',
          color: '#cbd5e1',
          gap: 16,
        }}
      >
        <Spinner size="lg" />
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>
          Initializing Secure Assessment Environment…
        </p>
      </div>
    );
  }

  // Fatal error fallback only if already in STARTED stage
  if (examStage === 'STARTED' && error && !attempt) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#070a13',
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 540,
            width: '100%',
            background: '#0f172a',
            borderRadius: 16,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: 32,
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
            Unable to Start Assessment
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
            {error}
          </p>

          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.STUDENT_ASSESSMENTS)}
            iconLeft={<ArrowLeft size={16} />}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              width: '100%',
              justifyContent: 'center',
              padding: '11px 0',
              fontWeight: 700,
            }}
          >
            Return to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#070a13',
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        userSelect: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Multi-Stage Onboarding & Countdown Lockdown Overlay ── */}
      <ExamLockdownOverlay
        stage={examStage}
        onRequestScreen={handleRequestScreen}
        onLaunchAssessment={handleLaunchAssessment}
        onCountdownComplete={handleCountdownComplete}
        isScreenRecording={isScreenRecording}
        screenStream={screenStream}
        loading={loading}
        error={error}
        attempt={attempt}
        drafts={drafts}
        showViolationModal={showViolationModal}
        onDismissViolation={() => {
          setShowViolationModal(false);
          enterFullscreen();
        }}
        lastViolation={lastViolation}
        isTerminated={isTerminated}
        tabSwitchCount={tabSwitchCount}
        maxStrikes={maxStrikes}
        assessmentTitle={attempt?.assessmentTitle}
        durationMinutes={attempt?.durationMinutes}
        totalQuestions={totalQuestions}
        totalMarks={attempt?.totalMarks}
        maxAttempts={attempt?.maxAttempts}
        attemptNumber={attempt?.attemptNumber}
      />

      {/* ── TOP COMMAND BAR ─────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          height: 52,
          background: '#0a0f1d',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          gap: 16,
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Left: Test Title & Answered Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Code2 size={18} />
          </div>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: '#f8fafc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {attempt?.assessmentTitle || 'Assessment'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>●</span>
              <span>
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Proctoring & Anti-Cheat Status */}
        <ProctoringWidget
          isScreenRecording={isScreenRecording}
          tabSwitchCount={tabSwitchCount}
          maxStrikes={maxStrikes}
        />

        {/* Right: Countdown Clock + Fullscreen + Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Timer Widget */}
          <div
            title="Remaining assessment time"
            role="timer"
            aria-live={isCritical ? 'assertive' : 'off'}
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
              fontSize: 15,
              fontWeight: 800,
              color: isCritical ? '#fca5a5' : '#f8fafc',
              background: isCritical
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${isCritical ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              padding: '4px 12px',
              borderRadius: 8,
              minWidth: 86,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: isCritical ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
              animation: isCritical ? 'pulseGlow 1.2s infinite ease-in-out' : 'none',
            }}
          >
            {isCritical && <AlertTriangle size={14} style={{ color: '#ef4444' }} />}
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={enterFullscreen}
            title={isFullscreen ? 'Fullscreen mode is active' : 'Enter Fullscreen'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '7px 10px',
              cursor: 'pointer',
              color: isFullscreen ? '#34d399' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Submit Assessment Button */}
          <Button
            variant="primary"
            onClick={() => {
              isSubmittingRef.current = true;  // suppress blur synchronously when modal opens
              setShowSubmitModal(true);
            }}
            iconRight={<Send size={14} />}
            disabled={submitting}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 16px',
              borderRadius: 8,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* ── Error Banner if Submission Fails ─────────────────────── */}
      {submitError && (
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertTriangle size={14} style={{ color: '#ef4444' }} />
          <p style={{ margin: 0, fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>{submitError}</p>
        </div>
      )}

      {/* ── MAIN WORKSPACE (Question Navigator + IDE Panel) ───────── */}
      <main style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left Collapsible Question Navigator */}
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIdx}
          drafts={drafts}
          onSelect={setCurrentIdx}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Center/Right: Problem statement + Monaco Editor + Test Console */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {currentQuestion ? (
            <CodingQuestionPanel
              key={currentQuestion.id}
              question={currentQuestion}
              draft={drafts[currentQuestion.id] ?? { language: 'java', sourceCode: '' }}
              saveStatus={saveStatus[currentQuestion.id]}
              onDraftChange={(patch) => updateDraft(currentQuestion.id, patch)}
              onSubmitQuestion={(result) => {
                // Ensure the draft is saved when the student clicks "Submit Question"
                if (result?.sourceCode) {
                  updateDraft(currentQuestion.id, {
                    language: result.language,
                    sourceCode: result.sourceCode,
                  });
                }
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
              No question selected.
            </div>
          )}
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION FOOTER ─────────────────────────────── */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 48,
          background: '#090d18',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Question counter indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
          <span style={{ fontWeight: 700, color: '#e2e8f0' }}>
            Question {currentIdx + 1} of {questions.length}
          </span>
          {drafts[currentQuestion?.id]?.sourceCode?.trim() ? (
            <span style={{ fontSize: 11, color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              Answered
            </span>
          ) : (
            <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: 4 }}>
              Incomplete
            </span>
          )}
        </div>

        {/* Center: Pagination Quick Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIdx;
            const hasAnswer = drafts[q.id]?.sourceCode?.trim()?.length > 0;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                title={`Question ${idx + 1}: ${q.title || ''}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: isCurrent
                    ? '1.5px solid #6366f1'
                    : hasAnswer
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isCurrent
                    ? '#6366f1'
                    : hasAnswer
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  color: isCurrent ? '#ffffff' : hasAnswer ? '#34d399' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Right: Next Question Button (if more questions remain) */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 90, justifyContent: 'flex-end' }}>
          {currentIdx < questions.length - 1 ? (
            <Button
              variant="secondary"
              onClick={() => setCurrentIdx((i) => i + 1)}
              iconRight={<ChevronRight size={16} />}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 6,
              }}
            >
              <span>Next</span>
              <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>(Ctrl+→)</span>
            </Button>
          ) : (
            <span style={{ fontSize: 11, color: '#64748b' }}>Last Question</span>
          )}
        </div>
      </footer>

      {/* ── Pre-Submission Confirmation Modal ───────────────────── */}
      <SubmitConfirmModal
        isOpen={showSubmitModal}
        onClose={() => {
          if (submissionStage === 'idle') {
            isSubmittingRef.current = false; // resume proctoring if user cancels
            setShowSubmitModal(false);
          }
        }}
        onConfirm={() => {
          handleFinalSubmit(false, true);
        }}
        isLoading={submissionStage !== 'idle' && submissionStage !== 'error'}
        questions={questions}
        drafts={drafts}
        assessmentTitle={attempt?.assessmentTitle}
        onJumpToQuestion={(idx) => {
          if (submissionStage === 'idle') {
            isSubmittingRef.current = false;
            setShowSubmitModal(false);
            setCurrentIdx(idx);
          }
        }}
      />

      {/* ── Synchronized Processing / Submission Screen ─────────── */}
      {showProcessingScreen && (
        <ProcessingScreen
          stage={submissionStage}
          errorMessage={submissionErrorMsg}
          questions={questions}
          drafts={drafts}
          assessmentTitle={attempt?.assessmentTitle}
          onRetry={() => handleFinalSubmit(false, true)}
          onCancel={() => {
            setShowProcessingScreen(false);
            setSubmissionStage('idle');
            isSubmittingRef.current = false;
          }}
          onDone={() => {
            setShowProcessingScreen(false);
            navigate(ROUTES.ASSESSMENT_RESULT(attempt?.id || assessmentId));
          }}
        />
      )}

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes spin360 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default StudentAssessmentTakingPage;
