import React, { useState, useMemo } from 'react';
import { Requisition, RequisitionStatus, User, Role } from '../types';
import { MOCK_REQUISITIONS } from '../constants';
import * as Icons from './Icons';

interface HistoryPageProps {
  user: User;
  onNavigate: (page: string, data?: any) => void;
}

const ITEMS_PER_PAGE = 10;

const StatusBadge: React.FC<{ status: RequisitionStatus }> = ({ status }) => {
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


export default function HistoryPage({ user, onNavigate }: HistoryPageProps) {
    const [requisitions] = useState<Requisition[]>(() => {
        let baseRequisitions = MOCK_REQUISITIONS;

        // Collaborators only see their own history
        if (user.role === Role.Collaborator) {
            baseRequisitions = baseRequisitions.filter(req => req.requester.id === user.id);
        }
        
        // History page only shows completed requisitions
        return baseRequisitions.filter(req => 
            req.status === RequisitionStatus.Delivered || 
            req.status === RequisitionStatus.Rejected
        );
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });
    const [sortConfig, setSortConfig] = useState<{ key: keyof Requisition | 'requester'; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ status: '', startDate: '', endDate: '' });
        setCurrentPage(1);
    };

    const filteredAndSortedRequisitions = useMemo(() => {
        let filtered = [...requisitions];

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(req => 
                req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.items.some(item => item.epiItem.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply filters
        if (filters.status) {
            filtered = filtered.filter(req => req.status === filters.status);
        }
        if (filters.startDate) {
            filtered = filtered.filter(req => new Date(req.date) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filtered = filtered.filter(req => new Date(req.date) <= new Date(filters.endDate));
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'requester') {
                aValue = a.requester.name;
                bValue = b.requester.name;
            } else {
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
            }
            
            if (sortConfig.key === 'date') {
                 aValue = new Date(a.date).getTime();
                 bValue = new Date(b.date).getTime();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [requisitions, searchTerm, filters, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedRequisitions.length / ITEMS_PER_PAGE);

    const paginatedRequisitions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedRequisitions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedRequisitions, currentPage]);

    const requestSort = (key: keyof Requisition | 'requester') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof Requisition | 'requester' }) => (
        <th scope="col" className="px-6 py-3 cursor-pointer select-none" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-2">
                {label}
                <span className="text-gray-400">
                {sortConfig.key === sortKey ? (
                    sortConfig.direction === 'ascending' ? '▲' : '▼'
                ) : <Icons.ArrowsUpDownIcon className="w-4 h-4" />}
                </span>
            </div>
        </th>
    );


    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Histórico de Requisições Concluídas</h1>
                <p className="text-gray-500 mt-1">Visualize o histórico de todas as requisições que foram entregues ou recusadas.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 lg:col-span-4">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar</label>
                         <div className="relative mt-1">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icons.SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="search"
                                placeholder="ID, solicitante ou item..."
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" value={filters.status} onChange={(e) => {handleFilterChange(e); setCurrentPage(1);}} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">Todos</option>
                            {[RequisitionStatus.Delivered, RequisitionStatus.Rejected].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Inicial</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={(e) => {handleFilterChange(e); setCurrentPage(1);}} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Final</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={(e) => {handleFilterChange(e); setCurrentPage(1);}} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                    <div className="flex items-center">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            <Icons.ArrowPathIcon className="w-4 h-4" />
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Desktop View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                             <tr>
                                <SortableHeader label="ID da Requisição" sortKey="id" />
                                <SortableHeader label="Solicitante" sortKey="requester" />
                                <SortableHeader label="Data" sortKey="date" />
                                <SortableHeader label="Status" sortKey="status" />
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedRequisitions.length > 0 ? paginatedRequisitions.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-blue-600 hover:underline whitespace-nowrap">
                                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('details', req); }}>{req.id}</a>
                                    </td>
                                    <td className="px-6 py-4">{req.requester.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(req.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onNavigate('details', req)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full">
                                            <Icons.EyeIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        <p className="font-semibold">Nenhum resultado encontrado.</p>
                                        <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                     {paginatedRequisitions.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {paginatedRequisitions.map(req => (
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
                                            <p className="font-medium text-gray-800">{req.requester.name}</p>
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
                     ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p className="font-semibold">Nenhum resultado encontrado.</p>
                            <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                        </div>
                     )}
                </div>


                {totalPages > 1 && (
                    <div className="p-4 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex gap-2">
                             <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Anterior
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}