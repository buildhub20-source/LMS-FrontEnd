import { useState, useRef } from 'react';
import {
  Eye, EyeOff, AlertCircle, Lock, Building2, ServerOff, WifiOff,
  ShieldAlert, X, BarChart3, Info, GraduationCap, ChevronDown, TrendingUp
} from 'lucide-react';
import appConfig from '../../config/appConfig';

/* ── LMS / Vertex Geometric Emblem ────────────────────────────────── */
export const VertexLogo = ({ size = 26, color = 'currentColor', className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    {/* Left crescent / petal */}
    <path
      d="M14.5 4.5C8.98 4.5 4.5 8.98 4.5 14.5C4.5 20.02 8.98 24.5 14.5 24.5C15.9 24.5 17.2 24.22 18.36 23.71C13.2 22.8 9.3 18.9 9.3 14.5C9.3 10.1 13.2 6.2 18.36 5.29C17.2 4.78 15.9 4.5 14.5 4.5Z"
      fill={color}
    />
    {/* Right sleek capsule / seed */}
    <path
      d="M20.2 7.8C18.2 8.5 16.5 11.2 16.5 14.5C16.5 17.8 18.2 20.5 20.2 21.2C23.8 20.2 26.5 17.6 26.5 14.5C26.5 11.4 23.8 8.8 20.2 7.8Z"
      fill={color}
    />
  </svg>
);

/* ── LMS Integration Icons for Floating Pills ─────────────────────── */
// 1. Class Schedule & Deadlines (Calendar)
const ScheduleIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="17" rx="3" fill="#ffffff" stroke="#4285F4" strokeWidth="2" />
    <path d="M3 9H21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 2V5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2V5" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
    <text x="12" y="17" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#1e293b" fontFamily="-apple-system, sans-serif">31</text>
  </svg>
);

// 2. Cohort Discussion & Chat (Slack)
const SlackCohortIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5.04 14.28a2.16 2.16 0 1 1-2.16-2.16h2.16v2.16z" fill="#E01E5A" />
    <path d="M6.12 14.28a2.16 2.16 0 0 1 4.32 0v5.4a2.16 2.16 0 1 1-4.32 0v-5.4z" fill="#E01E5A" />
    <path d="M9.72 5.04a2.16 2.16 0 1 1-2.16-2.16v2.16h2.16z" fill="#36C5F0" />
    <path d="M9.72 6.12a2.16 2.16 0 0 1 0 4.32H4.32a2.16 2.16 0 1 1 0-4.32h5.4z" fill="#36C5F0" />
    <path d="M18.96 9.72a2.16 2.16 0 1 1 2.16 2.16h-2.16v-2.16z" fill="#2EB67D" />
    <path d="M17.88 9.72a2.16 2.16 0 0 1-4.32 0V4.32a2.16 2.16 0 1 1 4.32 0v5.4z" fill="#2EB67D" />
    <path d="M14.28 18.96a2.16 2.16 0 1 1 2.16 2.16v-2.16h-2.16z" fill="#ECB22E" />
    <path d="M14.28 17.88a2.16 2.16 0 0 1 0-4.32h5.4a2.16 2.16 0 1 1 0 4.32h-5.4z" fill="#ECB22E" />
  </svg>
);

// 3. Accredited Certificates & Badges
const CertificateBadgeIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="9" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
    <path d="M8.5 13.5L7 21L12 18L17 21L15.5 13.5" fill="#D97706" />
    <path d="M10 9L11.5 10.5L14.5 7.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 4. Live Sessions & Lectures (LiveKit / Video)
const LiveClassIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="5" width="13" height="14" rx="3" fill="#2563EB" />
    <path d="M15 10L21 6V18L15 14V10Z" fill="#1D4ED8" />
    <circle cx="5.5" cy="8.5" r="1.3" fill="#60A5FA" />
  </svg>
);

// 5. AI Tutor & Student Support
const AITutorIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" fill="#8B5CF6" />
    <path d="M19 16L20.2 18.8L23 20L20.2 21.2L19 24L17.8 21.2L15 20L17.8 18.8L19 16Z" fill="#A78BFA" />
  </svg>
);


/* ── Error rendering ──────────────────────────────────────────────── */
const renderErrorIcon = (type) => {
  const cls = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'CREDENTIALS':      return <AlertCircle className={`${cls} text-red-400`} />;
    case 'ACCOUNT_LOCKED':   return <Lock className={`${cls} text-amber-400`} />;
    case 'TENANT_NOT_FOUND':
    case 'TENANT_INACTIVE':  return <Building2 className={`${cls} text-orange-400`} />;
    case 'SERVER_ERROR':     return <ServerOff className={`${cls} text-red-400`} />;
    case 'NETWORK_ERROR':    return <WifiOff className={`${cls} text-rose-400`} />;
    case 'RATE_LIMIT':       return <ShieldAlert className={`${cls} text-amber-400`} />;
    default:                 return <AlertCircle className={`${cls} text-red-400`} />;
  }
};

/* ── Interactive 3D LMS Learning Performance Showcase (Moving Cursors + LMS Apps) ── */
const LMSPerformanceShowcase = () => {
  const showcaseRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 8, y: -6, z: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);

  const handleMouseMove = (e) => {
    if (!showcaseRef.current) return;
    const rect = showcaseRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: 8 - (y / rect.height) * 8,
      y: -6 + (x / rect.width) * 10,
      z: 1 + (x / rect.width) * 1.5,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveCourse(null);
    setTilt({ x: 8, y: -6, z: 1 });
  };

  return (
    <div
      ref={showcaseRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        height: 385,
        paddingTop: 54,
        margin: '0 auto',
        perspective: '1100px',
      }}
    >
      {/* ── FLOATING LMS APP INTEGRATION BADGES ── */}
      {/* 1. Schedule (Top-Left: 30px clear vertical gap above card, ZERO overlap) */}
      <div
        className="vertex-pill-calendar vertex-pill-schedule-interactive"
        style={{
          position: 'absolute',
          top: 8,
          left: 12,
          zIndex: 25,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px 6px 10px',
          background: '#ffffff',
          borderRadius: 99,
          boxShadow: '0 8px 24px -3px rgba(10, 30, 50, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }}
      >
        <ScheduleIcon size={16} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>Schedule</span>
      </div>

      {/* 2. Cohort Chat (Top-Right: 30px clear vertical gap above card, ZERO overlap) */}
      <div
        className="vertex-pill-slack vertex-pill-cohort-interactive"
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          zIndex: 25,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px 6px 10px',
          background: '#ffffff',
          borderRadius: 99,
          boxShadow: '0 8px 24px -3px rgba(10, 30, 50, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }}
      >
        <SlackCohortIcon size={16} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>Cohort Chat</span>
      </div>

      {/* 3. Certificates (Mid-Left: floating below card's left boundary) */}
      <div
        className="vertex-pill-shopify vertex-pill-certs-interactive"
        style={{
          position: 'absolute',
          top: 254,
          left: -6,
          zIndex: 25,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px 6px 10px',
          background: '#ffffff',
          borderRadius: 99,
          boxShadow: '0 8px 24px -3px rgba(10, 30, 50, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }}
      >
        <CertificateBadgeIcon size={16} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>Certificates</span>
      </div>

      {/* 4. Live Classes (Mid-Right: with pulsing LIVE badge) */}
      <div
        className="vertex-pill-googleads vertex-pill-live-interactive"
        style={{
          position: 'absolute',
          top: 256,
          right: 6,
          zIndex: 25,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px 6px 10px',
          background: '#ffffff',
          borderRadius: 99,
          boxShadow: '0 8px 24px -3px rgba(10, 30, 50, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }}
      >
        <LiveClassIcon size={16} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>Live Classes</span>
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 800,
            color: '#16a34a',
            background: '#ecfdf5',
            padding: '1.5px 6px',
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3.5,
            letterSpacing: '0.04em',
          }}
        >
          <span
            style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: '#22c55e' }}
            className="vertex-live-pulse-dot"
          />
          LIVE
        </span>
      </div>

      {/* 5. AI Tutor (Bottom-Left, Angled at -8deg) */}
      <div
        className="vertex-pill-zendesk"
        style={{
          position: 'absolute',
          bottom: 8,
          left: 48,
          zIndex: 25,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px 6px 10px',
          background: '#ffffff',
          borderRadius: 99,
          boxShadow: '0 8px 24px -3px rgba(10, 30, 50, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        }}
      >
        <AITutorIcon size={16} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>AI Tutor</span>
      </div>

      {/* ── 3D LEVITATING LEARNING PERFORMANCE CARD ── */}
      <div
        className={isHovered ? '' : 'vertex-campaign-levitate'}
        style={{
          width: 342,
          margin: '0 auto',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${tilt.z}deg)`,
          transformStyle: 'preserve-3d',
          background: '#ffffff',
          borderRadius: 14,
          padding: '14px 16px 11px',
          boxShadow: isHovered
            ? '0 32px 64px -12px rgba(10, 35, 55, 0.45), 0 10px 24px -6px rgba(10, 35, 55, 0.2)'
            : '0 24px 48px -10px rgba(10, 35, 55, 0.38), 0 8px 18px -4px rgba(10, 35, 55, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.2s ease' : 'transform 0.4s ease, box-shadow 0.4s ease',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Card Header: Icon + Title + Live Status Badge + Cohort Filter Selector + Info Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(74, 222, 128, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={13} color="#16a34a" />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>Learning Performance</span>
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                color: '#16a34a',
                background: '#ecfdf5',
                border: '1px solid #bbf7d0',
                padding: '1.5px 6px',
                borderRadius: 99,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                letterSpacing: '0.02em',
              }}
            >
              <span
                style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }}
                className="vertex-live-pulse-dot"
              />
              LIVE DATA
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2.5px 7px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <span>Cohort 2025</span>
              <ChevronDown size={11} color="#64748b" />
            </div>
            <Info size={13} color="#94a3b8" style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Grouped Bar Chart Area */}
        <div style={{ position: 'relative', height: 116, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
          {/* Subtle Grid Lines with Y-axis markers */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottom: '1px dashed #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 7, color: '#94a3b8', paddingRight: 2, transform: 'translateY(-4px)' }}>100%</span>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 7, color: '#94a3b8', paddingRight: 2, transform: 'translateY(-4px)' }}>50%</span>
          </div>

          {/* Columns Container */}
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', alignItems: 'flex-end', padding: '0 8px', position: 'relative', zIndex: 2 }}>
            {/* Col 1: Web Development */}
            <div
              className="vertex-col-webdev"
              onMouseEnter={() => setActiveCourse('webdev')}
              onMouseLeave={() => setActiveCourse(null)}
              style={{
                display: 'flex',
                gap: 3.5,
                alignItems: 'flex-end',
                height: '100%',
                width: 50,
                justifyContent: 'center',
                borderRadius: '6px 6px 0 0',
                padding: '0 3px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                background: activeCourse === 'webdev' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              }}
            >
              <div className="vertex-bar-wave-1" style={{ width: 5.5, height: '54%', background: '#4ade80', borderRadius: '3px 3px 0 0', boxShadow: '0 2px 4px rgba(74, 222, 128, 0.2)' }} />
              <div className="vertex-bar-wave-2" style={{ width: 5.5, height: '86%', background: '#60a5fa', borderRadius: '3px 3px 0 0', boxShadow: '0 2px 4px rgba(96, 165, 250, 0.2)' }} />
              <div className="vertex-bar-wave-3" style={{ width: 5.5, height: '72%', background: '#1c1e2e', borderRadius: '3px 3px 0 0' }} />
            </div>

            {/* Col 2: Data Science (CHOREOGRAPHED & HIGHLIGHTED) */}
            <div
              className="vertex-col-datascience"
              onMouseEnter={() => setActiveCourse('datascience')}
              onMouseLeave={() => setActiveCourse(null)}
              style={{
                display: 'flex',
                gap: 3.5,
                alignItems: 'flex-end',
                height: '100%',
                width: 58,
                justifyContent: 'center',
                borderRadius: '6px 6px 0 0',
                padding: '0 4px',
                cursor: 'pointer',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div className="vertex-bar-wave-1" style={{ width: 5.5, height: '64%', background: '#4ade80', borderRadius: '3px 3px 0 0', boxShadow: '0 2px 6px rgba(74, 222, 128, 0.25)' }} />
              <div className="vertex-bar-wave-2" style={{ width: 5.5, height: '96%', background: '#60a5fa', borderRadius: '3px 3px 0 0', boxShadow: '0 2px 6px rgba(96, 165, 250, 0.25)' }} />
              <div className="vertex-bar-wave-3" style={{ width: 5.5, height: '56%', background: '#1c1e2e', borderRadius: '3px 3px 0 0' }} />
            </div>

            {/* Col 3: UI/UX Design */}
            <div
              className="vertex-col-uiux"
              onMouseEnter={() => setActiveCourse('uiux')}
              onMouseLeave={() => setActiveCourse(null)}
              style={{
                display: 'flex',
                gap: 3.5,
                alignItems: 'flex-end',
                height: '100%',
                width: 50,
                justifyContent: 'center',
                borderRadius: '6px 6px 0 0',
                padding: '0 3px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                background: activeCourse === 'uiux' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              }}
            >
              <div className="vertex-bar-wave-3" style={{ width: 5.5, height: '38%', background: '#4ade80', borderRadius: '3px 3px 0 0' }} />
              <div className="vertex-bar-wave-1" style={{ width: 5.5, height: '50%', background: '#60a5fa', borderRadius: '3px 3px 0 0' }} />
              <div className="vertex-bar-wave-2" style={{ width: 5.5, height: '42%', background: '#1c1e2e', borderRadius: '3px 3px 0 0' }} />
            </div>

            {/* Col 4: Cloud DevOps */}
            <div
              className="vertex-col-cloud"
              onMouseEnter={() => setActiveCourse('cloud')}
              onMouseLeave={() => setActiveCourse(null)}
              style={{
                display: 'flex',
                gap: 3.5,
                alignItems: 'flex-end',
                height: '100%',
                width: 50,
                justifyContent: 'center',
                borderRadius: '6px 6px 0 0',
                padding: '0 3px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                background: activeCourse === 'cloud' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              }}
            >
              <div className="vertex-bar-wave-2" style={{ width: 5.5, height: '46%', background: '#4ade80', borderRadius: '3px 3px 0 0' }} />
              <div className="vertex-bar-wave-3" style={{ width: 5.5, height: '82%', background: '#60a5fa', borderRadius: '3px 3px 0 0' }} />
              <div className="vertex-bar-wave-1" style={{ width: 5.5, height: '70%', background: '#1c1e2e', borderRadius: '3px 3px 0 0' }} />
            </div>
          </div>

          {/* Floating Metric Tooltip on Data Science Course with Caret Pointer */}
          <div
            className="vertex-metric-tooltip"
            style={{
              position: 'absolute',
              top: 2,
              left: 92,
              zIndex: 15,
              background: '#ffffff',
              borderRadius: 8,
              padding: '5px 9px',
              boxShadow: '0 8px 20px -2px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 3.5,
              minWidth: 138,
              userSelect: 'none',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            {/* Tooltip Downward Caret */}
            <div
              style={{
                position: 'absolute',
                bottom: -5,
                left: 64,
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #ffffff',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
              }}
            />
            {/* Top row: Module name + Score badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: '#0f172a' }}>Data Science</span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: '#16a34a',
                  background: '#ecfdf5',
                  border: '1px solid #bbf7d0',
                  padding: '1px 5px',
                  borderRadius: 99,
                }}
              >
                94% Avg
              </span>
            </div>

            {/* Bottom row: Breakdown metrics */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} className="vertex-metric-dot" />
                <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>Quiz: <b style={{ color: '#0f172a' }}>88%</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1c1e2e' }} className="vertex-metric-dot" />
                <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>Attd: <b style={{ color: '#0f172a' }}>96%</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* X-Axis Course Module Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
          <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600, width: 54, textAlign: 'center' }}>Web Dev</span>
          <span style={{ fontSize: 8, color: '#0f172a', fontWeight: 800, width: 62, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            Data Science
            <span style={{ width: 14, height: 2, background: '#4ade80', borderRadius: 99 }} />
          </span>
          <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600, width: 54, textAlign: 'center' }}>UI/UX Design</span>
          <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600, width: 50, textAlign: 'center' }}>Cloud DevOps</span>
        </div>

        {/* Card Footer: Cohort Learning Velocity */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            marginTop: 7,
            paddingTop: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={11} color="#16a34a" />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: '#16a34a' }}>Cohort Velocity +14.8%</span>
          </div>
          <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>Avg Pace 4.2h / wk</span>
        </div>
      </div>
    </div>
  );
};

/**
 * SignInPage — LMS Learning Platform Sign-In
 * Left Panel: Learning Performance Showcase with interactive moving cursors & LMS apps
 * Right Panel: Sleek Dark LMS Authentication Form Card
 */
export const SignInPage = ({
  onSignIn,
  onResetPassword,
  error,
  errorMessage,
  onDismissError,
  isSubmitting = false,
  showTenantSlug = false,
  tenantSlugHint = 'Select the learning workspace you want to access.',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const brandName = (appConfig.name || 'LMS').replace(/\s*\(dev\)/i, '').trim();

  const errorDetails = error && typeof error === 'object'
    ? { title: error.title || 'Sign In Failed', message: error.message || errorMessage || 'An error occurred.', type: error.type || 'UNKNOWN' }
    : (typeof error === 'string' && error) || errorMessage
      ? { title: 'Sign In Failed', message: typeof error === 'string' ? error : errorMessage, type: 'UNKNOWN' }
      : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        overflow: 'hidden',
        background: '#0f1117',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── Keyframe Animations Style Block ── */}
      <style>{`
        /* ── Central Card Subtle Levitation ── */
        @keyframes campaignLevitate {
          0%, 100% {
            transform: rotateX(8deg) rotateY(-6deg) rotateZ(1deg) translateY(0px);
          }
          50% {
            transform: rotateX(10deg) rotateY(-4.5deg) rotateZ(1.3deg) translateY(-5px);
          }
        }
        .vertex-campaign-levitate {
          animation: campaignLevitate 4.8s ease-in-out infinite;
        }
        /* ── Floating App Badges Continuous Motion ── */
        .vertex-pill-schedule-interactive {
          animation: pillFloat1 4.2s ease-in-out infinite;
        }
        .vertex-pill-cohort-interactive {
          animation: pillFloat2 4.8s ease-in-out infinite 0.4s;
        }
        .vertex-pill-certs-interactive {
          animation: pillFloat3 3.9s ease-in-out infinite 0.8s;
        }
        .vertex-pill-live-interactive {
          animation: pillFloat4 4.5s ease-in-out infinite 1.2s;
        }

        /* ── Tooltip Subtle Ambient Glow ── */
        @keyframes tooltipGlow {
          0%, 100% {
            box-shadow: 0 8px 20px -2px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.08);
          }
          50% {
            box-shadow: 0 10px 24px -2px rgba(15, 23, 42, 0.2), 0 0 12px rgba(74, 222, 128, 0.24);
          }
        }
        .vertex-metric-tooltip {
          animation: tooltipGlow 4.2s ease-in-out infinite;
        }

        .vertex-col-datascience {
          background: rgba(74, 222, 128, 0.08);
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.18);
        }

        /* ── Live Pulsing Dots & Waves ── */
        @keyframes livePulseDot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          50% {
            transform: scale(1.2);
            opacity: 0.85;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
        }
        .vertex-live-pulse-dot {
          animation: livePulseDot 2s ease-in-out infinite;
        }

        @keyframes barBreathe1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.05); }
        }
        .vertex-bar-wave-1 {
          transform-origin: bottom;
          animation: barBreathe1 3.4s ease-in-out infinite;
        }

        @keyframes barBreathe2 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.96); }
        }
        .vertex-bar-wave-2 {
          transform-origin: bottom;
          animation: barBreathe2 4.1s ease-in-out infinite 0.5s;
        }

        @keyframes barBreathe3 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.04); }
        }
        .vertex-bar-wave-3 {
          transform-origin: bottom;
          animation: barBreathe3 3.8s ease-in-out infinite 1s;
        }

        /* ── Floating App Badges Bobbing (Base Float) ── */
        @keyframes pillFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.3deg); }
        }

        @keyframes pillFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(5px) rotate(-0.4deg); }
        }

        @keyframes pillFloat3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-0.3deg); }
        }

        @keyframes pillFloat4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(4px) rotate(0.4deg); }
        }

        @keyframes pillFloatZendesk {
          0%, 100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-4px) rotate(-6.8deg); }
        }
        .vertex-pill-zendesk {
          animation: pillFloatZendesk 4.1s ease-in-out infinite 0.6s;
        }

        /* Interactive Pill Hover Effect */
        .vertex-pill-schedule-interactive:hover,
        .vertex-pill-cohort-interactive:hover,
        .vertex-pill-certs-interactive:hover,
        .vertex-pill-live-interactive:hover,
        .vertex-pill-zendesk:hover {
          transform: translateY(-4px) scale(1.04) !important;
          box-shadow: 0 14px 28px -3px rgba(10, 30, 50, 0.3), 0 4px 10px rgba(0, 0, 0, 0.12) !important;
        }

        /* ── Background Glow & Card Entrance ── */
        @keyframes bgGlowDrift1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.08); }
        }
        .vertex-bg-glow-1 {
          animation: bgGlowDrift1 12s ease-in-out infinite;
        }

        @keyframes bgGlowDrift2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-25px, -15px) scale(1.05); }
        }
        .vertex-bg-glow-2 {
          animation: bgGlowDrift2 10s ease-in-out infinite;
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
        .vertex-main-card {
          animation: cardEntrance 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes floatCircle1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(12px, -8px) scale(1.06); }
          66% { transform: translate(-6px, 6px) scale(0.97); }
        }
        @keyframes floatCircle2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-10px, 10px) scale(1.04); }
          70% { transform: translate(8px, -4px) scale(0.98); }
        }
        @keyframes floatCircle3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(6px, 12px) scale(1.05); }
        }
        .vertex-deco-circle {
          pointer-events: none;
          position: absolute;
          border-radius: 50%;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── RICH DARK ATMOSPHERIC BACKGROUND ─────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(at 10% 15%, rgba(74, 222, 128, 0.08) 0px, transparent 55%),
            radial-gradient(at 88% 80%, rgba(96, 165, 250, 0.06) 0px, transparent 60%),
            radial-gradient(at 85% 15%, rgba(28, 30, 46, 0.6) 0px, transparent 50%),
            radial-gradient(at 20% 85%, rgba(35, 37, 56, 0.4) 0px, transparent 55%),
            linear-gradient(135deg, #0f1117 0%, #12141f 50%, #0f1117 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Glow Orbs */}
      <div
        className="vertex-bg-glow-1"
        style={{
          position: 'absolute',
          top: '8%',
          left: '12%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 222, 128, 0.09) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="vertex-bg-glow-2"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '14%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.07) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle outer grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(42, 44, 66, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(42, 44, 66, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative Floating Circles */}
      <div
        className="vertex-deco-circle"
        style={{
          top: '4%', left: '3%',
          width: 120, height: 120,
          background: 'rgba(74, 222, 128, 0.1)',
          animation: 'floatCircle1 14s ease-in-out infinite',
        }}
      />
      <div
        className="vertex-deco-circle"
        style={{
          top: '7%', right: '8%',
          width: 72, height: 72,
          background: 'rgba(251, 191, 36, 0.08)',
          animation: 'floatCircle2 11s ease-in-out infinite',
        }}
      />
      <div
        className="vertex-deco-circle"
        style={{
          bottom: '14%', left: '5%',
          width: 64, height: 64,
          background: 'rgba(96, 165, 250, 0.08)',
          animation: 'floatCircle2 13s ease-in-out infinite',
        }}
      />
      <div
        className="vertex-deco-circle"
        style={{
          bottom: '5%', right: '6%',
          width: 130, height: 130,
          background: 'rgba(74, 222, 128, 0.06)',
          animation: 'floatCircle1 16s ease-in-out infinite',
        }}
      />

      {/* ── MAIN SPLIT CONTAINER CARD ──────────────────────────── */}
      <div
        className="vertex-main-card"
        style={{
          width: '100%',
          maxWidth: 1060,
          minHeight: 640,
          background: '#12141f',
          borderRadius: 20,
          boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.7), 0 12px 28px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px #2a2c42',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── LEFT HERO SHOWCASE PANEL (Deep Midnight Dark With Subtle Mesh Glow & Pinstripes) ── */}
        <div
          style={{
            flex: '1.05 1 450px',
            minWidth: 320,
            background: '#12141f',
            backgroundImage: `
              radial-gradient(ellipse at 20% 15%, rgba(74, 222, 128, 0.16) 0%, transparent 55%),
              radial-gradient(ellipse at 85% 85%, rgba(96, 165, 250, 0.12) 0%, transparent 55%),
              radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.05) 0%, transparent 65%),
              repeating-linear-gradient(
                -45deg,
                rgba(255, 255, 255, 0.02),
                rgba(255, 255, 255, 0.02) 1px,
                transparent 1px,
                transparent 13px
              ),
              linear-gradient(180deg, #151726 0%, #0d0f17 100%)
            `,
            borderRight: '1px solid #2a2c42',
            padding: '38px 36px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Highlight on Left Corner */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              left: '-15%',
              width: '70%',
              height: '70%',
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Brand & Copy (LMS Themed) */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Emblem */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(74, 222, 128, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={18} color="#4ade80" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                {brandName}
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                margin: '20px 0 0',
                fontSize: 27,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.22,
                letterSpacing: '-0.02em',
              }}
            >
              Unlock The Full Power<br />of Modern Learning
            </h1>

            {/* Subtitle */}
            <p
              style={{
                margin: '10px 0 0',
                fontSize: 12.5,
                lineHeight: 1.55,
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: 360,
              }}
            >
              Smart curriculum workflows, live cohort sessions, interactive quizzes, and verified skill credentials
            </p>
          </div>

          {/* Center 3D Isometric Showcase (With Moving Cursors & 5 LMS App Badges) */}
          <div style={{ position: 'relative', zIndex: 10, margin: '8px 0 10px' }}>
            <LMSPerformanceShowcase />
          </div>

          {/* Bottom Copyright */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              fontSize: 11,
              color: '#6e6e88',
              letterSpacing: '0.02em',
            }}
          >
            &copy; {brandName} Platform 2025. All Rights Reserved
          </div>
        </div>

        {/* ── RIGHT AUTHENTICATION PANEL (Dark with subtle grid) ── */}
        <div
          style={{
            flex: '1 1 430px',
            minWidth: 320,
            background: '#12141f',
            backgroundImage: `
              linear-gradient(to right, rgba(42, 44, 66, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(42, 44, 66, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '46px 46px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 28px',
          }}
        >
          {/* Decorative Corner Hatching Marks */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 96,
              height: 96,
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(42, 44, 66, 0.5), rgba(42, 44, 66, 0.5) 1px, transparent 1px, transparent 6px)',
              pointerEvents: 'none',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 96,
              height: 96,
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(42, 44, 66, 0.5), rgba(42, 44, 66, 0.5) 1px, transparent 1px, transparent 6px)',
              pointerEvents: 'none',
              opacity: 0.9,
            }}
          />

          {/* Elevated Centered Form Card (STRICTLY LMS SIGN IN) */}
          <div
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#1c1e2e',
              borderRadius: 16,
              border: '1px solid #2a2c42',
              boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
              padding: '34px 30px 32px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Header Icon Emblem */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(74, 222, 128, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={22} color="#4ade80" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2
              style={{
                margin: '12px 0 0',
                fontSize: 19,
                fontWeight: 700,
                color: '#f0f0f5',
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}
            >
              Sign In to <span style={{ color: '#4ade80', fontWeight: 700 }}>{brandName}</span>
            </h2>
            <p
              style={{
                margin: '5px auto 20px',
                fontSize: 12,
                color: '#94a3b8',
                textAlign: 'center',
                lineHeight: 1.45,
                maxWidth: 290,
              }}
            >
              Access your courses, track your cohorts, and continue learning
            </p>

            {/* Error Notification */}
            {errorDetails && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 7,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  marginBottom: 16,
                }}
              >
                <div style={{ marginTop: 2 }}>{renderErrorIcon(errorDetails.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fca5a5' }}>
                    {errorDetails.title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#f87171', lineHeight: 1.35 }}>
                    {errorDetails.message}
                  </p>
                </div>
                {onDismissError && (
                  <button
                    type="button"
                    onClick={onDismissError}
                    aria-label="Dismiss error"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      color: '#f87171',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSignIn} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#b8b8cc', marginBottom: 5 }}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="student@learning.edu"
                  onChange={() => onDismissError?.()}
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 12px',
                    fontSize: 13,
                    color: '#f0f0f5',
                    background: '#151726',
                    border: '1px solid #2a2c42',
                    borderRadius: 7,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = '#4ade80';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.18)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#2a2c42';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label
                    htmlFor="password"
                    style={{ fontSize: 11, fontWeight: 500, color: '#b8b8cc' }}
                  >
                    Password
                  </label>
                  {onResetPassword && (
                    <button
                      type="button"
                      onClick={onResetPassword}
                      aria-label="Reset password"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 11,
                        fontWeight: 500,
                        color: '#94a3b8',
                        cursor: 'pointer',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    onChange={() => onDismissError?.()}
                    style={{
                      width: '100%',
                      height: 38,
                      paddingLeft: 12,
                      paddingRight: 34,
                      fontSize: 13,
                      color: '#f0f0f5',
                      background: '#151726',
                      border: '1px solid #2a2c42',
                      borderRadius: 7,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#4ade80';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.18)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#2a2c42';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute',
                      right: 9,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f0f0f5'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Optional Tenant Slug */}
              {showTenantSlug && (
                <div>
                  <label
                    htmlFor="tenantSlug"
                    style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#b8b8cc', marginBottom: 5 }}
                  >
                    Learning Workspace / Campus <span style={{ fontWeight: 400, color: '#6e6e88' }}>(optional)</span>
                  </label>
                  <input
                    id="tenantSlug"
                    name="tenantSlug"
                    type="text"
                    autoComplete="organization"
                    placeholder="e.g. acme-academy"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px',
                      fontSize: 13,
                      color: '#f0f0f5',
                      background: '#151726',
                      border: '1px solid #2a2c42',
                      borderRadius: 7,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#4ade80';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.18)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#2a2c42';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{ margin: '3px 0 0', fontSize: 10, color: '#6e6e88' }}>{tenantSlugHint}</p>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: -2 }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width: 15,
                    height: 15,
                    accentColor: '#4ade80',
                    cursor: 'pointer',
                  }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
                  Remember for 30 days
                </label>
              </div>

              {/* Primary Action Button (LMS Emerald Green) */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: 42,
                  marginTop: 6,
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#0f1117',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s, color 0.15s',
                  boxShadow: '0 4px 16px rgba(74, 222, 128, 0.35)',
                }}
                onMouseEnter={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 22px rgba(74, 222, 128, 0.45)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
                    e.currentTarget.style.color = '#0f1117';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(74, 222, 128, 0.35)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(15,17,23,0.3)" strokeWidth="3" fill="none" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#0f1117" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
