import React, { useState, useMemo } from 'react';
import { Calculator, BrainCircuit, Loader2, Download, FileSpreadsheet, FileText, PieChart as PieIcon } from 'lucide-react';
import { FeasibilityParams } from '../types';
import { analyzeFeasibility } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FeasibilityStudy: React.FC = () => {
  const [params, setParams] = useState<FeasibilityParams>({
    landCost: 1000000,
    constructionCost: 2500000,
    saleableArea: 2000,
    estimatedPricePerSqm: 2800,
    softCostsPercent: 12,
    durationMonths: 24,
    financingRate: 4.5
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const text = await analyzeFeasibility(params);
      setResult(text || "No response generated.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "Error desconocido";
      setResult(`Error analizando viabilidad. Detalles: ${errorMessage}. Verifica tu API Key y cuota.`);
    } finally {
      setLoading(false);
    }
  };

  // --- Local Calculations for Charts & Exports ---
  const calculations = useMemo(() => {
    const softCosts = params.constructionCost * (params.softCostsPercent / 100);
    // Rough estimation of financial costs: (Land + Construction) * (Rate/12) * Duration / 2 (avg balance)
    const totalHard = params.landCost + params.constructionCost;
    const financialCosts = (totalHard * (params.financingRate / 100) * (params.durationMonths / 12)) / 2;
    
    const totalInvestment = params.landCost + params.constructionCost + softCosts + financialCosts;
    const estimatedRevenue = params.saleableArea * params.estimatedPricePerSqm;
    const netProfit = estimatedRevenue - totalInvestment;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const margin = estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0;

    return { softCosts, financialCosts, totalInvestment, estimatedRevenue, netProfit, roi, margin };
  }, [params]);

  const chartDataCosts = [
      { name: 'Suelo', value: params.landCost, color: '#0ea5e9' }, // sky-500
      { name: 'Construcción', value: params.constructionCost, color: '#f59e0b' }, // amber-500
      { name: 'Costes Ind.', value: calculations.softCosts, color: '#8b5cf6' }, // violet-500
      { name: 'Financiero', value: calculations.financialCosts, color: '#64748b' }, // slate-500
  ];

  const chartDataProfit = [
      { name: 'Inversión Total', value: calculations.totalInvestment },
      { name: 'Ingresos', value: calculations.estimatedRevenue },
      { name: 'Beneficio', value: calculations.netProfit },
  ];

  // --- Export Handlers ---

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    const csvContent = [
        ["Parametro", "Valor"],
        ["Coste Suelo", params.landCost],
        ["Coste Construccion", params.constructionCost],
        ["Superficie Vendible", params.saleableArea],
        ["Precio/m2", params.estimatedPricePerSqm],
        ["Soft Costs %", params.softCostsPercent],
        ["Duracion (meses)", params.durationMonths],
        ["Interes %", params.financingRate],
        ["", ""],
        ["RESULTADOS", ""],
        ["Costes Indirectos", calculations.softCosts.toFixed(2)],
        ["Costes Financieros", calculations.financialCosts.toFixed(2)],
        ["Inversion Total", calculations.totalInvestment.toFixed(2)],
        ["Ingresos Estimados", calculations.estimatedRevenue.toFixed(2)],
        ["Beneficio Neto", calculations.netProfit.toFixed(2)],
        ["ROI %", calculations.roi.toFixed(2)],
        ["Margen %", calculations.margin.toFixed(2)]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "estudio_viabilidad.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <BrainCircuit size={28} />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-slate-800">Estudio de Viabilidad Inteligente</h2>
            <p className="text-slate-500">Análisis financiero profundo y evaluación de riesgos con IA.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form (Hidden on Print) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit no-print">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-emerald-500" />
            Parámetros del Proyecto
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coste del Suelo (€)</label>
              <input 
                type="number" name="landCost" value={params.landCost} onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coste Construcción (€)</label>
              <input 
                type="number" name="constructionCost" value={params.constructionCost} onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sup. Vendible (m²)</label>
                <input 
                  type="number" name="saleableArea" value={params.saleableArea} onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio/m² (€)</label>
                <input 
                  type="number" name="estimatedPricePerSqm" value={params.estimatedPricePerSqm} onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Costes Indirectos (%)</label>
              <input 
                type="number" name="softCostsPercent" value={params.softCostsPercent} onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duración (meses)</label>
                <input 
                  type="number" name="durationMonths" value={params.durationMonths} onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interés (%)</label>
                <input 
                  type="number" name="financingRate" value={params.financingRate} onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {loading ? 'Analizando...' : 'Generar Análisis IA'}
          </button>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Charts (Always visible based on live params) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print-container">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PieIcon size={20} className="text-blue-500" />
                    Proyección Financiera (Estimación Tiempo Real)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 w-full relative">
                        <p className="text-center text-sm font-medium text-slate-500 mb-2">Distribución de Costes</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={chartDataCosts} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {chartDataCosts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(val: number) => `€${val.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-xs text-slate-400">Inversión</span>
                            <p className="font-bold text-slate-700">€{(calculations.totalInvestment/1000000).toFixed(1)}M</p>
                        </div>
                    </div>
                    
                    <div className="h-64 w-full">
                        <p className="text-center text-sm font-medium text-slate-500 mb-2">Rentabilidad Estimada</p>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataProfit} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis hide />
                                <RechartsTooltip formatter={(val: number) => `€${val.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                                    {chartDataProfit.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#64748b' : index === 1 ? '#3b82f6' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-green-50 rounded p-2">
                                <p className="text-xs text-green-600 font-bold">ROI</p>
                                <p className="text-lg font-bold text-green-700">{calculations.roi.toFixed(1)}%</p>
                            </div>
                            <div className="bg-blue-50 rounded p-2">
                                <p className="text-xs text-blue-600 font-bold">Margen</p>
                                <p className="text-lg font-bold text-blue-700">{calculations.margin.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Report */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[500px] overflow-y-auto print-container">
                <div className="flex justify-between items-center mb-6 no-print">
                    <h3 className="text-xl font-bold text-slate-800">Informe Detallado (IA)</h3>
                    {result && (
                        <div className="flex gap-2">
                            <button 
                                onClick={handleDownloadExcel}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                            >
                                <FileSpreadsheet size={16} /> Excel (CSV)
                            </button>
                            <button 
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                            >
                                <FileText size={16} /> PDF / Imprimir
                            </button>
                        </div>
                    )}
                </div>

                {result ? (
                    <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                        {loading ? (
                            <div className="text-center space-y-4">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-lg font-medium text-slate-600">Gemini está pensando...</p>
                            <p className="text-sm">Evaluando riesgos de mercado, costes financieros y rentabilidad.</p>
                            </div>
                        ) : (
                            <>
                            <BrainCircuit size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">Introduce los datos y pulsa "Generar Análisis" para ver el informe.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeasibilityStudy;