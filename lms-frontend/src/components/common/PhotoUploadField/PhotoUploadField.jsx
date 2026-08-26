import { useEffect, useId, useRef, useState } from 'react';

import { PHOTO_ACCEPT, PHOTO_MAX_BYTES } from '../../../constants/personConstants';
import styles from './PhotoUploadField.module.css';

const ACCEPTED = PHOTO_ACCEPT.split(',');

/**
 * Drag-and-drop photo field.
 *
 * Controlled on the storage key, not the file: the upload happens as soon as a
 * file is picked, and the form only ever carries the key the API expects. That
 * keeps submit fast and means a failed upload surfaces here rather than on save.
 */
export const PhotoUploadField = ({ label, value, onChange, onUpload, required = false, error }) => {
  const inputRef = useRef(null);
  const inputId = useId();

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Object URLs are revoked on replace and on unmount; without this every
  // re-pick leaks the previous blob for the life of the page.
  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview]);

  const reject = (message) => {
    setUploadError(message);
    setUploading(false);
  };

  const handleFile = async (file) => {
    if (!file) return;

    setUploadError(null);

    if (!ACCEPTED.includes(file.type)) {
      reject('Use a PNG, JPEG or WebP image');
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      reject(`Image must be under ${Math.round(PHOTO_MAX_BYTES / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    try {
      const photoKey = await onUpload(file);
      setPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return { url: URL.createObjectURL(file), name: file.name };
      });
      onChange(photoKey);
    } catch (cause) {
      reject(cause.message || 'Upload failed, try again');
    } finally {
      setUploading(false);
    }
  };

  const clear = (event) => {
    event.stopPropagation();
    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    setUploadError(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const shown = error || uploadError;
  const zoneClasses = [
    styles.dropzone,
    dragging ? styles.dragging : '',
    shown ? styles.invalid : '',
    uploading ? styles.busy : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div
        className={zoneClasses}
        role="button"
        tabIndex={0}
        aria-describedby={shown ? `${inputId}-error` : undefined}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {uploading && <span>Uploading…</span>}

        {!uploading && value && (
          <span className={styles.preview}>
            {preview && <img className={styles.thumb} src={preview.url} alt="" />}
            <span className={styles.fileName}>{preview?.name ?? 'Photo attached'}</span>
            <button
              type="button"
              className={styles.clear}
              onClick={clear}
              aria-label={`Remove ${label}`}
            >
              ✕
            </button>
          </span>
        )}

        {!uploading && !value && <span>Drag &amp; drop a file here or click</span>}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="u-hidden"
        accept={PHOTO_ACCEPT}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {shown && (
        <span className={styles.error} id={`${inputId}-error`} role="alert">
          {shown}
        </span>
      )}
    </div>
  );
};

export default PhotoUploadField;
