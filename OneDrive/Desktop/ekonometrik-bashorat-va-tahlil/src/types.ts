/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EconomicIndicator {
  year: number;
  total_loans: number;
  total_deposits: number;
  interest_income: number;
  net_profit: number;
  avg_lending_rate: number;
  npl_ratio: number;
}

export interface RegressionResult {
  a: number; // Intercept
  b: number; // Slope
  rSquared: number;
  equation: string;
  predictedData: { year: number; actual?: number; predicted: number }[];
}
