import LessonNavigation from './LessonNavigation';
import LessonContent from './LessonContent';
import ProgressBar from './ProgressBar';

export const CoursePlayer = ({ course, lesson, onProgress }) => (
  <div className="u-flex u-gap-4" style={{ alignItems: 'flex-start' }}>
    <aside style={{ width: 280, flexShrink: 0 }}>
      <ProgressBar value={course?.progressPercent ?? 0} />
      <div className="u-mt-4">
        <LessonNavigation courseId={course?.id} modules={course?.modules ?? []} />
      </div>
    </aside>
    <div className="u-grow" style={{ minWidth: 0 }}>
      <LessonContent lesson={lesson} onProgress={onProgress} />
    </div>
  </div>
);

export default CoursePlayer;
