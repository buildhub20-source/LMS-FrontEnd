import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Copy,
  Download,
  Trash2,
  Check,
  Save,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

export const LessonNotesPanel = ({
  courseId,
  courseTitle = '',
  currentLesson,
  allLessons = [],
  onSelectLesson,
}) => {
  const lessonId = currentLesson?.id || 'general';
  const lessonTitle = currentLesson?.title || 'General Notes';
  const storageKey = `lms_notes_${courseId}_${lessonId}`;

  const [noteContent, setNoteContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('current'); // 'current' | 'all'

  // Load note for current lesson
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setNoteContent(saved);
      } else {
        setNoteContent('');
      }
    } catch (_) {
      setNoteContent('');
    }
  }, [storageKey]);

  // Autosave handler (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, noteContent);
        setLastSaved(new Date());
      } catch (_) {}
    }, 600);
    return () => clearTimeout(timer);
  }, [noteContent, storageKey]);

  const handleCopy = useCallback(() => {
    if (!noteContent) return;
    navigator.clipboard.writeText(noteContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [noteContent]);

  const handleDownload = useCallback(() => {
    if (!noteContent) return;
    const blob = new Blob([`# ${courseTitle} - ${lessonTitle}\n\n${noteContent}`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseTitle.replace(/\s+/g, '_')}_${lessonTitle.replace(/\s+/g, '_')}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [courseTitle, lessonTitle, noteContent]);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear your notes for this lesson?')) {
      setNoteContent('');
      try {
        localStorage.removeItem(storageKey);
      } catch (_) {}
    }
  }, [storageKey]);

  // Aggregate all notes for this course
  const allNotes = useMemo(() => {
    if (activeSubTab !== 'all') return [];
    return allLessons
      .map((lesson) => {
        try {
          const content = localStorage.getItem(`lms_notes_${courseId}_${lesson.id}`);
          if (content && content.trim().length > 0) {
            return {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              moduleTitle: lesson.moduleTitle,
              content,
            };
          }
        } catch (_) {}
        return null;
      })
      .filter(Boolean);
  }, [activeSubTab, allLessons, courseId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface-dark, #18181b)',
        borderRadius: 12,
        border: '1px solid var(--border-color, #27272a)',
        overflow: 'hidden',
      }}
    >
      {/* Header Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-color, #27272a)',
          background: 'var(--surface-medium, #202024)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setActiveSubTab('current')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeSubTab === 'current' ? 'var(--color-primary-500, #3b82f6)' : 'transparent',
              color: activeSubTab === 'current' ? '#fff' : 'var(--text-muted, #a1a1aa)',
            }}
          >
            <FileText size={14} />
            Current Lesson
          </button>
          <button
            onClick={() => setActiveSubTab('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeSubTab === 'all' ? 'var(--color-primary-500, #3b82f6)' : 'transparent',
              color: activeSubTab === 'all' ? '#fff' : 'var(--text-muted, #a1a1aa)',
            }}
          >
            <BookOpen size={14} />
            All Course Notes
          </button>
        </div>

        {activeSubTab === 'current' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleCopy}
              disabled={!noteContent}
              title="Copy to clipboard"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color, #3f3f46)',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: noteContent ? 'pointer' : 'not-allowed',
                color: copied ? '#22c55e' : 'var(--text-secondary, #d4d4d8)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!noteContent}
              title="Download as Markdown"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color, #3f3f46)',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: noteContent ? 'pointer' : 'not-allowed',
                color: 'var(--text-secondary, #d4d4d8)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
              }}
            >
              <Download size={12} />
              Export
            </button>
            <button
              onClick={handleClear}
              disabled={!noteContent}
              title="Clear note"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 6px',
                cursor: noteContent ? 'pointer' : 'not-allowed',
                color: 'var(--text-muted, #71717a)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {activeSubTab === 'current' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-primary, #f4f4f5)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lessonTitle}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted, #71717a)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Save size={11} />
              {lastSaved ? `Autosaved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
            </span>
          </div>

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your personal notes, code snippets, and key takeaways for this lesson... (automatically saved)"
            style={{
              flex: 1,
              width: '100%',
              minHeight: 220,
              background: 'var(--surface-medium, #202024)',
              border: '1px solid var(--border-color, #27272a)',
              borderRadius: 8,
              padding: 12,
              color: 'var(--text-primary, #f4f4f5)',
              fontFamily: 'inherit',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {allNotes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 10px',
                color: 'var(--text-muted, #a1a1aa)',
                fontSize: 13,
              }}
            >
              <FileText size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No notes saved across this course yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: 11 }}>
                Switch to "Current Lesson" to write your first note!
              </p>
            </div>
          ) : (
            allNotes.map((item) => (
              <div
                key={item.lessonId}
                style={{
                  background: 'var(--surface-medium, #202024)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid var(--border-color, #27272a)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #f4f4f5)' }}>
                    {item.lessonTitle}
                  </span>
                  {onSelectLesson && (
                    <button
                      onClick={() => onSelectLesson(item.lessonId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-400, #60a5fa)',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      Jump to lesson <ExternalLink size={11} />
                    </button>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: 'var(--text-secondary, #d4d4d8)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}
                >
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LessonNotesPanel;
