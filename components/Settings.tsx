
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Globe, Building, Monitor, Download, X, HelpCircle } from 'lucide-react';

interface SettingsProps {
  deferredPrompt: any;
}

const Settings: React.FC<SettingsProps> = ({ deferredPrompt }) => {
  const [companyName, setCompanyName] = useState('Inmobiliaria Demo S.L.');
  const [currency, setCurrency] = useState('EUR');
  const [notifications, setNotifications] = useState(true);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } else {
      setIsInstructionModalOpen(true);
    }
  };

  const handleSave = () => {
    // This would typically persist to backend or local storage
    // Using a simple alert for settings save is fine, or could be upgraded to toast in App level
    // For now we keep it simple or remove if handled by parent, but user asked about Install button specifically.
    // Ideally this should trigger the App's notification system, but let's stick to fixing the requested issue.
    alert('Configuración guardada correctamente.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuración</h2>
          <p className="text-slate-500">Administra las preferencias generales de la aplicación.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-8">

          {/* Windows Installation */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Monitor size={20} className="text-purple-600" />
              Aplicación de Escritorio (Windows)
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                  <p className="font-medium text-slate-800">Instalar en tu PC</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Convierte esta web en un programa nativo. Aparecerá en tu escritorio y barra de tareas, y funcionará en una ventana independiente.
                  </p>
                  {!deferredPrompt && (
                     <p className="text-xs text-purple-600 mt-2">
                        Estado: Instalación manual requerida (o ya instalada).
                     </p>
                  )}
               </div>
               <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition shadow-sm whitespace-nowrap"
               >
                 <Download size={18} />
                 {deferredPrompt ? 'Instalar App' : 'Ver Instrucciones'}
               </button>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>
          
          {/* Company Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building size={20} className="text-emerald-600" />
              Datos de la Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIF / CIF</label>
                <input 
                  type="text" 
                  defaultValue="B12345678"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Regional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Globe size={20} className="text-blue-600" />
              Región y Moneda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Moneda Principal</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="MXN">Peso Mexicano ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Idioma</label>
                <select 
                  defaultValue="es"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell size={20} className="text-amber-600" />
              Notificaciones
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Alertas de Presupuesto</p>
                <p className="text-sm text-slate-500">Recibir avisos cuando un proyecto supere el 80% del presupuesto.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-md"
            >
              <Save size={20} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Manual Installation Instructions Modal */}
      {isInstructionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <HelpCircle className="text-purple-600" />
                        Instalar en Windows
                    </h3>
                    <button onClick={() => setIsInstructionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4 text-slate-600">
                    <p>Si el navegador no muestra la instalación automática, sigue estos pasos manuales:</p>
                    <ol className="list-decimal pl-5 space-y-3">
                        <li>
                            Haz clic en el menú de tu navegador (los tres puntos verticales <strong>⋮</strong> arriba a la derecha).
                        </li>
                        <li>
                            Busca la opción que dice: 
                            <ul className="list-disc pl-5 mt-1 text-sm text-slate-500">
                                <li>En Chrome: <strong>"Instalar PromotorAI..."</strong></li>
                                <li>En Edge: <strong>"Aplicaciones" &gt; "Instalar este sitio como una aplicación"</strong></li>
                            </ul>
                        </li>
                        <li>
                            Haz clic en <strong>Instalar</strong> en la ventana emergente.
                        </li>
                    </ol>
                    <div className="bg-slate-50 p-4 rounded-lg text-sm mt-4 border border-slate-200 text-slate-700">
                        <p><strong>💡 Consejo:</strong> Una vez instalada, la aplicación aparecerá en tu escritorio y menú de inicio como un programa nativo.</p>
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={() => setIsInstructionModalOpen(false)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
