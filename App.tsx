
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import FeasibilityStudy from './components/FeasibilityStudy';
import DocumentScanner from './components/DocumentScanner';
import StakeholderManager from './components/StakeholderManager';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import { ViewState, Project, Stakeholder, Document, User } from './types';
import { MOCK_PROJECTS, MOCK_STAKEHOLDERS, MOCK_DOCUMENTS } from './constants';
import { CheckCircle, XCircle } from 'lucide-react';

// Simple Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all animate-in slide-in-from-top-2 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize Data from LocalStorage if available, otherwise use Mock Data
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('promotor_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(() => {
    const saved = localStorage.getItem('promotor_stakeholders');
    return saved ? JSON.parse(saved) : MOCK_STAKEHOLDERS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('promotor_documents');
    return saved ? JSON.parse(saved) : MOCK_DOCUMENTS;
  });

  // --- AUTH CHECK ON MOUNT ---
  useEffect(() => {
    const storedUser = localStorage.getItem('promotor_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoadingAuth(false);
  }, []);

  // --- AUTO-SAVE LOGIC ---
  useEffect(() => {
    localStorage.setItem('promotor_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('promotor_stakeholders', JSON.stringify(stakeholders));
  }, [stakeholders]);

  useEffect(() => {
    localStorage.setItem('promotor_documents', JSON.stringify(documents));
  }, [documents]);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Capture install prompt event');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleManualSave = () => {
    try {
      localStorage.setItem('promotor_projects', JSON.stringify(projects));
      localStorage.setItem('promotor_stakeholders', JSON.stringify(stakeholders));
      localStorage.setItem('promotor_documents', JSON.stringify(documents));
      showNotification('Datos sincronizados correctamente', 'success');
    } catch (e) {
      showNotification('Error al guardar datos', 'error');
    }
  };

  const handleLogin = (email: string, name?: string) => {
    const user: User = {
      email,
      name: name || 'Admin',
      role: 'admin',
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(user);
    localStorage.setItem('promotor_user', JSON.stringify(user));
    showNotification(name ? `¡Bienvenido, ${name}!` : 'Sesión iniciada correctamente', 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('promotor_user');
    showNotification('Sesión cerrada', 'success');
  };

  // CRUD Handlers
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    showNotification('Promoción creada', 'success');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    showNotification('Promoción actualizada', 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    showNotification('Promoción eliminada', 'success');
  };

  const handleAddStakeholder = (newStakeholder: Stakeholder) => {
    setStakeholders(prev => [...prev, newStakeholder]);
    showNotification('Contacto añadido', 'success');
  };

  const handleUpdateStakeholder = (updatedStakeholder: Stakeholder) => {
    setStakeholders(prev => prev.map(s => s.id === updatedStakeholder.id ? updatedStakeholder : s));
    showNotification('Contacto actualizado', 'success');
  };

  const handleDeleteStakeholder = (stakeholderId: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== stakeholderId));
    showNotification('Contacto eliminado', 'success');
  };

  const handleAddDocument = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
    showNotification('Documento guardado', 'success');
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
    showNotification('Documento eliminado', 'success');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard projects={projects} />;
      case 'projects': 
        return (
            <ProjectManager 
                projects={projects} 
                stakeholders={stakeholders}
                documents={documents}
                onAddProject={handleAddProject} 
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onAddDocument={handleAddDocument}
                onDeleteDocument={handleDeleteDocument}
            />
        );
      case 'stakeholders':
        return (
          <StakeholderManager 
            stakeholders={stakeholders} 
            projects={projects}
            onAddStakeholder={handleAddStakeholder}
            onUpdateStakeholder={handleUpdateStakeholder}
            onDeleteStakeholder={handleDeleteStakeholder}
          />
        );
      case 'feasibility': 
        return <FeasibilityStudy />;
      case 'documents': 
        return (
            <DocumentScanner 
                documents={documents} 
                projects={projects} 
                stakeholders={stakeholders} 
                onAddDocument={handleAddDocument} 
                onDeleteDocument={handleDeleteDocument}
                onUpdateProject={handleUpdateProject}
                onAddStakeholder={handleAddStakeholder}
            />
        );
      case 'settings':
        return <Settings deferredPrompt={deferredPrompt} />;
      default: 
        return <Dashboard projects={projects} />;
    }
  };

  // If Auth Loading, show simple spinner
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If Not Logged In, Show Login Screen
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onSave={handleManualSave}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <AIAssistant />
    </div>
  );
};

export default App;
