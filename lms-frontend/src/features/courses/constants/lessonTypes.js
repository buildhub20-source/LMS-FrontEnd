import { Video, FileText, Presentation, FileCode, Music, HelpCircle } from 'lucide-react';

export const LESSON_TYPE_MAP = {
  VIDEO: { label: 'Video Lesson', icon: Video, color: '#3b82f6', accept: 'video/*' },
  DOCUMENT: {
    label: 'PDF Document',
    icon: FileText,
    color: '#ef4444',
    accept: '.pdf,application/pdf',
  },
  PRESENTATION: {
    label: 'PPT / Presentation',
    icon: Presentation,
    color: '#f59e0b',
    accept:
      '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  WORD_DOC: {
    label: 'Word Document',
    icon: FileText,
    color: '#2563eb',
    accept:
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  TEXT: { label: 'Text / Article', icon: FileCode, color: '#10b981', accept: null },
  AUDIO: { label: 'Audio Recording', icon: Music, color: '#8b5cf6', accept: 'audio/*' },
  QUIZ: { label: 'Quiz / Practice', icon: HelpCircle, color: '#ec4899', accept: null },
};
