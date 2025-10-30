export enum Role {
  Collaborator = 'Colaborador',
  Supervisor = 'Supervisor',
  Admin = 'Admin',
  SafetyTechnician = 'Técnico de Segurança',
  Warehouse = 'Almoxarife',
  Reservist = 'Reservista',
}

export enum Turno {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    Admin = 'Administrativo',
}

export enum RequisitionStatus {
  Approved = 'Aprovado',
  Delivered = 'Entregue',
  Rejected = 'Recusado',
  PendingSupervisor = 'Pendente Supervisor',
  PendingTechnician = 'Pendente Técnico Seg.',
  Reserved = 'Reservado',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  department: string;
  turno: Turno;
  email?: string;
  phone?: string;
}

export interface EpiVariant {
    code: string;
    size: string;
}

export interface EPIItem {
  id: string;
  name: string;
  code: string; // Main/reference code
  imageUrl: string;
  category: string;
  type: string;
  variants: EpiVariant[];
}

export interface RequisitionItem {
  epiItem: EPIItem;
  quantity: number;
  size: string;
}

export interface RequisitionHistory {
    status: string;
    date: string;
    user: string;
}

export interface Requisition {
  id: string;
  requester: User;
  date: string;
  items: RequisitionItem[];
  status: RequisitionStatus;
  urgency?: 'Urgente' | 'Normal';
  history: RequisitionHistory[];
}

export interface Notification {
  id: number;
  text: string;
  date: string; // ISO String
  read: boolean;
  role?: Role; // Target role for broad notifications
  targetUserId?: string; // Target specific user
  requisitionId?: string;
}