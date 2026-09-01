import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import Button from '../../../components/common/Button';
import certificateService from '../services/certificateService';
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
    // silently ignore
  }
};

/**
 * Fully wired certificate detail page.
 * Shows the certificate visual preview and download action.
 */
export const CertificateDetailsPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: () => certificateService.getById(certificateId),
    enabled: Boolean(certificateId),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const cert = raw?.data?.data ?? raw?.data ?? raw;

  return (
    <PageContainer
      title="Certificate"
      actions={
        <Button variant="secondary" onClick={() => navigate(ROUTES.CERTIFICATES)} iconLeft={<ArrowLeft size={14} />}>
          All Certificates
        </Button>
      }
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Certificate Visual */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 20,
          padding: '48px 40px',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(99,102,241,0.35)',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Award Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(251,191,36,0.2)',
              border: '2px solid rgba(251,191,36,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Award size={36} style={{ color: '#fbbf24' }} />
            </div>

            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: 6 }}>
              Certificate of Completion
            </p>

            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
              {cert?.courseName ?? cert?.title ?? 'Course Certificate'}
            </h1>

            {cert?.studentName && (
              <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 4 }}>
                Awarded to <strong>{cert.studentName}</strong>
              </p>
            )}

            {cert?.issuedAt && (
              <p style={{ fontSize: 13, opacity: 0.65 }}>
                Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}

            {/* Certificate ID */}
            <div style={{
              marginTop: 24,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              display: 'inline-block',
              fontSize: 11,
              letterSpacing: '0.08em',
              fontFamily: 'monospace',
              opacity: 0.7,
            }}>
              ID: {certificateId}
            </div>
          </div>
        </div>

        {/* Details card */}
        {cert && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {cert.studentName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={18} style={{ color: '#6366f1' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Student</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cert.studentName}</p>
                </div>
              </div>
            )}
            {cert.courseName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={18} style={{ color: '#10b981' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Course</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{cert.courseName}</p>
                </div>
              </div>
            )}
            {cert.issuedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={18} style={{ color: '#f59e0b' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Issue Date</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Download action */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            onClick={() => handleDownload(certificateId, cert?.courseName)}
            iconLeft={<Download size={16} />}
          >
            Download PDF
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default CertificateDetailsPage;
