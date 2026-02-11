type TimeUnit = "seconds" | "minutes" | "hours" | "days";

interface StepResult {
  unit: TimeUnit;
  step: number;
  rows: number;
  nextUnit?: TimeUnit;
}
const UNIT_ORDER: TimeUnit[] = ["seconds", "minutes", "hours", "days"];

const UNIT_TO_SECONDS: Record<TimeUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
};

const NICE_STEPS: Record<TimeUnit, number[]> = {
    seconds: [1, 5, 10, 30],
    minutes: [1, 5, 10, 30],
    hours: [1, 6, 12, 18],
    days: [1],
};

export function chooseStep(
  from: Date,
  to: Date,
  unit: TimeUnit,
  minStep: number,
  maxRows: number
): StepResult {
  if (to <= from) {
    throw new Error("to must be greater than from");
  }

  const intervalSeconds = Math.floor(
    (to.getTime() - from.getTime()) / 1000
  );

  const countRows = (intervalUnits: number, step: number): number =>
    Math.floor(intervalUnits / step) + 1;

  let unitIndex = UNIT_ORDER.indexOf(unit);
  let currentMinStep = minStep;

  while (unitIndex < UNIT_ORDER.length) {
    const currentUnit = UNIT_ORDER[unitIndex];
    const intervalUnits =
      intervalSeconds / UNIT_TO_SECONDS[currentUnit];

    const steps = NICE_STEPS[currentUnit]
      .filter(step => step >= currentMinStep)
      .sort((a, b) => a - b);

    for (const step of steps) {
      const rows = countRows(intervalUnits, step);
      if (rows <= maxRows) {
        return {
          unit: currentUnit,
          step,
          rows,
          nextUnit: UNIT_ORDER[unitIndex + 1],
        };
      }
    }

    unitIndex++;
    currentMinStep = 1;
  }

  // fallback
  const fallbackUnit: TimeUnit = "days";
  const fallbackStep = NICE_STEPS.days[NICE_STEPS.days.length - 1];
  const fallbackRows = countRows(
    intervalSeconds / UNIT_TO_SECONDS.days,
    fallbackStep
  );

  return {
    unit: fallbackUnit,
    step: fallbackStep,
    rows: fallbackRows,
    nextUnit: undefined,
  };
}