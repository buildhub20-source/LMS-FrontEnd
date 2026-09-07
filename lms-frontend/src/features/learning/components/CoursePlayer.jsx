import { useState } from 'react';
import { Play, Pause, Check, Share2, Bookmark, ChevronDown } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

/* ── Custom Progress Timeline ── */
function StudyProgress({ percent = 0 }) {
  const safePercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div
      style={{
        border: '1px solid var(--border, #222)',
        borderRadius: 12,
        padding: 24,
        background: 'var(--lms-card, #121212)',
        marginBottom: 24,
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Your Study Progress
        </h3>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--lms-primary, #3b82f6)',
            background: 'var(--hover-bg, rgba(255,255,255,0.06))',
            padding: '4px 10px',
            borderRadius: 99,
          }}
        >
          {safePercent}%
        </span>
      </div>

      <div style={{ position: 'relative', marginBottom: 32, padding: '0 12px' }}>
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            height: 6,
            background: 'var(--border, #222)',
            borderRadius: 99,
            zIndex: 0,
          }}
        />
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            width: `${safePercent}%`,
            height: 6,
            background: 'var(--lms-primary, #3b82f6)',
            borderRadius: 99,
            zIndex: 1,
            transition: 'width 0.3s ease',
          }}
        />

        {/* Nodes */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {[25, 50, 75, 100].map((val) => (
            <div
              key={val}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                background: safePercent >= val ? 'var(--lms-primary, #3b82f6)' : 'var(--surface-medium, #1a1a1a)',
                color: safePercent >= val ? '#fff' : 'var(--text-muted, #a1a1aa)',
                border: `3px solid var(--lms-card, #121212)`,
                transform: 'translateY(-2px)',
                boxShadow: safePercent >= val ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none',
              }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'var(--hover-bg, rgba(255,255,255,0.03))',
          border: '1px solid var(--border, #222)',
          borderRadius: 8,
          padding: 16,
          fontSize: 14,
          color: 'var(--text-secondary, #d4d4d8)',
          lineHeight: 1.6,
        }}
      >
        Keep up the good work! Your dedication to learning is impressive. Finish strong!
      </div>
    </div>
  );
}

function CourseCompletion({ modules = [], onSelectLesson, currentLessonId }) {
  const items = modules.flatMap((m) =>
    m.lessons && m.lessons.length > 0
      ? m.lessons.map((l) => ({
          ...l,
          duration: l.duration || (l.durationMinutes ? `${l.durationMinutes} min` : '5 min'),
        }))
      : [m]
  );

  const completedCount = items.filter((item) => item.status === 'completed').length;

  return (
    <div
      style={{
        border: '1px solid var(--border, #222)',
        borderRadius: 12,
        background: 'var(--lms-card, #121212)',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottom: '1px solid var(--border, #222)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Course Completion
        </h3>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          {items.length > 0 ? `${completedCount}/${items.length}` : '0/0'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
        {items.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            No modules available yet.
          </p>
        ) : (
          items.map((item, i) => {
            const isActive = currentLessonId ? item.id === currentLessonId : i === 0;
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id || i}
                onClick={() => onSelectLesson?.(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 18px',
                  borderRadius: 12,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: isActive ? 'var(--hover-bg, rgba(255,255,255,0.06))' : 'transparent',
                  border: isActive ? '1px solid var(--lms-primary, #3b82f6)' : '1px solid transparent',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? '#22c55e'
                      : isActive
                      ? 'var(--lms-primary, #3b82f6)'
                      : 'var(--surface-medium, #1a1a1a)',
                    color: '#fff',
                    border: !isCompleted && !isActive ? '1px solid var(--border, #222)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : isActive ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" style={{ marginLeft: 3 }} />
                  )}
                </div>

                {/* Text */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                    {item.duration}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Main Player Layout ── */
export const CoursePlayer = ({ course, lesson: initialLesson, onProgress }) => {
  const [showMore, setShowMore] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const activeLesson = selectedLesson || initialLesson || course?.modules?.[0]?.lessons?.[0];

  return (
    <div
      style={{
        display: 'flex',
        gap: 40,
        maxWidth: 1400,
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px 40px',
      }}
    >
      {/* ── Left Column: Video & Details ── */}
      <div style={{ flex: '1 1 0%', minWidth: 0 }}>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {course?.title || 'Loading...'}
        </h1>

        {activeLesson?.title && (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Lesson: {activeLesson.title}
          </p>
        )}

        {/* Video Area */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--surface-medium, #1a1a1a)',
            marginBottom: 24,
            position: 'relative',
          }}
        >
          {activeLesson?.videoUrl ? (
            <VideoPlayer
              src={activeLesson.videoUrl}
              poster={activeLesson.posterUrl}
              startAt={activeLesson.resumeAtSeconds ?? 0}
              onProgress={onProgress}
            />
          ) : (
            /* Fallback dummy image mimicking the abstract purple/blue video in screenshot */
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 16,
              }}
            >
              {/* Fake Video controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  gap: 16,
                  background: 'rgba(0,0,0,0.5)',
                  padding: '12px 20px',
                  borderRadius: 12,
                }}
              >
                <Play size={18} color="#fff" fill="#fff" />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>0:00</span>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 99,
                  }}
                >
                  <div
                    style={{ width: '40%', height: '100%', background: '#fff', borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructor Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border, #222)',
            borderRadius: 12,
            background: 'var(--lms-card, #121212)',
            padding: '16px 24px',
            marginBottom: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Simon"
              alt="Simon"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#e5e7eb',
                objectFit: 'cover',
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {course?.createdByName || course?.instructorName || 'Instructor'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Course Instructor • Expert Mentor
              </p>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              color: 'var(--text-secondary)',
            }}
          >
            <Share2 size={20} cursor="pointer" />
            <Bookmark size={20} cursor="pointer" />
          </div>
        </div>

        {/* About This Course */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            About This Course
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              display: showMore ? 'block' : '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
            }}
          >
            {course?.description || 'No description available.'}
          </p>
          <button
            onClick={() => setShowMore(!showMore)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'var(--lms-primary, #3b82f6)',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 12,
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {showMore ? 'Show less' : 'Show more'} <ChevronDown size={16} />
          </button>
        </div>

        {/* This Course Suit For */}
        <div>
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            This Course Suit For:
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            <li>Learners seeking to master key concepts through comprehensive curriculum.</li>
            <li>Hands-on practitioners looking to enhance their practical skills.</li>
            <li>Anyone interested in structured, self-paced learning and certification.</li>
          </ul>
        </div>
      </div>

      {/* ── Right Column: Progress & Modules ── */}
      <div style={{ width: 400, flexShrink: 0 }}>
        <StudyProgress percent={course?.progressPercent ?? 0} />
        <CourseCompletion
          modules={course?.modules ?? []}
          currentLessonId={activeLesson?.id}
          onSelectLesson={setSelectedLesson}
        />
      </div>
    </div>
  );
};

export default CoursePlayer;
