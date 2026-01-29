import { redirect } from 'next/navigation';
import DashboardView from '@/components/dashboard/DashboardView';
import { DashboardService } from '@/lib/services/dashboard.service';

function parseShowDateRange(
  param: string | string[] | undefined
): boolean {
  if (param === undefined) return true;
  const v = Array.isArray(param) ? param[0] : param;
  return v !== '0' && v !== 'false';
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

  if (dashboard.access !== 'public') {
    redirect('/dashboards');
  }

  const resolvedSearchParams = await searchParams;
  const showDateRangeOverride = parseShowDateRange(
    resolvedSearchParams.showDateRange
  );

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] p-4 md:p-6">
      <DashboardView
        dashboard={dashboard}
        showDateRangeOverride={showDateRangeOverride}
      />
    </div>
  );
}

