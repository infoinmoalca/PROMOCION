
import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, name?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New field for registration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulación de autenticación asíncrona
    setTimeout(() => {
      // Basic validation
      if (!email || !password || password.length < 4) {
         setError('Por favor, introduce un correo válido y una contraseña de al menos 4 caracteres.');
         setLoading(false);
         return;
      }

      if (isRegistering && !name) {
          setError('Por favor, introduce el nombre de tu empresa o usuario.');
          setLoading(false);
          return;
      }

      // Success
      onLogin(email, isRegistering ? name : undefined);
    }, 1500);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Hero / Image */}
        <div className="w-full md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">PromotorAI</h1>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              {isRegistering ? 'Únete a la revolución inmobiliaria.' : 'Control total de tu negocio promotor.'}
            </h2>
            <p className="text-slate-400 text-lg">
              Gestiona obras, estudios de viabilidad, documentación y tesorería en una sola plataforma inteligente.
            </p>
          </div>

          <div className="space-y-4 relative z-10 mt-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-slate-300">Análisis de Viabilidad con IA</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-slate-300">Escáner de Facturas y Planos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-slate-300">Control de Cash Flow en tiempo real</span>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-500">
            © {new Date().getFullYear()} PromotorAI System. Todos los derechos reservados.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {isRegistering ? 'Crear Cuenta Nueva' : 'Bienvenido de nuevo'}
            </h3>
            <p className="text-slate-500 mb-8">
                {isRegistering 
                    ? 'Completa tus datos para comenzar a gestionar tus promociones.' 
                    : 'Introduce tus credenciales para acceder al panel.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {isRegistering && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre Empresa / Usuario</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        required={isRegistering}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                        placeholder="Ej: Inmobiliaria Futuro S.L."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {!isRegistering && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" defaultChecked />
                      <span className="ml-2 text-slate-600">Recordarme</span>
                    </label>
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                      ¿Olvidaste la contraseña?
                    </a>
                  </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
                  </>
                ) : (
                  <>
                    {isRegistering ? 'Registrarme' : 'Iniciar Sesión'} <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                {isRegistering ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'} {' '}
                <button 
                    onClick={toggleMode}
                    className="text-emerald-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                    {isRegistering ? 'Inicia Sesión' : 'Registrarme Gratis'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
