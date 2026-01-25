'use client';

import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import ChartOptionsAccordion from '@/components/ui/ChartOptionsAccordion';
import ChartOptionsComponent from '@/components/dashboard/chart/ChartOptions';
import XAxisOptionsComponent from '@/components/dashboard/chart/XAxisOptions';
import { ChartOptions, XAxisOptions } from '@/types/chart';

interface ChartOptionsFormProps {
  dashboardId: string;
  chartOptions: ChartOptions;
  xAxisOptions: XAxisOptions;
  onChartOptionsChange: (options: ChartOptions) => void;
  onXAxisOptionsChange: (options: XAxisOptions) => void;
}

export default function ChartOptionsForm({
  dashboardId,
  chartOptions,
  xAxisOptions,
  onChartOptionsChange,
  onXAxisOptionsChange,
}: ChartOptionsFormProps) {
  return (
    <Card className="p-6">
      <Text size="lg" className="mb-4 font-semibold">
        Chart Options
      </Text>
      <div className="space-y-4">
        <div>
          <Label htmlFor={`chart-description-${dashboardId}`} className="mb-1 text-xs">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id={`chart-description-${dashboardId}`}
            value={chartOptions.description || ''}
            onChange={(e) =>
              onChartOptionsChange({
                ...chartOptions,
                description: e.target.value || undefined,
              })
            }
            placeholder="Chart description"
            rows={3}
            required
          />
        </div>
        <ChartOptionsAccordion title="Chart Options">
          <ChartOptionsComponent
            chartId={dashboardId}
            options={chartOptions}
            onOptionsChange={onChartOptionsChange}
          />
        </ChartOptionsAccordion>
        <ChartOptionsAccordion title="XAxis Options">
          <XAxisOptionsComponent
            chartId={dashboardId}
            axisId="xaxis"
            options={xAxisOptions}
            onOptionsChange={onXAxisOptionsChange}
          />
        </ChartOptionsAccordion>
      </div>
    </Card>
  );
}

