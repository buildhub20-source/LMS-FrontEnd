import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutList, LayoutGrid, ChevronDown, BookOpen } from 'lucide-react';
import { useMyCourses } from '../hooks/useCourses';
import { ROUTES } from '../../../constants/routes';

/* ─── helpers ─── */

function getInitials(title = '') {
  return title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const ICON_COLORS = [
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#ffedd5', text: '#ea580c' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#f0fdf4', text: '#16a34a' },
];

function iconColor(title = '') {
  const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ICON_COLORS[hash % ICON_COLORS.length];
}

function CourseIcon({ title, thumbnailUrl, size = 56 }) {
  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={title}
        style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover' }}
      />
    );
  }
  const c = iconColor(title);
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.3, flexShrink: 0,
      fontFamily: 'Inter, sans-serif',
    }}>
      {getInitials(title)}
    </div>
  );
}

function StatusPill({ status, progress }) {
  const map = {
    ONGOING:   { label: 'Ongoing',   bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
    DONE:      { label: 'Done',      bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
    PAUSED:    { label: 'Paused',    bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    PUBLISHED: { label: 'Published', bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
  };
  // derive from progress if no explicit status
  let key = status;
  if (!map[key]) {
    if (progress >= 100) key = 'DONE';
    else if (progress > 0) key = 'ONGOING';
    else key = 'ONGOING';
  }
  const s = map[key] ?? map['ONGOING'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      fontFamily: 'Inter, sans-serif', ...s,
    }}>
      {s.label}
    </span>
  );
}

function ProgressBar({ percent }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--text-muted)', marginBottom: 4,
        fontFamily: 'Inter, sans-serif',
      }}>
        <span>Progress</span>
        <span style={{ fontWeight: 600 }}>{percent ?? 0}%</span>
      </div>
      <div style={{
        height: 5, borderRadius: 99, background: 'var(--border-color)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${Math.min(percent ?? 0, 100)}%`,
          background: 'var(--text-primary)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

function InstructorChip({ name }) {
  const c = iconColor(name ?? '');
  const initials = getInitials(name ?? '');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: c.bg, color: c.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 10, flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
          {name ?? 'Unknown'}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
          Instructor
        </p>
      </div>
    </div>
  );
}

function ActionButton({ progress, onClick }) {
  let label = 'Start';
  if (progress >= 100) label = 'Review';
  else if (progress > 0) label = 'Continue';

  const isResume = label === 'Review';

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        border: isResume ? '1.5px solid var(--border-color)' : 'none',
        background: isResume ? 'transparent' : 'var(--text-primary)',
        color: isResume ? 'var(--text-primary)' : 'var(--bg)',
        transition: 'opacity 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {label}
    </button>
  );
}

/* ─── List Card ─── */
function CourseListCard({ course, onContinue }) {
  const progress = course.progressPercent ?? 0;
  return (
    <div style={{
      background: 'var(--lms-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      {/* Top: icon + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CourseIcon title={course.title} thumbnailUrl={course.thumbnailUrl} size={52} />
        <StatusPill status={null} progress={progress} />
      </div>

      {/* Title + category + description */}
      <div>
        <h3 style={{
          margin: '0 0 2px', fontSize: 16, fontWeight: 700,
          color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
        }}>
          {course.title}
        </h3>
        {course.level && (
          <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()} · {course.durationMinutes ? `${course.durationMinutes} min` : ''}
          </p>
        )}
        {course.description && (
          <p style={{
            margin: 0, fontSize: 13, color: 'var(--text-secondary)',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.description}
          </p>
        )}
      </div>

      {/* Progress */}
      <ProgressBar percent={progress} />

      {/* Instructor + action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <InstructorChip name={course.createdByName} />
        <ActionButton progress={progress} onClick={() => onContinue(course)} />
      </div>
    </div>
  );
}

/* ─── Grid Card ─── */
function CourseGridCard({ course, onContinue }) {
  const progress = course.progressPercent ?? 0;
  return (
    <div style={{
      background: 'var(--lms-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CourseIcon title={course.title} thumbnailUrl={course.thumbnailUrl} size={48} />
        <StatusPill status={null} progress={progress} />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 2px', fontSize: 15, fontWeight: 700,
          color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
        }}>
          {course.title}
        </h3>
        {course.level && (
          <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
          </p>
        )}
        {course.description && (
          <p style={{
            margin: 0, fontSize: 12, color: 'var(--text-secondary)',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.description}
          </p>
        )}
      </div>

      <ProgressBar percent={progress} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <InstructorChip name={course.createdByName} />
        <ActionButton progress={progress} onClick={() => onContinue(course)} />
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function CourseSkeleton({ view }) {
  const pulse = {
    background: 'var(--border-color)',
    borderRadius: 6,
    animation: 'pulse 1.4s ease-in-out infinite',
  };
  return Array.from({ length: view === 'list' ? 3 : 8 }).map((_, i) => (
    <div key={i} style={{
      background: 'var(--lms-card)', border: '1px solid var(--border-color)',
      borderRadius: 16, padding: '20px 24px', display: 'flex',
      flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ ...pulse, width: 52, height: 52, borderRadius: 12 }} />
        <div style={{ ...pulse, width: 60, height: 20, borderRadius: 20 }} />
      </div>
      <div>
        <div style={{ ...pulse, height: 16, width: '55%', marginBottom: 8 }} />
        <div style={{ ...pulse, height: 12, width: '35%', marginBottom: 8 }} />
        <div style={{ ...pulse, height: 12, width: '85%' }} />
      </div>
      <div style={{ ...pulse, height: 5, borderRadius: 99 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...pulse, height: 28, width: 120, borderRadius: 8 }} />
        <div style={{ ...pulse, height: 34, width: 80, borderRadius: 8 }} />
      </div>
    </div>
  ));
}

/* ─── Page ─── */

export const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { data, isLoading, error, refetch } = useMyCourses();
  const courses = useMemo(() => {
    const raw = data?.data?.content ?? data?.content ?? data?.items ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // derive unique categories from level field (or course.category if it exists)
  const categories = useMemo(() => {
    const levels = [...new Set(courses.map(c => c.level).filter(Boolean))];
    return ['All Categories', ...levels.map(l => l.charAt(0) + l.slice(1).toLowerCase())];
  }, [courses]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'All Categories') return courses;
    return courses.filter(c =>
      c.level?.toLowerCase() === categoryFilter.toLowerCase()
    );
  }, [courses, categoryFilter]);

  const handleContinue = (course) => {
    navigate(ROUTES.LEARNING(course.id));
  };

  /* ─── render ─── */
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 28,
      }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.3px',
        }}>
          My Courses
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Category filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCategoryOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--lms-card)', border: '1px solid var(--border-color)',
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {categoryFilter}
              <ChevronDown size={14} />
            </button>
            {categoryOpen && (
              <div style={{
                position: 'absolute', top: 40, right: 0, zIndex: 50, minWidth: 180,
                background: 'var(--lms-card)', border: '1px solid var(--border-color)',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '6px 0', overflow: 'hidden',
              }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setCategoryOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 16px', fontSize: 13, border: 'none', cursor: 'pointer',
                      background: cat === categoryFilter ? 'var(--hover-bg)' : 'transparent',
                      color: cat === categoryFilter ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontFamily: 'Inter, sans-serif', fontWeight: cat === categoryFilter ? 600 : 400,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = cat === categoryFilter ? 'var(--hover-bg)' : 'transparent'}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggles */}
          <div style={{
            display: 'flex', border: '1px solid var(--border-color)',
            borderRadius: 8, overflow: 'hidden', background: 'var(--lms-card)',
          }}>
            <button
              onClick={() => setView('list')}
              title="List view"
              style={{
                padding: '7px 10px', border: 'none', cursor: 'pointer',
                background: view === 'list' ? 'var(--surface-medium)' : 'transparent',
                color: view === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center',
              }}
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setView('grid')}
              title="Grid view"
              style={{
                padding: '7px 10px', border: 'none', cursor: 'pointer',
                background: view === 'grid' ? 'var(--surface-medium)' : 'transparent',
                color: view === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center',
              }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', fontSize: 13,
        }}>
          Failed to load courses.{' '}
          <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>
            Retry
          </button>
        </div>
      )}

      {/* Courses */}
      {isLoading ? (
        <div style={view === 'grid' ? {
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        } : { display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CourseSkeleton view={view} />
        </div>
      ) : !error && filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--lms-card)', borderRadius: 16,
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--surface-medium)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: 'var(--text-muted)',
          }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {categoryFilter !== 'All Categories' ? `No ${categoryFilter} courses` : 'No courses yet'}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {categoryFilter !== 'All Categories'
              ? 'Try selecting a different category.'
              : 'Once you are enrolled, your courses appear here.'}
          </p>
        </div>
      ) : view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(course => (
            <CourseListCard key={course.id} course={course} onContinue={handleContinue} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}>
          {filtered.map(course => (
            <CourseGridCard key={course.id} course={course} onContinue={handleContinue} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default MyCoursesPage;
