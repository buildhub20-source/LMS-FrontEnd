/**
 * Resource Service for Campus Toolkits & Study Guides.
 * Integrates with Cloudflare R2 object storage and backend REST persistence.
 * The server is the only source of truth: no sample data, no browser-only copies.
 */

import axios from 'axios';
import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

// Older builds kept sample resources here; remove them so nothing stale lingers.
try {
  localStorage.removeItem('lms_campus_resources_store');
} catch {
  // storage unavailable
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeResource(item) {
  if (!item) return item;
  return {
    ...item,
    author: item.authorName || item.author || '',
    authorRole: item.authorRole || '',
    fileName: item.fileName || `${item.title}.${item.fileType?.toLowerCase() || 'pdf'}`,
    fileType: (item.fileType || 'PDF').toUpperCase(),
    downloadsCount: item.downloadsCount || 0,
  };
}

export const resourceService = {
  /**
   * Request presigned Cloudflare R2 PUT URL from the backend.
   */
  getUploadUrl: async ({ fileName, contentType, category, fileSizeBytes }) => {
    return await http.post(API_ENDPOINTS.resources.uploadUrl, {
      fileName,
      contentType: contentType || 'application/octet-stream',
      category: category || 'CHEATSHEET',
      fileSizeBytes,
    });
  },

  /**
   * Uploads a raw binary File to Cloudflare R2 object store.
   * Prioritizes direct backend multipart upload to bypass browser CORS limitations on R2,
   * with automatic fallback to presigned direct PUT.
   */
  uploadFileToR2: async (file, category, onProgress) => {
    if (!file) throw new Error('File is required for upload');

    // 1. Primary path: Direct multipart upload via backend proxy (immune to browser CORS)
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (category) formData.append('category', category);

      const res = await http.post(API_ENDPOINTS.resources.uploadDirect, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      if (res?.fileKey) {
        return {
          fileKey: res.fileKey,
          uploadUrl: res.uploadUrl,
          publicUrl: res.publicUrl,
          fileName: file.name,
          fileSize: formatBytes(file.size),
          fileSizeBytes: file.size,
          fileType: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        };
      }
    } catch (backendUploadErr) {
      console.warn(
        'Backend direct multipart upload failed, attempting presigned PUT:',
        backendUploadErr?.message,
      );
    }

    // 2. Fallback path: Presigned direct PUT to Cloudflare R2
    const urlData = await resourceService.getUploadUrl({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      category: category || 'CHEATSHEET',
      fileSizeBytes: file.size,
    });

    const uploadUrl = urlData?.uploadUrl;
    const fileKey = urlData?.fileKey;

    if (!uploadUrl || !fileKey) {
      throw new Error('Could not obtain Cloudflare R2 upload credentials');
    }

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return {
      fileKey,
      uploadUrl,
      publicUrl: urlData?.publicUrl,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      fileSizeBytes: file.size,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'PDF',
    };
  },

  /** List all resources with optional filters */
  list: async (filters = {}) => {
    const params = {};
    if (filters.category && filters.category !== 'ALL') params.category = filters.category;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.search) params.search = filters.search;

    const items = await http.get(API_ENDPOINTS.resources.base, { params });
    return (Array.isArray(items) ? items : []).map(normalizeResource);
  },

  /** Get resource by ID */
  getById: async (id) => normalizeResource(await http.get(API_ENDPOINTS.resources.byId(id))),

  /**
   * Create a new resource. A selected file is uploaded to R2 first; if that
   * fails the resource is not created, so it never points at a missing file.
   */
  create: async (payload) => {
    let fileKey = payload.fileKey;
    let fileName =
      payload.fileName || `${payload.title}.${payload.fileType?.toLowerCase() || 'pdf'}`;
    let fileSize = payload.fileSize;
    let fileSizeBytes = payload.fileSizeBytes;
    let fileType = payload.fileType || 'PDF';

    if (payload.file && typeof payload.file === 'object' && payload.file.name) {
      const uploadResult = await resourceService.uploadFileToR2(
        payload.file,
        payload.category,
        payload.onProgress,
      );
      fileKey = uploadResult.fileKey;
      fileName = uploadResult.fileName;
      fileSize = uploadResult.fileSize;
      fileSizeBytes = uploadResult.fileSizeBytes;
      fileType = uploadResult.fileType;
    }

    const created = await http.post(API_ENDPOINTS.resources.base, {
      title: payload.title,
      description: payload.description || '',
      category: payload.category || 'CHEATSHEET',
      fileKey,
      fileName,
      fileType,
      fileSize,
      fileSizeBytes,
      targetAudience: payload.targetAudience || 'ALL_STUDENTS',
      status: payload.status || 'PUBLISHED',
    });
    return normalizeResource(created);
  },

  /** Update an existing resource */
  update: async (id, payload) =>
    normalizeResource(await http.patch(API_ENDPOINTS.resources.byId(id), payload)),

  /** Delete a resource from DB and R2 */
  remove: async (id) => {
    await http.delete(API_ENDPOINTS.resources.byId(id));
    return { success: true, id };
  },

  /**
   * Downloads the real file: an authenticated stream from the backend, or the
   * presigned R2 URL. Returns false (never a made-up file) when neither works.
   */
  downloadFile: async (resource) => {
    const name =
      resource.fileName || `${resource.title}.${resource.fileType?.toLowerCase() || 'pdf'}`;
    const save = (href) => {
      const link = document.createElement('a');
      link.href = href;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    try {
      const blobData = await http.get(API_ENDPOINTS.resources.stream(resource.id), {
        responseType: 'blob',
      });
      if (blobData) {
        const blobUrl = window.URL.createObjectURL(new Blob([blobData]));
        save(blobUrl);
        window.URL.revokeObjectURL(blobUrl);
        // Records the download on the server (the count students and staff see).
        http.get(API_ENDPOINTS.resources.download(resource.id)).catch(() => {});
        return true;
      }
    } catch (err) {
      console.warn('Stream download failed, trying the presigned URL:', err?.message);
    }

    try {
      const res = await http.get(API_ENDPOINTS.resources.download(resource.id));
      const downloadUrl = res?.downloadUrl;
      if (downloadUrl && downloadUrl.startsWith('http')) {
        save(downloadUrl);
        return true;
      }
    } catch (err) {
      console.warn('Download failed:', err?.message);
    }
    return false;
  },
};

export default resourceService;
