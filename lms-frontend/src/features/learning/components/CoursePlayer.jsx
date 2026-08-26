import { useState } from 'react';
import { Play, Pause, Check, Share2, Bookmark, ChevronDown } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

/* ── Custom Progress Timeline ── */
function StudyProgress({ percent = 55 }) {
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 24,
        background: 'var(--lms-card)',
        marginBottom: 24,
        fontFamily: 'system-ui, sans-serif',
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
            color: 'var(--text-primary)',
            background: 'var(--surface-medium)',
            padding: '4px 8px',
            borderRadius: 99,
          }}
        >
          {percent}%
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
            background: '#e5e7eb',
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
            width: `${percent}%`,
            height: 6,
            background: '#111827',
            borderRadius: 99,
            zIndex: 1,
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
                background: percent >= val ? '#111827' : '#f3f4f6',
                color: percent >= val ? '#fff' : '#9ca3af',
                border: `4px solid var(--lms-card)`,
                transform: 'translateY(-2px)',
              }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#f8fafc',
          borderRadius: 8,
          padding: 16,
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.6,
        }}
      >
        Keep up the good work! Your dedication to learning is impressive. Finish strong!
      </div>
    </div>
  );
}

function CourseCompletion({ modules = [] }) {
  const items = modules.length > 0 ? modules : [];

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        background: 'var(--lms-card)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          Course Completion
        </h3>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>1/25</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
        {items.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            No modules available yet.
          </p>
        ) : (
          items.map((item, i) => {
            const isActive = item.status === 'active';
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 12,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background: isActive ? '#f8fafc' : 'transparent',
                  border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                  transition: 'background 0.2s',
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
                    background: isCompleted ? '#22c55e' : isActive ? '#111827' : '#f8fafc',
                    color: isCompleted ? '#fff' : isActive ? '#fff' : '#64748b',
                    border: !isCompleted && !isActive ? '1px solid #cbd5e1' : 'none',
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
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: isActive ? 600 : 500,
                      color: 'var(--text-primary)',
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
export const CoursePlayer = ({ course, lesson, onProgress }) => {
  const [showMore, setShowMore] = useState(false);

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
            margin: '0 0 24px',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {course?.title || 'Loading...'}
        </h1>

        {/* Video Area */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--surface-medium)',
            marginBottom: 24,
            position: 'relative',
          }}
        >
          {lesson?.videoUrl ? (
            <VideoPlayer
              src={lesson.videoUrl}
              poster={lesson.posterUrl}
              startAt={lesson.resumeAtSeconds ?? 0}
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
            border: '1px solid var(--border-color)',
            borderRadius: 12,
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
                {course?.createdByName || 'Instructor'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Mentor • Illustrator at Google
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
              color: 'var(--text-primary)',
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
            <li>Beginners wanting to learn digital illustration.</li>
            <li>Designers looking to master Adobe Illustrator tools.</li>
            <li>Anyone interested in creating vector artwork.</li>
          </ul>
        </div>
      </div>

      {/* ── Right Column: Progress & Modules ── */}
      <div style={{ width: 400, flexShrink: 0 }}>
        <StudyProgress percent={course?.progressPercent ?? 0} />
        <CourseCompletion modules={course?.modules ?? []} />
      </div>
    </div>
  );
};

export default CoursePlayer;
