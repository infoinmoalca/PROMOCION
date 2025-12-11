
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { MOCK_CASH_FLOW } from '../constants';
import { Project, ProjectStatus } from '../types';
import { TrendingUp, DollarSign, Activity, Building2, Settings2, Eye, EyeOff, Filter, Download, Printer } from 'lucide-react';

interface DashboardProps {
    projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  
  const [visibleWidgets, setVisibleWidgets] = useState({
      budget: true,
      spent: true,
      cashflow: true,
      activeProjects: true,
      chartCashflow: true,
      chartCost: true
  });

  // Ensure selectedProjectId is valid (reset to 'all' if project was deleted)
  useEffect(() => {
      if (selectedProjectId !== 'all' && !projects.find(p => p.id === selectedProjectId)) {
          setSelectedProjectId('all');
      }
  }, [projects, selectedProjectId]);

  // Filter Logic
  const filteredProjects = useMemo(() => {
      if (selectedProjectId === 'all') return projects;
      return projects.filter(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // KPI Calculations
  const totalBudget = filteredProjects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = filteredProjects.reduce((acc, curr) => acc + curr.actualCost, 0);
  
  // Calculate specific cashflow for charts based on selection
  const chartData = useMemo(() => {
      if (selectedProjectId === 'all') return MOCK_CASH_FLOW;
      
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) return [];

      return [
          { month: 'Inicio', income: 0, expenses: project.budget * 0.1, balance: -project.budget * 0.1 },
          { month: '25%', income: 0, expenses: project.actualCost * 0.4, balance: -project.actualCost * 0.4 },
          { month: '50%', income: 0, expenses: project.actualCost * 0.6, balance: -project.actualCost * 0.6 },
          { month: '75%', income: 0, expenses: project.actualCost * 0.8, balance: -project.actualCost * 0.8 },
          { month: 'Actual', income: 0, expenses: project.actualCost, balance: -project.actualCost },
          { month: 'Fin', income: project.budget * 1.3, expenses: project.budget, balance: project.budget * 0.3 },
      ];
  }, [selectedProjectId, projects]);

  const toggleWidget = (key: keyof typeof visibleWidgets) => {
      setVisibleWidgets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPercentageExecuted = () => {
      if (totalBudget === 0) return 0;
      return ((totalSpent / totalBudget) * 100).toFixed(1);
  };

  const handlePrint = () => {
      window.print();
  };

  const handleExportCSV = () => {
      const headers = ["ID", "Nombre", "Estado", "Ubicacion", "Presupuesto", "Coste Real", "Progreso"];
      const rows = filteredProjects.map(p => [
          p.id, p.name, p.status, p.location, p.budget, p.actualCost, p.progress
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {selectedProjectId === 'all' ? 'Panel de Control General' : projects.find(p => p.id === selectedProjectId)?.name || 'Detalle Promoción'}
            </h2>
            <p className="text-slate-500 text-sm">
                {selectedProjectId === 'all' ? 'Resumen de toda la cartera de promociones' : 'Métricas específicas de la promoción'}
            </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center no-print">
           {/* Project Filter */}
           <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white min-w-[200px]"
                >
                    <option value="all">Todas las Promociones</option>
                    <option disabled>──────────</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
           </div>

           <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition ${
                    showConfig ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
            >
                <Settings2 size={16} />
                <span className="hidden sm:inline">Vista</span>
            </button>
          
            <div className="flex gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden">
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 border-r border-slate-300 transition text-sm font-medium"
                    title="Descargar Excel"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">CSV</span>
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 transition text-sm font-medium"
                    title="Imprimir / Guardar como PDF"
                >
                    <Printer size={16} />
                    <span className="hidden sm:inline">PDF</span>
                </button>
            </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
          <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 absolute right-0 top-24 z-10 w-64 animate-in fade-in slide-in-from-top-2 no-print">
              <h4 className="font-bold text-slate-800 mb-3">Widgets Visibles</h4>
              <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Presupuesto</span>
                      <button onClick={() => toggleWidget('budget')}>
                          {visibleWidgets.budget ? <Eye size={16} className="text-emerald-600"/> : <EyeOff size={16} className="text-slate-400"/>}
                      </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Gasto Realizado</span>
                      <button onClick={() => toggleWidget('spent')}>
                          {visibleWidgets.spent ? <Eye size={16} className="text-emerald-600"/> : <EyeOff size={16} className="text-slate-400"/>}
                      </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Proyectos / Estado</span>
                      <button onClick={() => toggleWidget('activeProjects')}>
                          {visibleWidgets.activeProjects ? <Eye size={16} className="text-emerald-600"/> : <EyeOff size={16} className="text-slate-400"/>}
                      </button>
                  </label>
                  <div className="border-t my-2 border-slate-100"></div>
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Gráfico Flujo</span>
                      <button onClick={() => toggleWidget('chartCashflow')}>
                          {visibleWidgets.chartCashflow ? <Eye size={16} className="text-emerald-600"/> : <EyeOff size={16} className="text-slate-400"/>}
                      </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Gráfico Costes</span>
                      <button onClick={() => toggleWidget('chartCost')}>
                          {visibleWidgets.chartCost ? <Eye size={16} className="text-emerald-600"/> : <EyeOff size={16} className="text-slate-400"/>}
                      </button>
                  </label>
              </div>
          </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleWidgets.budget && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500">{selectedProjectId === 'all' ? 'Presupuesto Total' : 'Presupuesto Promoción'}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">€{(totalBudget / 1000000).toFixed(2)}M</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span>Objetivo Financiero</span>
            </div>
            </div>
        )}

        {visibleWidgets.spent && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500">Gasto Ejecutado</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">€{(totalSpent / 1000000).toFixed(2)}M</h3>
                </div>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Activity size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
                <span>{getPercentageExecuted()}% del presupuesto</span>
            </div>
            </div>
        )}

        {visibleWidgets.cashflow && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500">Saldo Pendiente</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">€{((totalBudget - totalSpent) / 1000000).toFixed(2)}M</h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
                <span>Por ejecutar</span>
            </div>
            </div>
        )}

        {visibleWidgets.activeProjects && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-slate-500">
                    {selectedProjectId === 'all' ? 'Promociones Activas' : 'Estado Actual'}
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedProjectId === 'all' 
                        ? filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE).length 
                        : filteredProjects[0]?.status || 'N/A'
                    }
                </h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Building2 size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500">
                <span>{selectedProjectId === 'all' ? 'En curso' : 'Fase actual'}</span>
            </div>
            </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleWidgets.chartCashflow && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
                {selectedProjectId === 'all' ? 'Flujo de Caja Global (Tesorería)' : 'Proyección Financiera'}
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${Math.abs(value)/1000}k`} />
                    <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: number) => `€${Math.abs(value).toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}

        {visibleWidgets.chartCost && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
                 {selectedProjectId === 'all' ? 'Evolución de Tesorería' : 'Balance Acumulado'}
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${Math.abs(value)/1000}k`} />
                    <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="balance" name="Balance Neto" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                </LineChart>
                </ResponsiveContainer>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
