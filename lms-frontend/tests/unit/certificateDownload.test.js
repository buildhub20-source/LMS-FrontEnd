import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/api/axiosInstance', () => ({ http: { get: vi.fn() } }));
vi.mock('../../src/utils/fileUtils', () => ({ downloadBlob: vi.fn() }));

import { http } from '../../src/services/api/axiosInstance';
import { downloadBlob } from '../../src/utils/fileUtils';
import certificateService from '../../src/features/certificates/services/certificateService';

describe('certificate download', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves the PDF the server generated', async () => {
    const pdf = new Blob(['%PDF-'], { type: 'application/pdf' });
    http.get.mockResolvedValue(pdf);

    await certificateService.downloadFile('c1', 'certificate-CERT-1.pdf');

    expect(http.get).toHaveBeenCalledWith('/certificates/c1/download', { responseType: 'blob' });
    expect(downloadBlob).toHaveBeenCalledWith(pdf, 'certificate-CERT-1.pdf');
  });

  it.each([
    [409, /still being prepared/],
    [410, /revoked or has expired/],
    [404, /could not be found/],
    [503, /temporarily unavailable/],
    [500, /Could not download/],
  ])('explains a %i to the learner', async (status, message) => {
    http.get.mockRejectedValue({ status, message: 'raw' });

    await expect(certificateService.downloadFile('c1', 'x.pdf')).rejects.toThrow(message);
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});

describe('certificate verification by QR token', () => {
  beforeEach(() => vi.clearAllMocks());

  it('names the issuing organisation from the QR link', async () => {
    http.get.mockResolvedValue({ verificationState: 'VALID' });

    await certificateService.verifyByToken('tok', 'srp');

    expect(http.get).toHaveBeenCalledWith('/certificates/verify/token/tok', {
      headers: { 'X-Tenant-Slug': 'srp' },
    });
  });

  it('sends no tenant when the link has none', async () => {
    http.get.mockResolvedValue({});

    await certificateService.verifyByToken('tok', null);

    expect(http.get).toHaveBeenCalledWith('/certificates/verify/token/tok', { headers: undefined });
  });
});
