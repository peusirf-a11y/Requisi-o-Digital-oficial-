import React, { useState } from 'react';
import { User } from '../types';
import * as Icons from './Icons';

interface ProfilePageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

export default function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        department: user.department,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdateUser({ ...user, ...formData });
        setIsEditing(false);
        // Here you would typically show a success toast message
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            department: user.department,
        });
        setIsEditing(false);
    };

    const InfoRow = ({ label, value, name, isEditing }: { label: string, value: string, name?: keyof typeof formData, isEditing?: boolean }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
            {isEditing && name ? (
                <input
                    type="text"
                    name={name}
                    id={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 px-2 py-1 border rounded-md"
                />
            ) : (
                <dd className="mt-1 text-sm leading-6 text-gray-800 font-medium sm:col-span-2 sm:mt-0">{value}</dd>
            )}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Profile Information Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 sm:px-0 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-semibold leading-7 text-gray-900">Informações Pessoais</h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Detalhes pessoais e de contato.</p>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                                <Icons.PencilSquareIcon className="w-4 h-4" />
                                Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleCancel} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">Cancelar</button>
                                <button onClick={handleSave} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 text-sm">Salvar</button>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 border-t border-gray-100">
                        <dl className="divide-y divide-gray-100">
                            <InfoRow label="Nome Completo" value={formData.name} name="name" isEditing={isEditing} />
                            <InfoRow label="Email" value={formData.email} name="email" isEditing={isEditing} />
                            <InfoRow label="Telefone" value={formData.phone} name="phone" isEditing={isEditing} />
                            <InfoRow label="Departamento" value={formData.department} name="department" isEditing={isEditing} />
                            <InfoRow label="Função" value={user.role} />
                            <InfoRow label="Turno" value={user.turno} />
                        </dl>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-xl font-semibold leading-7 text-gray-900">Alterar Senha</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Altere sua senha de acesso ao sistema.</p>
                    </div>
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="current-password"className="block text-sm font-medium text-gray-700">Senha Atual</label>
                                <input type="password" id="current-password" placeholder="Sua senha atual" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label htmlFor="new-password"className="block text-sm font-medium text-gray-700">Nova Senha</label>
                                <input type="password" id="new-password" placeholder="Mínimo 8 caracteres" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                                <input type="password" id="confirm-password" placeholder="Repita a nova senha" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="pt-2 text-right">
                                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
                                    Alterar Senha
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
