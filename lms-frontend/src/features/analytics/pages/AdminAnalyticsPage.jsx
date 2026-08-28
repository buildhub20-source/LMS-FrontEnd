import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  Activity,
  UserCheck,
  BarChart2,
} from 'lucide-react';
import { AdminCardSkeleton } from '../../../components/ui/AdminSkeleton';
import AdminBadge from '../../../components/ui/AdminBadge';
import ErrorState from '../../../components/common/ErrorState';
import analyticsService from '../services/analyticsService';
import useAuth from '../../auth/hooks/useAuth';
import { QUERY_KEYS } from '../../../constants/appConstants';

const colorMap = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
};

export const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'admin'],
    queryFn: () => analyticsService.adminOverview(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const stats = [
    {
      label: 'Active Learners',
      value: data?.activeLearners ?? 0,
      icon: Users,
      color: 'brand',
      trend: '+12%',
      trendLabel: 'vs last month',
    },
    {
      label: 'Courses Published',
      value: data?.publishedCourses ?? 0,
      icon: BookOpen,
      color: 'emerald',
      trend: '+3',
      trendLabel: 'this month',
    },
    {
      label: 'Total Enrollments',
      value: data?.totalEnrollments ?? 0,
      icon: ClipboardList,
      color: 'amber',
      trend: '+8%',
      trendLabel: 'vs last month',
    },
    {
      label: 'Completion Rate',
      value: data?.completionRate != null ? `${data.completionRate}%` : '0%',
      icon: BarChart2,
      color: 'sky',
      trend: '+5%',
      trendLabel: 'vs last month',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.firstName ?? 'Admin'}
        </h1>
        <p className="mt-1 text-slate-500">Here's what's happening across your platform today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <AdminCardSkeleton key={i} />)
          : stats.map((stat) => {
              const c = colorMap[stat.color] ?? colorMap.brand;
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="card-base p-6 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 animate-slide-up"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text} ring-4 ${c.ring}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">{stat.trend}</span>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{stat.trendLabel}</p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Activity */}
        <div className="card-base p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <Activity className="h-5 w-5 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900">Platform Activity</h2>
          </div>
          <div className="space-y-3">
            {(data?.recentActivity ?? PLACEHOLDER_ACTIVITY).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${
                    item.type === 'invite'
                      ? 'bg-amber-50 text-amber-600'
                      : item.type === 'lock'
                        ? 'bg-red-50 text-red-600'
                        : item.type === 'role'
                          ? 'bg-brand-50 text-brand-600'
                          : item.type === 'accept'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.type === 'accept' ? (
                    <UserCheck className="h-5 w-5" />
                  ) : (
                    <Activity className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.action}</p>
                  <p className="text-xs text-slate-500 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Access */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <UserCheck className="h-5 w-5 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900">Your Access</h2>
          </div>
          <div className="space-y-3">
            {user?.roles?.map((role) => (
              <div
                key={role.id ?? role.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{role.name}</p>
                    <p className="text-xs text-slate-500">Assigned role</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
            ))}
          </div>
          {user?.permissions?.length > 0 && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Permissions ({user.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.permissions.slice(0, 6).map((p) => (
                  <AdminBadge key={p} variant="default" className="font-mono text-[10px]">
                    {p}
                  </AdminBadge>
                ))}
                {user.permissions.length > 6 && (
                  <AdminBadge variant="default" className="text-[10px]">
                    +{user.permissions.length - 6} more
                  </AdminBadge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PLACEHOLDER_ACTIVITY = [
  {
    action: 'Platform analytics loaded',
    detail: 'Connect to API for live activity',
    time: 'now',
    type: 'role',
  },
  {
    action: 'Admin Dashboard initialized',
    detail: 'All systems operational',
    time: 'just now',
    type: 'accept',
  },
];

export default AdminAnalyticsPage;
