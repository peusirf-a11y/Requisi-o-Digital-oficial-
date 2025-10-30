import React, { useState } from 'react';
import { USERS } from '../constants';
import { User } from '../types';
import { ShieldIcon } from './Icons';

interface LoginPageProps {
  logoUrl: string | null;
  onLogin: (user: User) => void;
}

export default function LoginPage({ logoUrl, onLogin }: LoginPageProps) {
  const [selectedUserId, setSelectedUserId] = useState(USERS[0].id);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selectedUser = USERS.find(u => u.id === selectedUserId);
    if (selectedUser) {
      // Simulate a network delay
      setTimeout(() => {
        onLogin(selectedUser);
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden grid md:grid-cols-2">
        <div className="p-8 md:p-12 bg-gray-100 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-4 mb-4">
            {logoUrl ? (
                <img src={logoUrl} alt="Logo da Empresa" className="h-12 w-auto" />
            ) : (
                <ShieldIcon className="h-12 w-12 text-blue-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Requisição Digital de EPI</h1>
          </div>
          <p className="text-gray-600 text-lg">Sua segurança, nossa prioridade. <br/> <span className="text-sm font-semibold text-orange-600">(Modo Offline / Demonstração)</span></p>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Acesse o Sistema</h2>
          <p className="text-gray-500 mb-8">Selecione um perfil para simular o acesso.</p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Selecione o Usuário</label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-gray-400">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2024 Empresa XYZ. Todos os direitos reservados.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:underline">Termos de Serviço</a>
              <span>·</span>
              <a href="#" className="hover:underline">Suporte</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}