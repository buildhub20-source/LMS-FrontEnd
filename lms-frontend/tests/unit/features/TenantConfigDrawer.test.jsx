import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TenantConfigDrawer from '../../../src/features/platform/components/TenantConfigDrawer';
import platformService from '../../../src/features/platform/services/platformService';

vi.mock('../../../src/features/platform/services/platformService', () => ({
  default: { getTenantConfig: vi.fn(), updateTenantConfig: vi.fn() },
}));

describe('tenant live class configuration', () => {
  it('saves the selected provider and preserves built-in settings when switching', async () => {
    platformService.getTenantConfig.mockResolvedValue({ liveClassesEnabled: true, liveSessionProvider: 'LIVEKIT', screenShareEnabled: true });
    platformService.updateTenantConfig.mockResolvedValue({});
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><TenantConfigDrawer tenant={{ id: 'tenant-id', slug: 'test' }} isOpen onClose={vi.fn()} /></QueryClientProvider>);
    expect(await screen.findByText('Enable Screen Sharing')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Live class platform/), { target: { value: 'GOOGLE_MEET' } });
    expect(screen.queryByText('Enable Screen Sharing')).not.toBeInTheDocument();
    expect(screen.getByText(/Google Meet manages participant limits/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));
    await waitFor(() => expect(platformService.updateTenantConfig).toHaveBeenCalledWith('tenant-id', expect.objectContaining({ liveSessionProvider: 'GOOGLE_MEET', screenShareEnabled: true, recordingEnabled: false })));
    expect(await screen.findByRole('status')).toHaveTextContent('Configuration saved successfully!');
  });

  it('shows the server error beside the save button', async () => {
    platformService.getTenantConfig.mockResolvedValue({ liveClassesEnabled: true });
    platformService.updateTenantConfig.mockRejectedValue({ response: { data: { message: 'Unable to save configuration' } } });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><TenantConfigDrawer tenant={{ id: 'tenant-id', slug: 'test' }} isOpen onClose={vi.fn()} /></QueryClientProvider>);
    await screen.findByText('Enable Screen Sharing');
    fireEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save configuration');
  });

  it('does not allow saving defaults when the configuration cannot be loaded', async () => {
    platformService.getTenantConfig.mockRejectedValue(new Error('Network error'));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><TenantConfigDrawer tenant={{ id: 'tenant-id', slug: 'test' }} isOpen onClose={vi.fn()} /></QueryClientProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load');
    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeDisabled();
  });
});
