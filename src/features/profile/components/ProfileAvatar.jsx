import { useRef, useState } from 'react';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import { validateFile } from '../../../utils/fileUtils';
import appConfig from '../../../config/appConfig';

export const ProfileAvatar = ({ user, onUpload }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    const message = validateFile(file, { accept: appConfig.acceptedImageTypes });
    setError(message);
    if (!message) onUpload?.(file);
  };

  return (
    <div className="u-flex u-items-center u-gap-3">
      <Avatar name={user?.fullName} src={user?.avatarUrl} size="lg" />
      <div>
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          Change photo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={appConfig.acceptedImageTypes.join(',')}
          onChange={handleChange}
          className="u-hidden"
        />
        {error && <p className="u-text-sm u-text-danger">{error}</p>}
      </div>
    </div>
  );
};

export default ProfileAvatar;
