'use client';

import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { ChartOptions } from '@/types/chart';

export type ChartOptionsField =
  | 'title'
  | 'titleStyle.fontSize'
  | 'titleStyle.color'
  | 'subtitle'
  | 'subtitleStyle.fontSize'
  | 'subtitleStyle.color'
  | 'legendEnabled'
  | 'legendLayout'
  | 'legendAlign'
  | 'legendVerticalAlign'
  | 'creditsEnabled'
  | 'backgroundColor'
  | 'height'
  | 'plotBackgroundColor'
  | 'plotBorderWidth'
  | 'plotBorderColor'
  | 'tooltip.split'
  | 'tooltip.shared';

interface ChartOptionsProps {
  chartId: string;
  options?: ChartOptions;
  onOptionsChange: (options: ChartOptions) => void;
  visibleFields?: readonly ChartOptionsField[];
}

export default function ChartOptionsComponent({
  chartId,
  options = {},
  onOptionsChange,
  visibleFields,
}: ChartOptionsProps) {
  const isVisible = (field: ChartOptionsField) =>
    !visibleFields || visibleFields.includes(field);

  const updateOption = <K extends keyof ChartOptions>(
    key: K,
    value: ChartOptions[K]
  ) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const updateTitleStyle = <K extends keyof NonNullable<ChartOptions['titleStyle']>>(
    key: K,
    value: NonNullable<ChartOptions['titleStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      titleStyle: {
        ...options.titleStyle,
        [key]: value,
      },
    });
  };

  const updateSubtitleStyle = <K extends keyof NonNullable<ChartOptions['subtitleStyle']>>(
    key: K,
    value: NonNullable<ChartOptions['subtitleStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      subtitleStyle: {
        ...options.subtitleStyle,
        [key]: value,
      },
    });
  };

  const updateTooltip = <K extends keyof NonNullable<ChartOptions['tooltip']>>(
    key: K,
    value: NonNullable<ChartOptions['tooltip']>[K]
  ) => {
    onOptionsChange({
      ...options,
      tooltip: {
        ...options.tooltip,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-3">
      {isVisible('title') && (
        <div>
          <Label htmlFor={`chart-title-${chartId}`} className="mb-1 text-xs">
            Title
          </Label>
          <Input
            id={`chart-title-${chartId}`}
            type="text"
            value={options.title || ''}
            onChange={(e) => updateOption('title', e.target.value || undefined)}
            placeholder="Chart title"
          />
        </div>
      )}

      {isVisible('titleStyle.fontSize') && (
        <div>
          <Label htmlFor={`chart-title-font-size-${chartId}`} className="mb-1 text-xs">
            Title Font Size
          </Label>
          <Input
            id={`chart-title-font-size-${chartId}`}
            type="text"
            value={options.titleStyle?.fontSize || '16px'}
            onChange={(e) => updateTitleStyle('fontSize', e.target.value || undefined)}
            placeholder="16px"
          />
        </div>
      )}

      {isVisible('titleStyle.color') && (
        <div>
          <Label htmlFor={`chart-title-color-${chartId}`} className="mb-1 text-xs">
            Title Color
          </Label>
          <Input
            id={`chart-title-color-${chartId}`}
            type="color"
            value={options.titleStyle?.color || '#333333'}
            onChange={(e) => updateTitleStyle('color', e.target.value)}
          />
        </div>
      )}

      {isVisible('subtitle') && (
        <div>
          <Label htmlFor={`chart-subtitle-${chartId}`} className="mb-1 text-xs">
            Subtitle
          </Label>
          <Input
            id={`chart-subtitle-${chartId}`}
            type="text"
            value={options.subtitle || ''}
            onChange={(e) => updateOption('subtitle', e.target.value || undefined)}
            placeholder="Chart subtitle"
          />
        </div>
      )}

      {isVisible('subtitleStyle.fontSize') && (
        <div>
          <Label htmlFor={`chart-subtitle-font-size-${chartId}`} className="mb-1 text-xs">
            Subtitle Font Size
          </Label>
          <Input
            id={`chart-subtitle-font-size-${chartId}`}
            type="text"
            value={options.subtitleStyle?.fontSize || '12px'}
            onChange={(e) => updateSubtitleStyle('fontSize', e.target.value || undefined)}
            placeholder="12px"
          />
        </div>
      )}

      {isVisible('subtitleStyle.color') && (
        <div>
          <Label htmlFor={`chart-subtitle-color-${chartId}`} className="mb-1 text-xs">
            Subtitle Color
          </Label>
          <Input
            id={`chart-subtitle-color-${chartId}`}
            type="color"
            value={options.subtitleStyle?.color || '#666666'}
            onChange={(e) => updateSubtitleStyle('color', e.target.value)}
          />
        </div>
      )}

      {isVisible('legendEnabled') && (
        <div>
          <Label htmlFor={`chart-legend-enabled-${chartId}`} className="mb-1 text-xs">
            Legend Enabled
          </Label>
          <Select
            id={`chart-legend-enabled-${chartId}`}
            value={options.legendEnabled !== false ? 'true' : 'false'}
            onChange={(e) => updateOption('legendEnabled', e.target.value === 'true')}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </Select>
        </div>
      )}

      {isVisible('legendLayout') && (
        <div>
          <Label htmlFor={`chart-legend-layout-${chartId}`} className="mb-1 text-xs">
            Legend Layout
          </Label>
          <Select
            id={`chart-legend-layout-${chartId}`}
            value={options.legendLayout || 'horizontal'}
            onChange={(e) =>
              updateOption('legendLayout', e.target.value as ChartOptions['legendLayout'])
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </Select>
        </div>
      )}

      {isVisible('legendAlign') && (
        <div>
          <Label htmlFor={`chart-legend-align-${chartId}`} className="mb-1 text-xs">
            Legend Align
          </Label>
          <Select
            id={`chart-legend-align-${chartId}`}
            value={options.legendAlign || 'center'}
            onChange={(e) =>
              updateOption('legendAlign', e.target.value as ChartOptions['legendAlign'])
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </div>
      )}

      {isVisible('legendVerticalAlign') && (
        <div>
          <Label htmlFor={`chart-legend-vertical-align-${chartId}`} className="mb-1 text-xs">
            Legend Vertical Align
          </Label>
          <Select
            id={`chart-legend-vertical-align-${chartId}`}
            value={options.legendVerticalAlign || 'bottom'}
            onChange={(e) =>
              updateOption(
                'legendVerticalAlign',
                e.target.value as ChartOptions['legendVerticalAlign']
              )
            }
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </Select>
        </div>
      )}

      {isVisible('creditsEnabled') && (
        <div>
          <Label htmlFor={`chart-credits-enabled-${chartId}`} className="mb-1 text-xs">
            Credits Enabled
          </Label>
          <Select
            id={`chart-credits-enabled-${chartId}`}
            value={options.creditsEnabled !== false ? 'true' : 'false'}
            onChange={(e) => updateOption('creditsEnabled', e.target.value === 'true')}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </Select>
        </div>
      )}

      {isVisible('backgroundColor') && (
        <div>
          <Label htmlFor={`chart-background-color-${chartId}`} className="mb-1 text-xs">
            Background Color
          </Label>
          <Input
            id={`chart-background-color-${chartId}`}
            type="color"
            value={options.backgroundColor || '#ffffff'}
            onChange={(e) => updateOption('backgroundColor', e.target.value)}
          />
        </div>
      )}

      {isVisible('height') && (
        <div>
          <Label htmlFor={`chart-height-${chartId}`} className="mb-1 text-xs">
            Height
          </Label>
          <Input
            id={`chart-height-${chartId}`}
            type="number"
            min="100"
            value={options.height !== undefined ? options.height : ''}
            onChange={(e) =>
              updateOption('height', e.target.value ? parseInt(e.target.value) : undefined)
            }
            placeholder="Auto"
          />
        </div>
      )}

      {isVisible('plotBackgroundColor') && (
        <div>
          <Label htmlFor={`chart-plot-background-color-${chartId}`} className="mb-1 text-xs">
            Plot Background Color
          </Label>
          <Input
            id={`chart-plot-background-color-${chartId}`}
            type="color"
            value={options.plotBackgroundColor || '#ffffff'}
            onChange={(e) => updateOption('plotBackgroundColor', e.target.value)}
          />
        </div>
      )}

      {isVisible('plotBorderWidth') && (
        <div>
          <Label htmlFor={`chart-plot-border-width-${chartId}`} className="mb-1 text-xs">
            Plot Border Width
          </Label>
          <Input
            id={`chart-plot-border-width-${chartId}`}
            type="number"
            min="0"
            max="10"
            value={options.plotBorderWidth !== undefined ? options.plotBorderWidth : 0}
            onChange={(e) => updateOption('plotBorderWidth', parseInt(e.target.value) || 0)}
          />
        </div>
      )}

      {isVisible('plotBorderColor') && (
        <div>
          <Label htmlFor={`chart-plot-border-color-${chartId}`} className="mb-1 text-xs">
            Plot Border Color
          </Label>
          <Input
            id={`chart-plot-border-color-${chartId}`}
            type="color"
            value={options.plotBorderColor || '#cccccc'}
            onChange={(e) => updateOption('plotBorderColor', e.target.value)}
          />
        </div>
      )}

      {isVisible('tooltip.split') && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`chart-tooltip-split-${chartId}`}
            checked={options.tooltip?.split || false}
            onChange={(e) => updateTooltip('split', e.target.checked)}
          />
          <Label htmlFor={`chart-tooltip-split-${chartId}`} className="text-xs cursor-pointer">
            Split
          </Label>
        </div>
      )}

      {isVisible('tooltip.shared') && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`chart-tooltip-shared-${chartId}`}
            checked={options.tooltip?.shared || false}
            onChange={(e) => updateTooltip('shared', e.target.checked)}
          />
          <Label htmlFor={`chart-tooltip-shared-${chartId}`} className="text-xs cursor-pointer">
            Shared
          </Label>
        </div>
      )}
    </div>
  );
}

