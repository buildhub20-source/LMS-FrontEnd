import React from 'react';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Check,
} from 'lucide-react';

/**
 * Premium collapsible Question Navigator Drawer
 */
export const QuestionNavigator = ({
  questions = [],
  currentIndex,
  drafts = {},
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <div
      style={{
        width: isCollapsed ? 56 : 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0c101d',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 5,
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '12px 0' : '12px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#090d18',
          flexShrink: 0,
          height: 46,
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ListOrdered size={14} style={{ color: 'var(--link)' }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#e2e8f0',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Questions ({questions.length})
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Question Drawer' : 'Collapse Drawer'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              color: '#94a3b8',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Questions List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: isCollapsed ? '8px 6px' : '8px',
          gap: 4,
        }}
      >
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const hasCode = drafts[q.id]?.sourceCode?.trim()?.length > 0;

          if (isCollapsed) {
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onSelect(idx)}
                title={`Q${idx + 1}: ${q.title} (${hasCode ? 'Answered' : 'Unanswered'})`}
                style={{
                  width: 42,
                  height: 42,
                  margin: '0 auto',
                  borderRadius: 8,
                  border: isCurrent
                    ? '1.5px solid var(--primary)'
                    : hasCode
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isCurrent
                    ? 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 25%, transparent) 0%, rgba(79, 70, 229, 0.15) 100%)'
                    : hasCode
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                  color: isCurrent ? '#ffffff' : hasCode ? 'var(--badge-success-fg)' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent
                    ? '0 0 12px color-mix(in srgb, var(--primary) 30%, transparent)'
                    : 'none',
                }}
              >
                {hasCode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>{idx + 1}</span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        right: 3,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10b981',
                      }}
                    />
                  </div>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>
            );
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textAlign: 'left',
                background: isCurrent
                  ? 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, transparent) 0%, rgba(79, 70, 229, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isCurrent
                  ? '1px solid color-mix(in srgb, var(--primary) 45%, transparent)'
                  : '1px solid transparent',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.15s ease',
                boxShadow: isCurrent
                  ? '0 2px 10px color-mix(in srgb, var(--primary) 15%, transparent)'
                  : 'none',
              }}
            >
              {/* Question Number Badge */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  background: isCurrent
                    ? 'var(--primary)'
                    : hasCode
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color: isCurrent ? '#ffffff' : hasCode ? 'var(--badge-success-fg)' : '#94a3b8',
                  border: hasCode && !isCurrent ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                {hasCode ? <Check size={13} strokeWidth={3} /> : idx + 1}
              </div>

              {/* Title and Metadata */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#ffffff' : '#cbd5e1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {q.title || `Question ${idx + 1}`}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                    fontSize: 11,
                    color: '#64748b',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 4,
                      background:
                        q.questionType === 'MULTIPLE_CHOICE'
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'rgba(59, 130, 246, 0.15)',
                      color: q.questionType === 'MULTIPLE_CHOICE' ? '#c4b5fd' : '#93c5fd',
                    }}
                  >
                    {q.questionType === 'MULTIPLE_CHOICE' ? 'MCQ' : 'CODE'}
                  </span>
                  <span>•</span>
                  <span>{q.marks ?? 10} pts</span>
                  <span>•</span>
                  <span
                    style={{
                      color: hasCode ? '#10b981' : '#64748b',
                      fontWeight: hasCode ? 600 : 400,
                    }}
                  >
                    {hasCode ? 'Answered' : 'Not Attempted'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator;
