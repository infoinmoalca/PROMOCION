
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ScanLine, Loader2, ArrowRight, Link as LinkIcon, Trash2, Eye, Download, FileSpreadsheet, Bot, Plus, Save } from 'lucide-react';
import { Document, Project, Stakeholder, Budget } from '../types';
import { analyzeDocument } from '../services/geminiService';

interface DocumentScannerProps {
    documents: Document[];
    projects: Project[];
    stakeholders: Stakeholder[];
    onAddDocument: (d: Document) => void;
    onDeleteDocument: (id: string) => void;
    onUpdateProject?: (p: Project) => void; // New prop for auto-budget creation
    onAddStakeholder?: (s: Stakeholder) => void; // New prop for auto-provider creation
}

interface AnalysisData {
    type: string;
    summary: string;
    date: string | null;
    amount: number | null;
    concept: string | null;
    providerName: string | null;
    projectName: string | null;
    confidence: number;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ documents, projects, stakeholders, onAddDocument, onDeleteDocument, onUpdateProject, onAddStakeholder }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [manualLinkTo, setManualLinkTo] = useState<{id: string, type: 'Project' | 'Stakeholder'}>({ id: '', type: 'Project' });
  const [detectedProject, setDetectedProject] = useState<Project | null>(null);
  const [detectedStakeholder, setDetectedStakeholder] = useState<Stakeholder | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine if file is analyzable by Gemini Vision
  const isAnalyzable = (file: File) => {
      return file.type.startsWith('image/') || file.type === 'application/pdf';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setDetectedProject(null);
      setDetectedStakeholder(null);
    }
  };

  const findBestMatch = (name: string | null, list: {id: string, name: string}[]) => {
      if (!name) return null;
      const lowerName = name.toLowerCase();
      return list.find(item => item.name.toLowerCase().includes(lowerName) || lowerName.includes(item.name.toLowerCase()));
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    if (!isAnalyzable(selectedFile)) {
        // Fallback for non-analyzable files (force manual save mode)
        setAnalysisResult({
            type: 'Other',
            summary: 'Archivo importado manualmente',
            date: new Date().toISOString().split('T')[0],
            amount: null,
            concept: selectedFile.name,
            providerName: null,
            projectName: null,
            confidence: 100
        });
        return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        const jsonString = await analyzeDocument(base64Content, selectedFile.type);
        
        try {
            const result: AnalysisData = JSON.parse(jsonString);
            setAnalysisResult(result);

            // Auto-Associate Logic
            if (result.projectName) {
                const match = findBestMatch(result.projectName, projects);
                if (match) setDetectedProject(match as Project);
            }
            if (result.providerName) {
                const match = findBestMatch(result.providerName, stakeholders);
                if (match) setDetectedStakeholder(match as Stakeholder);
            }

        } catch (e) {
            console.error("Failed to parse JSON from AI", e);
            // Fallback for error handling if AI didn't return valid JSON
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProcessAndSave = () => {
      if (!selectedFile || !analysisResult) return;

      // 1. Create Document Entity
      const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: selectedFile.name,
          type: analysisResult.type as any || 'Other',
          date: analysisResult.date || new Date().toISOString().split('T')[0],
          amount: analysisResult.amount || undefined,
          status: 'Processed',
          linkedEntityId: detectedProject?.id || detectedStakeholder?.id || (manualLinkTo.id ? manualLinkTo.id : undefined),
          linkedEntityType: detectedProject ? 'Project' : detectedStakeholder ? 'Stakeholder' : (manualLinkTo.id ? manualLinkTo.type : 'None'),
          url: previewUrl || undefined
      };
      onAddDocument(newDoc);

      // 2. Auto-Create Budget if Applicable
      if (analysisResult.type === 'Budget' && detectedProject && analysisResult.amount && onUpdateProject) {
          const newBudget: Budget = {
              id: Math.random().toString(36).substr(2, 9),
              concept: analysisResult.concept || 'Partida Importada',
              amount: analysisResult.amount,
              actualAmount: 0,
              date: analysisResult.date || new Date().toISOString().split('T')[0],
              status: 'Pending',
              providerId: detectedStakeholder?.id,
              documentId: newDoc.id
          };
          
          const updatedProject = {
              ...detectedProject,
              budgets: [...(detectedProject.budgets || []), newBudget],
              // Auto-link provider to project if not already linked
              stakeholderIds: (detectedStakeholder && !detectedProject.stakeholderIds?.includes(detectedStakeholder.id)) 
                ? [...(detectedProject.stakeholderIds || []), detectedStakeholder.id] 
                : detectedProject.stakeholderIds
          };
          onUpdateProject(updatedProject);
      }

      // Reset
      setSelectedFile(null);
      setPreviewUrl(null);
      setAnalysisResult(null);
      setDetectedProject(null);
      setDetectedStakeholder(null);
  };

  const getLinkedEntityName = (doc: Document) => {
      if (!doc.linkedEntityId) return null;
      if (doc.linkedEntityType === 'Project') {
          return projects.find(p => p.id === doc.linkedEntityId)?.name;
      } else {
          return stakeholders.find(s => s.id === doc.linkedEntityId)?.name;
      }
  };

  const exportCSV = () => {
      const headers = ["Nombre", "Tipo", "Fecha", "Estado", "Asociado A"];
      const rows = documents.map(d => [
          `"${d.name}"`, d.type, d.date, d.status, `"${getLinkedEntityName(d) || 'N/A'}"`
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `documentos_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión Documental Inteligente</h2>
          <p className="text-slate-500">Sube facturas, planos o contratos y deja que Gemini extraiga los datos.</p>
        </div>
        <div>
             <button 
                onClick={exportCSV}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
            >
                <FileSpreadsheet size={16} /> Exportar Lista
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6 no-print">
            <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                    selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
                onClick={() => !analysisResult && fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.dwg,.dxf"
                    onChange={handleFileChange}
                />
                
                {previewUrl ? (
                    <div className="relative w-full h-64 mb-4 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {selectedFile?.type === 'application/pdf' ? (
                             <div className="text-center">
                                 <FileText size={48} className="text-red-500 mx-auto mb-2" />
                                 <p className="text-sm font-bold text-slate-700">{selectedFile.name}</p>
                                 <p className="text-xs text-slate-500">Vista previa de PDF no disponible</p>
                             </div>
                        ) : isAnalyzable(selectedFile!) ? (
                             <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                             <div className="text-center">
                                 <FileSpreadsheet size={48} className="text-green-600 mx-auto mb-2" />
                                 <p className="text-sm font-bold text-slate-700">{selectedFile!.name}</p>
                                 <p className="text-xs text-slate-500">Archivo de Datos / Plano (Sin vista previa)</p>
                             </div>
                        )}
                       
                        {!analysisResult && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); setAnalysisResult(null); }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                            >
                                <AlertCircle size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <Upload size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700">Haz clic para subir un documento</h3>
                        <p className="text-sm text-slate-500 mt-2">Soporta PDF, JPG, Excel, DWG, CSV...</p>
                    </>
                )}

                {selectedFile && !analyzing && !analysisResult && (
                    <div className="w-full space-y-3" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={handleScan}
                            className={`w-full text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-lg ${
                                isAnalyzable(selectedFile) 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                : 'bg-slate-700 hover:bg-slate-800 shadow-slate-200'
                            }`}
                        >
                            {isAnalyzable(selectedFile) ? (
                                <>
                                    <ScanLine size={18} />
                                    Analizar con IA
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Guardar Archivo (Sin Análisis)
                                </>
                            )}
                        </button>
                        {!isAnalyzable(selectedFile) && (
                            <p className="text-xs text-slate-500">Este tipo de archivo no admite extracción automática de datos por IA, pero se guardará en tu lista.</p>
                        )}
                    </div>
                )}
                
                {analyzing && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-700 font-medium">
                        <Loader2 className="animate-spin" size={20} />
                        Procesando documento (Gemini)...
                    </div>
                )}
            </div>

            {/* Analysis Result & Automation Card */}
            {analysisResult && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <Bot className="text-emerald-500" size={24} />
                        <div>
                            <h3 className="font-bold text-slate-800">
                                {isAnalyzable(selectedFile!) ? 'Análisis Inteligente Completado' : 'Archivo Listo para Guardar'}
                            </h3>
                            <p className="text-xs text-slate-500">Confianza: {analysisResult.confidence}%</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="text-xs text-slate-400 uppercase font-bold">Tipo Documento</span>
                                <p className="font-medium text-slate-800">{analysisResult.type}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <span className="text-xs text-slate-400 uppercase font-bold">Fecha</span>
                                <p className="font-medium text-slate-800">{analysisResult.date || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                                <span className="text-xs text-slate-400 uppercase font-bold">Concepto / Resumen</span>
                                <p className="font-medium text-slate-800">{analysisResult.concept || analysisResult.summary}</p>
                            </div>
                             {analysisResult.amount && (
                                <div className="bg-emerald-50 p-3 rounded-lg col-span-2 border border-emerald-100">
                                    <span className="text-xs text-emerald-600 uppercase font-bold">Importe Detectado</span>
                                    <p className="text-xl font-bold text-emerald-700">€{analysisResult.amount.toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-3">
                            <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                <LinkIcon size={14}/> Asociaciones Automáticas
                            </h4>
                            
                            {/* Project Association */}
                            <div className={`p-3 rounded-lg border flex justify-between items-center ${detectedProject ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div>
                                    <p className="text-xs text-slate-500">Proyecto</p>
                                    <p className="font-medium text-sm">{detectedProject ? detectedProject.name : 'No detectado automáticamente'}</p>
                                </div>
                                {!detectedProject && (
                                    <select 
                                        className="text-sm border rounded p-1"
                                        onChange={(e) => {
                                            const p = projects.find(p => p.id === e.target.value);
                                            setDetectedProject(p || null);
                                        }}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                )}
                                {detectedProject && <CheckCircle size={16} className="text-blue-500" />}
                            </div>

                            {/* Stakeholder Association */}
                            <div className={`p-3 rounded-lg border flex justify-between items-center ${detectedStakeholder ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div>
                                    <p className="text-xs text-slate-500">Proveedor / Cliente</p>
                                    <p className="font-medium text-sm">{detectedStakeholder ? detectedStakeholder.name : (analysisResult.providerName || 'No detectado')}</p>
                                </div>
                                {!detectedStakeholder && (
                                     <select 
                                        className="text-sm border rounded p-1"
                                        onChange={(e) => {
                                            const s = stakeholders.find(s => s.id === e.target.value);
                                            setDetectedStakeholder(s || null);
                                        }}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {stakeholders.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                )}
                                {detectedStakeholder && <CheckCircle size={16} className="text-orange-500" />}
                            </div>
                        </div>
                    </div>

                     <div className="mt-6 pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleProcessAndSave}
                            className="w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
                        >
                            <CheckCircle size={18} className="text-emerald-400" />
                            {analysisResult.type === 'Budget' && detectedProject 
                                ? 'Guardar Documento y Crear Partida' 
                                : 'Confirmar y Guardar Documento'}
                        </button>
                        {analysisResult.type === 'Budget' && detectedProject && (
                            <p className="text-center text-xs text-slate-500 mt-2">
                                Se añadirá automáticamente a la pestaña "Presupuestos" de {detectedProject.name}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Document List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print-container">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Documentos Recientes</h3>
                <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{documents.length} archivos</span>
            </div>
            <div className="divide-y divide-slate-100 h-[600px] overflow-y-auto">
                {documents.map(doc => (
                    <div key={doc.id} className="p-4 hover:bg-slate-50 transition group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 no-print">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    doc.status === 'Processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {doc.status}
                                </span>
                                {doc.url && (
                                    <>
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                                            title="Ver"
                                        >
                                            <Eye size={16} />
                                        </a>
                                        <a 
                                            href={doc.url} 
                                            download={doc.name}
                                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Descargar"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </>
                                )}
                                <button 
                                    onClick={() => onDeleteDocument(doc.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        {doc.linkedEntityId && (
                            <div className="mt-2 ml-11 flex items-center gap-1 text-xs text-slate-500 bg-slate-100 w-fit px-2 py-0.5 rounded">
                                <LinkIcon size={12} />
                                <span>Asociado a: {getLinkedEntityName(doc)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;
