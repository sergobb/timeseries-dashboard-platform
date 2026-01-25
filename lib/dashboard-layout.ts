export function getAutoGridDimensions(chartCount: number): { rows: number; cols: number } {
  const count = Math.max(1, chartCount);
  const root = Math.floor(Math.sqrt(count));

  // Perfect square → NxN
  if (root * root === count) {
    return { rows: root, cols: root };
  }

  // Even count → try near-square rectangle
  if (count % 2 === 0) {
    const cols = root + 1;
    const rows = Math.ceil(count / cols);
    return { rows, cols };
  }

  // Odd count → square up
  const n = root + 1;
  return { rows: n, cols: n };
}

export const DEFAULT_CHARTS_PER_ROW = 2;

export function normalizeDashboardLayout(
  layout: { chartsPerRow: number } | { type: 'row' | 'column' | 'grid' } | undefined,
  chartCount: number
): { chartsPerRow: number } {
  if (layout && 'chartsPerRow' in layout) {
    const chartsPerRow = Number(layout.chartsPerRow);
    return { chartsPerRow: Number.isFinite(chartsPerRow) ? Math.max(1, Math.floor(chartsPerRow)) : DEFAULT_CHARTS_PER_ROW };
  }

  if (layout && 'type' in layout) {
    if (layout.type === 'column') return { chartsPerRow: 1 };
    if (layout.type === 'row') return { chartsPerRow: Math.max(1, chartCount || 1) };

    const { cols } = getAutoGridDimensions(chartCount || 1);
    return { chartsPerRow: Math.max(1, cols) };
  }

  return { chartsPerRow: DEFAULT_CHARTS_PER_ROW };
}

