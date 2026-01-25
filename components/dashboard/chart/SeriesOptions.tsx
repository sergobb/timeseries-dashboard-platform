'use client';

import { useCallback, useEffect } from 'react';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { ChartType, SeriesOptions } from '@/types/chart';

interface SeriesOptionsProps {
  seriesId: string;
  chartType: ChartType;
  yColumnName?: string;
  yColumnDescription?: string;
  options?: SeriesOptions;
  onOptionsChange: (options: SeriesOptions) => void;
}

export default function SeriesOptionsComponent({
  seriesId,
  chartType,
  yColumnName,
  yColumnDescription,
  options = {},
  onOptionsChange,
}: SeriesOptionsProps) {
  const updateOption = useCallback(
    <K extends keyof SeriesOptions>(key: K, value: SeriesOptions[K]) => {
      onOptionsChange({
        ...options,
        [key]: value,
      });
    },
    [onOptionsChange, options]
  );

  useEffect(() => {
    const labelDefault = yColumnDescription || yColumnName;
    if ((!options.label || options.label.trim() === '') && labelDefault) {
      updateOption('label', labelDefault);
    }
  }, [options.label, updateOption, yColumnDescription, yColumnName]);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={`series-label-${seriesId}`} className="mb-1 text-xs">
          Label
        </Label>
        <Input
          id={`series-label-${seriesId}`}
          value={options.label ?? yColumnDescription ?? yColumnName ?? ''}
          onChange={(e) => updateOption('label', e.target.value)}
          placeholder={yColumnDescription || yColumnName || 'Series label'}
        />
      </div>
      {chartType === 'line' && (
        <>
          <div>
            <Label htmlFor={`mode-${seriesId}`} className="mb-1 text-xs">
              Mode
            </Label>
            <Select
              id={`mode-${seriesId}`}
              value={options.mode || 'lines'}
              onChange={(e) =>
                updateOption('mode', e.target.value as SeriesOptions['mode'])
              }
            >
              <option value="lines">Lines</option>
              <option value="markers">Markers</option>
              <option value="lines+markers">Lines + Markers</option>
              <option value="text">Text</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`line-shape-${seriesId}`} className="mb-1 text-xs">
              Line Shape
            </Label>
            <Select
              id={`line-shape-${seriesId}`}
              value={options.lineShape || 'linear'}
              onChange={(e) =>
                updateOption('lineShape', e.target.value as SeriesOptions['lineShape'])
              }
            >
              <option value="linear">Linear</option>
              <option value="spline">Spline</option>
              <option value="hv">HV</option>
              <option value="vh">VH</option>
              <option value="hvh">HVH</option>
              <option value="vhv">VHV</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`dash-style-${seriesId}`} className="mb-1 text-xs">
              Dash Style
            </Label>
            <Select
              id={`dash-style-${seriesId}`}
              value={options.dashStyle || 'Solid'}
              onChange={(e) =>
                updateOption('dashStyle', e.target.value as SeriesOptions['dashStyle'])
              }
            >
              <option value="Solid">Solid</option>
              <option value="ShortDash">Short Dash</option>
              <option value="ShortDot">Short Dot</option>
              <option value="ShortDashDot">Short Dash Dot</option>
              <option value="ShortDashDotDot">Short Dash Dot Dot</option>
              <option value="Dot">Dot</option>
              <option value="Dash">Dash</option>
              <option value="LongDash">Long Dash</option>
              <option value="DashDot">Dash Dot</option>
              <option value="LongDashDot">Long Dash Dot</option>
              <option value="LongDashDotDot">Long Dash Dot Dot</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`line-width-${seriesId}`} className="mb-1 text-xs">
              Line Width
            </Label>
            <Input
              id={`line-width-${seriesId}`}
              type="number"
              min="1"
              max="20"
              value={options.lineWidth || 2}
              onChange={(e) =>
                updateOption('lineWidth', parseInt(e.target.value) || 2)
              }
            />
          </div>
          <div>
            <Label htmlFor={`color-${seriesId}`} className="mb-1 text-xs">
              Color
            </Label>
            <Input
              id={`color-${seriesId}`}
              type="color"
              value={options.color || '#1f77b4'}
              onChange={(e) => updateOption('color', e.target.value)}
            />
          </div>
        </>
      )}

      {chartType === 'bar' && (
        <>
          <div>
            <Label htmlFor={`orientation-${seriesId}`} className="mb-1 text-xs">
              Orientation
            </Label>
            <Select
              id={`orientation-${seriesId}`}
              value={options.orientation || 'v'}
              onChange={(e) =>
                updateOption('orientation', e.target.value as SeriesOptions['orientation'])
              }
            >
              <option value="v">Vertical</option>
              <option value="h">Horizontal</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`bar-color-${seriesId}`} className="mb-1 text-xs">
              Color
            </Label>
            <Input
              id={`bar-color-${seriesId}`}
              type="color"
              value={options.color || '#1f77b4'}
              onChange={(e) => updateOption('color', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`text-position-${seriesId}`} className="mb-1 text-xs">
              Text Position
            </Label>
            <Select
              id={`text-position-${seriesId}`}
              value={options.textPosition || 'none'}
              onChange={(e) =>
                updateOption('textPosition', e.target.value as SeriesOptions['textPosition'])
              }
            >
              <option value="none">None</option>
              <option value="inside">Inside</option>
              <option value="outside">Outside</option>
              <option value="auto">Auto</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`bar-width-${seriesId}`} className="mb-1 text-xs">
              Width
            </Label>
            <Input
              id={`bar-width-${seriesId}`}
              type="number"
              min="0"
              step="0.1"
              value={options.width || ''}
              onChange={(e) =>
                updateOption('width', parseFloat(e.target.value) || undefined)
              }
              placeholder="Auto"
            />
          </div>
        </>
      )}

      {chartType === 'scatter' && (
        <>
          <div>
            <Label htmlFor={`scatter-mode-${seriesId}`} className="mb-1 text-xs">
              Mode
            </Label>
            <Select
              id={`scatter-mode-${seriesId}`}
              value={options.mode || 'markers'}
              onChange={(e) =>
                updateOption('mode', e.target.value as SeriesOptions['mode'])
              }
            >
              <option value="markers">Markers</option>
              <option value="lines">Lines</option>
              <option value="lines+markers">Lines + Markers</option>
              <option value="text">Text</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`marker-size-${seriesId}`} className="mb-1 text-xs">
              Marker Size
            </Label>
            <Input
              id={`marker-size-${seriesId}`}
              type="number"
              min="1"
              max="50"
              value={options.markerSize || 6}
              onChange={(e) =>
                updateOption('markerSize', parseInt(e.target.value) || 6)
              }
            />
          </div>
          <div>
            <Label htmlFor={`scatter-color-${seriesId}`} className="mb-1 text-xs">
              Color
            </Label>
            <Input
              id={`scatter-color-${seriesId}`}
              type="color"
              value={options.color || '#1f77b4'}
              onChange={(e) => updateOption('color', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`marker-symbol-${seriesId}`} className="mb-1 text-xs">
              Marker Symbol
            </Label>
            <Select
              id={`marker-symbol-${seriesId}`}
              value={options.markerSymbol || 'circle'}
              onChange={(e) => updateOption('markerSymbol', e.target.value)}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="diamond">Diamond</option>
              <option value="triangle">Triangle</option>
              <option value="triangle-down">Triangle Down</option>
            </Select>
          </div>
        </>
      )}

      {chartType === 'area' && (
        <>
          <div>
            <Label htmlFor={`area-fill-opacity-${seriesId}`} className="mb-1 text-xs">
              Fill Opacity
            </Label>
            <Input
              id={`area-fill-opacity-${seriesId}`}
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={options.fillOpacity !== undefined ? options.fillOpacity : 0.5}
              onChange={(e) =>
                updateOption('fillOpacity', parseFloat(e.target.value) || 0.5)
              }
            />
          </div>
          <div>
            <Label htmlFor={`area-threshold-${seriesId}`} className="mb-1 text-xs">
              Threshold
            </Label>
            <Input
              id={`area-threshold-${seriesId}`}
              type="number"
              value={options.threshold !== undefined ? options.threshold : 0}
              onChange={(e) =>
                updateOption('threshold', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <Label htmlFor={`area-dash-style-${seriesId}`} className="mb-1 text-xs">
              Dash Style
            </Label>
            <Select
              id={`area-dash-style-${seriesId}`}
              value={options.dashStyle || 'Solid'}
              onChange={(e) =>
                updateOption('dashStyle', e.target.value as SeriesOptions['dashStyle'])
              }
            >
              <option value="Solid">Solid</option>
              <option value="ShortDash">Short Dash</option>
              <option value="ShortDot">Short Dot</option>
              <option value="ShortDashDot">Short Dash Dot</option>
              <option value="ShortDashDotDot">Short Dash Dot Dot</option>
              <option value="Dot">Dot</option>
              <option value="Dash">Dash</option>
              <option value="LongDash">Long Dash</option>
              <option value="DashDot">Dash Dot</option>
              <option value="LongDashDot">Long Dash Dot</option>
              <option value="LongDashDotDot">Long Dash Dot Dot</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`area-line-shape-${seriesId}`} className="mb-1 text-xs">
              Line Shape
            </Label>
            <Select
              id={`area-line-shape-${seriesId}`}
              value={options.lineShape || 'linear'}
              onChange={(e) =>
                updateOption('lineShape', e.target.value as SeriesOptions['lineShape'])
              }
            >
              <option value="linear">Linear</option>
              <option value="spline">Spline</option>
              <option value="hv">HV</option>
              <option value="vh">VH</option>
              <option value="hvh">HVH</option>
              <option value="vhv">VHV</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`area-line-width-${seriesId}`} className="mb-1 text-xs">
              Line Width
            </Label>
            <Input
              id={`area-line-width-${seriesId}`}
              type="number"
              min="0"
              max="20"
              value={options.lineWidth || 2}
              onChange={(e) =>
                updateOption('lineWidth', parseInt(e.target.value) || 2)
              }
            />
          </div>
          <div>
            <Label htmlFor={`area-color-${seriesId}`} className="mb-1 text-xs">
              Color
            </Label>
            <Input
              id={`area-color-${seriesId}`}
              type="color"
              value={options.color || '#1f77b4'}
              onChange={(e) => updateOption('color', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

