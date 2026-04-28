/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function calculateSimpleRegression(
  xValues: number[],
  yValues: number[],
  years: number[],
  forecastYears: number = 3
): {
  a: number;
  b: number;
  rSquared: number;
  equation: string;
  predictions: { year: number; actual?: number; predicted: number }[];
} {
  const n = xValues.length;
  if (n === 0) return { a: 0, b: 0, rSquared: 0, equation: '', predictions: [] };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumX2 += xValues[i] * xValues[i];
    sumY2 += yValues[i] * yValues[i];
  }

  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const a = (sumY - b * sumX) / n;

  // R-squared
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denominator === 0 ? 0 : numerator / denominator;
  const rSquared = r * r;

  const equation = `y = ${a.toFixed(2)} + ${b.toFixed(4)}x`;

  const predictions: { year: number; actual?: number; predicted: number }[] = [];

  // Actual and fitted
  for (let i = 0; i < n; i++) {
    predictions.push({
      year: years[i],
      actual: yValues[i],
      predicted: a + b * xValues[i],
    });
  }

  // Forecast
  if (forecastYears > 0) {
    const lastYear = years[years.length - 1];
    const lastX = xValues[xValues.length - 1];
    const xStep = xValues.length > 1 ? xValues[1] - xValues[0] : 1;

    for (let i = 1; i <= forecastYears; i++) {
      const forecastX = lastX + i * xStep;
      predictions.push({
        year: lastYear + i,
        predicted: a + b * forecastX,
      });
    }
  }

  return { a, b, rSquared, equation, predictions };
}
