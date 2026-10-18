import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { toast, tenantService, analyticsService } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  tenantService: { getCurrent: vi.fn(), updateSettings: vi.fn() },
  analyticsService: { adminOverview: vi.fn() },
}));
vi.mock('../../../src/components/feedback/Toast', () => ({ useToast: () => toast }));
vi.mock('../../../src/features/tenants/services/tenantService', () => ({ default: tenantService }));
vi.mock('../../../src/features/analytics/services/analyticsService', () => ({
  default: analyticsService,
}));

import { OrganizationSettingsPage } from '../../../src/features/tenants/pages/OrganizationSettingsPage';
import { OrganizationPage } from '../../../src/features/tenants/pages/OrganizationPage';

const realSettings = {
  id: 'org-1',
  name: 'Sri Ramana Polytechnic',
  supportEmail: 'help@srp.edu.in',
  description: '',
  primaryColor: '#10b981',
  logoUrl: null,
};

const renderPage = (page) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>{page}</MemoryRouter>
    </QueryClientProvider>,
  );

describe('OrganizationSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tenantService.getCurrent.mockResolvedValue(realSettings);
  });

  it('loads the tenant settings instead of placeholder data', async () => {
    renderPage(<OrganizationSettingsPage />);

    expect(await screen.findByDisplayValue('Sri Ramana Polytechnic')).toBeInTheDocument();
    expect(screen.getByDisplayValue('help@srp.edu.in')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/acme/i);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  it('sends only the fields the admin changed', async () => {
    tenantService.updateSettings.mockResolvedValue({
      ...realSettings,
      supportEmail: 'office@srp.edu.in',
    });
    renderPage(<OrganizationSettingsPage />);

    const email = await screen.findByLabelText('Support Email');
    await userEvent.clear(email);
    await userEvent.type(email, 'office@srp.edu.in');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(tenantService.updateSettings).toHaveBeenCalledWith({
        supportEmail: 'office@srp.edu.in',
      }),
    );
    expect(toast.success).toHaveBeenCalled();
  });

  it('reports a failed save instead of claiming success', async () => {
    tenantService.updateSettings.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'supportEmail: must be a well-formed email address' },
      },
    });
    renderPage(<OrganizationSettingsPage />);

    const name = await screen.findByLabelText('Organization Name');
    await userEvent.type(name, ' College');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('supportEmail: must be a well-formed email address'),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe('OrganizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tenantService.getCurrent.mockResolvedValue(realSettings);
  });

  it('shows real counts and never invents numbers', async () => {
    analyticsService.adminOverview.mockResolvedValue({
      activeLearners: 37,
      instructorCount: 4,
      publishedCourses: 6,
      totalMembers: 45,
    });
    renderPage(<OrganizationPage />);

    expect(await screen.findByText('Sri Ramana Polytechnic')).toBeInTheDocument();
    expect(await screen.findByText('37')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/acme|1,248|Enterprise Pro/i);
  });

  it('shows a dash when counts cannot be loaded', async () => {
    analyticsService.adminOverview.mockRejectedValue(new Error('forbidden'));
    renderPage(<OrganizationPage />);

    await screen.findByText('Sri Ramana Polytechnic');
    await waitFor(() => expect(screen.getAllByText('—')).toHaveLength(4));
  });
});
