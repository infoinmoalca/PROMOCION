
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, Stakeholder, Document, ProjectAction, Budget, Alert } from '../types';
import { 
    MapPin, Calendar, CircleDollarSign, BarChart3, Plus, X, 
    ArrowLeft, Briefcase, Trash2, Edit, FileCheck, AlertTriangle, FileText, Upload, Eye, Download,
    Mail, Phone, FileSpreadsheet, CheckCircle, Clock, XCircle, AlertCircle, Filter, TrendingUp, TrendingDown,
    Scale, CheckSquare, Square, Printer, Bell, CalendarClock, Table2, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface ProjectManagerProps {
    projects: Project[];
    stakeholders: Stakeholder[];
    documents: Document[];
    onAddProject: (p: Project) => void;
    onUpdateProject: (p: Project) => void;
    onDeleteProject: (id: string) => void;
    onAddDocument: (d: Document) => void;
    onDeleteDocument: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
    projects, stakeholders, documents, onAddProject, onUpdateProject, onDeleteProject, onAddDocument, onDeleteDocument
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'team' | 'timeline' | 'documents' | 'budgets'>('overview');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Action State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  
  // Budget State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetProviderFilter, setBudgetProviderFilter] = useState('all');
  
  // Alert State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState<Partial<Alert>>({
      title: '', date: new Date().toISOString().split('T')[0], type: 'Other', isCompleted: false
  });
  
  // Budget Comparison State
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Delete States (Confirmation Modals)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [actionToDeleteId, setActionToDeleteId] = useState<string | null>(null);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState<string | null>(null);

  // Form State
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
      name: '', location: '', budget: 0, actualCost: 0, progress: 0,
      status: ProjectStatus.PLANNING, startDate: '', endDate: ''
  });

  // Action Form State
  const [actionForm, setActionForm] = useState<Partial<ProjectAction>>({
      title: '', description: '', type: 'Construction', date: new Date().toISOString().split('T')[0], amount: 0
  });
  const [actionFile, setActionFile] = useState<File | null>(null);

  // Budget Form State
  const [budgetForm, setBudgetForm] = useState<Partial<Budget>>({
      id: '', concept: '', amount: 0, actualAmount: 0, date: new Date().toISOString().split('T')[0], status: 'Pending', providerId: ''
  });
  const [budgetFile, setBudgetFile] = useState<File | null>(null);

  // Team Management State
  const [selectedProviderId, setSelectedProviderId] = useState('');

  // Sync selectedProject with projects prop to ensure data consistency
  useEffect(() => {
    if (selectedProject) {
        const updated = projects.find(p => p.id === selectedProject.id);
        if (updated) {
            setSelectedProject(updated);
        }
    }
  }, [projects]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE: return 'bg-blue-100 text-blue-700';
      case ProjectStatus.PLANNING: return 'bg-yellow-100 text-yellow-700';
      case ProjectStatus.SALES: return 'bg-emerald-100 text-emerald-700';
      case ProjectStatus.COMPLETED: return 'bg-slate-100 text-slate-700';
    }
  };

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setProjectForm({
        name: '', location: '', budget: 0, actualCost: 0, progress: 0,
        status: ProjectStatus.PLANNING, startDate: new Date().toISOString().split('T')[0], endDate: ''
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
      setProjectForm({ ...project });
      setIsEditMode(true);
      setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
      e.preventDefault();
      if (projectForm.name && projectForm.budget) {
          if (isEditMode && projectForm.id) {
              // UPDATE
              const updated = { ...projectForm } as Project;
              onUpdateProject(updated);
              // Local state update is handled by useEffect
          } else {
            // CREATE
            const project: Project = {
                id: Math.random().toString(36).substr(2, 9),
                name: projectForm.name || 'Nuevo Proyecto',
                location: projectForm.location || '',
                budget: projectForm.budget || 0,
                actualCost: 0,
                progress: 0,
                status: projectForm.status as ProjectStatus,
                startDate: projectForm.startDate || '',
                endDate: projectForm.endDate || '',
                stakeholderIds: [],
                actions: [],
                budgets: [],
                alerts: []
            };
            onAddProject(project);
          }
          setIsModalOpen(false);
      }
  };

  const handleConfirmDelete = () => {
      if (projectToDelete) {
          onDeleteProject(projectToDelete);
          if (selectedProject && selectedProject.id === projectToDelete) {
              setSelectedProject(null);
          }
          setProjectToDelete(null);
      }
  };

  const handleAddProvider = () => {
      if (!selectedProject || !selectedProviderId) return;
      
      const currentIds = selectedProject.stakeholderIds || [];
      if (!currentIds.includes(selectedProviderId)) {
          const updated = {
              ...selectedProject,
              stakeholderIds: [...currentIds, selectedProviderId]
          };
          onUpdateProject(updated);
      }
      setSelectedProviderId('');
  };

  const handleRemoveProvider = (providerId: string) => {
      if (!selectedProject) return;
      const updated = {
          ...selectedProject,
          stakeholderIds: (selectedProject.stakeholderIds || []).filter(id => id !== providerId)
      };
      onUpdateProject(updated);
  };

  const handleSaveAction = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedProject || !actionForm.title) return;

      // 1. If file exists, create Document first
      let fileDoc: Document | null = null;
      if (actionFile) {
          fileDoc = {
              id: Math.random().toString(36).substr(2, 9),
              name: actionFile.name,
              type: actionForm.type === 'Payment' ? 'Invoice' : 'Other',
              date: actionForm.date || new Date().toISOString().split('T')[0],
              amount: actionForm.amount,
              status: 'Processed', // Assume direct upload is processed
              linkedEntityId: selectedProject.id,
              linkedEntityType: 'Project',
              url: URL.createObjectURL(actionFile) // Create local URL for preview
          };
          onAddDocument(fileDoc);
      }

      const finalDescription = actionForm.description + (fileDoc ? ` (Documento adjunto: ${fileDoc.name})` : '') || '';
      let updatedActions = [...(selectedProject.actions || [])];
      let newActualCost = selectedProject.actualCost;

      if (isEditingAction && editingActionId) {
          // UPDATE EXISTING ACTION
          const oldAction = updatedActions.find(a => a.id === editingActionId);
          
          if (oldAction && oldAction.type === 'Payment' && oldAction.amount) {
              newActualCost -= oldAction.amount;
          }

          const updatedAction: ProjectAction = {
              id: editingActionId,
              date: actionForm.date || '',
              title: actionForm.title || '',
              description: finalDescription,
              type: actionForm.type as any,
              amount: actionForm.amount
          };

          if (updatedAction.type === 'Payment' && updatedAction.amount) {
              newActualCost += updatedAction.amount;
          }

          updatedActions = updatedActions.map(a => a.id === editingActionId ? updatedAction : a);

      } else {
          // CREATE NEW ACTION
          const newAction: ProjectAction = {
              id: Math.random().toString(36).substr(2, 9),
              date: actionForm.date || new Date().toISOString().split('T')[0],
              title: actionForm.title || 'Actuación',
              description: finalDescription,
              type: actionForm.type as any,
              amount: actionForm.amount
          };

          updatedActions = [newAction, ...updatedActions];
          
          if (newAction.type === 'Payment' && newAction.amount) {
              newActualCost += newAction.amount;
          }
      }

      const updatedProject = {
          ...selectedProject,
          actions: updatedActions,
          actualCost: newActualCost
      };

      onUpdateProject(updatedProject);
      
      setIsActionModalOpen(false);
      setIsEditingAction(false);
      setEditingActionId(null);
      setActionForm({ title: '', description: '', type: 'Construction', date: new Date().toISOString().split('T')[0], amount: 0 });
      setActionFile(null);
  };

  const handleEditAction = (action: ProjectAction) => {
      setActionForm({
          title: action.title,
          description: action.description,
          type: action.type,
          date: action.date,
          amount: action.amount
      });
      setEditingActionId(action.id);
      setIsEditingAction(true);
      setIsActionModalOpen(true);
  };

  // Trigger Modal
  const requestDeleteAction = (actionId: string) => {
      setActionToDeleteId(actionId);
  };

  // Perform Delete
  const confirmDeleteAction = () => {
      if (!selectedProject || !actionToDeleteId) return;

      const actionToDelete = selectedProject.actions?.find(a => a.id === actionToDeleteId);
      let newActualCost = selectedProject.actualCost;

      if (actionToDelete && actionToDelete.type === 'Payment' && actionToDelete.amount) {
          newActualCost -= actionToDelete.amount;
      }

      const updatedProject = {
          ...selectedProject,
          actions: selectedProject.actions?.filter(a => a.id !== actionToDeleteId) || [],
          actualCost: newActualCost
      };

      onUpdateProject(updatedProject);
      setActionToDeleteId(null);
  };

  const handleDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && selectedProject) {
          const file = e.target.files[0];
          const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: 'Other',
            date: new Date().toISOString().split('T')[0],
            status: 'Processed',
            linkedEntityId: selectedProject.id,
            linkedEntityType: 'Project',
            url: URL.createObjectURL(file) // Create local URL for preview
        };
        onAddDocument(newDoc);
      }
  };

  // --- ALERT HANDLERS ---
  const handleSaveAlert = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject) return;

      const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          title: alertForm.title || '',
          date: alertForm.date || '',
          type: alertForm.type as any,
          isCompleted: false
      };

      const updatedProject = {
          ...selectedProject,
          alerts: [...(selectedProject.alerts || []), newAlert]
      };
      
      onUpdateProject(updatedProject);
      setIsAlertModalOpen(false);
      setAlertForm({ title: '', date: new Date().toISOString().split('T')[0], type: 'Other', isCompleted: false });
  };

  const handleDeleteAlert = (alertId: string) => {
      if (!selectedProject) return;
      const updatedProject = {
          ...selectedProject,
          alerts: (selectedProject.alerts || []).filter(a => a.id !== alertId)
      };
      onUpdateProject(updatedProject);
  };

  const toggleAlertStatus = (alertId: string) => {
      if (!selectedProject) return;
      const updatedProject = {
          ...selectedProject,
          alerts: (selectedProject.alerts || []).map(a => 
              a.id === alertId ? { ...a, isCompleted: !a.isCompleted } : a
          )
      };
      onUpdateProject(updatedProject);
  };

  // --- EXPORT FUNCTIONS ---

  const exportProjectsCSV = () => {
      const headers = ["ID", "Nombre", "Estado", "Ubicación", "Presupuesto", "Coste Actual", "Progreso", "Inicio", "Fin"];
      const rows = projects.map(p => [
          p.id, `"${p.name}"`, p.status, `"${p.location}"`, p.budget, p.actualCost, `${p.progress}%`, p.startDate, p.endDate
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      downloadCSV(csvContent, `proyectos_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportBudgetsCSV = () => {
      if (!selectedProject) return;
      const headers = ["ID", "Concepto", "Proveedor", "Fecha", "Estado", "Estimado", "Real", "Desviacion"];
      const rows = (selectedProject.budgets || []).map(b => {
          const provider = stakeholders.find(s => s.id === b.providerId)?.name || 'N/A';
          return [
              b.id, `"${b.concept}"`, `"${provider}"`, b.date, b.status, b.amount, b.actualAmount || 0, (b.amount - (b.actualAmount || 0))
          ];
      });
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      downloadCSV(csvContent, `presupuestos_${selectedProject.name.replace(/\s+/g, '_')}.csv`);
  };

  const exportFinancialsCSV = () => {
       if (!selectedProject) return;
       const headers = ["Tipo", "Fecha", "Titulo", "Descripcion", "Importe"];
       const rows = (selectedProject.actions || [])
           .filter(a => a.type === 'Payment')
           .map(a => ["Pago", a.date, `"${a.title}"`, `"${a.description}"`, `-${a.amount}`]);
       
       const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
       downloadCSV(csvContent, `economico_${selectedProject.name.replace(/\s+/g, '_')}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handlePrint = () => {
      window.print();
  };

  // --- BUDGET HANDLERS ---
  const handleOpenBudgetModal = (budget?: Budget) => {
      if (budget) {
          setBudgetForm({ ...budget });
          setIsEditingBudget(true);
      } else {
          setBudgetForm({ concept: '', amount: 0, actualAmount: 0, date: new Date().toISOString().split('T')[0], status: 'Pending', providerId: '' });
          setIsEditingBudget(false);
      }
      setBudgetFile(null);
      setIsBudgetModalOpen(true);
  };

  // Trigger Budget Delete
  const requestDeleteBudget = (budgetId: string) => {
      setBudgetToDeleteId(budgetId);
  };

  // Perform Budget Delete
  const confirmDeleteBudget = () => {
      if (!selectedProject || !budgetToDeleteId) return;
      
      const updated = {
          ...selectedProject,
          budgets: (selectedProject.budgets || []).filter(b => b.id !== budgetToDeleteId)
      };
      onUpdateProject(updated);
      setBudgetToDeleteId(null);
  };

  const handleDeleteSelectedBudgets = () => {
      if (!selectedProject || selectedBudgetIds.length === 0) return;
      if (window.confirm(`¿Estás seguro de eliminar ${selectedBudgetIds.length} partidas presupuestarias?`)) {
          const updatedBudgets = (selectedProject.budgets || []).filter(b => !selectedBudgetIds.includes(b.id));
          const updatedProject = {
              ...selectedProject,
              budgets: updatedBudgets
          };
          onUpdateProject(updatedProject);
          setSelectedBudgetIds([]);
      }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProject || !budgetForm.concept) return;

      // 1. Handle File Upload if present
      let fileDoc: Document | null = null;
      if (budgetFile) {
          fileDoc = {
              id: Math.random().toString(36).substr(2, 9),
              name: budgetFile.name,
              type: 'Budget',
              date: budgetForm.date || new Date().toISOString().split('T')[0],
              amount: budgetForm.amount,
              status: 'Processed',
              linkedEntityId: selectedProject.id,
              linkedEntityType: 'Project',
              url: URL.createObjectURL(budgetFile)
          };
          onAddDocument(fileDoc);
      }

      // 2. Construct Budget Object
      const newBudget: Budget = {
          id: isEditingBudget && budgetForm.id ? budgetForm.id : Math.random().toString(36).substr(2, 9),
          concept: budgetForm.concept || '',
          amount: budgetForm.amount || 0,
          actualAmount: budgetForm.actualAmount || 0,
          date: budgetForm.date || '',
          status: budgetForm.status as any,
          providerId: budgetForm.providerId,
          documentId: fileDoc ? fileDoc.id : budgetForm.documentId
      };

      // 3. Update Project
      let updatedBudgets = selectedProject.budgets || [];
      if (isEditingBudget) {
          updatedBudgets = updatedBudgets.map(b => b.id === newBudget.id ? newBudget : b);
      } else {
          updatedBudgets = [...updatedBudgets, newBudget];
      }

      const updatedProject = {
          ...selectedProject,
          budgets: updatedBudgets
      };

      onUpdateProject(updatedProject);
      setIsBudgetModalOpen(false);
  };

  const handleToggleBudgetSelection = (id: string) => {
      setSelectedBudgetIds(prev => 
          prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
      );
  };

  // --- RENDER ---

  const renderComparisonModal = () => {
    if (!isComparisonModalOpen || !selectedProject) return null;

    const budgetsToCompare = (selectedProject.budgets || []).filter(b => selectedBudgetIds.includes(b.id));
    if (budgetsToCompare.length === 0) return null;

    const minAmount = Math.min(...budgetsToCompare.map(b => b.amount));

    const chartData = budgetsToCompare.map((b, idx) => ({
        name: `Opción ${idx + 1}`,
        providerName: stakeholders.find(s => s.id === b.providerId)?.name || 'N/A',
        amount: b.amount,
        isCheapest: b.amount === minAmount
    }));

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Scale className="text-emerald-600" size={24} />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Comparativa de Presupuestos</h3>
                            <p className="text-sm text-slate-500">Analizando {budgetsToCompare.length} propuestas seleccionadas</p>
                        </div>
                    </div>
                    <button onClick={() => setIsComparisonModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-x-auto flex-1">
                    <div className="h-64 w-full mb-8 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Gráfico de Precios</h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
                                <YAxis tickFormatter={(val) => `€${val/1000}k`} fontSize={12} stroke="#64748b" />
                                <Tooltip 
                                    formatter={(value: number) => `€${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]} name="Importe">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.isCheapest ? '#10b981' : '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="p-4 text-slate-500 font-medium min-w-[200px]">Detalle</th>
                                {budgetsToCompare.map((budget, idx) => {
                                    const provider = stakeholders.find(s => s.id === budget.providerId);
                                    const isCheapest = budget.amount === minAmount;
                                    return (
                                        <th key={budget.id} className={`p-4 min-w-[250px] ${isCheapest ? 'bg-emerald-50/50' : ''}`}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-slate-800 text-lg">Opción {idx + 1}</span>
                                                <span className="text-sm text-slate-500">{provider ? provider.name : 'Proveedor Desconocido'}</span>
                                                {isCheapest && <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full w-fit">Mejor Precio</span>}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50">
                                <td className="p-4 font-medium text-slate-700 bg-slate-50/50">Concepto</td>
                                {budgetsToCompare.map(b => (
                                    <td key={b.id} className="p-4 text-slate-800">{b.concept}</td>
                                ))}
                            </tr>
                            <tr className="bg-slate-50/30">
                                <td className="p-4 font-bold text-slate-800 bg-slate-100/50">Importe Estimado</td>
                                {budgetsToCompare.map(b => {
                                    const isCheapest = b.amount === minAmount;
                                    return (
                                        <td key={b.id} className={`p-4 font-bold text-xl ${isCheapest ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-800'}`}>
                                            €{b.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    );
                                })}
                            </tr>
                             <tr>
                                <td className="p-4 font-medium text-slate-500 bg-slate-50/50">Diferencia</td>
                                {budgetsToCompare.map(b => {
                                    const diff = b.amount - minAmount;
                                    return (
                                        <td key={b.id} className="p-4 text-sm font-medium">
                                            {diff === 0 ? (
                                                <span className="text-emerald-600">-- Mejor Opción --</span>
                                            ) : (
                                                <span className="text-red-500">+€{diff.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+{((diff/minAmount)*100).toFixed(1)}%)</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
  };

  const renderProjectModal = () => (
    isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSaveProject} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Presupuesto (€)</label>
                            <input required type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.budget || ''} onChange={e => setProjectForm({...projectForm, budget: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                            <select className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value as ProjectStatus})}>
                                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Inicio</label>
                            <input type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.startDate} onChange={e => setProjectForm({...projectForm, startDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
                            <input type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={projectForm.endDate} onChange={e => setProjectForm({...projectForm, endDate: e.target.value})} />
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                        {isEditMode ? 'Guardar Cambios' : 'Crear Promoción'}
                    </button>
                </form>
            </div>
        </div>
    )
  );

  if (!selectedProject) {
      return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                <h2 className="text-2xl font-bold text-slate-800">Cartera de Promociones</h2>
                <p className="text-slate-500">Gestión técnica y económica de tus activos inmobiliarios.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportProjectsCSV} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                        <FileSpreadsheet size={16} /> Exportar
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                        <Printer size={16} /> PDF
                    </button>
                    <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">
                        <Plus size={16} /> Nueva Promoción
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 print-container">
                {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group relative">
                    <div className="p-6">
                        <div className="absolute top-4 right-4 flex gap-2 z-10 no-print">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(project); }} className="p-2 bg-white text-slate-600 hover:text-blue-600 rounded-full shadow border border-slate-100 cursor-pointer transition-colors" title="Editar">
                                <Edit size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id); }} className="p-2 bg-white text-slate-600 hover:text-red-600 rounded-full shadow border border-slate-100 cursor-pointer transition-colors" title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => setSelectedProject(project)}>
                            <div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 hover:text-emerald-700 transition">{project.name}</h3>
                                <div className="flex items-center text-slate-500 mt-1 text-sm">
                                    <MapPin size={16} className="mr-1" />
                                    {project.location}
                                </div>
                            </div>
                            <div className="text-right mt-8">
                                <p className="text-sm text-slate-500">Fin Previsto</p>
                                <div className="flex items-center justify-end font-medium text-slate-700">
                                    <Calendar size={16} className="mr-1" />
                                    {new Date(project.endDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Económico (Devengo)</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-slate-900">€{(project.actualCost / 1000).toFixed(0)}k</span>
                                    <span className="text-sm text-slate-400">/ €{(project.budget / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((project.actualCost / project.budget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Progreso Técnico</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-slate-900">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 no-print">
                                <button onClick={() => { setSelectedProject(project); setActiveTab('financials'); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition">
                                    <CircleDollarSign size={16} /> Tesorería
                                </button>
                                <button onClick={() => setSelectedProject(project)} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition">
                                    <BarChart3 size={16} /> Entrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            
            {renderProjectModal()}

            {projectToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={32} />
                            <h3 className="text-lg font-bold">Eliminar Promoción</h3>
                        </div>
                        <p className="text-slate-600 mb-6">¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setProjectToDelete(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancelar</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  const linkedStakeholders = stakeholders.filter(s => (selectedProject.stakeholderIds || []).includes(s.id));
  const availableStakeholders = stakeholders.filter(s => !(selectedProject.stakeholderIds || []).includes(s.id) && s.type === 'Provider');
  const projectDocuments = documents.filter(d => d.linkedEntityId === selectedProject.id && d.linkedEntityType === 'Project');

  const filteredBudgets = (selectedProject.budgets || []).filter(b => budgetProviderFilter === 'all' || b.providerId === budgetProviderFilter);
  const totalEstimated = filteredBudgets.reduce((acc, b) => acc + b.amount, 0);
  const totalReal = filteredBudgets.reduce((acc, b) => acc + (b.actualAmount || 0), 0);
  const deviation = totalEstimated - totalReal;
  const deviationColor = deviation >= 0 ? 'text-emerald-600' : 'text-red-600';

  return (
      <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2 no-print">
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                  <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                  <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-800">{selectedProject.name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>{selectedProject.status}</span>
                  </div>
                  <p className="text-slate-500 text-sm flex items-center gap-1"><MapPin size={14}/> {selectedProject.location}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(selectedProject)} className="flex items-center gap-2 border border-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                      <Edit size={16} /> Editar
                  </button>
                  <button onClick={() => setProjectToDelete(selectedProject.id)} className="flex items-center gap-2 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                      <Trash2 size={16} /> Eliminar
                  </button>
              </div>
          </div>

          <div className="border-b border-slate-200 overflow-x-auto no-print">
              <nav className="flex space-x-6 min-w-max">
                  {['overview', 'financials', 'team', 'budgets', 'timeline', 'documents'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                            activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                          {tab === 'overview' ? 'Resumen' : 
                           tab === 'financials' ? 'Económico (Tesorería)' :
                           tab === 'team' ? 'Equipo' : 
                           tab === 'budgets' ? 'Presupuesto Detallado' :
                           tab === 'documents' ? 'Documentos' : 'Actuaciones'}
                      </button>
                  ))}
              </nav>
          </div>

          <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print-container">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4">Datos Generales</h3>
                          <div className="space-y-4">
                              <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="text-slate-500">Presupuesto Inicial</span>
                                  <span className="font-medium">€{(selectedProject.budget).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="text-slate-500">Fecha Inicio</span>
                                  <span className="font-medium">{selectedProject.startDate}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-50 pb-2">
                                  <span className="text-slate-500">Fecha Fin Estimada</span>
                                  <span className="font-medium">{selectedProject.endDate}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-slate-500">Progreso Físico</span>
                                  <span className="font-medium text-emerald-600">{selectedProject.progress}%</span>
                              </div>
                          </div>
                      </div>

                      {/* TEAM WIDGET */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  <Users size={20} className="text-blue-500" />
                                  Equipo
                              </h3>
                              <button 
                                onClick={() => setActiveTab('team')}
                                className="text-sm text-emerald-600 font-medium hover:underline"
                              >
                                  Gestionar
                              </button>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-3 max-h-64 pr-2">
                              {linkedStakeholders.length > 0 ? (
                                  linkedStakeholders.map(s => (
                                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${s.type === 'Provider' ? 'bg-orange-400' : 'bg-blue-400'}`}>
                                                  {s.name.substring(0, 2).toUpperCase()}
                                              </div>
                                              <div className="min-w-0">
                                                  <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                                                  <p className="text-xs text-slate-500 truncate">{s.activity || (s.type === 'Provider' ? 'Proveedor' : 'Cliente')}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                                      <Users size={32} className="mb-2 opacity-20" />
                                      <p className="text-sm">Sin equipo asignado</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      {/* Alerts Widget */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  <Bell size={20} className="text-amber-500" />
                                  Alertas y Vencimientos
                              </h3>
                              <button 
                                onClick={() => setIsAlertModalOpen(true)}
                                className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-200 transition"
                              >
                                  + Crear Alerta
                              </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-3 max-h-64">
                                {selectedProject.alerts && selectedProject.alerts.length > 0 ? (
                                    selectedProject.alerts.map(alert => (
                                        <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleAlertStatus(alert.id)} className={alert.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}>
                                                    {alert.isCompleted ? <CheckCircle size={20} /> : <Square size={20} />}
                                                </button>
                                                <div>
                                                    <p className={`font-medium ${alert.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{alert.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                            alert.type === 'License' ? 'bg-purple-100 text-purple-600' : 
                                                            alert.type === 'Deadline' ? 'bg-red-100 text-red-600' : 
                                                            alert.type === 'Meeting' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {alert.type}
                                                        </span>
                                                        <span className="flex items-center gap-1"><CalendarClock size={12}/> {alert.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteAlert(alert.id)} className="text-slate-300 hover:text-red-500 p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <CalendarClock size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No hay alertas configuradas.</p>
                                    </div>
                                )}
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-3">
                          <h3 className="font-bold text-slate-800 mb-4">Estado Financiero Rápido</h3>
                          <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Presupuesto', value: selectedProject.budget, fill: '#cbd5e1' },
                                        { name: 'Coste Real', value: selectedProject.actualCost, fill: '#3b82f6' }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" hide />
                                        <YAxis tickFormatter={(val) => `€${val/1000}k`} />
                                        <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'financials' && (
                   <div className="space-y-6 print-container">
                       <div className="flex justify-between items-center no-print">
                           <h3 className="text-xl font-bold text-slate-800">Control Económico</h3>
                           <div className="flex gap-2">
                               <button onClick={exportFinancialsCSV} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition">
                                   <FileSpreadsheet size={16} /> CSV
                               </button>
                               <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition">
                                   <Printer size={16} /> Imprimir
                               </button>
                           </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-slate-500 text-sm">Gastos Totales</p>
                                <p className="text-2xl font-bold text-red-500">€{(selectedProject.actualCost).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-slate-500 text-sm">Ingresos (Ventas)</p>
                                <p className="text-2xl font-bold text-emerald-500">€0</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-slate-500 text-sm">Saldo Actual</p>
                                <p className="text-2xl font-bold text-slate-800">€{(0 - selectedProject.actualCost).toLocaleString()}</p>
                            </div>
                       </div>
                       
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                           <h3 className="font-bold text-slate-800 mb-4">Análisis Presupuestario Global</h3>
                           <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Presupuesto', amount: selectedProject.budget, fill: '#cbd5e1' },
                                        { name: 'Gasto Real', amount: selectedProject.actualCost, fill: selectedProject.actualCost > selectedProject.budget ? '#ef4444' : '#3b82f6' }
                                    ]} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" tickFormatter={(val) => `€${val/1000}k`} />
                                        <YAxis dataKey="name" type="category" width={100} />
                                        <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={30}>
                                            <Cell fill="#cbd5e1" />
                                            <Cell fill={selectedProject.actualCost > selectedProject.budget ? '#ef4444' : '#3b82f6'} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                           </div>
                       </div>
                   </div>
              )}

              {activeTab === 'team' && (
                  <div className="space-y-6">
                      {/* Add Provider Section */}
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 no-print">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Plus size={18} className="text-emerald-600"/> Añadir Colaborador al Proyecto
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                              <select 
                                value={selectedProviderId} 
                                onChange={(e) => setSelectedProviderId(e.target.value)}
                                className="flex-1 border border-slate-300 rounded-lg text-sm px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                              >
                                  <option value="">-- Seleccionar Proveedor Disponible --</option>
                                  {availableStakeholders.length > 0 ? (
                                      availableStakeholders.map(s => <option key={s.id} value={s.id}>{s.name} {s.activity ? `(${s.activity})` : ''}</option>)
                                  ) : (
                                      <option disabled>No hay más proveedores disponibles</option>
                                  )}
                              </select>
                              <button 
                                onClick={handleAddProvider}
                                disabled={!selectedProviderId}
                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2"
                              >
                                  <Plus size={16} /> Asignar
                              </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                              * Solo se muestran proveedores no asignados previamente. Para crear uno nuevo, ve a la sección "Contactos".
                          </p>
                      </div>

                      <div className="flex justify-between items-end">
                          <h3 className="font-bold text-slate-800">Equipo Asignado ({linkedStakeholders.length})</h3>
                      </div>

                      {linkedStakeholders.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {linkedStakeholders.map(stakeholder => (
                                  <div key={stakeholder.id} className="flex items-start justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                      <div className="flex items-start gap-3">
                                          <div className={`p-2.5 rounded-lg mt-1 ${stakeholder.type === 'Provider' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                              <Briefcase size={20} />
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-900">{stakeholder.name}</p>
                                              {stakeholder.activity && (
                                                  <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 border border-emerald-100">
                                                      {stakeholder.activity}
                                                  </span>
                                              )}
                                              <div className="text-sm text-slate-500 space-y-1 mt-1">
                                                  <div className="flex items-center gap-1.5">
                                                      <Mail size={14} className="text-slate-400" />
                                                      <span>{stakeholder.email}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                      <Phone size={14} className="text-slate-400" />
                                                      <span>{stakeholder.phone}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-2">
                                          <span className={`text-xs px-2 py-0.5 rounded-full ${stakeholder.type === 'Provider' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {stakeholder.type === 'Provider' ? 'Proveedor' : 'Cliente'}
                                          </span>
                                          <button 
                                            onClick={() => handleRemoveProvider(stakeholder.id)} 
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition border border-transparent hover:border-red-100"
                                            title="Desvincular del proyecto"
                                          >
                                              <X size={14} /> Desvincular
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">No hay proveedores asignados a este proyecto.</p>
                                <p className="text-sm text-slate-400">Utiliza el formulario superior para añadir miembros al equipo.</p>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'budgets' && (
                  <div className="space-y-6 print-container">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Table2 size={20} className="text-blue-600" />
                              Desglose de Partidas
                              {selectedBudgetIds.length > 0 && (
                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                      {selectedBudgetIds.length} selec.
                                  </span>
                              )}
                          </h3>
                          <div className="flex gap-2 w-full sm:w-auto">
                              <button onClick={exportBudgetsCSV} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition" title="Exportar a CSV">
                                   <FileSpreadsheet size={16} />
                               </button>
                               <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-200 transition" title="Imprimir">
                                   <Printer size={16} />
                               </button>
                              
                              {selectedBudgetIds.length > 0 && (
                                  <>
                                    <button onClick={handleDeleteSelectedBudgets} className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition shadow-sm animate-in fade-in">
                                        <Trash2 size={16} /> Eliminar ({selectedBudgetIds.length})
                                    </button>
                                    
                                    {selectedBudgetIds.length >= 2 && (
                                        <button onClick={() => setIsComparisonModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm animate-in fade-in">
                                            <Scale size={16} /> Comparar
                                        </button>
                                    )}
                                  </>
                              )}

                              <div className="relative flex-1 sm:flex-none">
                                <select 
                                    value={budgetProviderFilter}
                                    onChange={(e) => setBudgetProviderFilter(e.target.value)}
                                    className="appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 pr-8 py-2.5"
                                >
                                    <option value="all">Todos los proveedores</option>
                                    {stakeholders.filter(s => s.type === 'Provider').map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <Filter size={14} />
                                </div>
                              </div>
                              <button onClick={() => handleOpenBudgetModal()} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
                                <Plus size={16} /> Nueva Partida
                              </button>
                          </div>
                      </div>

                      {/* Spreadsheet / Table View */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="p-3 w-10 text-center no-print">#</th>
                                        <th className="p-3">Concepto (Partida)</th>
                                        <th className="p-3">Proveedor</th>
                                        <th className="p-3 w-32">Fecha</th>
                                        <th className="p-3 w-28">Estado</th>
                                        <th className="p-3 text-right">Importe Est.</th>
                                        <th className="p-3 text-right">Coste Real</th>
                                        <th className="p-3 text-right">Desviación</th>
                                        <th className="p-3 w-20 text-center no-print">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBudgets.length > 0 ? filteredBudgets.map((budget) => {
                                        const provider = stakeholders.find(s => s.id === budget.providerId);
                                        const diff = budget.amount - (budget.actualAmount || 0);
                                        const isSelected = selectedBudgetIds.includes(budget.id);
                                        return (
                                            <tr key={budget.id} className={`hover:bg-slate-50 transition group ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                                <td className="p-3 text-center no-print">
                                                     <button 
                                                        onClick={() => handleToggleBudgetSelection(budget.id)}
                                                        className={`text-slate-400 hover:text-blue-600 transition ${isSelected ? 'text-blue-600' : ''}`}
                                                      >
                                                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                                      </button>
                                                </td>
                                                <td className="p-3 font-medium text-slate-800">{budget.concept}</td>
                                                <td className="p-3 text-slate-600 truncate max-w-[150px]">{provider ? provider.name : '-'}</td>
                                                <td className="p-3 text-slate-500">{budget.date}</td>
                                                <td className="p-3">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                                        budget.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        budget.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}>
                                                        {budget.status === 'Approved' ? 'Aprobado' : budget.status === 'Rejected' ? 'Rechazado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-medium text-slate-700">€{budget.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-3 text-right text-slate-600">€{(budget.actualAmount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                                                <td className={`p-3 text-right font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {diff >= 0 ? '+' : ''}€{diff.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-center no-print">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenBudgetModal(budget);
                                                            }} 
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" 
                                                            title="Editar"
                                                        >
                                                            <Edit size={14}/>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                requestDeleteBudget(budget.id);
                                                            }} 
                                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" 
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-slate-400 italic">No hay partidas presupuestarias registradas.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200">
                                    <tr>
                                        <td colSpan={5} className="p-3 text-right">TOTALES</td>
                                        <td className="p-3 text-right">€{totalEstimated.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                                        <td className="p-3 text-right">€{totalReal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                                        <td className={`p-3 text-right ${deviation >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {deviation >= 0 ? '+' : ''}€{deviation.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                          </div>
                      </div>
                  </div>
              )}

            {activeTab === 'timeline' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center no-print">
                          <h3 className="font-bold text-slate-800">Actuaciones (Bitácora)</h3>
                          <button 
                            onClick={() => {
                                setActionForm({ title: '', description: '', type: 'Construction', date: new Date().toISOString().split('T')[0], amount: 0 });
                                setIsEditingAction(false);
                                setEditingActionId(null);
                                setIsActionModalOpen(true);
                            }}
                            className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1"
                          >
                            <Plus size={16} /> Registrar Evento
                          </button>
                      </div>

                      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                          {selectedProject.actions && selectedProject.actions.length > 0 ? selectedProject.actions.map((action) => (
                              <div key={action.id} className="relative">
                                  <div className={`absolute -left-[41px] top-0 p-2 rounded-full border-2 border-white shadow-sm ${
                                      action.type === 'Milestone' ? 'bg-purple-100 text-purple-600' :
                                      action.type === 'Payment' ? 'bg-red-100 text-red-600' :
                                      action.type === 'Legal' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                      {action.type === 'Milestone' ? <AlertTriangle size={16} /> : 
                                       action.type === 'Payment' ? <CircleDollarSign size={16} /> :
                                       <FileCheck size={16} />}
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group">
                                      <div className="flex justify-between items-start mb-1">
                                          <h4 className="font-bold text-slate-800">{action.title}</h4>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{action.date}</span>
                                            <div className="flex gap-1 no-print">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditAction(action);
                                                    }} 
                                                    className="p-1.5 bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition" 
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        requestDeleteAction(action.id);
                                                    }} 
                                                    className="p-1.5 bg-slate-100 text-slate-500 hover:text-red-600 rounded-lg transition" 
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                          </div>
                                      </div>
                                      <p className="text-slate-600 text-sm">{action.description}</p>
                                      {action.amount && action.amount > 0 && (
                                          <p className="mt-2 text-red-600 font-medium text-sm">-€{action.amount.toLocaleString()}</p>
                                      )}
                                  </div>
                              </div>
                          )) : (
                              <div className="text-slate-400 text-sm">No hay actuaciones registradas.</div>
                          )}
                      </div>
                  </div>
              )}

              {activeTab === 'documents' && (
                  <div className="space-y-6">
                        <div className="flex justify-between items-center no-print">
                            <h3 className="font-bold text-slate-800">Documentación del Proyecto</h3>
                            <label className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm cursor-pointer">
                                <Upload size={16} />
                                Subir Documento
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*,application/pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.dwg,.dxf"
                                    onChange={handleDirectUpload} 
                                />
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projectDocuments.length > 0 ? projectDocuments.map(doc => (
                                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                                                <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
                                                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>
                                                    {doc.type === 'Invoice' ? 'Factura' : doc.type === 'Contract' ? 'Contrato' : doc.type === 'Blueprint' ? 'Plano' : doc.type === 'Budget' ? 'Presupuesto' : 'Otro'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-slate-100 mt-1 no-print">
                                            {doc.url && (
                                                <a 
                                                    href={doc.url} 
                                                    download={doc.name}
                                                    className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
                                                    title="Descargar"
                                                >
                                                    <Download size={14} />
                                                    Descargar
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => onDeleteDocument(doc.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <FileText size={40} className="mx-auto mb-2 opacity-20"/>
                                    <p>No hay documentos asociados a este proyecto.</p>
                                </div>
                            )}
                        </div>
                  </div>
              )}
          </div>
          
          {renderProjectModal()}
          {renderComparisonModal()}

            {/* Modal for New Action */}
            {isActionModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{isEditingAction ? 'Editar Actuación' : 'Registrar Actuación'}</h3>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAction} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input required type="text" placeholder="Ej: Pago Certificación 1" className="w-full p-2 border border-slate-300 rounded-lg" value={actionForm.title} onChange={e => setActionForm({...actionForm, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={actionForm.date} onChange={e => setActionForm({...actionForm, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                    <select className="w-full p-2 border border-slate-300 rounded-lg" value={actionForm.type} onChange={e => setActionForm({...actionForm, type: e.target.value as any})}>
                                        <option value="Construction">Obra / Técnico</option>
                                        <option value="Payment">Pago / Económico</option>
                                        <option value="Legal">Legal / Licencias</option>
                                        <option value="Milestone">Hito Importante</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea className="w-full p-2 border border-slate-300 rounded-lg h-20" value={actionForm.description} onChange={e => setActionForm({...actionForm, description: e.target.value})} />
                            </div>
                            {actionForm.type === 'Payment' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Importe (€)</label>
                                    <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={actionForm.amount} onChange={e => setActionForm({...actionForm, amount: parseFloat(e.target.value)})} />
                                </div>
                            )}
                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Adjuntar Documento / Factura (Opcional)</label>
                                <input 
                                    type="file" 
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    onChange={(e) => setActionFile(e.target.files ? e.target.files[0] : null)}
                                />
                                {actionFile && <p className="text-xs text-emerald-600 mt-1">Archivo seleccionado: {actionFile.name}</p>}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">
                                {isEditingAction ? 'Guardar Cambios' : 'Guardar Evento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Alerts */}
            {isAlertModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Nueva Alerta</h3>
                            <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAlert} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input required type="text" placeholder="Ej: Renovar licencia de grúa" className="w-full p-2 border border-slate-300 rounded-lg" value={alertForm.title} onChange={e => setAlertForm({...alertForm, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite / Cita</label>
                                <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={alertForm.date} onChange={e => setAlertForm({...alertForm, date: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <select className="w-full p-2 border border-slate-300 rounded-lg" value={alertForm.type} onChange={e => setAlertForm({...alertForm, type: e.target.value as any})}>
                                    <option value="License">Licencia / Trámite</option>
                                    <option value="Meeting">Reunión / Cita</option>
                                    <option value="Deadline">Hito / Plazo</option>
                                    <option value="Other">Otro</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-amber-500 text-white py-3 rounded-lg font-bold hover:bg-amber-600 transition">
                                Crear Alerta
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Budget (Item/Partida) */}
            {isBudgetModalOpen && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">{isEditingBudget ? 'Editar Partida Presupuestaria' : 'Nueva Partida Presupuestaria'}</h3>
                            <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
                                <input required type="text" placeholder="Ej: Instalación Eléctrica" className="w-full p-2 border border-slate-300 rounded-lg" value={budgetForm.concept} onChange={e => setBudgetForm({...budgetForm, concept: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Importe Est. (€)</label>
                                    <input required type="number" className="w-full p-2 border border-slate-300 rounded-lg font-bold" value={budgetForm.amount} onChange={e => setBudgetForm({...budgetForm, amount: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Coste Real (€)</label>
                                    <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={budgetForm.actualAmount} onChange={e => setBudgetForm({...budgetForm, actualAmount: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                                    <input type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={budgetForm.date} onChange={e => setBudgetForm({...budgetForm, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select className="w-full p-2 border border-slate-300 rounded-lg" value={budgetForm.status} onChange={e => setBudgetForm({...budgetForm, status: e.target.value as any})}>
                                        <option value="Pending">Pendiente</option>
                                        <option value="Approved">Aprobado</option>
                                        <option value="Rejected">Rechazado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor (Opcional)</label>
                                <select className="w-full p-2 border border-slate-300 rounded-lg" value={budgetForm.providerId} onChange={e => setBudgetForm({...budgetForm, providerId: e.target.value})}>
                                    <option value="">-- Seleccionar --</option>
                                    {stakeholders.filter(s => s.type === 'Provider').map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.activity})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Adjuntar Presupuesto PDF/IMG/Excel</label>
                                <input 
                                    type="file" 
                                    accept="image/*,application/pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.dwg,.dxf"
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    onChange={(e) => setBudgetFile(e.target.files ? e.target.files[0] : null)}
                                />
                                {budgetFile ? <p className="text-xs text-emerald-600 mt-1">Archivo seleccionado: {budgetFile.name}</p> : 
                                 budgetForm.documentId && <p className="text-xs text-blue-600 mt-1">Documento ya adjunto.</p>
                                }
                            </div>

                            <button type="submit" className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                                {isEditingBudget ? 'Actualizar Partida' : 'Crear Partida'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

             {/* Delete Action Confirmation Modal */}
            {actionToDeleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={32} />
                            <h3 className="text-lg font-bold">Eliminar Actuación</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            ¿Estás seguro de eliminar este evento? 
                            <br/><span className="text-xs text-red-500 font-bold">Nota: Si es un pago, se restará del coste real del proyecto.</span>
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setActionToDeleteId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancelar</button>
                            <button onClick={confirmDeleteAction} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

             {/* Delete Budget Confirmation Modal */}
             {budgetToDeleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle size={32} />
                            <h3 className="text-lg font-bold">Eliminar Partida</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            ¿Estás seguro de eliminar esta partida presupuestaria? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setBudgetToDeleteId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancelar</button>
                            <button onClick={confirmDeleteBudget} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
      </div>
  );
};

export default ProjectManager;
