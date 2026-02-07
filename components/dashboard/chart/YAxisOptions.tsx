'use client';

import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { YAxisOptions } from '@/types/chart';

interface YAxisOptionsProps {
  seriesId: string;
  axisId: string;
  options?: YAxisOptions;
  onOptionsChange: (options: YAxisOptions) => void;
}

export default function YAxisOptionsComponent({
  seriesId,
  axisId,
  options = {},
  onOptionsChange,
}: YAxisOptionsProps) {
  const updateOption = <K extends keyof YAxisOptions>(
    key: K,
    value: YAxisOptions[K]
  ) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const updateTitleStyle = <K extends keyof NonNullable<YAxisOptions['titleStyle']>>(
    key: K,
    value: NonNullable<YAxisOptions['titleStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      titleStyle: {
        ...options.titleStyle,
        [key]: value,
      },
    });
  };

  const updateLabelsStyle = <K extends keyof NonNullable<YAxisOptions['labelsStyle']>>(
    key: K,
    value: NonNullable<YAxisOptions['labelsStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      labelsStyle: {
        ...options.labelsStyle,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`yaxis-type-${seriesId}`} className="mb-1 text-xs">
          Scale Type
        </Label>
        <Select
          id={`yaxis-type-${seriesId}`}
          value={options.type || 'linear'}
          onChange={(e) =>
            updateOption('type', e.target.value as 'linear' | 'logarithmic')
          }
        >
          <option value="linear">Linear</option>
          <option value="logarithmic">Logarithmic</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={`yaxis-title-${seriesId}`} className="mb-1 text-xs">
          Title
        </Label>
        <Input
          id={`yaxis-title-${seriesId}`}
          type="text"
          value={options.title || ''}
          onChange={(e) => updateOption('title', e.target.value || undefined)}
          placeholder="Axis title"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-opposite-${seriesId}`} className="mb-1 text-xs">
          Opposite Side
        </Label>
        <Select
          id={`yaxis-opposite-${seriesId}`}
          value={options.opposite ? 'true' : 'false'}
          onChange={(e) => updateOption('opposite', e.target.value === 'true')}
        >
          <option value="false">Left</option>
          <option value="true">Right</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={`yaxis-labels-enabled-${seriesId}`} className="mb-1 text-xs">
          Labels Enabled
        </Label>
        <Select
          id={`yaxis-labels-enabled-${seriesId}`}
          value={options.labelsEnabled !== false ? 'true' : 'false'}
          onChange={(e) => updateOption('labelsEnabled', e.target.value === 'true')}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={`yaxis-min-${seriesId}`} className="mb-1 text-xs">
          Min
        </Label>
        <Input
          id={`yaxis-min-${seriesId}`}
          type="number"
          step="any"
          value={options.min !== undefined ? options.min : ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              updateOption('min', undefined);
              return;
            }
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) updateOption('min', n);
          }}
          placeholder="Auto"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-max-${seriesId}`} className="mb-1 text-xs">
          Max
        </Label>
        <Input
          id={`yaxis-max-${seriesId}`}
          type="number"
          step="any"
          value={options.max !== undefined ? options.max : ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              updateOption('max', undefined);
              return;
            }
            const n = parseFloat(raw);
            if (!Number.isNaN(n)) updateOption('max', n);
          }}
          placeholder="Auto"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-title-shift-${seriesId}`} className="mb-1 text-xs">
          Axis Shift (px)
        </Label>
        <Input
          id={`yaxis-title-shift-${seriesId}`}
          type="number"
          min={0}
          step={1}
          value={options.titleShift ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              updateOption('titleShift', undefined);
              return;
            }
            const n = parseInt(raw, 10);
            if (!Number.isNaN(n) && n >= 0) updateOption('titleShift', n);
          }}
          placeholder="0"
        />
      </div>

      <hr className="my-2" />

      <div>
        <Label htmlFor={`yaxis-title-font-size-${seriesId}`} className="mb-1 text-xs">
          Title Font Size
        </Label>
        <Input
          id={`yaxis-title-font-size-${seriesId}`}
          type="text"
          value={options.titleStyle?.fontSize || '14px'}
          onChange={(e) => updateTitleStyle('fontSize', e.target.value || undefined)}
          placeholder="14px"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-title-color-${seriesId}`} className="mb-1 text-xs">
          Title Color
        </Label>
        <Input
          id={`yaxis-title-color-${seriesId}`}
          type="color"
          value={options.titleStyle?.color || '#666666'}
          onChange={(e) => updateTitleStyle('color', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-labels-format-${seriesId}`} className="mb-1 text-xs">
          Labels Format
        </Label>
        <Input
          id={`yaxis-labels-format-${seriesId}`}
          type="text"
          value={options.labelsFormat || ''}
          onChange={(e) => updateOption('labelsFormat', e.target.value || undefined)}
          placeholder="e.g., {value:.1f}"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-labels-font-size-${seriesId}`} className="mb-1 text-xs">
          Labels Font Size
        </Label>
        <Input
          id={`yaxis-labels-font-size-${seriesId}`}
          type="text"
          value={options.labelsStyle?.fontSize || '11px'}
          onChange={(e) => updateLabelsStyle('fontSize', e.target.value || undefined)}
          placeholder="11px"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-labels-color-${seriesId}`} className="mb-1 text-xs">
          Labels Color
        </Label>
        <Input
          id={`yaxis-labels-color-${seriesId}`}
          type="color"
          value={options.labelsStyle?.color || '#666666'}
          onChange={(e) => updateLabelsStyle('color', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-min-${seriesId}`} className="mb-1 text-xs">
          Min Value
        </Label>
        <Input
          id={`yaxis-min-${seriesId}`}
          type="number"
          value={options.min !== undefined ? options.min : ''}
          onChange={(e) =>
            updateOption('min', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          placeholder="Auto"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-max-${seriesId}`} className="mb-1 text-xs">
          Max Value
        </Label>
        <Input
          id={`yaxis-max-${seriesId}`}
          type="number"
          value={options.max !== undefined ? options.max : ''}
          onChange={(e) =>
            updateOption('max', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          placeholder="Auto"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-grid-line-width-${seriesId}`} className="mb-1 text-xs">
          Grid Line Width
        </Label>
        <Input
          id={`yaxis-grid-line-width-${seriesId}`}
          type="number"
          min="0"
          max="10"
          value={options.gridLineWidth !== undefined ? options.gridLineWidth : 1}
          onChange={(e) => updateOption('gridLineWidth', parseInt(e.target.value) || 1)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-line-width-${seriesId}`} className="mb-1 text-xs">
          Line Width
        </Label>
        <Input
          id={`yaxis-line-width-${seriesId}`}
          type="number"
          min="0"
          max="10"
          value={options.lineWidth !== undefined ? options.lineWidth : 1}
          onChange={(e) => updateOption('lineWidth', parseInt(e.target.value) || 1)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-tick-width-${seriesId}`} className="mb-1 text-xs">
          Tick Width
        </Label>
        <Input
          id={`yaxis-tick-width-${seriesId}`}
          type="number"
          min="0"
          max="10"
          value={options.tickWidth !== undefined ? options.tickWidth : 1}
          onChange={(e) => updateOption('tickWidth', parseInt(e.target.value) || 1)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-tick-interval-${seriesId}`} className="mb-1 text-xs">
          Tick Interval
        </Label>
        <Input
          id={`yaxis-tick-interval-${seriesId}`}
          type="number"
          min="0"
          step="0.1"
          value={options.tickInterval !== undefined ? options.tickInterval : ''}
          onChange={(e) =>
            updateOption('tickInterval', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          placeholder="Auto"
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-tick-length-${seriesId}`} className="mb-1 text-xs">
          Tick Length
        </Label>
        <Input
          id={`yaxis-tick-length-${seriesId}`}
          type="number"
          min="0"
          max="20"
          value={options.tickLength !== undefined ? options.tickLength : 10}
          onChange={(e) => updateOption('tickLength', parseInt(e.target.value) || 10)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-tick-position-${seriesId}`} className="mb-1 text-xs">
          Tick Position
        </Label>
        <Select
          id={`yaxis-tick-position-${seriesId}`}
          value={options.tickPosition || 'outside'}
          onChange={(e) =>
            updateOption('tickPosition', e.target.value as YAxisOptions['tickPosition'])
          }
        >
          <option value="outside">Outside</option>
          <option value="inside">Inside</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={`yaxis-tick-color-${seriesId}`} className="mb-1 text-xs">
          Tick Color
        </Label>
        <Input
          id={`yaxis-tick-color-${seriesId}`}
          type="color"
          value={options.tickColor || '#ccd6eb'}
          onChange={(e) => updateOption('tickColor', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor={`yaxis-start-on-tick-${seriesId}`} className="mb-1 text-xs">
          Start On Tick
        </Label>
        <Select
          id={`yaxis-start-on-tick-${seriesId}`}
          value={options.startOnTick !== false ? 'true' : 'false'}
          onChange={(e) => updateOption('startOnTick', e.target.value === 'true')}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={`yaxis-end-on-tick-${seriesId}`} className="mb-1 text-xs">
          End On Tick
        </Label>
        <Select
          id={`yaxis-end-on-tick-${seriesId}`}
          value={options.endOnTick !== false ? 'true' : 'false'}
          onChange={(e) => updateOption('endOnTick', e.target.value === 'true')}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
    </div>
  );
}

