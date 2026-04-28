/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Table, BarChart3, Calculator, Download, 
  ChevronRight, Info, Plus, Trash2, RefreshCcw, Landmark 
} from 'lucide-react';
import { calculateSimpleRegression } from './utils';
import { EconomicIndicator } from './types';

const INITIAL_DATA: EconomicIndicator[] = [
  { year: 2015, total_loans: 687000, total_deposits: 412000, interest_income: 148000, net_profit: 29000, avg_lending_rate: 23.5, npl_ratio: 3.2 },
  { year: 2016, total_loans: 820000, total_deposits: 520000, interest_income: 178000, net_profit: 22000, avg_lending_rate: 24.0, npl_ratio: 3.8 },
  { year: 2017, total_loans: 1150000, total_deposits: 680000, interest_income: 245000, net_profit: 35000, avg_lending_rate: 24.5, npl_ratio: 4.1 },
  { year: 2018, total_loans: 2100000, total_deposits: 1350000, interest_income: 480000, net_profit: 58000, avg_lending_rate: 25.0, npl_ratio: 4.5 },
  { year: 2019, total_loans: 3800000, total_deposits: 2900000, interest_income: 820000, net_profit: 95000, avg_lending_rate: 23.8, npl_ratio: 4.2 },
  { year: 2020, total_loans: 5705937, total_deposits: 4924088, interest_income: 1480356, net_profit: 170000, avg_lending_rate: 22.0, npl_ratio: 3.9 },
  { year: 2021, total_loans: 7754314, total_deposits: 6796109, interest_income: 1633844, net_profit: 107583, avg_lending_rate: 21.5, npl_ratio: 3.5 },
  { year: 2022, total_loans: 9161877, total_deposits: 7697657, interest_income: 2335683, net_profit: 228394, avg_lending_rate: 22.8, npl_ratio: 3.2 },
  { year: 2023, total_loans: 10293932, total_deposits: 9227044, interest_income: 3392248, net_profit: 607651, avg_lending_rate: 24.0, npl_ratio: 2.8 },
  { year: 2024, total_loans: 12944273, total_deposits: 13814675, interest_income: 4114881, net_profit: 189973, avg_lending_rate: 23.5, npl_ratio: 2.5 },
];

const VARIABLE_LABELS: Record<keyof EconomicIndicator, string> = {
  year: 'Yil',
  total_loans: 'Umumiy kreditlar (mln soʻm)',
  total_deposits: 'Umumiy depozitlar (mln soʻm)',
  interest_income: 'Foizli daromad (mln soʻm)',
  net_profit: 'Sof foyda (mln soʻm)',
  avg_lending_rate: 'Oʻrtacha stavka (%)',
  npl_ratio: 'NPL koeffitsienti (%)',
};

export default function App() {
  const [data, setData] = useState<EconomicIndicator[]>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'forecast'>('analysis');
  const [dependentVar, setDependentVar] = useState<keyof EconomicIndicator>('net_profit');
  const [independentVar, setIndependentVar] = useState<keyof EconomicIndicator>('total_loans');
  const [forecastYears, setForecastYears] = useState(3);

  const regression = useMemo(() => {
    const x = data.map(d => Number(d[independentVar]));
    const y = data.map(d => Number(d[dependentVar]));
    const years = data.map(d => d.year);
    return calculateSimpleRegression(x, y, years, forecastYears);
  }, [data, dependentVar, independentVar, forecastYears]);

  const trends = useMemo(() => {
    return data.map(d => ({
      ...d,
      profitability: (d.net_profit / d.total_loans) * 100
    }));
  }, [data]);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-black/10 px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm">
            <TrendingUp className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic text-2xl leading-none">Ekonometrik Tahlil</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono mt-1">Aloqabank • 2015-2024</p>
          </div>
        </div>
        
        <nav className="flex gap-4">
          {[
            { id: 'data', label: 'Maʼlumotlar', icon: Table },
            { id: 'analysis', label: 'Tahlil', icon: BarChart3 },
            { id: 'forecast', label: 'Prognoz', icon: Calculator },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-sm border ${
                activeTab === tab.id 
                  ? 'bg-black text-white border-black' 
                  : 'bg-transparent text-black border-transparent hover:border-black/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="font-serif italic text-3xl">Tashkilot Koʻrsatkichlari</h2>
                  <p className="text-sm opacity-60">Iqtisodiy tahlil uchun asosiy vaqtli qatorlar maʼlumotlari.</p>
                </div>
                <button 
                  onClick={() => setData(INITIAL_DATA)}
                  className="p-2 border border-black/20 hover:bg-black hover:text-white transition-colors rounded-sm"
                  title="Dastlabki holatga qaytarish"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto border border-black border-b-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/5 font-mono text-[11px] uppercase tracking-wider">
                      <th className="p-4 border-b border-r border-black">Yil</th>
                      <th className="p-4 border-b border-r border-black text-right">{VARIABLE_LABELS.total_loans}</th>
                      <th className="p-4 border-b border-r border-black text-right">{VARIABLE_LABELS.total_deposits}</th>
                      <th className="p-4 border-b border-r border-black text-right">{VARIABLE_LABELS.interest_income}</th>
                      <th className="p-4 border-b border-black text-right">{VARIABLE_LABELS.net_profit}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {data.map((row, idx) => (
                      <tr 
                        key={row.year} 
                        className="hover:bg-black hover:text-[#E4E3E0] transition-colors group"
                      >
                        <td className="p-4 border-b border-r border-black">{row.year}</td>
                        <td className="p-4 border-b border-r border-black text-right">{row.total_loans.toLocaleString()}</td>
                        <td className="p-4 border-b border-r border-black text-right">{row.total_deposits.toLocaleString()}</td>
                        <td className="p-4 border-b border-r border-black text-right">{row.interest_income.toLocaleString()}</td>
                        <td className="p-4 border-b border-black text-right">{row.net_profit.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-white border border-black rounded-sm flex items-start gap-4">
                <div className="p-3 bg-black/5 rounded-full">
                  <Info className="w-5 h-5 opacity-40" />
                </div>
                <div>
                  <h4 className="font-medium">Maʼlumotlar haqida</h4>
                  <p className="text-sm opacity-60 mt-1 max-w-2xl">
                    Ushbu maʼlumotlar Aloqabank AT ning 2015-2024 yillardagi yillik hisobotlari va rasmiy saytidagi koʻrsatkichlar asosida tayyorlandi. Kreditlar va depozitlar hajmi mln soʻmda koʻrsatilgan.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white border border-black p-8 rounded-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif italic text-2xl">Iqtisodiy Bogʻliqlik Grafigi</h3>
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-mono opacity-50">Erksiz oʻzgaruvchi (Y)</label>
                        <select 
                          value={dependentVar} 
                          onChange={(e) => setDependentVar(e.target.value as any)}
                          className="text-xs font-mono border-b border-black outline-none bg-transparent py-1"
                        >
                          {Object.entries(VARIABLE_LABELS).map(([k, v]) => (
                             k !== 'year' && <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-mono opacity-50">Erkli oʻzgaruvchi (X)</label>
                        <select 
                          value={independentVar} 
                          onChange={(e) => setIndependentVar(e.target.value as any)}
                          className="text-xs font-mono border-b border-black outline-none bg-transparent py-1"
                        >
                          {Object.entries(VARIABLE_LABELS).map(([k, v]) => (
                             k !== 'year' && <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name={VARIABLE_LABELS[independentVar]} 
                          unit=""
                          stroke="#141414"
                          fontSize={10}
                          tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name={VARIABLE_LABELS[dependentVar]} 
                          unit="" 
                          stroke="#141414"
                          fontSize={10}
                          tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          contentStyle={{ background: '#141414', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <Scatter 
                          name="Kuzatilgan maʼlumotlar" 
                          data={data.map(d => ({ x: d[independentVar], y: d[dependentVar], year: d.year }))} 
                          fill="#141414" 
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white border border-black p-8 rounded-sm">
                    <h4 className="font-serif italic text-xl mb-6">Regressiya Tenglamasi</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-black/5 rounded-sm font-mono text-lg text-center">
                        {regression.equation}
                      </div>
                      <p className="text-xs opacity-60 leading-relaxed italic">
                        Ushbu tenglama {VARIABLE_LABELS[independentVar]} oʻzgarganda {VARIABLE_LABELS[dependentVar]} ning oʻrtacha qancha oʻzgarishini ifodalaydi.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black p-8 rounded-sm">
                    <h4 className="font-serif italic text-xl mb-6">Model Sifati (R²)</h4>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-5xl font-mono leading-none">{(regression.rSquared * 100).toFixed(1)}%</span>
                      <span className="text-xs uppercase tracking-widest opacity-50 pb-1">Determinatsiya</span>
                    </div>
                    <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black" 
                        style={{ width: `${regression.rSquared * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs opacity-60 mt-4 leading-relaxed">
                      Modelning ishonchlilik darajasi. {regression.rSquared > 0.7 ? 'Juda yuqori' : regression.rSquared > 0.4 ? 'Oʻrtacha' : 'Past'} darajadagi korrelyatsiya mavjud.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-black text-white p-8 rounded-sm h-full">
                  <h3 className="font-serif italic text-2xl mb-8">Ekonometrik Talqin</h3>
                  <div className="space-y-8 text-sm opacity-80 leading-relaxed">
                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Maʼno (β₀)</h4>
                      <p>
                        Agar {VARIABLE_LABELS[independentVar]} nolga teng boʻlsa, kutilayotgan {VARIABLE_LABELS[dependentVar]} miqdori 
                        <span className="text-white font-mono ml-1">{regression.a.toFixed(2)}</span> mln soʻmga teng boʻladi.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Oʻzgarish (β₁)</h4>
                      <p>
                        {VARIABLE_LABELS[independentVar]} 1 mln soʻmga oshsa, {VARIABLE_LABELS[dependentVar]} oʻrtacha 
                        <span className="text-white font-mono ml-1">{regression.b.toFixed(4)}</span> mln soʻmga {regression.b > 0 ? 'oshadi' : 'kamayadi'}.
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest opacity-40 mb-2 font-mono">Dye-Boltos testi</h4>
                      <p>
                        Kuzatilgan maʼlumotlar soni n = {data.length}. 
                        Bu vaqtli qatorlarda tendentsiya {regression.b > 0 ? 'musbat' : 'manfiy'} ekanligini koʻrsatmoqda.
                      </p>
                    </section>

                    <div className="pt-8 border-t border-white/20">
                      <div className="flex items-center gap-2 text-xs opacity-100">
                        <Landmark className="w-4 h-4" />
                        <span>Aloqabank AT Strategik Tahlili</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white border border-black p-8 rounded-sm md:col-span-3">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-serif italic text-2xl">Prognoz Koʻrsatkichlari</h3>
                      <p className="text-xs opacity-50 mt-1">Regressiya modeli asosida kelajakni bashorat qilish</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] uppercase font-mono opacity-50">Yil soni:</span>
                       <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={forecastYears}
                        onChange={(e) => setForecastYears(parseInt(e.target.value))}
                        className="accent-black h-1 bg-black/10 rounded-lg appearance-none cursor-pointer"
                       />
                       <span className="font-mono text-sm w-8">{forecastYears}</span>
                    </div>
                  </div>

                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={regression.predictions} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                        <XAxis 
                          dataKey="year" 
                          stroke="#141414" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#141414" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v.toLocaleString()}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#141414', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                        <Line 
                          name="Haqiqiy" 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#141414" 
                          strokeWidth={2} 
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          name="Prognoz/Model" 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#141414" 
                          strokeWidth={1} 
                          strokeDasharray="5 5"
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-black p-8 rounded-sm overflow-hidden flex flex-col">
                   <h4 className="font-serif italic text-xl mb-6">Kutilayotgan Qiymatlar</h4>
                   <div className="space-y-4 flex-1">
                      {regression.predictions.filter(p => !p.actual).map(p => (
                        <div key={p.year} className="flex justify-between items-end border-b border-black/5 pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-mono opacity-40">Yil</span>
                            <div className="font-mono text-sm">{p.year}</div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] uppercase font-mono opacity-40">{VARIABLE_LABELS[dependentVar].split('(')[0]}</span>
                             <div className="font-mono text-lg">{Math.round(p.predicted).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-8 border-t border-black/10">
                      <button className="w-full bg-black text-white py-3 rounded-sm text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <Download className="w-3 h-3" />
                        Hisobotni Saqlash
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-black/10 p-8 mt-12 bg-white/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-50 text-[10px] uppercase tracking-[0.2em] font-mono gap-4">
          <p>© 2026 Ekonometrik Tahlil Tizimi • Aloqabank Strategik Tahlil</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Model: n=10</span>
            <span className="flex items-center gap-1">Status: Yakuniy Hisobot</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
