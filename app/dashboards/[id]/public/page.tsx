import { redirect } from 'next/navigation';
import DashboardView from '@/components/dashboard/DashboardView';
import PublicThemeFromUrl from '@/components/PublicThemeFromUrl';
import { DashboardService } from '@/lib/services/dashboard.service';

const THEMES = ['light', 'dark', 'light-blue', 'dark-blue'] as const;
type ThemeParam = (typeof THEMES)[number];

function parseShowDateRange(
  param: string | string[] | undefined
): boolean {
  if (param === undefined) return true;
  const v = Array.isArray(param) ? param[0] : param;
  return v !== '0' && v !== 'false';
}

function parseTheme(
  param: string | string[] | undefined
): ThemeParam | null {
  if (param === undefined) return null;
  const v = Array.isArray(param) ? param[0] : param;
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v)
    ? (v as ThemeParam)
    : null;
}

export default async function PublicDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const dashboard = await DashboardService.getById(id);

  if (!dashboard) {
    redirect('/dashboards');
  }

  const isPublic = dashboard.isPublic ?? dashboard.access === 'public';
  if (!isPublic) {
    redirect('/dashboards');
  }

  const resolvedSearchParams = await searchParams;
  const showDateRangeOverride = parseShowDateRange(
    resolvedSearchParams.showDateRange
  );
  const themeFromUrl = parseTheme(resolvedSearchParams.theme);

  return (
    <PublicThemeFromUrl themeFromUrl={themeFromUrl}>
      <div className="min-h-screen w-full bg-[var(--color-background)] p-4 md:p-6">
        <DashboardView
          dashboard={dashboard}
          showDateRangeOverride={showDateRangeOverride}
        />
      </div>
    </PublicThemeFromUrl>
  );
}

