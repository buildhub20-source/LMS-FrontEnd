import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { downloadBlob } from '../../../utils/fileUtils';

// The PDF is generated for each download, so these are the only ways it can fail.
const DOWNLOAD_ERRORS = {
  404: 'This certificate could not be found.',
  409: 'Your certificate is still being prepared. Please try again later.',
  410: 'This certificate has been revoked or has expired, so it can no longer be downloaded.',
  503: 'Certificates are temporarily unavailable. Please try again shortly.',
};

export const certificateService = {
  list: (params) => http.get(API_ENDPOINTS.certificates.base, { params }),
  getById: (id) => http.get(API_ENDPOINTS.certificates.byId(id)),
  download: (id) => http.get(API_ENDPOINTS.certificates.download(id), { responseType: 'blob' }),
  /**
   * Downloads the certificate PDF and saves it.
   * @throws {Error} with a message fit to show the learner
   */
  downloadFile: async (id, filename) => {
    let blob;
    try {
      blob = await http.get(API_ENDPOINTS.certificates.download(id), { responseType: 'blob' });
    } catch (err) {
      throw new Error(
        DOWNLOAD_ERRORS[err?.status] || 'Could not download the certificate. Please try again.',
      );
    }
    downloadBlob(blob, filename);
  },
  verify: (serialNumber) => http.get(API_ENDPOINTS.certificates.verify(serialNumber)),
  // The QR link names the issuing organisation, since whoever scans it is not signed in to it.
  verifyByToken: (token, org) =>
    http.get(API_ENDPOINTS.certificates.verifyToken(token), {
      headers: org ? { 'X-Tenant-Slug': org } : undefined,
    }),
};

export default certificateService;
