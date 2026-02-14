import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard, DashboardLayout } from '@/types/dashboard';
import { DEFAULT_CHARTS_PER_ROW, normalizeDashboardLayout } from '@/lib/dashboard-layout';
import { CUSTOM_RANGE_LABEL } from '@/lib/date-ranges';

interface UseDashboardReturn {
  dashboard: Dashboard | null;
  title: string;
  description: string;
  isPublic: boolean;
  defaultDateRange: string;
  customDateRange: { from: string; to: string } | null;
  groupIds: string[];
  tagIds: string[];
  showDateRangePicker: boolean;
  layout: DashboardLayout;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setDefaultDateRange: (range: string) => void;
  setCustomDateRange: (range: { from: string; to: string } | null) => void;
  toggleGroupId: (groupId: string) => void;
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
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
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [showDateRangePicker, setShowDateRangePicker] = useState<boolean>(DEFAULT_SHOW_DATE_RANGE_PICKER);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(!!dashboardId);
  const [error, setError] = useState('');
  const toggleGroupId = useCallback((groupId: string) => {
    setGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const addTag = useCallback((tagId: string) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]));
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!dashboardId) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
      setCustomDateRange(data.customDateRange ?? null);
      setGroupIds(data.groupIds || []);
      setTagIds(data.tagIds || []);
      setShowDateRangePicker(data.showDateRangePicker ?? DEFAULT_SHOW_DATE_RANGE_PICKER);
      const chartCount = data.chartIds?.length ?? data.charts?.length ?? 0;
      setLayout(normalizeDashboardLayout(data.layout, chartCount));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
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
        customDateRange: defaultDateRange === CUSTOM_RANGE_LABEL ? customDateRange ?? undefined : undefined,
        groupIds,
        tagIds,
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
    customDateRange,
    groupIds,
    tagIds,
    showDateRangePicker,
    layout,
    setTitle,
    setDescription,
    setIsPublic,
    setDefaultDateRange,
    setCustomDateRange,
    toggleGroupId,
    addTag,
    removeTag,
    setShowDateRangePicker,
    setLayout,
    saveDashboard,
    reloadDashboard: loadDashboard,
    loading,
    error,
  };
}
