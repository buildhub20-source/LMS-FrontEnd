import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Download, CreditCard, Plus, CheckCircle2,
  Calendar, ArrowLeft, Search, Building2, ChevronRight,
  Receipt, ShieldCheck
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { useToast } from '../../../components/feedback/Toast';
import subscriptionService from '../services/subscriptionService';
import { ROUTES } from '../../../constants/routes';

const MOCK_INVOICES = [
  {
    id: 'INV-2026-003',
    date: '2026-08-01',
    description: 'Enterprise Pro Annual Subscription (Renewal)',
    amount: '$2,868.00',
    status: 'PAID',
  },
  {
    id: 'INV-2026-002',
    date: '2026-05-15',
    description: 'Additional 500 Learner Seats Add-on',
    amount: '$450.00',
    status: 'PAID',
  },
  {
    id: 'INV-2026-001',
    date: '2026-01-15',
    description: 'Enterprise Pro Annual Subscription',
    amount: '$2,868.00',
    status: 'PAID',
  },
  {
    id: 'INV-2025-012',
    date: '2025-12-15',
    description: 'Professional Plan Monthly Subscription',
    amount: '$149.00',
    status: 'PAID',
  },
];

export const BillingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['subscription', 'billing'],
    queryFn: () => subscriptionService.billingHistory().catch(() => null),
  });

  const apiInvoices = rawData?.data?.data?.content ?? rawData?.data?.content ?? rawData?.data;
  const invoices = Array.isArray(apiInvoices) && apiInvoices.length > 0 ? apiInvoices : MOCK_INVOICES;

  const filteredInvoices = invoices.filter((inv) =>
    (inv.id + ' ' + inv.description).toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadInvoice = (inv) => {
    toast.success(`Downloading invoice ${inv.id}...`);
    // Simulated PDF blob download
    const element = document.createElement('a');
    const file = new Blob([`Invoice: ${inv.id}\nDate: ${inv.date}\nAmount: ${inv.amount}\nStatus: ${inv.status}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${inv.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <PageContainer
      title="Billing & Invoices"
      subtitle="View payment history, download invoice receipts, and manage billing contacts."
      actions={
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.SUBSCRIPTION)}
          iconLeft={<ArrowLeft size={15} />}
        >
          Subscription
        </Button>
      }
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to={ROUTES.SUBSCRIPTION} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Subscription
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Billing & Invoices</span>
        </div>

        {/* ── Top Summary Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Payment Method Card */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={17} style={{ color: '#6366f1' }} />
                  Primary Payment Method
                </h3>
                <Badge tone="success">Active</Badge>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--surface-medium)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: 42, height: 28, borderRadius: 4,
                  background: '#1e293b', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
                }}>
                  CARD
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Mastercard ending in 4242
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    Expires 12/2028 • Billing email: billing@acme-academy.com
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => toast.info('Card update dialog initialized.')}
              size="sm"
            >
              Update Payment Method
            </Button>
          </div>

          {/* Billing Contact & Tax ID Card */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={17} style={{ color: '#10b981' }} />
                Tax & Legal Details
              </h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Acme Learning Academy Inc.
                </p>
                <p style={{ margin: '0 0 2px' }}>VAT / Tax ID: US-94827103-X</p>
                <p style={{ margin: 0 }}>100 Innovation Way, Suite 400, San Francisco, CA</p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => toast.info('Tax details update initialized.')}
              size="sm"
            >
              Edit Billing Address
            </Button>
          </div>
        </div>

        {/* ── Invoice History Table ── */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={18} style={{ color: '#6366f1' }} />
                Invoice Receipts ({filteredInvoices.length})
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Download formal PDF invoices for accounting and tax records.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-medium)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-medium)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Invoice ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Billing Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      {inv.id}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {inv.description}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {inv.amount}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: 'rgba(34, 197, 94, 0.12)',
                        color: '#10b981',
                      }}>
                        <CheckCircle2 size={12} /> {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv)}
                        style={{
                          background: 'var(--surface-medium)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          padding: '5px 10px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <Download size={13} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default BillingPage;
