'use client';

import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { XAxisOptions } from '@/types/chart';

export type XAxisOptionsField =
  | 'title'
  | 'titleStyle.fontSize'
  | 'titleStyle.color'
  | 'labelsEnabled'
  | 'labelsFormat'
  | 'labelsStyle.fontSize'
  | 'labelsStyle.color'
  | 'gridLineWidth'
  | 'lineWidth'
  | 'tickWidth'
  | 'tickLength'
  | 'tickPosition'
  | 'tickColor'
  | 'dateTimeLabelFormats.millisecond'
  | 'dateTimeLabelFormats.second'
  | 'dateTimeLabelFormats.minute'
  | 'dateTimeLabelFormats.hour'
  | 'dateTimeLabelFormats.day'
  | 'dateTimeLabelFormats.week'
  | 'dateTimeLabelFormats.month'
  | 'dateTimeLabelFormats.year';

interface XAxisOptionsProps {
  chartId: string;
  axisId: string;
  options?: XAxisOptions;
  onOptionsChange: (options: XAxisOptions) => void;
  visibleFields?: readonly XAxisOptionsField[];
}

export default function XAxisOptionsComponent({
  chartId,
  axisId,
  options = {},
  onOptionsChange,
  visibleFields,
}: XAxisOptionsProps) {
  const isVisible = (field: XAxisOptionsField) =>
    !visibleFields || visibleFields.includes(field);

  const updateOption = <K extends keyof XAxisOptions>(
    key: K,
    value: XAxisOptions[K]
  ) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const updateTitleStyle = <K extends keyof NonNullable<XAxisOptions['titleStyle']>>(
    key: K,
    value: NonNullable<XAxisOptions['titleStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      titleStyle: {
        ...options.titleStyle,
        [key]: value,
      },
    });
  };

  const updateLabelsStyle = <K extends keyof NonNullable<XAxisOptions['labelsStyle']>>(
    key: K,
    value: NonNullable<XAxisOptions['labelsStyle']>[K]
  ) => {
    onOptionsChange({
      ...options,
      labelsStyle: {
        ...options.labelsStyle,
        [key]: value,
      },
    });
  };

  const updateDateTimeLabelFormat = (
    key: keyof NonNullable<XAxisOptions['dateTimeLabelFormats']>,
    value: string
  ) => {
    onOptionsChange({
      ...options,
      dateTimeLabelFormats: {
        ...options.dateTimeLabelFormats,
        [key]: value || undefined,
      },
    });
  };

  return (
    <div className="space-y-3">
      {isVisible('title') && (
        <div>
          <Label htmlFor={`xaxis-title-${chartId}`} className="mb-1 text-xs">
            Title
          </Label>
          <Input
            id={`xaxis-title-${chartId}`}
            type="text"
            value={options.title || ''}
            onChange={(e) => updateOption('title', e.target.value || undefined)}
            placeholder="Axis title"
          />
        </div>
      )}

      {isVisible('titleStyle.fontSize') && (
        <div>
          <Label htmlFor={`xaxis-title-font-size-${chartId}`} className="mb-1 text-xs">
            Title Font Size
          </Label>
          <Input
            id={`xaxis-title-font-size-${chartId}`}
            type="text"
            value={options.titleStyle?.fontSize || '14px'}
            onChange={(e) => updateTitleStyle('fontSize', e.target.value || undefined)}
            placeholder="14px"
          />
        </div>
      )}

      {isVisible('titleStyle.color') && (
        <div>
          <Label htmlFor={`xaxis-title-color-${chartId}`} className="mb-1 text-xs">
            Title Color
          </Label>
          <Input
            id={`xaxis-title-color-${chartId}`}
            type="color"
            value={options.titleStyle?.color || '#666666'}
            onChange={(e) => updateTitleStyle('color', e.target.value)}
          />
        </div>
      )}

      {isVisible('labelsEnabled') && (
        <div>
          <Label htmlFor={`xaxis-labels-enabled-${chartId}`} className="mb-1 text-xs">
            Labels Enabled
          </Label>
          <Select
            id={`xaxis-labels-enabled-${chartId}`}
            value={options.labelsEnabled !== false ? 'true' : 'false'}
            onChange={(e) => updateOption('labelsEnabled', e.target.value === 'true')}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </Select>
        </div>
      )}

      {isVisible('labelsFormat') && (
        <div>
          <Label htmlFor={`xaxis-labels-format-${chartId}`} className="mb-1 text-xs">
            Labels Format
          </Label>
          <Input
            id={`xaxis-labels-format-${chartId}`}
            type="text"
            value={options.labelsFormat || ''}
            onChange={(e) => updateOption('labelsFormat', e.target.value || undefined)}
            placeholder="e.g., %Y-%m-%d"
          />
        </div>
      )}

      {isVisible('labelsStyle.fontSize') && (
        <div>
          <Label htmlFor={`xaxis-labels-font-size-${chartId}`} className="mb-1 text-xs">
            Labels Font Size
          </Label>
          <Input
            id={`xaxis-labels-font-size-${chartId}`}
            type="text"
            value={options.labelsStyle?.fontSize || '11px'}
            onChange={(e) => updateLabelsStyle('fontSize', e.target.value || undefined)}
            placeholder="11px"
          />
        </div>
      )}

      {isVisible('labelsStyle.color') && (
        <div>
          <Label htmlFor={`xaxis-labels-color-${chartId}`} className="mb-1 text-xs">
            Labels Color
          </Label>
          <Input
            id={`xaxis-labels-color-${chartId}`}
            type="color"
            value={options.labelsStyle?.color || '#666666'}
            onChange={(e) => updateLabelsStyle('color', e.target.value)}
          />
        </div>
      )}

      {isVisible('gridLineWidth') && (
        <div>
          <Label htmlFor={`xaxis-grid-line-width-${chartId}`} className="mb-1 text-xs">
            Grid Line Width
          </Label>
          <Input
            id={`xaxis-grid-line-width-${chartId}`}
            type="number"
            min="0"
            max="10"
            value={options.gridLineWidth !== undefined ? options.gridLineWidth : 1}
            onChange={(e) => updateOption('gridLineWidth', parseInt(e.target.value) || 1)}
          />
        </div>
      )}

      {isVisible('lineWidth') && (
        <div>
          <Label htmlFor={`xaxis-line-width-${chartId}`} className="mb-1 text-xs">
            Line Width
          </Label>
          <Input
            id={`xaxis-line-width-${chartId}`}
            type="number"
            min="0"
            max="10"
            value={options.lineWidth !== undefined ? options.lineWidth : 1}
            onChange={(e) => updateOption('lineWidth', parseInt(e.target.value) || 1)}
          />
        </div>
      )}

      {isVisible('tickWidth') && (
        <div>
          <Label htmlFor={`xaxis-tick-width-${chartId}`} className="mb-1 text-xs">
            Tick Width
          </Label>
          <Input
            id={`xaxis-tick-width-${chartId}`}
            type="number"
            min="0"
            max="10"
            value={options.tickWidth !== undefined ? options.tickWidth : 1}
            onChange={(e) => updateOption('tickWidth', parseInt(e.target.value) || 1)}
          />
        </div>
      )}

      {isVisible('tickLength') && (
        <div>
          <Label htmlFor={`xaxis-tick-length-${chartId}`} className="mb-1 text-xs">
            Tick Length
          </Label>
          <Input
            id={`xaxis-tick-length-${chartId}`}
            type="number"
            min="0"
            max="20"
            value={options.tickLength !== undefined ? options.tickLength : 10}
            onChange={(e) => updateOption('tickLength', parseInt(e.target.value) || 10)}
          />
        </div>
      )}

      {isVisible('tickPosition') && (
        <div>
          <Label htmlFor={`xaxis-tick-position-${chartId}`} className="mb-1 text-xs">
            Tick Position
          </Label>
          <Select
            id={`xaxis-tick-position-${chartId}`}
            value={options.tickPosition || 'outside'}
            onChange={(e) =>
              updateOption('tickPosition', e.target.value as XAxisOptions['tickPosition'])
            }
          >
            <option value="outside">Outside</option>
            <option value="inside">Inside</option>
          </Select>
        </div>
      )}

      {isVisible('tickColor') && (
        <div>
          <Label htmlFor={`xaxis-tick-color-${chartId}`} className="mb-1 text-xs">
            Tick Color
          </Label>
          <Input
            id={`xaxis-tick-color-${chartId}`}
            type="color"
            value={options.tickColor || '#ccd6eb'}
            onChange={(e) => updateOption('tickColor', e.target.value)}
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.millisecond') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-millisecond-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Millisecond)
          </Label>
          <Input
            id={`xaxis-datetime-format-millisecond-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.millisecond || ''}
            onChange={(e) => updateDateTimeLabelFormat('millisecond', e.target.value)}
            placeholder="%H:%M:%S.%L"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.second') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-second-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Second)
          </Label>
          <Input
            id={`xaxis-datetime-format-second-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.second || ''}
            onChange={(e) => updateDateTimeLabelFormat('second', e.target.value)}
            placeholder="%H:%M:%S"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.minute') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-minute-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Minute)
          </Label>
          <Input
            id={`xaxis-datetime-format-minute-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.minute || ''}
            onChange={(e) => updateDateTimeLabelFormat('minute', e.target.value)}
            placeholder="%H:%M"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.hour') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-hour-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Hour)
          </Label>
          <Input
            id={`xaxis-datetime-format-hour-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.hour || ''}
            onChange={(e) => updateDateTimeLabelFormat('hour', e.target.value)}
            placeholder="%H:%M"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.day') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-day-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Day)
          </Label>
          <Input
            id={`xaxis-datetime-format-day-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.day || ''}
            onChange={(e) => updateDateTimeLabelFormat('day', e.target.value)}
            placeholder="%e. %b"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.week') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-week-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Week)
          </Label>
          <Input
            id={`xaxis-datetime-format-week-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.week || ''}
            onChange={(e) => updateDateTimeLabelFormat('week', e.target.value)}
            placeholder="%e. %b"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.month') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-month-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Month)
          </Label>
          <Input
            id={`xaxis-datetime-format-month-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.month || ''}
            onChange={(e) => updateDateTimeLabelFormat('month', e.target.value)}
            placeholder="%b '%y"
          />
        </div>
      )}

      {isVisible('dateTimeLabelFormats.year') && (
        <div>
          <Label htmlFor={`xaxis-datetime-format-year-${chartId}`} className="mb-1 text-xs">
            DateTime Format (Year)
          </Label>
          <Input
            id={`xaxis-datetime-format-year-${chartId}`}
            type="text"
            value={options.dateTimeLabelFormats?.year || ''}
            onChange={(e) => updateDateTimeLabelFormat('year', e.target.value)}
            placeholder="%Y"
          />
        </div>
      )}
    </div>
  );
}

