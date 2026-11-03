import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../constants/routes';
import { formatDate } from '../../../utils/dateUtils';
import { useToast } from '../../../components/feedback/Toast';
import certificateService from '../services/certificateService';

export const CertificateCard = ({ certificate }) => {
  const toast = useToast();
  const handleDownload = async () => {
    try {
      await certificateService.downloadFile(
        certificate.id,
        `certificate-${certificate.serialNumber}.pdf`,
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card
      title={<Link to={ROUTES.CERTIFICATE_DETAILS(certificate.id)}>{certificate.courseTitle}</Link>}
      actions={
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          Download
        </Button>
      }
    >
      <p className="u-text-sm u-text-muted">
        Issued {formatDate(certificate.issuedAt)} &middot; ID {certificate.serialNumber}
      </p>
    </Card>
  );
};

export default CertificateCard;
