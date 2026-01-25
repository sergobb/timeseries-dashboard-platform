import { redirect } from 'next/navigation';
import DashboardView from '@/components/dashboard/DashboardView';
import { DashboardService } from '@/lib/services/dashboard.service';

export default async function PublicDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashboard = await DashboardService.getById(id);

  if (!dashboard) {
    redirect('/dashboards');
  }

  if (dashboard.access !== 'public') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
          {dashboard.title}
        </h1>
        {dashboard.description && (
          <p className="text-[var(--color-muted-foreground)] mb-8">
            {dashboard.description}
          </p>
        )}
        <DashboardView dashboard={dashboard} />
      </div>
    </div>
  );
}

