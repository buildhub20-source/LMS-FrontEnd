import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Download,
  ExternalLink,
  Calendar,
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Globe,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import Button from '../../../components/common/Button';
import certificateService from '../services/certificateService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import ImportCertificateModal from '../components/ImportCertificateModal';

const handleDownload = async (id, courseName) => {
  try {
    const res = await certificateService.download(id);
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${courseName?.replace(/\s+/g, '-') ?? id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // silently ignore — user can retry
  }
};

function CertificateSkeletonCard() {
  const s = { background: 'var(--skeleton-bg, #e2e8f0)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...s, width: 44, height: 44, borderRadius: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ ...s, width: 90, height: 12 }} />
          <div style={{ ...s, width: '70%', height: 16 }} />
        </div>
      </div>
      <div style={{ ...s, height: 14, width: '90%' }} />
      <div style={{ ...s, height: 14, width: '50%' }} />
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', gap: 10, marginTop: 'auto' }}>
        <div style={{ ...s, height: 34, flex: 1, borderRadius: 8 }} />
        <div style={{ ...s, height: 34, width: 38, borderRadius: 8 }} />
      </div>
    </div>
  );
}

/**
 * Fully wired certificate gallery page.
 * Displays both LMS-earned certificates and imported external credentials.
 */
export const CertificateListPage = () => {
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'LMS' | 'IMPORTED'

  // Persistent imported external credentials
  const [importedCerts, setImportedCerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lms_imported_certificates') || '[]');
    } catch {
      return [];
    }
  });

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.list(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const lmsCerts = raw?.data?.data?.content ?? raw?.data?.content ?? raw?.data ?? [];
  const totalCount = lmsCerts.length + importedCerts.length;

  const handleImportSuccess = (newCert) => {
    setImportedCerts((prev) => [newCert, ...prev]);
  };

  const handleDeleteImported = (id, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to remove this imported credential from your portfolio?')) {
      const updated = importedCerts.filter((c) => c.id !== id);
      setImportedCerts(updated);
      localStorage.setItem('lms_imported_certificates', JSON.stringify(updated));
    }
  };

  const filteredCerts =
    filterTab === 'LMS'
      ? lmsCerts
      : filterTab === 'IMPORTED'
      ? importedCerts
      : [...importedCerts, ...lmsCerts];

  return (
    <PageContainer
      title="Certificates & Credentials"
      subtitle="Verifiable qualifications, completed course diplomas, and external licenses."
      actions={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
            iconLeft={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            iconLeft={<Upload size={14} />}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            Import Certificate
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        {/* Top KPI Ribbon */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              flex: '1 1 200px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Credentials
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {isLoading ? '—' : totalCount}
            </div>
          </div>
          <div
            style={{
              flex: '1 1 200px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Imported External
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>
              {isLoading ? '—' : importedCerts.length}
            </div>
          </div>
          <div
            style={{
              flex: '1 1 200px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Passing Standard
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
              70%+
            </div>
          </div>
          <div
            style={{
              flex: '1 1 200px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 20px',
              boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Verification Protocol
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              Blockchain
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[
              { id: 'ALL', label: `All Credentials (${totalCount})` },
              { id: 'LMS', label: `LMS Certified (${lmsCerts.length})` },
              { id: 'IMPORTED', label: `Imported / External (${importedCerts.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: filterTab === tab.id ? 'var(--color-primary, #6366f1)' : 'var(--surface-medium)',
                  color: filterTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#a5b4fc',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Add External Credential
          </button>
        </div>

        {/* Credentials Grid or Empty Pathway */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CertificateSkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCerts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredCerts.map((cert) => {
              const isImported = Boolean(cert.isImported);

              if (isImported) {
                return (
                  <div
                    key={cert.id}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: 16,
                      padding: 24,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))';
                    }}
                  >
                    {/* Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: 'rgba(99, 102, 241, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6366f1',
                          }}
                        >
                          <Award size={22} />
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: '#6366f1',
                              textTransform: 'uppercase',
                              letterSpacing: '0.8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <ShieldCheck size={11} /> {cert.issuer || 'External Credential'}
                          </span>
                          <h4 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {cert.title}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteImported(cert.id, e)}
                        title="Delete imported credential"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 4,
                          borderRadius: 6,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                      {cert.issuedAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="#64748b" />
                          <span>
                            Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          {cert.expiresAt && (
                            <span style={{ fontSize: 11, opacity: 0.7 }}>
                              · Exp: {new Date(cert.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      )}

                      {cert.credentialId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ID:</span>
                          <code style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#cbd5e1' }}>
                            {cert.credentialId}
                          </code>
                        </div>
                      )}

                      {cert.grade && (
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ★ Honors / Grade: {cert.grade}
                        </div>
                      )}

                      {cert.skills && cert.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                          {cert.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: 10,
                                background: 'rgba(255,255,255,0.06)',
                                padding: '2px 7px',
                                borderRadius: 4,
                                color: '#94a3b8',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', gap: 8 }}>
                      {cert.verificationUrl ? (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 8,
                            color: '#a5b4fc',
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                          }}
                        >
                          <ExternalLink size={13} /> Verify Online
                        </a>
                      ) : (
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            fontSize: 11,
                            color: '#10b981',
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 size={13} /> Self-Verified
                        </div>
                      )}

                      {cert.fileDataUrl && (
                        <a
                          href={cert.fileDataUrl}
                          download={cert.fileName || 'certificate.pdf'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            color: '#ffffff',
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          <Download size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              }

              // Standard LMS Earned Certificate Card
              return (
                <div
                  key={cert.id}
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
                    borderRadius: 16,
                    padding: 24,
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 10px 30px rgba(99,102,241,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(99,102,241,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.3)';
                  }}
                  onClick={() => navigate(ROUTES.CERTIFICATE_DETAILS(cert.id))}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      right: -30,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Award size={24} style={{ color: '#fbbf24' }} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        opacity: 0.7,
                      }}
                    >
                      LMS Certified
                    </span>
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>
                      {cert.courseName ?? cert.title ?? 'Course Certificate'}
                    </p>
                    {cert.studentName && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.75 }}>
                        Issued to {cert.studentName}
                      </p>
                    )}
                  </div>

                  {cert.issuedAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.7 }}>
                      <Calendar size={12} />
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.15)',
                      paddingTop: 12,
                      display: 'flex',
                      gap: 8,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleDownload(cert.id, cert.courseName)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8,
                        color: '#ffffff',
                        padding: '7px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      }}
                    >
                      <Download size={13} /> Download PDF
                    </button>
                    <button
                      onClick={() => navigate(ROUTES.CERTIFICATE_DETAILS(cert.id))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8,
                        color: '#ffffff',
                        padding: '7px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* If no certificates at all or in pathway mode */}
        {totalCount === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 24, alignItems: 'start' }}>
            {/* Left: Available Certificates to Earn */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Certified Credentials Pathway
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Certificates are automatically minted upon scoring 70% or higher on final module assessments and completing required lessons.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  iconLeft={<Upload size={14} />}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    fontWeight: 700,
                  }}
                >
                  Import External Certificate
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[
                  {
                    title: 'Angular Js Framework Specialist',
                    category: 'Frontend Development',
                    color: '#3b82f6',
                    bg: 'rgba(59, 130, 246, 0.1)',
                  },
                  {
                    title: 'Full-Stack Web Development with React & Node',
                    category: 'Full Stack Engineering',
                    color: '#10b981',
                    bg: 'rgba(16, 185, 129, 0.1)',
                  },
                  {
                    title: 'Data Structures & Algorithms in Java',
                    category: 'Core Computer Science',
                    color: '#8b5cf6',
                    bg: 'rgba(139, 92, 246, 0.1)',
                  },
                ].map((track, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: track.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <Award size={20} color={track.color} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: track.color, textTransform: 'uppercase' }}>
                        {track.category}
                      </span>
                      <h4 style={{ margin: '4px 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {track.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Pass the final assessment to earn your tamper-proof blockchain certificate.
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(ROUTES.MY_COURSES)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Resume Course
                      <ExternalLink size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Verification Information */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 18,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                About LMS Credentials
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Cryptographic Verification:</strong> Each earned
                  credential receives a unique SHA-256 hash verifiable worldwide.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>High-Resolution PDF:</strong> Download print-ready
                  certificates suitable for framing or portfolio inclusion.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>External Platform Sync:</strong> Import your verified
                  licenses from AWS, Coursera, Google, and Open Badges to keep everything in one central portfolio.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Direct Employer Sharing:</strong> Share one-click
                  verification URLs on LinkedIn and resumes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <ImportCertificateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </PageContainer>
  );
};

export default CertificateListPage;
