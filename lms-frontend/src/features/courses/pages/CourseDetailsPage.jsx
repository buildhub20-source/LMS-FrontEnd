import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Share2, Bookmark, CheckCircle2, PauseCircle, Play, ChevronDown, ChevronUp, Edit3, ArrowLeft,
  FileText, Presentation, FileCode, Music, HelpCircle, Download, ExternalLink, BarChart2
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import useCourse from '../hooks/useCourse';
import { ROUTES } from '../../../constants/routes';
import { ROLES } from '../../../constants/roles';
import { PERMISSIONS } from '../../../constants/permissions';
import usePermission from '../../../hooks/usePermission';
import { formatSectionTitle } from '../components/CurriculumBuilder';
import CourseAnalyticsTab from '../components/CourseAnalyticsTab';

export const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: course, isLoading, error, refetch } = useCourse(courseId);
  const { hasPermission, hasAnyRole } = usePermission();

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'analytics'
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState({});

  const isAdminOrInstructor = hasPermission(PERMISSIONS.COURSE_ANALYTICS_VIEW) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/instructor') ||
    hasAnyRole([ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.INSTRUCTOR]);

  const modules = course?.modules || [];

  // Derive flat list of all lessons from course modules
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    const list = [];
    course.modules.forEach((mod) => {
      if (mod.lessons) {
        mod.lessons.forEach((l) => {
          list.push({ ...l, moduleId: mod.id, moduleTitle: mod.title });
        });
      }
    });
    return list;
  }, [course]);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    return allLessons.length > 0 ? [allLessons[0].id] : [];
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const currentLesson = allLessons[activeLessonIndex] || allLessons[0] || null;
  const completedCount = completedLessonIds.length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const toggleComplete = (id) => {
    setCompletedLessonIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleModuleCollapse = (modId) => {
    setCollapsedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Course link copied to clipboard!');
    }
  };

  const rawMedia = currentLesson?.content || currentLesson?.videoUrl || (currentLesson?.recordingId ? `/api/v1/recordings/${currentLesson.recordingId}/stream` : null);
  const mediaUrl = rawMedia;

  const isAdmin = location.pathname.startsWith('/admin');
  const backRoute = isAdmin ? ROUTES.ADMIN_COURSES : ROUTES.COURSES;
  const editRoute = isAdmin ? ROUTES.ADMIN_COURSE_EDIT(courseId) : ROUTES.COURSE_EDIT(courseId);

  return (
    <PageContainer
      title={course.title}
      breadcrumbs={[{ label: 'Courses', to: backRoute }, { label: course.title }]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* ── Top Header Navigation Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate(backRoute)}
              style={iconBtnStyle}
              title="Back to Courses"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {course.title}
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(editRoute)}
          >
            <Edit3 size={14} style={{ marginRight: 6 }} /> Edit Course
          </Button>
        </div>

        {/* ── Glassmorphic Pill Tab Navigation (Restricted to Admin & Instructor) ── */}
        {isAdminOrInstructor && (
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            <button
              onClick={() => setActiveTab('player')}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'inherit',
                border: activeTab === 'player' ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                background: activeTab === 'player' ? 'var(--text-primary)' : 'var(--lms-card)',
                color: activeTab === 'player' ? 'var(--lms-background)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Play size={16} /> Course Player & Content
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'inherit',
                border: activeTab === 'analytics' ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                background: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--lms-card)',
                color: activeTab === 'analytics' ? 'var(--lms-background)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart2 size={16} /> Statistical Analytics & Performance
            </button>
          </div>
        )}

        {isAdminOrInstructor && activeTab === 'analytics' ? (
          <CourseAnalyticsTab courseId={courseId} />
        ) : (
          /* ── Main 2-Column Layout ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 28, alignItems: 'start' }}>

          {/* ── LEFT COLUMN: Media Player + About + Suitability ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Dynamic Content / Media Player Box */}
            <div style={{
              background: '#090d16',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid var(--border-color)'
            }}>
              {currentLesson?.lessonType === 'DOCUMENT' ? (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <FileText size={56} color="#ef4444" style={{ marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  <p style={{ margin: '8px 0 20px', fontSize: 13, opacity: 0.8 }}>PDF Document Attachment</p>
                  {mediaUrl ? (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <a href={mediaUrl} target="_blank" rel="noreferrer" style={btnLinkStyle}>
                        <ExternalLink size={16} /> Open PDF Document
                      </a>
                      <a href={mediaUrl} download style={btnOutlineStyle}>
                        <Download size={16} /> Download PDF
                      </a>
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No file attached to this document lesson.</p>
                  )}
                </div>
              ) : currentLesson?.lessonType === 'PRESENTATION' ? (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <Presentation size={56} color="#f59e0b" style={{ marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  <p style={{ margin: '8px 0 20px', fontSize: 13, opacity: 0.8 }}>PPT / Presentation Slide Deck</p>
                  {mediaUrl ? (
                    <a href={mediaUrl} target="_blank" rel="noreferrer" style={btnLinkStyle}>
                      <ExternalLink size={16} /> View Presentation Deck
                    </a>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No presentation file attached.</p>
                  )}
                </div>
              ) : currentLesson?.lessonType === 'WORD_DOC' ? (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <FileText size={56} color="#2563eb" style={{ marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  <p style={{ margin: '8px 0 20px', fontSize: 13, opacity: 0.8 }}>Word Document Attachment</p>
                  {mediaUrl ? (
                    <a href={mediaUrl} download style={btnLinkStyle}>
                      <Download size={16} /> Download Word Document
                    </a>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No Word file attached.</p>
                  )}
                </div>
              ) : currentLesson?.lessonType === 'AUDIO' ? (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <Music size={56} color="#8b5cf6" style={{ marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  {mediaUrl ? (
                    <audio controls style={{ width: '80%', maxWidth: 400 }}>
                      <source src={mediaUrl} />
                      Your browser does not support audio playback.
                    </audio>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No audio file attached.</p>
                  )}
                </div>
              ) : currentLesson?.lessonType === 'TEXT' ? (
                <div style={{ width: '100%', padding: 32, color: '#ffffff', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <FileCode size={24} color="#10b981" />
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.9, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    {currentLesson.content || 'No article content available.'}
                  </div>
                </div>
              ) : currentLesson?.lessonType === 'QUIZ' ? (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <HelpCircle size={56} color="#ec4899" style={{ marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{currentLesson.title}</h3>
                  <p style={{ margin: '8px 0 20px', fontSize: 13, opacity: 0.8 }}>Practice Quiz & Knowledge Check</p>
                  <Button variant="primary" size="md" onClick={() => navigate(isAdmin ? ROUTES.ADMIN_ASSESSMENTS : ROUTES.ASSESSMENTS)}>
                    Start Assessment Test
                  </Button>
                </div>
              ) : mediaUrl ? (
                <video
                  controls
                  key={currentLesson?.id}
                  style={{ width: '100%', height: '100%', maxHeight: 420, objectFit: 'contain' }}
                  poster={currentLesson?.thumbnailUrl || course.thumbnailUrl || undefined}
                >
                  <source src={mediaUrl} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#ffffff' }}>
                  <Play size={56} style={{ opacity: 0.8, marginBottom: 12 }} />
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {currentLesson?.title || course.title}
                  </h3>
                  <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.8 }}>
                    {currentLesson?.lessonType ? `Format: ${currentLesson.lessonType}` : 'Select a lesson from the playlist on the right'}
                  </p>
                </div>
              )}
            </div>

            {/* Instructor Profile & Action Bar */}
            <div style={{
              background: 'var(--lms-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Avatar name={course.createdByName || 'Instructor'} size={44} />
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {course.createdByName || 'Simon Simorangkir'}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                    {course.instructorRole || 'Mentor • Instructor'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleShare} style={actionIconBtnStyle} title="Share Course">
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  style={{ ...actionIconBtnStyle, color: bookmarked ? '#3b82f6' : 'var(--text-muted)' }}
                  title="Save Course"
                >
                  <Bookmark size={18} fill={bookmarked ? '#3b82f6' : 'none'} />
                </button>
              </div>
            </div>

            {/* About This Course Section */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                About This Course
              </h3>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                display: '-webkit-box',
                WebkitLineClamp: showFullDesc ? 'none' : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {course.description || course.summary || 'Unlock your potential with this comprehensive course! Designed to take you from novice to confident practitioner through hands-on projects, step-by-step guidance, and expert techniques.'}
              </p>

              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{
                  background: 'transparent', border: 'none', padding: '8px 0 0',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {showFullDesc ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
              </button>
            </div>

            {/* This Course Suit For Section */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                This Course Suit For:
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                <li>Anyone who wants to start their career & get paid for their skills.</li>
                <li>This course is for beginners, newbies & amateurs in the field.</li>
                <li>For anyone that needs to add certified projects to their portfolio.</li>
                <li>Aimed at people looking for structured, high-quality learning.</li>
              </ul>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Study Progress + Course Completion Playlist ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Top Card: Your Study Progress */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Your Study Progress
                </h4>
                <span style={pctBadgeStyle}>{progressPercent}%</span>
              </div>

              {/* Stepper Progress Bar */}
              <div style={{ position: 'relative', margin: '20px 0 28px' }}>
                <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--text-primary)', borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
                
                {/* Milestone Stepper Checkpoints */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: -9, left: 0, right: 0 }}>
                  {[25, 50, 75, 100].map((step) => {
                    const reached = progressPercent >= step;
                    return (
                      <div
                        key={step}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: reached ? 'var(--text-primary)' : 'var(--lms-card)',
                          border: reached ? '2px solid var(--text-primary)' : '2px solid var(--border-color)',
                          color: reached ? 'var(--lms-background)' : 'var(--text-muted)',
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Motivational Callout Box */}
              <div style={{
                background: 'var(--surface-medium)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 14,
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                Great Job! 🎉 You&apos;re on the path to becoming certified in <strong>{course.title}</strong>. Your dedication to learning is impressive. Finish strong!
              </div>
            </div>

            {/* Bottom Card: Course Completion Playlist (GROUPED BY SECTION) */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Course Completion
                </h4>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {completedCount}/{allLessons.length || 1}
                </span>
              </div>

              {/* Section Accordions with Materials nested underneath */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {modules.length > 0 ? (
                  modules.map((mod, modIdx) => {
                    const isCollapsed = !!collapsedModules[mod.id];
                    const lessons = mod.lessons || [];

                    return (
                      <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Section Header */}
                        <div
                          onClick={() => toggleModuleCollapse(mod.id)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', borderRadius: 8,
                            background: 'var(--surface-medium)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {formatSectionTitle(mod.title, modIdx + 1)}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {lessons.length} {lessons.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {/* Lessons List in Section */}
                        {!isCollapsed && lessons.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                            {lessons.map((l) => {
                              const globalIndex = allLessons.findIndex(item => item.id === l.id);
                              const isCompleted = completedLessonIds.includes(l.id);
                              const isActive = globalIndex === activeLessonIndex;

                              return (
                                <div
                                  key={l.id}
                                  onClick={() => setActiveLessonIndex(globalIndex >= 0 ? globalIndex : 0)}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    border: isActive ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                                    background: isActive ? 'var(--surface-medium)' : 'var(--lms-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {/* Status Icon */}
                                  <div
                                    onClick={(e) => { e.stopPropagation(); toggleComplete(l.id); }}
                                    style={{ cursor: 'pointer', flexShrink: 0 }}
                                    title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                                  >
                                    {isCompleted ? (
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={14} />
                                      </div>
                                    ) : isActive ? (
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--lms-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <PauseCircle size={14} />
                                      </div>
                                    ) : (
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <Play size={11} style={{ marginLeft: 2 }} />
                                      </div>
                                    )}
                                  </div>

                                  {/* Lesson Thumbnail & Title */}
                                  {l.thumbnailUrl && (
                                    <img 
                                      src={l.thumbnailUrl} 
                                      alt={l.title} 
                                      style={{ width: 38, height: 26, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} 
                                    />
                                  )}
                                  <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{
                                      margin: 0, fontSize: 13, fontWeight: isActive ? 700 : 600,
                                      color: 'var(--text-primary)',
                                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                      {l.title}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                                      {l.durationMinutes || 20} min
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    No sections or lessons in this course yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
};

/* ── Inline Styles ── */
const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 10,
  border: '1px solid var(--border-color)',
  background: 'var(--lms-card)',
  color: 'var(--text-primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer'
};

const actionIconBtnStyle = {
  width: 38, height: 38, borderRadius: 10,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const cardStyle = {
  background: 'var(--lms-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
};

const pctBadgeStyle = {
  fontSize: 12,
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: 99,
  background: 'var(--surface-medium)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)'
};

const btnLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 20px',
  borderRadius: 10,
  background: '#3b82f6',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none'
};

const btnOutlineStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 20px',
  borderRadius: 10,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'transparent',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none'
};

export default CourseDetailsPage;
