import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  background: isActive ? 'var(--color-primary-50)' : 'transparent',
  color: isActive ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
});

export const LessonNavigation = ({ courseId, modules = [] }) => (
  <nav aria-label="Course contents" className="u-flex-col u-gap-3">
    {modules.map((module) => (
      <section key={module.id}>
        <p className="u-text-sm">{module.title}</p>
        {module.lessons.map((lesson) => (
          <NavLink key={lesson.id} to={ROUTES.LESSON(courseId, lesson.id)} style={linkStyle}>
            {lesson.completed ? '✓ ' : ''}
            {lesson.title}
          </NavLink>
        ))}
      </section>
    ))}
  </nav>
);

export default LessonNavigation;
