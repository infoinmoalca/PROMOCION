import React, { useState } from 'react';
import { Stakeholder, Project } from '../types';
import { User, Users, Plus, Search, MapPin, Mail, Phone, FileText, Briefcase, X, HardHat, Edit, Trash2, AlertCircle, FileSpreadsheet, Printer, TrendingUp, Building2 } from 'lucide-react';

interface StakeholderManagerProps {
    stakeholders: Stakeholder[];
    projects: Project[];
    onAddStakeholder: (s: Stakeholder) => void;
    onUpdateStakeholder: (s: Stakeholder) => void;
    onDeleteStakeholder: (id: string) => void;
}

const StakeholderManager: React.FC<StakeholderManagerProps> = ({ stakeholders, projects, onAddStakeholder, onUpdateStakeholder, onDeleteStakeholder }) => {
    const [filterType, setFilterType] = useState<'All' | 'Client' | 'Provider'>('All');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [stakeholderToDelete, setStakeholderToDelete] = useState<string | null>(null);
    
    const [stakeholderForm, setStakeholderForm] = useState<Partial<Stakeholder>>({
        id: '',
        name: '',
        type: 'Client',
        activity: '',
        email: '',
        phone: '',
        address: '',
        taxId: ''
    });

    const filtered = stakeholders.filter(s => {
        const matchesType = filterType === 'All' || s.type === filterType;
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getProviderStats = (providerId: string) => {
        let totalBudgeted = 0;
        let associatedProjects = new Set();

        projects.forEach(project => {
            // Check direct linkage
            if (project.stakeholderIds?.includes(providerId)) {
                associatedProjects.add(project.id);
            }
            // Check budget linkage
            if (project.budgets) {
                project.budgets.forEach(budget => {
                    if (budget.providerId === providerId) {
                        totalBudgeted += budget.amount;
                        associatedProjects.add(project.id);
                    }
                });
            }
        });

        return {
            totalBudgeted,
            projectCount: associatedProjects.size
        };
    };

    const handleOpenCreate = () => {
        setStakeholderForm({ name: '', type: 'Client', activity: '', email: '', phone: '', address: '', taxId: '' });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (s: Stakeholder) => {
        setStakeholderForm({ ...s });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (stakeholderForm.name) {
            if (isEditMode && stakeholderForm.id) {
                // Update existing
                onUpdateStakeholder(stakeholderForm as Stakeholder);
            } else {
                // Create new
                onAddStakeholder({
                    id: Math.random().toString(36).substr(2, 9),
                    name: stakeholderForm.name || '',
                    type: stakeholderForm.type as 'Client' | 'Provider',
                    activity: stakeholderForm.activity || '',
                    email: stakeholderForm.email || '',
                    phone: stakeholderForm.phone || '',
                    address: stakeholderForm.address || '',
                    taxId: stakeholderForm.taxId || '',
                    notes: stakeholderForm.notes
                });
            }
            setIsModalOpen(false);
        }
    };

    const confirmDelete = () => {
        if (stakeholderToDelete) {
            onDeleteStakeholder(stakeholderToDelete);
            setStakeholderToDelete(null);
        }
    };

    const exportCSV = () => {
        const headers = ["Nombre", "Tipo", "Actividad", "Email", "Telefono", "Direccion", "NIF", "Volumen Negocio"];
        const rows = filtered.map(s => {
            const stats = getProviderStats(s.id);
            return [
                `"${s.name}"`, s.type, `"${s.activity || ''}"`, s.email, s.phone, `"${s.address}"`, s.taxId, stats.totalBudgeted
            ];
        });
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `contactos_${filterType.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Clientes y Proveedores</h2>
                    <p className="text-slate-500">Base de datos unificada de contactos y empresas.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={exportCSV}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                    >
                        <FileSpreadsheet size={16} /> Exportar
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                    >
                        <Printer size={16} /> PDF
                    </button>
                    <button 
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
                    >
                        <Plus size={16} />
                        Nuevo Contacto
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center no-print">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, email..." 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {(['All', 'Client', 'Provider'] as const).map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex-1 md:flex-none ${
                                filterType === type 
                                    ? 'bg-slate-800 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {type === 'All' ? 'Todos' : type === 'Client' ? 'Clientes' : 'Proveedores'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print-container">
                {filtered.map(stakeholder => {
                    const stats = getProviderStats(stakeholder.id);
                    
                    return (
                        <div key={stakeholder.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition group relative break-inside-avoid">
                            {/* Edit Actions Overlay - Always Visible - Hidden on Print */}
                            <div className="absolute top-4 right-4 flex gap-2 no-print">
                                <button 
                                    onClick={() => handleOpenEdit(stakeholder)}
                                    className="p-2 bg-white text-slate-600 hover:text-blue-600 rounded-full shadow border border-slate-100 transition-colors"
                                    title="Editar"
                                >
                                    <Edit size={14} />
                                </button>
                                <button 
                                    onClick={() => setStakeholderToDelete(stakeholder.id)}
                                    className="p-2 bg-white text-slate-600 hover:text-red-600 rounded-full shadow border border-slate-100 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${stakeholder.type === 'Client' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {stakeholder.type === 'Client' ? <User size={24} /> : <Briefcase size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{stakeholder.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${stakeholder.type === 'Client' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {stakeholder.type === 'Client' ? 'Cliente' : 'Proveedor'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3 text-sm text-slate-600">
                                {stakeholder.activity && (
                                    <div className="flex items-center gap-2">
                                        <HardHat size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-800">{stakeholder.activity}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-slate-400" />
                                    <span>{stakeholder.taxId}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-slate-400" />
                                    <span>{stakeholder.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{stakeholder.phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                                    <span>{stakeholder.address}</span>
                                </div>
                            </div>
                            
                            {/* Provider Summary Stats */}
                            {stakeholder.type === 'Provider' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/50 rounded-lg p-2">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><Building2 size={12}/> Proyectos</p>
                                        <p className="font-bold text-slate-800">{stats.projectCount}</p>
                                    </div>
                                    <div className="text-center border-l border-slate-200">
                                        <p className="text-xs text-slate-500 flex items-center justify-center gap-1"><TrendingUp size={12}/> Vol. Presup.</p>
                                        <p className="font-bold text-emerald-600">€{(stats.totalBudgeted / 1000).toFixed(1)}k</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 no-print">
                                <button className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
                                    Ver Historial
                                </button>
                                <button className="flex-1 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition">
                                    Contactar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Entidad</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="type" 
                                            checked={stakeholderForm.type === 'Client'} 
                                            onChange={() => setStakeholderForm({...stakeholderForm, type: 'Client'})}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Cliente</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="type" 
                                            checked={stakeholderForm.type === 'Provider'} 
                                            onChange={() => setStakeholderForm({...stakeholderForm, type: 'Provider'})}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Proveedor</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={stakeholderForm.name}
                                    onChange={e => setStakeholderForm({...stakeholderForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Actividad</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Construcción, Fontanería, Inversor..."
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={stakeholderForm.activity}
                                    onChange={e => setStakeholderForm({...stakeholderForm, activity: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">NIF / CIF</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={stakeholderForm.taxId}
                                    onChange={e => setStakeholderForm({...stakeholderForm, taxId: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        value={stakeholderForm.email}
                                        onChange={e => setStakeholderForm({...stakeholderForm, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        value={stakeholderForm.phone}
                                        onChange={e => setStakeholderForm({...stakeholderForm, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={stakeholderForm.address}
                                    onChange={e => setStakeholderForm({...stakeholderForm, address: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg"
                            >
                                {isEditMode ? 'Guardar Cambios' : 'Crear Contacto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {stakeholderToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={32} />
                            <h3 className="text-lg font-bold">Eliminar Contacto</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            ¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStakeholderToDelete(null)}
                                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StakeholderManager;