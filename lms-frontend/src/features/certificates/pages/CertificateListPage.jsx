import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink, Calendar } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import certificateService from '../services/certificateService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

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

/**
 * Fully wired certificate gallery page.
 * Fetches all earned certificates and renders them as premium cards.
 */
export const CertificateListPage = () => {
  const navigate = useNavigate();

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.list(),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const certs = raw?.data?.data?.content ?? raw?.data?.content ?? raw?.data ?? [];

  return (
    <PageContainer
      title="Certificates"
      subtitle="Certificates you have earned for completing courses."
    >
      {certs.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
          icon={<Award size={40} style={{ color: '#f59e0b' }} />}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {certs.map((cert) => (
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
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(99,102,241,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.3)'; }}
              onClick={() => navigate(ROUTES.CERTIFICATE_DETAILS(cert.id))}
            >
              {/* Decorative ring */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }} />
              <div style={{
                position: 'absolute', top: -10, right: -10,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />

              {/* Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={24} style={{ color: '#fbbf24' }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', opacity: 0.7,
                }}>
                  Certificate of Completion
                </span>
              </div>

              {/* Course name */}
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

              {/* Issue date */}
              {cert.issuedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.7 }}>
                  <Calendar size={12} />
                  {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}

              {/* Action row */}
              <div
                style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, display: 'flex', gap: 8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleDownload(cert.id, cert.courseName)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, color: '#ffffff',
                    padding: '7px 12px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => navigate(ROUTES.CERTIFICATE_DETAILS(cert.id))}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, color: '#ffffff',
                    padding: '7px 12px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default CertificateListPage;
