import React, { useState, useMemo } from 'react';
import { Requisition, RequisitionStatus } from '../types';
import * as Icons from './Icons';

interface ReportsPageProps {
  allRequisitions: Requisition[];
}

const getPastDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactElement }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// FIX: Made the `children` prop optional to resolve the TypeScript error.
const ChartContainer = ({ title, children, extraControls }: { title: string, children?: React.ReactNode, extraControls?: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            {extraControls}
        </div>
        {children}
    </div>
);

// Custom Chart Components (using divs and SVG for simplicity, no external libraries)

const BarChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="h-64 flex items-end justify-around gap-2 p-4 border-t">
            {data.map(item => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }}
                        title={`${item.label}: ${item.value}`}
                    ></div>
                    <span className="text-xs text-gray-500 text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const PieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="h-64 flex items-center justify-center text-gray-500">Sem dados para exibir</div>;

    let cumulativePercentage = 0;
    const gradients = data.map(item => {
        const percentage = (item.value / total) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${item.color} ${start}% ${end}%`;
    });

    return (
        <div className="h-64 flex flex-col md:flex-row items-center justify-center gap-8 p-4 border-t">
            <div 
                className="w-40 h-40 rounded-full" 
                style={{ background: `conic-gradient(${gradients.join(', ')})` }}
                role="img"
                aria-label="Gráfico de pizza de EPIs mais solicitados"
            ></div>
            <ul className="text-sm space-y-2">
                {data.map(item => (
                    <li key={item.label} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.label} ({(item.value / total * 100).toFixed(1)}%)</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function ReportsPage({ allRequisitions }: ReportsPageProps) {
    const [filters, setFilters] = useState({
        startDate: getPastDate(30),
        endDate: new Date().toISOString().split('T')[0],
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const reportData = useMemo(() => {
        if (!filters.startDate || !filters.endDate) return { requisitions: [], kpis: {}, charts: {} };

        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the whole end day

        const filteredRequisitions = allRequisitions.filter(req => {
            const reqDate = new Date(req.date);
            return reqDate >= startDate && reqDate <= endDate;
        });

        // KPI Calculations
        const totalRequisitions = filteredRequisitions.length;
        const deliveredCount = filteredRequisitions.filter(r => r.status === RequisitionStatus.Delivered).length;
        const pendingCount = filteredRequisitions.filter(r => [RequisitionStatus.PendingSupervisor, RequisitionStatus.PendingTechnician].includes(r.status)).length;
        
        const epiCounts = filteredRequisitions
            .flatMap(r => r.items)
            .reduce((acc, item) => {
                acc[item.epiItem.name] = (acc[item.epiItem.name] || 0) + item.quantity;
                return acc;
            }, {} as Record<string, number>);
        
        const mostRequestedEpi = Object.entries(epiCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

        // Chart Data
        const statusColors: Record<string, string> = {
            [RequisitionStatus.Approved]: '#22c55e',
            [RequisitionStatus.Delivered]: '#3b82f6',
            [RequisitionStatus.Rejected]: '#ef4444',
            [RequisitionStatus.PendingSupervisor]: '#f59e0b',
            [RequisitionStatus.PendingTechnician]: '#f97316',
            [RequisitionStatus.Reserved]: '#6366f1',
        };

        const statusCounts = filteredRequisitions.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<RequisitionStatus, number>);
        
        const statusChartData = Object.entries(statusCounts)
            .map(([label, value]) => ({ label, value, color: statusColors[label] || '#6b7280' }))
            .sort((a,b) => b.value - a.value);

        const pieChartData = Object.entries(epiCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], index) => ({
                label,
                value,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]
            }));

        return {
            requisitions: filteredRequisitions,
            kpis: {
                total: totalRequisitions,
                delivered: deliveredCount,
                pending: pendingCount,
                mostRequested: `${mostRequestedEpi[0]} (${mostRequestedEpi[1]} un)`
            },
            charts: {
                byStatus: statusChartData,
                topEpis: pieChartData
            }
        };

    }, [allRequisitions, filters]);
    
    const exportCSV = () => {
        alert("Funcionalidade de exportação para CSV será implementada.");
    }

    const exportPDF = () => {
         alert("Funcionalidade de exportação para PDF será implementada.");
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Icons.DocumentArrowDownIcon className="w-5 h-5" />
                        <span>CSV</span>
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Icons.DocumentArrowDownIcon className="w-5 h-5" />
                        <span>PDF</span>
                    </button>
                 </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Inicial</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Final</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                </div>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KpiCard title="Total de Requisições" value={reportData.kpis.total ?? 0} icon={<Icons.ArchiveBoxIcon className="w-6 h-6"/>} />
                <KpiCard title="EPIs Entregues" value={reportData.kpis.delivered ?? 0} icon={<Icons.CheckCircleIcon className="w-6 h-6"/>} />
                <KpiCard title="Pendentes" value={reportData.kpis.pending ?? 0} icon={<Icons.HistoryIcon className="w-6 h-6"/>} />
                <KpiCard title="Item Mais Solicitado" value={reportData.kpis.mostRequested ?? 'N/A'} icon={<Icons.ShieldIcon className="w-6 h-6"/>} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartContainer title="Requisições por Status">
                    <BarChart data={reportData.charts.byStatus || []} />
                </ChartContainer>
                <ChartContainer title="Top 5 EPIs Mais Solicitados">
                    <PieChart data={reportData.charts.topEpis || []} />
                </ChartContainer>
            </div>

            {/* Data Table */}
             <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Detalhes das Requisições</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Solicitante</th>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Itens</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.requisitions.length > 0 ? reportData.requisitions.map((req) => (
                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-blue-600">{req.id}</td>
                                    <td className="px-6 py-4">{req.requester.name}</td>
                                    <td className="px-6 py-4">{new Date(req.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{req.status}</td>
                                    <td className="px-6 py-4">{req.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">Nenhuma requisição encontrada para o período selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}