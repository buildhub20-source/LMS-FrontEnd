import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Plus, LayoutList, LayoutGrid, Code, CheckCircle, Copy,
  Clock, Award, FileText, Code2, Shield, Sparkles, BarChart2, CheckCircle2
} from 'lucide-react';
import adminAssessmentService from '../services/adminAssessmentService';
import AdminButton from '../../../components/ui/AdminButton';
import { AdminConfirmModal } from '../../../components/ui/AdminModal';
import AdminPagination from '../../../components/ui/AdminPagination';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import { ASSESSMENT_STATUS } from '../constants/assessmentConstants';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';
import {
  useAdminAssessments,
  usePublishAssessment,
  useUnpublishAssessment,
  useCloseAssessment,
  useArchiveAssessment,
  useDeleteAdminAssessment,
} from '../hooks/useAdminAssessments';

/* ── Tech Visual Presets & SVG Emblems (matching Courses aesthetic) ── */
const TECH_PRESETS = {
  react: {
    name: 'Frontend & React',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0c2340 0%, #0369a1 60%, #0284c7 100%)',
    glow: 'rgba(56, 189, 248, 0.25)',
    border: 'rgba(56, 189, 248, 0.3)',
    pillBg: 'rgba(56, 189, 248, 0.15)',
    pillColor: '#7dd3fc',
    emblem: (
      <svg width="40" height="40" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
        <circle cx="0" cy="0" r="2.05" fill="#38bdf8" />
        <g stroke="#38bdf8" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  angular: {
    name: 'Angular Framework',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #be123c 60%, #e11d48 100%)',
    glow: 'rgba(244, 63, 94, 0.25)',
    border: 'rgba(244, 63, 94, 0.3)',
    pillBg: 'rgba(244, 63, 94, 0.15)',
    pillColor: '#fda4af',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 250 250" fill="none">
        <polygon points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2" fill="rgba(244,63,94,0.3)" stroke="#f43f5e" strokeWidth="14" />
        <polygon points="125,52.1 125,153.4 125,153.4 125,207 182.2,175.2 193.3,79.1" fill="rgba(244,63,94,0.5)" />
        <path d="M125 78.5L84.2 173.3h18.8l8.2-20.7h27.6v-15.4h-21.4l12.6-31.5L125 78.5z" fill="#fff" />
      </svg>
    ),
  },
  fullstack: {
    name: 'Full-Stack Architecture',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #022c22 0%, #047857 60%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.3)',
    pillBg: 'rgba(16, 185, 129, 0.15)',
    pillColor: '#6ee7b7',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  java: {
    name: 'Data Structures & Algorithms',
    accent: '#f97316',
    gradient: 'linear-gradient(135deg, #431407 0%, #c2410c 60%, #ea580c 100%)',
    glow: 'rgba(249, 115, 22, 0.25)',
    border: 'rgba(249, 115, 22, 0.3)',
    pillBg: 'rgba(249, 115, 22, 0.15)',
    pillColor: '#fdba74',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" />
        <circle cx="5" cy="19" r="3" />
        <circle cx="19" cy="19" r="3" />
        <line x1="12" y1="8" x2="5" y2="16" />
        <line x1="12" y1="8" x2="19" y2="16" />
      </svg>
    ),
  },
  database: {
    name: 'Database & SQL',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #082f49 0%, #0369a1 60%, #0891b2 100%)',
    glow: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.3)',
    pillBg: 'rgba(6, 182, 212, 0.15)',
    pillColor: '#67e8f9',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  cloud: {
    name: 'Cloud & DevOps',
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, #083344 0%, #0e7490 60%, #06b6d4 100%)',
    glow: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.3)',
    pillBg: 'rgba(6, 182, 212, 0.15)',
    pillColor: '#67e8f9',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    ),
  },
  ai: {
    name: 'AI & Data Science',
    accent: '#14b8a6',
    gradient: 'linear-gradient(135deg, #042f2e 0%, #0f766e 60%, #0d9488 100%)',
    glow: 'rgba(20, 184, 166, 0.25)',
    border: 'rgba(20, 184, 166, 0.3)',
    pillBg: 'rgba(20, 184, 166, 0.15)',
    pillColor: '#5eead4',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
      </svg>
    ),
  },
  math: {
    name: 'Mathematics & Calculus',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
    glow: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.3)',
    pillBg: 'rgba(16, 185, 129, 0.15)',
    pillColor: '#6ee7b7',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v3L10 17h10v3H4v-3l10-10H4V4z" />
      </svg>
    ),
  },
  qa: {
    name: 'Verification & QA',
    accent: '#059669',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 60%, #047857 100%)',
    glow: 'rgba(5, 150, 105, 0.25)',
    border: 'rgba(5, 150, 105, 0.3)',
    pillBg: 'rgba(5, 150, 105, 0.15)',
    pillColor: '#6ee7b7',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  generic: {
    name: 'Core Assessment',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #022c22 0%, #047857 60%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.3)',
    pillBg: 'rgba(16, 185, 129, 0.15)',
    pillColor: '#6ee7b7',
    emblem: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
};

function getTechPreset(title = '', type = '') {
  const t = (title + ' ' + type).toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('javascript') || t.includes('js')) return TECH_PRESETS.react;
  if (t.includes('angular') || t.includes('vue')) return TECH_PRESETS.angular;
  if (t.includes('sql') || t.includes('database') || t.includes('db') || t.includes('postgres') || t.includes('mongo')) return TECH_PRESETS.database;
  if (t.includes('tree') || t.includes('graph') || t.includes('algorithm') || t.includes('dsa') || t.includes('data structure') || t.includes('java')) return TECH_PRESETS.java;
  if (t.includes('cloud') || t.includes('devops') || t.includes('aws') || t.includes('docker') || t.includes('kubernetes')) return TECH_PRESETS.cloud;
  if (t.includes('ai') || t.includes('python') || t.includes('machine') || t.includes('learning')) return TECH_PRESETS.ai;
  if (t.includes('calculus') || t.includes('math') || t.includes('exam')) return TECH_PRESETS.math;
  if (t.includes('verif') || t.includes('test') || t.includes('qa')) return TECH_PRESETS.qa;
  if (t.includes('full') || t.includes('stack') || t.includes('backend') || t.includes('web') || t.includes('coding')) return TECH_PRESETS.fullstack;
  return TECH_PRESETS.generic;
}

function getInitials(str = '') {
  return str.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'AS';
}

function TypeBadge({ type }) {
  const t = (type || 'CODING').toUpperCase();
  const label = t.replace('_', ' ');
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        letterSpacing: '0.3px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backdropFilter: 'blur(6px)',
      }}
    >
      <Code2 size={12} />
      {label.charAt(0) + label.slice(1).toLowerCase()}
    </span>
  );
}

/* ── status ── */
const SC = {
  DRAFT: { label: 'Draft', bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'rgba(255, 255, 255, 0.15)' },
  PUBLISHED: { label: 'Published', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  CLOSED: { label: 'Closed', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  ARCHIVED: { label: 'Archived', bg: 'rgba(100, 116, 139, 0.18)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.35)' },
};

function StatusPill({ status }) {
  const c = SC[status] ?? SC.DRAFT;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {c.label}
    </span>
  );
}

/* ── avatar ── */
function Avatar({ name = '', size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)'
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ── action builder ── */
function buildActions(assessment, onAction) {
  const s = assessment.status, A = [];
  if (s === 'DRAFT') {
    A.push({ label: 'Publish', danger: false, onClick: () => onAction('publish', assessment) });
    A.push({ label: 'Delete', danger: true, onClick: () => onAction('delete', assessment) });
  }
  if (s === 'PUBLISHED') {
    A.push({ label: 'Unpublish', danger: false, onClick: () => onAction('unpublish', assessment) });
    A.push({ label: 'Close', danger: true, onClick: () => onAction('close', assessment) });
  }
  if (s === 'CLOSED' || s === 'PUBLISHED') {
    A.push({ label: 'Archive', danger: true, onClick: () => onAction('archive', assessment) });
  }
  return A;
}

/* ── Modern Assessment Card (Matching Course Card Design) ── */
function AssessmentCard({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0] ?? null;
  const preset = getTechPreset(assessment.title, assessment.type);
  const initials = getInitials(assessment.title);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        cursor: 'pointer',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--primary, #10b981)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.08))';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))';
      }}
    >
      {/* Visual Header Banner */}
      <div
        style={{
          height: 135,
          background: assessment.thumbnailUrl ? `url(${assessment.thumbnailUrl}) center/cover` : preset.gradient,
          position: 'relative',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Subtle mesh overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Tech Emblem Background Graphic */}
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 8,
            opacity: 0.85,
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            pointerEvents: 'none',
          }}
        >
          {preset.emblem}
        </div>

        {/* Top Badges */}
        <div style={{ zIndex: 2, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <TypeBadge type={assessment.type} />
          <span
            style={{
              padding: '3px 9px',
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(0,0,0,0.5)',
              color: '#f1f5f9',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {preset.name}
          </span>
        </div>

        {/* Top-Right Status Pill */}
        <div style={{ zIndex: 2 }}>
          <StatusPill status={assessment.status} />
        </div>

        {/* Logo Monogram inside Banner */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 15,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 3,
          }}
        >
          {initials}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
        <div>
          <h3
            style={{
              margin: '0 0 6px',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary, #1a1a2e)',
              lineHeight: 1.35,
            }}
          >
            {assessment.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-muted, #64748b)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {assessment.description || 'Comprehensive evaluation covering algorithmic reasoning, implementation correctness, and automated grading.'}
          </p>
        </div>

        {/* Stats strip matching Courses */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--color-bg, #f5f7fa)',
            border: '1px solid var(--border, #e2e8f0)',
            fontSize: 12,
            color: 'var(--text-secondary, #4a5568)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} style={{ color: preset.accent }} />
            <span>{assessment.questionCount || 0} Questions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: preset.accent }} />
            <span>{assessment.durationMinutes || 0} Mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={14} style={{ color: '#f59e0b' }} />
            <span>{assessment.totalMarks || 100} Marks</span>
          </div>
          {assessment.proctored !== false && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', color: '#10b981', fontWeight: 600 }}>
              <Shield size={14} />
              <span>Proctored</span>
            </div>
          )}
        </div>

        {/* Score / Weightage Bar */}
        <div style={{ marginTop: 'auto', paddingTop: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Weightage / Score</span>
            <span style={{ color: 'var(--text-primary)' }}>{assessment.totalMarks || 0}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border, #e2e8f0)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, assessment.totalMarks || 100)}%`,
                background: `linear-gradient(90deg, ${preset.accent} 0%, var(--primary, #10b981) 100%)`,
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border, #e2e8f0)' }} />

        {/* Creator & Action Buttons matching Courses */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar name={assessment.createdByName ?? 'Platform Admin'} size={32} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {assessment.createdByName ?? 'Platform Admin'}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Instructor</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onAction('edit', assessment)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--muted, #f8fafc)',
                color: 'var(--text-primary, #1a1a2e)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card, #ffffff)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--muted, #f8fafc)'; }}
            >
              Edit
            </button>
            <button
              onClick={() => onAction('duplicate', assessment)}
              title="Duplicate assessment"
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--background, #f8fafc)',
                color: 'var(--text-secondary, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card, #ffffff)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--background, #f8fafc)'; }}
            >
              <Copy size={15} />
            </button>
            {primary && (
              <button
                onClick={primary.onClick}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  border: primary.danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                  background: primary.danger ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, var(--primary, #10b981) 0%, #059669 100%)',
                  color: primary.danger ? '#f87171' : '#fff',
                  cursor: 'pointer',
                  boxShadow: primary.danger ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                {primary.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modern List Row (Matching Course List View) ── */
function AssessmentListRow({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0];
  const preset = getTechPreset(assessment.title, assessment.type);

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        gap: 16,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--primary, #10b981)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 6px 18px rgba(0,0,0,0.08))';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))';
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: preset.pillBg,
          border: `1px solid ${preset.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: preset.accent,
          flexShrink: 0,
        }}
      >
        <Code2 size={20} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{assessment.title}</span>
          <StatusPill status={assessment.status} />
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 700,
              background: preset.pillBg,
              color: preset.pillColor,
              border: `1px solid ${preset.border}`,
            }}
          >
            {preset.name}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {assessment.questionCount || 0} Questions • {assessment.durationMinutes || 0} Mins • {assessment.totalMarks || 100} Marks • Proctored
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
        <Avatar name={assessment.createdByName ?? 'Platform Admin'} size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{assessment.createdByName ?? 'Platform Admin'}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Instructor</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, borderLeft: '1px solid var(--border)', paddingLeft: 16, shrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onAction('edit', assessment)}
          style={{
            padding: '7px 16px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--muted, #f8fafc)',
            color: 'var(--text-primary, #1a1a2e)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card, #ffffff)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--muted, #f8fafc)'; }}
        >
          Edit
        </button>
        <button
          onClick={() => onAction('duplicate', assessment)}
          title="Duplicate assessment"
          style={{
            padding: '7px 12px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--background, #f8fafc)',
            color: 'var(--text-secondary, #64748b)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card, #ffffff)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--background, #f8fafc)'; }}
        >
          <Copy size={15} />
        </button>
        {primary && (
          <button
            onClick={primary.onClick}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              border: primary.danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
              background: primary.danger ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, var(--primary, #10b981) 0%, #059669 100%)',
              color: primary.danger ? '#f87171' : '#fff',
              cursor: 'pointer',
              boxShadow: primary.danger ? 'none' : '0 2px 10px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            {primary.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  const s = { background: 'var(--skeleton-bg, #e2e8f0)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))' }}>
      <div style={{ ...s, height: 135, borderRadius: 0, background: 'var(--skeleton-subtle, #f1f5f9)' }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...s, height: 18, width: '70%' }} />
        <div style={{ ...s, height: 14, width: '90%' }} />
        <div style={{ ...s, height: 6, borderRadius: 99, marginTop: 10 }} />
        <div style={{ height: 1, background: 'var(--border, #e2e8f0)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ ...s, width: 32, height: 32, borderRadius: '50%' }} />
            <div style={{ ...s, height: 14, width: 80 }} />
          </div>
          <div style={{ ...s, width: 64, height: 28, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['ALL', ...Object.values(ASSESSMENT_STATUS)];

/* ── Page ── */
export const AdminAssessmentListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success: toastSuccess, error: toastError } = useToast();

  const isInstructor = location.pathname.startsWith('/instructor');
  const detailsRoute = (id) => isInstructor ? ROUTES.INSTRUCTOR_ASSESSMENT_DETAILS(id) : ROUTES.ADMIN_ASSESSMENT_DETAILS(id);
  const createRoute = isInstructor ? ROUTES.ASSESSMENT_CREATE : ROUTES.ADMIN_ASSESSMENT_CREATE;

  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState('grid');
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading, error, refetch } = useAdminAssessments({
    page,
    size: pageSize,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const publishMut   = usePublishAssessment();
  const unpublishMut = useUnpublishAssessment();
  const closeMut     = useCloseAssessment();
  const archiveMut   = useArchiveAssessment();
  const deleteMut    = useDeleteAdminAssessment();

  const assessments = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const doAction = async (assessment, actionType, mutation, msg) => {
    setConfirmAction(a => ({ ...a, loading: true }));
    try {
      await mutation.mutateAsync(assessment.id);
      toastSuccess(msg);
      setConfirmAction(null);
    } catch (err) {
      toastError(err?.message ?? 'Failed.');
      setConfirmAction(a => ({ ...a, loading: false }));
    }
  };

  const handleAction = (type, assessment) => {
    if (type === 'edit') {
      navigate(detailsRoute(assessment.id));
      return;
    }
    if (type === 'duplicate') {
      adminAssessmentService.duplicate(assessment.id)
        .then(() => {
          toastSuccess(`"${assessment.title}" duplicated into DRAFT!`);
          refetch();
        })
        .catch((err) => {
          toastError(err?.response?.data?.message || err?.message || 'Failed to duplicate assessment.');
        });
      return;
    }
    const MAP = {
      publish: { mutation: publishMut, msg: 'Published!' },
      unpublish: { mutation: unpublishMut, msg: 'Unpublished.' },
      close: { mutation: closeMut, msg: 'Closed.' },
      archive: { mutation: archiveMut, msg: 'Archived.' },
      delete: { mutation: deleteMut, msg: 'Deleted.' },
    };
    if (MAP[type]) {
      setConfirmAction({
        assessment,
        action: type,
        loading: false,
        fn: () => doAction(assessment, type, MAP[type].mutation, MAP[type].msg)
      });
    }
  };

  const f = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--lms-card)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', outline: 'none' };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Assessments</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
            Create, manage, and evaluate student assessments and tests.
          </p>
        </div>
        <PermissionGuard required={[PERMISSIONS.ASSESSMENT_CREATE]} fallback={null}>
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate(createRoute)}>New Assessment</AdminButton>
        </PermissionGuard>
      </div>

      {/* filter bar */}
      <div style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)', pointerEvents: 'none' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(0), setSearch(searchInput))}
              placeholder="Search assessments…"
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--color-bg, #f5f7fa)',
                color: 'var(--text-primary, #1a1a2e)',
                fontSize: 14,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary, #22c55e)'; e.target.style.background = 'var(--card, #ffffff)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border, #e2e8f0)'; e.target.style.background = 'var(--color-bg, #f5f7fa)'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--color-bg, #f5f7fa)', padding: 4, borderRadius: 99, border: '1px solid var(--border, #e2e8f0)' }}>
            {STATUS_FILTERS.map(s => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => { setPage(0); setStatusFilter(s); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: active ? 'var(--text-primary, #1a1a2e)' : 'transparent',
                    color: active ? 'var(--color-surface, #ffffff)' : 'var(--text-secondary, #64748b)',
                    border: 'none',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary, #1a1a2e)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary, #64748b)'; }}
                >
                  {s === 'ALL' ? 'All' : SC[s]?.label ?? s}
                </button>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 10,
            overflow: 'hidden',
            marginLeft: 'auto',
            background: 'var(--color-bg, #f5f7fa)',
            padding: 3,
            gap: 2,
          }}>
            {[{ id: 'list', I: LayoutList }, { id: 'grid', I: LayoutGrid }].map(({ id, I }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  background: view === id ? 'var(--card, #ffffff)' : 'transparent',
                  color: view === id ? 'var(--text-primary, #1a1a2e)' : 'var(--text-muted, #94a3b8)',
                  boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <I size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          {error?.message ?? 'Failed to load assessments.'} <button onClick={refetch} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      ) : assessments.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 18 }}>No assessments found</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15 }}>{search || statusFilter !== 'ALL' ? 'Try adjusting your search or filter.' : 'Create your first assessment to get started.'}</p>
        </div>
      ) : view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {assessments.map(a => <AssessmentCard key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(detailsRoute(a.id))} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assessments.map(a => <AssessmentListRow key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(detailsRoute(a.id))} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      )}

      {/* confirm action */}
      {confirmAction && (
        <AdminConfirmModal open
          title={`${confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)} Assessment`}
          description={`Are you sure you want to ${confirmAction.action} "${confirmAction.assessment.title}"?`}
          confirmLabel={confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)}
          danger={['delete', 'archive', 'close'].includes(confirmAction.action)}
          loading={confirmAction.loading} onConfirm={confirmAction.fn} onCancel={() => setConfirmAction(null)}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default AdminAssessmentListPage;
