
import React from 'react';
import { LayoutDashboard, Building2, Calculator, FileText, Settings, PieChart, Users, Save } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onSave: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onSave }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Promociones', icon: Building2 },
    { id: 'stakeholders', label: 'Contactos', icon: Users },
    { id: 'feasibility', label: 'Viabilidad (IA)', icon: Calculator },
    { id: 'documents', label: 'Documentos', icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 no-print">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PieChart className="text-emerald-400" />
          PromotorAI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Gestión Inteligente</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={onSave}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
        >
          <Save size={20} />
          <span>Guardar Datos</span>
        </button>

        <button 
          onClick={() => onViewChange('settings')}
          className={`flex items-center gap-3 px-4 py-2 w-full rounded-lg transition-colors ${
            currentView === 'settings' 
              ? 'bg-slate-800 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings size={20} />
          <span>Configuración</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
