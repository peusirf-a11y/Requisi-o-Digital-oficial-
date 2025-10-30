import { User, EPIItem, Requisition, Role, RequisitionStatus, Turno, Notification } from './types';

export const USERS: User[] = [
  { id: '1', name: 'João Silva', role: Role.Collaborator, avatar: 'https://i.pravatar.cc/150?u=1', department: 'Manutenção', turno: Turno.A, email: 'joao.silva@empresa.com', phone: '(11) 98765-4321' },
  { id: '2', name: 'Carlos Oliveira', role: Role.Supervisor, avatar: 'https://i.pravatar.cc/150?u=2', department: 'Manutenção', turno: Turno.A, email: 'carlos.oliveira@empresa.com', phone: '(11) 98765-4322' },
  { id: '3', name: 'Admin User', role: Role.Admin, avatar: 'https://i.pravatar.cc/150?u=3', department: 'Administração', turno: Turno.Admin, email: 'admin@empresa.com', phone: '(11) 98765-4323' },
  { id: '4', name: 'Maria Oliveira', role: Role.Collaborator, avatar: 'https://i.pravatar.cc/150?u=4', department: 'Manutenção', turno: Turno.B, email: 'maria.oliveira@empresa.com', phone: '(11) 98765-4324' },
  { id: '5', name: 'Ana Carolina Souza', role: Role.SafetyTechnician, avatar: 'https://i.pravatar.cc/150?u=5', department: 'Segurança do Trabalho', turno: Turno.C, email: 'ana.souza@empresa.com', phone: '(11) 98765-4325' },
  { id: '6', name: 'Almoxarife', role: Role.Warehouse, avatar: 'https://i.pravatar.cc/150?u=6', department: 'Logística', turno: Turno.D, email: 'almoxarife@empresa.com', phone: '(11) 98765-4326' },
  { id: '7', name: 'Ricardo Pereira', role: Role.Reservist, avatar: 'https://i.pravatar.cc/150?u=7', department: 'Logística', turno: Turno.E, email: 'ricardo.pereira@empresa.com', phone: '(11) 98765-4327' },
];

export const DEPARTMENTS = ['Operação', 'Manutenção', 'Administrativo', 'Segurança do Trabalho', 'Logística'];


export const EPI_CATALOG: EPIItem[] = [
  { id: 'epi1', name: 'ABAFADOR CONCHA ABS/VD LM 22DB', code: 'AR05/D501', imageUrl: 'https://i.imgur.com/K7pZgV0.png', category: 'Proteção Auditiva', type: 'Abafador', variants: [{code: '30230646', size: 'Único'}] },
  { id: 'epi2', name: 'CARNEIRA CAPAC H-700 PEAD 3M', code: '30230599', imageUrl: 'https://i.imgur.com/nJ2qG7e.png', category: 'Proteção Cabeça', type: 'Acessório Capacete', variants: [{code: '30230599', size: 'Único'}] },
  { id: 'epi3', name: 'CLIP TRANSPORTE LUVA PA PT 30CM', code: '30276734', imageUrl: 'https://i.imgur.com/2Y0f2qf.png', category: 'Acessórios', type: 'Clip', variants: [{code: '30276734', size: 'Único'}] },
  { id: 'epi4', name: 'COLETE SEGURANCA SP PES VD', code: '30230565', imageUrl: 'https://i.imgur.com/kS9Q1Yk.png', category: 'Vestimenta', type: 'Colete', variants: [{code: '30230565', size: 'XG'}] },
  { id: 'epi5', name: 'COLETE TRANSP RADIO UNIV COURO PT', code: '30257917', imageUrl: 'https://i.imgur.com/j4oY8Yy.png', category: 'Vestimenta', type: 'Colete Rádio', variants: [{code: '30257917', size: 'UN'}] },
  { id: 'epi6', name: 'JUGULAR CAP SEG 2 GANCHOS TECIDO ELAST', code: '30230600', imageUrl: 'https://i.imgur.com/9nFzYt2.png', category: 'Proteção Cabeça', type: 'Acessório Capacete', variants: [{code: '30230600', size: 'Único'}] },
  { id: 'epi7', name: 'LANTERNA CABECA PVC LED PT', code: '30174314', imageUrl: 'https://i.imgur.com/iR3uW3z.png', category: 'Iluminação', type: 'Lanterna de Cabeça', variants: [{code: '30174314', size: 'Único'}] },
  { id: 'epi8', name: 'LANTERNA TATICA AL LED PT', code: '30203259', imageUrl: 'https://i.imgur.com/rQ8F3Y3.png', category: 'Iluminação', type: 'Lanterna Tática', variants: [{code: '30203259', size: 'Único'}] },
  { id: 'epi9', name: 'LUVA ANTICORTE AI CZ', code: '30240955', imageUrl: 'https://i.imgur.com/A6D5e3z.png', category: 'Luvas', type: 'Anticorte', variants: [{code: '30240955', size: 'G'}] },
  { id: 'epi10', name: 'LUVA LIMPEZA NBR AM/AZ ANTID', code: '30241616', imageUrl: 'https://i.imgur.com/3U2i8Yp.png', category: 'Luvas', type: 'Limpeza', variants: [{code: '30241616', size: '9'}] },
  { id: 'epi11', name: 'LUVA MALHA PA/ANTI', code: '30281346', imageUrl: 'https://i.imgur.com/Uf7S1hE.png', category: 'Luvas', type: 'Malha', variants: [{code: '30281346', size: 'T9'}] },
  { id: 'epi12', name: 'MACACAO SEG UNI TYVEK BR', code: '30127494', imageUrl: 'https://i.imgur.com/xQ7G3qW.png', category: 'Vestimenta', type: 'Macacão', variants: [{code: '30127494', size: 'GG'}] },
  { id: 'epi13', name: 'LUVA SEG SOLD RASP MD', code: '30228672', imageUrl: 'https://i.imgur.com/y4E5iJg.png', category: 'Luvas', type: 'Soldador', variants: [{code: '30228672', size: 'G'}] },
  { id: 'epi14', name: 'LUVA SEG ABRAS VAQ CT', code: '30241425', imageUrl: 'https://i.imgur.com/7b0t2YI.png', category: 'Luvas', type: 'Vaqueta', variants: [{code: '30241425', size: 'GG'}] },
  { id: 'epi15', name: 'CADEADO 25MM LT VM H22MM SIMPL', code: '30215379', imageUrl: 'https://i.imgur.com/Qv7h4gL.png', category: 'Segurança', type: 'Cadeado', variants: [{code: '30215379', size: 'Único'}] },
  { id: 'epi16', name: 'CAMISA FEMININA ADM', code: 'REF-CF-ADM', imageUrl: 'https://i.imgur.com/rQJk4bW.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30231227', size: 'PP'}, {code: '30274662', size: 'P'}, {code: '30274663', size: 'M'}, {code: '30274664', size: 'G'}, {code: '30274679', size: 'GG'}, {code: '30274676', size: 'EXG'} ]},
  { id: 'epi17', name: 'JAQUETA ADM AZUL', code: 'REF-JQ-ADM', imageUrl: 'https://i.imgur.com/yK5j6Y5.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30231283', size: 'P'}, {code: '30231284', size: 'M'}, {code: '30231285', size: 'G'}, {code: '30231286', size: 'GG'}, {code: '30231288', size: 'EXG'} ]},
  { id: 'epi18', name: 'CALÇA OPERACIONAL CAQUI', code: 'REF-CLC-OP', imageUrl: 'https://i.imgur.com/m4R7x7V.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30274683', size: 'P'}, {code: '30274656', size: 'M'}, {code: '30274682', size: 'G'}, {code: '30274716', size: 'GG'}, {code: '30231282', size: 'EG'} ]},
  { id: 'epi19', name: 'BOTA OPER LG PT C/BIQ COMP', code: 'REF-BT-OP', imageUrl: 'https://i.imgur.com/qSj2g8W.png', category: 'Calçados', type: 'Bota', variants: [ {code: '30261756', size: '38'}, {code: '30261759', size: '41'}, {code: '30261770', size: '42'}, {code: '30261771', size: '43'}, {code: '30261773', size: '44'} ]},
  { id: 'epi20', name: 'CAPA DE CHUVA AMARELA', code: 'REF-CP-CHV', imageUrl: 'https://i.imgur.com/3Y2F5qj.png', category: 'Vestimenta', type: 'Capa de Chuva', variants: [ {code: '30244314', size: 'M'}, {code: '30244311', size: 'G'}, {code: '30244310', size: 'GG'}, {code: '30244312', size: 'XG'}, {code: '30244313', size: 'XXG'} ]},
  { id: 'epi21', name: 'CAPACETE DE SEGURANÇA', code: 'REF-CAP', imageUrl: 'https://i.imgur.com/5g1j5Y3.png', category: 'Proteção Cabeça', type: 'Capacete', variants: [ {code: '30230563', size: 'Branco'}, {code: '30248833', size: 'Verde'}, {code: '30125775', size: 'Amarelo'} ]},
  { id: 'epi22', name: 'CAMISETA BRANCA ELETRICISTA', code: 'REF-CM-ELET', imageUrl: 'https://i.imgur.com/h9S4iY8.png', category: 'Vestimenta', type: 'Uniforme Eletricista', variants: [ {code: '30271657', size: 'P'}, {code: '30271658', size: 'M'}, {code: '30271659', size: 'G'}, {code: '30271660', size: 'GG'}, {code: '30271661', size: 'EXG'} ]},
  { id: 'epi23', name: 'CAMISETA MECÂNICO - AZUL', code: 'REF-CM-MEC', imageUrl: 'https://i.imgur.com/1O6w5eS.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30274592', size: 'M'}, {code: '30274595', size: 'GG'}, {code: '30274590', size: 'EG'} ]},
  { id: 'epi24', name: 'CAMISETA - BRIGADISTA', code: 'REF-CM-BRG', imageUrl: 'https://i.imgur.com/d8S4iFk.png', category: 'Vestimenta', type: 'Uniforme Brigadista', variants: [ {code: '30258276', size: 'P'}, {code: '30258260', size: 'M'}, {code: '30258217', size: 'G'}, {code: '30258218', size: 'GG'}, {code: '30258219', size: 'EG'}, {code: '30258261', size: 'EXG'} ]},
  { id: 'epi25', name: 'KIT HIGIENE ABAFADOR RUIDO X4P3E', code: '30230652', imageUrl: 'https://i.imgur.com/g9H6w5e.png', category: 'Proteção Auditiva', type: 'Acessório Abafador', variants: [{code: '30230652', size: 'Único'}] },
  { id: 'epi26', name: 'CAMISETA MANOBRA', code: 'REF-CM-MNB', imageUrl: 'https://i.imgur.com/c4Y5g8S.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30290976', size: 'P'}, {code: '30290977', size: 'M'}, {code: '30290975', size: 'G'}, {code: '30290974', size: 'GG'}, {code: '30290973', size: 'EG'}, {code: '30290972', size: 'EXG'} ]},
  { id: 'epi27', name: 'CALÇA MANOBRA', code: 'REF-CLC-MNB', imageUrl: 'https://i.imgur.com/uR8g5fQ.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30290982', size: 'P'}, {code: '30290985', size: 'M'}, {code: '30290981', size: 'G'}, {code: '30290980', size: 'GG'}, {code: '30290979', size: 'EXG'} ]},
  { id: 'epi28', name: 'OCULOS DE SEGURANÇA', code: 'REF-OCL', imageUrl: 'https://i.imgur.com/9O7f3qY.png', category: 'Proteção Ocular', type: 'Óculos', variants: [ {code: '30241470', size: 'Transparente'}, {code: '30069364', size: 'Escuro'}, {code: '30240856', size: 'Sobrepor'} ]},
  { id: 'epi29', name: 'CAMISETA OPERACIONAL', code: 'REF-CM-OP', imageUrl: 'https://i.imgur.com/j5R6iY4.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30231200', size: 'PP'}, {code: '30274657', size: 'P'}, {code: '30274675', size: 'M'}, {code: '30274674', size: 'G'}, {code: '30230285', size: 'GG'}, {code: '30230286', size: 'EG'}, {code: '30230287', size: 'EXG'} ]},
  { id: 'epi30', name: 'CAMISA P/ ELETRICISTA NR10', code: 'REF-CMS-NR10', imageUrl: 'https://i.imgur.com/wR9t4gL.png', category: 'Vestimenta', type: 'Uniforme Eletricista NR10', variants: [ {code: '30230779', size: '50'}, {code: '30230780', size: '52'}, {code: '30230771', size: '56'}, {code: '30230782', size: '58'}, {code: '30230783', size: '60'} ]},
  { id: 'epi31', name: 'CALCA ELETRO PROTETORA NR10', code: 'REF-CLC-NR10', imageUrl: 'https://i.imgur.com/J3yS9u4.png', category: 'Vestimenta', type: 'Uniforme Eletricista NR10', variants: [ {code: '30228590', size: '46'}, {code: '30228591', size: '48'}, {code: '30228592', size: '50'}, {code: '30228593', size: '52'}, {code: '30228594', size: '54'} ]},
  { id: 'epi32', name: 'CAMISA ADM MASCULINA', code: 'REF-CMS-ADM', imageUrl: 'https://i.imgur.com/rQJk4bW.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30274653', size: 'P'}, {code: '30274654', size: 'M'}, {code: '30274655', size: 'G'}, {code: '30274659', size: 'GG'}, {code: '30231313', size: 'EG'}, {code: '30231314', size: 'EXG'} ]},
  { id: 'epi33', name: 'CALÇA JEANS FEMININA', code: 'REF-CLC-JNS-F', imageUrl: 'https://i.imgur.com/sS9j5Y3.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30290948', size: '36'}, {code: '30271798', size: '38'}, {code: '30290947', size: '40'}, {code: '30290946', size: '42'}, {code: '30271654', size: '44'}, {code: '30271656', size: '46'}, {code: '30271655', size: '48'}, {code: '30257699', size: '52'} ]},
  { id: 'epi34', name: 'JAQUETA OPERACIONAL CAQUI', code: 'REF-JQ-OP', imageUrl: 'https://i.imgur.com/lO9i5eS.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30257732', size: 'P'}, {code: '30257731', size: 'M'}, {code: '30257730', size: 'G'}, {code: '30257698', size: 'GG'}, {code: '30257699', size: 'EG'}, {code: '30258262', size: 'EXG'} ]},
  { id: 'epi35', name: 'CALCA ADM MASCULINA JEANS AZ', code: 'REF-CLC-JNS-M', imageUrl: 'https://i.imgur.com/Zk9i4Yp.png', category: 'Vestimenta', type: 'Uniforme', variants: [ {code: '30271647', size: '40'}, {code: '30277733', size: '42'}, {code: '30271652', size: '44'}, {code: '30271650', size: '48'}, {code: '30290879', size: '50'}, {code: '30271651', size: '52'}, {code: '30231300', size: 'EXG'} ]},
  { id: 'epi36', name: 'BOTINA IND/CAMP/OP COU PT COMP', code: 'REF-BTD-OP', imageUrl: 'https://i.imgur.com/QhE5a6T.png', category: 'Calçados', type: 'Botina', variants: [ {code: '30297616', size: '34'}, {code: '30297618', size: '35'}, {code: '30297619', size: '36'}, {code: '30297608', size: '37'}, {code: '30297623', size: '38'}, {code: '30297626', size: '39'}, {code: '30297627', size: '40'}, {code: '30297630', size: '41'}, {code: '30297640', size: '42'}, {code: '30297642', size: '43'}, {code: '30297643', size: '44'}, {code: '30297650', size: '45'}, {code: '30297644', size: '46'} ]}
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, text: 'Sua requisição REQ-2024-004 foi entregue.', date: new Date('2024-06-26T13:05:00Z').toISOString(), read: true, targetUserId: '4', requisitionId: 'REQ-2024-004' },
  { id: 2, text: 'Nova requisição REQ-2024-001 de João Silva precisa de sua aprovação.', date: new Date('2024-07-10T10:01:00Z').toISOString(), read: false, targetUserId: '2', requisitionId: 'REQ-2024-001' },
  { id: 3, text: 'Requisição REQ-2024-002 foi aprovada pelo supervisor, aguardando sua análise.', date: new Date('2024-07-09T14:36:00Z').toISOString(), read: false, targetUserId: '5', requisitionId: 'REQ-2024-002' },
  { id: 4, text: 'A requisição REQ-2024-003 foi recusada pelo seu supervisor.', date: new Date('2024-07-08T09:16:00Z').toISOString(), read: true, targetUserId: '1', requisitionId: 'REQ-2024-003' },
  { id: 5, text: 'A requisição REQ-2024-005 foi aprovada e está pronta para reserva.', date: new Date('2024-07-11T08:11:00Z').toISOString(), read: false, role: Role.Reservist, requisitionId: 'REQ-2024-005' },
  { id: 6, text: 'Itens da requisição REQ-2024-006 foram reservados e aguardam entrega.', date: new Date('2024-07-12T16:01:00Z').toISOString(), read: false, role: Role.Warehouse, requisitionId: 'REQ-2024-006' }
];

// FIX: Added MOCK_REQUISITIONS to provide data for components that depend on it.
export const MOCK_REQUISITIONS: Requisition[] = [
  {
    id: 'REQ-2024-001',
    requester: USERS[0], // João Silva
    date: '2024-07-10T10:00:00Z',
    items: [
      { epiItem: EPI_CATALOG[8], quantity: 2, size: 'G' }, // LUVA ANTICORTE AI CZ
      { epiItem: EPI_CATALOG[27], quantity: 1, size: 'Transparente' }, // OCULOS DE SEGURANÇA
    ],
    status: RequisitionStatus.PendingSupervisor,
    urgency: 'Normal',
    history: [
      { status: 'Requisição Feita', date: new Date('2024-07-10T10:00:00Z').toLocaleString('pt-BR'), user: 'João Silva' }
    ]
  },
  {
    id: 'REQ-2024-002',
    requester: USERS[3], // Maria Oliveira
    date: '2024-07-09T14:30:00Z',
    items: [
      { epiItem: EPI_CATALOG[18], quantity: 1, size: '42' }, // BOTA OPER LG PT C/BIQ COMP
    ],
    status: RequisitionStatus.PendingTechnician,
    urgency: 'Urgente',
    history: [
      { status: 'Aprovado por Supervisor', date: new Date('2024-07-09T14:35:00Z').toLocaleString('pt-BR'), user: 'Carlos Oliveira' },
      { status: 'Requisição Feita', date: new Date('2024-07-09T14:30:00Z').toLocaleString('pt-BR'), user: 'Maria Oliveira' },
    ]
  },
  {
    id: 'REQ-2024-003',
    requester: USERS[0], // João Silva
    date: '2024-07-08T09:00:00Z',
    items: [
      { epiItem: EPI_CATALOG[3], quantity: 5, size: 'XG' }, // COLETE SEGURANCA SP PES VD
    ],
    status: RequisitionStatus.Rejected,
    urgency: 'Normal',
    history: [
      { status: 'Recusado por Supervisor: Quantidade excessiva para o período.', date: new Date('2024-07-08T09:15:00Z').toLocaleString('pt-BR'), user: 'Carlos Oliveira' },
      { status: 'Requisição Feita', date: new Date('2024-07-08T09:00:00Z').toLocaleString('pt-BR'), user: 'João Silva' },
    ]
  },
  {
    id: 'REQ-2024-004',
    requester: USERS[3], // Maria Oliveira
    date: '2024-06-25T11:00:00Z',
    items: [
      { epiItem: EPI_CATALOG[28], quantity: 2, size: 'M' }, // CAMISETA OPERACIONAL
      { epiItem: EPI_CATALOG[17], quantity: 1, size: 'M' }, // CALÇA OPERACIONAL CAQUI
    ],
    status: RequisitionStatus.Delivered,
    urgency: 'Normal',
    history: [
      { status: 'Entregue', date: new Date('2024-06-26T13:00:00Z').toLocaleString('pt-BR'), user: 'Almoxarife' },
      { status: 'Reservado', date: new Date('2024-06-26T08:00:00Z').toLocaleString('pt-BR'), user: 'Ricardo Pereira' },
      { status: 'Aprovado por Técnico de Segurança', date: new Date('2024-06-25T12:10:00Z').toLocaleString('pt-BR'), user: 'Ana Carolina Souza' },
      { status: 'Aprovado por Supervisor', date: new Date('2024-06-25T11:05:00Z').toLocaleString('pt-BR'), user: 'Carlos Oliveira' },
      { status: 'Requisição Feita', date: new Date('2024-06-25T11:00:00Z').toLocaleString('pt-BR'), user: 'Maria Oliveira' },
    ]
  },
    {
    id: 'REQ-2024-005',
    requester: USERS[0], // João Silva
    date: '2024-07-11T08:00:00Z',
    items: [
      { epiItem: EPI_CATALOG[11], quantity: 1, size: 'GG' }, // MACACAO SEG UNI TYVEK BR
    ],
    status: RequisitionStatus.Approved,
    urgency: 'Normal',
    history: [
        { status: 'Aprovado por Técnico de Segurança', date: new Date('2024-07-11T08:10:00Z').toLocaleString('pt-BR'), user: 'Ana Carolina Souza' },
        { status: 'Aprovado por Supervisor', date: new Date('2024-07-11T08:05:00Z').toLocaleString('pt-BR'), user: 'Carlos Oliveira' },
        { status: 'Requisição Feita', date: new Date('2024-07-11T08:00:00Z').toLocaleString('pt-BR'), user: 'João Silva' },
    ]
  },
  {
    id: 'REQ-2024-006',
    requester: USERS[3], // Maria Oliveira
    date: '2024-07-12T15:00:00Z',
    items: [
      { epiItem: EPI_CATALOG[19], quantity: 1, size: 'G' }, // CAPA DE CHUVA AMARELA
    ],
    status: RequisitionStatus.Reserved,
    urgency: 'Normal',
    history: [
      { status: 'Reservado', date: new Date('2024-07-12T16:00:00Z').toLocaleString('pt-BR'), user: 'Ricardo Pereira' },
      { status: 'Aprovado por Técnico de Segurança', date: new Date('2024-07-12T15:10:00Z').toLocaleString('pt-BR'), user: 'Ana Carolina Souza' },
      { status: 'Aprovado por Supervisor', date: new Date('2024-07-12T15:05:00Z').toLocaleString('pt-BR'), user: 'Carlos Oliveira' },
      { status: 'Requisição Feita', date: new Date('2024-07-12T15:00:00Z').toLocaleString('pt-BR'), user: 'Maria Oliveira' },
    ]
  }
];