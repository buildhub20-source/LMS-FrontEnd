import { FileText, Download, BookOpen } from 'lucide-react';

export const LessonResourcesPanel = ({ currentLesson }) => {
  const displayList = [
    ...(currentLesson?.resources || []),
    ...(currentLesson?.attachments || []),
  ].filter((item) => item?.url);

  const handleDownload = (item) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface-dark, #18181b)',
        borderRadius: 12,
        border: '1px solid var(--border-color, #27272a)',
        padding: 16,
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={16} style={{ color: 'var(--color-primary-400, #60a5fa)' }} />
          <h4
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary, #f4f4f5)',
            }}
          >
            Lesson Resources & Downloads
          </h4>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted, #71717a)' }}>
          {displayList.length} {displayList.length === 1 ? 'file' : 'files'} available
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {displayList.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted, #71717a)' }}>
            No lesson resources have been uploaded yet.
          </p>
        )}
        {displayList.map((item) => (
          <div
            key={item.id || item.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 8,
              background: 'var(--surface-medium, #202024)',
              border: '1px solid var(--border-color, #27272a)',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon || <FileText size={18} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary, #f4f4f5)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 11,
                    color: 'var(--text-muted, #71717a)',
                  }}
                >
                  {item.type || 'Document'} · {item.size || 'Attachment'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'var(--surface-light, #27272a)',
                border: '1px solid var(--border-color, #3f3f46)',
                color: 'var(--text-primary, #f4f4f5)',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#3f3f46')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'var(--surface-light, #27272a)')
              }
            >
              <Download size={13} />
              {item.action || 'Download'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonResourcesPanel;
