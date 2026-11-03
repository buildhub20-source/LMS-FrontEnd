import { useEffect, useState } from 'react';
import { Award, Clock } from 'lucide-react';

import { certificateService } from '../services/certificateService';
import { useToast } from '../../../components/feedback/Toast';

/**
 * The certificate action shown on a completed course.
 *
 * <p>Three outcomes, matching how a certificate is actually issued: it is
 * ready and downloadable, it is held because the organisation has not
 * published a template for the course yet, or the course has not produced one
 * at all and nothing is shown.
 */

// One request serves every card on the page. Without this, a learner with a
// dozen completed courses would fetch the same list a dozen times.
let inFlight = null;

const loadCertificates = () => {
  if (!inFlight) {
    inFlight = certificateService
      .list({ size: 100 })
      .then((response) => {
        const payload = response?.data?.data ?? response?.data ?? {};
        return payload.content ?? (Array.isArray(payload) ? payload : []);
      })
      .catch(() => [])
      // Cleared so a later visit reflects certificates issued in the meantime.
      .finally(() => {
        setTimeout(() => {
          inFlight = null;
        }, 30_000);
      });
  }
  return inFlight;
};

export default function CourseCertificateAction({ courseId }) {
  const [certificate, setCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    loadCertificates().then((list) => {
      if (cancelled) return;
      setCertificate(list.find((cert) => cert.courseId === courseId) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (!certificate) return null;

  if (certificate.status === 'PENDING') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--muted-foreground)',
        }}
        title="Your certificate will be available once the organisation publishes a template."
      >
        <Clock size={14} /> Certificate being prepared
      </span>
    );
  }

  if (certificate.status !== 'ACTIVE') return null;

  const download = async () => {
    setDownloading(true);
    try {
      await certificateService.downloadFile(
        certificate.id,
        `certificate-${certificate.serialNumber}.pdf`,
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={downloading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        padding: '6px 12px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--primary)',
        cursor: downloading ? 'default' : 'pointer',
      }}
    >
      <Award size={14} /> {downloading ? 'Preparing…' : 'Download Certificate'}
    </button>
  );
}
