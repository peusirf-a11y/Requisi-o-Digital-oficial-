import React, { useState, useMemo, useEffect } from 'react';
import { User, Role, Turno } from '../types';
import { DEPARTMENTS, USERS } from '../constants';
import * as Icons from './Icons';

// User Modal Component
const UserModal = ({ isOpen, onClose, onSave, userToEdit }: { isOpen: boolean, onClose: () => void, onSave: (user: Partial<User>) => void, userToEdit: User | null }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState(Role.Collaborator);
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [turno, setTurno] = useState(Turno.A);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name);
                setRole(userToEdit.role);
                setDepartment(userToEdit.department);
                setTurno(userToEdit.turno);
            } else {
                setName('');
                setRole(Role.Collaborator);
                setDepartment(DEPARTMENTS[0]);
                setTurno(Turno.A);
            }
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser: Partial<User> = {
            id: userToEdit?.id,
            name,
            role,
            department,
            turno,
        };
        onSave(updatedUser);
        onClose();
    };
    
    const canSave = name.trim() !== '' && department.trim() !== '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div className="mb-4">
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                        <select id="department" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                            {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="turno" className="block text-sm font-medium text-gray-700">Turno</label>
                        <select id="turno" value={turno} onChange={e => setTurno(e.target.value as Turno)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                            {Object.values(Turno).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={!canSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, userName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, userName: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
                 <p className="text-gray-600 mb-4">Tem certeza que deseja excluir o usuário <span className="font-semibold">{userName}</span>? Esta ação não pode ser desfeita.</p>
                 <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Confirmar Exclusão</button>
                 </div>
            </div>
        </div>
    );
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        setLoading(true);
        // Simulate fetch from constants
        setTimeout(() => {
            setUsers(USERS);
            setLoading(false);
        }, 300);
    }, []);
    
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.turno.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleOpenModal = (user: User | null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = (user: Partial<User>) => {
        if (!user.id) {
            alert("A adição de novos usuários está desabilitada no modo de demonstração.");
            return;
        }
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === user.id ? { ...u, ...user } : u)
        );
    };
    
    const handleOpenDeleteConfirm = (user: User) => {
        setUserToDelete(user);
    };

    const handleCloseDeleteConfirm = () => {
        setUserToDelete(null);
    };
    
    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
        handleCloseDeleteConfirm();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusCircleIcon className="w-5 h-5" />
                    Adicionar Usuário
                </button>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icons.SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome, departamento ou turno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuário</th>
                                <th scope="col" className="px-6 py-3">Função</th>
                                <th scope="col" className="px-6 py-3">Departamento</th>
                                <th scope="col" className="px-6 py-3">Turno</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10">Carregando usuários...</td></tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full"/>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className="px-6 py-4">{user.department}</td>
                                    <td className="px-6 py-4">{user.turno}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleOpenModal(user)} className="text-gray-500 hover:text-blue-600" aria-label={`Edit user ${user.name}`}>
                                                <Icons.PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleOpenDeleteConfirm(user)} className="text-gray-500 hover:text-red-600" aria-label={`Delete user ${user.name}`}>
                                                <Icons.TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200">
                     {loading ? (
                        <div className="text-center py-10">Carregando usuários...</div>
                     ) : filteredUsers.map((user) => (
                        <div key={user.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full"/>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(user)} className="text-gray-500 hover:text-blue-600 p-2" aria-label={`Edit user ${user.name}`}>
                                        <Icons.PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleOpenDeleteConfirm(user)} className="text-gray-500 hover:text-red-600 p-2" aria-label={`Delete user ${user.name}`}>
                                        <Icons.TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                             <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Departamento</p>
                                    <p className="font-medium text-gray-800">{user.department}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Turno</p>
                                    <p className="font-medium text-gray-800">{user.turno}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <UserModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveUser} 
                userToEdit={userToEdit} 
            />
            
            <DeleteConfirmModal 
                isOpen={!!userToDelete}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDeleteUser}
                userName={userToDelete?.name || ''}
            />
        </div>
    );
}