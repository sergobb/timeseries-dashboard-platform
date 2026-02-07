import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard, DashboardLayout } from '@/types/dashboard';
import { DEFAULT_CHARTS_PER_ROW, normalizeDashboardLayout } from '@/lib/dashboard-layout';

interface UseDashboardReturn {
  dashboard: Dashboard | null;
  title: string;
  description: string;
  isPublic: boolean;
  defaultDateRange: string;
  groupIds: string[];
  showDateRangePicker: boolean;
  layout: DashboardLayout;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setDefaultDateRange: (range: string) => void;
  toggleGroupId: (groupId: string) => void;
  setShowDateRangePicker: (next: boolean) => void;
  setLayout: (layout: DashboardLayout) => void;
  saveDashboard: () => Promise<void>;
  reloadDashboard: () => Promise<void>;
  loading: boolean;
  error: string;
}

const DEFAULT_LAYOUT: DashboardLayout = { chartsPerRow: DEFAULT_CHARTS_PER_ROW };
const DEFAULT_SHOW_DATE_RANGE_PICKER = true;

export function useDashboard(dashboardId?: string): UseDashboardReturn {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [defaultDateRange, setDefaultDateRange] = useState<string>('Last 7 Days');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [showDateRangePicker, setShowDateRangePicker] = useState<boolean>(DEFAULT_SHOW_DATE_RANGE_PICKER);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toggleGroupId = useCallback((groupId: string) => {
    setGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!dashboardId) return;

    try {
      const res = await fetch(`/api/dashboards/${dashboardId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setDashboard(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setIsPublic(data.isPublic ?? data.access === 'public');
      setDefaultDateRange(data.defaultDateRange || 'Last 7 Days');
      setGroupIds(data.groupIds || []);
      setShowDateRangePicker(data.showDateRangePicker ?? DEFAULT_SHOW_DATE_RANGE_PICKER);
      const chartCount = data.chartIds?.length ?? data.charts?.length ?? 0;
      setLayout(normalizeDashboardLayout(data.layout, chartCount));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    }
  }, [dashboardId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const saveDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
        title,
        description,
        charts: [],
        isPublic,
        defaultDateRange,
        groupIds,
        showDateRangePicker,
        layout,
      };

      const url = dashboardId ? `/api/dashboards/${dashboardId}` : '/api/dashboards';
      const method = dashboardId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dashboardData),
      });

      if (!response.ok) {
        throw new Error(dashboardId ? 'Failed to save dashboard' : 'Failed to create dashboard');
      }

      const result = await response.json();
      router.push(
        dashboardId ? '/dashboards' : `/dashboards/${result.id}/edit?tab=charts`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboard,
    title,
    description,
    isPublic,
    defaultDateRange,
    groupIds,
    showDateRangePicker,
    layout,
    setTitle,
    setDescription,
    setIsPublic,
    setDefaultDateRange,
    toggleGroupId,
    setShowDateRangePicker,
    setLayout,
    saveDashboard,
    reloadDashboard: loadDashboard,
    loading,
    error,
  };
}
