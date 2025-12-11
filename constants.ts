
import { Project, ProjectStatus, CashFlowItem, Document, Stakeholder } from './types';

export const MOCK_STAKEHOLDERS: Stakeholder[] = [
    { id: 's1', name: 'Construcciones Norte SL', type: 'Provider', activity: 'Obra Civil', email: 'contacto@cnorte.com', phone: '912345678', address: 'C/ Industrial 4, Madrid', taxId: 'B12345678', notes: 'Proveedor principal de obra civil.' },
    { id: 's2', name: 'Juan Pérez García', type: 'Client', activity: 'Inversor', email: 'juan.perez@email.com', phone: '600123456', address: 'Av. Libertad 20, Valencia', taxId: '12345678Z', notes: 'Interesado en áticos.' },
    { id: 's3', name: 'Materiales y Suministros SA', type: 'Provider', activity: 'Materiales', email: 'ventas@mys.com', phone: '934567890', address: 'Polígono Sur, Nave 3, Sevilla', taxId: 'A87654321' },
    { id: 's4', name: 'Arquitectura & Diseño', type: 'Provider', activity: 'Arquitectura', email: 'estudio@arq.com', phone: '915555555', address: 'Madrid', taxId: 'B9999999' }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Residencial Los Olivos',
    location: 'Madrid, Zona Norte',
    budget: 4500000,
    actualCost: 1200000,
    progress: 35,
    status: ProjectStatus.ACTIVE,
    startDate: '2023-09-01',
    endDate: '2025-03-01',
    stakeholderIds: ['s1', 's4'],
    actions: [
        { id: 'a1', date: '2023-09-01', title: 'Inicio de Obra', description: 'Firma de acta de replanteo.', type: 'Construction' },
        { id: 'a2', date: '2023-11-15', title: 'Pago Cimentación', description: 'Certificación nº1 abonada.', type: 'Payment', amount: 150000 },
        { id: 'a3', date: '2024-02-10', title: 'Estructura P1', description: 'Finalizada estructura primera planta.', type: 'Construction' }
    ],
    budgets: [
        { id: 'b1', concept: 'Instalación Eléctrica General', amount: 250000, actualAmount: 245000, date: '2024-01-15', status: 'Approved', providerId: 's1' },
        { id: 'b2', concept: 'Carpintería de Aluminio', amount: 180000, actualAmount: 0, date: '2024-02-01', status: 'Pending' },
        { id: 'b3', concept: 'Movimiento de Tierras', amount: 50000, actualAmount: 55000, date: '2023-10-01', status: 'Approved', providerId: 's1' }
    ],
    alerts: [
        { id: 'al1', title: 'Vencimiento Licencia de Grúa', date: '2024-06-01', type: 'License', isCompleted: false },
        { id: 'al2', title: 'Reunión con Arquitecto', date: '2024-05-20', type: 'Meeting', isCompleted: true }
    ]
  },
  {
    id: '2',
    name: 'Torre Marina',
    location: 'Valencia, Puerto',
    budget: 8200000,
    actualCost: 50000,
    progress: 5,
    status: ProjectStatus.PLANNING,
    startDate: '2024-01-15',
    endDate: '2026-06-30',
    stakeholderIds: ['s4'],
    actions: [
        { id: 'a4', date: '2024-01-20', title: 'Licencia Solicitada', description: 'Presentación proyecto básico al ayuntamiento.', type: 'Legal' }
    ],
    budgets: [],
    alerts: [
        { id: 'al3', title: 'Presentar Aval Bancario', date: '2024-05-30', type: 'Deadline', isCompleted: false }
    ]
  },
  {
    id: '3',
    name: 'Villas del Bosque',
    location: 'Girona',
    budget: 3100000,
    actualCost: 2900000,
    progress: 92,
    status: ProjectStatus.SALES,
    startDate: '2022-05-01',
    endDate: '2024-08-01',
    stakeholderIds: ['s3'],
    actions: [],
    budgets: [],
    alerts: []
  }
];

export const MOCK_CASH_FLOW: CashFlowItem[] = [
  { month: 'Ene', income: 150000, expenses: 120000, balance: 30000 },
  { month: 'Feb', income: 180000, expenses: 140000, balance: 40000 },
  { month: 'Mar', income: 120000, expenses: 200000, balance: -80000 },
  { month: 'Abr', income: 300000, expenses: 150000, balance: 150000 },
  { month: 'May', income: 250000, expenses: 180000, balance: 70000 },
  { month: 'Jun', income: 280000, expenses: 160000, balance: 120000 },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: '101', name: 'Factura Cimentos SA', type: 'Invoice', date: '2024-05-12', amount: 12500, status: 'Processed', linkedEntityId: '1', linkedEntityType: 'Project' },
  { id: '102', name: 'Plano Estructural v2', type: 'Blueprint', date: '2024-05-10', status: 'Pending', linkedEntityId: '2', linkedEntityType: 'Project' },
  { id: '103', name: 'Licencia de Obra', type: 'Contract', date: '2024-01-20', status: 'Processed', linkedEntityId: '1', linkedEntityType: 'Project' },
];
