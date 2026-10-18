import { useEffect } from 'react';
import learningService from '../services/learningService';

const HEARTBEAT_MS = 60_000;
const MIN_REPORT_SECONDS = 5;

/**
 * Records real study time while a lesson page is open and visible.
 *
 * Sends a heartbeat every minute with the seconds the tab was actually visible,
 * and flushes the remainder when the tab is hidden or the page closes. The
 * server caps each heartbeat, so this only ever reports, never decides, totals.
 */
export function useStudyTimer(courseId, enabled) {
  useEffect(() => {
    if (!enabled || !courseId) return undefined;

    let visibleSince = document.visibilityState === 'visible' ? Date.now() : null;

    const flush = () => {
      if (visibleSince === null) return;
      const seconds = Math.round((Date.now() - visibleSince) / 1000);
      visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
      if (seconds >= MIN_REPORT_SECONDS) {
        learningService.recordTime(courseId, seconds).catch(() => {
          // Study time is best effort; a missed heartbeat must never interrupt the lesson.
        });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        visibleSince = Date.now();
      } else {
        flush();
        visibleSince = null;
      }
    };

    const timer = window.setInterval(flush, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [courseId, enabled]);
}

export default useStudyTimer;
