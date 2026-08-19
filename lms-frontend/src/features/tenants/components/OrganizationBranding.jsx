import { useState } from 'react';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/** Tenant colours are applied by overriding the CSS custom properties at runtime. */
export const OrganizationBranding = ({ defaultValues = {}, onSubmit }) => {
  const [primaryColor, setPrimaryColor] = useState(defaultValues.primaryColor ?? '#3b6fe0');
  const [logoUrl, setLogoUrl] = useState(defaultValues.logoUrl ?? '');

  const apply = () => {
    document.documentElement.style.setProperty('--color-primary-600', primaryColor);
    onSubmit?.({ primaryColor, logoUrl });
  };

  return (
    <Card title="Branding">
      <Input
        label="Primary colour"
        type="color"
        value={primaryColor}
        onChange={(event) => setPrimaryColor(event.target.value)}
      />
      <Input
        label="Logo URL"
        value={logoUrl}
        onChange={(event) => setLogoUrl(event.target.value)}
      />
      <Button className="u-mt-4" onClick={apply}>
        Apply branding
      </Button>
    </Card>
  );
};

export default OrganizationBranding;
