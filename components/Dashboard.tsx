import React, { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { User, Role, Requisition, RequisitionStatus, EPIItem, RequisitionItem, Notification, EpiVariant } from '../types';
import { USERS, MOCK_REQUISITIONS, MOCK_NOTIFICATIONS, EPI_CATALOG } from '../constants';
import * as Icons from './Icons';
import UserManagementPage from './UserManagementPage';
import HistoryPage from './HistoryPage';
import NotificationBell from './NotificationBell';
import ProfilePage from './ProfilePage';
import ReportsPage from './ReportsPage';
import EpiManagementPage from './EpiManagementPage';
import SettingsPage from './SettingsPage';

// --- Reusable Components ---

interface StatusBadgeProps {
  status: RequisitionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClasses = {
    [RequisitionStatus.Approved]: 'bg-green-100 text-green-800',
    [RequisitionStatus.Delivered]: 'bg-blue-100 text-blue-800',
    [RequisitionStatus.Rejected]: 'bg-red-100 text-red-800',
    [RequisitionStatus.PendingSupervisor]: 'bg-yellow-100 text-yellow-800',
    [RequisitionStatus.PendingTechnician]: 'bg-orange-100 text-orange-800',
    [RequisitionStatus.Reserved]: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

// --- Signature Components ---

const SignaturePad = forwardRef((props: { onDraw?: () => void }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const hasBeenResized = useRef(false);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    };
    
    useEffect(() => {
        const handleResize = () => {
            hasBeenResized.current = true;
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);
        resizeCanvas();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // A secondary resize when the modal opens, for example.
        if (!hasBeenResized.current) {
            resizeCanvas();
        }
    }, [props]);


    const getCoords = (event: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { offsetX: 0, offsetY: 0 };
      const rect = canvas.getBoundingClientRect();

      if (event instanceof MouseEvent) {
          return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      }
      if (event instanceof TouchEvent && event.touches && event.touches.length > 0) {
          return {
              offsetX: event.touches[0].clientX - rect.left,
              offsetY: event.touches[0].clientY - rect.top
          };
      }
      return { offsetX: 0, offsetY: 0 };
    }

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        resizeCanvas(); // Ensure canvas is correctly sized before drawing
        const { offsetX, offsetY } = getCoords(event.nativeEvent);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        if (props.onDraw) props.onDraw();
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoords(event.nativeEvent);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
        }
        setIsDrawing(false);
    };

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        getSignature: () => {
            const canvas = canvasRef.current;
            return canvas ? canvas.toDataURL('image/png') : null;
        }
    }));

    return (
        <canvas
            ref={canvasRef}
            className="bg-gray-100 border border-gray-300 rounded-md cursor-crosshair w-full h-[150px]"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
    );
});


const SignatureModal = ({
    isOpen,
    onClose,
    onConfirm,
    requisition,
    title,
    description,
    confirmButtonText
}: {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (reqId: string, signature: string, password: string) => void,
    requisition: Requisition | null,
    title: string,
    description: React.ReactNode,
    confirmButtonText: string
}) => {
    const signaturePadRef = useRef<any>(null);
    const [password, setPassword] = useState('');
    const [isSigned, setIsSigned] = useState(false);
    
    if (!isOpen || !requisition) return null;

    const handleClear = () => {
        signaturePadRef.current?.clear();
        setIsSigned(false);
    };

    const handleConfirm = () => {
        const signature = signaturePadRef.current?.getSignature();
        onConfirm(requisition.id, signature, password);
        handleClose();
    };

    const handleClose = () => {
        setPassword('');
        setIsSigned(false);
        signaturePadRef.current?.clear();
        onClose();
    }

    const canConfirm = isSigned && password.length > 3;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura Digital</label>
                    <SignaturePad ref={signaturePadRef} onDraw={() => setIsSigned(true)} />
                     <button onClick={handleClear} className="text-sm text-blue-600 hover:underline mt-1">Limpar Assinatura</button>
                </div>
                
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Senha de Confirmação</label>
                     <input 
                        type="password" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Digite sua senha"
                     />
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={handleClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleConfirm} disabled={!canConfirm} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectionModal = ({
    isOpen,
    onClose,
    onConfirm,
    requisitionId,
}: {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (reqId: string, justification: string) => void,
    requisitionId: string | null,
}) => {
    const [justification, setJustification] = useState('');

    if (!isOpen || !requisitionId) return null;

    const handleConfirm = () => {
        onConfirm(requisitionId, justification);
        handleClose();
    };

    const handleClose = () => {
        setJustification('');
        onClose();
    };

    const canConfirm = justification.trim().length > 10;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Justificar Reprovação</h2>
                <p className="text-gray-600 mb-4">Por favor, descreva o motivo da reprovação da requisição <span className="font-semibold">{requisitionId}</span>.</p>

                <div>
                    <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-1">
                        Justificativa (mín. 10 caracteres)
                    </label>
                    <textarea
                        id="justification"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Item fora de especificação, quantidade excessiva, etc."
                    />
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={handleClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Confirmar Reprovação
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Page Components ---

const SizeSelectionModal = ({ 
    isOpen, 
    onClose, 
    epiItem, 
    onSelectVariant 
} : { 
    isOpen: boolean, 
    onClose: () => void, 
    epiItem: EPIItem | null, 
    onSelectVariant: (item: EPIItem, size: string) => void 
}) => {
    if (!isOpen || !epiItem) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Selecione o Tamanho</h2>
                <p className="text-gray-600 mb-4">Escolha um dos tamanhos disponíveis para <span className="font-semibold">{epiItem.name}</span>.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {epiItem.variants.map(variant => (
                        <button
                            key={variant.code}
                            onClick={() => {
                                onSelectVariant(epiItem, variant.size);
                                onClose();
                            }}
                            className="w-full text-left p-3 border rounded-md hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                            <span className="font-semibold">{variant.size}</span>
                            <span className="text-sm text-gray-500 ml-2">(Código: {variant.code})</span>
                        </button>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const NewRequisitionPage = ({ user, onBack, onSubmitRequisition }: { user: User, onBack: () => void, onSubmitRequisition: (items: RequisitionItem[]) => void }) => {
    const [cart, setCart] = useState<RequisitionItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeModalItem, setSizeModalItem] = useState<EPIItem | null>(null);
    const [catalog, setCatalog] = useState<EPIItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Simulate fetching catalog
        setTimeout(() => {
            setCatalog(EPI_CATALOG);
            setLoading(false);
        }, 300);
    }, []);

    const filteredCatalog = useMemo(() => {
        if (!searchTerm) return catalog;
        return catalog.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, catalog]);

    const addToCart = (item: EPIItem, size: string) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(cartItem => cartItem.epiItem.id === item.id && cartItem.size === size);
            if (existingItem) {
                return currentCart.map(cartItem => 
                    cartItem.epiItem.id === item.id && cartItem.size === size 
                    ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                    : cartItem
                );
            }
            return [...currentCart, { epiItem: item, quantity: 1, size }];
        });
    };

    const handleAddItemClick = (item: EPIItem) => {
        if (item.variants.length > 1) {
            setSizeModalItem(item);
        } else {
            addToCart(item, item.variants[0]?.size || 'Único');
        }
    };
    
    const updateQuantity = (itemId: string, size: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(itemId, size);
            return;
        }
        setCart(cart.map(item => 
            item.epiItem.id === itemId && item.size === size ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeFromCart = (itemId: string, size: string) => {
        setCart(cart.filter(item => !(item.epiItem.id === itemId && item.size === size)));
    };

    const handleSubmit = () => {
        if (cart.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }
        onSubmitRequisition(cart);
    };

    const totalItemsInCart = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    return (
        <>
            <SizeSelectionModal
                isOpen={!!sizeModalItem}
                onClose={() => setSizeModalItem(null)}
                epiItem={sizeModalItem}
                onSelectVariant={addToCart}
            />
            <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold mb-4">
                        <Icons.ChevronLeftIcon className="w-5 h-5" />
                        Voltar para o Painel
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Nova Requisição de EPI</h1>
                </div>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
                    {/* Catalog */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border flex flex-col">
                        <div className="relative mb-4">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icons.SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar EPI por nome ou categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                           {loading ? (
                               <div className="text-center py-10 text-gray-500">Carregando catálogo...</div>
                           ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredCatalog.map(item => (
                                    <div key={item.id} className="border rounded-lg p-3 flex flex-col items-center text-center">
                                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain mb-2"/>
                                        <p className="font-semibold text-sm flex-grow">{item.name}</p>
                                        <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                        <button onClick={() => handleAddItemClick(item)} className="w-full mt-auto bg-blue-100 text-blue-800 font-semibold text-sm py-1.5 px-3 rounded-md hover:bg-blue-200">Adicionar</button>
                                    </div>
                                ))}
                            </div>
                           )}
                        </div>
                    </div>
                    {/* Cart */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-3">Carrinho</h2>
                        <div className="flex-grow overflow-y-auto">
                            {cart.length > 0 ? (
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.epiItem.id + item.size} className="flex gap-3">
                                            <img src={item.epiItem.imageUrl} alt={item.epiItem.name} className="w-16 h-16 rounded-md object-cover" />
                                            <div className="flex-grow">
                                                <p className="text-sm font-semibold">{item.epiItem.name}</p>
                                                <p className="text-xs text-gray-500">Tamanho: {item.size}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button onClick={() => updateQuantity(item.epiItem.id, item.size, item.quantity - 1)} className="w-6 h-6 border rounded">-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.epiItem.id, item.size, item.quantity + 1)} className="w-6 h-6 border rounded">+</button>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.epiItem.id, item.size)} className="text-gray-400 hover:text-red-600 self-start">
                                                <Icons.XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <Icons.ArchiveBoxIcon className="w-10 h-10 mx-auto text-gray-300" />
                                    <p className="mt-2 text-sm">Seu carrinho está vazio.</p>
                                </div>
                            )}
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between font-semibold mb-4">
                                <span>Total de Itens</span>
                                <span>{totalItemsInCart}</span>
                            </div>
                            <button 
                                onClick={handleSubmit} 
                                disabled={cart.length === 0}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                                Finalizar Requisição
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


const RequisitionDetailPage = ({ requisition, onBack }: { requisition: Requisition, onBack: () => void }) => {
    return (
        <div className="p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold mb-4">
                    <Icons.ChevronLeftIcon className="w-5 h-5" />
                    Voltar para a lista
                </button>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Requisição {requisition.id}</h1>
                            <p className="text-gray-500">Data da solicitação: {new Date(requisition.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <StatusBadge status={requisition.status} />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Solicitante</h2>
                            <div className="flex items-center gap-3">
                                <img src={requisition.requester.avatar} alt={requisition.requester.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold text-gray-800">{requisition.requester.name}</p>
                                    <p className="text-sm text-gray-500">{requisition.requester.department} - Turno: {requisition.requester.turno}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Itens Solicitados</h2>
                        <div className="space-y-3">
                            {requisition.items.map((item, index) => {
                                const variant = item.epiItem.variants.find(v => v.size === item.size);
                                const code = variant ? variant.code : item.epiItem.code;
                                return (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
                                    <img src={item.epiItem.imageUrl} alt={item.epiItem.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.epiItem.name}</p>
                                        <p className="text-sm text-gray-500">Código: {code}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-medium text-gray-700">Qtd: {item.quantity}</p>
                                        <p className="text-sm text-gray-500">Tamanho: {item.size}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    <div className="mt-8">
                         <h2 className="text-lg font-semibold text-gray-700 mb-4">Histórico da Requisição</h2>
                         <div className="border-l-2 border-blue-200 pl-4 space-y-6">
                             {requisition.history.map((entry, index) => (
                                <div key={index} className="relative">
                                     <div className="absolute -left-[2.3rem] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                                     <p className="font-semibold text-gray-800">{entry.status.split(':')[0]}</p>
                                     {entry.status.includes(':') && <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md mt-1 italic">"{entry.status.split(':')[1].trim()}"</p>}
                                     <p className="text-sm text-gray-500">Por: {entry.user}</p>
                                     <p className="text-xs text-gray-400 mt-1">{entry.date}</p>
                                </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = ({ requisitions, onNavigate }: { requisitions: Requisition[], onNavigate: (page: string, data?: any) => void }) => {
    const pendingCount = useMemo(() => requisitions.filter(r => r.status === RequisitionStatus.PendingSupervisor || r.status === RequisitionStatus.PendingTechnician).length, [requisitions]);
    const approvedThisMonth = useMemo(() => requisitions.filter(r => r.status === RequisitionStatus.Approved).length, [requisitions]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Visão Geral das Requisições</h1>
                 <button 
                    onClick={() => onNavigate('new')}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusCircleIcon className="w-5 h-5" />
                    Nova Requisição
                </button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-500">Pendentes de Aprovação</h3>
                    <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-500">Aprovadas este Mês</h3>
                    <p className="text-3xl font-bold text-gray-800">{approvedThisMonth}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Todas as Requisições</h2>
                </div>
                {/* Desktop View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Solicitante</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requisitions.map((req) => (
                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="text-blue-600 hover:underline">{req.id}</a>
                                    </td>
                                    <td className="px-6 py-4">{req.requester.name} (T: {req.requester.turno})</td>
                                    <td className="px-6 py-4">{new Date(req.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onNavigate('details', req)} className="text-blue-600 hover:text-blue-800">
                                            <Icons.EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {requisitions.map((req) => (
                         <div key={req.id} className="p-4 space-y-2">
                         <div className="flex justify-between items-start">
                             <div>
                                 <p className="text-xs text-gray-500">ID da Requisição</p>
                                 <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-semibold text-blue-600 hover:underline">{req.id}</a>
                             </div>
                             <StatusBadge status={req.status} />
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                 <p className="text-xs text-gray-500">Solicitante</p>
                                 <p className="font-medium text-gray-800">{req.requester.name} (Turno {req.requester.turno})</p>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500">Data</p>
                                 <p className="font-medium text-gray-800">{new Date(req.date).toLocaleDateString('pt-BR')}</p>
                             </div>
                         </div>
                         <div className="pt-2 text-right">
                             <button onClick={() => onNavigate('details', req)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                 Ver Detalhes &rarr;
                             </button>
                         </div>
                     </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CollaboratorDashboard = ({ user, requisitions, onNavigate }: { user: User, requisitions: Requisition[], onNavigate: (page: string, data?: any) => void }) => {
    const stats = useMemo(() => ({
        total: requisitions.length,
        pending: requisitions.filter(r => r.status === RequisitionStatus.PendingSupervisor || r.status === RequisitionStatus.PendingTechnician).length,
        approved: requisitions.filter(r => r.status === RequisitionStatus.Approved || r.status === RequisitionStatus.Reserved).length,
    }), [requisitions]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Minhas Requisições</h1>
                <button onClick={() => onNavigate('new')} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusCircleIcon className="w-5 h-5" />
                    Nova Requisição
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border"><h3 className="text-gray-500">Total</h3><p className="text-3xl font-bold">{stats.total}</p></div>
                <div className="bg-white p-5 rounded-lg shadow-sm border"><h3 className="text-gray-500">Pendentes</h3><p className="text-3xl font-bold">{stats.pending}</p></div>
                <div className="bg-white p-5 rounded-lg shadow-sm border"><h3 className="text-gray-500">Aprovadas</h3><p className="text-3xl font-bold">{stats.approved}</p></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {requisitions.length > 0 ? requisitions.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 hover:underline">
                                       <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }}>{req.id}</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{req.items.length}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => onNavigate('details', req)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <Icons.EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">Nenhuma requisição encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {requisitions.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                        {requisitions.map(req => (
                            <div key={req.id} className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                    <p className="text-xs text-gray-500">ID da Requisição</p>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-semibold text-blue-600 hover:underline">{req.id}</a>
                                    </div>
                                    <StatusBadge status={req.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                    <p className="text-xs text-gray-500">Data</p>
                                    <p className="font-medium text-gray-800">{new Date(req.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div>
                                    <p className="text-xs text-gray-500">Itens</p>
                                    <p className="font-medium text-gray-800">{req.items.length}</p>
                                    </div>
                                </div>
                                <div className="pt-2 text-right">
                                    <button onClick={() => onNavigate('details', req)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                        Ver Detalhes &rarr;
                                    </button>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">Nenhuma requisição encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SupervisorDashboard = ({ user, requisitions, onNavigate, onUpdateStatus }: { 
    user: User, 
    requisitions: Requisition[], 
    onNavigate: (page: string, data?: any) => void,
    onUpdateStatus: (reqId: string, newStatus: RequisitionStatus, historyMessage: string) => void
}) => {
    const [modalRequisition, setModalRequisition] = useState<Requisition | null>(null);
    const [rejectionModalReqId, setRejectionModalReqId] = useState<string | null>(null);

    const handleApprove = (req: Requisition) => {
        setModalRequisition(req);
    };

    const handleConfirmApproval = (reqId: string, signature: string, password: string) => {
        console.log(`Approving ${reqId} with signature and password.`);
        onUpdateStatus(reqId, RequisitionStatus.PendingTechnician, 'Aprovado por Supervisor');
        setModalRequisition(null);
    };

    const handleReject = (reqId: string) => {
        setRejectionModalReqId(reqId);
    };
    
    const handleConfirmRejection = (reqId: string, justification: string) => {
        const historyMessage = `Recusado por Supervisor: ${justification}`;
        onUpdateStatus(reqId, RequisitionStatus.Rejected, historyMessage);
        setRejectionModalReqId(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisições da Equipe</h1>
            
            {requisitions.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* Desktop View */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requisitions.map(req => (
                                    <tr key={req.id} className={`hover:bg-gray-50 ${req.status === RequisitionStatus.PendingSupervisor ? 'bg-yellow-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 hover:underline">
                                           <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }}>{req.id}</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{req.requester.name} (T: {req.requester.turno})</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(req.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {req.status === RequisitionStatus.PendingSupervisor ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleReject(req.id)} className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Recusar</button>
                                                    <button onClick={() => handleApprove(req)} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Aprovar</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => onNavigate('details', req)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                    <Icons.EyeIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {requisitions.map(req => (
                            <div key={req.id} className={`p-4 space-y-3 ${req.status === RequisitionStatus.PendingSupervisor ? 'bg-yellow-50' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-semibold text-blue-600 hover:underline">{req.id}</a>
                                        <p className="text-sm text-gray-600">{req.requester.name} (Turno {req.requester.turno})</p>
                                    </div>
                                    <StatusBadge status={req.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Data</p>
                                        <p className="font-medium text-gray-800">{new Date(req.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    {req.urgency === 'Urgente' && (
                                        <div>
                                            <p className="text-xs text-gray-500">Prioridade</p>
                                            <p className="font-medium text-red-600">{req.urgency}</p>
                                        </div>
                                    )}
                                </div>
                                {req.status === RequisitionStatus.PendingSupervisor ? (
                                    <div className="flex gap-3 justify-end flex-wrap pt-2">
                                        <button onClick={() => onNavigate('details', req)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Detalhes</button>
                                        <button onClick={() => handleReject(req.id)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Recusar</button>
                                        <button onClick={() => handleApprove(req)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Aprovar</button>
                                    </div>
                                ) : (
                                    <div className="pt-2 text-right">
                                        <button onClick={() => onNavigate('details', req)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                            Ver Detalhes &rarr;
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg border">
                    <Icons.ArchiveBoxIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">Nenhuma requisição da sua equipe encontrada.</p>
                </div>
            )}
            <SignatureModal 
                isOpen={!!modalRequisition}
                onClose={() => setModalRequisition(null)}
                onConfirm={handleConfirmApproval}
                requisition={modalRequisition}
                title="Confirmar Aprovação"
                description={<>Para aprovar a requisição <span className="font-semibold">{modalRequisition?.id}</span>, por favor, assine e confirme sua senha.</>}
                confirmButtonText="Confirmar e Assinar"
            />
            <RejectionModal 
                isOpen={!!rejectionModalReqId}
                onClose={() => setRejectionModalReqId(null)}
                onConfirm={handleConfirmRejection}
                requisitionId={rejectionModalReqId}
            />
        </div>
    );
};

const SafetyTechnicianDashboard = ({ user, requisitions, onNavigate, onUpdateStatus }: {
    user: User,
    requisitions: Requisition[],
    onNavigate: (page: string, data?: any) => void,
    onUpdateStatus: (reqId: string, newStatus: RequisitionStatus, historyMessage: string) => void
}) => {
    const [modalRequisition, setModalRequisition] = useState<Requisition | null>(null);
    const [rejectionModalReqId, setRejectionModalReqId] = useState<string | null>(null);
    
    const handleApprove = (reqId: string) => {
        const req = requisitions.find(r => r.id === reqId);
        if(req) setModalRequisition(req);
    };

    const handleConfirmApproval = (reqId: string, signature: string, password: string) => {
        console.log(`Technician approving ${reqId}`);
        onUpdateStatus(reqId, RequisitionStatus.Approved, 'Aprovado por Técnico de Segurança');
        setModalRequisition(null);
    };

    const handleReject = (reqId: string) => {
        setRejectionModalReqId(reqId);
    };

    const handleConfirmRejection = (reqId: string, justification: string) => {
        const historyMessage = `Recusado por Técnico de Segurança: ${justification}`;
        onUpdateStatus(reqId, RequisitionStatus.Rejected, historyMessage);
        setRejectionModalReqId(null);
    };

    const pendingRequisitions = requisitions; // Now receives pre-filtered list

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisições para Análise Técnica</h1>
             {pendingRequisitions.length > 0 ? (
                <div className="space-y-4">
                    {pendingRequisitions.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border">
                           <div className="flex justify-between items-start">
                                <div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-bold text-blue-600 hover:underline">{req.id}</a>
                                     {req.urgency === 'Urgente' && <span className="ml-2 text-xs font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">URGENTE</span>}
                                    <p className="text-sm text-gray-600">{req.requester.name} - {req.requester.department} (Turno {req.requester.turno})</p>
                                    <p className="text-xs text-gray-400">{new Date(req.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <StatusBadge status={req.status} />
                            </div>
                             <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Itens para análise:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {req.items.map(item => {
                                    const variant = item.epiItem.variants.find(v => v.size === item.size);
                                    const code = variant ? variant.code : item.epiItem.code;
                                    return (
                                        <div key={item.epiItem.id + item.size} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                            <img src={item.epiItem.imageUrl} alt={item.epiItem.name} className="w-12 h-12 rounded-md object-cover"/>
                                            <div>
                                              <p className="text-sm font-semibold">{item.epiItem.name}</p>
                                              <p className="text-xs text-gray-500">{code} | Qtd: {item.quantity} | T: {item.size}</p>
                                            </div>
                                        </div>
                                    )
                                  })}
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3 justify-end flex-wrap">
                                <button onClick={() => onNavigate('details', req)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Ver Detalhes</button>
                                <button onClick={() => handleReject(req.id)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Reprovar</button>
                                <button onClick={() => handleApprove(req.id)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Aprovar Tecnicamente</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 bg-white rounded-lg border">
                    <Icons.CheckCircleIcon className="w-12 h-12 mx-auto text-green-500" />
                    <p className="mt-4 text-gray-600">Nenhuma requisição pendente de análise técnica.</p>
                </div>
            )}
            <SignatureModal 
                isOpen={!!modalRequisition}
                onClose={() => setModalRequisition(null)}
                onConfirm={handleConfirmApproval}
                requisition={modalRequisition}
                title="Confirmar Aprovação Técnica"
                description={<>Para aprovar tecnicamente a requisição <span className="font-semibold">{modalRequisition?.id}</span>, por favor, assine e confirme sua senha.</>}
                confirmButtonText="Confirmar e Assinar"
            />
             <RejectionModal 
                isOpen={!!rejectionModalReqId}
                onClose={() => setRejectionModalReqId(null)}
                onConfirm={handleConfirmRejection}
                requisitionId={rejectionModalReqId}
            />
        </div>
    );
};

const ReservistDashboard = ({ user, requisitions, onNavigate, onUpdateStatus }: {
    user: User,
    requisitions: Requisition[],
    onNavigate: (page: string, data?: any) => void,
    onUpdateStatus: (reqId: string, newStatus: RequisitionStatus, historyMessage: string) => void
}) => {
    const handleReserve = (reqId: string) => {
        onUpdateStatus(reqId, RequisitionStatus.Reserved, 'Reservado');
    };

    const toReserveRequisitions = requisitions; // Now receives pre-filtered list

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisições para Reserva</h1>
             {toReserveRequisitions.length > 0 ? (
                <div className="space-y-4">
                    {toReserveRequisitions.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-bold text-blue-600 hover:underline">{req.id}</a>
                                    <p className="text-sm text-gray-600">{req.requester.name} - {req.requester.department} (Turno {req.requester.turno})</p>
                                </div>
                                 <button onClick={() => handleReserve(req.id)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                    Reservar Itens
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg border">
                    <Icons.ArchiveBoxIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">Nenhuma requisição aprovada para reserva no momento.</p>
                </div>
            )}
        </div>
    );
};

const WarehouseDashboard = ({ user, requisitions, onNavigate, onUpdateStatus }: {
    user: User,
    requisitions: Requisition[],
    onNavigate: (page: string, data?: any) => void,
    onUpdateStatus: (reqId: string, newStatus: RequisitionStatus, historyMessage: string) => void
}) => {
    const [modalRequisition, setModalRequisition] = useState<Requisition | null>(null);

    const handleDeliver = (req: Requisition) => {
        setModalRequisition(req);
    };

    const handleConfirmDelivery = (reqId: string, signature: string, password: string) => {
        console.log(`Delivering ${reqId} with signature.`);
        onUpdateStatus(reqId, RequisitionStatus.Delivered, 'Entregue');
        setModalRequisition(null);
    };
    
    const reservedRequisitions = requisitions; // Now receives pre-filtered list

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisições para Entrega</h1>
            {reservedRequisitions.length > 0 ? (
                <div className="space-y-4">
                    {reservedRequisitions.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border">
                           <div className="flex justify-between items-start">
                                <div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }} className="font-bold text-blue-600 hover:underline">{req.id}</a>
                                    <p className="text-sm text-gray-600">{req.requester.name} - {req.requester.department} (Turno {req.requester.turno})</p>
                                </div>
                                <button onClick={() => handleDeliver(req)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                                    Registrar Entrega
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 bg-white rounded-lg border">
                    <Icons.BoxIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">Nenhuma requisição reservada para entrega.</p>
                </div>
            )}
            <SignatureModal
                isOpen={!!modalRequisition}
                onClose={() => setModalRequisition(null)}
                onConfirm={handleConfirmDelivery}
                requisition={modalRequisition}
                title="Confirmar Entrega de EPI"
                description={<>O colaborador <span className="font-semibold">{modalRequisition?.requester.name}</span> deve assinar para confirmar o recebimento dos itens da requisição <span className="font-semibold">{modalRequisition?.id}</span>.</>}
                confirmButtonText="Confirmar Entrega"
            />
        </div>
    );
};

// --- Main Dashboard Component ---

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  logoUrl: string | null;
  onUpdateLogo: (logoUrl: string | null) => void;
}

const NavItem: React.FunctionComponent<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, alert?: boolean }> = ({ icon, label, isActive, onClick, alert }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }`}
    >
        {icon}
        <span className="flex-grow text-left">{label}</span>
        {alert && <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
    </button>
);


export default function Dashboard({ user, onLogout, onUpdateUser, logoUrl, onUpdateLogo }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate loading data. In a real offline app, data might come from localStorage or IndexedDB.
    setRequisitions(MOCK_REQUISITIONS);
    setNotifications(MOCK_NOTIFICATIONS);
    setTimeout(() => setLoading(false), 300);
  }, [user.id]);


  const userRequisitions = useMemo(() => {
    switch (user.role) {
      case Role.Collaborator:
        return requisitions.filter(r => r.requester.id === user.id);
      case Role.Supervisor:
        return [...requisitions].sort((a, b) => {
            const aIsPending = a.status === RequisitionStatus.PendingSupervisor;
            const bIsPending = b.status === RequisitionStatus.PendingSupervisor;
            if (aIsPending && !bIsPending) return -1;
            if (!aIsPending && bIsPending) return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      case Role.SafetyTechnician:
        return requisitions.filter(r => r.status === RequisitionStatus.PendingTechnician);
      case Role.Reservist:
        return requisitions.filter(r => r.status === RequisitionStatus.Approved);
      case Role.Warehouse:
        return requisitions.filter(r => r.status === RequisitionStatus.Reserved);
      default: // Admin
        return requisitions;
    }
  }, [user.role, user.id, requisitions]);
  
  const userNotifications = useMemo(() => {
      return notifications.filter(n => n.targetUserId === user.id || (n.role === user.role && !n.targetUserId))
  }, [notifications, user.id, user.role]);
  
  const hasUnreadNotifications = useMemo(() => userNotifications.some(n => !n.read), [userNotifications]);

  const handleNavigation = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
    setSidebarOpen(false); // Close sidebar on navigation
  };
  
  const handleUpdateRequisitionStatus = (reqId: string, newStatus: RequisitionStatus, historyMessage: string) => {
    setRequisitions(prevReqs => 
      prevReqs.map(req => {
        if (req.id === reqId) {
          const newHistoryEntry = {
            status: historyMessage,
            date: new Date().toLocaleString('pt-BR'),
            user: user.name,
          };
          return {
            ...req,
            status: newStatus,
            history: [newHistoryEntry, ...req.history],
          };
        }
        return req;
      })
    );
    // In a real app, you would create notifications for the relevant users here.
  };
  
  const handleSubmitRequisition = (items: RequisitionItem[]) => {
    const newRequisition: Requisition = {
      id: `REQ-2024-${String(requisitions.length + 1).padStart(3, '0')}`,
      requester: user,
      date: new Date().toISOString(),
      items,
      status: RequisitionStatus.PendingSupervisor,
      urgency: 'Normal', // Or get from form
      history: [{
        status: 'Requisição Feita',
        date: new Date().toLocaleString('pt-BR'),
        user: user.name,
      }],
    };
    setRequisitions(prev => [newRequisition, ...prev]);

    // Create mock notification for supervisors
    const supervisorNotifications = USERS
        .filter(u => u.role === Role.Supervisor)
        .map(sup => ({
            id: notifications.length + Math.random(),
            text: `Nova requisição #${newRequisition.id} de ${user.name} precisa de sua aprovação.`,
            date: new Date().toISOString(),
            read: false,
            targetUserId: sup.id,
            requisitionId: newRequisition.id,
        }));
    setNotifications(prev => [...prev, ...supervisorNotifications]);
    
    handleNavigation('dashboard');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        userNotifications.some(un => un.id === n.id) ? { ...n, read: true } : n
      )
    );
  };
  
  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const renderContent = () => {
    if (loading) {
        return <div className="p-6">Carregando dados...</div>;
    }
    if (pageData && currentPage === 'details') {
      return <RequisitionDetailPage requisition={pageData} onBack={() => handleNavigation('dashboard')} />;
    }
    
    switch (currentPage) {
        case 'dashboard':
            switch (user.role) {
                case Role.Collaborator:
                  return <CollaboratorDashboard user={user} requisitions={userRequisitions} onNavigate={handleNavigation} />;
                case Role.Supervisor:
                  return <SupervisorDashboard user={user} requisitions={userRequisitions} onNavigate={handleNavigation} onUpdateStatus={handleUpdateRequisitionStatus} />;
                case Role.SafetyTechnician:
                   return <SafetyTechnicianDashboard user={user} requisitions={userRequisitions} onNavigate={handleNavigation} onUpdateStatus={handleUpdateRequisitionStatus} />;
                case Role.Reservist:
                    return <ReservistDashboard user={user} requisitions={userRequisitions} onNavigate={handleNavigation} onUpdateStatus={handleUpdateRequisitionStatus} />;
                case Role.Warehouse:
                    return <WarehouseDashboard user={user} requisitions={userRequisitions} onNavigate={handleNavigation} onUpdateStatus={handleUpdateRequisitionStatus} />;
                case Role.Admin:
                default:
                  return <AdminDashboard requisitions={requisitions} onNavigate={handleNavigation} />;
            }
        case 'new':
            return <NewRequisitionPage user={user} onBack={() => handleNavigation('dashboard')} onSubmitRequisition={handleSubmitRequisition} />;
        case 'history':
            return <HistoryPage user={user} onNavigate={handleNavigation} />;
        case 'reports':
            return <ReportsPage allRequisitions={requisitions} />;
        case 'users':
            return <UserManagementPage />;
        case 'epi-management':
            return <EpiManagementPage />;
        case 'profile':
            return <ProfilePage user={user} onUpdateUser={onUpdateUser} />;
        case 'settings':
            return <SettingsPage currentLogoUrl={logoUrl} onUpdateLogo={onUpdateLogo} />;
        default:
            return <div>Página não encontrada</div>;
    }
  };
  
  const sidebarNavItems = () => {
    const items = [
        { id: 'dashboard', label: 'Painel', icon: <Icons.DashboardIcon className="w-5 h-5" />, roles: Object.values(Role) },
        { id: 'history', label: 'Histórico', icon: <Icons.HistoryIcon className="w-5 h-5" />, roles: [Role.Admin, Role.Collaborator, Role.Supervisor] },
        { id: 'reports', label: 'Relatórios', icon: <Icons.ReportsIcon className="w-5 h-5" />, roles: [Role.Admin] },
        { id: 'users', label: 'Usuários', icon: <Icons.UsersIcon className="w-5 h-5" />, roles: [Role.Admin] },
        { id: 'epi-management', label: 'Catálogo de EPIs', icon: <Icons.ArchiveBoxIcon className="w-5 h-5" />, roles: [Role.Admin] },
        { id: 'settings', label: 'Configurações', icon: <Icons.SettingsIcon className="w-5 h-5" />, roles: [Role.Admin] },
    ];
    return items.filter(item => item.roles.includes(user.role));
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
        <div className="p-4 border-b flex items-center gap-3">
            {logoUrl ? (
                <img src={logoUrl} alt="Logo da Empresa" className="h-8 w-auto" />
            ) : (
                <Icons.ShieldIcon className="h-8 w-8 text-blue-600" />
            )}
            <span className="font-bold text-lg text-gray-800">Sistema EPI</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            {sidebarNavItems().map(item => (
                <NavItem 
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPage === item.id}
                    onClick={() => handleNavigation(item.id)}
                />
            ))}
        </nav>
        <div className="p-4 border-t space-y-2">
             <NavItem 
                icon={<Icons.HelpIcon className="w-5 h-5" />}
                label="Ajuda & Suporte"
                isActive={false}
                onClick={() => alert("Página de ajuda não implementada.")}
            />
            <NavItem 
                icon={<Icons.LogoutIcon className="w-5 h-5" />}
                label="Sair"
                isActive={false}
                onClick={onLogout}
            />
        </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block flex-shrink-0">
        {sidebarContent}
      </aside>
      
       {/* Mobile Sidebar */}
       <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50">
                {sidebarContent}
            </aside>
        </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-4 p-1 text-gray-600">
                <Icons.Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{user.role}</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell notifications={userNotifications} onMarkAllAsRead={markAllNotificationsAsRead} onNavigate={handleNavigation} onDeleteNotification={handleDeleteNotification} />
            <div className="relative">
                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.department} - Turno: {user.turno}</p>
                    </div>
                    <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>
                 {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20" onMouseLeave={() => setProfileMenuOpen(false)}>
                        <div className="py-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('profile'); setProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meu Perfil</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</a>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}