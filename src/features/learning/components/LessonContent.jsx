import VideoPlayer from './VideoPlayer';

/**
 * NOTE: lesson bodies are rendered as plain text on purpose.
 * If the API ever returns HTML, sanitise it (e.g. DOMPurify) before using
 * dangerouslySetInnerHTML - untrusted instructor content is an XSS vector.
 */
export const LessonContent = ({ lesson, onProgress }) => {
  if (!lesson) return null;

  return (
    <article className="u-flex-col u-gap-4">
      <h2>{lesson.title}</h2>
      {lesson.videoUrl && (
        <VideoPlayer
          src={lesson.videoUrl}
          poster={lesson.posterUrl}
          startAt={lesson.resumeAtSeconds ?? 0}
          onProgress={onProgress}
        />
      )}
      <div style={{ whiteSpace: 'pre-wrap' }}>{lesson.body}</div>
    </article>
  );
};

export default LessonContent;
